/**
 * @fileoverview
 * Builds npm binaries for specified Bento components.
 */

const [extension] = process.argv.slice(2);
const {timedExecOrDie} = require('../pr-check/utils');
const {updatePackages} = require('../common/update-packages');

const ampExtensionsOption = extension
  ? `--extensions=${extension}`
  : '--noextensions';

updatePackages();
timedExecOrDie(`amp build ${ampExtensionsOption} --bento_runtime_only`);
timedExecOrDie(`amp build ${ampExtensionsOption} --bento_runtime_only --esm`);
timedExecOrDie(`amp dist ${ampExtensionsOption} --bento_runtime_only`);
timedExecOrDie(`amp dist ${ampExtensionsOption} --bento_runtime_only --esm`);
