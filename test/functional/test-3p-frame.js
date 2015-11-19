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

import {addDataAndJsonAttributes_, getIframe, getBootstrapBaseUrl,
    prefetchBootstrap} from '../../src/3p-frame';
import {loadPromise} from '../../src/event-helper';
import {setModeForTesting, getMode} from '../../src/mode';
import {resetServiceForTesting} from '../../src/service';

describe('3p-frame', () => {

  afterEach(() => {
    resetServiceForTesting(window, 'bootstrapBaseUrl');
    setModeForTesting(null);
    const m = document.querySelector(
        '[name="amp-3p-iframe-src"]');
    if (m) {
      m.parentElement.removeChild(m);
    }
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
      'bar': 'bar'
    });

    div.setAttribute('json', '{"abc": [1,2,3]}');

    obj = {};
    addDataAndJsonAttributes_(div, obj);
    expect(obj).to.deep.equal({
      'foo': 'foo',
      'bar': 'bar',
      'abc': [1, 2, 3]
    });
  });

  it('should create an iframe', () => {

    const link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    link.setAttribute('href', 'https://foo.bar/baz');
    document.head.appendChild(link);

    const div = document.createElement('div');
    div.setAttribute('data-test-attr', 'value');
    div.setAttribute('data-ping', 'pong');
    div.setAttribute('width', '50');
    div.setAttribute('height', '100');

    div.getLayoutBox = function() {
      return {
        width: 100,
        height: 200
      };
    };

    const iframe = getIframe(window, div, '_ping_');
    const src = iframe.src;
    const referrer = document.referrer;
    expect(referrer).to.not.be.a.string;
    const locationHref = location.href;
    expect(locationHref).to.not.be.a.string;
    const fragment =
        '#{"testAttr":"value","ping":"pong","width":50,"height":100,' +
        '"initialWindowWidth":100,"initialWindowHeight":200,"type":"_ping_"' +
        ',"_context":{"referrer":"' + referrer + '",' +
        '"canonicalUrl":"https://foo.bar/baz","location":{"href":' +
        '"' + locationHref + '"},"mode":{"localDev":true,' +
        '"development":false,"minified":false}}}';
    expect(src).to.equal(
        'http://ads.localhost:9876/dist.3p/current/frame.max.html' +
        fragment);

    // Switch to same origin for inner tests.
    iframe.src = '/base/dist.3p/current/frame.max.html' + fragment;

    document.body.appendChild(iframe);
    return loadPromise(iframe).then(() => {
      const win = iframe.contentWindow;
      expect(win.context.canonicalUrl).to.equal('https://foo.bar/baz');
      expect(win.context.location.href).to.equal(locationHref);
      expect(win.context.location.origin).to.equal('http://localhost:9876');
      if (location.ancestorOrigins) {
        expect(win.context.location.originValidated).to.be.true;
      } else {
        expect(win.context.location.originValidated).to.be.false;
      }
      expect(win.context.referrer).to.equal(referrer);
      expect(win.context.data.testAttr).to.equal('value');
      expect(win.context.noContentAvailable).to.be.function;
      expect(win.context.observeIntersection).to.be.function;
      const c = win.document.getElementById('c');
      expect(c).to.not.be.null;
      expect(c.textContent).to.contain('pong');
    });
  });

  it('should pick the right bootstrap url (test default)', () => {
    expect(getBootstrapBaseUrl(window)).to.equal(
        'http://ads.localhost:9876/dist.3p/current/frame.max.html');
  });

  it('should pick the right bootstrap url (prod)', () => {
    setModeForTesting({});
    expect(getBootstrapBaseUrl(window)).to.equal(
        'https://3p.ampproject.net/$internalRuntimeVersion$/frame.html');
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
      getBootstrapBaseUrl(window);
    }).to.throw(/must not be on the same origin as the/);
  });

  it('should prefetch bootstrap frame and JS', () => {
    prefetchBootstrap(window);
    const fetches = document.querySelectorAll(
        'link[rel=prefetch]');
    expect(fetches).to.have.length(2);
    expect(fetches[0].href).to.equal(
        'http://ads.localhost:9876/dist.3p/current/frame.max.html');
    expect(fetches[1].href).to.equal(
        'https://3p.ampproject.net/$internalRuntimeVersion$/f.js');
  });
});
