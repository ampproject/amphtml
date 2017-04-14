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
  ShadowDomVersion,
  isShadowDomSupported,
  isNative,
  getShadowDomSupportedVersion,
  setShadowDomSupportedVersionForTesting,
} from '../../src/web-components';


describe('web components', () => {
  beforeEach(() => {
    setShadowDomSupportedVersionForTesting(undefined);
  });

  it('reports when a method is browser native', () => {
    expect(isNative(self.document.getElementById)).to.be.true;
    expect(isNative(() => {})).to.be.false;
  });

  it('should report whether native shadow dom supported', () => {
    const shadowDomV0 = !!Element.prototype.createShadowRoot;
    const shadowDomV1 = !!Element.prototype.attachShadow;
    const nativeCEV0 = isNative(self.document.registerElement);
    const nativeCEV1 = isNative(self
        .Object
        .getOwnPropertyDescriptor(self, 'customElements')
        .get);

    //TODO: Remove native CE check once WebReflection/document-register-element#96 is fixed.
    expect(isShadowDomSupported()).to.equal(
        (shadowDomV0 || shadowDomV1) && (nativeCEV0 || nativeCEV1));
  });
});

describes.realWin('Web Components spec', {}, env => {
  let win;

  beforeEach(() => {
    win = env.win;
    setShadowDomSupportedVersionForTesting(undefined);
  });

  //TODO: Remove native CE check once WebReflection/document-register-element#96 is fixed.
  if (isNative(self.document.registerElement)) {
    describe('Shadow DOM', () => {
      it('reports NONE when no spec is available', () => {
        win.Element.prototype.createShadowRoot = undefined;
        win.Element.prototype.attachShadow = undefined;

        expect(getShadowDomSupportedVersion(win.Element))
            .to.equal(ShadowDomVersion.NONE);
      });

      it('gives preference to v1 over v0 when both specs are available', () => {
        if (!!win.Element.prototype.createShadowRoot &&
            !!win.Element.prototype.attachShadow) {
          expect(getShadowDomSupportedVersion(win.Element))
              .to.equal(ShadowDomVersion.V1);
        }
      });

      it('reports v0 when available but v1 is not', () => {
        if (!!win.Element.prototype.createShadowRoot) {
          win.Element.prototype.attachShadow = undefined;

          expect(getShadowDomSupportedVersion(win.Element))
              .to.equal(ShadowDomVersion.V0);
        }
      });
    });
  }
});
