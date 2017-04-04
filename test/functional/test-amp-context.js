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
import {
  AmpContext,
} from '../../3p/ampcontext';
import {MessageType} from '../../src/3p-frame-messaging';
import * as sinon from 'sinon';

const NOOP = () => {};

describe('3p ampcontext.js', () => {
  let windowPostMessageSpy;
  let windowMessageHandler;
  let win;
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    windowPostMessageSpy = sandbox.spy();
    win = {
      addEventListener: (eventType, handlerFn) => {
        expect(eventType).to.equal('message');
        expect(windowMessageHandler).to.not.be.ok;
        windowMessageHandler = handlerFn;
      },
      parent: {
        postMessage: windowPostMessageSpy,
      },

      // setTimeout is needed for nextTick.
      // makes nextTick behavior synchronous for test assertions.
      setTimeout: cb => cb(),

      // we don't care about window events for these tests since that behavior
      // is deprecated.
      document: {
        createEvent: () => ({
          initEvent: NOOP,
        }),
      },
      dispatchEvent: NOOP,
    };
  });

  afterEach(() => {
    sandbox.restore();
    win = undefined;
    windowMessageHandler = undefined;
  });

  it('should add metadata to window.context using name as per 3P.', () => {
    win.name = generateSerializedAttributes();
    const context = new AmpContext(win);
    expect(context).to.be.ok;
    expect(context.location).to.equal('foo.com');
    expect(context.canonicalUrl).to.equal('foo.com');
    expect(context.pageViewId).to.equal('1');
    expect(context.sentinel).to.equal('1-291921');
    expect(context.startTime).to.equal(0);
    expect(context.referrer).to.equal('baz.net');
  });

  it('should add metadata to window.context using name as per A4A.', () => {
    win.name = generateSerializedAttributesA4A();
    const context = new AmpContext(win);
    expect(context).to.be.ok;
    expect(context.location).to.equal('foo.com');
    expect(context.canonicalUrl).to.equal('foo.com');
    expect(context.pageViewId).to.equal('1');
    expect(context.sentinel).to.equal('1-291921');
    expect(context.startTime).to.equal(0);
    expect(context.referrer).to.equal('baz.net');
  });

  it('should add metadata to window.context using window var.', () => {
    win.AMP_CONTEXT_DATA = generateAttributes();
    const context = new AmpContext(win);
    expect(context).to.be.ok;
    expect(context.location).to.equal('foo.com');
    expect(context.canonicalUrl).to.equal('foo.com');
    expect(context.pageViewId).to.equal('1');
    expect(context.sentinel).to.equal('1-291921');
    expect(context.startTime).to.equal(0);
    expect(context.referrer).to.equal('baz.net');
  });

  it('should set up only sentinel if no metadata provided.', () => {
    const sentinel = '1-456';
    win.AMP_CONTEXT_DATA = sentinel;
    const context = new AmpContext(win);
    expect(context).to.be.ok;
    expect(context.sentinel).to.equal(sentinel);
  });

  it('should throw error if sentinel invalid', () => {
    win.name = generateSerializedAttributes('foobar');
    const AmpContextSpy = sandbox.spy(AmpContext);
    try {
      new AmpContextSpy(win);
    } catch (err) {
      // do nothing with it
    }
    expect(AmpContextSpy.threw()).to.be.true;
    expect(AmpContextSpy.exceptions.length).to.equal(1);
    expect(AmpContextSpy.exceptions[0].message).to.equal(
        'Incorrect sentinel format');
  });

  it('should throw error if metadata missing', () => {
    win.name = generateIncorrectAttributes();
    const AmpContextSpy = sandbox.spy(AmpContext);
    try {
      new AmpContextSpy(win);
    } catch (err) {
      // do nothing with it
    }
    expect(AmpContextSpy.threw()).to.be.true;
    expect(AmpContextSpy.exceptions.length).to.equal(1);
  });

  it('should be able to send an intersection observer request', () => {
    win.name = generateSerializedAttributes();
    const context = new AmpContext(win);
    const callbackSpy = sandbox.spy();

    // Resetting since a message is sent on construction.
    windowPostMessageSpy.reset();

    const stopObserving = context.observeIntersection(callbackSpy);

    // window.context should have sent postMessage asking for intersection
    // observer
    expect(windowPostMessageSpy.calledOnce).to.be.true;
    expect(windowPostMessageSpy.calledWith({
      sentinel: '1-291921',
      type: MessageType.SEND_INTERSECTIONS,
    }, '*'));

    // send an intersection message down
    const messagePayload = {
      sentinel: '1-291921',
      type: MessageType.INTERSECTION,
    };
    const messageData = 'amp-' + JSON.stringify(messagePayload);
    const message = {
      source: context.client_.hostWindow_,
      data: messageData,
    };
    windowMessageHandler(message);

    // window.context should have received intersection observer postMessage
    // back, and should have called the callback function
    // TODO(alanorozco): Called twice for backwards compatibility with
    // window.context. This behavior is deprecated and this test should be
    // changed when removed.
    expect(callbackSpy.calledTwice).to.be.true;
    expect(callbackSpy.calledWith(messagePayload));

    // Stop listening for intersection observer messages
    stopObserving();

    // Send intersection observer message
    windowMessageHandler(message);

    // TODO(alanorozco): Called twice for backwards compatibility with
    // window.context. This behavior is deprecated and this test should be
    // changed when removed.
    expect(callbackSpy.calledTwice).to.be.true;
  });

  it('should send a pM and set callback when onPageVisibilityChange()', () => {
    win.name = generateSerializedAttributes();
    const context = new AmpContext(win);
    const callbackSpy = sandbox.spy();
    const stopObserving = context.onPageVisibilityChange(callbackSpy);

    // window.context should have sent postMessage asking for visibility
    // observer
    expect(windowPostMessageSpy.calledOnce).to.be.true;
    expect(windowPostMessageSpy.calledWith({
      sentinel: '1-291921',
      type: MessageType.SEND_EMBED_STATE,
    }, '*'));

    // send a page visibility message down
    const messagePayload = {
      sentinel: '1-291921',
      type: MessageType.EMBED_STATE,
    };
    const messageData = 'amp-' + JSON.stringify(messagePayload);
    const message = {
      source: context.client_.hostWindow_,
      data: messageData,
    };
    windowMessageHandler(message);

    // window.context should have received visibility observer postMessage
    // back, and should have called the callback function
    expect(callbackSpy.calledOnce).to.be.true;
    expect(callbackSpy.calledWith(messagePayload));

    // Stop listening for page visibility observer messages
    stopObserving();

    // Send visibility observer message
    windowMessageHandler(message);

    // callback should not have been called a second time
    expect(callbackSpy.calledOnce).to.be.true;
  });

  it('should call resize success callback on resize success', () => {
    win.name = generateSerializedAttributes();
    const context = new AmpContext(win);

    // Resetting since a message is sent on construction.
    windowPostMessageSpy.reset();

    const successCallbackSpy = sandbox.spy();
    const deniedCallbackSpy = sandbox.spy();

    context.onResizeSuccess(successCallbackSpy);
    context.onResizeDenied(deniedCallbackSpy);

    const height = 100;
    const width = 200;
    context.requestResize(height, width);

    // window.context should have sent postMessage requesting resize
    expect(windowPostMessageSpy.calledOnce).to.be.true;
    expect(windowPostMessageSpy.calledWith({
      sentinel: '1-291921',
      type: MessageType.SEND_EMBED_STATE,
      width,
      height,
    }, '*'));

    // send a resize success message down
    const messagePayload = {
      sentinel: '1-291921',
      type: MessageType.EMBED_SIZE_CHANGED,
    };
    const messageData = 'amp-' + JSON.stringify(messagePayload);
    const message = {
      source: context.client_.hostWindow_,
      data: messageData,
    };
    windowMessageHandler(message);

    // window.context should have received resize success message, and then
    // called the success callback
    expect(successCallbackSpy.calledOnce).to.be.true;
    expect(successCallbackSpy.calledWith(messagePayload));

    expect(deniedCallbackSpy.called).to.be.false;
  });

  it('should call resize denied callback on resize denied', () => {
    win.name = generateSerializedAttributes();
    const context = new AmpContext(win);

    // Resetting since a message is sent on construction.
    windowPostMessageSpy.reset();

    const successCallbackSpy = sandbox.spy();
    const deniedCallbackSpy = sandbox.spy();

    context.onResizeSuccess(successCallbackSpy);
    context.onResizeDenied(deniedCallbackSpy);

    const height = 100;
    const width = 200;
    context.requestResize(height, width);

    // window.context should have sent resize request postMessage
    expect(windowPostMessageSpy.calledOnce).to.be.true;
    expect(windowPostMessageSpy.calledWith({
      sentinel: '1-291921',
      type: MessageType.SEND_EMBED_STATE,
      width,
      height,
    }, '*'));

    // send a resize denied message down
    const messagePayload = {
      sentinel: '1-291921',
      type: MessageType.EMBED_SIZE_DENIED,
    };
    const messageData = 'amp-' + JSON.stringify(messagePayload);
    const message = {
      source: context.client_.hostWindow_,
      data: messageData,
    };
    windowMessageHandler(message);

    // resize denied callback should have been called
    expect(deniedCallbackSpy.calledOnce).to.be.true;
    expect(deniedCallbackSpy.calledWith(messagePayload));

    expect(successCallbackSpy.called).to.be.false;
  });
});

