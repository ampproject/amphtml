/**
 * @fileoverview
 * Builds npm binaries for specified Bento components.
 */

import {timedExecOrDie} from '../pr-check/utils.mjs';
import {updatePackages} from '../common/update-packages.mjs';

const [extension] = process.argv.slice(2);

updatePackages();
timedExecOrDie(`amp build --extensions=${extension} --core_runtime_only`);
timedExecOrDie(`amp build --extensions=${extension} --core_runtime_only --esm`);
timedExecOrDie(`amp dist --extensions=${extension} --core_runtime_only`);
timedExecOrDie(`amp dist --extensions=${extension} --core_runtime_only --esm`);
