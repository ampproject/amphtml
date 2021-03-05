/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
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

// These two are required for reasons internal to AMP
import '../../../../extensions/amp-ad/0.1/amp-ad-ui';
import '../../../../extensions/amp-ad/0.1/amp-ad-xorigin-iframe-handler';
import {AmpAdNetworkNwsImpl} from '../amp-ad-network-nws-impl';
import {Services} from '../../../../src/services';
import {createElementWithAttributes} from '../../../../src/dom';

describes.fakeWin('amp-ad-network-nws-impl', {amp: true}, (env) => {
  let win, doc, element, impl, preloadExtensionSpy;

  beforeEach(() => {
    win = env.win;
    win.__AMP_MODE = {localDev: false};
    doc = win.document;
    element = createElementWithAttributes(doc, 'amp-ad', {
      'type': 'nws',
    });
    doc.body.appendChild(element);
    impl = new AmpAdNetworkNwsImpl(element);
    const extensions = Services.extensionsFor(impl.win);
    preloadExtensionSpy = env.sandbox.spy(extensions, 'preloadExtension');
  });

  describe('#getAdUrl', () => {
    it('should be valid', () => {
      const dataSlot = '1';
      element.setAttribute('data-slot', dataSlot);
      expect(impl.getAdUrl()).to.equal(
        `https://svr.nws.ai/a4a?slot=${encodeURIComponent(dataSlot)}`
      );
    });
  });

  describe('#extractSize', () => {
    it('should not load amp-analytics without header', () => {
      impl.extractSize({
        get() {
          return undefined;
        },
        has() {
          return false;
        },
      });
      expect(preloadExtensionSpy.withArgs('amp-analytics')).to.not.be.called;
    });
    it('should load amp-analytics with header', () => {
      impl.extractSize({
        get(name) {
          switch (name) {
            case 'X-NWS':
              return '{"ampAnalytics": {}}';
            default:
              return undefined;
          }
        },
        has(name) {
          return !!this.get(name);
        },
      });
      expect(preloadExtensionSpy.withArgs('amp-analytics')).to.not.be.called;
    });
  });
});
