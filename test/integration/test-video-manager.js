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

import {PlayingStates, VideoEvents} from '../../src/video-interface';
import {Services} from '../../src/services';
import {VideoUtils} from '../../src/utils/video';
import {installVideoManagerForDoc} from '../../src/service/video-manager-impl';
import {isLayoutSizeDefined} from '../../src/layout';
import {listenOncePromise} from '../../src/event-helper';
import {runVideoPlayerIntegrationTests} from './test-video-players-helper';
import {toArray} from '../../src/types';

// TODO(dvoytenko): These tests time out when run with the prod AMP config.
// See #11588.
describe.configure().skip('Fake Video Player' + 'Integration Tests', () => {
  // We run the video player integration tests on a fake video player as part
  // of functional testing. Same tests run on real video players such as
  // `amp-video` and `amp-youtube` as part of integration testing.
  runVideoPlayerIntegrationTests(fixture => {
    fixture.win.AMP.push({
      n: 'amp-test-fake-videoplayer',
      f: function(AMP) {
        AMP.registerElement(
          'amp-test-fake-videoplayer',
          createFakeVideoPlayerClass(fixture.win)
        );
      },
    });
    return fixture.doc.createElement('amp-test-fake-videoplayer');
  });
});

describe
  .configure()
  .ifChrome()
  .run('VideoManager', function() {
    describes.fakeWin(
      'VideoManager',
      {
        amp: {
          ampdoc: 'single',
        },
      },
      env => {
        let sandbox;
        let videoManager;
        let klass;
        let video;
        let impl;

        it('should receive i-amphtml-video-interface class when registered', () => {
          const expectedClass = 'i-amphtml-video-interface';
          expect(toArray(video.classList)).to.not.contain(expectedClass);
          videoManager.register(impl);
          expect(toArray(video.classList)).to.contain(expectedClass);
        });

        it('should register common actions', () => {
          const spy = sandbox.spy(impl, 'registerAction');
          videoManager.register(impl);

          expect(spy).to.have.been.calledWith('play');
          expect(spy).to.have.been.calledWith('pause');
          expect(spy).to.have.been.calledWith('mute');
          expect(spy).to.have.been.calledWith('unmute');
        });

        it('should be paused if autoplay is not set', () => {
          videoManager.register(impl);
          const entry = videoManager.getEntryForVideo_(impl);
          entry.isVisible_ = false;

          const curState = videoManager.getPlayingState(impl);
          expect(curState).to.equal(PlayingStates.PAUSED);
        });

        it('autoplay - should be PLAYING_MANUAL if user interacted', () => {
          video.setAttribute('autoplay', '');

          videoManager.register(impl);

          const entry = videoManager.getEntryForVideo_(impl);
          sandbox.stub(entry, 'userInteracted').returns(true);
          entry.isVisible_ = true;
          entry.loaded_ = true;

          impl.play();
          return listenOncePromise(video, VideoEvents.PLAYING).then(() => {
            const curState = videoManager.getPlayingState(impl);
            expect(curState).to.equal(PlayingStates.PLAYING_MANUAL);
          });
        });

        it('autoplay - should be PLAYING_AUTO if user did not interact', () => {
          video.setAttribute('autoplay', '');
          videoManager.register(impl);

          const visibilityStub = sandbox.stub(
            Services.viewerForDoc(env.ampdoc),
            'isVisible'
          );
          visibilityStub.onFirstCall().returns(true);

          const entry = videoManager.getEntryForVideo_(impl);
          entry.isVisible_ = true;
          entry.loaded_ = true;
          entry.videoVisibilityChanged_();

          return listenOncePromise(video, VideoEvents.PLAYING).then(() => {
            const curState = videoManager.getPlayingState(impl);
            expect(curState).to.equal(PlayingStates.PLAYING_AUTO);
          });
        });

        // TODO(aghassemi): Investigate failure. #10974.
        it.skip(
          'autoplay - autoplay not supported should behave' +
            'like manual play',
          () => {
            video.setAttribute('autoplay', '');
            videoManager.register(impl);

            const visibilityStub = sandbox.stub(
              Services.viewerForDoc(env.ampdoc),
              'isVisible'
            );
            visibilityStub.onFirstCall().returns(true);

            const entry = videoManager.getEntryForVideo_(impl);

            const supportsAutoplayStub = sandbox.stub(
              entry,
              'supportsAutoplay_'
            );

            supportsAutoplayStub.returns(Promise.reject());

            entry.isVisible_ = true;
            entry.loaded_ = true;

            entry.videoVisibilityChanged_();

            return new Promise(function(resolve, reject) {
              listenOncePromise(video, VideoEvents.PLAYING).then(() => {
                reject();
              });
              setTimeout(function() {
                const curState = videoManager.getPlayingState(impl);
                expect(curState).to.equal(PlayingStates.PAUSED);
                resolve('Video did not autoplay as expected');
              }, 1000);
            });
          }
        );

        it('autoplay - should be PAUSED if pause after playing', () => {
          video.setAttribute('autoplay', '');

          videoManager.register(impl);

          impl.play();

          const entry = videoManager.getEntryForVideo_(impl);
          sandbox.stub(entry, 'userInteracted').returns(true);
          entry.isVisible_ = false;

          impl.pause();
          return listenOncePromise(video, VideoEvents.PAUSE).then(() => {
            const curState = videoManager.getPlayingState(impl);
            expect(curState).to.equal(PlayingStates.PAUSED);
          });
        });

        it('autoplay - initially there should be no user interaction', () => {
          video.setAttribute('autoplay', '');

          videoManager.register(impl);
          const entry = videoManager.getEntryForVideo_(impl);
          entry.isVisible_ = false;

          expect(videoManager.userInteracted(impl)).to.be.false;
        });

        it('autoplay - PAUSED if autoplaying and video is outside of view', () => {
          video.setAttribute('autoplay', '');

          videoManager.register(impl);

          const visibilityStub = sandbox.stub(
            Services.viewerForDoc(env.ampdoc),
            'isVisible'
          );
          visibilityStub.onFirstCall().returns(true);

          const entry = videoManager.getEntryForVideo_(impl);
          entry.isVisible_ = true;
          entry.loaded_ = true;
          entry.videoVisibilityChanged_();

          entry.isVisible_ = false;
          entry.videoVisibilityChanged_();
          const curState = videoManager.getPlayingState(impl);
          expect(curState).to.equal(PlayingStates.PAUSED);
        });

        it('no autoplay - should pause if user presses pause after playing', () => {
          videoManager.register(impl);
          const entry = videoManager.getEntryForVideo_(impl);
          entry.isVisible_ = false;

          impl.play();
          return listenOncePromise(video, VideoEvents.PLAYING).then(() => {
            impl.pause();
            listenOncePromise(video, VideoEvents.PAUSE).then(() => {
              const curState = videoManager.getPlayingState(impl);
              expect(curState).to.equal(PlayingStates.PAUSED);
            });
          });
        });

        it('no autoplay - should be playing manual whenever playing', () => {
          videoManager.register(impl);
          const entry = videoManager.getEntryForVideo_(impl);
          entry.isVisible_ = false;

          impl.play();
          return listenOncePromise(video, VideoEvents.PLAYING).then(() => {
            const curState = videoManager.getPlayingState(impl);
            expect(curState).to.equal(PlayingStates.PLAYING_MANUAL);
          });
        });

        beforeEach(() => {
          sandbox = sinon.sandbox;
          klass = createFakeVideoPlayerClass(env.win);
          video = env.createAmpElement('amp-test-fake-videoplayer', klass);
          env.win.document.body.appendChild(video);
          impl = video.implementation_;
          installVideoManagerForDoc(env.ampdoc);
          videoManager = Services.videoManagerForDoc(env.ampdoc);
        });

        afterEach(() => {
          sandbox.restore();
        });
      }
    );
  });

