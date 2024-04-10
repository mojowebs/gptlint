<p align="center">
  <img alt="How it works" src="https://raw.githubusercontent.com/gptlint/gptlint/main/media/gptlint-logo.png" width="256">
</p>

<p align="center">
  <em>Use LLMs to enforce best practices across your codebase.</em>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/gptlint"><img alt="NPM" src="https://img.shields.io/npm/v/gptlint.svg" /></a> <a href="https://github.com/gptlint/gptlint/actions/workflows/test.yml"><img alt="Build Status" src="https://github.com/gptlint/gptlint/actions/workflows/main.yml/badge.svg" /></a> <a href="https://github.com/gptlint/gptlint/blob/main/license"><img alt="MIT License" src="https://img.shields.io/badge/license-MIT-blue" /></a> <a href="https://prettier.io"><img alt="Prettier Code Formatting" src="https://img.shields.io/badge/code_style-prettier-brightgreen.svg" /></a> <a href="https://twitter.com/transitive_bs"><img alt="Discuss on Twitter" src="https://img.shields.io/badge/twitter-discussion-blue" /></a>
</p>

# GPTLint

> A fundamentally new approach to code quality. Use LLMs to enforce higher-level best practices across your codebase in a way that takes traditional static analysis tools like `eslint` to the next level.

## Features

- ✅️ _enforce higher-level best practices that are impossible with ast-based approaches_
- ✅️ simple markdown format for rules ([example](https://github.com/gptlint/gptlint/tree/main/rules/prefer-array-at-negative-indexing.md), [spec](./guide/rule-spec.md))
- ✅️ easy to [disable](./faq.md#how-can-i-disable-a-rule) or [customize](#how-can-i-customize-a-built-in-rule-) rules
- ✅️ add custom, [project-specific rules](./guide/rule-guidelines.md#project-specific-rules)
- ✅️ same cli and config format as `eslint`
- ✅️ supports `gptlint.config.js` and inline overrides `/* gptlint-disable */`
- ✅️ content-based caching
- ✅️ outputs LLM stats per run (cost, tokens, etc)
- ✅️ built-in rules are extensively tested w/ [evals](./guide/how-it-works.md#evals)
- ✅️ supports all major [LLM providers](./guide/llm-providers.md) and [local models](./guide/llm-providers.md#local-models)
- ✅️ augments `eslint` instead of trying to replace it (_we love eslint!_)
- ✅️ includes [guidelines](./guide/rule-guidelines.md) for creating your own rules
- ❌ MVP rules are [JS/TS only](./limitations.md#rules-in-the-mvp-are-jsts-only) _for now_
- ❌ MVP rules are [single-file context only](./limitations.md#rules-in-the-mvp-are-single-file-only) _for now_
- ❌ MVP does not support [autofixing](./limitations.md#the-mvp-does-not-support-autofixing-lint-errors) _for now_

## Demo

Here's a demo of `gptlint` running on its own codebase:

<p align="center">
  <img width="640" src="https://github.com/gptlint/gptlint/tree/main/docs/public/demo.svg">
</p>

## How it works

<p align="center">
  <a href="./guide/how-it-works.md"><img alt="How it works" src="/how-gptlint-works.png"></a>
</p>

See our [docs on how it works](./guide/how-it-works.md) for more details.

## Getting Started

TODO