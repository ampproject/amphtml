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
import '../amp-kaltura-player';
import {adopt} from '../../../../src/runtime';

adopt(window);

describe('amp-kaltura-player', () => {

  function getKaltura(attributes, opt_responsive) {
    return createIframePromise().then(iframe => {
      doNotLoadExternalResourcesInTest(iframe.win);
      const kalturaPlayer = iframe.doc.createElement('amp-kaltura-player');
      for (const key in attributes) {
        kalturaPlayer.setAttribute(key, attributes[key]);
      }
      kalturaPlayer.setAttribute('width', '111');
      kalturaPlayer.setAttribute('height', '222');
      if (opt_responsive) {
        kalturaPlayer.setAttribute('layout', 'responsive');
      }
      iframe.doc.body.appendChild(kalturaPlayer);
      kalturaPlayer.implementation_.layoutCallback();
      return kalturaPlayer;
    });
  }

  it('renders', () => {
    return getKaltura({
      'data-partner': '1281471',
      'data-entryid': '1_3ts1ms9c',
      'data-uiconf': '33502051',
    }).then(bc => {
      const iframe = bc.querySelector('iframe');
      expect(iframe).to.not.be.null;
      expect(iframe.tagName).to.equal('IFRAME');
      expect(iframe.src).to.equal(
                'https://cdnapisec.kaltura.com/p/1281471/sp/128147100/embedIframeJs/uiconf_id/33502051/partner_id/1281471?iframeembed=true&playerId=kaltura_player_amp&entry_id=1_3ts1ms9c');
      expect(iframe.getAttribute('width')).to.equal('111');
      expect(iframe.getAttribute('height')).to.equal('222');
    });
  });

  it('renders responsively', () => {
    return getKaltura({
      'data-partner': '1281471',
      'data-entryid': '1_3ts1ms9c',
      'data-uiconf': '33502051',
    }, true).then(bc => {
      const iframe = bc.querySelector('iframe');
      expect(iframe).to.not.be.null;
      expect(iframe.className).to.match(/-amp-fill-content/);
    });
  });

  it('requires data-account', () => {
    return getKaltura({}).should.eventually.be.rejectedWith(
            /The data-partner attribute is required for/);
  });

  it('should pass data-param-* attributes to the iframe src', () => {
    return getKaltura({
      'data-partner': '1281471',
      'data-entryid': '1_3ts1ms9c',
      'data-uiconf': '33502051',
      'data-param-my-param': 'hello world',
    }).then(bc => {
      const iframe = bc.querySelector('iframe');
      expect(iframe.src).to.contain('flashvars%5BmyParam%5D=hello%20world');
    });
  });
});
