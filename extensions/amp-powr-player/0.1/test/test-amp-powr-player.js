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

import '../amp-powr-player';
import {VideoEvents} from '../../../../src/video-interface';
import {listenOncePromise} from '../../../../src/event-helper';
import {parseUrlDeprecated} from '../../../../src/url';

describes.realWin(
  'amp-powr-player',
  {
    amp: {
      extensions: ['amp-powr-player'],
    },
  },
  (env) => {
    let win, doc;

    beforeEach(() => {
      win = env.win;
      doc = win.document;
    });

    function getPowrPlayer(attributes, opt_responsive) {
      const bc = doc.createElement('amp-powr-player');
      for (const key in attributes) {
        bc.setAttribute(key, attributes[key]);
      }
      bc.setAttribute('width', '111');
      bc.setAttribute('height', '222');
      if (opt_responsive) {
        bc.setAttribute('layout', 'responsive');
      }
      doc.body.appendChild(bc);
      return bc
        .build()
        .then(() => {
          bc.implementation_.playerReadyResolver_(bc.implementation_.iframe_);
          return bc.layoutCallback();
        })
        .then(() => bc);
    }

    function fakePostMessage(bc, info) {
      bc.implementation_.handlePlayerMessage_({
        origin: 'https://player.powr.com',
        source: bc.querySelector('iframe').contentWindow,
        data: JSON.stringify(info),
      });
    }

    it('renders', () => {
      return getPowrPlayer({
        'data-account': '945',
        'data-player': '1',
        'data-video': 'amp-test-video',
      }).then((bc) => {
        const iframe = bc.querySelector('iframe');
        expect(iframe).to.not.be.null;
        expect(iframe.tagName).to.equal('IFRAME');
        expect(iframe.src).to.equal(
          'https://player.powr.com/iframe.html?account=945&player=1&' +
            'video=amp-test-video&playsinline=true'
        );
      });
    });

    it('renders responsively', () => {
      return getPowrPlayer(
        {
          'data-account': '945',
          'data-player': '1',
          'data-video': 'amp-test-video',
        },
        true
      ).then((bc) => {
        const iframe = bc.querySelector('iframe');
        expect(iframe).to.not.be.null;
        expect(iframe.className).to.match(/i-amphtml-fill-content/);
      });
    });

    it('requires data-account', () => {
      expectAsyncConsoleError(/The data-account attribute is required for/, 1);
      return getPowrPlayer({}).should.eventually.be.rejectedWith(
        /The data-account attribute is required for/
      );
    });

    it('requires data-player', () => {
      expectAsyncConsoleError(/The data-player attribute is required for/, 1);
      return getPowrPlayer({
        'data-account': '945',
      }).should.eventually.be.rejectedWith(
        /The data-player attribute is required for/
      );
    });

    it('removes iframe after unlayoutCallback', () => {
      return getPowrPlayer(
        {
          'data-account': '945',
          'data-player': '1',
          'data-video': 'amp-test-video',
        },
        true
      ).then((bc) => {
        const iframe = bc.querySelector('iframe');
        expect(iframe).to.not.be.null;
        const obj = bc.implementation_;
        obj.unlayoutCallback();
        expect(bc.querySelector('iframe')).to.be.null;
        expect(obj.iframe_).to.be.null;
      });
    });

    it('should pass data-param-* attributes to the iframe src', () => {
      return getPowrPlayer({
        'data-account': '945',
        'data-player': '1',
        'data-video': 'amp-test-video',
        'data-param-foo': 'bar',
      }).then((bc) => {
        const iframe = bc.querySelector('iframe');
        const params = parseUrlDeprecated(iframe.src).search.split('&');
        expect(params).to.contain('foo=bar');
      });
    });

    it('should propagate mutated attributes', () => {
      return getPowrPlayer({
        'data-account': '945',
        'data-player': '1',
        'data-video': 'ZNImchutXk',
      }).then((bc) => {
        const iframe = bc.querySelector('iframe');

        expect(iframe.src).to.equal(
          'https://player.powr.com/iframe.html?account=945&player=1&' +
            'video=ZNImchutXk&playsinline=true'
        );

        bc.setAttribute('data-account', '945');
        bc.setAttribute('data-player', '1');
        bc.setAttribute('data-video', 'ZNImchutXk');
        bc.mutatedAttributesCallback({
          'data-account': '945',
          'data-player': '1',
          'data-video': 'ZNImchutXk',
        });

        expect(iframe.src).to.equal(
          'https://player.powr.com/iframe.html?account=945&player=1&' +
            'video=ZNImchutXk&playsinline=true'
        );
      });
    });

    it('should pass referrer', () => {
      return getPowrPlayer({
        'data-account': '945',
        'data-player': '1',
        'data-video': 'ZNImchutXk',
        'data-referrer': 'COUNTER',
      }).then((bc) => {
        const iframe = bc.querySelector('iframe');

        expect(iframe.src).to.contain('referrer=1');
      });
    });

    it('should force playsinline', () => {
      return getPowrPlayer({
        'data-account': '945',
        'data-player': '1',
        'data-video': 'ZNImchutXk',
        'data-param-playsinline': 'false',
      }).then((bc) => {
        const iframe = bc.querySelector('iframe');

        expect(iframe.src).to.contain('playsinline=true');
      });
    });

    it('should forward events', () => {
      return getPowrPlayer({
        'data-account': '945',
        'data-player': '1',
        'data-video': 'ZNImchutXk',
      }).then((bc) => {
        return Promise.resolve()
          .then(() => {
            const p = listenOncePromise(bc, VideoEvents.LOAD);
            fakePostMessage(bc, {event: 'ready', muted: false, playing: false});
            return p;
          })
          .then(() => {
            const p = listenOncePromise(bc, VideoEvents.AD_START);
            fakePostMessage(bc, {
              event: 'ads-ad-started',
              muted: false,
              playing: false,
            });
            return p;
          })
          .then(() => {
            const p = listenOncePromise(bc, VideoEvents.AD_END);
            fakePostMessage(bc, {
              event: 'ads-ad-ended',
              muted: false,
              playing: false,
            });
            return p;
          })
          .then(() => {
            const p = listenOncePromise(bc, VideoEvents.PLAYING);
            fakePostMessage(bc, {
              event: 'playing',
              muted: false,
              playing: true,
            });
            return p;
          })
          .then(() => {
            const p = listenOncePromise(bc, VideoEvents.MUTED);
            fakePostMessage(bc, {
              event: 'volumechange',
              muted: true,
              playing: true,
            });
            return p;
          })
          .then(() => {
            const p = listenOncePromise(bc, VideoEvents.UNMUTED);
            fakePostMessage(bc, {
              event: 'volumechange',
              muted: false,
              playing: true,
            });
            return p;
          })
          .then(() => {
            const p = listenOncePromise(bc, VideoEvents.PAUSE);
            fakePostMessage(bc, {event: 'pause', muted: false, playing: false});
            return p;
          })
          .then(() => {
            const p = listenOncePromise(bc, VideoEvents.ENDED);
            fakePostMessage(bc, {event: 'ended', muted: false, playing: false});
            return p;
          });
      });
    });
  }
);
