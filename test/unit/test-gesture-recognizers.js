import {Gestures} from '../../src/gesture';
import {
  DoubletapRecognizer,
  PinchRecognizer,
  SwipeXYRecognizer,
  TapRecognizer,
  TapzoomRecognizer,
} from '../../src/gesture-recognizers';

describes.sandboxed('TapRecognizer', {}, (env) => {
  let element;
  let recognizer;
  let gestures;
  let gesturesMock;

  beforeEach(() => {
    element = {
      addEventListener: (unusedEventType, unusedHandler) => {},
      ownerDocument: {
        defaultView: window,
      },
    };

    gestures = new Gestures(element);
    gesturesMock = env.sandbox.mock(gestures);

    recognizer = new TapRecognizer(gestures);
  });

  afterEach(() => {
    gesturesMock.verify();
  });

  it('should allow single-point touchstart', () => {
    const res = recognizer.onTouchStart({
      touches: [{clientX: 101, clientY: 201}],
    });
    expect(res).to.equal(true);
    expect(recognizer.startX_).to.equal(101);
    expect(recognizer.startY_).to.equal(201);
  });

  it('should deny two-point touchstart', () => {
    const res = recognizer.onTouchStart({
      touches: [{clientX: 101, clientY: 201}, {}],
    });
    expect(res).to.equal(false);
    expect(recognizer.startX_).to.equal(0);
    expect(recognizer.startY_).to.equal(0);
  });

  it('should allow small drift', () => {
    let res = recognizer.onTouchStart({
      touches: [{clientX: 101, clientY: 201}],
    });
    expect(res).to.equal(true);
    expect(recognizer.startX_).to.equal(101);
    expect(recognizer.startY_).to.equal(201);

    res = recognizer.onTouchMove({touches: [{clientX: 102, clientY: 202}]});
    expect(res).to.equal(true);
    expect(recognizer.lastX_).to.equal(102);
    expect(recognizer.lastY_).to.equal(202);
  });

  it('should deny large drift', () => {
    let res = recognizer.onTouchStart({
      touches: [{clientX: 101, clientY: 201}],
    });
    expect(res).to.equal(true);
    expect(recognizer.startX_).to.equal(101);
    expect(recognizer.startY_).to.equal(201);

    res = recognizer.onTouchMove({touches: [{clientX: 111, clientY: 211}]});
    expect(res).to.equal(false);
  });

  it('should signal ready on touchend', () => {
    gesturesMock.expects('signalReady_').withExactArgs(recognizer, 0).once();
    recognizer.onTouchEnd({});
  });

  it('should emit and end on start', () => {
    recognizer.lastX_ = 101;
    recognizer.lastY_ = 201;
    const target = element;
    recognizer.target_ = target;
    gesturesMock
      .expects('signalEmit_')
      .withExactArgs(
        recognizer,
        env.sandbox.match((data) => {
          return (
            data.clientX == 101 && data.clientY == 201 && data.target === target
          );
        }),
        null
      )
      .once();
    gesturesMock.expects('signalEnd_').withExactArgs(recognizer).once();
    recognizer.acceptStart();
  });
});

