'use strict';

const fs = require('fs');
const path = require('path');

const rules = {};
const ruleFiles = fs
  .readdirSync(__dirname)
  .filter(
    (ruleFile) => !['index.js', '.eslintrc.js', 'OWNERS'].includes(ruleFile)
  );
ruleFiles.forEach(function (ruleFile) {
  const rule = ruleFile.replace(path.extname(ruleFile), '');
  rules[rule] = require(path.join(__dirname, rule));
});

module.exports = {rules};
