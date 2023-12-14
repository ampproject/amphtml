'use strict';

const config = require('../../../tsconfig.base.json');
const fastGlob = require('fast-glob');
const fs = require('fs');
const listImportsExports = require('list-imports-exports');
const minimatch = require('minimatch');
const path = require('path');
const testConfig = require('../../test-configs/config');
const {cyan, green} = require('kleur/colors');
const {execOrDie} = require('../../common/exec');
const {EXTENSIONS, maybeInitializeExtensions} = require('../extension-helpers');
const {gitDiffNameOnlyMain} = require('../../common/git');
const {isCiBuild} = require('../../common/ci');
const {log, logLocalDev} = require('../../common/logging');

const LARGE_REFACTOR_THRESHOLD = 50;
const TEST_FILE_COUNT_THRESHOLD = 20;
const ROOT_DIR = path.resolve(__dirname, '../../../');
let testsToRun = null;

/**
 * Returns true if the PR is a large refactor.
 * (Used to skip testing local changes.)
 * @return {boolean}
 */
function isLargeRefactor() {
  const filesChanged = gitDiffNameOnlyMain();
  return filesChanged.length >= LARGE_REFACTOR_THRESHOLD;
}

/**
 * Extracts extension info and creates a mapping from CSS files in different
 * source directories to their equivalent JS files in the 'build/' directory.
 *
 * @return {!{[key: string]: string}}
 */
function extractCssJsFileMap() {
  execOrDie('amp css', {'stdio': 'ignore'});
  maybeInitializeExtensions(EXTENSIONS);
  /** @type {{[key: string]: string}} */
  const cssJsFileMap = {};

  /**
   * Adds an entry that maps a CSS file to a JS file
   *
   * @param {object} cssData
   * @param {string} cssBinaryName
   * @param {object} cssJsFileMap
   */
  function addCssJsEntry(cssData, cssBinaryName, cssJsFileMap) {
    const cssFilePath =
      `extensions/${cssData['name']}/${cssData['version']}/` +
      `${cssBinaryName}.css`;
    const jsFilePath = `build/${cssBinaryName}-${cssData['version']}.css.js`;
    cssJsFileMap[cssFilePath] = jsFilePath;
  }

  Object.keys(EXTENSIONS).forEach((extension) => {
    const cssData = EXTENSIONS[extension];
    if (cssData['hasCss']) {
      addCssJsEntry(cssData, cssData['name'], cssJsFileMap);
      if (cssData.hasOwnProperty('cssBinaries')) {
        const cssBinaries = cssData['cssBinaries'];
        cssBinaries.forEach((cssBinary) => {
          addCssJsEntry(cssData, cssBinary, cssJsFileMap);
        });
      }
    }
  });
  return cssJsFileMap;
}

/**
 * Returns the full path of an import after resolving aliases if necessary.
 * During prefix matching, wildcard characters if any are dropped.
 * @param {string} jsFile
 * @param {string} file
 * @return {string}
 */
function resolveImportAliases(jsFile, file) {
  const {paths} = config.compilerOptions;
  const importAliases = Object.keys(paths);
  for (const alias of importAliases) {
    const aliasPrefix = alias.replace('*', '');
    const actualPrefix = paths[alias][0].replace('*', '');
    if (file.startsWith(aliasPrefix)) {
      return file.replace(aliasPrefix, actualPrefix).replace('./', '');
    }
  }
  const jsFileDir = path.dirname(jsFile);
  return path.resolve(jsFileDir, file);
}

/**
 * Returns the list of files imported by a JS file
 *
 * @param {string} jsFile
 * @return {!Array<string>}
 */
function getImports(jsFile) {
  const jsFileContents = fs.readFileSync(jsFile, 'utf8');
  const parsePlugins = ['importAssertions'];
  const {imports} = listImportsExports.parse(jsFileContents, parsePlugins);
  const files = [];
  imports.forEach(function (file) {
    const fullPath = resolveImportAliases(jsFile, file);
    const relativePath = path.relative(ROOT_DIR, fullPath);
    files.push(relativePath);
  });
  return files;
}

