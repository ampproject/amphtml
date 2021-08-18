

const Mocha = require('mocha');
const path = require('path');
const TEST_SUITE_PATH = 'build-system/tasks/performance/test-suite.js';

/**
 * @param {function} resolver
 */
function runTests(resolver) {
  const mocha = new Mocha();
  mocha.addFile(path.join('./', TEST_SUITE_PATH));
  mocha.run(async (failures) => {
    process.exitCode = failures ? 1 : 0;
    await resolver();
  });
}

module.exports = runTests;
