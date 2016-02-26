/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
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

import {createIframePromise} from '../../../../testing/iframe';
require('../amp-brightcove');
import {adopt} from '../../../../src/runtime';
import {parseUrl} from '../../../../src/url';

adopt(window);

describe('amp-brightcove', () => {

  function getBrightcove(attributes, opt_responsive) {
    return createIframePromise().then(iframe => {
      const bc = iframe.doc.createElement('amp-brightcove');
      for (const key in attributes) {
        bc.setAttribute(key, attributes[key]);
      }
      bc.setAttribute('width', '111');
      bc.setAttribute('height', '222');
      if (opt_responsive) {
        bc.setAttribute('layout', 'responsive');
      }
      iframe.doc.body.appendChild(bc);
      bc.implementation_.layoutCallback();
      return bc;
    });
  }

  it('renders', () => {
    return getBrightcove({
      'data-account': '906043040001',
      'data-video-id': 'ref:ampdemo'
    }).then(bc => {
      const iframe = bc.querySelector('iframe');
      expect(iframe).to.not.be.null;
      expect(iframe.tagName).to.equal('IFRAME');
      expect(iframe.src).to.equal(
          'https://players.brightcove.net/906043040001/default_default/index.html?videoId=ref:ampdemo');
      expect(iframe.getAttribute('width')).to.equal('111');
      expect(iframe.getAttribute('height')).to.equal('222');
    });
  });

  it('renders responsively', () => {
    return getBrightcove({
      'data-account': '906043040001',
      'data-video-id': 'ref:ampdemo'
    }, true).then(bc => {
      const iframe = bc.querySelector('iframe');
      expect(iframe).to.not.be.null;
      expect(iframe.className).to.match(/-amp-fill-content/);
    });
  });

  it('requires data-account', () => {
    return getBrightcove({}).should.eventually.be.rejectedWith(
        /The data-account attribute is required for/);
  });

  // TODO(erwinm) unskip this when we figure out why it fails on travis
  it.skip('should pass data-param-* attributes to the iframe src', () => {
    return getBrightcove({
      'data-account': '906043040001',
      'data-video-id': 'ref:ampdemo',
      'data-param-my-param': 'hello world'
    }).then(bc => {
      const iframe = bc.querySelector('iframe');
      const params = parseUrl(iframe.src).search.split('&');
      expect(params).to.contain('myParam=hello%20world');
    });
  });
});
