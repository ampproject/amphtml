const {execScriptAsync} = require('../../common/exec');
const {getOutput} = require('../../common/process');

const command = (args = []) =>
  [
    'npx jscodeshift',
    '--parser=babylon',
    `--parser-config=${__dirname}/parser-config.json`,
    ...args,
  ].join(' ');

/**
 * @param {Array<string>} args
 * @param {?Object=} opts
 * @return {!Object}
 */
const jscodeshift = (args = [], opts) => getOutput(command(args), opts);

/**
 * @param {Array<string>} args
 * @param {Object=} opts
 * @return {ReturnType<execScriptAsync>}
 */
const jscodeshiftAsync = (args = [], opts = {}) =>
  execScriptAsync(command(args), opts);

const stripColors = (str) => str.replace(/\x1B[[(?);]{0,2}(;?\d)*./g, '');

/**
 * @param {string} line
 * @return {?Array<string>} [filename, report]
 */
function getJscodeshiftReport(line) {
  const stripped = stripColors(line);

  // Lines starting with " REP " are reports from a transform, which it owns
  // and formats.
  if (!stripped.startsWith(' REP ')) {
    return null;
  }

  const noPrefix = stripped.substr(' REP '.length);
  const [filename] = noPrefix.split(' ', 1);
  const report = noPrefix.substr(filename.length + 1);
  return [filename, report];
}

module.exports = {getJscodeshiftReport, jscodeshift, jscodeshiftAsync};