describes.sandboxed('DoubletapRecognizer', {}, (env) => {
  let element;
  let recognizer;
  let gestures;
  let gesturesMock;

  beforeEach(() => {
    element = {
      addEventListener: (unusedEventType, unusedHandler) => {},
      ownerDocument: {
        defaultView: window,
      },
    };

    gestures = new Gestures(element);
    gesturesMock = env.sandbox.mock(gestures);

    recognizer = new DoubletapRecognizer(gestures);
  });

  afterEach(() => {
    gesturesMock.verify();
  });

  it('should allow single-point touchstart', () => {
    const res = recognizer.onTouchStart({
      touches: [{clientX: 101, clientY: 201}],
    });
    expect(res).to.equal(true);
    expect(recognizer.startX_).to.equal(101);
    expect(recognizer.startY_).to.equal(201);
  });

  it('should deny two-point touchstart', () => {
    const res = recognizer.onTouchStart({
      touches: [{clientX: 101, clientY: 201}, {}],
    });
    expect(res).to.equal(false);
    expect(recognizer.startX_).to.equal(0);
    expect(recognizer.startY_).to.equal(0);
  });

  it('should allow small drift', () => {
    let res = recognizer.onTouchStart({
      touches: [{clientX: 101, clientY: 201}],
    });
    expect(res).to.equal(true);
    expect(recognizer.startX_).to.equal(101);
    expect(recognizer.startY_).to.equal(201);

    res = recognizer.onTouchMove({touches: [{clientX: 102, clientY: 202}]});
    expect(res).to.equal(true);
    expect(recognizer.lastX_).to.equal(102);
    expect(recognizer.lastY_).to.equal(202);
  });

  it('should deny large drift', () => {
    let res = recognizer.onTouchStart({
      touches: [{clientX: 101, clientY: 201}],
    });
    expect(res).to.equal(true);
    expect(recognizer.startX_).to.equal(101);
    expect(recognizer.startY_).to.equal(201);

    res = recognizer.onTouchMove({touches: [{clientX: 111, clientY: 211}]});
    expect(res).to.equal(false);
  });

  it('should ask pending for first touchend', () => {
    gesturesMock
      .expects('signalPending_')
      .withExactArgs(recognizer, 200)
      .once();
    gesturesMock.expects('signalReady_').never();
    recognizer.onTouchEnd({});
    expect(recognizer.tapCount_).to.equal(1);
  });

  it('should send ready for second touchend', () => {
    gesturesMock.expects('signalPending_').once();
    recognizer.onTouchEnd({});

    gesturesMock.expects('signalReady_').withExactArgs(recognizer, 0).once();
    recognizer.onTouchEnd({});
    expect(recognizer.tapCount_).to.equal(2);
  });

  it('should emit and end on start', () => {
    recognizer.lastX_ = 101;
    recognizer.lastY_ = 201;
    gesturesMock
      .expects('signalEmit_')
      .withExactArgs(
        recognizer,
        env.sandbox.match((data) => {
          return data.clientX == 101 && data.clientY == 201;
        }),
        null
      )
      .once();
    gesturesMock.expects('signalEnd_').withExactArgs(recognizer).once();
    recognizer.acceptStart();
    expect(recognizer.tapCount_).to.equal(0);
  });
});

