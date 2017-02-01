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
import {
  AmpContext,
} from '../../3p/ampcontext';
import {MessageType} from '../../src/3p-frame';
import {createIframePromise} from '../../testing/iframe';
import * as sinon from 'sinon';

describe('3p ampcontext.js', () => {
  let windowPostMessageSpy;
  let windowMessageHandler;
  let win;
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    windowPostMessageSpy = sinon.sandbox.spy();
    win = {
      addEventListener: (eventType, handlerFn) => {
        expect(eventType).to.equal('message');
        expect(windowMessageHandler).to.not.be.ok;
        windowMessageHandler = handlerFn;
      },
      parent: {
        postMessage: windowPostMessageSpy,
      },
    };
  });

  afterEach(() => {
    sandbox.restore();
    win = undefined;
    windowMessageHandler = undefined;
  });

  it('should add metadata to window.context', () => {
    win.name = generateAttributes();
    const context = new AmpContext(win);
    expect(context).to.be.ok;
    expect(context.location).to.equal('foo.com');
    expect(context.canonicalUrl).to.equal('foo.com');
    expect(context.pageViewId).to.equal('1');
    expect(context.sentinel).to.equal('1-291921');
    expect(context.startTime).to.equal('0');
    expect(context.referrer).to.equal('baz.net');
  });

  it ('should throw error if sentinel invalid', () => {
    win.name = generateAttributes('foobar');
    const AmpContextSpy = sandbox.spy(AmpContext);
    try{
      new AmpContextSpy(win);
    } catch (err) {
      // do nothing with it
    }
    expect(AmpContextSpy.threw()).to.be.true;
    expect(AmpContextSpy.exceptions.length).to.equal(1);
    expect(AmpContextSpy.exceptions[0].message).to.equal(
        'Incorrect sentinel format');
  });

  it ('should throw error if metadata missing', () => {
    win.name = generateIncorrectAttributes();
    const AmpContextSpy = sandbox.spy(AmpContext);
    try{
      new AmpContextSpy(win);
    } catch (err) {
      // do nothing with it
    }
    expect(AmpContextSpy.threw()).to.be.true;
    expect(AmpContextSpy.exceptions.length).to.equal(1);
    expect(AmpContextSpy.exceptions[0].message).to.equal(
        'Could not parse metadata.');
  });

  it('should be able to send an intersection observer request', () => {
    win.name = generateAttributes();
    const context = new AmpContext(win);
    const callbackSpy = sandbox.spy();
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
    expect(callbackSpy.calledOnce).to.be.true;
    expect(callbackSpy.calledWith(messagePayload));

    // Stop listening for intersection observer messages
    stopObserving();

    // Send intersection observer message
    windowMessageHandler(message);

    // callback should not have been called a second time
    expect(callbackSpy.calledOnce).to.be.true;
  });

  it('should send a pM and set callback when observePageVisibility()', () => {
    win.name = generateAttributes();
    const context = new AmpContext(win);
    const callbackSpy = sandbox.spy();
    const stopObserving = context.observePageVisibility(callbackSpy);

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
    win.name = generateAttributes();
    const context = new AmpContext(win);
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
    win.name = generateAttributes();
    const context = new AmpContext(win);
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

  /*it('context should be available when creation event fired', () => {
    // create an iframe that includes the ampcontext-lib script
    return createIframePromise().then(iframe => {
      iframe.win.name = generateAttributes();

      const windowContextPromise = new Promise(resolve => {
        iframe.win.addEventListener('amp-windowContextCreated', resolve);
      });

      const windowContextScript = iframe.doc.createElement('script');
      windowContextScript.src = '../../dist.3p/current/ampcontext-lib.js';

      const scriptPromise = new Promise((resolve, reject) => {
        windowContextScript.addEventListener('error', () => {
          reject(new Error('script error'));
        });
        windowContextScript.addEventListener('load', resolve);
      });

      iframe.doc.body.appendChild(windowContextScript);
      return scriptPromise.then(() => windowContextPromise).then(() => {
        expect(iframe.win.context).to.be.ok;
        expect(iframe.win.context.location).to.equal('foo.com');
        expect(iframe.win.context.canonicalUrl).to.equal('foo.com');
        expect(iframe.win.context.pageViewId).to.equal('1');
        expect(iframe.win.context.sentinel).to.equal('1-291921');
        expect(iframe.win.context.startTime).to.equal('0');
        expect(iframe.win.context.referrer).to.equal('baz.net');
      });
    });
  });
  */
});

function generateAttributes(opt_sentinel) {
  const attributes = {};
  const sentinel = opt_sentinel || '1-291921';
  attributes._context = {
    location: 'foo.com',
    canonicalUrl: 'foo.com',
    pageViewId: '1',
    sentinel: sentinel,
    startTime: '0',
    referrer: 'baz.net',
  };

  return encodeURI(JSON.stringify(attributes));
}


function generateIncorrectAttributes() {
  const attributes = {};
  attributes.wrong = {
    location: 'foo.com',
    canonicalUrl: 'foo.com',
    pageViewId: '1',
    sentinel: '1-291921',
    startTime: '0',
    referrer: 'baz.net',
  };

  return encodeURI(JSON.stringify(attributes));
}
