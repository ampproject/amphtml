/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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

import {Signals} from '../../../src/utils/signals';


describes.sandboxed('Signals', {}, () => {
  let clock;
  let signals;

  beforeEach(() => {
    clock = sandbox.useFakeTimers();
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
    expect(signals.promiseMap_).to.be.null;
  });

  it('should resolve signal after it was requested', () => {
    const promise = signals.whenSignal('sig');
    expect(signals.promiseMap_['sig'].promise).to.equal(promise);
    expect(signals.promiseMap_['sig'].resolve).to.be.ok;
    expect(signals.promiseMap_['sig'].reject).to.be.ok;
    expect(signals.whenSignal('sig')).to.equal(promise); // Reuse promise.
    signals.signal('sig', 11);
    return promise.then(time => {
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
    return promise.then(time => {
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
    return promise.then(() => {
      throw new Error('should have failed');
    }, reason => {
      expect(reason).to.equal(error);
      expect(signals.promiseMap_['sig'].promise).to.equal(promise);
      expect(signals.promiseMap_['sig'].resolve).to.be.undefined;
      expect(signals.promiseMap_['sig'].reject).to.be.undefined;
      expect(signals.whenSignal('sig')).to.equal(promise); // Reuse promise.
    });
  });

  it('should reject signal before it was requested', () => {
    const error = new Error();
    signals.rejectSignal('sig', error);
    const promise = signals.whenSignal('sig');
    expect(signals.promiseMap_['sig'].promise).to.equal(promise);
    return promise.then(() => {
      throw new Error('should have failed');
    }, reason => {
      expect(reason).to.equal(error);
      expect(signals.promiseMap_['sig'].promise).to.equal(promise);
      expect(signals.promiseMap_['sig'].resolve).to.be.undefined;
      expect(signals.promiseMap_['sig'].reject).to.be.undefined;
      expect(signals.whenSignal('sig')).to.equal(promise); // Reuse promise.
    });
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
