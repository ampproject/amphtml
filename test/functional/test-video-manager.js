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
import {ampdocServiceFor} from '../../src/ampdoc';
import {isLayoutSizeDefined} from '../../src/layout';
import {VideoEvents} from '../../src/video-interface';
import {videoManagerForDoc, viewerForDoc} from '../../src/services';
import {
  installVideoManagerForDoc,
  supportsAutoplay,
  clearSupportsAutoplayCacheForTesting,
  PlayingStates,
} from '../../src/service/video-manager-impl';
import {
  runVideoPlayerIntegrationTests,
} from '../integration/test-video-players-helper';
import * as sinon from 'sinon';

describe('Fake Video Player Integration Tests', () => {
  // We run the video player integration tests on a fake video player as part
  // of functional testing. Same tests run on real video players such as
  // `amp-video` and `amp-youtube` as part of integration testing.
  runVideoPlayerIntegrationTests(fixture => {
    fixture.win.AMP.registerElement('amp-test-fake-videoplayer',
        createFakeVideoPlayerClass(fixture.win));
    return fixture.doc.createElement('amp-test-fake-videoplayer');
  });
});

describes.fakeWin('VideoManager', {
  amp: {
    ampdoc: 'single',
  },
}, env => {
  let sandbox;
  let videoManager;

  it('should register common actions', () => {
    const klass = createFakeVideoPlayerClass(env.win);
    const video = env.createAmpElement('amp-test-fake-videoplayer', klass);
    const impl = video.implementation_;
    const spy = sandbox.spy(impl, 'registerAction');
    videoManager.register(impl);

    expect(spy).to.have.been.calledWith('play');
    expect(spy).to.have.been.calledWith('pause');
    expect(spy).to.have.been.calledWith('mute');
    expect(spy).to.have.been.calledWith('unmute');
  });

  it('should be paused if autoplay is not set', () => {
    const klass = createFakeVideoPlayerClass(env.win);
    const video = env.createAmpElement('amp-test-fake-videoplayer', klass);
    const impl = video.implementation_;


    videoManager.register(impl);
    const entry = videoManager.getEntryForVideo_(impl);
    entry.isVisible_ = false;

    const curState = videoManager.getPlayingState(impl);
    expect(curState).to.equal(PlayingStates.PAUSED);
  });


  it('autoplay - should be PLAYING_MANUAL if user interacted', () => {
    const klass = createFakeVideoPlayerClass(env.win);
    const video = env.createAmpElement('amp-test-fake-videoplayer', klass);
    const impl = video.implementation_;

    video.setAttribute('autoplay', '');

    videoManager.register(impl);

    const entry = videoManager.getEntryForVideo_(impl);
    entry.userInteractedWithAutoPlay_ = true;
    entry.isVisible_ = true;

    impl.play();
    return listenOncePromise(video, VideoEvents.PLAY).then(() => {
      const curState = videoManager.getPlayingState(impl);
      expect(curState).to.equal(PlayingStates.PLAYING_MANUAL);
    });
  });


  it('autoplay - should be PLAYING_AUTO if user did not interact', () => {
    const klass = createFakeVideoPlayerClass(env.win);
    const video = env.createAmpElement('amp-test-fake-videoplayer', klass);
    const impl = video.implementation_;

    video.setAttribute('autoplay', '');
    videoManager.register(impl);

    const visibilityStub = sandbox.stub(viewerForDoc(env.ampdoc), 'isVisible');
    visibilityStub.onFirstCall().returns(true);

    const entry = videoManager.getEntryForVideo_(impl);
    entry.isVisible_ = true;
    entry.loaded_ = true;
    entry.videoVisibilityChanged_();

    return listenOncePromise(video, VideoEvents.PLAY).then(() => {
      const curState = videoManager.getPlayingState(impl);
      expect(curState).to.equal(PlayingStates.PLAYING_AUTO);

    });

  });

  it('autoplay - autoplay not supported should behave like manual play', () => {
    const klass = createFakeVideoPlayerClass(env.win);
    const video = env.createAmpElement('amp-test-fake-videoplayer', klass);
    const impl = video.implementation_;

    video.setAttribute('autoplay', '');
    videoManager.register(impl);

    const visibilityStub = sandbox.stub(viewerForDoc(env.ampdoc), 'isVisible');
    visibilityStub.onFirstCall().returns(true);

    const entry = videoManager.getEntryForVideo_(impl);

    const supportsAutoplayStub = sandbox.stub(entry, 'boundSupportsAutoplay_');
    supportsAutoplayStub.returns(Promise.reject());

    entry.isVisible_ = true;
    entry.loaded_ = true;

    entry.videoVisibilityChanged_();

    return new Promise(function(resolve, reject) {
      listenOncePromise(video, VideoEvents.PLAY).then(() => {
        reject();
      });
      setTimeout(function() {
        const curState = videoManager.getPlayingState(impl);
        expect(curState).to.equal(PlayingStates.PAUSED);
        resolve('Video did not autoplay as expected');
      }, 1000);
    });
  });

  it('autoplay - should be PAUSED if pause after playing', () => {
    const klass = createFakeVideoPlayerClass(env.win);
    const video = env.createAmpElement('amp-test-fake-videoplayer', klass);
    const impl = video.implementation_;

    video.setAttribute('autoplay', '');

    videoManager.register(impl);

    impl.play();

    const entry = videoManager.getEntryForVideo_(impl);
    entry.userInteractedWithAutoPlay_ = true;
    entry.isVisible_ = false;

    impl.pause();
    return listenOncePromise(video, VideoEvents.PAUSE).then(() => {
      const curState = videoManager.getPlayingState(impl);
      expect(curState).to.equal(PlayingStates.PAUSED);
    });
  });

  it('autoplay - initially there should be no user interaction', () => {
    const klass = createFakeVideoPlayerClass(env.win);
    const video = env.createAmpElement('amp-test-fake-videoplayer', klass);
    const impl = video.implementation_;

    video.setAttribute('autoplay', '');

    videoManager.register(impl);
    const entry = videoManager.getEntryForVideo_(impl);
    entry.isVisible_ = false;

    const userInteracted = videoManager.userInteractedWithAutoPlay(impl);
    expect(userInteracted).to.be.false;
  });


  it('autoplay - PAUSED if autoplaying and video is outside of view', () => {
    const klass = createFakeVideoPlayerClass(env.win);
    const video = env.createAmpElement('amp-test-fake-videoplayer', klass);
    const impl = video.implementation_;

    video.setAttribute('autoplay', '');

    videoManager.register(impl);
    const entry = videoManager.getEntryForVideo_(impl);
    entry.isVisible_ = true;

    impl.play();
    entry.isVisible_ = false;
    const curState = videoManager.getPlayingState(impl);
    expect(curState).to.equal(PlayingStates.PAUSED);
  });


  it(`no autoplay - should be paused if the
    user pressed pause after playing`, () => {
    const klass = createFakeVideoPlayerClass(env.win);
    const video = env.createAmpElement('amp-test-fake-videoplayer', klass);
    const impl = video.implementation_;


    videoManager.register(impl);
    const entry = videoManager.getEntryForVideo_(impl);
    entry.isVisible_ = false;

    impl.play();
    return listenOncePromise(video, VideoEvents.PLAY).then(() => {
      impl.pause();
      listenOncePromise(video, VideoEvents.PAUSE).then(() => {
        const curState = videoManager.getPlayingState(impl);
        expect(curState).to.equal(PlayingStates.PAUSED);
      });
    });
  });

  it('no autoplay - should be playing manual whenever video is playing', () => {
    const klass = createFakeVideoPlayerClass(env.win);
    const video = env.createAmpElement('amp-test-fake-videoplayer', klass);
    const impl = video.implementation_;


    videoManager.register(impl);
    const entry = videoManager.getEntryForVideo_(impl);
    entry.isVisible_ = false;

    impl.play();
    return listenOncePromise(video, VideoEvents.PLAY).then(() => {
      const curState = videoManager.getPlayingState(impl);
      expect(curState).to.equal(PlayingStates.PLAYING_MANUAL);
    });
  });


  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    installVideoManagerForDoc(env.ampdoc);
    videoManager = videoManagerForDoc(env.ampdoc);
  });
  afterEach(() => {
    sandbox.restore();
  });

});

