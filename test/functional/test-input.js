/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
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

import {Input} from '../../src/input';
import {installTimerService} from '../../src/service/timer-impl.js';


describe('Input', () => {

  let sandbox;
  let clock;
  let input;
  let eventListeners;
  let windowApi;
  let documentApi;

  beforeEach(() => {
    sandbox = sinon.sandbox;
    clock = sandbox.useFakeTimers();

    eventListeners = {};

    documentApi = {
      addEventListener: (eventType, handler) => {
        eventListeners[eventType] = handler;
      },
      removeEventListener: (eventType, handler) => {
        if (eventListeners[eventType] == handler) {
          delete eventListeners[eventType];
        }
      },
    };

    windowApi = {
      document: documentApi,
      navigator: {},
      ontouchstart: '',
      setTimeout: window.setTimeout,
      Promise: window.Promise,
    };
    installTimerService(windowApi);

    input = new Input(windowApi);
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should initialize in touch mode', () => {
    expect(input.isTouchDetected()).to.equal(true);
    expect(input.isMouseDetected()).to.equal(false);
    expect(input.isKeyboardActive()).to.equal(false);

    expect(eventListeners['keydown']).to.not.equal(undefined);
    expect(eventListeners['mousedown']).to.not.equal(undefined);
    expect(eventListeners['mousemove']).to.not.equal(undefined);
    expect(eventListeners['click']).to.equal(undefined);
  });

  it('should fire states immediately', () => {
    let touchDetected = undefined;
    input.onTouchDetected(detected => {
      touchDetected = detected;
    }, true);
    expect(touchDetected).to.equal(true);

    let mouseDetected = undefined;
    input.onMouseDetected(detected => {
      mouseDetected = detected;
    }, true);
    expect(mouseDetected).to.equal(false);

    let kbActive = undefined;
    input.onKeyboardStateChanged(active => {
      kbActive = active;
    }, true);
    expect(kbActive).to.equal(false);
  });

  it('should release mousemove event asap', () => {
    expect(eventListeners['mousemove']).to.not.equal(undefined);
    eventListeners['mousemove']({});
    expect(eventListeners['mousemove']).to.equal(undefined);
  });

  it('should detect mouse', () => {
    expect(input.isMouseDetected()).to.equal(false);
    let mouseDetected = undefined;
    input.onMouseDetected(detected => {
      mouseDetected = detected;
    });
    expect(mouseDetected).to.equal(undefined);

    const p = input.onMouseMove_({});
    expect(eventListeners['click']).to.not.equal(undefined);
    clock.tick(350);

    return p.then(() => {
      expect(input.mouseConfirmAttemptCount_).to.equal(0);
      expect(input.isMouseDetected()).to.equal(true);
      expect(mouseDetected).to.equal(true);
      expect(eventListeners['click']).to.equal(undefined);
    });
  });

  it('should try to detect mouse again', () => {
    expect(input.isMouseDetected()).to.equal(false);
    let mouseDetected = undefined;
    input.onMouseDetected(detected => {
      mouseDetected = detected;
    });
    expect(mouseDetected).to.equal(undefined);

    const p = input.onMouseMove_({});
    eventListeners['click']();

    return p.then(() => {
      expect(input.mouseConfirmAttemptCount_).to.equal(1);
      expect(input.isMouseDetected()).to.equal(false);
      expect(mouseDetected).to.equal(undefined);
      expect(eventListeners['click']).to.equal(undefined);
      expect(eventListeners['mousemove']).to.not.equal(undefined);
    });
  });

  it('should ignore mouse move if it belongs to touch', () => {
    expect(input.isMouseDetected()).to.equal(false);
    let mouseDetected = undefined;
    input.onMouseDetected(detected => {
      mouseDetected = detected;
    });
    expect(mouseDetected).to.equal(undefined);

    const p = input.onMouseMove_(
        {sourceCapabilities: {firesTouchEvents: true}});
    expect(p).to.be.undefined;

    expect(input.mouseConfirmAttemptCount_).to.equal(1);
    expect(input.isMouseDetected()).to.equal(false);
    expect(mouseDetected).to.equal(undefined);
    expect(eventListeners['mousemove']).to.not.equal(undefined);
  });

  it('should stop trying to detect mouse after few attempts', () => {
    expect(input.isMouseDetected()).to.equal(false);
    let mouseDetected = undefined;
    input.onMouseDetected(detected => {
      mouseDetected = detected;
    });
    expect(mouseDetected).to.equal(undefined);

    const p = input.onMouseMove_({});
    input.mouseConfirmAttemptCount_ = 100;
    eventListeners['mousemove'] = undefined;
    eventListeners['click']();

    return p.then(() => {
      expect(input.mouseConfirmAttemptCount_).to.equal(101);
      expect(input.isMouseDetected()).to.equal(false);
      expect(mouseDetected).to.equal(undefined);
      expect(eventListeners['click']).to.equal(undefined);
      expect(eventListeners['mousemove']).to.equal(undefined);
    });
  });

  it('should detect keyboard states', () => {
    expect(input.isKeyboardActive()).to.equal(false);
    let kbActive = undefined;
    input.onKeyboardStateChanged(active => {
      kbActive = active;
    });
    expect(kbActive).to.equal(undefined);

    // Should send active.
    eventListeners['keydown']({});
    expect(input.isKeyboardActive()).to.equal(true);
    expect(kbActive).to.equal(true);

    // Should not resend active.
    kbActive = undefined;
    eventListeners['keydown']({});
    expect(input.isKeyboardActive()).to.equal(true);
    expect(kbActive).to.equal(undefined);

    // Should send inactive.
    kbActive = undefined;
    eventListeners['mousedown']({});
    expect(input.isKeyboardActive()).to.equal(false);
    expect(kbActive).to.equal(false);
  });

  it('should ignore keyboard state on input', () => {
    expect(input.isKeyboardActive()).to.equal(false);
    let kbActive = undefined;
    input.onKeyboardStateChanged(active => {
      kbActive = active;
    });
    expect(kbActive).to.equal(undefined);

    // Should send active.
    eventListeners['keydown']({target: {tagName: 'INPUT'}});
    expect(input.isKeyboardActive()).to.equal(false);
    expect(kbActive).to.equal(undefined);
  });
});
