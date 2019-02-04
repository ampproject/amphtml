/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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

const amphtmlValidator = require('amphtml-validator');
const assert = require('assert');

const {assertValidAmphtml} = require('./helpers');

const {renderTemplate} = require('../template');

describe('template', () => {

  describe('renderTemplate', () => {

    let validator;

    beforeEach(async() => {
      validator = await amphtmlValidator.getInstance();
    });

    it('renders valid doc', () => {
      assertValidAmphtml(validator, renderTemplate({
        basepath: '/examples/',
        css: 'body{}',
        isMainPage: true,
        fileSet: ['tacos.al.pastor'],
        serveMode: 'default',
        selectModePrefix: '/',
      }));
    });

    it('renders valid doc with empty/default values', () => {
      assertValidAmphtml(validator, renderTemplate({
        basepath: '/',
        css: '',
        isMainPage: true,
        fileSet: [],
        serveMode: 'default',
        selectModePrefix: '/',
      }));
    });

  });

});
