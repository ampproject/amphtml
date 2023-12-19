/**
 * @fileoverview This is a lightweight task runner with a one-file implentation
 * based on the commander npm package.
 */

const argv = require('minimist')(process.argv.slice(2));
const commander = require('commander');
const esprima = require('esprima');
const fs = require('fs-extra');
const os = require('os');
const path = require('path');
const {
  updatePackages,
  updateSubpackages,
} = require('../common/update-packages');
const {cyan, green, magenta, red} = require('kleur/colors');
const {isCiBuild} = require('../common/ci');
const {log} = require('../common/logging');
const {isCircleciBuild} = require('../common/ci');

/**
 * @typedef {Function & {
 *  description: string,
 *  flags?: Object,
 * }}
 */
let TaskFuncDef;

/**
 * Special-case constant that indicates if `amp --help` was invoked.
 */
const isHelpTask = argv._.length == 0 && argv.hasOwnProperty('help');

/**
 * Calculates and formats the duration for which an AMP task ran.
 * @param {DOMHighResTimeStamp} start
 * @return {string}
 */
function getTime(start) {
  const endTime = Date.now();
  const executionTime = endTime - start;
  const mins = Math.floor(executionTime / 60000);
  const secs = Math.floor((executionTime % 60000) / 1000);
  const msecs = executionTime % 1000;
  return mins !== 0
    ? `${mins}m ${secs}s`
    : secs != 0
      ? `${secs}s`
      : `${msecs}ms`;
}

/**
 * Switches the current directory to the repo root if needed. This is done so
 * that hard-coded paths within tasks can work predictably.
 */
function startAtRepoRoot() {
  const repoRoot = path.resolve(__dirname, '..', '..');
  if (repoRoot != process.cwd()) {
    process.chdir(repoRoot);
    log('Working directory changed to', magenta(path.basename(repoRoot)));
  }
}

/**
 * 1. Updates root-level packages during local development. (Skipped during CI
 *    because they're guaranteed to be fresh.)
 * 2. Updates task-level subpackages if a package.json file exists in the task
 *    directory.
 * @param {string} taskSourceFileName
 */
function ensureUpdatedPackages(taskSourceFileName) {
  if (!isCiBuild()) {
    updatePackages();
  }
  const taskSourceFilePath = getTaskSourceFilePath(taskSourceFileName);
  const packageFile = path.join(taskSourceFilePath, 'package.json');
  const hasSubpackages = fs.pathExistsSync(packageFile);
  if (hasSubpackages) {
    updateSubpackages(taskSourceFilePath);
  }
}

/**
 * Runs an AMP task with logging and timing after installing its subpackages.
 * @param {string} taskName
 * @param {TaskFuncDef} taskFunc
 * @return {Promise<void>}
 */
async function runTask(taskName, taskFunc) {
  const taskFile = path.relative(os.homedir(), 'amp.js');
  log('Using task file', magenta(taskFile));
  const start = Date.now();
  try {
    log(`Starting '${cyan(taskName)}'...`);
    await taskFunc();
    log('Finished', `'${cyan(taskName)}'`, 'after', magenta(getTime(start)));
    // For some reason, the `e2e` and `unit` tasks get stuck on CircleCI after
    // testing is finishing, despite reaching this point in the code. This is a
    // temporary workaround until we understand exactly why and fix the root
    // cause. TODO(@ampproject/wg-infra): fix this.
    if (isCircleciBuild() && ['e2e', 'unit'].includes(taskName)) {
      process.exit(); // process.exitCode is set in ../tasks/e2e/index.js:171
    }
  } catch (err) {
    log(`'${cyan(taskName)}'`, red('errored after'), magenta(getTime(start)));
    log(err);
    process.exit(1);
  }
}

/**
 * Prints an error if the task file and / or function are invalid, and exits.
 * @param {string} taskSourceFileName
 * @param {string=} taskFuncName
 */
function handleInvalidTaskError(taskSourceFileName, taskFuncName) {
  log(
    red('ERROR:'),
    'Could not find' + (taskFuncName ? ` ${cyan(taskFuncName + '()')} in` : ''),
    cyan(path.join('build-system', 'tasks', taskSourceFileName)) + '.'
  );
  log(
    '⤷ Please check the arguments to',
    cyan('createTask()'),
    'in',
    cyan('amp.js') + '.'
  );
  process.exit(1);
}

/**
 * Returns a task's source file path after making sure it is either a valid JS
 * file or a valid dir.
 * @param {string} taskSourceFileName
 * @return {string}
 */
function getTaskSourceFilePath(taskSourceFileName) {
  const tasksDir = path.join(__dirname, '..', 'tasks');
  const taskSourceFilePath = path.join(tasksDir, taskSourceFileName);
  const isValidSourceFilePath =
    fs.pathExistsSync(`${taskSourceFilePath}.js`) || // Task lives in a JS file.
    fs.pathExistsSync(taskSourceFilePath); // Task lives in a directory.
  if (!isValidSourceFilePath) {
    handleInvalidTaskError(taskSourceFileName);
  }
  return taskSourceFilePath;
}

/**
 * Returns a task function after making sure it is valid.
 * @param {string} taskSourceFileName
 * @param {string} taskFuncName
 * @return {TaskFuncDef}
 */
