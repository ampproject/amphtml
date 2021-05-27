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

// These two are required for reasons internal to AMP
import '../../../amp-ad/0.1/amp-ad-ui';
import '../../../amp-ad/0.1/amp-ad-xorigin-iframe-handler';
import {AmpAdNetworkDianomiImpl} from '../amp-ad-network-dianomi-impl';
import {Services} from '../../../../src/services';
import {createElementWithAttributes} from '../../../../src/dom';

describes.fakeWin('amp-ad-network-dianomi-impl', {amp: true}, (env) => {
  let win, doc, element, impl, preloadExtensionSpy;

  beforeEach(() => {
    win = env.win;
    win.__AMP_MODE = {localDev: false};
    doc = win.document;
    element = createElementWithAttributes(doc, 'amp-ad', {
      'type': 'dianomi',
    });
    doc.body.appendChild(element);
    impl = new AmpAdNetworkDianomiImpl(element);
    const extensions = Services.extensionsFor(impl.win);
    preloadExtensionSpy = env.sandbox.spy(extensions, 'preloadExtension');
  });

  describe('#getAdUrl', () => {
    it('should be valid', () => {
      const requestParamId = '5519';
      element.setAttribute('data-request-param-id', requestParamId);
      expect(impl.getAdUrl()).to.equal(
        `https://www.dianomi.com/smartads.pl?format=a4a&id=${requestParamId}`
      );
    });
  });
});
