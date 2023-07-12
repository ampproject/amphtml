import {dispatchCustomEvent, waitForChildPromise} from '#core/dom';
import {isLayoutSizeDefined} from '#core/dom/layout';
import {isAutoplaySupported, resetIsAutoplaySupported} from '#core/dom/video';
import {toArray} from '#core/types/array';

import {Services} from '#service';
import {installVideoManagerForDoc} from '#service/video-manager-impl';

import {listenOncePromise} from '#utils/event-helper';

import {runVideoPlayerIntegrationTests} from './test-video-players-helper';

import {PlayingStates_Enum, VideoEvents_Enum} from '../../src/video-interface';

// TODO(dvoytenko): These tests time out when run with the prod AMP config.
// See #11588.
describes.sandboxed
  .configure()
  .skip('Fake Video PlayerIntegration Tests', {}, (env) => {
    // We run the video player integration tests on a fake video player as part
    // of functional testing. Same tests run on real video players such as
    // `amp-video` and `amp-youtube` as part of integration testing.
    runVideoPlayerIntegrationTests(env, (fixture) => {
      fixture.win.AMP.push({
        n: 'amp-test-fake-videoplayer',
        f: function (AMP) {
          AMP.registerElement(
            'amp-test-fake-videoplayer',
            createFakeVideoPlayerClass(fixture.win)
          );
        },
      });
      return fixture.doc.createElement('amp-test-fake-videoplayer');
    });
  });

