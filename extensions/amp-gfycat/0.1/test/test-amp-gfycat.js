
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

import '../amp-gfycat';
import {VideoEvents} from '../../../../src/video-interface';
import {listenOncePromise} from '../../../../src/event-helper';

describes.realWin('amp-gfycat', {
  amp: {
    extensions: ['amp-gfycat'],
  },
}, env => {
  let win, doc;

  beforeEach(() => {
    win = env.win;
    doc = win.document;
  });

  function getGfycat(gfyId, opt_params) {
    const gfycat = doc.createElement('amp-gfycat');
    gfycat.setAttribute('data-gfyid', gfyId);
    gfycat.setAttribute('width', 640);
    gfycat.setAttribute('height', 640);
    if (opt_params && opt_params.withAlt) {
      gfycat.setAttribute('alt', 'test alt label');
    }
    if (opt_params && opt_params.withAria) {
      gfycat.setAttribute('aria-label', 'test aria label');
    }
    if (opt_params && opt_params.responsive) {
      gfycat.setAttribute('layout', 'responsive');
    }
    if (opt_params && opt_params.noautoplay) {
      gfycat.setAttribute('noautoplay', '');
    }
    doc.body.appendChild(gfycat);
    return gfycat.build().then(() => {
      return gfycat.layoutCallback();
    }).then(() => gfycat);
  }

  it('renders', () => {
    return getGfycat('LeanMediocreBeardeddragon').then(gfycat => {
      const iframe = gfycat.querySelector('iframe');
      expect(iframe).to.not.be.null;
      expect(iframe.tagName).to.equal('IFRAME');
      expect(iframe.src).to.equal('https://gfycat.com/ifr/LeanMediocreBeardeddragon');
    });
  });

  it('renders responsively', () => {
    return getGfycat('LeanMediocreBeardeddragon', {
      responsive: true,
    }).then(gfycat => {
      const iframe = gfycat.querySelector('iframe');
      expect(iframe).to.not.be.null;
      expect(iframe.className).to.match(/i-amphtml-fill-content/);
    });
  });
  it('noautoplay', () => {
    return getGfycat('LeanMediocreBeardeddragon', {
      noautoplay: true,
    }).then(gfycat => {
      const iframe = gfycat.querySelector('iframe');
      expect(iframe).to.not.be.null;
      expect(iframe.src)
          .to.equal('https://gfycat.com/ifr/LeanMediocreBeardeddragon?autoplay=0');
    });
  });

  it('should forward events from gfycat player to the amp element', () => {
    return getGfycat('LeanMediocreBeardeddragon').then(gfycat => {
      const iframe = gfycat.querySelector('iframe');
      return Promise.resolve()
          .then(() => {
            const p = listenOncePromise(gfycat, VideoEvents.PLAYING);
            sendFakeMessage(gfycat, iframe, 'playing');
            return p;
          })
          .then(() => {
            const p = listenOncePromise(gfycat, VideoEvents.PAUSE);
            sendFakeMessage(gfycat, iframe, 'paused');
            return p;
          });
    });
  });

  function sendFakeMessage(gfycat, iframe, command) {
    gfycat.implementation_.handleGfycatMessages_({
      origin: 'https://gfycat.com',
      source: iframe.contentWindow,
      data: command,
    });
  }

  it('requires data-gfyid', () => {
    return getGfycat('').should.eventually.be.rejectedWith(
        /The data-gfyid attribute is required for/);
  });

  it('renders placeholder with an alt', () => {
      return getGfycat('LeanMediocreBeardeddragon', {
          withAlt: true,
      }).then(gfycat => {
          const placeHolder = gfycat.querySelector('amp-img');
          expect(placeHolder).to.not.be.null;
          expect(placeHolder.getAttribute('alt')).to.equal("Loading gif test alt label");
      });
  });
  it('renders placeholder with an aria-label', () => {
      return getGfycat('LeanMediocreBeardeddragon', {
          withAria: true,
      }).then(gfycat => {
          const placeHolder = gfycat.querySelector('amp-img');
          expect(placeHolder).to.not.be.null;
          expect(placeHolder.getAttribute('alt')).to.equal("Loading gif test aria label");
      });
  });
});
