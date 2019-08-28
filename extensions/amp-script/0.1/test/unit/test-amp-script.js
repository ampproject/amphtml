/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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

import * as WorkerDOM from '@ampproject/worker-dom/dist/amp/main.mjs';
import {
  AmpScript,
  AmpScriptService,
  SanitizerImpl,
  StorageLocation,
} from '../../amp-script';
import {FakeWindow} from '../../../../../testing/fake-dom';
import {Services} from '../../../../../src/services';

describes.fakeWin('AmpScript', {amp: {runtimeOn: false}}, env => {
  let sandbox;
  let element;
  let script;
  let service;
  let xhr;

  beforeEach(() => {
    sandbox = env.sandbox;

    element = document.createElement('amp-script');
    env.ampdoc.getBody().appendChild(element);

    script = new AmpScript(element);
    script.getAmpDoc = () => env.ampdoc;

    service = {
      checkSha384: sandbox.stub(),
      sizeLimitExceeded: () => false,
    };
    script.setService(service);

    xhr = {
      fetchText: sandbox.stub(),
    };
    xhr.fetchText
      .withArgs(sinon.match(/amp-script-worker-0.1.js/))
      .resolves({text: () => Promise.resolve('/* noop */')});
    sandbox.stub(Services, 'xhrFor').returns(xhr);

    // Make @ampproject/worker-dom dependency a no-op for these unit tests.
    sandbox.stub(WorkerDOM, 'upgrade').resolves();
  });

  function stubFetch(url, headers, text, responseUrl) {
    xhr.fetchText.withArgs(url).resolves({
      headers: {
        get: h => headers[h],
      },
      text: () => Promise.resolve(text),
      url: responseUrl || url,
    });
  }

  it('should require JS content-type for same-origin src', () => {
    sandbox.stub(env.ampdoc, 'getUrl').returns('https://foo.example/');
    element.setAttribute('src', 'https://foo.example/foo.txt');

    stubFetch(
      'https://foo.example/foo.txt',
      {'Content-Type': 'text/plain; charset=UTF-8'}, // Invalid content-type.
      'alert(1)'
    );

    return script.layoutCallback().should.be.rejected;
  });

  it('should check sha384(author_js) for cross-origin src', async () => {
    sandbox.stub(env.ampdoc, 'getUrl').returns('https://foo.example/');
    element.setAttribute('src', 'https://bar.example/bar.js');

    stubFetch(
      'https://bar.example/bar.js',
      {'Content-Type': 'application/javascript; charset=UTF-8'},
      'alert(1)'
    );

    service.checkSha384.withArgs('alert(1)').resolves();
    await script.layoutCallback();
    expect(service.checkSha384).to.be.called;
  });

  it('should fail on invalid sha384(author_js) for cross-origin src', () => {
    sandbox.stub(env.ampdoc, 'getUrl').returns('https://foo.example/');
    element.setAttribute('src', 'https://bar.example/bar.js');

    stubFetch(
      'https://bar.example/bar.js',
      {'Content-Type': 'application/javascript; charset=UTF-8'},
      'alert(1)'
    );

    service.checkSha384.withArgs('alert(1)').rejects(/Invalid sha384/);
    return script.layoutCallback().should.be.rejected;
  });

  it('should check response URL to handle redirects', () => {
    sandbox.stub(env.ampdoc, 'getUrl').returns('https://foo.example/');
    element.setAttribute('src', 'https://foo.example/foo.js');

    stubFetch(
      'https://foo.example/foo.js',
      {'Content-Type': 'application/javascript; charset=UTF-8'},
      'alert(1)',
      'https://bar.example/bar.js' // responseURL !== url
    );

    service.checkSha384.withArgs('alert(1)').rejects(/Invalid sha384/);
    return script.layoutCallback().should.be.rejected;
  });

  it('should check sha384(author_js) for local scripts', async () => {
    element.setAttribute('script', 'myLocalScript');

    const local = document.createElement('script');
    local.setAttribute('id', 'myLocalScript');
    local.setAttribute('type', 'text/plain');
    local.setAttribute('target', 'amp-script');
    local.textContent = 'alert(1)';
    env.ampdoc.getBody().appendChild(local);

    service.checkSha384.withArgs('alert(1)').resolves();
    await script.layoutCallback();
    expect(service.checkSha384).to.be.called;
  });

  it('should fail on invalid sha384(author_js) for local scripts', () => {
    element.setAttribute('script', 'myLocalScript');

    const local = document.createElement('script');
    local.setAttribute('id', 'myLocalScript');
    local.setAttribute('type', 'text/plain');
    local.setAttribute('target', 'amp-script');
    local.textContent = 'alert(1)';
    env.ampdoc.getBody().appendChild(local);

    service.checkSha384.withArgs('alert(1)').rejects(/Invalid sha384/);
    return script.layoutCallback().should.be.rejected;
  });
});

