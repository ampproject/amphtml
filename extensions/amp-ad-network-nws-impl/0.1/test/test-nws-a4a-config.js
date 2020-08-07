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

import {AmpAdNetworkNwsImpl} from '../amp-ad-network-nws-impl';
import {createElementWithAttributes} from '../../../../src/dom';

describes.fakeWin('amp-ad-network-nws-impl', {amp: true}, (env) => {
  let win, doc, element, impl;

  beforeEach(() => {
    win = env.win;
    win.__AMP_MODE = {localDev: false};
    doc = win.document;
    element = createElementWithAttributes(doc, 'amp-ad', {
      'type': 'nws',
    });
    doc.body.appendChild(element);
    impl = new AmpAdNetworkNwsImpl(element);
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
});
