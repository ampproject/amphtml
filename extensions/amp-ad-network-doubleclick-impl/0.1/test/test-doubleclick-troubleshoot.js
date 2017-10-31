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

import {AmpAdNetworkDoubleclickImpl} from '../amp-ad-network-doubleclick-impl';
import {createElementWithAttributes} from '../../../../src/dom';
import {utf8Encode} from '../../../../src/utils/bytes';
// Need the following side-effect import because in actual production code,
// Fast Fetch impls are always loaded via an AmpAd tag, which means AmpAd is
// always available for them. However, when we test an impl in isolation,
// AmpAd is not loaded already, so we need to load it separately.
import '../../../amp-ad/0.1/amp-ad';

/**
 * We're allowing external resources because otherwise using realWin causes
 * strange behavior with iframes, as it doesn't load resources that we
 * normally load in prod.
 * We're turning on ampAdCss because using realWin means that we don't
 * inherit that CSS from the parent page anymore.
 */
const realWinConfig = {
  amp: {
    extensions: ['amp-ad-network-doubleclick-impl'],
  },
  ampAdCss: true,
  allowExternalResources: true,
};


describes.realWin('DoubleClick Troubleshooting', realWinConfig, env => {
  let impl;
  let element;
  let sandbox;

  beforeEach(() => {
    sandbox = env.sandbox;
    env.win.AMP_MODE.test = true;
    const doc = env.win.document;
    // TODO(a4a-cam@): This is necessary in the short term, until A4A is
    // smarter about host document styling.  The issue is that it needs to
    // inherit the AMP runtime style element in order for shadow DOM-enclosed
    // elements to behave properly.  So we have to set up a minimal one here.
    const ampStyle = doc.createElement('style');
    ampStyle.setAttribute('amp-runtime', 'scratch-fortesting');
    doc.head.appendChild(ampStyle);
    doc.body.appendChild(createElementWithAttributes(
        env.win.document, 'div', {
          'style': 'width: 1px; height: 1000px;',
        }));
    element = createElementWithAttributes(env.win.document, 'amp-ad', {
      'height': 'fluid',
      'type': 'doubleclick',
    });
    doc.body.appendChild(element);
    impl = new AmpAdNetworkDoubleclickImpl(element, env.win.document, env.win);
  });

  afterEach(() => sandbox.restore());

  it('should send postMessage', () => {
    window.addEventListener("message", event => {

    }, false);
  });
});