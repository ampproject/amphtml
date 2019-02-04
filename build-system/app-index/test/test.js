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
const pc = process;

const {bundleComponent} = require('../bundler');
const {join} = require('path');
const {serveIndexForTesting} = require('../index');

const NOOP = () => {};

describe('devdash', () => {

  describe('bundling', () => {

    // Bundling unused at the moment, so no use to test.
    it.skip('bundles', async() => {
      const mainComponentPath = '../components/main.js';
      const bundle = await bundleComponent(join(__dirname, mainComponentPath));
      assert.ok(bundle);
    });

  });

  describe('express middleware', () => {

    it('renders HTML', async() => {
      const renderedHtml = await serveIndexForTesting({url: '/'}, {end: NOOP});
      assert.ok(renderedHtml);
    });

  });
});
