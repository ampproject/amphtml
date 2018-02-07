/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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

import {AmpAd} from '../../../amp-ad/0.1/amp-ad'; // eslint-disable-line no-unused-vars
import {AmpAdNetworkFakeImpl} from '../amp-ad-network-fake-impl';

describes.realWin('amp-ad-network-fake-impl', {
  amp: {
    extensions: ['amp-ad', 'amp-ad-network-fake-impl'],
  },
}, env => {
  let doc;
  let win;
  let fakeImplElem;
  beforeEach(() => {
    win = env.win;
    doc = win.document;
    fakeImplElem = doc.createElement('amp-ad');
    fakeImplElem.setAttribute('type', 'fake');
    fakeImplElem.setAttribute('src', 'https://fake.com');
  });

  it('should not send ad request with valid id', () => {
    const fakeImpl = new AmpAdNetworkFakeImpl(fakeImplElem);
    // no id
    expect(fakeImpl.isValidElement()).to.be.false;
    // valid id
    fakeImplElem.setAttribute('id', 'valid');
    const fakeImpl2 = new AmpAdNetworkFakeImpl(fakeImplElem);
    expect(fakeImpl2.isValidElement()).to.be.false;
  });

  it('send ad request with invalid id', () => {
    fakeImplElem.setAttribute('id', 'i-amphtml-demo-test');
    const fakeImpl = new AmpAdNetworkFakeImpl(fakeImplElem);
    expect(fakeImpl.isValidElement()).to.be.true;
  });
});
