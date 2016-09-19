/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
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

import {
  polyfillOptionsSupport,
  supportsOptions
} from '../../src/polyfills/event-listener';

import * as sinon from 'sinon';

describe('supportsOptions', () => {
  let sandbox;
  let win;

  it('should be true if browser tries to access options', () => {
    stubAddEventListener(/* withSupportForOptions */ true);
    expect(supportsOptions(win)).to.be.true;
  });

  it('should be false if browser does not try to access options, ', () => {
    stubAddEventListener(/* withSupportForOptions */ false);
    expect(supportsOptions(win)).to.be.false;
  });

  beforeEach(() => {
    win = window;
    sandbox = sinon.sandbox.create();
  });

  afterEach(() => {
    sandbox.restore();
  });

  function stubAddEventListener(withSupportForOptions) {
    const eventInterface = win.EventTarget || win.Element;
    const eventPrototype = eventInterface.prototype;
    sandbox.stub(eventPrototype, 'addEventListener', function(t, h, options) {
      if (withSupportForOptions && typeof options === 'object') {
        // Just access a property to indicate we support options as third arg.
        options.passive;
      }
    });
  }
});

describe('polyfillOptionsSupport', () => {
  let sandbox;
  let win;
  let originalAdd;
  let originalRemove;

  it('should override original add/remove event handler methods', () => {
    const proto = win.EventTarget.prototype;

    expect(proto.addEventListener).to.equal(originalAdd);
    expect(proto.removeEventListener).to.equal(originalRemove);

    polyfillOptionsSupport(win);

    expect(proto.addEventListener).to.not.equal(originalAdd);
    expect(proto.removeEventListener).to.not.equal(originalRemove);
  });

  it('should fallback to Element if EventTarget is not supported', () => {
    win.EventTarget = undefined;
    const proto = win.Element.prototype;

    expect(proto.addEventListener).to.equal(originalAdd);
    expect(proto.removeEventListener).to.equal(originalRemove);

    polyfillOptionsSupport(win);

    expect(proto.addEventListener).to.not.equal(originalAdd);
    expect(proto.removeEventListener).to.not.equal(originalRemove);
  });

  it('third arg of original method should be false if empty options', () => {
    polyfillOptionsSupport(win);
    const eventTarget = new win.EventTarget();

    eventTarget.addEventListener('', '', {});
    expect(originalAdd.calledWithExactly('', '', false)).to.be.true;

    eventTarget.removeEventListener('', '', {});
    expect(originalRemove.calledWithExactly('', '', false)).to.be.true;
  });

  it('third arg of original method should be true if options.capture is '
      + 'true', () => {
    polyfillOptionsSupport(win);
    const eventTarget = new win.EventTarget();
    const options = {capture: true};

    eventTarget.addEventListener('', '', options);
    expect(originalAdd.calledWithExactly('', '', true)).to.be.true;

    eventTarget.removeEventListener('', '', options);
    expect(originalRemove.calledWithExactly('', '', true)).to.be.true;
  });

  it('third arg of original method should be true if options.capture is '
      + 'false', () => {
    polyfillOptionsSupport(win);
    const eventTarget = new win.EventTarget();
    const options = {capture: false};

    eventTarget.addEventListener('', '', options);
    expect(originalAdd.calledWithExactly('', '', false)).to.be.true;

    eventTarget.removeEventListener('', '', options);
    expect(originalRemove.calledWithExactly('', '', false)).to.be.true;
  });

  it('third arg of original method should not be changed if options' +
      'is not an object', () => {

    polyfillOptionsSupport(win);

    test('');
    test(10);
    test(false);
    test(true);
    test(null);
    test(undefined);

    function test(options) {
      const eventTarget = new win.EventTarget();
      eventTarget.addEventListener('', '', options);
      expect(originalAdd.calledWithExactly('', '', options)).to.be.true;

      eventTarget.removeEventListener('', '', options);
      expect(originalRemove.calledWithExactly('', '', options)).to.be.true;

      originalAdd.reset();
      originalRemove.reset();
    }


  });

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    win = sandbox.mock();
    originalAdd = sandbox.spy();
    originalRemove = sandbox.spy();

    function EventTarget() {};
    EventTarget.prototype.addEventListener = originalAdd;
    EventTarget.prototype.removeEventListener = originalRemove;

    win.EventTarget = EventTarget;
    win.Element = EventTarget;
  });

  afterEach(() => {
    sandbox.restore();
  });
});
