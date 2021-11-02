'use strict';

const jest = require('@jest/core');
const {isCiBuild} = require('../common/ci');

/**
 * Entry point for `amp babel-plugin-tests`. Runs the jest-based tests for
 * AMP's custom babel plugins.
 * @return {Promise<void>}
 */
async function babelPluginTests() {
  const projects = ['./build-system/babel-plugins'];
  const options = {
    automock: false,
    coveragePathIgnorePatterns: ['/node_modules/'],
    detectOpenHandles: true,
    modulePathIgnorePatterns: ['/test/fixtures/', '<rootDir>/build/'],
    reporters: [
      isCiBuild() ? 'jest-silent-reporter' : 'jest-progress-bar-reporter',
    ],
    setupFiles: ['./build-system/babel-plugins/testSetupFile.js'],
    testEnvironment: 'node',
    testPathIgnorePatterns: ['/node_modules/'],
    testRegex: '/babel-plugins/[^/]+/test/.+\\.m?js$',
    transformIgnorePatterns: ['/node_modules/'],
  };

  // The `jest.runCLI` command is undocumented. See the types file for object shape:
  // https://github.com/facebook/jest/blob/bd76829f66c5c0f3c6907b80010f19893cb0fc8c/packages/jest-test-result/src/types.ts#L74-L91.
  const aggregatedResults = await jest.runCLI(
    // TODO(#23582) the typing for jest.Config.Argv seems to be a little off.
    /** @type {*} */ (options),
    projects
  );
  if (!aggregatedResults.results.success) {
    throw new Error('See the logs above for details.');
  }
}

module.exports = {
  babelPluginTests,
};

babelPluginTests.description =
  "Run the Jest based tests for AMP's custom babel plugins";
