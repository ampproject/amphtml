/**
 * @fileoverview
 * Builds npm binaries for specified Bento components.
 */

const [extension] = process.argv.slice(2);
const {timedExecOrDie} = require('../pr-check/utils');
const {updatePackages} = require('../common/update-packages');

updatePackages();
timedExecOrDie(`amp build --extensions=${extension} --core_runtime_only`);
timedExecOrDie(`amp build --extensions=${extension} --core_runtime_only --esm`);
timedExecOrDie(`amp dist --extensions=${extension} --core_runtime_only`);
timedExecOrDie(`amp dist --extensions=${extension} --core_runtime_only --esm`);