describes.sandboxed('SwipeXYRecognizer', {}, (env) => {
  let element;
  let clock;
  let recognizer;
  let gestures;
  let gesturesMock;

  beforeEach(() => {
    clock = env.sandbox.useFakeTimers();

    element = {
      addEventListener: (unusedEventType, unusedHandler) => {},
      ownerDocument: {
        defaultView: window,
      },
    };

    gestures = new Gestures(element);
    gesturesMock = env.sandbox.mock(gestures);

    recognizer = new SwipeXYRecognizer(gestures);
  });

  afterEach(() => {
    gesturesMock.verify();
  });

  function diff(value, compare, error) {
    return Math.abs(value - compare) <= error;
  }

  it('should allow single-point touchstart', () => {
    const res = recognizer.onTouchStart({
      touches: [{clientX: 101, clientY: 201}],
    });
    expect(res).to.equal(true);
    expect(recognizer.startX_).to.equal(101);
    expect(recognizer.startY_).to.equal(201);
  });

  it('should deny two-point touchstart', () => {
    const res = recognizer.onTouchStart({
      touches: [{clientX: 101, clientY: 201}, {}],
    });
    expect(res).to.equal(false);
    expect(recognizer.startX_).to.equal(0);
    expect(recognizer.startY_).to.equal(0);
  });

  it('should allow small drift before requesting ready', () => {
    gesturesMock.expects('signalReady_').never();
    let res = recognizer.onTouchStart({
      touches: [{clientX: 101, clientY: 201}],
    });
    expect(res).to.equal(true);
    expect(recognizer.startX_).to.equal(101);
    expect(recognizer.startY_).to.equal(201);

    res = recognizer.onTouchMove({touches: [{clientX: 102, clientY: 202}]});
    expect(res).to.equal(true);
    expect(recognizer.lastX_).to.equal(102);
    expect(recognizer.lastY_).to.equal(202);
  });

  it('should send ready after significant move', () => {
    gesturesMock.expects('signalReady_').withExactArgs(recognizer, -10).once();

    let res = recognizer.onTouchStart({
      touches: [{clientX: 101, clientY: 201}],
    });
    expect(res).to.equal(true);

    res = recognizer.onTouchMove({touches: [{clientX: 112, clientY: 212}]});
    expect(res).to.equal(true);
    expect(recognizer.lastX_).to.equal(112);
    expect(recognizer.lastY_).to.equal(212);
  });

  it('should emit on start', () => {
    recognizer.startTime_ = 1;
    recognizer.startX_ = recognizer.prevX_ = 101;
    recognizer.startY_ = recognizer.prevY_ = 201;
    recognizer.lastX_ = 111;
    recognizer.lastY_ = 211;
    gesturesMock
      .expects('signalEmit_')
      .withExactArgs(
        recognizer,
        env.sandbox.match((data) => {
          return (
            data.first === true &&
            data.last === false &&
            data.deltaX == 0 &&
            data.deltaY == 0 &&
            data.time == 10 &&
            diff(data.velocityX, 0.86, 1e-2) &&
            diff(data.velocityY, 0.86, 1e-2)
          );
        }),
        null
      )
      .once();
    gesturesMock.expects('signalEnd_').never();

    clock.tick(10);
    recognizer.acceptStart();

    expect(recognizer.eventing_).to.equal(true);
    expect(recognizer.startTime_).to.equal(1);
    expect(recognizer.startX_).to.equal(111);
    expect(recognizer.startY_).to.equal(211);
    expect(recognizer.prevTime_).to.equal(10);
    expect(recognizer.prevX_).to.equal(111);
    expect(recognizer.prevY_).to.equal(211);
  });

  it('should emit on touchmove after start', () => {
    const event = {touches: [{clientX: 111, clientY: 211}]};

    recognizer.startX_ = recognizer.prevX_ = 101;
    recognizer.startY_ = recognizer.prevY_ = 201;
    recognizer.eventing_ = true;
    gesturesMock
      .expects('signalEmit_')
      .withExactArgs(
        recognizer,
        env.sandbox.match((data) => {
          return (
            data.first === false &&
            data.last === false &&
            data.deltaX == 10 &&
            data.deltaY == 10 &&
            data.velocityX > 0 &&
            data.velocityY > 0
          );
        }),
        event
      )
      .once();
    gesturesMock.expects('signalEnd_').never();

    clock.tick(10);
    const res = recognizer.onTouchMove(event);
    expect(res).to.equal(true);
    expect(recognizer.lastX_).to.equal(111);
    expect(recognizer.lastY_).to.equal(211);
  });

  it("should stop on touchend; velocity doesn't change", () => {
    const event = {touches: []};

    recognizer.startX_ = recognizer.prevX_ = 101;
    recognizer.startY_ = recognizer.prevY_ = 201;
    recognizer.lastX_ = 111;
    recognizer.lastY_ = 211;
    recognizer.velocityX_ = 0.5;
    recognizer.velocityY_ = 0.5;
    recognizer.eventing_ = true;
    gesturesMock
      .expects('signalEmit_')
      .withExactArgs(
        recognizer,
        env.sandbox.match((data) => {
          return (
            data.first === false &&
            data.last === true &&
            data.deltaX == 10 &&
            data.deltaY == 10 &&
            data.velocityX == 0.5 &&
            data.velocityY == 0.5
          );
        }),
        event
      )
      .once();
    gesturesMock.expects('signalEnd_').once();

    clock.tick(10);
    recognizer.onTouchEnd(event);
    expect(recognizer.eventing_).to.equal(false);
  });

  it('should stop on touchend; velocity changes', () => {
    const event = {touches: []};

    recognizer.startX_ = 101;
    recognizer.startY_ = 201;
    recognizer.lastX_ = recognizer.prevX_ = 111;
    recognizer.lastY_ = recognizer.prevY_ = 211;
    recognizer.velocityX_ = 0.5;
    recognizer.velocityY_ = 0.5;
    recognizer.eventing_ = true;
    gesturesMock
      .expects('signalEmit_')
      .withExactArgs(
        recognizer,
        env.sandbox.match((data) => {
          return (
            data.first === false &&
            data.last === true &&
            data.deltaX == 10 &&
            data.deltaY == 10 &&
            data.velocityX == 0 &&
            data.velocityY == 0
          );
        }),
        event
      )
      .once();
    gesturesMock.expects('signalEnd_').once();

    clock.tick(50);
    recognizer.onTouchEnd(event);
    expect(recognizer.eventing_).to.equal(false);
  });

  it('should ignore additional touches if eventing', () => {
    const event = {touches: [{clientX: 111, clientY: 211}]};

    recognizer.startX_ = recognizer.prevX_ = 101;
    recognizer.startY_ = recognizer.prevY_ = 201;
    recognizer.eventing_ = true;
    gesturesMock.expects('signalEmit_').twice();

    clock.tick(10);
    let res = recognizer.onTouchMove(event);
    expect(res).to.equal(true);
    expect(recognizer.lastX_).to.equal(111);
    expect(recognizer.lastY_).to.equal(211);

    res = recognizer.onTouchStart({
      touches: [
        {clientX: 111, clientY: 211},
        {clientX: 122, clientY: 254},
      ],
    });

    // Additional touch start should not have any effect
    expect(res).to.equal(true);

    res = recognizer.onTouchMove({
      touches: [
        {clientX: 111, clientY: 211},
        {clientX: 122, clientY: 234},
      ],
    });

    // Additional touch move should not have any effect
    expect(res).to.equal(true);

    clock.tick(50);

    // If further touches are remaining, do not fire signal end.
    recognizer.onTouchEnd({touches: [{clientX: 111, clientY: 211}]});
    expect(recognizer.eventing_).to.equal(true);
    gesturesMock.expects('signalEnd_').never();
  });
});

