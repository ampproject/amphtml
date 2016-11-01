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

import {listenOncePromise} from '../../src/event-helper';
import {timerFor} from '../../src/timer';
import {viewportForDoc} from '../../src/viewport';
import {VideoInterface, VideoEvents} from '../../src/video-interface';
import {supportsAutoplay} from '../../src/service/video-manager-impl';
import {
  createFixtureIframe,
  expectBodyToBecomeVisible,
  poll,
} from '../../testing/iframe';

export function runVideoPlayerIntegrationTests(createVideoElementFunc) {

  const TIMEOUT = 20000;
  it.configure().retryOnSaucelabs()
  .run('should override the video interface methods', function() {
    this.timeout(TIMEOUT);
    return getVideoPlayer(/* opt_outsideView */ false)
    .then(v => {
      const impl = v.implementation_;
      const methods = Object.getOwnPropertyNames(
          Object.getPrototypeOf(new VideoInterface()));

      expect(methods.length).to.be.above(1);
      for (let i = 0; i < methods.length; i++) {
        const methodName = methods[i];
        expect(impl[methodName]).to.exist;
      }
    });
  });

  describe.configure().retryOnSaucelabs().skipSafari()
  .run('Autoplay', function() {
    this.timeout(TIMEOUT);
    describe('play/pause', () => {
      it('should play when in view port initially', () => {
        return getVideoPlayer(/* opt_outsideView */ false).then(v => {
          return listenOncePromise(v, VideoEvents.PLAY);
        });
      });

      it('should not play when not in view port initially', () => {
        return getVideoPlayer(/* opt_outsideView */ true).then(v => {
          const timer = timerFor(v.implementation_.win);
          const p = listenOncePromise(v, VideoEvents.PLAY).then(() => {
            return Promise.reject('should not have autoplayed');
          });
          // we have to wait to ensure play is NOT called.
          return Promise.race([timer.promise(1000), p]);
        });
      });

      it('should play/pause when video enters/exists viewport', () => {
        let video;
        let viewport;
        return getVideoPlayer(/* opt_outsideView */ true).then(v => {
          video = v;
          viewport = viewportForDoc(video);

          // scroll to the bottom, make video fully visible
          const p = listenOncePromise(video, VideoEvents.PLAY);
          viewport.scrollIntoView(video);
          return p;
        }).then(() => {
          // scroll back to top, make video not visible
          const p = listenOncePromise(video, VideoEvents.PAUSE);
          viewport.setScrollTop(0);
          return p;
        });
      });
    });

    describe('Animated Icon', () => {
      it('should create an animated icon overlay', () => {
        let video;
        let viewport;
        let icon;
        return getVideoPlayer(/* opt_outsideView */ true).then(v => {
          video = v;
          return poll('animation icon', () => {
            return !!video.querySelector('i-amp-video-eq');
          });
        }).then(() => {
          icon = video.querySelector('i-amp-video-eq');
          expect(icon).to.exist;
          // animation should be paused since video is not played yet
          expect(isAnimationPaused(icon)).to.be.true;

          viewport = viewportForDoc(video);
          // scroll to the bottom, make video fully visible so it autoplays
          viewport.scrollIntoView(video);

          return waitForAnimationPlay(icon).then(() => {
            expect(isAnimationPaused(icon)).to.be.false;
          });
        });

        function isAnimationPaused(iconElement) {
          const animElement = iconElement.querySelector('.amp-video-eq-1-1');
          const win = iconElement.ownerDocument.defaultView;
          const computedStyle = win.getComputedStyle(animElement);
          const isPaused =
            (computedStyle.getPropertyValue('animation-play-state') == 'paused'
            || computedStyle.getPropertyValue('-webkit-animation-play-state') ==
              'paused'
            || computedStyle.getPropertyValue('animation-name') == 'none'
            || computedStyle.getPropertyValue('-webkit-animation-name') ==
              'none');
          return isPaused;
        }

        function waitForAnimationPlay(iconElement) {
          return poll('animation play', () => {
            return iconElement.classList.contains('amp-video-eq-play');
          }, undefined, TIMEOUT);
        }
      });
    });
    before(function() {
      this.timeout(TIMEOUT);
      // Skip autoplay tests if browser does not support autoplay.
      return supportsAutoplay(window, false).then(supportsAutoplay => {
        if (!supportsAutoplay) {
          this.skip();
        }
      });
    });
  });

  function getVideoPlayer(opt_outsideView) {
    const top = opt_outsideView ? '100vh' : '0';
    let fixture;
    return createFixtureIframe('test/fixtures/video-players.html', 1000)
    .then(f => {
      fixture = f;
      return expectBodyToBecomeVisible(fixture.win);
    })
    .then(() => {
      const video = createVideoElementFunc(fixture);
      video.setAttribute('autoplay', '');
      video.setAttribute('controls', '');
      video.setAttribute('layout', 'fixed');
      video.setAttribute('width', '100');
      video.setAttribute('height', '50vh');

      video.style.position = 'absolute';
      video.style.top = top;

      const sizer = fixture.doc.createElement('div');
      sizer.position = 'relative';
      sizer.style.height = '200vh';

      fixture.doc.body.appendChild(sizer);
      fixture.doc.body.appendChild(video);

      return poll('video built', () => {
        return video.isBuilt();
      },undefined, 5000).then(() => {
        return video;
      });
    });
  }
}
