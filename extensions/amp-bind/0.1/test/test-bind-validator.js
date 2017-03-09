/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
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

import {BindValidator} from '../bind-validator';

describe('BindValidator', () => {
  let val;

  beforeEach(() => {
    val = new BindValidator();
  });

  describe('isResultValid()', () => {
    it('should NOT allow invalid "class" attribute values', () => {
      expect(val.isResultValid('DIV', 'class', 'foo')).to.be.true;

      expect(val.isResultValid(
          'DIV', 'class', 'i-amphtml-foo')).to.be.false;
      expect(val.isResultValid(
          'DIV', 'class', 'foo i-amphtml-bar')).to.be.false;
    });

    it('should NOT sanitize "text" attribute values', () => {
      expect(val.isResultValid('P', 'text', 'Hello World')).to.be.true;
      expect(val.isResultValid('P', 'text', '')).to.be.true;
      expect(val.isResultValid('P', 'text', null)).to.be.true;
      expect(val.isResultValid(
          'P', 'text', '<script>alert(1);</script>')).to.be.true;
    });

    it('should block dangerous attribute URLs in standard elements', () => {
      expect(val.isResultValid('A', 'href',
          /* eslint no-script-url: 0 */ 'javascript:alert(1)')).to.be.false;
      expect(val.isResultValid('A', 'href',
          /* eslint no-script-url: 0 */ 'javascript:alert(1)\n;')).to.be.false;

      expect(val.isResultValid('SOURCE', 'src',
          /* eslint no-script-url: 0 */ 'javascript:alert(1)')).to.be.false;
      expect(val.isResultValid('SOURCE', 'src',
          /* eslint no-script-url: 0 */ 'javascript:alert(1)\n;')).to.be.false;

      expect(val.isResultValid('TRACK', 'src',
          /* eslint no-script-url: 0 */ 'javascript:alert(1)')).to.be.false;
      expect(val.isResultValid('TRACK', 'src',
          /* eslint no-script-url: 0 */ 'javascript:alert(1)\n;')).to.be.false;
    });

    it('should NOT allow unsupported <input> "type" values', () => {
      expect(val.isResultValid('INPUT', 'type', 'checkbox')).to.be.true;
      expect(val.isResultValid('INPUT', 'type', 'email')).to.be.true;

      expect(val.isResultValid('INPUT', 'type', 'BUTTON')).to.be.false;
      expect(val.isResultValid('INPUT', 'type', 'file')).to.be.false;
      expect(val.isResultValid('INPUT', 'type', 'image')).to.be.false;
      expect(val.isResultValid('INPUT', 'type', 'password')).to.be.false;
    });
  });

  describe('AMP extensions', () => {
    it('should support <amp-img>', () => {
      // src
      expect(val.isResultValid(
          'AMP-IMG', 'src', 'http://foo.com/bar.jpg')).to.be.true;
      expect(val.isResultValid('AMP-IMG', 'src',
          /* eslint no-script-url: 0 */ 'javascript:alert(1)\n;')).to.be.false;

      // srcset
      expect(val.isResultValid(
          'AMP-IMG',
          'srcset',
          'http://a.com/b.jpg 1x, http://c.com/d.jpg 2x')).to.be.true;
      expect(val.isResultValid(
          'AMP-IMG',
          'srcset',
          /* eslint no-script-url: 0 */ 'javascript:alert(1)\n;')).to.be.false;
    });

    it('should support <amp-video>', () => {
      // src
      expect(val.isResultValid(
          'AMP-VIDEO', 'src', 'https://foo.com/bar.mp4')).to.be.true;
      expect(val.isResultValid(
          'AMP-VIDEO', 'src', 'http://foo.com/bar.mp4')).to.be.false;
      expect(val.isResultValid('AMP-VIDEO', 'src',
          /* eslint no-script-url: 0 */ 'javascript:alert(1)\n;')).to.be.false;
    });
  });
});
