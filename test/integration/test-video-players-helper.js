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
import {timerFor} from '../../src/services';
import {VideoInterface, VideoEvents} from '../../src/video-interface';
import {supportsAutoplay} from '../../src/service/video-manager-impl';
import {
  createFixtureIframe,
  expectBodyToBecomeVisible,
  poll,
} from '../../testing/iframe';

export function runVideoPlayerIntegrationTests(createVideoElementFunc) {
  const TIMEOUT = 20000;
  let fixtureGlobal;
  let videoGlobal;

  describe.configure().retryOnSaucelabs()
  .run('Video Interface', function() {
    this.timeout(TIMEOUT);

    it('should override the video interface methods', function() {
      this.timeout(TIMEOUT);
      return getVideoPlayer({outsideView: false, autoplay: true})
      .then(r => {
        const impl = r.video.implementation_;
        const methods = Object.getOwnPropertyNames(
            Object.getPrototypeOf(new VideoInterface()));

        expect(methods.length).to.be.above(1);
        for (let i = 0; i < methods.length; i++) {
          const methodName = methods[i];
          expect(impl[methodName]).to.exist;
        }
      });
    });

    afterEach(cleanUp);
  });

  describe.configure().retryOnSaucelabs()
  .run('Actions', function() {
    this.timeout(TIMEOUT);
    it('should support mute, play, pause, unmute actions', function() {
      return getVideoPlayer({outsideView: false, autoplay: false}).then(r => {
        // Create a action buttons
        const playButton = createButton(r, 'play');
        const pauseButton = createButton(r, 'pause');
        const muteButton = createButton(r, 'mute');
        const unmuteButton = createButton(r, 'unmute');
        return Promise.resolve()
        .then(() => {
          muteButton.click();
          return listenOncePromise(r.video, VideoEvents.MUTED);
        })
        .then(() => {
          playButton.click();
          return listenOncePromise(r.video, VideoEvents.PLAY);
        })
        .then(() => {
          pauseButton.click();
          return listenOncePromise(r.video, VideoEvents.PAUSE);
        })
        .then(() => {
          unmuteButton.click();
          return listenOncePromise(r.video, VideoEvents.UNMUTED);
        });
      });
    });

    function createButton(r, action) {
      const button = r.fixture.doc.createElement('button');
      button.setAttribute('on', 'tap:myVideo.' + action);
      r.fixture.doc.body.appendChild(button);
      return button;
    }

    // Although these tests are not about autoplay, we can ony run them in
    // browsers that do support autoplay, this is because a synthetic click
    // event will not be considered a user-action and mobile browsers that
    // don't support muted autoplay will block it. In real life, the click
    // would be considered a user-initiated action, but no way to do that in a
    // scripted test environment.
    before(function() {
      this.timeout(TIMEOUT);
      // Skip autoplay tests if browser does not support autoplay.
      return supportsAutoplay(window, false).then(supportsAutoplay => {
        if (!supportsAutoplay) {
          this.skip();
        }
      });
    });

    afterEach(cleanUp);
  });

  describe.configure().retryOnSaucelabs()
  .run('Autoplay', function() {
    this.timeout(TIMEOUT);
    describe('play/pause', () => {
      it('should play when in view port initially', () => {
        return getVideoPlayer({outsideView: false, autoplay: true}).then(r => {
          return listenOncePromise(r.video, VideoEvents.PLAY);
        });
      });

      it('should not play when not in view port initially', () => {
        return getVideoPlayer({outsideView: true, autoplay: true}).then(r => {
          const timer = timerFor(r.video.implementation_.win);
          const p = listenOncePromise(r.video, VideoEvents.PLAY).then(() => {
            return Promise.reject('should not have autoplayed');
          });
          // we have to wait to ensure play is NOT called.
          return Promise.race([timer.promise(1000), p]);
        });
      });

      it('should play/pause when video enters/exists viewport', () => {
        let video;
        let viewport;
        return getVideoPlayer({outsideView: true, autoplay: true}).then(r => {
          video = r.video;
          viewport = video.implementation_.getViewport();

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
      // TODO(amphtml): Unskip when #8385 is fixed.
      it.skip('should create an animated icon overlay', () => {
        let video;
        let viewport;
        let icon;
        return getVideoPlayer({outsideView: true, autoplay: true}).then(r => {
          video = r.video;
          return poll('animation icon', () => {
            return !!video.querySelector('i-amphtml-video-eq');
          });
        }).then(() => {
          icon = video.querySelector('i-amphtml-video-eq');
          expect(icon).to.exist;
          // animation should be paused since video is not played yet
          expect(isAnimationPaused(icon)).to.be.true;

          viewport = video.implementation_.getViewport();
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

    afterEach(cleanUp);
  });

  function getVideoPlayer(options) {
    options = options || {};
    const top = options.outsideView ? '100vh' : '0';
    let fixture;
    return createFixtureIframe('test/fixtures/video-players.html', 1000)
    .then(f => {
      fixture = f;
      return expectBodyToBecomeVisible(fixture.win);
    })
    .then(() => {
      const video = createVideoElementFunc(fixture);
      if (options.autoplay) {
        video.setAttribute('autoplay', '');
      }
      video.setAttribute('id', 'myVideo');
      video.setAttribute('controls', '');
      video.setAttribute('layout', 'fixed');
      video.setAttribute('width', '300px');
      video.setAttribute('height', '50vh');

      video.style.position = 'absolute';
      video.style.top = top;

      const sizer = fixture.doc.createElement('div');
      sizer.position = 'relative';
      sizer.style.height = '200vh';

      fixture.doc.body.appendChild(sizer);
      fixture.doc.body.appendChild(video);
      fixtureGlobal = fixture;
      videoGlobal = video;
      return poll('video built', () => {
        return video.implementation_ && video.implementation_.play;
      },undefined, 5000).then(() => {
        return {video, fixture};
      });
    });
  }

  function cleanUp() {
    if (fixtureGlobal) {
      fixtureGlobal.doc.body.removeChild(videoGlobal);
      fixtureGlobal.iframe.remove();
      toggleExperiment(fixtureGlobal.win, 'amp-ima-video', false);
    }
  }
}