describes.sandboxed('TapzoomRecognizer', {}, (env) => {
  let element;
  let clock;
  let recognizer;
  let gestures;
  let gesturesMock;

  beforeEach(() => {
    clock = env.sandbox.useFakeTimers();

    element = {
      addEventListener: (unusedEventType, unusedHandler) => {},
      ownerDocument: {
        defaultView: window,
      },
    };

    gestures = new Gestures(element);
    gesturesMock = env.sandbox.mock(gestures);

    recognizer = new TapzoomRecognizer(gestures);
  });

  afterEach(() => {
    gesturesMock.verify();
  });

  it('should allow single-point touchstart', () => {
    const res = recognizer.onTouchStart({
      touches: [{clientX: 101, clientY: 201}],
    });
    expect(res).to.equal(true);
    expect(recognizer.startX_).to.equal(101);
    expect(recognizer.startY_).to.equal(201);
  });

  it('should deny two-point touchstart', () => {
    const res = recognizer.onTouchStart({
      touches: [{clientX: 101, clientY: 201}, {}],
    });
    expect(res).to.equal(false);
    expect(recognizer.startX_).to.equal(0);
    expect(recognizer.startY_).to.equal(0);
  });

  it('should allow small drift for tap', () => {
    let res = recognizer.onTouchStart({
      touches: [{clientX: 101, clientY: 201}],
    });
    expect(res).to.equal(true);
    expect(recognizer.startX_).to.equal(101);
    expect(recognizer.startY_).to.equal(201);

    res = recognizer.onTouchMove({touches: [{clientX: 102, clientY: 202}]});
    expect(res).to.equal(true);
    expect(recognizer.lastX_).to.equal(102);
    expect(recognizer.lastY_).to.equal(202);
  });

  it('should deny large drift for tap', () => {
    let res = recognizer.onTouchStart({
      touches: [{clientX: 101, clientY: 201}],
    });
    expect(res).to.equal(true);
    expect(recognizer.startX_).to.equal(101);
    expect(recognizer.startY_).to.equal(201);

    res = recognizer.onTouchMove({touches: [{clientX: 111, clientY: 211}]});
    expect(res).to.equal(false);
  });

  it('should ask pending for first touchend', () => {
    gesturesMock
      .expects('signalPending_')
      .withExactArgs(recognizer, 400)
      .once();
    gesturesMock.expects('signalReady_').never();
    recognizer.onTouchEnd({});
    expect(recognizer.tapCount_).to.equal(1);
  });

  it('should ignore small drift after first tap', () => {
    recognizer.tapCount_ = 1;
    gesturesMock.expects('signalReady_').never();
    let res = recognizer.onTouchStart({
      touches: [{clientX: 101, clientY: 201}],
    });
    expect(res).to.equal(true);
    expect(recognizer.startX_).to.equal(101);
    expect(recognizer.startY_).to.equal(201);

    res = recognizer.onTouchMove({touches: [{clientX: 102, clientY: 202}]});
    expect(res).to.equal(true);
    expect(recognizer.lastX_).to.equal(102);
    expect(recognizer.lastY_).to.equal(202);
  });

  it('should send ready after significant move', () => {
    recognizer.tapCount_ = 1;
    gesturesMock.expects('signalReady_').withExactArgs(recognizer, 0).once();

    let res = recognizer.onTouchStart({
      touches: [{clientX: 101, clientY: 201}],
    });
    expect(res).to.equal(true);

    res = recognizer.onTouchMove({touches: [{clientX: 112, clientY: 212}]});
    expect(res).to.equal(true);
    expect(recognizer.lastX_).to.equal(112);
    expect(recognizer.lastY_).to.equal(212);
  });

  it('should emit on start', () => {
    recognizer.startX_ = recognizer.prevX_ = 101;
    recognizer.startY_ = recognizer.prevY_ = 201;
    recognizer.lastX_ = 111;
    recognizer.lastY_ = 211;
    gesturesMock
      .expects('signalEmit_')
      .withExactArgs(
        recognizer,
        env.sandbox.match((data) => {
          return (
            data.first === true &&
            data.last === false &&
            data.centerClientX == 101 &&
            data.centerClientY == 201 &&
            data.deltaX == 10 &&
            data.deltaY == 10 &&
            data.velocityX == 0 &&
            data.velocityY == 0
          );
        }),
        null
      )
      .once();
    gesturesMock.expects('signalEnd_').never();

    clock.tick(10);
    recognizer.acceptStart();

    expect(recognizer.eventing_).to.equal(true);
  });

  it('should emit on touchmove after start', () => {
    const event = {touches: [{clientX: 111, clientY: 211}]};

    recognizer.startX_ = recognizer.prevX_ = 101;
    recognizer.startY_ = recognizer.prevY_ = 201;
    recognizer.eventing_ = true;
    gesturesMock
      .expects('signalEmit_')
      .withExactArgs(
        recognizer,
        env.sandbox.match((data) => {
          return (
            data.first === false &&
            data.last === false &&
            data.centerClientX == 101 &&
            data.centerClientY == 201 &&
            data.deltaX == 10 &&
            data.deltaY == 10 &&
            data.velocityX > 0 &&
            data.velocityY > 0
          );
        }),
        event
      )
      .once();
    gesturesMock.expects('signalEnd_').never();

    clock.tick(10);
    const res = recognizer.onTouchMove(event);
    expect(res).to.equal(true);
    expect(recognizer.lastX_).to.equal(111);
    expect(recognizer.lastY_).to.equal(211);
  });

  it('should stop on touchend', () => {
    const event = {};

    recognizer.startX_ = recognizer.prevX_ = 101;
    recognizer.startY_ = recognizer.prevY_ = 201;
    recognizer.lastX_ = 111;
    recognizer.lastY_ = 211;
    recognizer.eventing_ = true;
    gesturesMock
      .expects('signalEmit_')
      .withExactArgs(
        recognizer,
        env.sandbox.match((data) => {
          return (
            data.first === false &&
            data.last === true &&
            data.centerClientX == 101 &&
            data.centerClientY == 201 &&
            data.deltaX == 10 &&
            data.deltaY == 10 &&
            data.velocityX > 0 &&
            data.velocityY > 0
          );
        }),
        event
      )
      .once();
    gesturesMock.expects('signalEnd_').once();

    clock.tick(10);
    recognizer.onTouchEnd(event);
    expect(recognizer.eventing_).to.equal(false);
    expect(recognizer.tapCount_).to.equal(0);
  });
});