/**
 * Retrieves the set of JS source files that import the given CSS file.
 *
 * @param {string} cssFile
 * @param {!{[key: string]: string}} cssJsFileMap
 * @return {!Array<string>}
 */
function getJsFilesFor(cssFile, cssJsFileMap) {
  const jsFiles = [];
  if (cssJsFileMap.hasOwnProperty(cssFile)) {
    const cssFileDir = path.dirname(cssFile);
    const jsFilesInDir = fs.readdirSync(cssFileDir).filter((file) => {
      return path.extname(file) == '.js';
    });
    jsFilesInDir.forEach((jsFile) => {
      const jsFilePath = `${cssFileDir}/${jsFile}`;
      const jsImports = getImports(jsFilePath);
      if (
        jsImports.some((jsImport) => jsImport.includes(cssJsFileMap[cssFile]))
      ) {
        jsFiles.push(jsFilePath);
      }
    });
  }
  return jsFiles;
}

/**
 * Computes the list of unit tests to run under difference scenarios
 * @return {Array<string>|void}
 */
function getUnitTestsToRun() {
  log(green('INFO:'), 'Determining which unit tests to run...');

  if (isLargeRefactor()) {
    log(
      green('INFO:'),
      'Skipping tests on local changes because this is a large refactor.'
    );
    return;
  }

  const tests = unitTestsToRun();
  if (tests.length == 0) {
    log(
      green('INFO:'),
      'No unit tests were directly affected by local changes.'
    );
    return;
  }
  if (isCiBuild() && tests.length > TEST_FILE_COUNT_THRESHOLD) {
    log(
      green('INFO:'),
      'Several tests were affected by local changes. Running all tests below.'
    );
    return;
  }

  log(green('INFO:'), 'Running the following unit tests:');
  tests.forEach((test) => {
    log(cyan(test));
  });

  return tests;
}

/**
 * Extracts the list of unit tests to run based on the changes in the local
 * branch. Return value is cached to optimize for multiple calls.
 *
 * @return {!Array<string>}
 */
function unitTestsToRun() {
  if (testsToRun) {
    return testsToRun;
  }
  const cssJsFileMap = extractCssJsFileMap();
  const filesChanged = gitDiffNameOnlyMain();
  const {unitTestPaths} = testConfig;
  testsToRun = [];
  let srcFiles = [];

  /**
   * @param {string} file
   * @return {boolean}
   */
  function isUnitTest(file) {
    return unitTestPaths.some((pattern) => {
      return minimatch(file, pattern);
    });
  }

  /**
   * @param {string} testFile
   * @param {string[]} srcFiles
   * @return {boolean}
   */
  function shouldRunTest(testFile, srcFiles) {
    const filesImported = getImports(testFile);
    return (
      filesImported.filter(function (file) {
        return srcFiles.some((srcFile) => srcFile.includes(file));
      }).length > 0
    );
  }

  /**
   * Retrieves the set of unit tests that should be run
   * for a set of source files.
   *
   * @param {string[]} srcFiles
   * @return {string[]}
   */
  function getTestsFor(srcFiles) {
    const allUnitTests = fastGlob.sync(unitTestPaths);
    return allUnitTests.filter((testFile) => {
      return shouldRunTest(testFile, srcFiles);
    });
  }

  filesChanged.forEach((file) => {
    if (!fs.existsSync(file)) {
      logLocalDev(
        green('INFO:'),
        'Skipping',
        cyan(file),
        'because it was deleted'
      );
    } else if (isUnitTest(file)) {
      testsToRun.push(file);
    } else if (path.extname(file) == '.js') {
      srcFiles.push(file);
    } else if (path.extname(file) == '.css') {
      srcFiles = srcFiles.concat(getJsFilesFor(file, cssJsFileMap));
    }
  });

  if (srcFiles.length > 0) {
    const moreTestsToRun = getTestsFor(srcFiles);
    moreTestsToRun.forEach((test) => {
      if (!testsToRun.includes(test)) {
        testsToRun.push(test);
      }
    });
  }
  return testsToRun;
}

module.exports = {
  isLargeRefactor,
  getUnitTestsToRun,
  unitTestsToRun,
};
