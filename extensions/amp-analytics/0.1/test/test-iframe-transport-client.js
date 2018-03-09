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

import * as sinon from 'sinon';
import {
  IframeTransportClient, IframeTransportContext,
} from '../../../../3p/iframe-transport-client';
import {MessageType} from '../../../../src/3p-frame-messaging';
import {adopt} from '../../../../src/runtime';

adopt(window);

let nextId = 5000;
function createUniqueId() {
  return String(++(nextId));
}

describe('iframe-transport-client', () => {
  let sandbox;
  let iframeTransportClient;
  let sentinel;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    sentinel = createUniqueId();
    window.name = JSON.stringify({sentinel, type: 'some-vendor'});
    iframeTransportClient = new IframeTransportClient(window);
  });

  afterEach(() => {
    sandbox.restore();
  });

  /**
   * Sends a message from the current window to itself
   * @param {string} type Type of the message.
   * @param {!JsonObject} object Message payload.
   */
  function send(type, data) {
    const object = {};
    object['type'] = type;
    object['sentinel'] = sentinel;
    if (data['events']) {
      object['events'] = data['events'];
    } else {
      object['data'] = data;
    }
    const payload = 'amp-' + JSON.stringify(object);
    window./*OK*/postMessage(payload, '*');
  }

  it('fails to create iframeTransportClient if no window.name ', () => {
    const oldWindowName = window.name;
    expect(() => {
      window.name = '';
      new IframeTransportClient(window);
    }).to.throw(/Cannot read property/);
    window.name = oldWindowName;
  });

  it('fails to create iframeTransportClient if window.name is missing' +
    ' sentinel', () => {
    const oldWindowName = window.name;
    expect(() => {
      window.name = JSON.stringify({type: 'some-vendor'});
      new IframeTransportClient(window);
    }).to.throw(/missing sentinel/);
    window.name = oldWindowName;
  });

  it('fails to create iframeTransportClient if window.name is missing' +
    ' type', () => {
    const oldWindowName = window.name;
    expect(() => {
      window.name = JSON.stringify({sentinel});
      new IframeTransportClient(window);
    }).to.throw(/must supply vendor name/);
    window.name = oldWindowName;
  });

  it('sets sentinel from window.name.sentinel ', () => {
    const client = iframeTransportClient.getIframeMessagingClient();
    expect(client.sentinel_).to.equal(sentinel);
  });

  it('receives an event message ', () => {
    window.processAmpAnalyticsEvent = (event, creativeId) => {
      expect(creativeId).to.equal('101');
      expect(event).to.equal('hello, world!');
    };
    send(MessageType.IFRAME_TRANSPORT_EVENTS, /** @type {!JsonObject} */ ({
      events: [
        {creativeId: '101', message: 'hello, world!'},
      ]}));
  });

  it('requires onNewContextInstance', () => {
    expect(() => {
      new IframeTransportContext(window,
          iframeTransportClient.iframeMessagingClient_,
          'my_creative', 'my_vendor');
    }).to.throw(/Must implement onNewContextInstance/);
  });

  it('calls onNewContextInstance', () => {
    const onNewContextInstanceSpy = sandbox.spy();
    window.onNewContextInstance = ctx => onNewContextInstanceSpy(ctx);
    const ctx = new IframeTransportContext(window,
        iframeTransportClient.iframeMessagingClient_,
        'my_creative', 'my_vendor');
    expect(onNewContextInstanceSpy).to.be.calledOnce;
    expect(onNewContextInstanceSpy).to.be.calledWith(ctx);
    window.onNewContextInstance = undefined;
  });

  it('Sets listener and baseMessage properly', () => {
    const onNewContextInstanceSpy = sandbox.spy();
    window.onNewContextInstance = ctx => onNewContextInstanceSpy(ctx);
    const ctx = new IframeTransportContext(window,
        iframeTransportClient.iframeMessagingClient_,
        'my_creative', 'my_vendor');
    expect(ctx.listener_).to.be.null;
    expect(ctx.baseMessage_).to.not.be.null;
    expect(ctx.baseMessage_.creativeId).to.equal('my_creative');
    expect(ctx.baseMessage_.vendor).to.equal('my_vendor');
    const listener1 = sandbox.spy();
    const listener2 = sandbox.spy();
    ctx.onAnalyticsEvent(listener1);
    expect(ctx.listener_).to.equal(listener1);
    ctx.onAnalyticsEvent(listener2);
    expect(ctx.listener_).to.equal(listener2);
    window.onNewContextInstance = undefined;
  });

  it('dispatches event', () => {
    const onNewContextInstanceSpy = sandbox.spy();
    window.onNewContextInstance = ctx => onNewContextInstanceSpy(ctx);
    const ctx = new IframeTransportContext(window,
        iframeTransportClient.iframeMessagingClient_,
        'my_creative', 'my_vendor');
    const listener = sandbox.spy();
    ctx.onAnalyticsEvent(listener);
    const event = 'Something important happened';
    ctx.dispatch(event);
    expect(listener).to.be.calledOnce;
    expect(listener).to.be.calledWith(event);
    window.onNewContextInstance = undefined;
  });

  it('sends response', () => {
    const onNewContextInstanceSpy = sandbox.spy();
    window.onNewContextInstance = ctx => onNewContextInstanceSpy(ctx);
    // This const exists solely to avoid triggering a false positive on the
    // presubmit rule that says you can't call stub() on a cross-domain iframe.
    const imc = iframeTransportClient.iframeMessagingClient_;
    const ctx = new IframeTransportContext(window, imc,
        'my_creative', 'my_vendor');
    const response = {foo: 'bar', answer: '42'};
    sandbox.stub(imc, 'sendMessage').callsFake((type, opt_payload) => {
      expect(type).to.equal(MessageType.IFRAME_TRANSPORT_RESPONSE);
      expect(opt_payload).to.not.be.null;
      expect(opt_payload.creativeId).to.equal('my_creative');
      expect(opt_payload.vendor).to.equal('my_vendor');
      expect(opt_payload.message).to.not.be.null;
      expect(opt_payload.message).to.equal(response);
    });
    ctx.sendResponseToCreative(response);
    window.onNewContextInstance = undefined;
  });
});
