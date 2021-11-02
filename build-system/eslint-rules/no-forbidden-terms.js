const {cyan} = require('kleur/colors');
const {matchForbiddenTerms} = require('../test-configs/forbidden-terms');
const {relative} = require('path');

/**
 * @fileoverview
 * Reports forbidden terms found by regex.
 * See test-configs/forbidden-terms.js
 */

const addPeriod = (str) => (/.\s*$/.test(str) ? str : `${str}.`);

module.exports = function (context) {
  return {
    Program() {
      const filename = relative(process.cwd(), context.getFilename());
      const sourceCode = context.getSourceCode();
      const contents = sourceCode.text;

      for (const terms of context.options) {
        for (const report of matchForbiddenTerms(filename, contents, terms)) {
          const {loc, match, message} = report;
          const formattedMatch = cyan(`"${match}"`);
          context.report({
            loc,
            message:
              `Forbidden: ${formattedMatch}.` +
              (message ? ` ${addPeriod(message)}` : ''),
          });
        }
      }
    },
  };
};
