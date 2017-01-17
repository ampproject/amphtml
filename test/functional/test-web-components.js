/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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
  setShadowDomMethodForTesting,
  setWindowForTesting,
  isShadowDomSupported,
  getShadowDomMethod,
  isNative
} from '../../src/web-components';


describe('web components', () => {
  it("reports when a method is browser native", () => {
    expect(isNative(document.getElementById)).to.be.true;
    expect(isNative(() => {})).to.be.false;
  })
});

['shadowDomV0', 'shadowDomV1'].forEach(shadowDomVersion => {
  ['customElementsV0', 'customElementsV1'].forEach(customElementsVersion => {
    describes.realWin('web components', {}, env => {
      let win;
      let shadowDomMethod;
      let customElementsMethod;

      beforeEach(() => {
        win = env.win;
        setWindowForTesting(win);

        if (shadowDomVersion == 'shadowDomV0') {
          shadowDomMethod = win.Element.prototype.createShadowRoot;
          win.Element.prototype.attachShadow = undefined;
        }

        if (shadowDomVersion == 'shadowDomV1') {
          shadowDomMethod = win.Element.prototype.attachShadow;
          win.Element.prototype.createShadowRoot = undefined;
        }

        if (customElementsVersion == 'customElementsV0') {
          customElementsMethod = win.document.registerElement;
        }

        if (customElementsVersion == 'customElementsV1') {
          customElementsMethod = win.customElements && win.customElements.define;
          win.document.registerElement = undefined;
        }
      });

      afterEach(() => {
        setShadowDomMethodForTesting(undefined);
        setShadowDomMethodForTesting(undefined);
        setWindowForTesting(window);
      });

      describe('shadow dom', () => {
        it("should report support for shadow dom", () => {
          expect(isShadowDomSupported()).to.equal(
              !!shadowDomMethod && !!customElementsMethod);
        });

        it("should return available shadow dom method", () => {
          expect(getShadowDomMethod()).to.equal(
              shadowDomMethod);
        });
      });
    });
  });
});