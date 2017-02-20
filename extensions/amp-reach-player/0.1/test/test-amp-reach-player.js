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

import {
  createIframePromise,
  doNotLoadExternalResourcesInTest,
} from '../../../../testing/iframe';
import '../amp-reach-player';
import {adopt} from '../../../../src/runtime';

adopt(window);

describe('amp-reach-player', () => {

  function getReach(attributes, opt_responsive) {
    return createIframePromise().then(iframe => {
      doNotLoadExternalResourcesInTest(iframe.win);
      const reach = iframe.doc.createElement('amp-reach-player');
      for (const key in attributes) {
        reach.setAttribute(key, attributes[key]);
      }
      reach.setAttribute('width', '560');
      reach.setAttribute('height', '315');
      if (opt_responsive) {
        reach.setAttribute('layout', 'responsive');
      }
      return iframe.addElement(reach);
    });
  }

  it('renders', () => {
    return getReach({
      'data-embed-id': 'default',
    }).then(reach => {
      const iframe = reach.querySelector('iframe');
      expect(iframe).to.not.be.null;
      expect(iframe.tagName).to.equal('IFRAME');
      expect(iframe.src).to.equal('https://player-cdn.beachfrontmedia.com/playerapi/v1/frame/player/?embed_id=default');
    });
  });

  it('renders responsively', () => {
    return getReach({
      'data-embed-id': 'default',
    }, true).then(reach => {
      const iframe = reach.querySelector('iframe');
      expect(iframe).to.not.be.null;
      expect(iframe.className).to.match(/i-amphtml-fill-content/);
    });
  });

});

