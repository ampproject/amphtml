const glob = require('globby');

/**
 * @param {string} nameWithoutExtension
 * @param {?string|void} cwd
 * @return {Promise<string|undefined>}
 */
async function findJsSourceFilename(nameWithoutExtension, cwd) {
  const [filename] = await glob(
    `${nameWithoutExtension}.{js,jsx,ts,tsx}`,
    cwd ? {cwd} : undefined
  );
  return filename;
}

module.exports = {
  findJsSourceFilename,
};
