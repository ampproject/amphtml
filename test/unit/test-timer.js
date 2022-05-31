import {Timer} from '#service/timer-impl';

describes.fakeWin('Timer', {}, (env) => {
  let windowMock;
  let timer;

  beforeEach(() => {
    const WindowApi = function () {};
    WindowApi.prototype.setTimeout = function (unusedCallback, unusedDelay) {};
    WindowApi.prototype.clearTimeout = function (unusedTimerId) {};
    WindowApi.prototype.document = {};
    WindowApi.prototype.Promise = window.Promise;
    const windowApi = new WindowApi();
    windowMock = env.sandbox.mock(windowApi);

    timer = new Timer(windowApi);
  });

  afterEach(() => {
    windowMock.verify();
  });

  it('delay', () => {
    const handler = () => {};
    windowMock.expects('setTimeout').returns(1).once();
    windowMock.expects('clearTimeout').never();
    timer.delay(handler, 111);
  });

  it('delay 0 real window', (done) => {
    timer = new Timer(self);
    timer.delay(done, 0);
  });

  it('delay 1 real window', (done) => {
    timer = new Timer(self);
    timer.delay(done, 1);
  });

  it('delay default', (done) => {
    windowMock.expects('setTimeout').never();
    windowMock.expects('clearTimeout').never();
    timer.delay(done);
  });

  it('cancel', () => {
    windowMock.expects('clearTimeout').withExactArgs(1).once();
    timer.cancel(1);
  });

  it('cancel default', (done) => {
    windowMock.expects('setTimeout').never();
    windowMock.expects('clearTimeout').never();
    const id = timer.delay(() => {
      throw new Error('should have been cancelled');
    });
    timer.cancel(id);

    // This makes sure the error has time to throw while this test
    // is still running.
    timer.delay(done);
  });

  it('promise', () => {
    windowMock
      .expects('setTimeout')
      .withExactArgs(
        env.sandbox.match((value) => {
          value();
          return true;
        }),
        111
      )
      .returns(1)
      .once();

    let c = 0;
    return timer.promise(111).then((result) => {
      c++;
      expect(c).to.equal(1);
      expect(result).to.be.undefined;
    });
  });

  it('timeoutPromise - no race', () => {
    windowMock
      .expects('setTimeout')
      .withExactArgs(
        env.sandbox.match((value) => {
          value();
          return true;
        }),
        111
      )
      .returns(1)
      .once();

    let c = 0;
    return timer
      .timeoutPromise(111)
      .then((result) => {
        c++;
        assert.fail('must never be here: ' + result);
      })
      .catch((reason) => {
        c++;
        expect(c).to.equal(1);
        expect(reason.message).to.contain('timeout');
      });
  });

  it('timeoutPromise - race no timeout', () => {
    windowMock
      .expects('setTimeout')
      .withExactArgs(
        env.sandbox.match((unusedValue) => {
          // No timeout
          return true;
        }),
        111
      )
      .returns(1)
      .once();

    let c = 0;
    return timer.timeoutPromise(111, Promise.resolve('A')).then((result) => {
      c++;
      expect(c).to.equal(1);
      expect(result).to.equal('A');
    });
  });

  it('timeoutPromise - race with timeout', () => {
    windowMock
      .expects('setTimeout')
      .withExactArgs(
        env.sandbox.match((value) => {
          // Immediate timeout
          value();
          return true;
        }),
        111
      )
      .returns(1)
      .once();

    let c = 0;
    return timer
      .timeoutPromise(111, new Promise(() => {}))
      .then((result) => {
        c++;
        assert.fail('must never be here: ' + result);
      })
      .catch((reason) => {
        c++;
        expect(c).to.equal(1);
        expect(reason.message).to.contain('timeout');
      });
  });

  it('poll - resolves only when condition is true', () => {
    const realTimer = new Timer(env.win);
    let predicate = false;
    setTimeout(() => {
      predicate = true;
    }, 15);
    return realTimer
      .poll(10, () => {
        return predicate;
      })
      .then(() => {
        expect(predicate).to.be.true;
      });
  });

  it('poll - clears out interval when complete', () => {
    const realTimer = new Timer(env.win);
    const clearIntervalStub = env.sandbox.stub();
    env.win.clearInterval = clearIntervalStub;
    return realTimer
      .poll(111, () => {
        return true;
      })
      .then(() => {
        expect(clearIntervalStub).to.have.been.calledOnce;
      });
  });
});
