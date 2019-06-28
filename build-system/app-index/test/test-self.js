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
  expectValidAmphtml,
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

      it('fails with multiple children', () => {
        expect(() => parseHtmlChunk('<a></a><a></a>')).to.throw;
      });

      it('fails with text node as content', () => {
        expect(() => parseHtmlChunk('text content')).to.throw;
      });

      it('fails on empty string', () => {
        expect(() => parseHtmlChunk('')).to.throw;
      });

    });

    describe('getBoundAttr', () => {

      it('returns bound attr set with other bound attrs', () => {
        const fakeEl = {outerHTML: '<div myHref=no [y]=b [myHref]=a></div>'};
        expect(getBoundAttr(fakeEl, 'myHref')).to.equal('a');
      });

      it('returns bound attr set without quotes with unbound attr', () => {
        const fakeEl = {outerHTML: '<div myHref=no [myHref]=a></div>'};
        expect(getBoundAttr(fakeEl, 'myHref')).to.equal('a');
      });

      it('returns bound attr set with quotes with unbound attr', () => {
        const fakeEl = {outerHTML: '<div foo=no [foo]="blah"></div>'};
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
        const fakeEl = {outerHTML: '<div></div>'};
        expect(getBoundAttr(fakeEl, 'whatever')).to.be.undefined;
      });

      it('returns value with whitespace', () => {
        const valueWithWhitespace = ` ^..^      /
                                      /_/\_____/
                                         /\   /\
                                        /  \ /  \ `;
        const fakeEl = {
          outerHTML: `<div [foo]="${valueWithWhitespace}"></div>`,
        };
        expect(getBoundAttr(fakeEl, 'foo')).to.equal(valueWithWhitespace);
      });

      it('returns value with double quote', () => {
        const fakeEl = {outerHTML: '<div [foo]=\'ab"cd ef\'></div>'};
        expect(getBoundAttr(fakeEl, 'foo')).to.equal('ab"cd ef');
      });

      it('returns value with single quote', () => {
        const fakeEl = {outerHTML: '<div [foo]="ab\'cd ef"></div>'};
        expect(getBoundAttr(fakeEl, 'foo')).to.equal('ab\'cd ef');
      });

    });

    describe('expectValidAmphtml', () => {

      it('passes with minimum valid doc', async() => {
        const validDocPath = path.join(__dirname,
            '../../../validator/testdata/feature_tests/minimum_valid_amp.html');

        const validDoc = (await fs.readFileAsync(validDocPath)).toString();

        expectValidAmphtml(await amphtmlValidator.getInstance(), validDoc);
      });

      it('fails with invalid doc', async() => {
        const invalidDoc = '<html 😻></html>';

        const validator = await amphtmlValidator.getInstance();

        expect(() => {
          expectValidAmphtml(validator, invalidDoc);
        }).to.throw;
      });

      it('ignores errors with severity ≠ ERROR', () => {
        const mockValidator = {
          validateString: () => ({
            status: 'PASS',
            errors: [{severity: 'FOO'}],
          }),
        };
        expectValidAmphtml(mockValidator, 'any string');
      });

    });

  });

});
