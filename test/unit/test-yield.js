import * as fakeTimers from '@sinonjs/fake-timers';

import {macroTask} from '#testing/helpers';

describes.realWin('yield', {}, (env) => {
  let win;
  let clock;

  beforeEach(() => {
    win = env.win;
    clock = fakeTimers.withGlobal(win).install({
      toFake: ['Date', 'setTimeout', 'clearTimeout'],
    });
  });

  afterEach(() => {
    clock.uninstall();
  });

  it('should work with nested promises', function* () {
    let value = false;

    const nestPromise = (level) => {
      if (level == 0) {
        value = true;
        return;
      }
      return Promise.resolve().then(() => {
        return nestPromise(level - 1);
      });
    };

    nestPromise(100);
    expect(value).to.be.false;
    yield macroTask();
    expect(value).to.be.true;
  });

  it('should work with promise chain', function* () {
    let value;

    const chainPromise = Promise.resolve();
    for (let i = 0; i < 100; i++) {
      chainPromise.then(() => {
        value = false;
      });
    }
    chainPromise.then(() => {
      value = true;
    });
    expect(value).to.be.undefined;
    yield macroTask();
    expect(value).to.be.true;
  });

  it('should work with promise inside setTimeout', function* () {
    let value;
    win.setTimeout(() => {
      value = false;
      Promise.resolve().then(() => {
        value = true;
      });
    }, 100);

    expect(value).to.be.undefined;
    clock.tick(100);
    expect(value).to.be.false;
    yield macroTask();
    expect(value).to.be.true;
  });

  it('should work with manually resolved promise inside setTimeout', function* () {
    let value;
    let resolver;
    const promise = new Promise((r) => {
      resolver = r;
    });
    promise.then(() => {
      value = true;
    });
    win.setTimeout(() => {
      value = false;
      resolver();
    }, 100);
    clock.tick(100);
    expect(value).to.be.false;
    yield macroTask();
    expect(value).to.be.true;
  });

  it('should block a promise', function* () {
    let resolver;
    const promise = new Promise((r) => {
      resolver = r;
    }).then(() => 'yes');
    resolver();
    const result = yield promise;
    expect(result).to.equal('yes');
  });

  it('should be able to expect throwable', function* () {
    const promiseThatRejects = Promise.reject(new Error('OMG'));
    try {
      yield promiseThatRejects;
      throw new Error('UNREACHABLE');
    } catch (e) {
      expect(e.message).to.contain('OMG');
    }
  });
});
