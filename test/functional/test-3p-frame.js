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
  addDataAndJsonAttributes_,
  getIframe,
  getBootstrapBaseUrl,
  getSubDomain,
  preloadBootstrap,
  resetCountForTesting,
  resetBootstrapBaseUrlForTesting,
  serializeMessage,
  deserializeMessage,
} from '../../src/3p-frame';
import {toggleExperiment} from '../../src/experiments';
import {preconnectForElement} from '../../src/preconnect';
import {viewerForDoc} from '../../src/viewer';
import * as sinon from 'sinon';

describe('3p-frame', () => {

  let sandbox;
  let container;
  let preconnect;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    container = document.createElement('div');
    document.body.appendChild(container);
    preconnect = preconnectForElement(container);
  });

  afterEach(() => {
    resetBootstrapBaseUrlForTesting(window);
    sandbox.restore();
    resetCountForTesting();
    const m = document.querySelector(
        '[name="amp-3p-iframe-src"]');
    if (m) {
      m.parentElement.removeChild(m);
    }
    document.body.removeChild(container);
    toggleExperiment(window, 'sentinel-name-change', false);
  });

  function addCustomBootstrap(url) {
    const meta = document.createElement('meta');
    meta.setAttribute('name', 'amp-3p-iframe-src');
    meta.setAttribute('content', url);
    document.head.appendChild(meta);
  }

  it('add attributes', () => {
    const div = document.createElement('div');
    div.setAttribute('data-foo', 'foo');
    div.setAttribute('data-bar', 'bar');
    div.setAttribute('foo', 'nope');
    let obj = {};
    addDataAndJsonAttributes_(div, obj);
    expect(obj).to.deep.equal({
      'foo': 'foo',
      'bar': 'bar',
    });

    div.setAttribute('json', '{"abc": [1,2,3]}');

    obj = {};
    addDataAndJsonAttributes_(div, obj);
    expect(obj).to.deep.equal({
      'foo': 'foo',
      'bar': 'bar',
      'abc': [1, 2, 3],
    });
  });

  it('should pick the right bootstrap url for local-dev mode', () => {
    window.AMP_MODE = {localDev: true};
    expect(getBootstrapBaseUrl(window)).to.equal(
        'http://ads.localhost:9876/dist.3p/current/frame.max.html');
  });

  it('should pick the right bootstrap url for testing mode', () => {
    window.AMP_MODE = {test: true};
    expect(getBootstrapBaseUrl(window)).to.equal(
        'http://ads.localhost:9876/dist.3p/current/frame.max.html');
  });

  it('should pick the right bootstrap unique url (prod)', () => {
    window.AMP_MODE = {};
    expect(getBootstrapBaseUrl(window)).to.match(
        /^https:\/\/d-\d+\.ampproject\.net\/\$\internal\w+\$\/frame\.html$/);
  });

  it('should pick the right bootstrap url (custom)', () => {
    addCustomBootstrap('https://example.com/boot/remote.html');
    expect(getBootstrapBaseUrl(window)).to.equal(
        'https://example.com/boot/remote.html?$internalRuntimeVersion$');
  });

  it('should pick the right bootstrap url (custom)', () => {
    addCustomBootstrap('http://example.com/boot/remote.html');
    expect(() => {
      getBootstrapBaseUrl(window);
    }).to.throw(/meta source must start with "https/);
  });

  it('should pick the right bootstrap url (custom)', () => {
    addCustomBootstrap('http://localhost:9876/boot/remote.html');
    expect(() => {
      getBootstrapBaseUrl(window, true);
    }).to.throw(/must not be on the same origin as the/);
  });

  it('should prefetch bootstrap frame and JS', () => {
    window.AMP_MODE = {localDev: true};
    preloadBootstrap(window, preconnect);
    // Wait for visible promise
    return Promise.resolve().then(() => {
      const fetches = document.querySelectorAll(
          'link[rel=prefetch],link[rel=preload]');
      expect(fetches).to.have.length(2);
      expect(fetches[0]).to.have.property('href',
          'http://ads.localhost:9876/dist.3p/current/frame.max.html');
      expect(fetches[1]).to.have.property('href',
          'http://ads.localhost:9876/dist.3p/current/integration.js');
    });
  });

  it('should make sub domains (unique)', () => {
    expect(getSubDomain(window)).to.match(/^d-\d+$/);
    expect(getSubDomain(window)).to.not.equal('d-00');
  });

  it('should make sub domains (Math)', () => {
    const fakeWin = {document, Math};
    expect(getSubDomain(fakeWin)).to.match(/^d-\d+$/);
  });

  it('should make sub domains (crypto)', () => {
    const fakeWin = {
      document,
      crypto: {
        getRandomValues: function(arg) {
          arg[0] = 123;
          arg[1] = 987;
        },
      },
    };
    expect(getSubDomain(fakeWin)).to.equal('d-123987');
  });

  it('should make sub domains (fallback)', () => {
    const fakeWin = {
      document,
      Math: {
        random: function() {
          return 0.567;
        },
      },
    };
    expect(getSubDomain(fakeWin)).to.equal('d-5670');
  });

  it('uses a unique name based on domain', () => {
    const viewerMock = sandbox.mock(viewerForDoc(window.document));
    viewerMock.expects('getUnconfirmedReferrerUrl')
        .returns('http://acme.org/').twice();

    window.AMP_MODE = {};
    const link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    link.setAttribute('href', 'https://foo.bar/baz');
    document.head.appendChild(link);

    const div = document.createElement('div');
    div.setAttribute('type', '_ping_');
    div.setAttribute('width', 100);
    div.setAttribute('height', 200);
    div.getIntersectionChangeEntry = function() {
      return {
        left: 0,
        top: 0,
        width: 0,
        height: 0,
        bottom: 0,
        right: 0,
        x: 0,
        y: 0,
      };
    };

    container.appendChild(div);
    const name = JSON.parse(getIframe(window, div).name);
    resetBootstrapBaseUrlForTesting(window);
    resetCountForTesting();
    const newName = JSON.parse(getIframe(window, div).name);
    expect(name.host).to.match(/d-\d+.ampproject.net/);
    expect(name.type).to.match(/ping/);
    expect(name.count).to.match(/1/);
    expect(newName.host).to.match(/d-\d+.ampproject.net/);
    expect(newName.type).to.match(/ping/);
    expect(newName.count).to.match(/1/);
    expect(newName).not.to.equal(name);
  });

  describe('serializeMessage', () => {
    it('should work without payload', () => {
      const message = serializeMessage('msgtype', 'msgsentinel');
      expect(message.indexOf('amp-')).to.equal(0);
      expect(deserializeMessage(message)).to.deep.equal({
        type: 'msgtype',
        sentinel: 'msgsentinel',
      });
    });

    it('should work with payload', () => {
      const message = serializeMessage('msgtype', 'msgsentinel', {
        type: 'type_override', // override should be ignored
        sentinel: 'sentinel_override', // override should be ignored
        x: 1,
        y: 'abc',
      });
      expect(deserializeMessage(message)).to.deep.equal({
        type: 'msgtype',
        sentinel: 'msgsentinel',
        x: 1,
        y: 'abc',
      });
    });

    it('should work with rtvVersion', () => {
      const message = serializeMessage('msgtype', 'msgsentinel', {
        type: 'type_override', // override should be ignored
        sentinel: 'sentinel_override', // override should be ignored
        x: 1,
        y: 'abc',
      }, 'rtv123');
      expect(deserializeMessage(message)).to.deep.equal({
        type: 'msgtype',
        sentinel: 'msgsentinel',
        x: 1,
        y: 'abc',
      });
    });
  });

  describe('deserializeMessage', () => {
    it('should deserialize valid message', () => {
      const message = deserializeMessage(
          'amp-{"type":"msgtype","sentinel":"msgsentinel","x":1,"y":"abc"}');
      expect(message).to.deep.equal({
        type: 'msgtype',
        sentinel: 'msgsentinel',
        x: 1,
        y: 'abc',
      });
    });

    it('should deserialize valid message with rtv version', () => {
      const message = deserializeMessage(
          'amp-rtv123{"type":"msgtype","sentinel":"msgsentinel",' +
          '"x":1,"y":"abc"}');
      expect(message).to.deep.equal({
        type: 'msgtype',
        sentinel: 'msgsentinel',
        x: 1,
        y: 'abc',
      });
    });

    it('should return null if the input not a string', () => {
      expect(deserializeMessage({x: 1, y: 'abc'})).to.be.null;
    });

    it('should return null if the input does not start with amp-', () => {
      expect(deserializeMessage(
          'noamp-{"type":"msgtype","sentinel":"msgsentinel"}')).to.be.null;
    });

    it('should return null if failed to parse the input', () => {
      expect(deserializeMessage(
          'amp-"type":"msgtype","sentinel":"msgsentinel"}')).to.be.null;

      expect(deserializeMessage(
          'amp-{"type":"msgtype"|"sentinel":"msgsentinel"}')).to.be.null;
    });
  });
});
