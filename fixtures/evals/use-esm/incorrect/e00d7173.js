// This uses require, which is part of CommonJS, not ESM.
const fs = require('fs')

module.exports = {
  readFile: function (filePath) {
    return fs.readFileSync(filePath, 'utf8')
  }
}

// Generated by gpt-4-0125-preview
