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

import '../amp-delight-player';

describes.realWin('amp-delight-player', {
  amp: {
    extensions: ['amp-delight-player'],
  },
}, env => {
  let win, doc;

  beforeEach(() => {
    win = env.win;
    doc = win.document;
  });

  function getDelightPlayer(attributes) {
    const delight = doc.createElement('amp-delight-player');
    for (const key in attributes) {
      delight.setAttribute(key, attributes[key]);
    }
    delight.setAttribute('width', '320');
    delight.setAttribute('height', '180');
    delight.setAttribute('layout', 'responsive');
    doc.body.appendChild(delight);

    env.win.document.body.appendChild(delight);

    delight.layoutCallback();

    return Promise.resolve(delight);
  }

  it('renders', () => {
    return allowConsoleError(() => { 
      return getDelightPlayer({
        'data-content-id': '-LKbXyaXMJ1h-4GVXhvO',
      }).then(delight => {
        const iframe = delight.querySelector('iframe');
        expect(iframe).to.not.be.null;
        expect(iframe.tagName).to.equal('IFRAME');
        expect(iframe.src).to.equal(
            'https://players.delight-vr.com/player/-LKbXyaXMJ1h-4GVXhvO');
        expect(iframe.className).to.match(/i-amphtml-fill-content/);
      });
    });
  });

  it('fails if no content is specified', () => {
    return allowConsoleError(() => { return getDelightPlayer({
      'data-content-id': '',
    }).should.eventually.be.rejectedWith(
        /The data-content-id attribute is required/);
    });
  });

  describe('createPlaceholderCallback', () => {
    it('should create a placeholder image', () => {
      return allowConsoleError(() => { 
        return getDelightPlayer({
          'data-content-id': '-LKbXyaXMJ1h-4GVXhvO',
        }).then(delight => {
          const img = delight.querySelector('amp-img');
          expect(img).to.not.be.null;
          expect(img.getAttribute('src')).to.equal(
              'https://players.d]elight-vr.com/poster/-LKbXyaXMJ1h-4GVXhvO');
          expect(img.getAttribute('layout')).to.equal('responsive');
          expect(img.hasAttribute('placeholder')).to.be.true;
          expect(img.getAttribute('alt')).to.equal('Loading video');
        });
      });
    });
  });
});