function generateSerializedAttributes(opt_sentinel) {
  return JSON.stringify(generateAttributes(opt_sentinel));
}

function generateAttributes(opt_sentinel) {
  const name = {};
  name.attributes = {};
  const sentinel = opt_sentinel || '1-291921';
  name.attributes._context = {
    location: 'foo.com',
    canonicalUrl: 'foo.com',
    pageViewId: '1',
    sentinel,
    startTime: 0,
    referrer: 'baz.net',
  };

  return name;
}

function generateSerializedAttributesA4A(opt_sentinel) {
  return JSON.stringify(generateAttributesA4A(opt_sentinel));
}

function generateAttributesA4A(opt_sentinel) {
  const attributes = {};
  const sentinel = opt_sentinel || '1-291921';
  attributes._context = {
    location: 'foo.com',
    canonicalUrl: 'foo.com',
    pageViewId: '1',
    sentinel,
    startTime: 0,
    referrer: 'baz.net',
  };

  return attributes;
}


function generateIncorrectAttributes() {
  const name = {};
  name.attributes = {};
  name.attributes.wrong = {
    location: 'foo.com',
    canonicalUrl: 'foo.com',
    pageViewId: '1',
    sentinel: '1-291921',
    startTime: 0,
    referrer: 'baz.net',
  };

  return JSON.stringify(name);
}
