#!/usr/bin/env node
import 'dotenv/config'

import path from 'node:path'

import chalk from 'chalk'
import { gracefulExit } from 'exit-hook'
import pMap from 'p-map'
import restoreCursor from 'restore-cursor'

import type * as types from '../src/types.js'
import { createLinterCache } from '../src/cache.js'
import { createChatModel } from '../src/create-chat-model.js'
import { lintFile } from '../src/lint-file.js'
import { createLintResult, mergeLintResults } from '../src/lint-result.js'
import { resolveLinterCLIConfig } from '../src/resolve-cli-config.js'
import { readSourceFiles, resolveEvalFiles } from '../src/resolve-files.js'
import { resolveRules } from '../src/resolve-rules.js'
import {
  createEvalStats,
  logEvalStats,
  logLintResultStats,
  mergeEvalStats,
  resolveGlobFilePatterns,
  validateLinterInputs
} from '../src/utils.js'

/**
 * Internal CLI to run the linter against synthetic, labeled code snippets in
 * order to estimate each rule's performance in terms of accuracy, precision,
 * and recall.
 */
async function main() {
  restoreCursor()
  const cwd = process.cwd()

  const { args, linterConfig: config } = await resolveLinterCLIConfig(
    process.argv,
    {
      name: 'run-evals',
      cwd,
      linterConfigDefaults: {
        llmOptions: {
          // Use GPT-4 as the default for evals
          model: 'gpt-4o'
        }
      },
      flagsToAdd: {
        onlyPositive: {
          type: Boolean,
          description: 'Only process positive examples',
          default: false
        },
        onlyNegative: {
          type: Boolean,
          description: 'Only process negative examples',
          default: false
        }
      }
    }
  )

  const onlyPositive = !!(args.flags as any).onlyPositive
  const onlyNegative = !!(args.flags as any).onlyNegative

  if (onlyPositive && onlyNegative) {
    console.error(
      chalk.bold('Cannot specify both --only-positive and --only-negative')
    )
    args.showHelp()
    return gracefulExit(1)
  }

  let filesMap: Map<string, types.SourceFile> | undefined
  let rules: types.Rule[]

  try {
    const hasFileDirGlob = args._.fileDirGlob.slice(2).length
    let files: types.SourceFile[]
    ;[files, rules] = await Promise.all([
      hasFileDirGlob ? resolveEvalFiles({ cwd, config }) : Promise.resolve([]),
      resolveRules({ cwd, config })
    ])

    if (hasFileDirGlob) {
      filesMap = new Map()
      for (const file of files) {
        filesMap.set(file.fileRelativePath, file)
      }
    }
  } catch (err: any) {
    console.error(chalk.bold('Error:'), err.message, '\n')
    console.error(err.stack)
    args.showHelp()
    return gracefulExit(1)
  }

  // TODO: support non-file rules
  rules = rules.filter(
    (rule) => rule.scope === 'file' && rule.description?.trim()
  )

  if (!validateLinterInputs({ rules, config })) {
    return
  }

  const chatModel = createChatModel(config)
  const cache = await createLinterCache(config)

  const evalsDir = path.join('fixtures', 'evals')
  const ruleToEvalStats: Record<string, types.EvalStats> = {}
  let globalLintResult = createLintResult()
  let globalEvalStats = createEvalStats()

  await pMap(
    rules,
    async function generateEvalsForRule(rule) {
      const ruleExamplesDir = path.join(evalsDir, rule.name)
      const ruleEvalStats = createEvalStats()
      let ruleLintResult = createLintResult()

      if (!onlyNegative) {
        // Positive examples
        const fileExamplesGlob = path.join(ruleExamplesDir, 'correct', '*')
        const exampleFiles = (
          await resolveGlobFilePatterns(fileExamplesGlob, {
            gitignore: true,
            cwd
          })
        ).filter((filePath) => !filesMap || filesMap.has(filePath))
        const files = await readSourceFiles(exampleFiles, { cwd })

        await pMap(
          files,
          async function lint(file) {
            try {
              const fileLintResult = await lintFile({
                file,
                rule,
                chatModel,
                cache,
                config,
                cwd,
                enableGrit: true
              })

              ++ruleEvalStats.numFiles
              if (fileLintResult.lintErrors.length > 0) {
                ruleEvalStats.numFalsePositives++

                console.warn(
                  `${chalk.bold('False positive')}: rule ${chalk.bold(rule.name)}: ${file.fileRelativePath}`,
                  fileLintResult.lintErrors
                )
              } else {
                ruleEvalStats.numTrueNegatives++

                console.log(
                  `True negative: rule ${rule.name}: ${file.fileRelativePath}`
                )
              }

              ruleLintResult = mergeLintResults(ruleLintResult, fileLintResult)
            } catch (err: any) {
              ruleEvalStats.numUnexpectedErrors++
              console.warn(
                `${chalk.bold('Unexpected error')}: rule ${rule.name}: ${file.fileRelativePath}`,
                err
              )
            }
          },
          {
            concurrency: 8
          }
        )
      }

      if (!onlyPositive) {
        // Negative examples
        const fileExamplesGlob = path.join(ruleExamplesDir, 'incorrect', '*')
        const exampleFiles = (
          await resolveGlobFilePatterns(fileExamplesGlob, {
            gitignore: true,
            cwd
          })
        ).filter((filePath) => !filesMap || filesMap.has(filePath))
        const files = await readSourceFiles(exampleFiles, { cwd })

        await pMap(
          files,
          async function lint(file) {
            try {
              const fileLintResult = await lintFile({
                file,
                rule,
                chatModel,
                cache,
                config,
                cwd,
                enableGrit: true
              })

              ++ruleEvalStats.numFiles
              if (fileLintResult.lintErrors.length > 0) {
                ruleEvalStats.numTruePositives++

                console.log(
                  `True positive: rule ${rule.name}: ${file.fileRelativePath}`
                )
              } else {
                ruleEvalStats.numFalseNegatives++

                console.warn(
                  `${chalk.bold('False negative')}: rule ${chalk.bold(rule.name)}: ${file.fileRelativePath}`,
                  fileLintResult.message
                )
              }

              ruleLintResult = mergeLintResults(ruleLintResult, fileLintResult)
            } catch (err: any) {
              ruleEvalStats.numUnexpectedErrors++
              console.warn(
                `${chalk.bold('Unexpected error')}: rule ${rule.name}: ${file.fileRelativePath}`,
                err
              )
            }
          },
          {
            concurrency: 8
          }
        )
      }

      ++ruleEvalStats.numRules
      ruleToEvalStats[rule.name] = ruleEvalStats

      globalLintResult = mergeLintResults(globalLintResult, ruleLintResult)
      globalEvalStats = mergeEvalStats(globalEvalStats, ruleEvalStats)
    },
    {
      concurrency: 4
    }
  )

  if (config.linterOptions.debugStats) {
    logLintResultStats({ lintResult: globalLintResult, config, prefix: '\n' })
  }

  logEvalStats({ evalStats: globalEvalStats })
}

try {
  await main()
} catch (err) {
  console.error('Unexpected error', err)
  gracefulExit(1)
}
