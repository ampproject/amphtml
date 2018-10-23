/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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

const assert = require('assert');
const {join} = require('path');

const bundler = require('../bundler');
const devDashboard = require('../index');

const expressResMock = {
  end: () => {},
};

describe('Tests for the dev dashboard', () => {

  it('should bundle', () => {
    return bundler.bundleComponent(join(__dirname, '../components/main.js'))
        .then(bundle => {
          assert.ok(bundle);
        });
  });

  it('should be able to return HTML', () => {
    return devDashboard.serveIndex({
      root: __dirname,
    })({url: '/'}, expressResMock).then(renderedHtml => {
      assert.ok(renderedHtml);
    });
  });
});
