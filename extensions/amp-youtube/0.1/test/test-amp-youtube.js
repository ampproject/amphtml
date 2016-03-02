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
require('../amp-youtube');
import {adopt} from '../../../../src/runtime';
import {timer} from '../../../../src/timer';
import * as sinon from 'sinon';

adopt(window);

describe('amp-youtube', () => {
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
  });

  afterEach(() => {
    sandbox.restore();
    sandbox = null;
  });

  function getYt(videoId, opt_responsive, opt_beforeLayoutCallback) {
    return createIframePromise(
        true, opt_beforeLayoutCallback).then(iframe => {
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

          yt.setAttribute('data-videoid', videoId);
          yt.setAttribute('width', '111');
          yt.setAttribute('height', '222');
          if (opt_responsive) {
            yt.setAttribute('layout', 'responsive');
          }
          return iframe.addElement(yt);
        });
  }

  it('renders', () => {
    return getYt('mGENRKrdoGY').then(yt => {
      const iframe = yt.querySelector('iframe');
      expect(iframe).to.not.be.null;
      expect(iframe.tagName).to.equal('IFRAME');
      expect(iframe.src).to.equal(
          'https://www.youtube.com/embed/mGENRKrdoGY?enablejsapi=1');
      expect(iframe.getAttribute('width')).to.equal('111');
      expect(iframe.getAttribute('height')).to.equal('222');
    });
  });

  it('renders responsively', () => {
    return getYt('mGENRKrdoGY', true).then(yt => {
      const iframe = yt.querySelector('iframe');
      expect(iframe).to.not.be.null;
      expect(iframe.className).to.match(/-amp-fill-content/);
    });
  });

  it('requires data-videoid', () => {
    return getYt('').should.eventually.be.rejectedWith(
        /The data-videoid attribute is required for/);
  });

  it('adds an img placeholder in prerender mode', () => {
    return getYt('mGENRKrdoGY', true, function(yt) {
      const iframe = yt.querySelector('iframe');
      expect(iframe).to.be.null;

      const imgPlaceholder = yt.querySelector('img[placeholder]');
      expect(imgPlaceholder).to.not.be.null;
      expect(imgPlaceholder.className).to.not.match(/amp-hidden/);
      expect(imgPlaceholder.getAttribute('src')).to.be.equal(
          'https://i.ytimg.com/vi/mGENRKrdoGY/sddefault.jpg');
    }).then(yt => {
      const iframe = yt.querySelector('iframe');
      expect(iframe).to.not.be.null;

      const imgPlaceholder = yt.querySelector('img[placeholder]');
      expect(imgPlaceholder.className).to.match(/amp-hidden/);
    });
  });

  it('loads only sddefault when it exists', () => {
    return getYt('mGENRKrdoGY', true, function(yt) {
      const iframe = yt.querySelector('iframe');
      expect(iframe).to.be.null;

      const imgPlaceholder = yt.querySelector('img[placeholder]');
      expect(imgPlaceholder).to.not.be.null;
      expect(imgPlaceholder.className).to.not.match(/amp-hidden/);
    }).then(yt => {
      const iframe = yt.querySelector('iframe');
      expect(iframe).to.not.be.null;

      const imgPlaceholder = yt.querySelector('img[placeholder]');
      expect(imgPlaceholder.className).to.match(/amp-hidden/);

      expect(imgPlaceholder.src).to.equal(
          'https://i.ytimg.com/vi/mGENRKrdoGY/sddefault.jpg');
    });
  });

  it('loads hqdefault thumbnail source when sddefault fails', () => {
    return getYt('FAKE', true, function(yt) {
      const iframe = yt.querySelector('iframe');
      expect(iframe).to.be.null;

      const imgPlaceholder = yt.querySelector('img[placeholder]');
      expect(imgPlaceholder).to.not.be.null;
      expect(imgPlaceholder.className).to.not.match(/amp-hidden/);
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
    return getYt('mGENRKrdoGY').then(yt => {
      const iframe = yt.querySelector('iframe');
      expect(iframe).to.not.be.null;

      expect(yt.implementation_.playerState_).to.equal(0);

      yt.implementation_.handleYoutubeMessages_({
        origin: 'https://www.youtube.com',
        source: iframe.contentWindow,
        data: JSON.stringify({
          event: 'infoDelivery',
          info: {playerState: 1},
        }),
      });

      expect(yt.implementation_.playerState_).to.equal(1);
    });

  });

  it('should not pause when video not playing', () => {
    return getYt('mGENRKrdoGY').then(yt => {
      sandbox.spy(yt.implementation_, 'pauseVideo_');
      yt.implementation_.documentInactiveCallback();
      expect(yt.implementation_.pauseVideo_.called).to.be.false;
    });

  });

  it('should pause if the video is playing', () => {
    return getYt('mGENRKrdoGY').then(yt => {
      yt.implementation_.playerState_ = 1;
      sandbox.spy(yt.implementation_, 'pauseVideo_');
      yt.implementation_.documentInactiveCallback();
      expect(yt.implementation_.pauseVideo_.called).to.be.true;
    });

  });
});