function getTaskFunc(taskSourceFileName, taskFuncName) {
  const taskSourceFilePath = getTaskSourceFilePath(taskSourceFileName);
  const taskFunc = require(taskSourceFilePath)[taskFuncName];
  const isValidFunc = typeof taskFunc == 'function';
  if (!isValidFunc) {
    handleInvalidTaskError(taskSourceFileName, taskFuncName);
  }
  return taskFunc;
}

/**
 * Uses esprima to extract the description from a task file without require-ing
 * it, by tokenizing the JS file and finding the sequence that matches the text
 * "fooTask.description = '<task description>'".
 * @param {string} taskSourceFileName
 * @param {string} taskFuncName
 * @return {string}
 */
function getTaskDescription(taskSourceFileName, taskFuncName) {
  const taskSourceFilePath = getTaskSourceFilePath(taskSourceFileName);
  const taskSourceFile = fs.existsSync(`${taskSourceFilePath}.js`)
    ? `${taskSourceFilePath}.js`
    : path.join(taskSourceFilePath, 'index.js');
  const contents = fs.readFileSync(taskSourceFile, 'utf-8').trim();
  const tokens = Array.from(esprima.tokenize(contents));
  let description = '';
  for (let i = 0; i < tokens.length; ++i) {
    if (
      tokens[i]?.type == 'Identifier' &&
      tokens[i]?.value == taskFuncName &&
      tokens[i + 1]?.type == 'Punctuator' &&
      tokens[i + 1]?.value == '.' &&
      tokens[i + 2]?.type == 'Identifier' &&
      tokens[i + 2]?.value == 'description' &&
      tokens[i + 3]?.type == 'Punctuator' &&
      tokens[i + 3]?.value == '=' &&
      tokens[i + 4]?.type == 'String'
    ) {
      description = tokens[i + 4]?.value
        ?.replace(/^['"]/, '')
        ?.replace(/['"]$/, '');
    }
  }
  return description;
}

/**
 * Helper that creates the tasks in AMP's toolchain based on the invocation:
 * - For `amp --help`, load all task descriptions so a list can be printed.
 * - For `amp <task> --help`, load and print just the task description + flags.
 * - When a task is actually run, update root packages, load the entry point,
 *   validate usage, update task-specific packages, and run the task.
 * @param {string} taskName
 * @param {string=} taskFuncName
 * @param {string=} taskSourceFileName
 */
function createTask(
  taskName,
  taskFuncName = taskName,
  taskSourceFileName = taskName
) {
  const isInvokedTask = argv._.includes(taskName); // `amp <task>`
  const isDefaultTask =
    argv._.length === 0 && taskName == 'default' && !isHelpTask; // `amp`

  if (isHelpTask) {
    const task = commander.command(cyan(taskName));
    const description = getTaskDescription(taskSourceFileName, taskFuncName);
    task.description(description);
  }
  if (isInvokedTask || isDefaultTask) {
    startAtRepoRoot();
    ensureUpdatedPackages(taskSourceFileName);
    const taskFunc = getTaskFunc(taskSourceFileName, taskFuncName);
    const task = commander.command(taskName, {isDefault: isDefaultTask});
    task.description(green(taskFunc.description));
    task.allowUnknownOption(); // Fall through to validateUsage()
    task.helpOption('--help', 'Print this list of flags');
    task.usage('<flags>');
    for (const [flag, description] of Object.entries(taskFunc.flags ?? {})) {
      task.option(`--${cyan(flag)}`, description);
    }
    task.action(async () => {
      validateUsage(task, taskName, taskFunc);
      await runTask(taskName, taskFunc);
    });
  }
}

/**
 * Validates usage by examining task and flag invocation.
 * @param {object} task
 * @param {string} taskName
 * @param {TaskFuncDef} taskFunc
 */
function validateUsage(task, taskName, taskFunc) {
  const tasks = argv._;
  const invalidTasks = tasks.filter((task) => task != taskName);

  const flags = Object.keys(argv).slice(1); // Everything after '_'
  const validFlags = taskFunc.flags ? Object.keys(taskFunc.flags) : [];
  const invalidFlags = flags.filter((flag) => !validFlags.includes(flag));

  if (invalidTasks.length > 0 || invalidFlags.length > 0) {
    task.addHelpText('before', red('ERROR: ') + 'Invalid usage');
    task.help({error: true});
  }
}

/**
 * Finalizes the task runner by doing special-case setup for `amp --help`,
 * parsing the invoked command, and printing an error message if an unknown task
 * was called.
 */
function finalizeRunner() {
  commander.addHelpCommand(false); // We already have `amp --help` and `amp <task> --help`
  if (isHelpTask) {
    commander.helpOption('--help', 'Print this list of tasks');
    commander.usage('<task> <flags>');
  }
  commander.on('command:*', (args) => {
    log(red('ERROR:'), 'Unknown task', cyan(args.join(' ')));
    log('⤷ Run', cyan('amp --help'), 'for a full list of tasks.');
    log('⤷ Run', cyan('amp <task> --help'), 'for help with a specific task.');
    process.exitCode = 1;
  });
  commander.parse();
}

module.exports = {
  createTask,
  finalizeRunner,
};
