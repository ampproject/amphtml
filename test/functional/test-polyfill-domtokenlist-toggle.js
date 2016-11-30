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

import {install} from '../../src/polyfills/domtokenlist-toggle';
import {toArray} from '../../src/types';
import * as sinon from 'sinon';


describe('DOMTokenList.toggle', () => {

  const originalToggle = window.DOMTokenList.prototype.toggle;
  let sandbox;
  let fakeWinNonIE;
  let fakeWinIE;
  let nativeToggle;
  let polyfillToggle;
  let element;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();

    element = document.createElement('div');
    document.body.appendChild(element);
  });

  afterEach(() => {
    window.DOMTokenList.prototype.toggle = originalToggle;
    if (element.parentNode) {
      element.parentNode.removeChild(element);
    }
    sandbox.restore();
  });

  it('should NOT override in non-IE browsers', () => {
    fakeWinNonIE = {
      navigator: {
        userAgent: 'Chrome',
      },
      DOMTokenList: window.DOMTokenList,
    };
    nativeToggle = fakeWinNonIE.DOMTokenList.prototype.toggle;

    install(fakeWinNonIE);
    expect(fakeWinNonIE.DOMTokenList.prototype.toggle).to.equal(nativeToggle);
  });


  it('should override on IE browsers', () => {
    fakeWinIE = {
      navigator: {
        userAgent: 'MSIE',
      },
      DOMTokenList: window.DOMTokenList,
    };
    install(fakeWinIE);
    polyfillToggle = fakeWinIE.DOMTokenList.prototype.toggle;

    expect(polyfillToggle).to.be.ok;
    expect(polyfillToggle).to.not.equal(nativeToggle);
  });

  it('should polyfill DOMTokenList.toggle API', () => {
    fakeWinIE = {
      navigator: {
        userAgent: 'MSIE',
      },
      DOMTokenList: window.DOMTokenList,
    };
    install(fakeWinIE);
    polyfillToggle = fakeWinIE.DOMTokenList.prototype.toggle;

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
    expect(polyfillToggle.call(element.classList, 'first', false)).to.be.false;
    expect(toArray(element.classList)).to.not.contain('first');
    expect(polyfillToggle.call(element.classList, 'first', false)).to.be.false;
    expect(toArray(element.classList)).to.not.contain('first');
    expect(polyfillToggle.call(element.classList, 'first', false)).to.be.false;
    expect(toArray(element.classList)).to.not.contain('first');
  });
});
