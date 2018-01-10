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

import {Expander} from '../../../src/service/url-expander/expander';
import {GlobalVariableSource} from '../../../src/service/url-replacements-impl';

function mockClientIdFn(str) {
  if (str === '__ga') {
    return Promise.resolve('amp-GA12345');
  }
  return Promise.resolve('amp-987654321');
}

describes.fakeWin('Parser', {
  amp: {
    ampdoc: 'single',
  },
}, env => {

  let expander;
  let variableSource;

  beforeEach(() => {
    variableSource = new GlobalVariableSource(env.ampdoc);
    expander = new Expander(variableSource);
  });

  describe('#eliminateOverlaps', () => {
    const url = 'http://www.google.com/?client=CLIENT_ID(__ga)&canon=CANONICAL_URL&random=RANDOM';

    it('should handle empty', () => {
      const array = [];
      const expected = null;
      expect(expander.eliminateOverlaps_(array, url)).to.deep.equal(expected);
    });

    it('should return single item', () => {
      const array = [
        {start: 58, stop: 64, length: 6, name: 'RANDOM'},
      ];
      const expected = [
        {start: 58, stop: 64, length: 6, name: 'RANDOM'},
      ];
      expect(expander.eliminateOverlaps_(array, url)).to.deep.equal(expected);
    });

    it('should sort basic case', () => {
      const array = [
        {start: 58, stop: 64, length: 6, name: 'RANDOM'},
        {start: 37, stop: 50, length: 13, name: 'CANONICAL_URL'},
      ];
      const expected = [
        {start: 37, stop: 50, length: 13, name: 'CANONICAL_URL'},
        {start: 58, stop: 64, length: 6, name: 'RANDOM'},
      ];
      expect(expander.eliminateOverlaps_(array, url)).to.deep.equal(expected);
    });

    it('should sort overlapping case', () => {
      const array = [
        {start: 58, stop: 64, length: 6, name: 'RANDOM'},
        {start: 37, stop: 50, length: 13, name: 'CANONICAL_URL'},
        {start: 45, stop: 70, length: 15, name: '123456789012345'},
      ];
      const expected = [
        {start: 45, stop: 70, length: 15, name: '123456789012345'},
      ];
      expect(expander.eliminateOverlaps_(array, url)).to.deep.equal(expected);
    });

    it('should handle same start', () => {
      const array = [
        {start: 58, stop: 90, length: 13, name: 'CANONICAL_URL'},
        {start: 58, stop: 64, length: 6, name: 'RANDOM'},
      ];
      const expected = [
        {start: 58, stop: 90, length: 13, name: 'CANONICAL_URL'},
      ];
      expect(expander.eliminateOverlaps_(array, url)).to.deep.equal(expected);
    });

    it('should handle keywords next to each other', () => {
      const array = [
        {start: 58, stop: 64, length: 13, name: 'CANONICAL_URL'},
        {start: 65, stop: 71, length: 6, name: 'RANDOM'},
      ];
      const expected = [
        {start: 58, stop: 64, length: 13, name: 'CANONICAL_URL'},
        {start: 65, stop: 71, length: 6, name: 'RANDOM'},
      ];
      expect(expander.eliminateOverlaps_(array, url)).to.deep.equal(expected);
    });
  });

  describe('#expand', () => {
    // making sure to include resolutions of different types
    const mockBindings = {
      CLIENT_ID: mockClientIdFn, // fn resolving to promise
      CANONICAL_URL: 'www.google.com', // string
      RANDOM: () => 123456, // number
      TRIM: str => str.trim(), // fn
      UPPERCASE: str => str.toUpperCase(),
      LOWERCASE: str => str.toLowerCase(),
      CONCAT: (a, b) => a + b,
      CAT_THREE: (a, b, c) => a + b + c,
    };

    it('should handle empty urls', () =>
      expect(expander.expand('', mockBindings)).to.eventually.equal('')
    );

    it('parses one function, one argument', () =>
      expect(expander.expand('TRIM(aaaaa    )', mockBindings))
          .to.eventually.equal('aaaaa')
    );

    it('parses nested function one level', () =>
      expect(expander.expand('UPPERCASE(TRIM(aaaaa    ))', mockBindings))
          .to.eventually.equal('AAAAA')
    );

    it('parses nested function two levels', () =>
      expect(
          expander.expand('LOWERCASE(UPPERCASE(TRIM(aAaA    )))', mockBindings))
          .to.eventually.equal('aaaa')
    );

    it('parses one function, two string arguments', () =>
      expect(expander.expand('CONCAT(aaa,bbb)', mockBindings))
          .to.eventually.equal('aaabbb')
    );

    it('parses one function, two string arguments with space', () =>
      expect(expander.expand('CONCAT(aaa , bbb)', mockBindings))
          .to.eventually.equal('aaabbb')
    );

    it('parses function with func then string as args', () =>
      expect(expander.expand('CONCAT(UPPERCASE(aaa),bbb)', mockBindings))
          .to.eventually.equal('AAAbbb')
    );

    it('parses function with macro then string as args', () =>
      expect(expander.expand('CONCAT(CANONICAL_URL,bbb)', mockBindings))
          .to.eventually.equal('www.google.combbb')
    );

    it('parses function with string then func as args', () =>
      expect(expander.expand('CONCAT(aaa,UPPERCASE(bbb))', mockBindings))
          .to.eventually.equal('aaaBBB')
    );

    it('parses function with two funcs as args', () => {
      const url = 'CONCAT(LOWERCASE(AAA),UPPERCASE(bbb)';
      return expect(expander.expand(url, mockBindings))
          .to.eventually.equal('aaaBBB');
    });

    it('parses function with three funcs as args', () => {
      const url = 'CAT_THREE(LOWERCASE(AAA),UPPERCASE(bbb),LOWERCASE(CCC))';
      return expect(expander.expand(url, mockBindings))
          .to.eventually.equal('aaaBBBccc');
    });

    it('should handle real urls', () => {
      const url = 'http://www.amp.google.com/?client=CLIENT_ID(__ga)&canon=CANONICAL_URL&random=RANDOM';
      const expected = 'http://www.amp.google.com/?client=amp-GA12345&canon=www.google.com&random=123456';
      return expect(expander.expand(url, mockBindings))
          .to.eventually.equal(expected);
    });

    it('should treat unrecognized keywords as normal strings', () => {
      return expect(expander.expand('TRIM(FAKE(aaaaa))', mockBindings))
          .to.eventually.equal('');
    });
  });
});

