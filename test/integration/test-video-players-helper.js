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

import {getData, listen, listenOncePromise} from '../../src/event-helper';
import {timerFor} from '../../src/services';
import {removeElement} from '../../src/dom';
import {toggleExperiment} from '../../src/experiments';
import {
  VideoInterface,
  VideoEvents,
  VideoAnalyticsEvent,
} from '../../src/video-interface';
import {
  assertTrackingVideo,
  supportsAutoplay
} from '../../src/service/video-manager-impl';
import {
  createFixtureIframe,
  expectBodyToBecomeVisible,
  poll,
} from '../../testing/iframe';
import * as st from '../../src/style';

export function runVideoPlayerIntegrationTests(
    createVideoElementFunc, opt_experiment) {

  /**
   * @const {number} Height of the fixture iframe
   */
  const FRAME_HEIGHT = 1000;

  const TIMEOUT = 20000;
  const DOCK_SCALE = 0.6;
  const DOCK_CLASS = 'i-amphtml-dockable-video-minimizing';

  let fixtureGlobal;
  let videoGlobal;

  function createButton(r, action) {
    const button = r.fixture.doc.createElement('button');
    button.setAttribute('on', 'tap:myVideo.' + action);
    r.fixture.doc.body.appendChild(button);
    return button;
  }

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

  describe.configure().retryOnSaucelabs().run('Actions', function() {
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

  describe.configure().retryOnSaucelabs().run('Analytics Triggers', function() {
    this.timeout(TIMEOUT);
    let video;

    it('should trigger play analytics when the video plays', function() {
      let playButton;

      return getVideoPlayer(
          {
            outsideView: false,
            autoplay: false,
          }
      ).then(r => {
        video = r.video;
        playButton = createButton(r, 'play');
        return listenOncePromise(video, VideoEvents.LOAD);
      }).then(() => {
        playButton.click();
        return listenOncePromise(video, VideoEvents.ANALYTICS);;
      }).then(event => {
        const eventData = getData(event);
        const type = eventData['type'];
        expect(type).to.equal(VideoAnalyticsEvent.PLAY);
      });
    });

    it('should trigger pause analytics when the video pauses', function() {
      let pauseButton;

      return getVideoPlayer(
          {
            outsideView: false,
            autoplay: true,
          }
      ).then(r => {
        video = r.video;
        pauseButton = createButton(r, 'pause');
        return listenOncePromise(video, VideoEvents.PLAY);
      }).then(() => {
        pauseButton.click();
        return listenOncePromise(video, VideoEvents.ANALYTICS);
      }).then(event => {
        const eventData = getData(event);
        const type = eventData['type'];
        expect(type).to.equal(VideoAnalyticsEvent.PAUSE);
      });
    });

    it('should trigger session analytics when a session ends', function() {
      let pauseButton;

      return getVideoPlayer(
          {
            outsideView: false,
            autoplay: true,
          }
      ).then(r => {
        video = r.video;
        pauseButton = createButton(r, 'pause');
        return listenOncePromise(video, VideoEvents.PLAY);
      }).then(() => {
        const sessionPromise = new Promise(resolve => {
          listen(video, VideoEvents.ANALYTICS, event => {
            const eventData = getData(event);
            const type = eventData['type'];
            if (type === VideoAnalyticsEvent.SESSION) {
              resolve();
            }
          });
        });
        pauseButton.click();
        return sessionPromise;
      });
    });

    it('should trigger session analytics when ' +
        'a visible session ends', function() {
      let viewport;
      return getVideoPlayer(
          {
            outsideView: true,
            autoplay: true,
          }
      ).then(r => {
        video = r.video;
        viewport = video.implementation_.getViewport();
        // scroll to the bottom, make video fully visible
        viewport.scrollIntoView(video);
        return listenOncePromise(video, VideoEvents.PLAY);
      }).then(() => {
        // scroll to the bottom, make video fully visible
        viewport.setScrollTop(0);
        return listenOncePromise(video, VideoEvents.ANALYTICS);
      }).then(event => {
        const eventData = getData(event);
        const type = eventData['type'];
        expect(type).to.equal(VideoAnalyticsEvent.SESSION_VISIBLE);
      });
    });

    it('should trigger ended analytics when the video ends', function() {
      this.skip();
      return getVideoPlayer(
          {
            outsideView: false,
            autoplay: true,
          }
      ).then(r => {
        video = r.video;
        return listenOncePromise(video, VideoEvents.PLAY);
      }).then(() => {
        return Promise.all([
          // listenOncePromise(video, VideoEvents.ENDED, /* opt_capture */ true),
          listenOncePromise(video, VideoEvents.ANALYTICS),
        ]);
      }).then(result => {
        const event = result[1];
        const eventData = getData(event);
        const type = eventData['type'];
        expect(type).to.equal(VideoAnalyticsEvent.ENDED);
      });
    });

    it('should include current time, play state, etc.', function() {
      let playButton;

      return getVideoPlayer(
          {
            outsideView: false,
            autoplay: false,
          }
      ).then(r => {
        video = r.video;
        playButton = createButton(r, 'play');
        return listenOncePromise(video, VideoEvents.LOAD);
      }).then(() => {
        playButton.click();
        return listenOncePromise(video, VideoEvents.ANALYTICS);
      }).then(event => {
        const eventData = getData(event);
        const details = eventData['details'];
        expect(details.autoplay).to.be.a('boolean');
        expect(details.currentTime).to.be.a('number');
        expect(details.duration).to.be.a('number');
        expect(details.ended).to.be.a('boolean');
        expect(details.height).to.be.a('number');
        expect(details.id).to.be.a('string');
        expect(details.muted).to.be.a('boolean');
        expect(details.paused).to.be.a('boolean');
        expect(details.width).to.be.a('number');
      });
    });

    beforeEach(function() {
      this.timeout(TIMEOUT);

      // Skip analytics tests if the video implementation
      // doesn't support analytics.
      return getVideoPlayer(
          {
            outsideView: false,
            autoplay: false,
          }
      ).then(r => {
        video = r.video;
        if (!assertTrackingVideo(video.implementation_)) {
          this.skip();
        }
      });
    });

    afterEach(cleanUp);
  });

  describe.configure().retryOnSaucelabs().run('Video Docking', function() {
    this.timeout(TIMEOUT);

    describe('General Behavior', () => {
      it('should have class when attribute is set (autoplay)', function() {
        return getVideoPlayer(
            {
              outsideView: false,
              autoplay: true,
              dock: true,
            }
        ).then(r => {
          return poll('checking class list', () => {
            return r.video.classList.contains('i-amphtml-dockable-video');
          }, undefined, TIMEOUT);
        });
      });

      it('should have class when attribute is set (no-autoplay)', function() {
        return getVideoPlayer(
            {
              outsideView: false,
              autoplay: false,
              dock: true,
            }
        ).then(r => {
          return poll('checking class list', () => {
            return r.video.classList.contains('i-amphtml-dockable-video');
          }, undefined, TIMEOUT);
        });
      });
    });

    describe('without-autoplay', () => {
      it('should minimize when out of viewport', function() {
        let viewport;
        let video;
        let insideElement;
        return getVideoPlayer(
            {
              outsideView: true,
              autoplay: false,
              dock: true,
            }
        ).then(r => {
          video = r.video;
          const playButton = createButton(r, 'play');
          playButton.click();
          return listenOncePromise(video, VideoEvents.PLAY);
        }).then(() => {
          viewport = video.implementation_.getViewport();
          // scroll to the bottom, make video fully visible
          viewport.scrollIntoView(video);
          return poll('wait for scroll', () => {
            return video.querySelector('video, iframe')
             && viewport.getScrollTop() != 0;
          }, undefined, TIMEOUT);
        }).then(() => {
          viewport.setScrollTop(0);
          return poll('waiting for scroll', () => {
            return viewport.getScrollTop() == 0;
          }, undefined, TIMEOUT);
        }).then(() => {
          return poll('checking class list', () => {
            insideElement = video.querySelector('video, iframe');
            const classes = insideElement.classList;
            return classes.contains(DOCK_CLASS);
          }, undefined, TIMEOUT);
        }).then(() => {
          expect(insideElement).to.have.class(DOCK_CLASS);
          expect(st.getStyle(insideElement, 'transform')).to.equal(
              st.scale(DOCK_SCALE) + ' ' + st.translate(st.px(20), st.px(20))
          );
        });
      });
    });

    describe('with-autoplay', () => {
      it('should minimize when out of viewport', function() {
        let viewport;
        let video;
        let insideElement;
        return getVideoPlayer(
            {
              outsideView: false,
              autoplay: true,
              dock: true,
            }
        ).then(r => {
          video = r.video;
          viewport = video.implementation_.getViewport();
          return listenOncePromise(video, VideoEvents.PLAY);
        }).then(() => {
          return poll('wait for mask', () => {
            return !!video.querySelector('i-amphtml-video-mask');
          }, undefined, TIMEOUT);
        }).then(() => {
          video.querySelector('i-amphtml-video-mask').click();
          return poll('wait for mask to hide', () => {
            return !video.querySelector('i-amphtml-video-mask');
          });
        }).then(() => {
          viewport.setScrollTop(FRAME_HEIGHT);
          return poll('wait for video/iframe', () => {
            return !!video.querySelector('video, iframe');
          }, undefined, TIMEOUT);
        }).then(() => {
          return poll('wait for minimization', () => {
            insideElement = video.querySelector('video, iframe');
            const classes = insideElement.classList;
            return classes.contains(DOCK_CLASS);
          }, undefined, TIMEOUT);
        }).then(() => {
          expect(insideElement).to.have.class(DOCK_CLASS);
          expect(st.getStyle(insideElement, 'transform')).to.equal(
              st.scale(DOCK_SCALE) + ' ' + st.translate(st.px(20), st.px(20))
          );
        });
      });

      it('should only minimize when video is manually playing', function() {
        let viewport;
        let video;
        return getVideoPlayer(
            {
              outsideView: false,
              autoplay: true,
              dock: true,
            }
        ).then(r => {
          video = r.video;
          viewport = r.video.implementation_.getViewport();
          return listenOncePromise(video, VideoEvents.PLAY);
        }).then(() => {
          viewport.setScrollTop(FRAME_HEIGHT);
          return poll('wait for video/iframe', () => {
            return !!video.querySelector('video, iframe');
          }, undefined, TIMEOUT);
        }).then(() => {
          return poll('check for class', () => {
            const insideElement = video.querySelector('video, iframe');
            const classes = insideElement.classList;
            return !classes.contains(DOCK_CLASS);
          }, undefined, TIMEOUT);
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
      // Skip autoplay tests if browser does not support autoplay.
      return supportsAutoplay(window, false).then(supportsAutoplay => {
        if (!supportsAutoplay) {
          this.skip();
        }
      });
    });

    afterEach(cleanUp);
  });

  describe.configure().retryOnSaucelabs().run('Autoplay', function() {
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
          if (options.autoplay) {
            video.setAttribute('autoplay', '');
          }

          video.setAttribute('id', 'myVideo');

          if (options.dock) {
            video.setAttribute('dock', '');
          }

          video.style.position = 'absolute';
          video.style.top = top;

          video.setAttribute('controls', '');
          video.setAttribute('layout', 'fixed');
          video.setAttribute('width', '300px');
          video.setAttribute('height', '50vh');


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
