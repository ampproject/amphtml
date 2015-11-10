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

import {isLoaded, listenOnce, listenOncePromise, loadPromise}
    from '../../src/event-helper';
import {Observable} from '../../src/observable';
import * as sinon from 'sinon';

describe('EventHelper', () => {

  function getEvent(name) {
    const event = document.createEvent('Event');
    event.initEvent(name, true, true);
    return event;
  }

  let sandbox;
  let element;
  let loadObservable;
  let errorObservable;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    sandbox.useFakeTimers();
    loadObservable = new Observable();
    errorObservable = new Observable();
    element = {
      complete: false,
      readyState: '',
      addEventListener: function(type, callback) {
        if (type == 'load') {
          loadObservable.add(callback);
        } else if (type == 'error') {
          errorObservable.add(callback);
        } else {
          expect(type).to.equal("load or error");
        }
      },
      removeEventListener: function(type, callback) {
        if (type == 'load') {
          loadObservable.remove(callback);
        } else if (type == 'error') {
          errorObservable.remove(callback);
        } else {
          expect(type).to.equal("load or error");
        }
      }
    };
  });

  afterEach(() => {
    // Very important that all listeners are removed.
    expect(loadObservable.getHandlerCount()).to.equal(0);
    expect(errorObservable.getHandlerCount()).to.equal(0);

    loadObservable = null;
    errorObservable = null;
    element = null;
    sandbox.restore();
    sandbox = null;
  });

  it('listenOnce', () => {
    const event = getEvent('load');
    let c = 0;
    const handler = e => {
      c++;
      expect(e).to.equal(event);
    };
    listenOnce(element, 'load', handler);

    // Not fired yet.
    expect(c).to.equal(0);

    // Fired once.
    loadObservable.fire(event);
    expect(c).to.equal(1);

    // Fired second time: no longer listening.
    loadObservable.fire(event);
    expect(c).to.equal(1);
  });

  it('listenOnce - cancel', () => {
    const event = getEvent('load');
    let c = 0;
    const handler = e => {
      c++;
      expect(e).to.equal(event);
    };
    const unlisten = listenOnce(element, 'load', handler);

    // Not fired yet.
    expect(c).to.equal(0);

    // Cancel.
    unlisten();

    // Fired once: no longer listening.
    loadObservable.fire(event);
    expect(c).to.equal(0);
  });

  it('listenOncePromise - load event', () => {
    const event = getEvent('load');
    const promise = listenOncePromise(element, 'load').then(result => {
      expect(result).to.equal(event);
    });
    loadObservable.fire(event);
    return promise;
  });

  it('listenOncePromise - with time limit', () => {
    const event = getEvent('load');
    const promise = expect(listenOncePromise(element, 'load', false, 100))
      .to.eventually.become(event);
    sandbox.clock.tick(99);
    loadObservable.fire(event);
    return promise;
  });

  it('listenOncePromise - timeout', () => {
    const promise = expect(listenOncePromise(element, 'load', false, 100))
      .to.eventually.be.rejectedWith('timeout');
    sandbox.clock.tick(101);
    return promise;
  });

  it('isLoaded for complete property', () => {
    expect(isLoaded(element)).to.equal(false);
    element.complete = true;
    expect(isLoaded(element)).to.equal(true);
  });

  it('isLoaded for readyState property', () => {
    expect(isLoaded(element)).to.equal(false);
    element.readyState = 'complete';
    expect(isLoaded(element)).to.equal(true);
  });

  it('loadPromise - already complete', () => {
    element.complete = true;
    return loadPromise(element).then(result => {
      expect(result).to.equal(element);
    });
  });

  it('loadPromise - already readyState == complete', () => {
    element.readyState = 'complete';
    return loadPromise(element).then(result => {
      expect(result).to.equal(element);
    });
  });

  it('loadPromise - load event', () => {
    const promise = loadPromise(element).then(result => {
      expect(result).to.equal(element);
    });
    loadObservable.fire(getEvent('load'));
    return promise;
  });

  it('loadPromise - error event', () => {
    const promise = loadPromise(element).then(result => {
      assert.fail('must never be here: ' + result);
    }).catch(reason => {
    });
    errorObservable.fire(getEvent('error'));
    return promise;
  });

});