describes.fakeWin('AmpScriptService', {amp: {runtimeOn: false}}, env => {
  let crypto;
  let sandbox;
  let service;

  beforeEach(() => {
    sandbox = env.sandbox;

    crypto = {sha384Base64: sandbox.stub()};
    sandbox.stub(Services, 'cryptoFor').returns(crypto);
  });

  function createMetaTag(name, content) {
    const meta = document.createElement('meta');
    meta.setAttribute('name', name);
    meta.setAttribute('content', content);
    env.ampdoc.getHeadNode().appendChild(meta);
  }

  describe('checkSha384', () => {
    it('should resolve if hash exists in meta tag', async () => {
      createMetaTag('amp-script-src', 'sha384-my_fake_hash');

      service = new AmpScriptService(env.ampdoc);

      crypto.sha384Base64.resolves('my_fake_hash');

      const promise = service.checkSha384('alert(1)', 'foo');
      return promise.should.be.fulfilled;
    });

    it('should reject if hash does not exist in meta tag', () => {
      createMetaTag('amp-script-src', 'sha384-another_fake_hash');

      service = new AmpScriptService(env.ampdoc);

      crypto.sha384Base64.resolves('my_fake_hash');

      const promise = service.checkSha384('alert(1)', 'foo');
      return promise.should.be.rejected;
    });
  });
});

