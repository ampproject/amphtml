const argv = require('minimist')(process.argv.slice(2));
const tempy = require('tempy');
const {blue, bold, cyan, red} = require('kleur/colors');
const {getStdout} = require('./process');
const {log, logWithoutTimestamp} = require('./logging');
const {writeFile} = require('fs-extra');

/**
 * Diffs a file against content that might replace it.
 * @param {string} filepath
 * @param {string} content
 * @param {Array<string>=} gitDiffFlags
 * @return {!Promise<string>}
 */
const diffTentative = (filepath, content, gitDiffFlags = ['-U1']) =>
  tempy.write.task(content, (temporary) =>
    getStdout(
      [
        'git -c color.ui=always diff',
        ...gitDiffFlags,
        filepath,
        temporary,
      ].join(' ')
    )
      .trim()
      .replace(new RegExp(temporary, 'g'), `/${filepath}`)
  );

/**
 * Diffs a file against new content.
 * If `argv.fix` is true, the file is written with the new content, otherwise
 * errors out.
 * @param {string} callerTask
 * @param {string} filepath
 * @param {string} tentative
 * @param {Array<string>=} opt_gitDiffFlags
 * @return {Promise<void>}
 */
async function writeDiffOrFail(
  callerTask,
  filepath,
  tentative,
  opt_gitDiffFlags
) {
  const diff = await diffTentative(filepath, tentative, opt_gitDiffFlags);

  if (!diff.length) {
    return;
  }

  logWithoutTimestamp();
  logWithoutTimestamp(diff);
  logWithoutTimestamp();

  if (!argv.fix) {
    log(red('ERROR:'), cyan(filepath), 'is missing the changes above.');
    log('⤷ To automatically apply them, run', cyan(`amp ${callerTask} --fix`));
    throw new Error(`${filepath} is outdated`);
  }

  await writeFile(filepath, tentative);
  log('Wrote', bold(blue(filepath)));
}

module.exports = {
  diffTentative,
  writeDiffOrFail,
};
