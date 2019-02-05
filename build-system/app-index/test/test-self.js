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
const BBPromise = require('bluebird');
const fs = BBPromise.promisifyAll(require('fs'));
const path = require('path');
const {expect} = require('chai');

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
        expect(tagName).to.equal(tagName);
      });

    });

    describe('getBoundAttr', () => {

      it('returns bound attr set without quotes with unbound attr', () => {
        const fakeEl = {outerHTML: '<div myHref=a [myHref]=a></div>'};
        expect(getBoundAttr(fakeEl, 'myHref')).to.equal('a');
      });

      it('returns bound attr set with quotes with unbound attr', () => {
        const fakeEl = {outerHTML: '<div foo=a [foo]="blah"></div>'};
        expect(getBoundAttr(fakeEl, 'foo')).to.equal('blah');
      });

      it('returns bound attr set with quotes', () => {
        const fakeEl = {outerHTML: '<div [myHref]="b"></div>'};
        expect(getBoundAttr(fakeEl, 'myHref')).to.equal('b');
      });

      it('returns bound attr set without quotes', () => {
        const fakeEl = {outerHTML: '<div [foo]=baz></div>'};
        expect(getBoundAttr(fakeEl, 'foo')).to.equal('baz');
      });

      it('returns undefined when not found', () => {
        expect(getBoundAttr({outerHTML: '<div></div>'}, 'whatever'))
            .to.be.undefined;
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

        expect(() => {
          assertValidAmphtml(validator, invalidDoc);
        }).to.throw;
      });

    });

  });

});