describe
  .configure()
  .ifChrome()
  .run('Autoplay support', () => {
    const supportsAutoplay = VideoUtils.isAutoplaySupported; // for line length

    let sandbox;

    let win;
    let video;

    let isLite;

    let createElementSpy;
    let setAttributeSpy;
    let playStub;

    beforeEach(() => {
      sandbox = sinon.sandbox;

      video = {
        setAttribute() {},
        style: {
          position: null,
          top: null,
          width: null,
          height: null,
          opacity: null,
        },
        muted: null,
        playsinline: null,
        webkitPlaysinline: null,
        paused: false,
        play() {},
      };

      const doc = {
        createElement() {
          return video;
        },
      };

      win = {
        document: doc,
      };

      isLite = false;

      createElementSpy = sandbox.spy(doc, 'createElement');
      setAttributeSpy = sandbox.spy(video, 'setAttribute');
      playStub = sandbox.stub(video, 'play');

      VideoUtils.resetIsAutoplaySupported();
    });

    afterEach(() => {
      VideoUtils.resetIsAutoplaySupported();

      sandbox.restore();
    });

    it('should create an invisible test video element', () => {
      return supportsAutoplay(win, isLite).then(() => {
        expect(video.style.position).to.equal('fixed');
        expect(video.style.top).to.equal('0');
        expect(video.style.width).to.equal('0');
        expect(video.style.height).to.equal('0');
        expect(video.style.opacity).to.equal('0');

        expect(setAttributeSpy).to.have.been.calledWith('muted', '');
        expect(setAttributeSpy).to.have.been.calledWith('playsinline', '');
        expect(setAttributeSpy).to.have.been.calledWith(
          'webkit-playsinline',
          ''
        );
        expect(setAttributeSpy).to.have.been.calledWith('height', '0');
        expect(setAttributeSpy).to.have.been.calledWith('width', '0');

        expect(video.muted).to.be.true;
        expect(video.playsinline).to.be.true;
        expect(video.webkitPlaysinline).to.be.true;

        expect(createElementSpy.called).to.be.true;
      });
    });

    it('should return false if `paused` is true after `play()` call', () => {
      video.paused = true;
      return supportsAutoplay(win, isLite).then(supportsAutoplay => {
        expect(supportsAutoplay).to.be.false;
        expect(playStub.called).to.be.true;
        expect(createElementSpy.called).to.be.true;
      });
    });

    it('should return true if `paused` is false after `play()` call', () => {
      video.paused = false;
      return supportsAutoplay(win, isLite).then(supportsAutoplay => {
        expect(supportsAutoplay).to.be.true;
        expect(playStub.called).to.be.true;
        expect(createElementSpy.called).to.be.true;
      });
    });

    it('should suppress errors if detection play call throws', () => {
      playStub.throws();
      video.paused = true;
      expect(supportsAutoplay(win, isLite)).not.to.throw;
      return supportsAutoplay(win, isLite).then(supportsAutoplay => {
        expect(supportsAutoplay).to.be.false;
        expect(playStub.called).to.be.true;
        expect(createElementSpy.called).to.be.true;
      });
    });

    it('should suppress errors if detection play call rejects a promise', () => {
      const p = Promise.reject(
        'play() can only be initiated by a user gesture.'
      );
      playStub.returns(p);
      video.paused = true;
      expect(supportsAutoplay(win, isLite)).not.to.throw;
      return supportsAutoplay(win, isLite).then(supportsAutoplay => {
        expect(supportsAutoplay).to.be.false;
        expect(playStub.called).to.be.true;
        expect(createElementSpy.called).to.be.true;
      });
    });

    it('should be false when in amp-lite mode', () => {
      isLite = true;
      return supportsAutoplay(win, isLite).then(supportsAutoplay => {
        expect(supportsAutoplay).to.be.false;
      });
    });
  });

