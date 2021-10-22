const babel = require('@babel/core');
const path = require('path');
const runner = require('@babel/helper-plugin-test-runner').default;

runner(__dirname);

const fileContents = `
import {createUseStyles} from 'react-jss';
export const useStyles = createUseStyles({button: {fontSize: 12}});`;

const plugins = [path.join(__dirname, '..')];
const caller = {name: 'babel-jest'};

// eslint-disable-next-line no-undef
test('transforming the same file contents twice should throw if there is a hash collision with filename', () => {
  let filename;
  expect(() => {
    stubCreateHash(() => {
      filename = 'test1.jss.js';
      babel.transformSync(fileContents, {filename, plugins, caller});
      filename = 'test2.jss.js';
      babel.transformSync(fileContents, {filename, plugins, caller});
    });
  }).toThrow(/Classnames must be unique across all files/);
});

// eslint-disable-next-line no-undef
test('transforming same exact file twice is fine (e.g. watch mode)', () => {
  const filename = 'test.jss.js';
  babel.transformSync(fileContents, {filename, plugins, caller});
  babel.transformSync(fileContents, {filename, plugins, caller});
});

/**
 * A stubs create-hash then calls the provided function.
 * @param {Function} fn
 */
function stubCreateHash(fn) {
  const hash = require('../create-hash');
  const originalCreateHash = hash.createHash;
  hash.createHash = () => 'abcedf';

  try {
    fn();
    hash.createHash = originalCreateHash;
  } catch (err) {
    hash.createHash = originalCreateHash;
    throw err;
  }
}
