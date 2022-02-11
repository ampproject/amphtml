const glob = require('globby');

/**
 * @param {string} nameWithoutExtension
 * @param {?string|void} cwd
 * @return {Promise<string|undefined>}
 */
async function findJsSourceFilename(nameWithoutExtension, cwd) {
  const [filename] = await glob(
    `${nameWithoutExtension}.{js,ts,tsx}`,
    cwd ? {cwd} : undefined
  );
  return filename;
}

module.exports = {
  findJsSourceFilename,
};
