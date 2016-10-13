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
import {upgradeOrRegisterElement, createAmpElementProto} from '../../src/custom-element';
import {
  supportsAutoplay,
  clearSupportsAutoplayCacheForTesting,
} from '../../src/service/video-manager-impl';
import {VideoEvents} from '../../src/video-interface';
import {videoManagerForDoc} from '../../src/video-manager';
import * as sinon from 'sinon';


describes.realWin('Autoplay animated icon', {}, env => {
  let videoElement;
  let videoImpl;

  beforeEach(() => {
    videoElement = createMockVideoPlayer(env.win);
    videoImpl = videoElement.implementation_;
    // return videoElement.layoutCallback();
  });

  it('should create an animated icon overlay', () => {
    const icon = videoElement.lastElementNode;
    expect(icon).to.exist();
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
    return supportsAutoplay(ampdoc, isLite)
    .then(() => {
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
    return supportsAutoplay(ampdoc, isLite)
    .then(supportsAutoplay => {
      expect(supportsAutoplay).to.be.false;
      expect(playSpy.called).to.be.true;
      expect(createElementSpy.called).to.be.true;
    });
  });

  it('should return true if `paused` is false after `play()` call', () => {
    video.paused = false;
    return supportsAutoplay(ampdoc, isLite)
    .then(supportsAutoplay => {
      expect(supportsAutoplay).to.be.true;
      expect(playSpy.called).to.be.true;
      expect(createElementSpy.called).to.be.true;
    });
  });

  it('should be false when in amp-lite mode', () => {
    isLite = true;
    return supportsAutoplay(ampdoc, isLite)
    .then(supportsAutoplay => {
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
    }

    /**
     * @override
     */
    pause() {
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

function createMockVideoPlayer(win) {
  win.document.registerElement('amp-test-mock-videoplayer', {
    prototype: createAmpElementProto(win, 'amp-test-mock-videoplayer',
        MockVideoPlayer),
  });
  const video = win.document.createElement('amp-video');
  video.setAttribute('autoplay', '');
  video.setAttribute('controls', '');
  video.setAttribute('width', '16');
  video.setAttribute('height', '9');
  win.document.body.appendChild(video);
  return video;
}

