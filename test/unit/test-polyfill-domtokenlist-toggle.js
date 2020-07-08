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

import {install} from '../../src/polyfills/domtokenlist';
import {toArray} from '../../src/types';

describes.fakeWin(
  'DOMTokenList.toggle/add on non-IE',
  {
    win: {
      navigator: {
        userAgent: 'Chrome',
      },
    },
  },
  (env) => {
    let originalToggle;
    let originalAdd;
    let element;

    beforeEach(() => {
      originalToggle = env.win.DOMTokenList.prototype.toggle;
      originalAdd = env.win.DOMTokenList.prototype.add;

      element = env.win.document.createElement('div');
      env.win.document.body.appendChild(element);
    });

    afterEach(() => {
      env.win.DOMTokenList.prototype.toggle = originalToggle;
      env.win.DOMTokenList.prototype.add = originalAdd;
      if (element.parentNode) {
        element.parentNode.removeChild(element);
      }
    });

    it('should NOT override toggle in non-IE browsers', () => {
      env.win.DOMTokenList = window.DOMTokenList;
      install(env.win);
      const newToggle = env.win.DOMTokenList.prototype.toggle;
      expect(newToggle).to.equal(originalToggle);
    });

    it('should NOT override add in non-IE browsers', () => {
      env.win.DOMTokenList = window.DOMTokenList;
      install(env.win);
      const newAdd = env.win.DOMTokenList.prototype.add;
      expect(newAdd).to.equal(originalAdd);
    });
  }
);

describes.fakeWin(
  'DOMTokenList.toggle/add On IE',
  {
    win: {
      navigator: {
        userAgent: 'MSIE',
      },
    },
  },
  (env) => {
    let originalToggle;
    let originalAdd;
    let element;

    beforeEach(() => {
      originalToggle = env.win.DOMTokenList.prototype.toggle;
      originalAdd = env.win.DOMTokenList.prototype.add;

      element = env.win.document.createElement('div');
      env.win.document.body.appendChild(element);
    });

    afterEach(() => {
      env.win.DOMTokenList.prototype.toggle = originalToggle;
      env.win.DOMTokenList.prototype.add = originalAdd;
      if (element.parentNode) {
        element.parentNode.removeChild(element);
      }
    });

    it('should polyfill DOMTokenList.toggle API', () => {
      env.win.DOMTokenList = window.DOMTokenList;
      install(env.win);
      const polyfillToggle = env.win.DOMTokenList.prototype.toggle;

      expect(polyfillToggle).to.be.ok;
      expect(polyfillToggle).to.not.equal(originalToggle);

      expect(toArray(element.classList)).to.not.contain('first');
      expect(polyfillToggle.call(element.classList, 'first')).to.be.true;
      expect(toArray(element.classList)).to.contain('first');
      expect(polyfillToggle.call(element.classList, 'first')).to.be.false;
      expect(toArray(element.classList)).to.not.contain('first');
      expect(polyfillToggle.call(element.classList, 'first')).to.be.true;
      expect(toArray(element.classList)).to.contain('first');
      expect(polyfillToggle.call(element.classList, 'first', true)).to.be.true;
      expect(toArray(element.classList)).to.contain('first');
      expect(polyfillToggle.call(element.classList, 'first', true)).to.be.true;
      expect(toArray(element.classList)).to.contain('first');
      expect(polyfillToggle.call(element.classList, 'first', false)).to.be
        .false;
      expect(toArray(element.classList)).to.not.contain('first');
      expect(polyfillToggle.call(element.classList, 'first', false)).to.be
        .false;
      expect(toArray(element.classList)).to.not.contain('first');
      expect(polyfillToggle.call(element.classList, 'first', false)).to.be
        .false;
      expect(toArray(element.classList)).to.not.contain('first');
    });

    it('should polyfill DOMTokenList.add API', () => {
      env.win.DOMTokenList = window.DOMTokenList;
      install(env.win);
      const polyfillAdd = env.win.DOMTokenList.prototype.add;

      expect(polyfillAdd).to.be.ok;
      expect(polyfillAdd).to.not.equal(originalToggle);

      element.classList.add('foo');
      expect(toArray(element.classList)).to.contain('foo');
      element.classList.add('one', 'two', 'three');
      expect(toArray(element.classList)).to.contain('foo');
      expect(toArray(element.classList)).to.contain('one');
      expect(toArray(element.classList)).to.contain('two');
      expect(toArray(element.classList)).to.contain('three');
    });
  }
);
