const argv = require('minimist')(process.argv.slice(2));
const {
  createCtrlcHandler,
  exitCtrlcHandler,
} = require('../common/ctrlcHandler');
const {compileCss} = require('./css');
const {compileJison} = require('./compile-jison');
const {cyan, green} = require('kleur/colors');
const {execOrThrow} = require('../common/exec');
const {log} = require('../common/logging');

/**
 * Object of targets to check with TypeScript.
 *
 * @type {{[key: string]: string}}
 */
const TSC_TYPECHECK_TARGETS = {
  'carousel': 'extensions/amp-carousel/0.1',
  'compiler': 'src/compiler',
  'core': 'src/core',
  'experiments': 'src/experiments',
  'preact': 'src/preact',
  'new-server': 'build-system/server/new-server/transforms',
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
  await Promise.all([compileCss(), compileJison()]);

  // Use the list of targets if provided, otherwise check all targets
  const targets = argv.targets
    ? argv.targets.split(/,/)
    : Object.keys(TSC_TYPECHECK_TARGETS);

  log(`Checking types for targets: ${targets.map(cyan).join(', ')}`);

  await Promise.all(targets.map(typeCheck));
  exitCtrlcHandler(handlerProcess);
}

module.exports = {
  checkTypes,
};

/* eslint "local/camelcase": 0 */
checkTypes.description = 'Check source code for JS type errors';
checkTypes.flags = {
  targets: 'Comma-delimited list of targets to type-check',
};
