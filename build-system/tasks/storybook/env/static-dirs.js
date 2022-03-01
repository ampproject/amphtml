/**
 * @param {string} rootDir
 * @return {string[]|undefined}
 */
function getStaticDirs(rootDir) {
  // We only need to point to the rootDir when we're in the local dev server.
  // When building, the output directory should be served along the rootDir.
  const isBuild = process.argv?.[1]?.endsWith('build-storybook');
  if (isBuild) {
    return undefined;
  }
  return [rootDir];
}

module.exports = {
  getStaticDirs,
};
