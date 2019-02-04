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
const BBPromise = require('bluebird');
const fs = BBPromise.promisifyAll(require('fs'));
const path = require('path');

const {
  assertValidAmphtml,
  getBoundAttr,
  parseHtmlChunk,
} = require('./helpers');

describe('devdash', () => {

  describe('Test helpers', () => {

    describe('parseHtmlChunk', () => {

      it('returns firstElementChild', () => {
        const {tagName} = parseHtmlChunk('<my-tag></my-tag>');
        assert.strictEqual(tagName, 'MY-TAG');
      });

    });

    describe('getBoundAttr', () => {

      it('returns bound attr when found', () => {
        [
          {
            outerHTML: '<div myHref=a [myHref]=a></div>',
            attr: 'myHref',
            expected: 'a',
          },
          {
            outerHTML: '<div foo=a [foo]="blah"></div>',
            attr: 'foo',
            expected: 'blah',
          },
          {
            outerHTML: '<div [myHref]="b"></div>',
            attr: 'myHref',
            expected: 'b',
          },
          {
            outerHTML: '<div [foo]="baz"></div>',
            attr: 'foo',
            expected: 'baz',
          },
        ].forEach(({outerHTML, attr, expected}) => {
          assert.strictEqual(getBoundAttr({outerHTML}, attr), expected);
        });
      });

      it('returns nothing when not found', () => {
        assert(!getBoundAttr({outerHTML: '<div></div>'}, 'whatever'));
      });

    });

    describe('assertValidAmphtml', () => {

      it('passes with minimum valid doc', async() => {
        const validDocPath = path.join(__dirname,
            '../../../validator/testdata/feature_tests/minimum_valid_amp.html');

        const validDoc = (await fs.readFileAsync(validDocPath)).toString();

        assertValidAmphtml(await amphtmlValidator.getInstance(), validDoc);
      });

      it('fails with invalid doc', async() => {
        const invalidDoc = '<html 😻></html>';

        const validator = await amphtmlValidator.getInstance();

        assert.throws(() => {
          assertValidAmphtml(validator, invalidDoc);
        });
      });

    });

  });

});
