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
  createIframePromise,
  doNotLoadExternalResourcesInTest,
} from '../../../../testing/iframe';
import '../amp-imgur';

describe('amp-imgur', () => {

  function getIns(imgurId) {
    return createIframePromise().then(iframe => {
      doNotLoadExternalResourcesInTest(iframe.win);
      const ins = iframe.doc.createElement('amp-imgur');
      ins.setAttribute('data-imgur-id', imgurId);
      ins.setAttribute('width', '1');
      ins.setAttribute('height', '1');
      ins.setAttribute('layout', 'responsive');
      return iframe.addElement(ins);
    });
  }

  function testIframe(iframe) {
    expect(iframe).to.not.be.null;
    expect(iframe.src).to.equal('https://imgur.com/a/2CnX7/embed?pub=true');
    expect(iframe.className).to.match(/i-amphtml-fill-content/);
  }

  it('renders', () => {
    return getIns('2CnX7').then(ins => {
      testIframe(ins.querySelector('iframe'));
    });
  });
});
