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

const {expect} = require('chai');
const {html, joinFragments} = require('../html');


describe('devdash', () => {
  describe('html helpers', () => {
    describe('joinFragments', () => {

      it('joins simple fragments', () => {
        expect(joinFragments(['a', 'b', 'c'])).to.equal('abc');
      });

      it('joins mapped fragments', () => {
        expect(joinFragments([1, 2, 3], a => a + 1)).to.equal('234');
      });

    });

    describe('html', () => {
      it('passes through simple string', () => {
        expect(html`foo`).to.equal('foo');
      });

      it('concatenates interpolated args', () => {
        expect(html`quesadilla ${'de'} chicharrón ${'con'} queso`)
            .to.equal('quesadilla de chicharrón con queso');
      });
    });
  });
});