function createFakeVideoPlayerClass(win) {
  /**
   * @implements {../../src/video-interface.VideoInterface}
   */
  return class FakeVideoPlayer extends win.AMP.BaseElement {
    /** @param {!AmpElement} element */
    constructor(element) {
      super(element);

      /** @private @const */
      this.timer_ = Services.timerFor(this.win);

      /** @private @const */
      this.length_ = 10000;

      /** @private @const */
      this.duration_ = 10;

      /** @private */
      this.currentTime_ = 0;

      /** @private */
      this.timeoutId_ = null;
    }

    /** @override */
    isLayoutSupported(layout) {
      return isLayoutSizeDefined(layout);
    }

    /** @override */
    buildCallback() {
      const ampdoc = Services.ampdocServiceFor(this.win).getAmpDoc();
      installVideoManagerForDoc(ampdoc);
      Services.videoManagerForDoc(this.win.document).register(this);
    }

    /** @override */
    layoutCallback() {
      const iframe = this.element.ownerDocument.createElement('iframe');
      this.element.appendChild(iframe);

      return Promise.resolve().then(() => {
        this.element.dispatchCustomEvent(VideoEvents.LOAD);
      });
    }

    /** @override */
    viewportCallback(visible) {
      this.element.dispatchCustomEvent(VideoEvents.VISIBILITY, {visible});
    }

    // VideoInterface Implementation. See ../src/video-interface.VideoInterface

    /**
     * @override
     */
    supportsPlatform() {
      return true;
    }

    /**
     * @override
     */
    isInteractive() {
      return true;
    }

    /**
     * @override
     */
    play(unusedIsAutoplay) {
      Promise.resolve().then(() => {
        this.element.dispatchCustomEvent(VideoEvents.PLAYING);
        this.timeoutId_ = this.timer_.delay(() => {
          this.currentTime_ = this.duration_;
          this.element.dispatchCustomEvent(VideoEvents.PAUSE);
        }, this.length_);
      });
    }

    /**
     * @override
     */
    pause() {
      Promise.resolve().then(() => {
        this.element.dispatchCustomEvent(VideoEvents.PAUSE);
        this.timer_.cancel(this.timeoutId_);
      });
    }

    /**
     * @override
     */
    mute() {
      Promise.resolve().then(() => {
        this.element.dispatchCustomEvent(VideoEvents.MUTED);
      });
    }

    /**
     * @override
     */
    unmute() {
      Promise.resolve().then(() => {
        this.element.dispatchCustomEvent(VideoEvents.UNMUTED);
      });
    }

    /**
     * @override
     */
    showControls() {}

    /**
     * @override
     */
    hideControls() {}

    /**
     * @override
     */
    fullscreenEnter() {}

    /**
     * @override
     */
    fullscreenExit() {}

    /**
     * @override
     */
    isFullscreen() {}

    /** @override */
    getCurrentTime() {
      return this.currentTime_;
    }

    /** @override */
    getMetadata() {
      // Not supported
    }

    /** @override */
    preimplementsMediaSessionAPI() {
      return false;
    }

    /** @override */
    getDuration() {
      return this.duration_;
    }

    /** @override */
    getPlayedRanges() {
      return [];
    }
  };
}
