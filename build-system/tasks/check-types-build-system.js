const { execOrThrow } = require('../common/exec');

/**
 * Performs type checking on the /build-system directory using TypeScript.
 * Configuration is defined in /build-system/tsconfig.json.
 *
 * @return {Promise<void>}
 */
function checkBuildSystemTypes() {
  return new Promise((resolve, reject) => {
    try {
      execOrThrow('npx tsc --project ./build-system/tsconfig.json', 'TypeScript build failed');
      resolve();
    } catch (err) {
      reject(err);
    }
  });
}

module.exports = {
  checkBuildSystemTypes,
};
