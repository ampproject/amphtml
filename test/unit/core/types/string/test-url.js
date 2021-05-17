/**
 * Copyright 2021 The AMP HTML Authors. All Rights Reserved.
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

import {parseQueryString} from '../../../../../src/core/types/string/url';

describes.sandboxed('type helpers - strings - urls', {}, () => {
  describe('parseQueryString', () => {
    it('should return empty params when query string is empty or null', () => {
      expect(parseQueryString(null)).to.deep.equal({});
      expect(parseQueryString('')).to.deep.equal({});
    });
    it('should parse single key-value', () => {
      expect(parseQueryString('a=1')).to.deep.equal({
        'a': '1',
      });
    });
    it('should parse two key-values', () => {
      expect(parseQueryString('a=1&b=2')).to.deep.equal({
        'a': '1',
        'b': '2',
      });
    });
    it('should ignore leading ?', () => {
      expect(parseQueryString('?a=1&b=2')).to.deep.equal({
        'a': '1',
        'b': '2',
      });
    });
    it('should ignore leading #', () => {
      expect(parseQueryString('#a=1&b=2')).to.deep.equal({
        'a': '1',
        'b': '2',
      });
    });
    it('should parse empty value', () => {
      expect(parseQueryString('a=&b=2')).to.deep.equal({
        'a': '',
        'b': '2',
      });
      expect(parseQueryString('a&b=2')).to.deep.equal({
        'a': '',
        'b': '2',
      });
    });
    it('should decode names and values', () => {
      expect(parseQueryString('a%26=1%26&b=2')).to.deep.equal({
        'a&': '1&',
        'b': '2',
      });
    });
    it('should return last dupe', () => {
      expect(parseQueryString('a=1&b=2&a=3')).to.deep.equal({
        'a': '3',
        'b': '2',
      });
    });
  });
});
