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

import {Services} from '../../src/services';
import {
  VideoAnalyticsEvents,
  VideoEvents,
  VideoInterface,
} from '../../src/video-interface';
import {VideoUtils} from '../../src/utils/video';
import {
  createFixtureIframe,
  expectBodyToBecomeVisible,
  poll,
} from '../../testing/iframe';
import {getData, listenOncePromise} from '../../src/event-helper';
import {removeElement} from '../../src/dom';
import {toggleExperiment} from '../../src/experiments';

function skipIfAutoplayUnsupported(win) {
  VideoUtils.resetIsAutoplaySupported();

  return VideoUtils.isAutoplaySupported(win, false).then(isSupported => {
    if (isSupported) {
      return;
    }
    this.skipTest();
  });
}

export function runVideoPlayerIntegrationTests(
  createVideoElementFunc,
  opt_experiment
) {
  /**
   * @const {number} Height of the fixture iframe
   */
  const FRAME_HEIGHT = 1000;

  const TIMEOUT = 20000;

  let fixtureGlobal;
  let videoGlobal;

  function createButton(r, action) {
    const button = r.fixture.doc.createElement('button');
    button.setAttribute('on', 'tap:myVideo.' + action);
    r.fixture.doc.body.appendChild(button);
    return button;
  }

  describe
    .configure()
    .skipIfPropertiesObfuscated()
    .ifChrome()
    .run('Video Interface', function() {
      this.timeout(TIMEOUT);

      it('should override the video interface methods', function() {
        this.timeout(TIMEOUT);
        return getVideoPlayer({outsideView: false, autoplay: true}).then(r => {
          const impl = r.video.implementation_;
          const methods = Object.getOwnPropertyNames(
            Object.getPrototypeOf(new VideoInterface())
          );

          expect(methods.length).to.be.above(1);
          for (let i = 0; i < methods.length; i++) {
            const methodName = methods[i];
            expect(impl[methodName]).to.exist;
          }
        });
      });

      afterEach(cleanUp);
    });

  describe
    .configure()
    .ifChrome()
    .run('Actions', function() {
      this.timeout(TIMEOUT);

      // TODO(cvializ, #14827): Fails on Chrome 66.
      it.skip('should support mute, play, pause, unmute actions', function() {
        return getVideoPlayer({outsideView: false, autoplay: false}).then(r => {
          // Create a action buttons
          const playButton = createButton(r, 'play');
          const pauseButton = createButton(r, 'pause');
          const muteButton = createButton(r, 'mute');
          const unmuteButton = createButton(r, 'unmute');

          return listenOncePromise(r.video, VideoEvents.LOAD)
            .then(() => {
              const promise = listenOncePromise(r.video, VideoEvents.PLAYING);
              playButton.click();
              return promise;
            })
            .then(() => {
              const promise = listenOncePromise(r.video, VideoEvents.MUTED);
              muteButton.click();
              return promise;
            })
            .then(() => {
              const promise = listenOncePromise(r.video, VideoEvents.PAUSE);
              pauseButton.click();
              return promise;
            })
            .then(() => {
              const promise = listenOncePromise(r.video, VideoEvents.UNMUTED);
              unmuteButton.click();
              return promise;
            });
        });
      });

      // Although these tests are not about autoplay, we can ony run them in
      // browsers that do support autoplay, this is because a synthetic click
      // event will not be considered a user-action and mobile browsers that
      // don't support muted autoplay will block it. In real life, the click
      // would be considered a user-initiated action, but no way to do that in a
      // scripted test environment.
      before(function() {
        this.timeout(TIMEOUT);
        return skipIfAutoplayUnsupported.call(this, window);
      });

      afterEach(cleanUp);
    });

  describe
    .configure()
    .skipIfPropertiesObfuscated()
    .ifChrome()
    .skipWindows() // TODO(#19647): Flaky on Chrome 71 on Windows 10.
    .run('Analytics Triggers', function() {
      this.timeout(TIMEOUT);
      let video;

      // TODO(cvializ, #14827): Fails on Chrome 66.
      it.skip('should trigger play analytics on play', function() {
        let playButton;

        return getVideoPlayer({
          outsideView: true,
          autoplay: false,
        })
          .then(r => {
            video = r.video;
            playButton = createButton(r, 'play');
            const viewport = video.implementation_.getViewport();
            const promise = listenOncePromise(video, VideoEvents.LOAD);
            viewport.scrollIntoView(video);
            return promise;
          })
          .then(() => {
            const promise = listenOncePromise(video, VideoAnalyticsEvents.PLAY);
            playButton.click();
            return promise;
          });
      });

      it('should trigger pause analytics when the video pauses', function() {
        let pauseButton;

        return getVideoPlayer({
          outsideView: false,
          autoplay: true,
        })
          .then(r => {
            video = r.video;
            pauseButton = createButton(r, 'pause');
            return listenOncePromise(video, VideoEvents.PLAYING);
          })
          .then(() => {
            const promise = listenOncePromise(
              video,
              VideoAnalyticsEvents.PAUSE
            );
            pauseButton.click();
            return promise;
          });
      });

      it('should trigger session analytics when a session ends', function() {
        let pauseButton;

        return getVideoPlayer({
          outsideView: false,
          autoplay: true,
        })
          .then(r => {
            video = r.video;
            const promise = listenOncePromise(video, VideoEvents.PLAYING);
            pauseButton = createButton(r, 'pause');
            return promise;
          })
          .then(() => {
            const promise = listenOncePromise(
              video,
              VideoAnalyticsEvents.PAUSE
            );
            pauseButton.click();
            return promise;
          });
      });

      // TODO (#16154): this test times out on master
      it.skip(
        'should trigger session analytics when ' + 'a visible session ends',
        function() {
          let viewport;
          return getVideoPlayer({
            outsideView: true,
            autoplay: true,
          })
            .then(r => {
              video = r.video;
              viewport = video.implementation_.getViewport();
              // scroll to the bottom, make video fully visible
              viewport.scrollIntoView(video);
              return listenOncePromise(video, VideoEvents.PLAYING);
            })
            .then(() => {
              // scroll to the bottom, make video fully visible
              viewport.setScrollTop(0);
              return listenOncePromise(
                video,
                VideoAnalyticsEvents.SESSION_VISIBLE
              );
            });
        }
      );

      describe('should trigger ended analytics', () => {
        let player;
        before(function() {
          return getVideoPlayer({
            outsideView: false,
            autoplay: true,
          }).then(r => {
            // TODO(cvializ): Better way to detect which classes implement
            // methods needed for tracking?
            const {tagName} = r.video;
            if (
              tagName !== 'AMP-VIDEO' &&
              tagName !== 'AMP-TEST-FAKE-VIDEOPLAYER'
            ) {
              this.skipTest();
              return;
            }
            player = r;
          });
        });
        it('when the video ends', function() {
          video = player.video;
          return listenOncePromise(video, VideoAnalyticsEvents.ENDED);
        });
      });

      // TODO(cvializ, #14827): Fails on Chrome 66.
      it.skip('should include current time, play state, etc.', function() {
        let playButton;
        let pauseButton;

        return getVideoPlayer({
          outsideView: false,
          autoplay: false,
        })
          .then(r => {
            video = r.video;
            playButton = createButton(r, 'play');
            pauseButton = createButton(r, 'pause');
            return listenOncePromise(video, VideoEvents.LOAD);
          })
          .then(() => {
            const promise = listenOncePromise(video, VideoEvents.PLAYING);
            playButton.click();
            return promise;
          })
          .then(() => {
            pauseButton.click();
            return listenOncePromise(video, VideoAnalyticsEvents.PAUSE);
          })
          .then(event => {
            const details = getData(event);
            const playedRanges = JSON.parse(details.playedRangesJson);
            expect(details.autoplay).to.be.a('boolean');
            expect(details.currentTime).to.be.a('number');
            expect(details.duration).to.be.a('number');
            expect(details.height).to.be.a('number');
            expect(details.id).to.be.a('string');
            expect(details.playedTotal).to.be.a('number');
            expect(playedRanges).to.be.an('array');
            expect(details.state).to.be.a('string');
            expect(details.width).to.be.a('number');
          });
      });

      it.skip(
        'should trigger video-seconds-played when visible' + 'and playing',
        () => {
          let video;
          let timer;
          let pauseButton;
          let playButton;

          return getVideoPlayer({
            outsideView: true,
            autoplay: true,
          })
            .then(r => {
              timer = Services.timerFor(r.video.implementation_.win);
              video = r.video;
              pauseButton = createButton(r, 'pause');
              playButton = createButton(r, 'play');
              return Promise.race([
                listenOncePromise(
                  video,
                  VideoAnalyticsEvents.SECONDS_PLAYED
                ).then(() => Promise.reject('Triggered video-seconds-played')),
                timer.promise(2000),
              ]);
            })
            .then(() => {
              const viewport = video.implementation_.getViewport();
              viewport.scrollIntoView(video);
              return listenOncePromise(
                video,
                VideoAnalyticsEvents.SECONDS_PLAYED
              );
            })
            .then(() => {
              pauseButton.click();
              return listenOncePromise(video, VideoEvents.PAUSE);
            })
            .then(() => {
              return Promise.race([
                listenOncePromise(
                  video,
                  VideoAnalyticsEvents.SECONDS_PLAYED
                ).then(() => Promise.reject('Triggered video-seconds-played')),
                timer.promise(2000),
              ]);
            })
            .then(() => {
              playButton.click();
              return listenOncePromise(video, VideoEvents.PLAYING);
            })
            .then(() => {
              return listenOncePromise(
                video,
                VideoAnalyticsEvents.SECONDS_PLAYED
              );
            });
        }
      );

      afterEach(cleanUp);
    });

  const t = describe
    .configure()
    .ifChrome()
    .skipIfPropertiesObfuscated();
  t.run('Autoplay', function() {
    this.timeout(TIMEOUT);

    describe('play/pause', () => {
      it('should play when in view port initially', () => {
        return getVideoPlayer({outsideView: false, autoplay: true}).then(r => {
          return listenOncePromise(r.video, VideoEvents.PLAYING);
        });
      });

      it('should not play when not in view port initially', () => {
        return getVideoPlayer({outsideView: true, autoplay: true}).then(r => {
          const timer = Services.timerFor(r.video.implementation_.win);
          const p = listenOncePromise(r.video, VideoEvents.PLAYING).then(() => {
            return Promise.reject('should not have autoplayed');
          });
          // we have to wait to ensure play is NOT called.
          return Promise.race([timer.promise(1000), p]);
        });
      });

      // TODO(aghassemi, #9379): Flaky on Safari 9.
      // TODO(aghassemi): Flaky on Chrome 67 on Windows 7.
      it.skip('should play/pause when video enters/exits viewport', function() {
        let video;
        let viewport;
        return getVideoPlayer({outsideView: true, autoplay: true})
          .then(r => {
            video = r.video;
            viewport = video.implementation_.getViewport();

            // scroll to the bottom, make video fully visible
            const p = listenOncePromise(video, VideoEvents.PLAYING);
            viewport.scrollIntoView(video);
            return p;
          })
          .then(() => {
            // scroll back to top, make video not visible
            const p = listenOncePromise(video, VideoEvents.PAUSE);
            viewport.setScrollTop(0);
            return p;
          });
      });
    });

    describe('Animated Icon', () => {
      // TODO(amphtml): Unskip when #9379 is fixed.
      it.skip('should create an animated icon overlay', () => {
        let video;
        let viewport;
        let icon;
        return getVideoPlayer({outsideView: true, autoplay: true})
          .then(r => {
            video = r.video;
            return poll('animation icon', () => {
              return !!video.querySelector('i-amphtml-video-eq');
            });
          })
          .then(() => {
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
          const cs = win.getComputedStyle(animElement);
          const isPaused =
            cs.getPropertyValue('animation-play-state') == 'paused' ||
            cs.getPropertyValue('-webkit-animation-play-state') == 'paused' ||
            cs.getPropertyValue('animation-name') == 'none' ||
            cs.getPropertyValue('-webkit-animation-name') == 'none';
          return isPaused;
        }

        function waitForAnimationPlay(iconElement) {
          return poll(
            'animation play',
            () => {
              return iconElement.classList.contains('amp-video-eq-play');
            },
            undefined,
            TIMEOUT
          );
        }
      });
    });

    before(function() {
      this.timeout(TIMEOUT);
      // Skip autoplay tests if browser does not support autoplay.
      return skipIfAutoplayUnsupported.call(this, window);
    });

    afterEach(cleanUp);
  });

  describe
    .configure()
    .ifChrome()
    .run('Rotate-to-fullscreen', function() {
      this.timeout(TIMEOUT);

      let video;
      let sandbox;
      let playButton;
      let autoFullscreen;
      let isInLandscapeStub;

      // TODO(alanorozco): Fails on Chrome 66.
      it.skip('should enter fullscreen on rotation', function() {
        function mockLandscape(isLandscape) {
          if (!autoFullscreen) {
            const manager = Services.videoManagerForDoc(video.getAmpDoc());
            autoFullscreen = manager.getAutoFullscreenManagerForTesting_();
          }
          if (!isInLandscapeStub) {
            isInLandscapeStub = sandbox.stub(autoFullscreen, 'isInLandscape');
          }
          isInLandscapeStub.returns(isLandscape);
        }

        return getVideoPlayer({
          autoplay: false,
          outsideView: true,
          'rotate-to-fullscreen': true,
        })
          .then(r => {
            video = r.video;
            playButton = createButton(r, 'play');
            mockLandscape(false);
            const whenLoaded = listenOncePromise(video, VideoEvents.LOAD);
            const viewport = video.implementation_.getViewport();
            viewport.scrollIntoView(video);
            return whenLoaded;
          })
          .then(() => {
            const whenPlaying = listenOncePromise(video, VideoEvents.PLAYING);
            playButton.click();
            return whenPlaying;
          })
          .then(() => {
            const enter = sandbox.stub(
              video.implementation_,
              'fullscreenEnter'
            );
            mockLandscape(true);
            autoFullscreen.onRotation_();
            return poll('fullscreen enter', () => enter.called);
          });
      });

      // Although these tests are not about autoplay, we can ony run them in
      // browsers that do support autoplay, this is because a synthetic click
      // event will not be considered a user-action and mobile browsers that
      // don't support muted autoplay will block it. In real life, the click
      // would be considered a user-initiated action, but no way to do that in a
      // scripted test environment.
      before(function() {
        this.timeout(TIMEOUT);
        // Skip autoplay tests if browser does not support autoplay.
        return skipIfAutoplayUnsupported.call(this, window);
      });

      beforeEach(() => {
        sandbox = sinon.sandbox;
      });

      afterEach(() => {
        sandbox.restore();
      });
    });

  function getVideoPlayer(options) {
    options = options || {};
    const top = options.outsideView ? '100vh' : '0';
    let fixture;
    return createFixtureIframe('test/fixtures/video-players.html', FRAME_HEIGHT)
      .then(f => {
        fixture = f;
        if (opt_experiment) {
          toggleExperiment(fixture.win, opt_experiment, true);
        }
        return expectBodyToBecomeVisible(fixture.win, TIMEOUT);
      })
      .then(() => {
        const video = createVideoElementFunc(fixture);
        const sizer = fixture.doc.createElement('div');

        const whenVideoRegistered = video
          .signals()
          .whenSignal(VideoEvents.REGISTERED)
          .then(() => ({video, fixture}));

        ['autoplay', 'dock', 'rotate-to-fullscreen'].forEach(option => {
          if (options[option]) {
            video.setAttribute(option, '');
          }
        });

        video.setAttribute('id', 'myVideo');
        video.setAttribute('controls', '');
        video.setAttribute('layout', 'fixed');
        video.setAttribute('width', '300px');
        video.setAttribute('height', '50vh');
        video.setAttribute('i-amphtml-integration-test', '');

        video.style.position = 'absolute';
        video.style.top = top;

        sizer.position = 'relative';
        sizer.style.height = '200vh';

        fixtureGlobal = fixture;
        videoGlobal = video;

        fixture.doc.body.appendChild(sizer);
        fixture.doc.body.appendChild(video);

        return whenVideoRegistered;
      });
  }

  function cleanUp() {
    VideoUtils.resetIsAutoplaySupported();

    try {
      if (fixtureGlobal) {
        if (opt_experiment) {
          toggleExperiment(fixtureGlobal.win, opt_experiment, false);
        }
        removeElement(videoGlobal);
        removeElement(fixtureGlobal.iframe);
      }
    } catch (e) {}
  }
}
