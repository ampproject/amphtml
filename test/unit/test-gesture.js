import {resetPassiveSupportedForTesting} from '#core/dom/event-helper-listen';

import {GestureRecognizer, Gestures} from '../../src/gesture';

describes.sandboxed('Gestures', {}, (env) => {
  class TestRecognizer extends GestureRecognizer {
    constructor(manager) {
      super('test', manager);
    }
  }

  class Test2Recognizer extends GestureRecognizer {
    constructor(manager) {
      super('test2', manager);
    }
  }

  function setPassiveSupported(passiveSupported) {
    resetPassiveSupportedForTesting();
    env.sandbox
      .stub(window, 'addEventListener')
      .callsFake((name, listener, option) => {
        passiveSupported ? option.passive : false;
      });
    env.sandbox.stub(window, 'removeEventListener');
  }

  let element;
  let clock;
  let recognizer;
  let recognizerMock;
  let gestures;
  let eventListeners;
  let onGesture;

  beforeEach(() => {
    clock = env.sandbox.useFakeTimers();
    setPassiveSupported(false); // so we can test preventDefault()

    eventListeners = {};
    element = {
      addEventListener: (eventType, handler) => {
        eventListeners[eventType] = handler;
      },
      removeEventListener: (eventType) => {
        delete eventListeners[eventType];
      },
      ownerDocument: {
        defaultView: window,
      },
    };

    onGesture = env.sandbox.spy();

    gestures = Gestures.get(element);
    gestures.onGesture(TestRecognizer, onGesture);
    expect(gestures.recognizers_.length).to.equal(1);
    recognizer = gestures.recognizers_[0];
    recognizerMock = env.sandbox.mock(recognizer);
  });

  afterEach(() => {
    recognizerMock.verify();
  });

  function sendEvent(event) {
    event.preventDefault = () => {};
    event.stopPropagation = () => {};
    eventListeners[event.type](event);
  }

  it('onPointerDown should be called', () => {
    const handler = env.sandbox.spy();
    gestures.onPointerDown(handler);
    sendEvent({type: 'touchstart'});
    expect(handler).to.be.calledOnce;
  });

  it('should proceed with series if touchstart returns true', () => {
    recognizerMock.expects('onTouchStart').returns(true).once();
    recognizerMock.expects('onTouchMove').returns(true).once();
    recognizerMock.expects('onTouchEnd').once();
    sendEvent({type: 'touchstart'});
    sendEvent({type: 'touchmove'});
    sendEvent({type: 'touchend'});
  });

  it('should cancel series if touchstart returns false', () => {
    recognizerMock.expects('onTouchStart').returns(false).once();
    recognizerMock.expects('onTouchMove').never();
    recognizerMock.expects('onTouchEnd').never();
    sendEvent({type: 'touchstart'});
    sendEvent({type: 'touchmove'});
    sendEvent({type: 'touchend'});
  });

  it('should cancel series if touchmove returns false', () => {
    recognizerMock.expects('onTouchStart').returns(true).once();
    recognizerMock.expects('onTouchMove').returns(false).once();
    recognizerMock.expects('onTouchEnd').never();
    sendEvent({type: 'touchstart'});
    sendEvent({type: 'touchmove'});
    sendEvent({type: 'touchend'});
  });

  it('should enter tracking mode on touchstart true', () => {
    recognizerMock.expects('onTouchStart').returns(true).once();
    sendEvent({type: 'touchstart'});
    expect(gestures.tracking_[0]).to.equal(true);
  });

  it('should stay in tracking mode on touchmove true', () => {
    gestures.tracking_[0] = true;
    recognizerMock.expects('onTouchMove').returns(true).once();
    sendEvent({type: 'touchmove'});
    expect(gestures.tracking_[0]).to.equal(true);
  });

  it('should exit tracking mode on touchmove false', () => {
    gestures.tracking_[0] = true;
    recognizerMock.expects('onTouchMove').returns(false).once();
    sendEvent({type: 'touchmove'});
    expect(gestures.tracking_[0]).to.equal(false);
  });

  it('should exit tracking mode on touchend without pending', () => {
    gestures.tracking_[0] = true;
    recognizerMock.expects('onTouchEnd').once();
    sendEvent({type: 'touchend'});
    expect(gestures.tracking_[0]).to.equal(false);
  });

  it('should stay in tracking mode on touchend with pending', () => {
    gestures.tracking_[0] = true;
    gestures.pending_[0] = 1;
    recognizerMock.expects('onTouchEnd').once();
    sendEvent({type: 'touchend'});
    expect(gestures.tracking_[0]).to.equal(true);
  });

  it('should reset pending state in events if expired', () => {
    gestures.pending_[0] = 1;
    clock.tick(2);
    sendEvent({type: 'touchstart'});
    expect(gestures.pending_[0]).to.equal(0);

    gestures.pending_[0] = 1;
    gestures.tracking_[0] = true;
    sendEvent({type: 'touchmove'});
    expect(gestures.pending_[0]).to.equal(0);

    gestures.pending_[0] = 1;
    gestures.tracking_[0] = true;
    sendEvent({type: 'touchend'});
    expect(gestures.pending_[0]).to.equal(0);
  });

  it('should cancel tracking for ready recognizers', () => {
    gestures.ready_[0] = 1;
    gestures.tracking_[0] = false;
    recognizerMock.expects('onTouchStart').never();
    sendEvent({type: 'touchstart'});
    expect(gestures.tracking_[0]).to.equal(false);
  });

  it('should deny ready state if already eventing', () => {
    gestures.eventing_ = {};
    recognizerMock.expects('acceptCancel').once();
    gestures.signalReady_(recognizer, 0);
  });

  it('should enter ready state', () => {
    clock.tick(1);
    recognizerMock.expects('acceptCancel').never();
    gestures.pending_[0] = 10;
    gestures.signalReady_(recognizer, 0);
    expect(gestures.ready_[0]).to.equal(1);
    expect(gestures.pending_[0]).to.equal(0);
    expect(gestures.passAfterEvent_).to.equal(true);
  });

  it('should deny pending state if already eventing', () => {
    gestures.eventing_ = {};
    gestures.pending_[0] = 0;
    recognizerMock.expects('acceptCancel').once();
    gestures.signalPending_(recognizer, 10);
    expect(gestures.pending_[0]).to.equal(0);
  });

  it('should enter ready state', () => {
    clock.tick(1);
    recognizerMock.expects('acceptCancel').never();
    gestures.signalPending_(recognizer, 10);
    expect(gestures.pending_[0]).to.equal(11);
  });

  it('should stop eventing', () => {
    gestures.eventing_ = recognizer;
    gestures.signalEnd_(recognizer);
    expect(gestures.eventing_).to.equal(null);
  });

  it('should deny emit if another eventing', () => {
    gestures.eventing_ = {};
    allowConsoleError(() => {
      expect(() => {
        gestures.signalEmit_(recognizer, {}, null);
      }).to.throw(/Recognizer is not currently allowed/);
    });
    expect(onGesture).to.have.not.been.called;
  });

  it('should allow emit', () => {
    const data = {};
    const event = {};
    clock.tick(1);
    gestures.eventing_ = recognizer;
    gestures.signalEmit_(recognizer, data, event);
    expect(onGesture).to.be.calledOnce;
    const gesture = onGesture.getCall(0).args[0];
    expect(gesture.type).to.equal('test');
    expect(gesture.data).to.equal(data);
    expect(gesture.event).to.equal(event);
    expect(gesture.time).to.equal(1);
  });

  it('should ignore pass - nothing to do', () => {
    recognizerMock.expects('acceptStart').never();
    gestures.doPass_();
    expect(gestures.pass_.isPending()).to.equal(false);
    expect(gestures.eventing_).to.equal(null);
  });

  it('should allow to start with no competition', () => {
    gestures.ready_[0] = 1;
    recognizerMock.expects('acceptStart').once();
    gestures.doPass_();
    expect(gestures.pass_.isPending()).to.equal(false);
    expect(gestures.eventing_).to.equal(recognizer);
  });

  it('should wait while others are pending', () => {
    gestures.ready_[0] = 1;
    gestures.recognizers_[1] = {};
    gestures.tracking_[1] = true;
    gestures.pending_[1] = 9;
    clock.tick(1);
    recognizerMock.expects('acceptStart').never();
    gestures.doPass_();
    expect(gestures.pass_.isPending()).to.equal(true);
    expect(gestures.pass_.nextTime_).to.equal(9);
    expect(gestures.eventing_).to.equal(null);
  });

  it('should allow youngest to start', () => {
    gestures.onGesture(Test2Recognizer, () => {});
    const recognizer2Mock = env.sandbox.mock(gestures.recognizers_[1]);

    gestures.ready_[0] = 10;
    gestures.ready_[1] = 9;
    recognizerMock.expects('acceptStart').once();
    recognizer2Mock.expects('acceptStart').never();
    recognizer2Mock.expects('acceptCancel').once();
    gestures.doPass_();
    expect(gestures.pass_.isPending()).to.equal(false);
    expect(gestures.eventing_).to.equal(recognizer);
  });

  it('should allow event to propagate when nothing happening', () => {
    const event = {
      type: 'touchend',
      preventDefault: env.sandbox.spy(),
      stopPropagation: env.sandbox.spy(),
    };
    eventListeners[event.type](event);
    expect(event.preventDefault).to.have.not.been.called;
    expect(event.stopPropagation).to.have.not.been.called;
  });

  it('should cancel event when eventing', () => {
    gestures.eventing_ = recognizer;
    const event = {
      type: 'touchend',
      preventDefault: env.sandbox.spy(),
      stopPropagation: env.sandbox.spy(),
    };
    eventListeners[event.type](event);
    expect(event.preventDefault).to.be.calledOnce;
    expect(event.stopPropagation).to.be.calledOnce;
  });

  it('should cancel event after eventing stopped', () => {
    gestures.eventing_ = recognizer;
    gestures.signalEnd_(recognizer);
    expect(gestures.eventing_).to.equal(null);
    expect(gestures.wasEventing_).to.equal(true);

    const event = {
      type: 'touchend',
      preventDefault: env.sandbox.spy(),
      stopPropagation: env.sandbox.spy(),
    };
    eventListeners[event.type](event);
    expect(event.preventDefault).to.be.calledOnce;
    expect(event.stopPropagation).to.be.calledOnce;
    expect(gestures.wasEventing_).to.equal(false);
  });

  it('should cancel event when anyone is ready', () => {
    gestures.ready_[0] = 1;
    const event = {
      type: 'touchend',
      preventDefault: env.sandbox.spy(),
      stopPropagation: env.sandbox.spy(),
    };
    eventListeners[event.type](event);
    expect(event.preventDefault).to.be.calledOnce;
    expect(event.stopPropagation).to.be.calledOnce;
  });

  it('should cancel event when anyone is pending', () => {
    gestures.pending_[0] = 1;
    let event = {
      type: 'touchend',
      preventDefault: env.sandbox.spy(),
      stopPropagation: env.sandbox.spy(),
    };
    eventListeners[event.type](event);
    expect(event.preventDefault).to.be.calledOnce;
    expect(event.stopPropagation).to.be.calledOnce;

    clock.tick(10);
    event = {
      type: 'touchend',
      preventDefault: env.sandbox.spy(),
      stopPropagation: env.sandbox.spy(),
    };
    eventListeners[event.type](event);
    expect(event.preventDefault).to.have.not.been.called;
    expect(event.stopPropagation).to.have.not.been.called;
  });

  it('should gesture recognizer on removeGesture', () => {
    expect(gestures.recognizers_.length).to.equal(1);
    expect(gestures.removeGesture(TestRecognizer)).to.equal(true);
    expect(gestures.removeGesture(Test2Recognizer)).to.equal(false);
    expect(gestures.recognizers_.length).to.equal(0);
    expect(gestures.ready_.length).to.equal(0);
    expect(gestures.tracking_.length).to.equal(0);
    expect(gestures.pending_.length).to.equal(0);
  });

  it('should remove listeners and shared cache instance on cleanup', () => {
    const eventNames = ['touchstart', 'touchend', 'touchmove', 'touchcancel'];
    const prop = '__AMP_Gestures';
    const removeSpy = env.sandbox.spy(element, 'removeEventListener');

    expect(element[prop]).to.exist;

    gestures.cleanup();

    eventNames.forEach((eventName) => {
      expect(removeSpy.withArgs(eventName)).to.be.calledOnce;
    });
    expect(element[prop]).to.not.exist;
  });

  describe('Gestures - with shouldNotPreventdefault', () => {
    let element;
    let clock;
    let recognizer;
    let recognizerMock;
    let gestures;
    let eventListeners;
    let onGesture;

    beforeEach(() => {
      clock = env.sandbox.useFakeTimers();

      eventListeners = {};
      element = {
        addEventListener: (eventType, handler) => {
          eventListeners[eventType] = handler;
        },
        ownerDocument: {
          defaultView: window,
        },
      };

      onGesture = env.sandbox.spy();

      gestures = Gestures.get(element, /* shouldNotPreventDefault */ true);
      gestures.onGesture(TestRecognizer, onGesture);
      expect(gestures.recognizers_.length).to.equal(1);
      recognizer = gestures.recognizers_[0];
      recognizerMock = env.sandbox.mock(recognizer);
    });

    afterEach(() => {
      recognizerMock.verify();
    });

    it('should cancel event when eventing', () => {
      gestures.eventing_ = recognizer;
      const event = {
        type: 'touchend',
        preventDefault: env.sandbox.spy(),
        stopPropagation: env.sandbox.spy(),
      };
      eventListeners[event.type](event);
      expect(event.preventDefault).to.have.not.been.called;
      expect(event.stopPropagation).to.be.calledOnce;
    });

    it('should cancel event after eventing stopped', () => {
      gestures.eventing_ = recognizer;
      gestures.signalEnd_(recognizer);
      expect(gestures.eventing_).to.equal(null);
      expect(gestures.wasEventing_).to.equal(true);

      const event = {
        type: 'touchend',
        preventDefault: env.sandbox.spy(),
        stopPropagation: env.sandbox.spy(),
      };
      eventListeners[event.type](event);
      expect(event.preventDefault).to.have.not.been.called;
      expect(event.stopPropagation).to.be.calledOnce;
      expect(gestures.wasEventing_).to.equal(false);
    });

    it('should cancel event when anyone is ready', () => {
      gestures.ready_[0] = 1;
      const event = {
        type: 'touchend',
        preventDefault: env.sandbox.spy(),
        stopPropagation: env.sandbox.spy(),
      };
      eventListeners[event.type](event);
      expect(event.preventDefault).to.have.not.been.called;
      expect(event.stopPropagation).to.be.calledOnce;
    });

    it('should cancel event when anyone is pending', () => {
      gestures.pending_[0] = 1;
      let event = {
        type: 'touchend',
        preventDefault: env.sandbox.spy(),
        stopPropagation: env.sandbox.spy(),
      };
      eventListeners[event.type](event);
      expect(event.preventDefault).to.have.not.been.called;
      expect(event.stopPropagation).to.be.calledOnce;

      clock.tick(10);
      event = {
        type: 'touchend',
        preventDefault: env.sandbox.spy(),
        stopPropagation: env.sandbox.spy(),
      };
      eventListeners[event.type](event);
      expect(event.preventDefault).to.have.not.been.called;
      expect(event.stopPropagation).to.have.not.been.called;
    });
  });

  describe('Gestures - with shouldStopPropagation', () => {
    let element;
    let recognizer;
    let recognizerMock;
    let gestures;
    let eventListeners;
    let onGesture;

    beforeEach(() => {
      eventListeners = {};
      element = {
        addEventListener: (eventType, handler) => {
          eventListeners[eventType] = handler;
        },
        ownerDocument: {
          defaultView: window,
        },
      };

      onGesture = env.sandbox.spy();

      gestures = Gestures.get(
        element,
        undefined,
        /* shouldStopPropagation */ true
      );
      gestures.onGesture(TestRecognizer, onGesture);
      expect(gestures.recognizers_.length).to.equal(1);
      recognizer = gestures.recognizers_[0];
      recognizerMock = env.sandbox.mock(recognizer);
    });

    afterEach(() => {
      recognizerMock.verify();
    });

    it('should stop event from propagating', () => {
      const event = {
        type: 'touchend',
        stopPropagation: env.sandbox.spy(),
      };
      eventListeners[event.type](event);
      expect(event.stopPropagation).to.have.be.calledOnce;
    });
  });
});
