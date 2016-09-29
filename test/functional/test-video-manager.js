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

import {
  supportsAutoplay,
  clearSupportsAutoplayCache,
} from '../../src/service/video-manager-impl';
import {installTimerService} from '../../src/service/timer-impl';
import {timerFor} from '../../src/timer';
import * as sinon from 'sinon';

describe('Supports Autoplay', () => {
  let sandbox;
  let clock;

  let ampdoc;
  let mode;
  let platform;
  let timer;
  let video;

  let playResult;
  let createElementSpy;
  let setAttributeSpy;
  let playSpy;
  let removeSpy;

  it('should be false when in amp-lite mode', () => {
    mode.lite = true;
    return supportsAutoplay(ampdoc, platform, timer, mode)
    .then(supportsAutoplay => {
      expect(supportsAutoplay).to.be.false;
    });
  });

  it('should cache the result', () => {
    const firstResultRef = supportsAutoplay(ampdoc, platform, timer, mode);
    const secondResultRef = supportsAutoplay(ampdoc, platform, timer, mode);
    expect(firstResultRef).to.equal(secondResultRef);

    clearSupportsAutoplayCache();

    const thirdResultRef = supportsAutoplay(ampdoc, platform, timer, mode);
    expect(thirdResultRef).to.not.equal(firstResultRef);
    expect(thirdResultRef).to.not.equal(secondResultRef);
  });

  it('should short-circuit for known unsupported Chrome versions', () => {
    platform.isChrome = () => true;
    platform.getMajorVersion = () => 52;

    return supportsAutoplay(ampdoc, platform, timer, mode)
    .then(supportsAutoplay => {
      expect(supportsAutoplay).to.be.false;
      expect(createElementSpy.called).to.be.false;
    });
  });

  it('should short-circuit for known unsupported Safari versions', () => {
    platform.isChrome = () => false;
    platform.isSafari = () => true;
    platform.getMajorVersion = () => 9;

    return supportsAutoplay(ampdoc, platform, timer, mode)
    .then(supportsAutoplay => {
      expect(supportsAutoplay).to.be.false;
      expect(createElementSpy.called).to.be.false;
    });
  });

  it('should create an invisible test video element', () => {
    return supportsAutoplay(ampdoc, platform, timer, mode)
    .then(() => {
      expect(video.style.position).to.equal('absolute');
      expect(video.style.top).to.equal('0');
      expect(video.style.width).to.equal('0px');
      expect(video.style.height).to.equal('0px');
      expect(video.style.opacity).to.equal('0');

      expect(setAttributeSpy.calledWith('muted', '')).to.be.true;
      expect(setAttributeSpy.calledWith('playsinline', '')).to.be.true;
      expect(setAttributeSpy.calledWith('webkit-playsinline', '')).to.be.true;
      expect(setAttributeSpy.calledWith('height', '0')).to.be.true;
      expect(setAttributeSpy.calledWith('width', '0')).to.be.true;

      /*eslint-disable*/
      // This test is here to ensure video source is not changed unexpectedly.
      // If you are changing the video, it is important to ensure
      // wide decoding compatibility in Android and iOS and small size footprint
      expect(video.src).to.equal('data:video/mp4;base64,AAAAIGZ0eXBpc29tAAACAGlzb21pc28yYXZjMW1wNDEAAAAIZnJlZQAAAFttZGF0AAAAMmWIhD///8PAnFAAFPf3333331111111111111111111111111111111111111111114AAAABUGaOeDKAAAABkGaVHgygAAAAAZBmnZ4MoAAAAMKbW9vdgAAAGxtdmhkAAAAAAAAAAAAAAAAAAAD6AAAB9AAAQAAAQAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgAAAjt0cmFrAAAAXHRraGQAAAAPAAAAAAAAAAAAAAABAAAAAAAAB9AAAAAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAABAAAAAAGQAAABkAAAAAAAkZWR0cwAAABxlbHN0AAAAAAAAAAEAAAfQAAAAAAABAAAAAAGzbWRpYQAAACBtZGhkAAAAAAAAAAAAAAAAAAAAAgAAAARVxAAAAAAALWhkbHIAAAAAAAAAAHZpZGUAAAAAAAAAAAAAAABWaWRlb0hhbmRsZXIAAAABXm1pbmYAAAAUdm1oZAAAAAEAAAAAAAAAAAAAACRkaW5mAAAAHGRyZWYAAAAAAAAAAQAAAAx1cmwgAAAAAQAAAR5zdGJsAAAAlnN0c2QAAAAAAAAAAQAAAIZhdmMxAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAGQAZABIAAAASAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAGP//AAAAMGF2Y0MBQsAK/+EAGGdCwArZhz+efARAAAADAEAAAAMBA8SJmgEABWjJYPLIAAAAGHN0dHMAAAAAAAAAAQAAAAQAAAABAAAAFHN0c3MAAAAAAAAAAQAAAAEAAAAcc3RzYwAAAAAAAAABAAAAAQAAAAQAAAABAAAAJHN0c3oAAAAAAAAAAAAAAAQAAAA2AAAACQAAAAoAAAAKAAAAFHN0Y28AAAAAAAAAAQAAADAAAABbdWR0YQAAAFNtZXRhAAAAAAAAACFoZGxyAAAAAAAAAABtZGlyYXBwbAAAAAAAAAAAAAAAACZpbHN0AAAAHql0b28AAAAWZGF0YQAAAAEAAAAAR29vZ2xl');
      /*eslint-enable */

      expect(createElementSpy.called).to.be.true;
      expect(removeSpy.called).to.be.true;
    });
  });

  it('should return false if `loadstart` event never fires', () => {
    video.addEventListener = function() {};
    const p = supportsAutoplay(ampdoc, platform, timer, mode)
    .then(supportsAutoplay => {
      expect(supportsAutoplay).to.be.false;
      expect(playSpy.called).to.be.false;
      expect(createElementSpy.called).to.be.true;
      expect(removeSpy.called).to.be.true;
    });

    return Promise.resolve().then(() => {
      clock.tick(1000);
      return p;
    });
  });

  it('should return true if play() returns a promise that succeeds', () => {
    return supportsAutoplay(ampdoc, platform, timer, mode)
    .then(supportsAutoplay => {
      expect(supportsAutoplay).to.be.true;
      expect(playSpy.called).to.be.true;
      expect(createElementSpy.called).to.be.true;
      expect(removeSpy.called).to.be.true;
    });
  });

  it('should return false if play() returns a promise that is rejected', () => {
    playResult = Promise.reject('play must be initiated by user action');
    return supportsAutoplay(ampdoc, platform, timer, mode)
    .then(supportsAutoplay => {
      expect(supportsAutoplay).to.be.false;
      expect(playSpy.called).to.be.true;
      expect(createElementSpy.called).to.be.true;
      expect(removeSpy.called).to.be.true;
    });
  });

  it('should return true if play() does not returns a promise but ' +
    '`playing` event is received', () => {
    video.addEventListener = function(type, cb) {
      if (type == 'loadstart' || type == 'playing') {
        cb();
      }
    };
    playResult = null;
    return supportsAutoplay(ampdoc, platform, timer, mode)
    .then(supportsAutoplay => {
      expect(supportsAutoplay).to.be.true;
      expect(playSpy.called).to.be.true;
      expect(createElementSpy.called).to.be.true;
      expect(removeSpy.called).to.be.true;
    });
  });

  it('should return false if play() does not returns a promise and ' +
    '`playing` event times out', () => {
    playResult = null;
    const p = supportsAutoplay(ampdoc, platform, timer, mode)
    .then(supportsAutoplay => {
      expect(supportsAutoplay).to.be.false;
      expect(playSpy.called).to.be.true;
      expect(createElementSpy.called).to.be.true;
      expect(removeSpy.called).to.be.true;
    });

    return Promise.resolve().then(() => {
      clock.tick(1000);
      return p;
    });
  });

  beforeEach(() => {
    clearSupportsAutoplayCache();

    sandbox = sinon.sandbox.create();
    clock = sandbox.useFakeTimers();
    playResult = Promise.resolve();

    video = {
      addEventListener(type, cb) {
        if (type == 'loadstart') {
          cb();
        }
      },
      setAttribute() {},
      style: {
        position: null,
        top: null,
        width: null,
        height: null,
        opacity: null,
      },
      play() {
        return playResult;
      },
      remove() {},
    };

    const doc = {
      createElement() {
        return video;
      },
    };

    const win = {
      document: doc,
      setTimeout: window.setTimeout,
      clearTimeout: window.clearTimeout,
    };

    const body = {
      appendChild() {},
    };

    ampdoc = {
      win,
      whenBodyAvailable() {
        return Promise.resolve(body);
      },
    };

    mode = {
      lite: false,
    };

    platform = {
      isChrome() {
        return true;
      },

      isSafari() {
        return false;
      },

      getMajorVersion() {
        return 53;
      },
    };

    installTimerService(win);
    timer = timerFor(win);

    createElementSpy = sandbox.spy(doc, 'createElement');
    setAttributeSpy = sandbox.spy(video, 'setAttribute');
    playSpy = sandbox.spy(video, 'play');
    removeSpy = sandbox.spy(video, 'remove');
  });

  afterEach(() => {
    sandbox.restore();
  });
});
