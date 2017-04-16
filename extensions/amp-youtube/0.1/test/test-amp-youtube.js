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

import {
  createIframePromise,
  doNotLoadExternalResourcesInTest,
} from '../../../../testing/iframe';
import '../amp-youtube';
import {listenOncePromise} from '../../../../src/event-helper';
import {adopt} from '../../../../src/runtime';
import {timerFor} from '../../../../src/services';
import {VideoEvents} from '../../../../src/video-interface';
import * as sinon from 'sinon';

adopt(window);

describe('amp-youtube', function() {
  this.timeout(5000);
  let sandbox;
  const timer = timerFor(window);

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
  });

  afterEach(() => {
    sandbox.restore();
  });

  function getYt(attributes, opt_responsive, opt_beforeLayoutCallback) {
    return createIframePromise(
        true, opt_beforeLayoutCallback).then(iframe => {
          doNotLoadExternalResourcesInTest(iframe.win);
          const yt = iframe.doc.createElement('amp-youtube');

          // TODO(mkhatib): During tests, messages are not being correctly
          // caught and hence the ready promise will never resolve.
          // For now, this resolves the ready promise after a while.
          timer.promise(50).then(() => {
            const ytIframe = yt.querySelector('iframe');
            yt.implementation_.handleYoutubeMessages_({
              origin: 'https://www.youtube.com',
              source: ytIframe.contentWindow,
              data: JSON.stringify({event: 'onReady'}),
            });
          });

          for (const key in attributes) {
            yt.setAttribute(key, attributes[key]);
          }
          yt.setAttribute('width', '111');
          yt.setAttribute('height', '222');
          if (opt_responsive) {
            yt.setAttribute('layout', 'responsive');
          }
          return iframe.addElement(yt);
        });
  }

  it('renders', () => {
    return getYt({'data-videoid': 'mGENRKrdoGY'}).then(yt => {
      const iframe = yt.querySelector('iframe');
      expect(iframe).to.not.be.null;
      expect(iframe.tagName).to.equal('IFRAME');
      expect(iframe.src).to.equal(
          'https://www.youtube.com/embed/mGENRKrdoGY?enablejsapi=1&playsinline=1');
    });
  });

  it('renders responsively', () => {
    return getYt({'data-videoid': 'mGENRKrdoGY'}, true).then(yt => {
      const iframe = yt.querySelector('iframe');
      expect(iframe).to.not.be.null;
      expect(iframe.className).to.match(/i-amphtml-fill-content/);
    });
  });

  it('requires data-videoid', () => {
    return getYt({}).should.eventually.be.rejectedWith(
        /The data-videoid attribute is required for/);
  });

  it('adds an img placeholder in prerender mode', () => {
    return getYt({'data-videoid': 'mGENRKrdoGY'}, true, function(yt) {
      const iframe = yt.querySelector('iframe');
      expect(iframe).to.be.null;

      const imgPlaceholder = yt.querySelector('img[placeholder]');
      expect(imgPlaceholder).to.not.be.null;
      expect(imgPlaceholder.className).to.not.match(/amp-hidden/);
      expect(imgPlaceholder.src).to.be.equal(
          'https://i.ytimg.com/vi/mGENRKrdoGY/sddefault.jpg#404_is_fine');
      expect(imgPlaceholder.getAttribute('referrerpolicy')).to.equal('origin');
    }).then(yt => {
      const iframe = yt.querySelector('iframe');
      expect(iframe).to.not.be.null;

      const imgPlaceholder = yt.querySelector('img[placeholder]');
      expect(imgPlaceholder.className).to.match(/amp-hidden/);
    });
  });

  it('loads only sddefault when it exists', () => {
    return getYt({'data-videoid': 'mGENRKrdoGY'}, true, function(yt) {
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
        get: function() {
          return 120;
        },
      });
      Object.defineProperty(imgPlaceholder, 'naturalHeight', {
        get: function() {
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

  it('monitors the YouTube player state', () => {
    return getYt({'data-videoid': 'mGENRKrdoGY'}).then(yt => {
      const iframe = yt.querySelector('iframe');
      expect(iframe).to.not.be.null;

      expect(yt.implementation_.playerState_).to.equal(0);

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
    return getYt({'data-videoid': 'mGENRKrdoGY'}).then(yt => {
      sandbox.spy(yt.implementation_, 'pause');
      yt.implementation_.pauseCallback();
      expect(yt.implementation_.pause.called).to.be.false;
    });

  });

  it('should pause if the video is playing', () => {
    return getYt({'data-videoid': 'mGENRKrdoGY'}).then(yt => {
      yt.implementation_.playerState_ = 1;
      sandbox.spy(yt.implementation_, 'pause');
      yt.implementation_.pauseCallback();
      expect(yt.implementation_.pause.called).to.be.true;
    });
  });

  it('should pass data-param-* attributes to the iframe src', () => {
    return getYt({
      'data-videoid': 'mGENRKrdoGY',
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
      'data-videoid': 'mGENRKrdoGY',
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
      'data-videoid': 'mGENRKrdoGY',
      'data-param-playsinline': '0',
    }).then(yt => {
      const src = yt.querySelector('iframe').src;
      const preloadSpy = sandbox.spy(yt.implementation_.preconnect, 'url');
      yt.implementation_.preconnectCallback();
      preloadSpy.should.have.been.calledWithExactly(src);
    });
  });

  it('should forward certain events from youtube to the amp element', () => {
    return getYt({'data-videoid': 'mGENRKrdoGY'}).then(yt => {
      const iframe = yt.querySelector('iframe');

      return Promise.resolve()
      .then(() => {
        const p = listenOncePromise(yt, VideoEvents.MUTED);
        sendFakeInfoDeliveryMessage(yt, iframe, {muted: true});
        return p;
      })
      .then(() => {
        const p = listenOncePromise(yt, VideoEvents.PLAY);
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
        const successTimeout = timer.timeoutPromise(10, true);
        return Promise.race([p, successTimeout]);
      });
    });
  });

  it('should propagate attribute mutations', () => {
    return getYt({'data-videoid': 'mGENRKrdoGY'}).then(yt => {
      const spy = sandbox.spy(yt.implementation_, 'sendCommand_');
      yt.setAttribute('data-videoid', 'lBTCB7yLs8Y');
      yt.mutatedAttributesCallback({'data-videoid': 'lBTCB7yLs8Y'});
      expect(spy).to.be.calledWith('loadVideoById',
          sinon.match(['lBTCB7yLs8Y']));
    });
  });

  it('should remove iframe after unlayoutCallback', () => {
    return getYt({'data-videoid': 'mGENRKrdoGY'}).then(yt => {
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
<<<<<<< HEAD
=======
  it('should propagate attribute mutations', () => {
    return getYt({'data-videoid': 'mGENRKrdoGY'}).then(yt => {
      const spy = sandbox.spy(yt.implementation_, 'sendCommand_');
      yt.setAttribute('data-videoid', 'lBTCB7yLs8Y');
      yt.mutatedAttributesCallback({'data-videoid': 'lBTCB7yLs8Y'});
      expect(spy).to.be.calledWith('loadVideoById',
          sinon.match(['lBTCB7yLs8Y']));

    });
  });
>>>>>>> Fix specs

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
