const argv = require('minimist')(process.argv.slice(2));
const {
  createCtrlcHandler,
  exitCtrlcHandler,
} = require('../common/ctrlcHandler');
const {
  displayLifecycleDebugging,
} = require('../compile/debug-compilation-lifecycle');
const {cleanupBuildDir} = require('../compile/compile');
const {compileCss} = require('./css');
const {compileJison} = require('./compile-jison');
const {cyan, green} = require('kleur/colors');
const {execOrThrow} = require('../common/exec');
const {log} = require('../common/logging');
const {typecheckNewServer} = require('../server/typescript-compile');

/**
 * Object of targets to check with TypeScript.
 *
 * @type {Object<string, string>}
 */
const TSC_TYPECHECK_TARGETS = {
  'compiler': 'src/compiler',
  'carousel': 'extensions/amp-carousel/0.1',
  'core': 'src/core',
  'experiments': 'src/experiments',
};

/**
 * Performs tsc type-checking on the target provided.
 * @param {string} targetName key in TSC_TYPECHECK_TARGETS
 * @return {!Promise<void>}
 */
async function typeCheck(targetName) {
  execOrThrow(
    `npx -p typescript tsc --project ${TSC_TYPECHECK_TARGETS[targetName]}/tsconfig.json`,
    `Type checking ${targetName} failed`
  );
  log(green('SUCCESS:'), 'Type-checking passed for target', cyan(targetName));
}

/**
 * Runs TypeScript Compiler's type checker.
 * @return {!Promise<void>}
 */
async function checkTypes() {
  const handlerProcess = createCtrlcHandler('check-types');

  // Prepare build environment
  process.env.NODE_ENV = 'production';
  cleanupBuildDir();
  typecheckNewServer();
  await Promise.all([compileCss(), compileJison()]);

  // Use the list of targets if provided, otherwise check all targets
  const targets = argv.targets
    ? argv.targets.split(/,/)
    : Object.keys(TSC_TYPECHECK_TARGETS);

  log(`Checking types for targets: ${targets.map(cyan).join(', ')}`);
  displayLifecycleDebugging();

  await Promise.all(targets.map(typeCheck));
  exitCtrlcHandler(handlerProcess);
}

module.exports = {
  checkTypes,
};

/* eslint "local/camelcase": 0 */
checkTypes.description = 'Check source code for JS type errors';
checkTypes.flags = {
  debug: 'Output the file contents during compilation lifecycles',
  targets: 'Comma-delimited list of targets to type-check',
};
