import {Signals} from '#core/data-structures/signals';

describes.sandboxed('data structures - Signals', {}, (env) => {
  let clock;
  let signals;

  beforeEach(() => {
    clock = env.sandbox.useFakeTimers();
    clock.tick(1);
    signals = new Signals();
  });

  it('should register signal without promise', () => {
    signals.signal('sig');
    expect(signals.get('sig')).to.equal(1);
    expect(signals.promiseMap_).to.be.null;
  });

  it('should reject signal without promise', () => {
    const error = new Error();
    signals.rejectSignal('sig', error);
    expect(signals.get('sig')).to.equal(error);
    expect(signals.promiseMap_).to.be.null;
  });

  it('should not duplicate signal', () => {
    signals.signal('sig', 11);
    expect(signals.map_['sig']).to.equal(11);

    signals.signal('sig', 12);
    expect(signals.map_['sig']).to.equal(11); // Did not change.

    signals.rejectSignal('sig', new Error());
    expect(signals.map_['sig']).to.equal(11); // Did not change.
  });

  it('should override signal time', () => {
    signals.signal('sig', 11);
    expect(signals.map_['sig']).to.equal(11);

    signals.signal('sig-1');
    expect(signals.map_['sig-1']).to.equal(1);

    // zero is respected
    signals.signal('sig-2', 0);
    expect(signals.map_['sig-2']).to.equal(0);
    expect(signals.promiseMap_).to.be.null;
  });

  it('should resolve signal after it was requested', () => {
    const promise = signals.whenSignal('sig');
    expect(signals.promiseMap_['sig'].promise).to.equal(promise);
    expect(signals.promiseMap_['sig'].resolve).to.be.ok;
    expect(signals.promiseMap_['sig'].reject).to.be.ok;
    expect(signals.whenSignal('sig')).to.equal(promise); // Reuse promise.
    signals.signal('sig', 11);
    return promise.then((time) => {
      expect(time).to.equal(11);
      expect(signals.promiseMap_['sig'].promise).to.equal(promise);
      expect(signals.promiseMap_['sig'].resolve).to.be.undefined;
      expect(signals.promiseMap_['sig'].reject).to.be.undefined;
      expect(signals.whenSignal('sig')).to.equal(promise); // Reuse promise.
    });
  });

  it('should resolve signal before it was requested', () => {
    signals.signal('sig', 11);
    const promise = signals.whenSignal('sig');
    expect(signals.promiseMap_['sig'].promise).to.equal(promise);
    expect(signals.promiseMap_['sig'].resolve).to.be.undefined;
    expect(signals.promiseMap_['sig'].reject).to.be.undefined;
    expect(signals.whenSignal('sig')).to.equal(promise); // Reuse promise.
    return promise.then((time) => {
      expect(time).to.equal(11);
      expect(signals.promiseMap_['sig'].promise).to.equal(promise);
      expect(signals.promiseMap_['sig'].resolve).to.be.undefined;
      expect(signals.promiseMap_['sig'].reject).to.be.undefined;
      expect(signals.whenSignal('sig')).to.equal(promise); // Reuse promise.
    });
  });

  it('should reject signal after it was requested', () => {
    const promise = signals.whenSignal('sig');
    expect(signals.promiseMap_['sig'].promise).to.equal(promise);
    const error = new Error();
    signals.rejectSignal('sig', error);
    return promise.then(
      () => {
        throw new Error('should have failed');
      },
      (reason) => {
        expect(reason).to.equal(error);
        expect(signals.promiseMap_['sig'].promise).to.equal(promise);
        expect(signals.promiseMap_['sig'].resolve).to.be.undefined;
        expect(signals.promiseMap_['sig'].reject).to.be.undefined;
        expect(signals.whenSignal('sig')).to.equal(promise); // Reuse promise.
      }
    );
  });

  it('should reject signal before it was requested', () => {
    const error = new Error();
    signals.rejectSignal('sig', error);
    const promise = signals.whenSignal('sig');
    expect(signals.promiseMap_['sig'].promise).to.equal(promise);
    return promise.then(
      () => {
        throw new Error('should have failed');
      },
      (reason) => {
        expect(reason).to.equal(error);
        expect(signals.promiseMap_['sig'].promise).to.equal(promise);
        expect(signals.promiseMap_['sig'].resolve).to.be.undefined;
        expect(signals.promiseMap_['sig'].reject).to.be.undefined;
        expect(signals.whenSignal('sig')).to.equal(promise); // Reuse promise.
      }
    );
  });

  it('should reset signal before it was triggered', () => {
    signals.reset('sig');
    expect(signals.get('sig')).to.be.null;
    expect(signals.promiseMap_).to.be.null;
  });

  it('should reset signal after it was triggered', () => {
    signals.signal('sig');
    expect(signals.get('sig')).to.be.ok;

    signals.reset('sig');
    expect(signals.get('sig')).to.be.null;
    expect(signals.promiseMap_).to.be.null;
  });

  it('should reset signal after it was requested', () => {
    signals.whenSignal('sig');
    const iniPromise = signals.promiseMap_['sig'].promise;
    expect(iniPromise).to.be.ok;

    signals.reset('sig');
    // Promise has not changed.
    expect(signals.promiseMap_['sig'].promise).to.equal(iniPromise);
    expect(signals.promiseMap_['sig'].resolve).to.be.ok;
  });

  it('should reset signal after it was resolved', () => {
    signals.whenSignal('sig');
    signals.signal('sig');
    const iniPromise = signals.promiseMap_['sig'].promise;
    expect(iniPromise).to.be.ok;
    expect(signals.promiseMap_['sig'].resolve).to.be.undefined;

    signals.reset('sig');
    // Promise has been reset completely.
    expect(signals.promiseMap_['sig']).to.be.undefined;
  });

  it('should reset a pre-resolved signal', () => {
    signals.signal('sig');
    signals.whenSignal('sig');
    const iniPromise = signals.promiseMap_['sig'].promise;
    expect(iniPromise).to.be.ok;
    expect(signals.promiseMap_['sig'].resolve).to.be.undefined;

    signals.reset('sig');
    // Promise has been reset completely.
    expect(signals.promiseMap_['sig']).to.be.undefined;
  });
});

describes.sandboxed('Signals with zero for tests', {}, (env) => {
  let signals;

  beforeEach(() => {
    env.sandbox.useFakeTimers();
    signals = new Signals();
  });

  it('should register signal without promise', () => {
    // The signal value is often 0 in tests due to the fake timer.
    signals.signal('sig');
    expect(signals.get('sig')).to.equal(0);
  });
});
