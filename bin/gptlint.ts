#!/usr/bin/env node
import 'dotenv/config'

import chalk from 'chalk'
import { gracefulExit } from 'exit-hook'
import plur from 'plur'
import restoreCursor from 'restore-cursor'

import type * as types from '../src/types.js'
import { createLinterCache } from '../src/cache.js'
import { createChatModel } from '../src/create-chat-model.js'
import { lintFiles } from '../src/lint-files.js'
import { resolveLinterCLIConfig } from '../src/resolve-cli-config.js'
import { resolveFiles } from '../src/resolve-files.js'
import { resolveRules } from '../src/resolve-rules.js'
import { logLintResultStats, validateLinterInputs } from '../src/utils.js'

/**
 * Main CLI entrypoint.
 */
async function main() {
  restoreCursor()
  const cwd = process.cwd()

  const { args, linterConfig: config } = await resolveLinterCLIConfig(
    process.argv,
    {
      name: 'gptlint',
      cwd
    }
  )

  let files: types.SourceFile[]
  let rules: types.Rule[]

  try {
    ;[files, rules] = await Promise.all([
      resolveFiles({ cwd, config }),
      resolveRules({ cwd, config })
    ])
  } catch (err: any) {
    console.error(
      'Unexpected error initializing linter via config',
      err,
      '\n\n'
    )
    args.showHelp()
    return gracefulExit(1)
  }

  if (!validateLinterInputs({ files, rules, config })) {
    return
  }

  const chatModel = createChatModel(config)

  const cache = await createLinterCache(config)

  const lintResult = await lintFiles({
    files,
    rules,
    config,
    cache,
    chatModel,
    cwd
  })

  if (config.linterOptions.debugStats) {
    logLintResultStats({ lintResult, config })
  }

  if (config.linterOptions.dryRun) {
    return gracefulExit(0)
  }

  if (lintResult.lintErrors.length > 0) {
    console.log(
      `\n${chalk.bold('lint errors:')}`,
      JSON.stringify(lintResult.lintErrors, undefined, 2)
    )

    console.log(
      `\n${chalk.bold(
        `found ${lintResult.lintErrors.length} lint ${plur(
          'error',
          lintResult.lintErrors.length
        )}`
      )}`
    )

    return gracefulExit(1)
  } else {
    console.log(`\n${chalk.bold('no lint errors')} 🎉`)
    return gracefulExit(0)
  }
}

try {
  await main()
} catch (err) {
  console.error('Unexpected error', err)
  gracefulExit(1)
}
