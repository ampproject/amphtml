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
import '../amp-jwplayer';
import {adopt} from '../../../../src/runtime';

adopt(window);

describe('amp-jwplayer', () => {

  function getjwplayer(attributes) {
    return createIframePromise().then(iframe => {
      doNotLoadExternalResourcesInTest(iframe.win);
      const jw = iframe.doc.createElement('amp-jwplayer');
      for (const key in attributes) {
        jw.setAttribute(key, attributes[key]);
      }
      jw.setAttribute('width', '320');
      jw.setAttribute('height', '180');
      jw.setAttribute('layout', 'responsive');
      iframe.doc.body.appendChild(jw);
      jw.implementation_.layoutCallback();
      return jw;
    });
  }

  it('renders', () => {
    return getjwplayer({
      'data-media-id': 'Wferorsv',
      'data-player-id': 'sDZEo0ea',
    }).then(jw => {
      const iframe = jw.querySelector('iframe');
      expect(iframe).to.not.be.null;
      expect(iframe.tagName).to.equal('IFRAME');
      expect(iframe.src).to.equal(
          'https://content.jwplatform.com/players/Wferorsv-sDZEo0ea.html');
      expect(iframe.getAttribute('width')).to.equal('320');
      expect(iframe.getAttribute('height')).to.equal('180');
    });
  });

  it('renders with a playlist', () => {
    return getjwplayer({
      'data-playlist-id': '482jsTAr',
      'data-player-id': 'sDZEo0ea',
    }).then(jw => {
      const iframe = jw.querySelector('iframe');
      expect(iframe).to.not.be.null;
      expect(iframe.tagName).to.equal('IFRAME');
      expect(iframe.src).to.equal(
          'https://content.jwplatform.com/players/482jsTAr-sDZEo0ea.html');
    });
  });

  // These tests fail if the corresponding errors occur in buildCallback instead of
  // layoutCallback.  Commenting them out for now.
  /*
  it('fails if no media is specified', () => {
    return getjwplayer({
      'data-player-id': 'sDZEo0ea',
    }).should.eventually.be.rejectedWith(
      /Either the data-media-id or the data-playlist-id attributes must be/
    );
  });

  it('fails if no player is specified', () => {
    return getjwplayer({
      'data-media-id': 'Wferorsv',
    }).should.eventually.be.rejectedWith(
      /The data-player-id attribute is required for/
    );
  });
  */

  it('renders with a bad playlist', () => {
    return getjwplayer({
      'data-playlist-id': 'zzz',
      'data-player-id': 'sDZEo0ea',
    }).then(jw => {
      const iframe = jw.querySelector('iframe');
      expect(iframe).to.not.be.null;
      expect(iframe.tagName).to.equal('IFRAME');
      expect(iframe.src).to.equal(
          'https://content.jwplatform.com/players/zzz-sDZEo0ea.html');
    });
  });

});
