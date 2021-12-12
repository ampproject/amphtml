import {Services} from '#service';

import {Pass} from '../../src/pass';

describes.sandboxed('Pass', {}, (env) => {
  let pass;
  let timerMock;
  let handlerCalled;

  beforeEach(() => {
    timerMock = env.sandbox.mock(Services.timerFor(window));
    handlerCalled = 0;
    pass = new Pass(window, () => {
      handlerCalled++;
    });
  });

  afterEach(() => {
    expect(handlerCalled).to.equal(0);
    timerMock.verify();
  });

  it('handler called', () => {
    let delayedFunc = null;
    timerMock
      .expects('delay')
      .withExactArgs(
        env.sandbox.match((value) => {
          delayedFunc = value;
          return true;
        }),
        0
      )
      .returns(1)
      .once();
    pass.schedule();
    expect(pass.isPending()).to.equal(true);

    delayedFunc();
    expect(handlerCalled).to.equal(1);
    expect(pass.isPending()).to.equal(false);

    // RESET
    handlerCalled = 0;
  });

  it('schedule no delay', () => {
    timerMock
      .expects('delay')
      .withExactArgs(env.sandbox.match.func, 0)
      .returns(1)
      .once();
    timerMock.expects('cancel').never();
    pass.schedule();
  });

  it('schedule with delay', () => {
    timerMock
      .expects('delay')
      .withExactArgs(env.sandbox.match.func, 111)
      .returns(1)
      .once();
    timerMock.expects('cancel').never();
    pass.schedule(111);
  });

  it('schedule later', () => {
    timerMock
      .expects('delay')
      .withExactArgs(env.sandbox.match.func, 111)
      .returns(1)
      .once();
    timerMock.expects('cancel').never();
    pass.schedule(111);
    // Will never schedule b/c there's an earlier pass still pending.
    const isScheduled = pass.schedule(222);
    expect(isScheduled).to.equal(false);
  });

  it('schedule earlier', () => {
    timerMock
      .expects('delay')
      .withExactArgs(env.sandbox.match.func, 222)
      .returns(1)
      .once();
    timerMock
      .expects('delay')
      .withExactArgs(env.sandbox.match.func, 111)
      .returns(2)
      .once();
    timerMock.expects('cancel').withExactArgs(1).once();
    pass.schedule(222);
    // Will re-schedule b/c the existing pass is later.
    const isScheduled = pass.schedule(111);
    expect(isScheduled).to.equal(true);
  });

  it('should have a min delay for recursive schedule', () => {
    pass = new Pass(window, () => {
      expect(pass.running_).to.equal(true);
      if (handlerCalled++ == 0) {
        pass.schedule();
      }
    });
    let delayedFunc0 = null;
    let delayedFunc1 = null;
    timerMock
      .expects('delay')
      .withExactArgs(
        env.sandbox.match((value) => {
          delayedFunc0 = value;
          return true;
        }),
        0
      )
      .returns(1)
      .once();
    timerMock
      .expects('delay')
      .withExactArgs(
        env.sandbox.match((value) => {
          delayedFunc1 = value;
          return true;
        }),
        10
      )
      .returns(1)
      .once();
    pass.schedule();
    expect(pass.isPending()).to.equal(true);

    delayedFunc0();
    expect(handlerCalled).to.equal(1);
    delayedFunc1();
    expect(handlerCalled).to.equal(2);
    expect(pass.isPending()).to.equal(false);
    expect(pass.running_).to.equal(false);

    // RESET
    handlerCalled = 0;
  });
});
