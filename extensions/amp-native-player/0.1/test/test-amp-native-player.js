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

import '../amp-native-player';
import { Services } from '#service';
import { VideoEvents } from '../../../../src/video-interface';
import { listenOncePromise } from '../../../../src/event-helper';

describes.realWin(
  'amp-native-player',
  {
    amp: {
      extensions: ['amp-native-player'],
    },
  },
  (env) => {
    let win, doc;
    let timer;

    beforeEach(() => {
      win = env.win;
      doc = win.document;
      timer = Services.timerFor(win);
    });

    function getNativePlayer(attributes, opt_responsive) {
      const bc = doc.createElement('amp-native-player');

      for (const key in attributes) {
        bc.setAttribute(key, attributes[key]);
      }
      bc.setAttribute('width', '640');
      bc.setAttribute('height', '360');
      if (opt_responsive) {
        bc.setAttribute('layout', 'responsive');
      }

      // see yt test implementation
      timer
        .promise(50)
        .then(() => bc.getImpl())
        .then((impl) => {
          const nativeTimerIframe = bc.querySelector('iframe');

          impl.handleNativeMessage_({
            origin: 'https://services.target-video.com',
            source: nativeTimerIframe.contentWindow,
            data: 'Native|0|trigger|ready',
          });
        });
      doc.body.appendChild(bc);
      return bc
        .buildInternal()
        .then(() => {
          bc.layoutCallback();
        })
        .then(() => bc);
    }

    it('renders', () => {
      return getNativePlayer({
        'data-partner': '264',
        'data-player': '4144',
        'data-video': '13663',
      }).then((bc) => {
        const iframe = bc.querySelector('iframe');
        expect(iframe).to.not.be.null;
        expect(iframe.tagName).to.equal('IFRAME');
        expect(iframe.src).to.equal(
          'https://services.target-video.com/services/iframe/video/13663/264/4144/0/1/?amp=1'
        );
      });
    });

    it('renders responsively', () => {
      return getNativePlayer(
        {
          'data-partner': '1177',
          'data-player': '979',
          'data-video': '5204',
        },
        true
      ).then((bc) => {
        const iframe = bc.querySelector('iframe');
        expect(iframe).to.not.be.null;
        expect(iframe.className).to.match(/i-amphtml-fill-content/);
      });
    });

    it('requires data-partner', () => {
      return allowConsoleError(() => {
        return getNativePlayer({
          'data-player': '4144',
          'data-video': '13663',
        }).should.eventually.be.rejectedWith(
          /The data-partner attribute is required for/
        );
      });
    });

    it('requires data-player', () => {
      return allowConsoleError(() => {
        return getNativePlayer({
          'data-partner': '264',
          'data-video': '13663',
        }).should.eventually.be.rejectedWith(
          /The data-player attribute is required for/
        );
      });
    });

    it('requires data-partner for playlists', () => {
      return allowConsoleError(() => {
        return getNativePlayer({
          'data-player': '4144',
          'data-playlist': '13663',
        }).should.eventually.be.rejectedWith(
          /The data-partner attribute is required for/
        );
      });
    });

    it('requires data-player for playlists', () => {
      return allowConsoleError(() => {
        return getNativePlayer({
          'data-partner': '264',
          'data-playlist': '13663',
        }).should.eventually.be.rejectedWith(
          /The data-player attribute is required for/
        );
      });
    });

    it('requires data-partner for carousels', () => {
      return allowConsoleError(() => {
        return getNativePlayer({
          'data-player': '4144',
          'data-carousel': '459',
        }).should.eventually.be.rejectedWith(
          /The data-partner attribute is required for/
        );
      });
    });

    it('requires data-player for carousels', () => {
      return allowConsoleError(() => {
        return getNativePlayer({
          'data-partner': '264',
          'data-carousel': '459',
        }).should.eventually.be.rejectedWith(
          /The data-player attribute is required for/
        );
      });
    });

    it('should forward events from native-player to the amp element', async () => {
      const bc = await getNativePlayer(
        {
          'data-partner': '1177',
          'data-player': '979',
          'data-video': '5204',
        },
        true
      );
      const impl = await bc.getImpl();

      const iframe = bc.querySelector('iframe');
      return Promise.resolve()
        .then(() => {
          const p = listenOncePromise(bc, VideoEvents.PLAYING);
          sendFakeMessage(impl, iframe, 'trigger|play');
          return p;
        })
        .then(() => {
          const p = listenOncePromise(bc, VideoEvents.MUTED);
          sendFakeMessage(impl, iframe, 'volume|0');
          return p;
        })
        .then(() => {
          const p = listenOncePromise(bc, VideoEvents.PAUSE);
          sendFakeMessage(impl, iframe, 'trigger|pause');
          return p;
        })
        .then(() => {
          const p = listenOncePromise(bc, VideoEvents.UNMUTED);
          sendFakeMessage(impl, iframe, 'volume|1');
          return p;
        });
    });

    function sendFakeMessage(impl, iframe, command) {
      impl.handleNativeMessage_({
        origin: 'https://services.target-video.com',
        source: iframe.contentWindow,
        data: 'Native|0|' + command,
      });
    }

    describe('createPlaceholderCallback', () => {
      it('should create a placeholder image', () => {
        return getNativePlayer({
          'data-partner': '264',
          'data-player': '979',
          'data-video': '13663',
        }).then((native) => {
          const img = native.querySelector('img');
          expect(img).to.not.be.null;
          expect(img.getAttribute('src')).to.equal(
            'https://cdn.target-video.com/live/partners/264/snapshot/13663.jpg'
          );
          expect(img).to.have.class('i-amphtml-fill-content');
          expect(img).to.have.attribute('placeholder');
          expect(img.getAttribute('alt')).to.equal('Loading video');
          expect(img.getAttribute('referrerpolicy')).to.equal('origin');
        });
      });
      it('should propagate aria label for placeholder image', () => {
        return getNativePlayer({
          'data-partner': '264',
          'data-player': '979',
          'data-video': '13663',
          'aria-label': 'great video',
        }).then((native) => {
          const img = native.querySelector('img');
          expect(img).to.not.be.null;
          expect(img.getAttribute('alt')).to.equal(
            'Loading video - great video'
          );
        });
      });
    });
  }
);
