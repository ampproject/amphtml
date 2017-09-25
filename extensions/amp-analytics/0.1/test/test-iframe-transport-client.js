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

import {MessageType} from '../../../../src/3p-frame-messaging';
import {
  IframeTransportClient,
} from '../../../../3p/iframe-transport-client';
import {adopt} from '../../../../src/runtime';
import * as sinon from 'sinon';

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
    window.processAmpAnalyticsEvent = (event, transportId) => {
      expect(transportId).to.equal('101');
      expect(event).to.equal('hello, world!');
    };
    send(MessageType.IFRAME_TRANSPORT_EVENTS, /** @type {!JsonObject} */ ({
      events: [
        {transportId: '101', message: 'hello, world!'},
      ]}));
  });
});
