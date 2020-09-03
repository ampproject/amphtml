/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const babel = require('@babel/core');
const path = require('path');
const runner = require('@babel/helper-plugin-test-runner').default;

runner(__dirname);

// eslint-disable-next-line no-undef
describe('jss transform tests', () => {
  const fileContents = `
import {createUseStyles} from 'react-jss';
export const useStyles = createUseStyles({button: {fontSize: 12}});`;

  const plugins = [path.join(__dirname, '..')];
  const caller = {name: 'babel-jest'};

  // eslint-disable-next-line no-undef
  test.only('transforming the same file contents twice should throw if there is a hash collision with filename', () => {
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
});

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