describes.sandboxed
  .configure()
  .ifChrome()
  .run('VideoManager', {}, function () {
    describes.realWin(
      'VideoManager',
      {
        amp: {
          ampdoc: 'single',
        },
      },
      (env) => {
        let videoManager;
        let klass;
        let video;
        let impl;

        beforeEach(async () => {
          klass = createFakeVideoPlayerClass(env.win);
          video = env.createAmpElement('amp-test-fake-videoplayer', klass);
          video.setAttribute('layout', 'fixed');
          video.setAttribute('width', '400');
          video.setAttribute('height', '300');
          env.win.document.body.appendChild(video);
          video.connectedCallback();
          impl = await video.getImpl(false);
          installVideoManagerForDoc(env.ampdoc);
          videoManager = Services.videoManagerForDoc(env.ampdoc);
        });

        it('should not duplicate entries if laid out twice', async () => {
          videoManager.register(impl);
          expect(videoManager.entries_).to.have.length(1);
          videoManager.register(impl);
          expect(videoManager.entries_).to.have.length(1);
        });

        it('should receive i-amphtml-video-interface class when registered', () => {
          const expectedClass = 'i-amphtml-video-interface';
          expect(toArray(video.classList)).to.not.contain(expectedClass);
          videoManager.register(impl);
          expect(toArray(video.classList)).to.contain(expectedClass);
        });

        it('should register common actions', () => {
          const spy = env.sandbox.spy(impl, 'registerAction');
          videoManager.register(impl);

          expect(spy).to.have.been.calledWith('play');
          expect(spy).to.have.been.calledWith('pause');
          expect(spy).to.have.been.calledWith('mute');
          expect(spy).to.have.been.calledWith('unmute');
        });

        it('should be paused if autoplay is not set', () => {
          videoManager.register(impl);
          const entry = videoManager.getEntry_(impl);
          entry.isVisible_ = false;

          const curState = videoManager.getPlayingState(impl);
          expect(curState).to.equal(PlayingStates_Enum.PAUSED);
        });

        it('autoplay - should be PLAYING_MANUAL if user interacted', () => {
          video.setAttribute('autoplay', '');

          videoManager.register(impl);

          const entry = videoManager.getEntry_(impl);
          env.sandbox.stub(entry, 'userInteracted').returns(true);
          entry.isVisible_ = true;
          entry.loaded_ = true;

          impl.play();
          return listenOncePromise(video, VideoEvents_Enum.PLAYING).then(() => {
            const curState = videoManager.getPlayingState(impl);
            expect(curState).to.equal(PlayingStates_Enum.PLAYING_MANUAL);
          });
        });

        it('autoplay - should be PLAYING_AUTO if user did not interact', () => {
          video.setAttribute('autoplay', '');
          videoManager.register(impl);

          const visibilityStub = env.sandbox.stub(env.ampdoc, 'isVisible');
          visibilityStub.onFirstCall().returns(true);

          const entry = videoManager.getEntry_(impl);
          entry.isVisible_ = true;
          entry.loaded_ = true;
          entry.videoVisibilityChanged_();

          return listenOncePromise(video, VideoEvents_Enum.PLAYING).then(() => {
            const curState = videoManager.getPlayingState(impl);
            expect(curState).to.equal(PlayingStates_Enum.PLAYING_AUTO);
          });
        });

        // TODO(aghassemi): Investigate failure. #10974.
        it.skip(
          'autoplay - autoplay not supported should behave' +
            'like manual play',
          () => {
            video.setAttribute('autoplay', '');
            videoManager.register(impl);

            const visibilityStub = env.sandbox.stub(env.ampdoc, 'isVisible');
            visibilityStub.onFirstCall().returns(true);

            const entry = videoManager.getEntry_(impl);

            const supportsAutoplayStub = env.sandbox.stub(
              entry,
              'supportsAutoplay_'
            );

            supportsAutoplayStub.returns(Promise.reject());

            entry.isVisible_ = true;
            entry.loaded_ = true;

            entry.videoVisibilityChanged_();

            return new Promise(function (resolve, reject) {
              listenOncePromise(video, VideoEvents_Enum.PLAYING).then(() => {
                reject();
              });
              setTimeout(function () {
                const curState = videoManager.getPlayingState(impl);
                expect(curState).to.equal(PlayingStates_Enum.PAUSED);
                resolve('Video did not autoplay as expected');
              }, 1000);
            });
          }
        );

        it('autoplay - should be PAUSED if pause after playing', () => {
          video.setAttribute('autoplay', '');

          videoManager.register(impl);

          impl.play();

          const entry = videoManager.getEntry_(impl);
          env.sandbox.stub(entry, 'userInteracted').returns(true);
          entry.isVisible_ = false;

          impl.pause();
          return listenOncePromise(video, VideoEvents_Enum.PAUSE).then(() => {
            const curState = videoManager.getPlayingState(impl);
            expect(curState).to.equal(PlayingStates_Enum.PAUSED);
          });
        });

        it('autoplay - initially there should be no user interaction', () => {
          video.setAttribute('autoplay', '');

          videoManager.register(impl);
          const entry = videoManager.getEntry_(impl);
          entry.isVisible_ = false;

          expect(videoManager.userInteracted(impl)).to.be.false;
        });

        it('autoplay - there should be user interaction if the ad was unmuted', async () => {
          video.setAttribute('autoplay', '');

          const playingPromise = listenOncePromise(
            video,
            VideoEvents_Enum.PLAYING
          );
          const unmutedPromise = listenOncePromise(
            video,
            VideoEvents_Enum.UNMUTED
          );

          videoManager.register(impl);
          const entry = videoManager.getEntry_(impl);
          entry.isVisible_ = true;
          entry.loaded_ = true;
          entry.autoplayLoadedVideoVisibilityChanged_();

          expect(videoManager.userInteracted(impl)).to.be.false;

          dispatchCustomEvent(video, VideoEvents_Enum.AD_START);

          await playingPromise;

          impl.unmute();
          await unmutedPromise;

          expect(videoManager.userInteracted(impl)).to.be.true;
        });

        it('autoplay - hide autoplay elements when PLAYING after AD_START', async () => {
          video.setAttribute('autoplay', '');
          video.setAttribute('controls', '');

          const playingPromise = listenOncePromise(
            video,
            VideoEvents_Enum.PLAYING
          );

          videoManager.register(impl);
          const entry = videoManager.getEntry_(impl);
          entry.isVisible_ = true;
          entry.loaded_ = true;

          dispatchCustomEvent(video, VideoEvents_Enum.AD_START);

          entry.autoplayLoadedVideoVisibilityChanged_();

          await playingPromise;

          let eq, mask;
          await waitForChildPromise(video, () => {
            eq = eq || video.querySelector('.amp-video-eq');
            mask = mask || video.querySelector('.i-amphtml-video-mask');
            return eq && mask;
          });

          expect(eq).to.have.attribute('hidden');
          expect(mask).to.have.attribute('hidden');
        });

        it('autoplay - show autoplay elements when PLAYING', async () => {
          video.setAttribute('autoplay', '');
          video.setAttribute('controls', '');

          const playingPromise = listenOncePromise(
            video,
            VideoEvents_Enum.PLAYING
          );

          videoManager.register(impl);
          const entry = videoManager.getEntry_(impl);
          entry.isVisible_ = true;
          entry.loaded_ = true;

          entry.autoplayLoadedVideoVisibilityChanged_();

          await playingPromise;

          let eq, mask;
          await waitForChildPromise(video, () => {
            eq = eq || video.querySelector('.amp-video-eq');
            mask = mask || video.querySelector('.i-amphtml-video-mask');
            return eq && mask;
          });

          expect(eq).to.not.have.attribute('hidden');
          expect(mask).to.not.have.attribute('hidden');
        });

        it('autoplay - PAUSED if autoplaying and video is outside of view', () => {
          video.setAttribute('autoplay', '');

          videoManager.register(impl);

          const visibilityStub = env.sandbox.stub(env.ampdoc, 'isVisible');
          visibilityStub.onFirstCall().returns(true);

          const entry = videoManager.getEntry_(impl);
          entry.isVisible_ = true;
          entry.loaded_ = true;
          entry.videoVisibilityChanged_();

          entry.isVisible_ = false;
          entry.videoVisibilityChanged_();
          const curState = videoManager.getPlayingState(impl);
          expect(curState).to.equal(PlayingStates_Enum.PAUSED);
        });

        it('no autoplay - should pause if user presses pause after playing', () => {
          videoManager.register(impl);
          const entry = videoManager.getEntry_(impl);
          entry.isVisible_ = false;

          impl.play();
          return listenOncePromise(video, VideoEvents_Enum.PLAYING).then(() => {
            impl.pause();
            listenOncePromise(video, VideoEvents_Enum.PAUSE).then(() => {
              const curState = videoManager.getPlayingState(impl);
              expect(curState).to.equal(PlayingStates_Enum.PAUSED);
            });
          });
        });

        it('no autoplay - should be playing manual whenever playing', () => {
          videoManager.register(impl);
          const entry = videoManager.getEntry_(impl);
          entry.isVisible_ = false;

          impl.play();
          return listenOncePromise(video, VideoEvents_Enum.PLAYING).then(() => {
            const curState = videoManager.getPlayingState(impl);
            expect(curState).to.equal(PlayingStates_Enum.PLAYING_MANUAL);
          });
        });
      }
    );
  });

