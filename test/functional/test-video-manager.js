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


import {BaseElement} from '../../src/base-element';
import {createAmpElementProto} from '../../src/custom-element';
import {waitForChildPromise} from '../../src/dom';
import {isLayoutSizeDefined} from '../../src/layout';
import {timerFor} from '../../src/timer';
import {viewportForDoc} from '../../src/viewport';
import {VideoEvents} from '../../src/video-interface';
import {videoManagerForDoc} from '../../src/video-manager';
import {
  supportsAutoplay,
  clearSupportsAutoplayCacheForTesting,
} from '../../src/service/video-manager-impl';
import {createIframePromise} from '../../testing/iframe';
import * as sinon from 'sinon';

describe('Autoplay', () => {
  describe('play/pause', () => {
    it('should play when in view port initially', () => {
      return createMockVideoPlayer(/* opt_outsideView */ false).then(v => {
        return v.implementation_.waitForPlayCall;
      });
    });

    it('should not play when not in view port initially', () => {
      return createMockVideoPlayer(/* opt_outsideView */ true).then(v => {
        const timer = timerFor(v.implementation_.win);
        const playPromise = v.implementation_.waitForPlayCall.then(() => {
          return Promise.reject('should not have autoplayed');
        });
        // we have to wait to ensure play is NOT called.
        return Promise.race([timer.promise(500), playPromise]);
      });
    });

    it('should play/pause when video enters/exists viewport', () => {
      let video;
      let viewport;
      return createMockVideoPlayer(/* opt_outsideView */ true).then(v => {
        video = v;
        viewport = viewportForDoc(video);

        // scroll to the bottom, make video fully visible
        viewport.setScrollTop(viewport.getHeight());
        return video.implementation_.waitForPlayCall;
      }).then(() => {
        // scroll back to top, make video not visible
        viewport.setScrollTop(0);
        return video.implementation_.waitForPauseCall;
      });
    });
  });

  describe('animated icon', () => {
    it('should create an animated icon overlay', () => {
      let video;
      let viewport;
      let icon;
      return createMockVideoPlayer(/* opt_outsideView */ true).then(v => {
        video = v;
        return waitForChildPromise(video, () => {
          return !!video.querySelector('i-amp-video-eq');
        });
      }).then(() => {
        icon = video.querySelector('i-amp-video-eq');
        expect(icon).to.exist;
        // animation should be paused since video is not played yet
        expect(isAnimationPaused(icon)).to.be.true;

        viewport = viewportForDoc(video);
        // scroll to the bottom, make video fully visible so it autoplays
        viewport.setScrollTop(viewport.getHeight());

        return waitForAnimationPlay(icon).then(() => {
          expect(isAnimationPaused(icon)).to.be.false;
        });
      });

      function isAnimationPaused(iconElement) {
        const animElement = iconElement.querySelector('.amp-video-eq-1-1');
        const win = iconElement.ownerDocument.defaultView;
        const computedStyle = win.getComputedStyle(animElement);
        const isPaused =
          (computedStyle.getPropertyValue('animation-play-state') == 'paused' ||
          computedStyle.getPropertyValue('animation-name') == 'none');
        return isPaused;
      }

      function waitForAnimationPlay(iconElement) {
        const win = iconElement.ownerDocument.defaultView;
        return new Promise(resolve => {
          const interval = win.setInterval(() => {
            if (iconElement.classList.contains('amp-video-eq-play')) {
              win.clearInterval(interval);
              resolve();
            }
          }, /* milliseconds */ 5);
        });
      }
    });
  });
});

