/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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

import * as sinon from 'sinon';
import {VideoUtils} from '../../src/utils/video';

describe.configure().ifNewChrome().run('Autoplay support', () => {
  const supportsAutoplay = VideoUtils.isAutoplaySupported; // for line length

  let sandbox;

  let win;
  let video;

  let isLite;

  let createElementSpy;
  let setAttributeSpy;
  let playStub;

  beforeEach(() => {
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
