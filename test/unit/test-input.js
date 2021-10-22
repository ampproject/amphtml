import {installTimerService} from '#service/timer-impl';

import {stubService} from '#testing/helpers/service';

import {Input} from '../../src/input';

describes.sandboxed('Input', {}, (env) => {
  let clock;
  let input;
  let eventListeners;
  let windowApi;
  let documentApi;

  beforeEach(() => {
    clock = env.sandbox.useFakeTimers();

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
    input.onTouchDetected((detected) => {
      touchDetected = detected;
    }, true);
    expect(touchDetected).to.equal(true);

    let mouseDetected = undefined;
    input.onMouseDetected((detected) => {
      mouseDetected = detected;
    }, true);
    expect(mouseDetected).to.equal(false);

    let kbActive = undefined;
    input.onKeyboardStateChanged((active) => {
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
    input.onMouseDetected((detected) => {
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
    input.onMouseDetected((detected) => {
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
    input.onMouseDetected((detected) => {
      mouseDetected = detected;
    });
    expect(mouseDetected).to.equal(undefined);

    const p = input.onMouseMove_({
      sourceCapabilities: {firesTouchEvents: true},
    });
    expect(p).to.be.undefined;

    expect(input.mouseConfirmAttemptCount_).to.equal(1);
    expect(input.isMouseDetected()).to.equal(false);
    expect(mouseDetected).to.equal(undefined);
    expect(eventListeners['mousemove']).to.not.equal(undefined);
  });

  it('should stop trying to detect mouse after few attempts', () => {
    expect(input.isMouseDetected()).to.equal(false);
    let mouseDetected = undefined;
    input.onMouseDetected((detected) => {
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
    input.onKeyboardStateChanged((active) => {
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
    input.onKeyboardStateChanged((active) => {
      kbActive = active;
    });
    expect(kbActive).to.equal(undefined);

    // Should send active.
    eventListeners['keydown']({target: {tagName: 'INPUT'}});
    expect(input.isKeyboardActive()).to.equal(false);
    expect(kbActive).to.equal(undefined);
  });
});

describes.realWin(
  'test-input.js setupInputModeClasses',
  {amp: false},
  (env) => {
    let ampdoc;
    let input;
    let body;

    beforeEach(() => {
      body = env.win.document.body;
      ampdoc = {
        waitForBodyOpen: () => Promise.resolve(body),
      };
      stubService(env.sandbox, env.win, 'vsync', 'mutate').callsFake((func) => {
        func();
      });
      input = new Input(env.win);
      input.setupInputModeClasses(ampdoc);
    });

    it('should add amp-mode-mouse class to body when mouseConfirmed', async () => {
      expect(body).to.not.have.class('amp-mode-mouse');
      input.mouseConfirmed_();
      await new Promise(setTimeout);
      expect(body).to.have.class('amp-mode-mouse');
    });

    it('should add amp-mode-keyboard-active class to body when onKeyDown', async () => {
      expect(body).to.not.have.class('amp-mode-keyboard-active');
      simulateKeyDown();
      await new Promise(setTimeout);
      expect(body).to.have.class('amp-mode-keyboard-active');
    });

    function simulateKeyDown() {
      const event = new /*OK*/ KeyboardEvent('keydown', {
        'keyCode': 65,
        'which': 65,
        bubbles: true,
      });
      env.win.document.body.dispatchEvent(event);
    }
  }
);
