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

import '../amp-jwplayer';


describes.realWin('amp-jwplayer', {
  amp: {
    extensions: ['amp-jwplayer'],
  },
}, env => {
  let win, doc;

  beforeEach(() => {
    win = env.win;
    doc = win.document;
  });

  function getjwplayer(attributes) {
    const jw = doc.createElement('amp-jwplayer');
    for (const key in attributes) {
      jw.setAttribute(key, attributes[key]);
    }
    jw.setAttribute('width', '320');
    jw.setAttribute('height', '180');
    jw.setAttribute('layout', 'responsive');
    doc.body.appendChild(jw);
    return jw.build().then(() => jw.layoutCallback()).then(() => jw);
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
      expect(iframe.className).to.match(/i-amphtml-fill-content/);
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

  it('fails if no media is specified', () => {
    allowConsoleError(() => { return getjwplayer({
      'data-player-id': 'sDZEo0ea',
    }).should.eventually.be.rejectedWith(
        /Either the data-media-id or the data-playlist-id attributes must be/);
    });
  });

  it('fails if no player is specified', () => {
    allowConsoleError(() => { return getjwplayer({
      'data-media-id': 'Wferorsv',
    }).should.eventually.be.rejectedWith(
        /The data-player-id attribute is required for/);
    });
  });

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

  describe('createPlaceholderCallback', () => {
    it('should create a placeholder image', () => {
      return getjwplayer({
        'data-media-id': 'Wferorsv',
        'data-player-id': 'sDZEo0ea',
      }).then(jwp => {
        const img = jwp.querySelector('amp-img');
        expect(img).to.not.be.null;
        expect(img.getAttribute('src')).to.equal(
            'https://content.jwplatform.com/thumbs/Wferorsv-720.jpg');
        expect(img.getAttribute('layout')).to.equal('fill');
        expect(img.hasAttribute('placeholder')).to.be.true;
        expect(img.getAttribute('referrerpolicy')).to.equal('origin');
        expect(img.getAttribute('alt')).to.equal('Loading video');
      });
    });
    it('should propagate aria-label to placeholder', () => {
      return getjwplayer({
        'data-media-id': 'Wferorsv',
        'data-player-id': 'sDZEo0ea',
        'aria-label': 'interesting video',
      }).then(jwp => {
        const img = jwp.querySelector('amp-img');
        expect(img).to.not.be.null;
        expect(img.getAttribute('aria-label')).to.equal('interesting video');
        expect(img.getAttribute('alt'))
            .to.equal('Loading video - interesting video');
      });
    });
    it('should not create a placeholder for playlists', () => {
      return getjwplayer({
        'data-playlist-id': 'Wferorsv',
        'data-player-id': 'sDZEo0ea',
      }).then(jwp => {
        const img = jwp.querySelector('amp-img');
        expect(img).to.be.null;
      });
    });
  });
});