describe('Supports Autoplay', () => {
  let sandbox;

  let ampdoc;
  let video;

  let isLite;

  let createElementSpy;
  let setAttributeSpy;
  let playSpy;

  it('should create an invisible test video element', () => {
    return supportsAutoplay(ampdoc, isLite).then(() => {
      expect(video.style.position).to.equal('fixed');
      expect(video.style.top).to.equal('0');
      expect(video.style.width).to.equal('0');
      expect(video.style.height).to.equal('0');
      expect(video.style.opacity).to.equal('0');

      expect(setAttributeSpy.calledWith('muted', '')).to.be.true;
      expect(setAttributeSpy.calledWith('playsinline', '')).to.be.true;
      expect(setAttributeSpy.calledWith('webkit-playsinline', '')).to.be.true;
      expect(setAttributeSpy.calledWith('height', '0')).to.be.true;
      expect(setAttributeSpy.calledWith('width', '0')).to.be.true;

      expect(video.muted).to.be.true;
      expect(video.playsinline).to.be.true;
      expect(video.webkitPlaysinline).to.be.true;

      expect(createElementSpy.called).to.be.true;
    });
  });

  it('should return false if `paused` is true after `play()` call', () => {
    video.paused = true;
    return supportsAutoplay(ampdoc, isLite).then(supportsAutoplay => {
      expect(supportsAutoplay).to.be.false;
      expect(playSpy.called).to.be.true;
      expect(createElementSpy.called).to.be.true;
    });
  });

  it('should return true if `paused` is false after `play()` call', () => {
    video.paused = false;
    return supportsAutoplay(ampdoc, isLite).then(supportsAutoplay => {
      expect(supportsAutoplay).to.be.true;
      expect(playSpy.called).to.be.true;
      expect(createElementSpy.called).to.be.true;
    });
  });

  it('should be false when in amp-lite mode', () => {
    isLite = true;
    return supportsAutoplay(ampdoc, isLite).then(supportsAutoplay => {
      expect(supportsAutoplay).to.be.false;
    });
  });

  it('should cache the result', () => {
    const firstResultRef = supportsAutoplay(ampdoc, isLite);
    const secondResultRef = supportsAutoplay(ampdoc, isLite);
    expect(firstResultRef).to.equal(secondResultRef);

    clearSupportsAutoplayCacheForTesting();

    const thirdResultRef = supportsAutoplay(ampdoc, isLite);
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

    const win = {
      document: doc,
    };

    ampdoc = {
      win,
    };

    isLite = false;

    createElementSpy = sandbox.spy(doc, 'createElement');
    setAttributeSpy = sandbox.spy(video, 'setAttribute');
    playSpy = sandbox.spy(video, 'play');
  });

  afterEach(() => {
    sandbox.restore();
  });
});

/**
 * @implements {../../src/video-interface.VideoInterface}
 */
class MockVideoPlayer extends BaseElement {

    /** @param {!AmpElement} element */
    constructor(element) {
      super(element);

      this.waitForPlayCall = new Promise(resolve => {
        this.waitForPlayCallResolve_ = resolve;
      });

      this.waitForPauseCall = new Promise(resolve => {
        this.waitForPauseCallResolve_ = resolve;
      });
    }

    /** @override */
    isLayoutSupported(layout) {
      return isLayoutSizeDefined(layout);
    }

    /** @override */
    buildCallback() {
      videoManagerForDoc(this.win.document).register(this);
      this.element.dispatchCustomEvent(VideoEvents.LOAD);
    }

    /** @override */
    layoutCallback() {
      return Promise.resolve();
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
    play(unusedIsAutoplay) {
      this.element.dispatchCustomEvent(VideoEvents.PLAY);
      this.waitForPlayCallResolve_();
    }

    /**
     * @override
     */
    pause() {
      this.element.dispatchCustomEvent(VideoEvents.PAUSE);
      this.waitForPauseCallResolve_();
    }

    /**
     * @override
     */
    mute() {
    }

    /**
     * @override
     */
    unmute() {
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
}

function createMockVideoPlayer(opt_outsideView) {
  const top = opt_outsideView ? '100vh' : '0';
  return createIframePromise().then(iframe => {
    iframe.doc.registerElement('amp-test-mock-videoplayer', {
      prototype: createAmpElementProto(iframe.win, 'amp-test-mock-videoplayer',
          MockVideoPlayer),
    });
    const video = iframe.doc.createElement('amp-test-mock-videoplayer');
    video.style.position = 'absolute';
    video.style.top = top;
    video.setAttribute('autoplay', '');
    video.setAttribute('controls', '');
    video.setAttribute('layout', 'fixed');
    video.setAttribute('width', '100');
    video.setAttribute('height', '50vh');

    const parent = iframe.doc.querySelector('#parent');
    parent.position = 'relative';
    parent.style.height = '200vh';
    return iframe.addElement(video);
  });
}