describe('Supports Autoplay', () => {
  let sandbox;

  let win;
  let video;

  let isLite;

  let createElementSpy;
  let setAttributeSpy;
  let playStub;

  it('should create an invisible test video element', () => {
    return supportsAutoplay(win, isLite).then(() => {
      expect(video.style.position).to.equal('fixed');
      expect(video.style.top).to.equal('0');
      expect(video.style.width).to.equal('0');
      expect(video.style.height).to.equal('0');
      expect(video.style.opacity).to.equal('0');

      expect(setAttributeSpy).to.have.been.calledWith('muted', '');
      expect(setAttributeSpy).to.have.been.calledWith('playsinline', '');
      expect(setAttributeSpy).to.have.been.calledWith('webkit-playsinline', '');
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
    const p = Promise.reject('play() can only be initiated by a user gesture.');
    const promiseCatchSpy = sandbox.spy(p, 'catch');
    playStub.returns(p);
    video.paused = true;
    expect(supportsAutoplay(win, isLite)).not.to.throw;
    return supportsAutoplay(win, isLite).then(supportsAutoplay => {
      expect(promiseCatchSpy.called).to.be.true;
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

  it('should cache the result', () => {
    const firstResultRef = supportsAutoplay(win, isLite);
    const secondResultRef = supportsAutoplay(win, isLite);
    expect(firstResultRef).to.equal(secondResultRef);

    clearSupportsAutoplayCacheForTesting();

    const thirdResultRef = supportsAutoplay(win, isLite);
    expect(thirdResultRef).to.not.equal(firstResultRef);
    expect(thirdResultRef).to.not.equal(secondResultRef);
  });

  beforeEach(() => {
    clearSupportsAutoplayCacheForTesting();
    sandbox = sinon.sandbox.create();

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
  });

  afterEach(() => {
    sandbox.restore();
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
    }

    /** @override */
    isLayoutSupported(layout) {
      return isLayoutSizeDefined(layout);
    }

    /** @override */
    buildCallback() {
      const ampdoc = ampdocServiceFor(this.win).getAmpDoc();
      installVideoManagerForDoc(ampdoc);
      videoManagerForDoc(this.win.document).register(this);
    }

    /** @override */
    layoutCallback() {
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
        this.element.dispatchCustomEvent(VideoEvents.PLAY);
      });
    }

    /**
     * @override
     */
    pause() {
      Promise.resolve().then(() => {
        this.element.dispatchCustomEvent(VideoEvents.PAUSE);
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
    showControls() {
    }

    /**
     * @override
     */
    hideControls() {
    }
  };
}