describe('SanitizerImpl', () => {
  let el;
  let s;
  let win;

  beforeEach(() => {
    win = new FakeWindow();
    s = new SanitizerImpl(win, []);
    el = win.document.createElement('div');
  });

  describe('changeAttribute', () => {
    it('should remove attributes when value is null', () => {
      el.setAttribute('class', 'foo');
      s.changeAttribute(el, 'class', null);
      expect(el.hasAttribute('class')).to.be.false;
    });

    it('should set attributes when value is non-null', () => {
      s.changeAttribute(el, 'class', 'foo');
      expect(el.getAttribute('class')).to.equal('foo');
    });

    it('should be case-insensitive to attribute name', () => {
      s.changeAttribute(el, 'CLASS', 'foo');
      expect(el.getAttribute('class')).to.equal('foo');
    });

    it('should set a[target] if [href] exists', () => {
      const a = win.document.createElement('a');
      s.changeAttribute(a, 'href', '/foo.html');
      expect(a.getAttribute('target')).to.equal('_top');
    });

    it('should not allow changes to invalid tags', () => {
      const base = win.document.createElement('base');
      // 'href' attribute is allowed but 'base' tag isn't.
      s.changeAttribute(base, 'href', '/foo.html');
      expect(base.getAttribute('href')).to.be.null;
    });

    it('should allow changes to built-in AMP tags except amp-pixel', () => {
      const img = win.document.createElement('amp-img');
      s.changeAttribute(img, 'src', 'foo.jpg');
      expect(img.getAttribute('src')).to.include('foo.jpg');

      const layout = win.document.createElement('amp-layout');
      s.changeAttribute(layout, 'width', '10');
      expect(layout.getAttribute('width')).to.equal('10');

      const pixel = win.document.createElement('amp-pixel');
      s.changeAttribute(pixel, 'src', '/foo/track');
      expect(pixel.getAttribute('src')).to.be.null;
    });

    it('should not allow changes to other AMP tags', () => {
      const analytics = win.document.createElement('amp-analytics');
      s.changeAttribute(analytics, 'data-credentials', 'include');
      expect(analytics.getAttribute('data-credentials')).to.be.null;
    });

    it('should not allow changes to form elements', () => {
      const form = win.document.createElement('form');
      s.changeAttribute(form, 'action-xhr', 'https://example.com/post');
      expect(form.getAttribute('action-xhr')).to.be.null;

      const input = win.document.createElement('input');
      s.changeAttribute(input, 'value', 'foo');
      expect(input.getAttribute('value')).to.be.null;
    });

    it('should allow changes to form elements if sandbox=allow-forms', () => {
      s = new SanitizerImpl(win, ['allow-forms']);

      const form = win.document.createElement('form');
      s.changeAttribute(form, 'action-xhr', 'https://example.com/post');
      expect(form.getAttribute('action-xhr')).to.equal(
        'https://example.com/post'
      );

      const input = win.document.createElement('input');
      s.changeAttribute(input, 'value', 'foo');
      expect(input.getAttribute('value')).to.equal('foo');
    });
  });

  describe('storage', () => {
    it('getStorage()', () => {
      it('should be initially empty', () => {
        expect(s.getStorage(StorageLocation.LOCAL)).to.deep.equal({});
        expect(s.getStorage(StorageLocation.SESSION)).to.deep.equal({});
      });

      it('should return localStorage data', () => {
        win.localStorage.setItem('foo', 'bar');
        expect(s.getStorage(StorageLocation.LOCAL)).to.deep.equal({foo: 'bar'});
        expect(s.getStorage(StorageLocation.SESSION)).to.deep.equal({});
      });

      it('should return sessionStorage data', () => {
        win.sessionStorage.setItem('abc', '123');
        expect(s.getStorage(StorageLocation.LOCAL)).to.deep.equal({});
        expect(s.getStorage(StorageLocation.SESSION)).to.deep.equal({
          abc: '123',
        });
      });

      it('should filter amp-* keys', () => {
        win.localStorage.setItem('amp-foo', 'bar');
        win.sessionStorage.setItem('amp-baz', 'qux');
        expect(s.getStorage(StorageLocation.LOCAL)).to.deep.equal({foo: 'bar'});
        expect(s.getStorage(StorageLocation.SESSION)).to.deep.equal({});
      });
    });

    describe('changeStorage()', () => {
      it('should set items', () => {
        s.changeStorage(StorageLocation.LOCAL, 'x', '1');
        expect(win.localStorage.length).to.equal(1);
        expect(win.localStorage.getItem('x')).to.equal('1');

        s.changeStorage(StorageLocation.SESSION, 'y', '2');
        expect(win.sessionStorage.length).to.equal(1);
        expect(win.sessionStorage.getItem('y')).to.equal('2');
      });

      it('should not set items with amp-* keys', () => {
        allowConsoleError(() => {
          s.changeStorage(StorageLocation.LOCAL, 'amp-x', '1');
        });
        expect(win.localStorage.length).to.equal(0);
        expect(win.localStorage.getItem('amp-x')).to.be.null;

        allowConsoleError(() => {
          s.changeStorage(StorageLocation.SESSION, 'amp-y', '2');
        });
        expect(win.sessionStorage.length).to.equal(0);
        expect(win.sessionStorage.getItem('amp-y')).to.be.null;
      });

      it('should remove items', () => {
        win.localStorage.setItem('x', '1');
        s.changeStorage(StorageLocation.LOCAL, 'x', null);
        expect(win.localStorage.length).to.equal(0);
        expect(win.localStorage.getItem('x')).to.be.null;

        win.sessionStorage.setItem('y', '2');
        s.changeStorage(StorageLocation.SESSION, 'y', null);
        expect(win.sessionStorage.length).to.equal(0);
        expect(win.sessionStorage.getItem('y')).to.be.null;
      });

      it('should not remove items with amp-* keys', () => {
        win.localStorage.setItem('amp-x', '1');
        allowConsoleError(() => {
          s.changeStorage(StorageLocation.LOCAL, 'amp-x', null);
        });
        expect(win.localStorage.length).to.equal(1);
        expect(win.localStorage.getItem('amp-x')).to.equal('1');

        win.sessionStorage.setItem('amp-y', '2');
        allowConsoleError(() => {
          s.changeStorage(StorageLocation.SESSION, 'amp-y', null);
        });
        expect(win.sessionStorage.length).to.equal(1);
        expect(win.sessionStorage.getItem('amp-y')).to.equal('2');
      });

      it('should not support Storage.clear()', () => {
        win.localStorage.setItem('x', '1');
        allowConsoleError(() => {
          s.changeStorage(StorageLocation.LOCAL, null, null);
        });
        expect(win.localStorage.length).to.equal(1);
        expect(win.localStorage.getItem('x')).to.equal('1');
      });
    });
  });
});
