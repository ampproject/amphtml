/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
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

import {
  escapeCssSelectorIdent,
  prependSelectorsWith,
  selectors,
} from '../../src/css';

describe('CSS', () => {

  describe('escapeCssSelectorIdent', () => {

    it('should escape', () => {
      expect(escapeCssSelectorIdent('a b')).to.equal('a\\ b');
    });
  });

  describe('scopeSelector', () => {
    it('concats simple', () => {
      expect(prependSelectorsWith('div', '.i-amphtml-scoped '))
          .to.equal('.i-amphtml-scoped div');
    });

    it('concats multiple selectors (2)', () => {
      expect(prependSelectorsWith('div,ul', ':scope '))
          .to.equal(':scope div,:scope ul');
    });

    it('concats multiple selectors (4)', () => {
      expect(prependSelectorsWith('div,ul,ol,section', 'div > '))
          .to.equal('div > div,div > ul,div > ol,div > section');
    });

    it('does not break attributes with commas', () => {
      expect(prependSelectorsWith('div[attr="with,comma"], div', ':scope '))
          .to.equal(':scope div[attr="with,comma"],:scope div');
    });

    it('does not break psuedo-class selectors with commas', () => {
      expect(prependSelectorsWith('div:is(.first, .second), div', ':scope '))
          .to.equal(':scope div:is(.first, .second),:scope div');
    });
  });

  describe('selectors', () => {
    it('handle simple selector', () => {
      expect(selectors('div')).to.deep.equal(['div']);
    });

    it('strips whitespace from simple selector', () => {
      expect(selectors(' div ')).to.deep.equal(['div']);
    });

    it('handle multiple selector', () => {
      expect(selectors('div, ul')).to.deep.equal(['div', 'ul']);
    });

    it('strips whitespace from multiple selector', () => {
      expect(selectors(' div , ul ')).to.deep.equal(['div', 'ul']);
    });

    it('maintains attributes', () => {
      expect(selectors('div[attr]')).to.deep.equal(['div[attr]']);
      expect(selectors('div[attr=val]')).to.deep.equal(['div[attr=val]']);
      expect(selectors('div[attr=val i]')).to.deep.equal(['div[attr=val i]']);
      expect(selectors('div[attr="val"]')).to.deep.equal(['div[attr="val"]']);
      expect(selectors('div[attr="val" i]')).to.deep.equal(
          ['div[attr="val" i]']);
      expect(selectors('div[attr="val,val2"]')).to.deep.equal(
          ['div[attr="val,val2"]']);
      expect(selectors('div[attr="val,val2" i]')).to.deep.equal(
          ['div[attr="val,val2" i]']);
      expect(selectors("div[attr='val']")).to.deep.equal(
          ["div[attr='val']"]);
      expect(selectors("div[attr='val' i]")).to.deep.equal(
          ["div[attr='val' i]"]);
      expect(selectors("div[attr='val,val2']")).to.deep.equal(
          ["div[attr='val,val2']"]);
      expect(selectors("div[attr='val,val2' i]")).to.deep.equal(
          ["div[attr='val,val2' i]"]);

      expect(selectors('div[attr], ul')).to.deep.equal(
          ['div[attr]', 'ul']);
      expect(selectors('div[attr=val], ul')).to.deep.equal(
          ['div[attr=val]', 'ul']);
      expect(selectors('div[attr=val i], ul')).to.deep.equal(
          ['div[attr=val i]', 'ul']);
      expect(selectors('div[attr="val"], ul')).to.deep.equal(
          ['div[attr="val"]', 'ul']);
      expect(selectors('div[attr="val" i], ul')).to.deep.equal(
          ['div[attr="val" i]', 'ul']);
      expect(selectors('div[attr="val,val2"], ul')).to.deep.equal(
          ['div[attr="val,val2"]', 'ul']);
      expect(selectors('div[attr="val,val2" i], ul')).to.deep.equal(
          ['div[attr="val,val2" i]', 'ul']);
      expect(selectors("div[attr='val'], ul")).to.deep.equal(
          ["div[attr='val']", 'ul']);
      expect(selectors("div[attr='val' i], ul")).to.deep.equal(
          ["div[attr='val' i]", 'ul']);
      expect(selectors("div[attr='val,val2'], ul")).to.deep.equal(
          ["div[attr='val,val2']", 'ul']);
      expect(selectors("div[attr='val,val2' i], ul")).to.deep.equal(
          ["div[attr='val,val2' i]", 'ul']);
    });

    it('maintains psuedo-classes', () => {
      expect(selectors('div:is(x, y)')).to.deep.equal(
          ['div:is(x, y)']);
      expect(selectors('div:is(x, [test="val,val2"])')).to.deep.equal(
          ['div:is(x, [test="val,val2"])']);
      expect(selectors('div:is(x, [test=":test("])')).to.deep.equal(
          ['div:is(x, [test=":test("])']);
      expect(selectors('div:is(x, :is(y, z))')).to.deep.equal(
          ['div:is(x, :is(y, z))']);
      expect(selectors('div:is(x, :is([test="val,val2"], z))')).to.deep.equal(
          ['div:is(x, :is([test="val,val2"], z))']);
      expect(selectors('div:is(x, :is([test=":test("], z))')).to.deep.equal(
          ['div:is(x, :is([test=":test("], z))']);

      expect(selectors('div:is(x, y), ul')).to.deep.equal(
          ['div:is(x, y)', 'ul']);
      expect(selectors('div:is(x, [test="val,val2"]), ul')).to.deep.equal(
          ['div:is(x, [test="val,val2"])', 'ul']);
      expect(selectors('div:is(x, [test=":test("]), ul')).to.deep.equal(
          ['div:is(x, [test=":test("])', 'ul']);
      expect(selectors('div:is(x, :is(y, z)), ul')).to.deep.equal(
          ['div:is(x, :is(y, z))', 'ul']);
      expect(selectors('div:is(x, :is([test="val,val2"], z)), ul')).to.deep
          .equal(['div:is(x, :is([test="val,val2"], z))', 'ul']);
      expect(selectors('div:is(x, :is([test=":test("], z)), ul')).to.deep.equal(
          ['div:is(x, :is([test=":test("], z))', 'ul']);
    });
  });
});
