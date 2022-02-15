const globby = require('globby');
const {yellow} = require('kleur/colors');
const {logWithoutTimestamp} = require('../../../common/logging');

/**
 * Remove disabled Storybook files from an evaluated glob pattern.
 * This is required since the disabled Stories use the Knobs addon, which is now
 * obsolete and prevents us from upgrading the Storybook version.
 * @param {string[]} inclusionPattern
 * @return {string[]}
 */
function globExcludeDisabledStorybookFiles(inclusionPattern) {
  const {
    forbiddenTermsGlobal,
  } = require('../../../test-configs/forbidden-terms');
  const forbiddenTerm = `@storybook/${''}addon-knobs`;
  const forbiddenTermsEntry = forbiddenTermsGlobal[forbiddenTerm];
  if (!forbiddenTermsEntry?.allowlist?.length) {
    throw new Error(
      `Forbidden terms entry for "${forbiddenTerm}" not found, or it lacks an allowlist.` +
        '\nThis likely means that globExcludeDisabledStorybookFiles() should be removed.' +
        '\nIts callsites can be replaced with its argument, like the diff at:' +
        '\nhttps://gist.github.com/alanorozco/6e8a64a38cb0d6967c193784624d1011'
    );
  }
  const excluded = new Set(forbiddenTermsEntry.allowlist);
  const prefiltered = globby.sync(inclusionPattern);
  const filtered = prefiltered.filter((filename) => {
    const relativeToRoot = filename.replace(/^([.]{1,2}\/)+/, '');
    return !excluded.has(relativeToRoot);
  });
  const excludedTotal = prefiltered.length - filtered.length;
  if (excludedTotal > 0) {
    logWithoutTimestamp(
      yellow(
        `WARNING: ${excludedTotal} Storybook files have been disabled due to usage of "${forbiddenTerm}"` +
          `\nSee allowlist for "${forbiddenTerm}" in build-system/test-configs/forbidden-terms.js`
      )
    );
  }
  return filtered;
}

module.exports = {
  globExcludeDisabledStorybookFiles,
};
