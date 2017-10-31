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

import '../amp-springboard-player';


describes.realWin('amp-springboard-player', {
  amp: {
    extensions: ['amp-springboard-player'],
  },
}, env => {
  let win, doc;

  beforeEach(() => {
    win = env.win;
    doc = win.document;
  });

  function getSpringboardPlayer(attributes) {
    const sp = doc.createElement('amp-springboard-player');
    for (const key in attributes) {
      sp.setAttribute(key, attributes[key]);
    }
    sp.setAttribute('width', '480');
    sp.setAttribute('height', '270');
    sp.setAttribute('layout', 'responsive');
    doc.body.appendChild(sp);
    return sp.build().then(() => sp.layoutCallback()).then(() => sp);
  }

  it('renders', () => {
    return getSpringboardPlayer({
      'data-site-id': '261',
      'data-mode': 'video',
      'data-content-id': '1578473',
      'data-player-id': 'test401',
      'data-domain': 'test.com',
      'data-items': '10',
    }).then(bc => {
      const iframe = bc.querySelector('iframe');
      expect(iframe).to.not.be.null;
      expect(iframe.tagName).to.equal('IFRAME');
      expect(iframe.src).to.equal('https://cms.springboardplatform.com/' +
          'embed_iframe/261/video/1578473/test401/test.com/10');
    });
  });

  it('renders responsively', () => {
    return getSpringboardPlayer({
      'data-site-id': '261',
      'data-mode': 'video',
      'data-content-id': '1578473',
      'data-player-id': 'test401',
      'data-domain': 'test.com',
      'data-items': '10',
    }).then(bc => {
      const iframe = bc.querySelector('iframe');
      expect(iframe).to.not.be.null;
      expect(iframe.className).to.match(/i-amphtml-fill-content/);
    });
  });

  it('requires data-site-id', () => {
    return getSpringboardPlayer({
      'data-mode': 'video',
      'data-content-id': '1578473',
      'data-player-id': 'test401',
      'data-domain': 'test.com',
      'data-items': '10',
    }).should.eventually.be
        .rejectedWith(/The data-site-id attribute is required for/);
  });

  it('requires data-mode', () => {
    return getSpringboardPlayer({
      'data-site-id': '261',
      'data-content-id': '1578473',
      'data-player-id': 'test401',
      'data-domain': 'test.com',
      'data-items': '10',
    }).should.eventually.be
        .rejectedWith(/The data-mode attribute is required for/);
  });

  it('requires data-content-id', () => {
    return getSpringboardPlayer({
      'data-mode': 'video',
      'data-site-id': '261',
      'data-player-id': 'test401',
      'data-domain': 'test.com',
      'data-items': '10',
    }).should.eventually.be
        .rejectedWith(/The data-content-id attribute is required for/);
  });

  it('requires data-player-id', () => {
    return getSpringboardPlayer({
      'data-mode': 'video',
      'data-site-id': '261',
      'data-content-id': '1578473',
      'data-domain': 'test.com',
      'data-items': '10',
    }).should.eventually.be
        .rejectedWith(/The data-player-id attribute is required for/);
  });

  it('requires data-domain', () => {
    return getSpringboardPlayer({
      'data-mode': 'video',
      'data-site-id': '261',
      'data-content-id': '1578473',
      'data-player-id': 'test401',
      'data-items': '10',
    }).should.eventually.be
        .rejectedWith(/The data-domain attribute is required for/);
  });

  describe('createPlaceholderCallback', () => {
    it('should create a placeholder image', () => {
      return getSpringboardPlayer({
        'data-site-id': '261',
        'data-mode': 'video',
        'data-content-id': '1578473',
        'data-player-id': 'test401',
        'data-domain': 'test.com',
        'data-items': '10',
      }).then(kp => {
        const img = kp.querySelector('amp-img');
        expect(img).to.not.be.null;
        expect(img.getAttribute('src')).to.equal(
            'https://www.springboardplatform.com/storage/test.com' +
            '/snapshots/1578473.jpg');
        expect(img.getAttribute('layout')).to.equal('fill');
        expect(img.hasAttribute('placeholder')).to.be.true;
        expect(img.getAttribute('referrerpolicy')).to.equal('origin');
      });
    });

    it('should use default snapshot for playlist image', () => {
      return getSpringboardPlayer({
        'data-site-id': '261',
        'data-mode': 'playlist',
        'data-content-id': '1578473',
        'data-player-id': 'test401',
        'data-domain': 'test.com',
        'data-items': '10',
      }).then(kp => {
        const img = kp.querySelector('amp-img');
        expect(img).to.not.be.null;
        expect(img.getAttribute('src')).to.equal(
            'https://www.springboardplatform.com/storage/default/' +
            'snapshots/default_snapshot.png');
        expect(img.getAttribute('layout')).to.equal('fill');
        expect(img.hasAttribute('placeholder')).to.be.true;
        expect(img.getAttribute('referrerpolicy')).to.equal('origin');
      });
    });
  });
});
