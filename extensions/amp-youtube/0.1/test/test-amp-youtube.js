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

import '../amp-youtube';
import * as sinon from 'sinon';
import {Services} from '../../../../src/services';
import {VideoEvents} from '../../../../src/video-interface';
import {listenOncePromise} from '../../../../src/event-helper';

const EXAMPLE_VIDEOID = 'mGENRKrdoGY';
const EXAMPLE_LIVE_CHANNELID = 'UCB8Kb4pxYzsDsHxzBfnid4Q';
const EXAMPLE_VIDEOID_URL = `https://www.youtube.com/embed/${EXAMPLE_VIDEOID}?enablejsapi=1&playsinline=1`;
const EXAMPLE_LIVE_CHANNELID_URL = `https://www.youtube.com/embed/live_stream?channel=${EXAMPLE_LIVE_CHANNELID}&enablejsapi=1&playsinline=1`;
const EXAMPLE_NO_COOKIE_VIDEOID_URL = `https://www.youtube-nocookie.com/embed/${EXAMPLE_VIDEOID}?enablejsapi=1&playsinline=1`;

describes.realWin('amp-youtube', {
  amp: {
    extensions: ['amp-youtube'],
  },
}, function(env) {
  this.timeout(5000);
  let win, doc;
  let timer;

  beforeEach(() => {
    win = env.win;
    doc = win.document;
    timer = Services.timerFor(win);
  });

  function getYt(attributes, opt_responsive, opt_beforeLayoutCallback) {
    const yt = doc.createElement('amp-youtube');
    for (const key in attributes) {
      yt.setAttribute(key, attributes[key]);
    }
    yt.setAttribute('width', '111');
    yt.setAttribute('height', '222');
    if (opt_responsive) {
      yt.setAttribute('layout', 'responsive');
    }
    doc.body.appendChild(yt);
    return yt.build().then(() => {
      if (opt_beforeLayoutCallback) {
        opt_beforeLayoutCallback(yt);
      }
      return yt.layoutCallback();
    }).then(() => {
      const ytIframe = yt.querySelector('iframe');
      yt.implementation_.handleYoutubeMessages_({
        origin: 'https://www.youtube.com',
        source: ytIframe.contentWindow,
        data: JSON.stringify({event: 'onReady'}),
      });
    }).then(() => yt);
  }

  describe('with data-videoid', function() {
    runTestsForDatasource(EXAMPLE_VIDEOID);
  });

  describe('with data-live-channelid', function() {
    runTestsForDatasource(EXAMPLE_LIVE_CHANNELID);
  });

  /**
   * This function runs generic tests for components based on
   * data-videoid or data-live-channelid.
   * @param {string} datasource
   */
  function runTestsForDatasource(datasource) {
    it('renders responsively', () => {
      return getYt({'data-videoid': datasource}, true).then(yt => {
        const iframe = yt.querySelector('iframe');
        expect(iframe).to.not.be.null;
        expect(iframe.className).to.match(/i-amphtml-fill-content/);
      });
    });

    it('monitors the YouTube player state', () => {
      return getYt({'data-videoid': datasource}).then(yt => {
        const iframe = yt.querySelector('iframe');
        expect(iframe).to.not.be.null;

        expect(yt.implementation_.playerState_).to.equal(-1);

        sendFakeInfoDeliveryMessage(yt, iframe, {playerState: 1});

        expect(yt.implementation_.playerState_).to.equal(1);

        // YouTube Player sometimes sends parsed-JSON data. Test that we're
        // handling it correctly.
        yt.implementation_.handleYoutubeMessages_({
          origin: 'https://www.youtube.com',
          source: iframe.contentWindow,
          data: {
            event: 'infoDelivery',
            info: {playerState: 2},
          },
        });

        expect(yt.implementation_.playerState_).to.equal(2);
      });

    });

    it('should not pause when video not playing', () => {
      return getYt({'data-videoid': datasource}).then(yt => {
        sandbox.spy(yt.implementation_, 'pause');
        yt.implementation_.pauseCallback();
        expect(yt.implementation_.pause.called).to.be.false;
      });

    });

    it('should pause if the video is playing', () => {
      return getYt({'data-videoid': datasource}).then(yt => {
        yt.implementation_.playerState_ = 1;
        sandbox.spy(yt.implementation_, 'pause');
        yt.implementation_.pauseCallback();
        expect(yt.implementation_.pause.called).to.be.true;
      });
    });

    it('should pass data-param-* attributes to the iframe src', () => {
      return getYt({
        'data-videoid': datasource,
        'data-param-autoplay': '1',
        'data-param-my-param': 'hello world',
      }).then(yt => {
        const iframe = yt.querySelector('iframe');
        expect(iframe.src).to.contain('myParam=hello%20world');
        // data-param-autoplay is black listed in favour of just autoplay
        expect(iframe.src).to.not.contain('autoplay=1');
        // playsinline should default to 1 if not provided.
        expect(iframe.src).to.contain('playsinline=1');
      });
    });

    it('should change defaults for some data-param-* when autoplaying', () => {
      return getYt({
        'autoplay': '',
        'data-videoid': datasource,
        'data-param-playsinline': '0',
      }).then(yt => {
        const iframe = yt.querySelector('iframe');
        // playsinline must be set 1 even if specified as 0
        expect(iframe.src).to.contain('playsinline=1');
        // annotation policy should default to 3 if not specified.
        expect(iframe.src).to.contain('iv_load_policy=3');
      });
    });

    it('should preload the final url', () => {
      return getYt({
        'autoplay': '',
        'data-videoid': datasource,
        'data-param-playsinline': '0',
      }).then(yt => {
        const src = yt.querySelector('iframe').src;
        const preloadSpy = sandbox.spy(yt.implementation_.preconnect, 'url');
        yt.implementation_.preconnectCallback();
        preloadSpy.should.have.been.calledWithExactly(src);
      });
    });

    it('should forward certain events from youtube to the amp element', () => {
      return getYt({'data-videoid': datasource}).then(yt => {
        const iframe = yt.querySelector('iframe');

        return Promise.resolve()
            .then(() => {
              const p = listenOncePromise(yt, VideoEvents.MUTED);
              sendFakeInfoDeliveryMessage(yt, iframe, {muted: true});
              return p;
            })
            .then(() => {
              const p = listenOncePromise(yt, VideoEvents.PLAYING);
              sendFakeInfoDeliveryMessage(yt, iframe, {playerState: 1});
              return p;
            })
            .then(() => {
              const p = listenOncePromise(yt, VideoEvents.PAUSE);
              sendFakeInfoDeliveryMessage(yt, iframe, {playerState: 2});
              return p;
            })
            .then(() => {
              const p = listenOncePromise(yt, VideoEvents.UNMUTED);
              sendFakeInfoDeliveryMessage(yt, iframe, {muted: false});
              return p;
            }).then(() => {
              // Should not send the unmute event twice if already sent once.
              const p = listenOncePromise(yt, VideoEvents.UNMUTED).then(() => {
                assert.fail('Should not have dispatch unmute message twice');
              });
              sendFakeInfoDeliveryMessage(yt, iframe, {muted: false});
              const successTimeout = timer.promise(10);
              return Promise.race([p, successTimeout]);
            }).then(() => {
              // Make sure pause and end are triggered when video ends.
              const pEnded = listenOncePromise(yt, VideoEvents.ENDED);
              const pPause = listenOncePromise(yt, VideoEvents.PAUSE);
              sendFakeInfoDeliveryMessage(yt, iframe, {playerState: 0});
              return Promise.all([pEnded, pPause]);
            });
      });
    });
  }

  it('renders for video ids', () => {
    return getYt({'data-videoid': EXAMPLE_VIDEOID}).then(yt => {
      const iframe = yt.querySelector('iframe');
      expect(iframe).to.not.be.null;
      expect(iframe.tagName).to.equal('IFRAME');
      expect(iframe.src).to.equal(EXAMPLE_VIDEOID_URL);
    });
  });

  it('renders for live channel ids', () => {
    return getYt({'data-live-channelid': EXAMPLE_LIVE_CHANNELID})
        .then(yt => {
          const iframe = yt.querySelector('iframe');
          expect(iframe).to.not.be.null;
          expect(iframe.tagName).to.equal('IFRAME');
          expect(iframe.src).to.equal(EXAMPLE_LIVE_CHANNELID_URL);
        });
  });

  it('uses privacy-enhanced mode', () => {
    return getYt({'data-videoid': EXAMPLE_VIDEOID, 'credentials': 'omit'})
        .then(yt => {
          const iframe = yt.querySelector('iframe');
          expect(iframe).to.not.be.null;
          expect(iframe.tagName).to.equal('IFRAME');
          expect(iframe.src).to.equal(EXAMPLE_NO_COOKIE_VIDEOID_URL);
        });
  });

  it('requires data-videoid or data-live-channelid', () => {
    return getYt({}).should.eventually.be.rejectedWith(
        /Exactly one of data-videoid or data-live-channelid should/);
  });

  it('adds an img placeholder in prerender mode if source is videoid', () => {
    return getYt({'data-videoid': EXAMPLE_VIDEOID}, true, function(yt) {
      const iframe = yt.querySelector('iframe');
      expect(iframe).to.be.null;

      const imgPlaceholder = yt.querySelector('img[placeholder]');
      expect(imgPlaceholder).to.not.be.null;
      expect(imgPlaceholder.className).to.not.match(/amp-hidden/);
      expect(imgPlaceholder.src).to.be.equal(
          `https://i.ytimg.com/vi/${EXAMPLE_VIDEOID}/sddefault.jpg#404_is_fine`);
      expect(imgPlaceholder.getAttribute('referrerpolicy')).to.equal('origin');
    }).then(yt => {
      const iframe = yt.querySelector('iframe');
      expect(iframe).to.not.be.null;

      const imgPlaceholder = yt.querySelector('img[placeholder]');
      expect(imgPlaceholder.className).to.match(/amp-hidden/);
    });
  });

  it('loads only sddefault when it exists if source is videoid', () => {
    return getYt({'data-videoid': EXAMPLE_VIDEOID}, true, function(yt) {
      const iframe = yt.querySelector('iframe');
      expect(iframe).to.be.null;

      const imgPlaceholder = yt.querySelector('img[placeholder]');
      expect(imgPlaceholder).to.not.be.null;
      expect(imgPlaceholder.className).to.not.match(/amp-hidden/);
      expect(imgPlaceholder.getAttribute('referrerpolicy')).to.equal('origin');
    }).then(yt => {
      const iframe = yt.querySelector('iframe');
      expect(iframe).to.not.be.null;

      const imgPlaceholder = yt.querySelector('img[placeholder]');
      expect(imgPlaceholder.className).to.match(/amp-hidden/);
      expect(imgPlaceholder.getAttribute('referrerpolicy')).to.equal('origin');

      expect(imgPlaceholder.src).to.equal(
          'https://i.ytimg.com/vi/mGENRKrdoGY/sddefault.jpg#404_is_fine');
    });
  });

  it('loads hqdefault thumbnail source when sddefault fails', () => {
    return getYt({'data-videoid': 'FAKE'}, true, function(yt) {
      const iframe = yt.querySelector('iframe');
      expect(iframe).to.be.null;

      const imgPlaceholder = yt.querySelector('img[placeholder]');
      expect(imgPlaceholder).to.not.be.null;
      expect(imgPlaceholder.className).to.not.match(/amp-hidden/);

      // Fake out the 404 image response dimensions of YT.
      Object.defineProperty(imgPlaceholder, 'naturalWidth', {
        get() {
          return 120;
        },
      });
      Object.defineProperty(imgPlaceholder, 'naturalHeight', {
        get() {
          return 90;
        },
      });
      imgPlaceholder.triggerLoad();
    }).then(yt => {
      const iframe = yt.querySelector('iframe');
      expect(iframe).to.not.be.null;

      const imgPlaceholder = yt.querySelector('img[placeholder]');
      expect(imgPlaceholder.className).to.match(/amp-hidden/);

      expect(imgPlaceholder.src).to.equal(
          'https://i.ytimg.com/vi/FAKE/hqdefault.jpg');
    });
  });

  it('should propagate attribute mutations for videoid', () => {
    return getYt({'data-videoid': EXAMPLE_VIDEOID}).then(yt => {
      const spy = sandbox.spy(yt.implementation_, 'sendCommand_');
      yt.setAttribute('data-videoid', 'lBTCB7yLs8Y');
      yt.mutatedAttributesCallback({'data-videoid': 'lBTCB7yLs8Y'});
      expect(spy).to.be.calledWith('loadVideoById',
          sinon.match(['lBTCB7yLs8Y']));
    });
  });

  it('should remove iframe after unlayoutCallback', () => {
    return getYt({'data-videoid': EXAMPLE_VIDEOID}).then(yt => {
      const placeholder = yt.querySelector('[placeholder]');
      const obj = yt.implementation_;
      const unlistenSpy = sandbox.spy(obj, 'unlistenMessage_');
      obj.unlayoutCallback();
      expect(unlistenSpy).to.have.been.called;
      expect(yt.querySelector('iframe')).to.be.null;
      expect(obj.iframe_).to.be.null;
      expect(placeholder.style.display).to.be.equal('');
      expect(obj.playerState_).to.be.equal(2);
    });
  });

  function sendFakeInfoDeliveryMessage(yt, iframe, info) {
    yt.implementation_.handleYoutubeMessages_({
      origin: 'https://www.youtube.com',
      source: iframe.contentWindow,
      data: JSON.stringify({
        event: 'infoDelivery',
        info,
      }),
    });
  }
});
