const fastGlob = require('fast-glob');
const path = require('path');
const {cyan, green} = require('kleur/colors');
const {execOrThrow} = require('../common/exec');
const {log} = require('../common/logging');
const {updateSubpackages} = require('../common/update-packages');

/**
 * Helper that updates build-system subpackages so their types can be verified.
 * Skips npm checks during CI (already done while running each task).
 */
function updateBuildSystemSubpackages() {
  const packageFiles = fastGlob.sync('build-system/tasks/*/package.json');
  for (const packageFile of packageFiles) {
    const packageDir = path.dirname(packageFile);
    updateSubpackages(packageDir, /* skipNpmChecks */ true);
  }
}

/**
 * Performs type checking on the /build-system directory using TypeScript.
 * Configuration is defined in /build-system/tsconfig.json.
 */
function checkBuildSystem() {
  updateBuildSystemSubpackages();
  log('Checking types in', cyan('build-system') + '...');
  execOrThrow(
    'npx -p typescript tsc --project ./build-system/tsconfig.json',
    'Type checking failed'
  );
  log(green('SUCCESS:'), 'No type errors in', cyan('build-system') + '.');
}

checkBuildSystem.description =
  'Check source code in build-system/ for JS type errors';

module.exports = {
  checkBuildSystem,
};
