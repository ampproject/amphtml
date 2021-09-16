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
test('throws when duplicate classname is found', () => {
  const fileContents = `
import {createUseStyles} from 'react-jss';
export const useStyles = createUseStyles({button: {fontSize: 12}});
    `;
  const filename = 'test.jss.js';
  const plugins = [path.join(__dirname, '..')];
  const caller = {name: 'babel-jest'};

  // Transforming the same file twice should yield the same classnames, resulting in an error
  babel.transformSync(fileContents, {filename, plugins, caller});
  expect(() =>
    babel.transformSync(fileContents, {filename, plugins, caller})
  ).toThrow(/Classnames must be unique across all files/);
});