describes.sandboxed
  .configure()
  .ifChrome()
  .run('Autoplay support', {}, (env) => {
    let win;
    let video;
    let createElementSpy;
    let setAttributeSpy;
    let playStub;

    beforeEach(() => {
      video = {
        setAttribute() {},
        style: {
          position: null,
          top: null,
          width: null,
          height: null,
          opacity: null,
          setProperty(name, value) {
            video.style[name] = value;
          },
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

      win = {document: doc};

      createElementSpy = env.sandbox.spy(doc, 'createElement');
      setAttributeSpy = env.sandbox.spy(video, 'setAttribute');
      playStub = env.sandbox.stub(video, 'play');

      resetIsAutoplaySupported(win);
    });

    afterEach(() => {
      resetIsAutoplaySupported(win);
    });

    it('should create an invisible test video element', () => {
      return isAutoplaySupported(win).then(() => {
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
      return isAutoplaySupported(win).then((supportsAutoplay) => {
        expect(supportsAutoplay).to.be.false;
        expect(playStub.called).to.be.true;
        expect(createElementSpy.called).to.be.true;
      });
    });

    it('should return true if `paused` is false after `play()` call', () => {
      video.paused = false;
      return isAutoplaySupported(win).then((supportsAutoplay) => {
        expect(supportsAutoplay).to.be.true;
        expect(playStub.called).to.be.true;
        expect(createElementSpy.called).to.be.true;
      });
    });

    it('should suppress errors if detection play call throws', () => {
      playStub.throws();
      video.paused = true;
      return isAutoplaySupported(win).then((supportsAutoplay) => {
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
      return isAutoplaySupported(win).then((supportsAutoplay) => {
        expect(supportsAutoplay).to.be.false;
        expect(playStub.called).to.be.true;
        expect(createElementSpy.called).to.be.true;
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
      const ampdoc = Services.ampdocServiceFor(this.win).getSingleDoc();
      installVideoManagerForDoc(ampdoc);
      Services.videoManagerForDoc(this.win.document).register(this);
    }

    /** @override */
    layoutCallback() {
      const iframe = this.element.ownerDocument.createElement('iframe');
      this.element.appendChild(iframe);

      return Promise.resolve().then(() => {
        dispatchCustomEvent(this.element, VideoEvents_Enum.LOAD);
      });
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
        dispatchCustomEvent(this.element, VideoEvents_Enum.PLAYING);
        this.timeoutId_ = this.timer_.delay(() => {
          this.currentTime_ = this.duration_;
          dispatchCustomEvent(this.element, VideoEvents_Enum.PAUSE);
        }, this.length_);
      });
    }

    /**
     * @override
     */
    pause() {
      Promise.resolve().then(() => {
        dispatchCustomEvent(this.element, VideoEvents_Enum.PAUSE);
        this.timer_.cancel(this.timeoutId_);
      });
    }

    /**
     * @override
     */
    mute() {
      Promise.resolve().then(() => {
        dispatchCustomEvent(this.element, VideoEvents_Enum.MUTED);
      });
    }

    /**
     * @override
     */
    unmute() {
      Promise.resolve().then(() => {
        dispatchCustomEvent(this.element, VideoEvents_Enum.UNMUTED);
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
    preimplementsAutoFullscreen() {
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