describes.sandboxed('PinchRecognizer', {}, (env) => {
  let element;
  let clock;
  let recognizer;
  let gestures;
  let gesturesMock;

  beforeEach(() => {
    clock = env.sandbox.useFakeTimers();

    element = {
      addEventListener: (unusedEventType, unusedHandler) => {},
      ownerDocument: {
        defaultView: window,
      },
    };

    gestures = new Gestures(element);
    gesturesMock = env.sandbox.mock(gestures);

    recognizer = new PinchRecognizer(gestures);
  });

  afterEach(() => {
    gesturesMock.verify();
  });

  function diff(value, compare, error) {
    return Math.abs(value - compare) <= error;
  }

  it('should wait and listen on single-point touchstart', () => {
    gesturesMock.expects('signalReady_').never();
    const res = recognizer.onTouchStart({
      touches: [{clientX: 101, clientY: 201}],
    });
    expect(res).to.equal(true);
    expect(recognizer.startX1_).to.equal(0);
    expect(recognizer.startY1_).to.equal(0);
    expect(recognizer.startX2_).to.equal(0);
    expect(recognizer.startY2_).to.equal(0);
  });

  it('should allow two-point touchstart', () => {
    const res = recognizer.onTouchStart({
      touches: [
        {clientX: 90, clientY: 80},
        {clientX: 110, clientY: 120},
      ],
    });
    expect(res).to.equal(true);
    expect(recognizer.startX1_).to.equal(90);
    expect(recognizer.startY1_).to.equal(80);
    expect(recognizer.startX2_).to.equal(110);
    expect(recognizer.startY2_).to.equal(120);
  });

  it('should allow small drift before requesting ready', () => {
    gesturesMock.expects('signalReady_').never();
    let res = recognizer.onTouchStart({
      touches: [
        {clientX: 90, clientY: 80},
        {clientX: 110, clientY: 120},
      ],
    });
    expect(res).to.equal(true);
    expect(recognizer.startX1_).to.equal(90);
    expect(recognizer.startY1_).to.equal(80);
    expect(recognizer.startX2_).to.equal(110);
    expect(recognizer.startY2_).to.equal(120);

    res = recognizer.onTouchMove({
      touches: [
        {clientX: 89, clientY: 79},
        {clientX: 112, clientY: 122},
      ],
    });
    expect(res).to.equal(true);
    expect(recognizer.lastX1_).to.equal(89);
    expect(recognizer.lastY1_).to.equal(79);
    expect(recognizer.lastX2_).to.equal(112);
    expect(recognizer.lastY2_).to.equal(122);
  });

  it('should send ready after significant move', () => {
    gesturesMock.expects('signalReady_').withExactArgs(recognizer, 0).once();

    let res = recognizer.onTouchStart({
      touches: [
        {clientX: 90, clientY: 80},
        {clientX: 110, clientY: 120},
      ],
    });
    expect(res).to.equal(true);

    res = recognizer.onTouchMove({
      touches: [
        {clientX: 80, clientY: 70},
        {clientX: 120, clientY: 130},
      ],
    });
    expect(res).to.equal(true);
  });

  it('should allow small drift before cancelling and then cancel', () => {
    gesturesMock.expects('signalReady_').never();
    let res = recognizer.onTouchStart({
      touches: [
        {clientX: 90, clientY: 80},
        {clientX: 110, clientY: 120},
      ],
    });
    expect(res).to.equal(true);

    // Move in the same direction by 2px.
    res = recognizer.onTouchMove({
      touches: [
        {clientX: 88, clientY: 78},
        {clientX: 108, clientY: 118},
      ],
    });
    expect(res).to.equal(true);

    // Move in the same direction by 10px.
    res = recognizer.onTouchMove({
      touches: [
        {clientX: 80, clientY: 70},
        {clientX: 100, clientY: 110},
      ],
    });
    expect(res).to.equal(false);
  });

  it('should emit on start', () => {
    clock.tick(1);
    recognizer.onTouchStart({
      touches: [
        {clientX: 90, clientY: 80},
        {clientX: 110, clientY: 120},
      ],
    });
    recognizer.onTouchMove({
      touches: [
        {clientX: 80, clientY: 70},
        {clientX: 120, clientY: 130},
      ],
    });
    gesturesMock
      .expects('signalEmit_')
      .withExactArgs(
        recognizer,
        env.sandbox.match((data) => {
          return (
            data.first === true &&
            data.last === false &&
            data.centerClientX == 100 &&
            data.centerClientY == 100 &&
            data.dir == 1 &&
            data.deltaX == 10 &&
            data.deltaY == 10 &&
            data.time == 11 &&
            diff(data.velocityX, 0.79, 1e-2) &&
            diff(data.velocityY, 0.79, 1e-2)
          );
        }),
        null
      )
      .once();
    gesturesMock.expects('signalEnd_').never();

    clock.tick(10);
    recognizer.acceptStart();

    expect(recognizer.eventing_).to.equal(true);
    expect(recognizer.startTime_).to.equal(1);
    expect(recognizer.startX1_).to.equal(90);
    expect(recognizer.startY1_).to.equal(80);
    expect(recognizer.startX2_).to.equal(110);
    expect(recognizer.startY2_).to.equal(120);
    expect(recognizer.lastX1_).to.equal(80);
    expect(recognizer.lastY1_).to.equal(70);
    expect(recognizer.lastX2_).to.equal(120);
    expect(recognizer.lastY2_).to.equal(130);
    expect(recognizer.prevTime_).to.equal(11);
    expect(recognizer.prevDeltaX_).to.equal(20);
    expect(recognizer.prevDeltaY_).to.equal(20);
  });

  it('should emit on touchmove after start', () => {
    clock.tick(1);
    recognizer.onTouchStart({
      touches: [
        {clientX: 90, clientY: 80},
        {clientX: 110, clientY: 120},
      ],
    });
    recognizer.onTouchMove({
      touches: [
        {clientX: 80, clientY: 70},
        {clientX: 120, clientY: 130},
      ],
    });
    gesturesMock
      .expects('signalEmit_')
      .withExactArgs(
        recognizer,
        env.sandbox.match((unusedData) => true),
        null
      )
      .once();
    clock.tick(10);
    recognizer.acceptStart();

    const event = {
      touches: [
        {clientX: 70, clientY: 60},
        {clientX: 130, clientY: 140},
      ],
    };
    gesturesMock
      .expects('signalEmit_')
      .withExactArgs(
        recognizer,
        env.sandbox.match((data) => {
          return (
            data.first === false &&
            data.last === false &&
            data.centerClientX == 100 &&
            data.centerClientY == 100 &&
            data.dir == 1 &&
            data.deltaX == 20 &&
            data.deltaY == 20 &&
            data.velocityX > 0 &&
            data.velocityY > 0
          );
        }),
        event
      )
      .once();
    gesturesMock.expects('signalEnd_').never();

    clock.tick(10);
    const res = recognizer.onTouchMove(event);
    expect(res).to.equal(true);
  });

  it("should stop on touchend; velocity doesn't change", () => {
    clock.tick(1);
    recognizer.onTouchStart({
      touches: [
        {clientX: 90, clientY: 80},
        {clientX: 110, clientY: 120},
      ],
    });
    recognizer.onTouchMove({
      touches: [
        {clientX: 80, clientY: 70},
        {clientX: 120, clientY: 130},
      ],
    });
    gesturesMock
      .expects('signalEmit_')
      .withExactArgs(
        recognizer,
        env.sandbox.match((unusedData) => true),
        null
      )
      .once();
    clock.tick(10);
    recognizer.acceptStart();

    const event = {touches: []};
    gesturesMock
      .expects('signalEmit_')
      .withExactArgs(
        recognizer,
        env.sandbox.match((data) => {
          return (
            data.first === false &&
            data.last === true &&
            data.dir == 1 &&
            data.deltaX == 10 &&
            data.deltaY == 10 &&
            diff(data.velocityX, 0.79, 1e-2) &&
            diff(data.velocityY, 0.79, 1e-2)
          );
        }),
        event
      )
      .once();
    gesturesMock.expects('signalEnd_').once();

    clock.tick(10);
    recognizer.onTouchEnd(event);
    expect(recognizer.eventing_).to.equal(false);
  });

  it('should stop on touchend; velocity changes', () => {
    clock.tick(1);
    recognizer.onTouchStart({
      touches: [
        {clientX: 90, clientY: 80},
        {clientX: 110, clientY: 120},
      ],
    });
    recognizer.onTouchMove({
      touches: [
        {clientX: 80, clientY: 70},
        {clientX: 120, clientY: 130},
      ],
    });
    gesturesMock
      .expects('signalEmit_')
      .withExactArgs(
        recognizer,
        env.sandbox.match((unusedData) => true),
        null
      )
      .once();
    clock.tick(10);
    recognizer.acceptStart();

    const event = {touches: []};
    gesturesMock
      .expects('signalEmit_')
      .withExactArgs(
        recognizer,
        env.sandbox.match((data) => {
          return (
            data.first === false &&
            data.last === true &&
            data.dir == 1 &&
            data.deltaX == 10 &&
            data.deltaY == 10 &&
            data.velocityX == 0 &&
            data.velocityY == 0
          );
        }),
        event
      )
      .once();
    gesturesMock.expects('signalEnd_').once();

    clock.tick(50);
    recognizer.onTouchEnd(event);
    expect(recognizer.eventing_).to.equal(false);
  });

  it('should ignore additional touches if eventing', () => {
    clock.tick(1);
    let res = recognizer.onTouchStart({
      touches: [
        {clientX: 90, clientY: 80},
        {clientX: 110, clientY: 120},
      ],
    });
    expect(res).to.equal(true);

    res = recognizer.onTouchMove({
      touches: [
        {clientX: 80, clientY: 70},
        {clientX: 120, clientY: 130},
      ],
    });
    expect(res).to.equal(true);

    // On acceptStart, we get a null event
    gesturesMock
      .expects('signalEmit_')
      .withExactArgs(
        recognizer,
        env.sandbox.match((data) => {
          return (
            data.centerClientX == 100 &&
            data.centerClientY == 100 &&
            data.deltaX == 10 &&
            data.deltaY == 10 &&
            data.dir == 1 &&
            data.first == true &&
            data.last == false &&
            data.time == 1
          );
        }),
        null
      )
      .once();

    // On onTouchMove, we didn't actually move the original touches
    gesturesMock
      .expects('signalEmit_')
      .withExactArgs(
        recognizer,
        env.sandbox.match((data) => {
          return (
            data.centerClientX == 100 &&
            data.centerClientY == 100 &&
            data.deltaX == 10 &&
            data.deltaY == 10 &&
            data.dir == 1 &&
            data.first == false &&
            data.last == false
          );
        }),
        {
          touches: [
            {clientX: 80, clientY: 70},
            {clientX: 120, clientY: 130},
            {clientX: 160, clientY: 160},
          ],
        }
      )
      .once();

    recognizer.acceptStart();

    expect(recognizer.eventing_).to.equal(true);

    // Trigger additional touch start; nothing should happen
    // for the additional touch
    res = recognizer.onTouchStart({
      touches: [
        {clientX: 80, clientY: 70},
        {clientX: 120, clientY: 130},
        {clientX: 160, clientY: 160},
      ],
    });
    expect(res).to.equal(true);

    // Trigger additional touch move; nothing should happen since the
    // existing touches did not move.
    res = recognizer.onTouchMove({
      touches: [
        {clientX: 80, clientY: 70},
        {clientX: 120, clientY: 130},
        {clientX: 160, clientY: 160},
      ],
    });
    expect(res).to.equal(true);

    // Trigger touch end; should not end since two touches are remaining
    res = recognizer.onTouchEnd({
      touches: [
        {clientX: 80, clientY: 70},
        {clientX: 120, clientY: 130},
      ],
    });

    clock.tick(50);
    // Additional touch start and touch move should not trigger a signal
    gesturesMock.expects('signalEnd_').never();
  });
});
