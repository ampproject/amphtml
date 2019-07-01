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

import {Observable} from '../../src/observable';
import {
  createCustomEvent,
  isLoaded,
  listen,
  listenOnce,
  listenOncePromise,
  loadPromise,
} from '../../src/event-helper';
import {
  detectEvtListenerOptsSupport,
  resetEvtListenerOptsSupportForTesting,
} from '../../src/event-helper-listen';

describe('EventHelper', () => {
  function getEvent(name, target) {
    const event = document.createEvent('Event');
    event.initEvent(name, true, true);
    event.testTarget = target;
    return event;
  }

  let sandbox;
  let element;
  let loadObservable;
  let errorObservable;
  let addEventListenerStub;
  let removeEventListenerStub;

  beforeEach(() => {
    sandbox = sinon.sandbox;
    loadObservable = new Observable();
    errorObservable = new Observable();
    element = {
      tagName: 'TEST',
      complete: false,
      readyState: '',
      addEventListener(type, callback) {
        if (type == 'load') {
          loadObservable.add(callback);
        } else if (type == 'error') {
          errorObservable.add(callback);
        } else {
          expect(type).to.equal('load or error');
        }
      },
      removeEventListener(type, callback) {
        if (type == 'load') {
          loadObservable.remove(callback);
        } else if (type == 'error') {
          errorObservable.remove(callback);
        } else {
          expect(type).to.equal('load or error');
        }
      },
    };
  });

  afterEach(() => {
    // Very important that all listeners are removed.
    expect(loadObservable.getHandlerCount()).to.equal(0);
    expect(errorObservable.getHandlerCount()).to.equal(0);

    sandbox.restore();
  });

  it('listen', () => {
    const event = getEvent('load', element);
    let c = 0;
    const handler = e => {
      c++;
      expect(e).to.equal(event);
    };
    const unlisten = listen(element, 'load', handler);

    // Not fired yet.
    expect(c).to.equal(0);

    // Fired once.
    loadObservable.fire(event);
    expect(c).to.equal(1);

    // Fired second time.
    loadObservable.fire(event);
    expect(c).to.equal(2);

    unlisten();
    loadObservable.fire(event);
    expect(c).to.equal(2);
  });

  it('listenOnce', () => {
    const event = getEvent('load', element);
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
    const event = getEvent('load', element);
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
    const event = getEvent('load', element);
    const promise = listenOncePromise(element, 'load').then(result => {
      expect(result).to.equal(event);
    });
    loadObservable.fire(event);
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

  it('isLoaded for Window', () => {
    expect(isLoaded(window)).to.equal(true);
    const win = {
      document: {
        readyState: 'interactive',
      },
    };
    expect(isLoaded(win)).to.equal(false);
    win.document.readyState = 'complete';
    expect(isLoaded(win)).to.equal(true);
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
    loadObservable.fire(getEvent('load', element));
    return promise;
  });

  it('loadPromise - error event', () => {
    const promise = loadPromise(element)
      .then(result => {
        assert.fail('must never be here: ' + result);
      })
      .then(
        () => {
          throw new Error('Should not be reached.');
        },
        reason => {
          expect(reason.message).to.include('Failed to load');
        }
      );
    errorObservable.fire(getEvent('error', element));
    return promise;
  });

  it('should polyfill CustomEvent constructor', () => {
    const native = createCustomEvent(
      window,
      'foo',
      {bar: 123},
      {bubbles: true, cancelable: true}
    );
    expect(native.type).to.equal('foo');
    expect(native.detail).to.deep.equal({bar: 123});
    expect(native.bubbles).to.be.true;
    expect(native.cancelable).to.be.true;

    const polyfilled = createCustomEvent(
      {document},
      'foo',
      {bar: 123},
      {bubbles: true, cancelable: true}
    );
    expect(polyfilled.type).to.equal('foo');
    expect(polyfilled.detail).to.deep.equal({bar: 123});
    expect(polyfilled.bubbles).to.be.true;
    expect(polyfilled.cancelable).to.be.true;
  });

  it('should create the correct custom event for IE11', () => {
    const native = createCustomEvent(window, 'foo', {bar: 123});
    expect(native.type).to.equal('foo');
    expect(native.detail).to.deep.equal({bar: 123});

    const initCustomEventSpy = sandbox.spy();
    const win = {};
    win.CustomEvent = {};
    win.document = {};
    win.document.createEvent = function() {
      return {
        initCustomEvent() {
          initCustomEventSpy();
        },
      };
    };
    createCustomEvent(win, 'foo', {bar: 123});
    expect(initCustomEventSpy).to.be.calledOnce;
  });

  it('should detect when addEventListener options are supported', () => {
    const eventListenerStubAcceptOpts = (type, listener, options) => {
      const getCapture = options.capture;
      if (getCapture) {
        // Added to bypass linter (never used warning)
      }
    };
    // Simulate an addEventListener that accepts options
    addEventListenerStub = sandbox
      .stub(self, 'addEventListener')
      .callsFake(eventListenerStubAcceptOpts);
    // Simulate a removeEventListener that accepts options
    removeEventListenerStub = sandbox
      .stub(self, 'removeEventListener')
      .callsFake(eventListenerStubAcceptOpts);
    resetEvtListenerOptsSupportForTesting();
    expect(detectEvtListenerOptsSupport()).to.be.true;
    expect(addEventListenerStub.called).to.be.true;
    expect(removeEventListenerStub.called).to.be.true;
    resetEvtListenerOptsSupportForTesting();
  });

  it('should cache the result of the test and only do it once', () => {
    resetEvtListenerOptsSupportForTesting();
    expect(detectEvtListenerOptsSupport()).to.be.true;
    expect(addEventListenerStub.called).to.be.true;
    expect(removeEventListenerStub.called).to.be.true;
    expect(detectEvtListenerOptsSupport()).to.be.true;
    expect(addEventListenerStub.calledOnce).to.be.true;
    expect(removeEventListenerStub.calledOnce).to.be.true;
  });

  it('should detect when addEventListener options are not supported', () => {
    const eventListenerStubRejectOpts = (type, listener, capture) => {
      const getCapture = capture;
      if (getCapture) {
        // Added to bypass linter (never used warning)
      }
    };
    // Simulate an addEventListener that does not accept options
    addEventListenerStub = sandbox
      .stub(self, 'addEventListener')
      .callsFake(eventListenerStubRejectOpts);
    // Simulate a removeEventListener that does not accept options
    removeEventListenerStub = sandbox
      .stub(self, 'removeEventListener')
      .callsFake(eventListenerStubRejectOpts);
    resetEvtListenerOptsSupportForTesting();
    expect(detectEvtListenerOptsSupport()).to.be.false;
    expect(addEventListenerStub.called).to.be.true;
    expect(removeEventListenerStub.called).to.be.true;
    expect(detectEvtListenerOptsSupport()).to.be.false;
    expect(removeEventListenerStub.calledOnce).to.be.true;
  });
});
