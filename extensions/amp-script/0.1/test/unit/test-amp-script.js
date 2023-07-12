import {Services} from '#service';

import {user} from '#utils/log';

import {FakeWindow} from '#testing/fake-dom';

import {
  registerServiceBuilderForDoc,
  resetServiceForTesting,
} from '../../../../../src/service-helpers';
import {
  AmpScript,
  AmpScriptService,
  SanitizerImpl,
  StorageLocation,
  setUpgradeForTest,
} from '../../amp-script';

describes.fakeWin('AmpScript', {amp: {runtimeOn: false}}, (env) => {
  let element;
  let script;
  let service;
  let xhr;

  beforeEach(() => {
    registerServiceBuilderForDoc(
      env.win.document,
      'amp-script',
      AmpScriptService
    );
    element = document.createElement('amp-script');
    env.ampdoc.getBody().appendChild(element);

    script = new AmpScript(element);
    script.getAmpDoc = () => env.ampdoc;

    service = {
      checkSha384: env.sandbox.stub(),
      sizeLimitExceeded: () => false,
    };
    script.setService(service);

    xhr = {
      fetchText: env.sandbox.stub(),
    };
    xhr.fetchText
      .withArgs(env.sandbox.match(/amp-script-worker/))
      .resolves({text: () => Promise.resolve('/* noop */')});
    env.sandbox.stub(Services, 'xhrFor').returns(xhr);

    // Make @ampproject/worker-dom dependency essentially a noop for these tests.
    setUpgradeForTest((unused, scriptsPromise) => scriptsPromise);
  });

  afterEach(() => {
    resetServiceForTesting(env.win, 'amp-script');
  });

  function stubFetch(url, headers, text, responseUrl) {
    xhr.fetchText.withArgs(url).resolves({
      headers: {
        get: (h) => headers[h],
      },
      text: () => Promise.resolve(text),
      url: responseUrl || url,
    });
  }

  it('should require JS content-type for same-origin src', () => {
    env.sandbox.stub(env.ampdoc, 'getUrl').returns('https://foo.example/');
    element.setAttribute('src', 'https://foo.example/foo.txt');

    stubFetch(
      'https://foo.example/foo.txt',
      {'Content-Type': 'text/plain; charset=UTF-8'}, // Invalid content-type.
      'alert(1)'
    );

    expectAsyncConsoleError(/Same-origin "src" requires/);
    return script.layoutCallback().should.be.rejected;
  });

  it('should support nodom variant', async () => {
    element.setAttribute('nodom', '');
    element.setAttribute('src', 'https://foo.example/foo.txt');
    env.sandbox.stub(env.ampdoc, 'getUrl').returns('https://foo.example/');
    stubFetch(
      'https://foo.example/foo.txt',
      {'Content-Type': 'text/javascript; charset=UTF-8'}, // Valid content-type.
      'alert(1)'
    );

    xhr.fetchText
      .withArgs(env.sandbox.match(/amp-script-worker-0.1.js/))
      .rejects();
    xhr.fetchText
      .withArgs(env.sandbox.match(/amp-script-worker-nodom-0.1.js/))
      .resolves({text: () => Promise.resolve('/* noop */')});

    await script.buildCallback();
    await script.layoutCallback();
  });

  it('should work with "text/javascript" content-type for same-origin src', () => {
    env.sandbox.stub(env.ampdoc, 'getUrl').returns('https://foo.example/');
    element.setAttribute('src', 'https://foo.example/foo.txt');

    stubFetch(
      'https://foo.example/foo.txt',
      {'Content-Type': 'text/javascript; charset=UTF-8'}, // Valid content-type.
      'alert(1)'
    );

    expectAsyncConsoleError(/should require JS content-type/);
    return script.layoutCallback().should.be.fulfilled;
  });

  it('should check sha384(author_js) for cross-origin src', async () => {
    env.sandbox.stub(env.ampdoc, 'getUrl').returns('https://foo.example/');
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

  it('should skip the check for sha384(author_js) for cross-origin src in sandboxed mode', async () => {
    env.sandbox.stub(env.ampdoc, 'getUrl').returns('https://foo.example/');
    element.setAttribute('src', 'https://bar.example/bar.js');
    element.setAttribute('sandboxed', '');

    stubFetch(
      'https://bar.example/bar.js',
      {'Content-Type': 'application/javascript; charset=UTF-8'},
      'alert(1)'
    );

    await script.buildCallback();
    await script.layoutCallback();
    expect(service.checkSha384).not.to.be.called;
  });

  it('should wait for initialization to complete before proxying callFunction', async () => {
    element.setAttribute('script', 'local-script');
    script.workerDom_ = {callFunction: env.sandbox.spy()};

    script.callFunction('fetchData', true);
    expect(script.workerDom_.callFunction).not.called;

    await script.initialize_.resolve();
    expect(script.workerDom_.callFunction).calledWithExactly('fetchData', true);
  });

  it('should reject when callFunction on amp-script which failed to initialize', async () => {
    element.setAttribute('script', 'local-script');
    script.workerDom_ = null;
    script.initialize_.resolve();

    const result = script.callFunction('fetchData', true);
    await expect(result).eventually.rejectedWith('failed initialization.');
  });

  describe('Initialization skipped warning due to zero size', () => {
    it('should not warn when there is positive width/height', () => {
      const warnStub = env.sandbox.stub(user(), 'warn');
      env.sandbox.stub(script, 'getLayoutSize').returns({height: 1, width: 1});
      script.onLayoutMeasure();
      expect(warnStub).to.have.callCount(0);
    });

    it('should warn if there is zero size', () => {
      const warnStub = env.sandbox.stub(user(), 'warn');
      env.sandbox
        .stub(script, 'getLayoutSize')
        .returns({height: 100, width: 0});
      script.onLayoutMeasure();

      expect(warnStub).calledWith(
        'amp-script',
        'Skipped initializing amp-script due to zero width or height.',
        script.element
      );
      expect(warnStub).to.have.callCount(1);
    });

    it('should only warn if layoutCallback hasnt happened', () => {
      const warnStub = env.sandbox.stub(user(), 'warn');
      allowConsoleError(() => {
        script.layoutCallback();
      });
      script.onLayoutMeasure();
      expect(warnStub).to.have.callCount(0);
    });
  });

  it('should fail on invalid sha384(author_js) for cross-origin src', () => {
    env.sandbox.stub(env.ampdoc, 'getUrl').returns('https://foo.example/');
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
    env.sandbox.stub(env.ampdoc, 'getUrl').returns('https://foo.example/');
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

  describe('development mode', () => {
    it('should not be in dev mode by default', () => {
      script.buildCallback();
      expect(script.development_).false;
    });

    it('data-ampdevmode on just the element should enable dev mode', () => {
      element.setAttribute('data-ampdevmode', '');
      script = new AmpScript(element);
      script.buildCallback();
      expect(script.development_).true;
    });

    it('data-ampdevmode on just the root html element should enable dev mode', () => {
      element.ownerDocument.documentElement.setAttribute('data-ampdevmode', '');
      script = new AmpScript(element);
      script.buildCallback();
      expect(script.development_).true;
    });
  });
});

describes.repeated(
  '',
  {
    'single ampdoc': {ampdoc: 'single'},
    'shadow ampdoc': {ampdoc: 'shadow'},
  },
  (name, variant) => {
    describes.fakeWin(
      'AmpScriptService',
      {
        amp: {
          runtimeOn: false,
          ampdoc: variant.ampdoc,
        },
      },
      (env) => {
        let crypto;
        let service;

        beforeEach(() => {
          crypto = {sha384Base64: env.sandbox.stub()};
          env.sandbox.stub(Services, 'cryptoFor').returns(crypto);
        });

        function createMetaHash(name, content) {
          if (variant.ampdoc === 'shadow') {
            env.ampdoc.setMetaByName(name, content);
          } else {
            const meta = document.createElement('meta');
            meta.setAttribute('name', name);
            meta.setAttribute('content', content);
            env.ampdoc.getHeadNode().appendChild(meta);
          }
        }

        describe('checkSha384', () => {
          it('should resolve if hash exists in meta tag', async () => {
            createMetaHash('amp-script-src', 'sha384-my_fake_hash');

            service = new AmpScriptService(env.ampdoc);

            crypto.sha384Base64.resolves('my_fake_hash');

            const promise = service.checkSha384('alert(1)', 'foo');
            return promise.should.be.fulfilled;
          });

          it('should reject if hash does not exist in meta tag', () => {
            expectAsyncConsoleError(/Script hash not found/);
            createMetaHash('amp-script-src', 'sha384-another_fake_hash');

            service = new AmpScriptService(env.ampdoc);

            crypto.sha384Base64.resolves('my_fake_hash');

            const promise = service.checkSha384('alert(1)', 'foo');
            return promise.should.be.rejected;
          });
        });
      }
    );
  }
);

describes.sandboxed('SanitizerImpl', {}, (env) => {
  let el;
  let win;
  let s;
  let getSanitizer;

  beforeEach(() => {
    win = new FakeWindow();
    el = win.document.createElement('div');

    getSanitizer = ({byFixedSize, byUserGesture}) =>
      new SanitizerImpl(
        {
          win,
          element: el,
          isMutationAllowedByFixedSize: () => byFixedSize,
          isMutationAllowedByUserGesture: () => byUserGesture,
        },
        []
      );
    s = getSanitizer({byUserGesture: false, byFixedSize: false});
  });

  describe('setAttribute', () => {
    it('should remove attributes when value is null', () => {
      el.setAttribute('class', 'foo');
      s.setAttribute(el, 'class', null);
      expect(el.hasAttribute('class')).to.be.false;
    });

    it('should set attributes when value is non-null', () => {
      s.setAttribute(el, 'class', 'foo');
      expect(el.getAttribute('class')).to.equal('foo');
    });

    it('should be case-insensitive to attribute name', () => {
      s.setAttribute(el, 'CLASS', 'foo');
      expect(el.getAttribute('class')).to.equal('foo');
    });

    it('should set a[target] if [href] exists', () => {
      const a = win.document.createElement('a');
      s.setAttribute(a, 'href', '/foo.html');
      expect(a.getAttribute('target')).to.equal('_top');
    });

    it('should not allow changes to invalid tags', () => {
      const base = win.document.createElement('base');
      // 'href' attribute is allowed but 'base' tag isn't.
      s.setAttribute(base, 'href', '/foo.html');
      expect(base.getAttribute('href')).to.be.null;
    });

    it('should allow changes to built-in AMP tags except amp-pixel', () => {
      const img = win.document.createElement('amp-img');
      s.setAttribute(img, 'src', 'foo.jpg');
      expect(img.getAttribute('src')).to.include('foo.jpg');

      const layout = win.document.createElement('amp-layout');
      s.setAttribute(layout, 'width', '10');
      expect(layout.getAttribute('width')).to.equal('10');

      const pixel = win.document.createElement('amp-pixel');
      s.setAttribute(pixel, 'src', '/foo/track');
      expect(pixel.getAttribute('src')).to.be.null;
    });

    it('should not allow changes to other AMP tags', () => {
      const analytics = win.document.createElement('amp-analytics');
      s.setAttribute(analytics, 'data-credentials', 'include');
      expect(analytics.getAttribute('data-credentials')).to.be.null;
    });

    it('should not allow changes to form elements', () => {
      const form = win.document.createElement('form');
      s.setAttribute(form, 'action-xhr', 'https://example.com/post');
      expect(form.getAttribute('action-xhr')).to.be.null;

      const input = win.document.createElement('input');
      s.setAttribute(input, 'value', 'foo');
      expect(input.getAttribute('value')).to.be.null;
    });

    it('should allow changes to form elements if sandbox=allow-forms', () => {
      s = new SanitizerImpl(
        {
          win,
          element: null,
          isMutationAllowedByUserGesture: () => {},
          isMutationAllowedbyFixedSize: () => {},
        },
        ['allow-forms']
      );

      const form = win.document.createElement('form');
      s.setAttribute(form, 'action-xhr', 'https://example.com/post');
      expect(form.getAttribute('action-xhr')).to.equal(
        'https://example.com/post'
      );

      const input = win.document.createElement('input');
      s.setAttribute(input, 'value', 'foo');
      expect(input.getAttribute('value')).to.equal('foo');
    });
  });

  describe('localStorage & sessionStorage', () => {
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

    describe('setStorage()', () => {
      it('should set items', () => {
        s.setStorage(StorageLocation.LOCAL, 'x', '1');
        expect(win.localStorage.length).to.equal(1);
        expect(win.localStorage.getItem('x')).to.equal('1');

        s.setStorage(StorageLocation.SESSION, 'y', '2');
        expect(win.sessionStorage.length).to.equal(1);
        expect(win.sessionStorage.getItem('y')).to.equal('2');
      });

      it('should not set items with amp-* keys', () => {
        allowConsoleError(() => {
          s.setStorage(StorageLocation.LOCAL, 'amp-x', '1');
        });
        expect(win.localStorage.length).to.equal(0);
        expect(win.localStorage.getItem('amp-x')).to.be.null;

        allowConsoleError(() => {
          s.setStorage(StorageLocation.SESSION, 'amp-y', '2');
        });
        expect(win.sessionStorage.length).to.equal(0);
        expect(win.sessionStorage.getItem('amp-y')).to.be.null;
      });

      it('should remove items', () => {
        win.localStorage.setItem('x', '1');
        s.setStorage(StorageLocation.LOCAL, 'x', null);
        expect(win.localStorage.length).to.equal(0);
        expect(win.localStorage.getItem('x')).to.be.null;

        win.sessionStorage.setItem('y', '2');
        s.setStorage(StorageLocation.SESSION, 'y', null);
        expect(win.sessionStorage.length).to.equal(0);
        expect(win.sessionStorage.getItem('y')).to.be.null;
      });

      it('should not remove items with amp-* keys', () => {
        win.localStorage.setItem('amp-x', '1');
        allowConsoleError(() => {
          s.setStorage(StorageLocation.LOCAL, 'amp-x', null);
        });
        expect(win.localStorage.length).to.equal(1);
        expect(win.localStorage.getItem('amp-x')).to.equal('1');

        win.sessionStorage.setItem('amp-y', '2');
        allowConsoleError(() => {
          s.setStorage(StorageLocation.SESSION, 'amp-y', null);
        });
        expect(win.sessionStorage.length).to.equal(1);
        expect(win.sessionStorage.getItem('amp-y')).to.equal('2');
      });

      it('should not support Storage.clear()', () => {
        win.localStorage.setItem('x', '1');
        allowConsoleError(() => {
          s.setStorage(StorageLocation.LOCAL, null, null);
        });
        expect(win.localStorage.length).to.equal(1);
        expect(win.localStorage.getItem('x')).to.equal('1');
      });
    });
  });

  describe('amp-state', () => {
    let bind;

    beforeEach(() => {
      bind = {
        getStateValue: env.sandbox.stub(),
        setState: env.sandbox.stub(),
        constrain: env.sandbox.stub(),
      };
      env.sandbox.stub(Services, 'bindForDocOrNull').resolves(bind);
    });

    it('AMP.setState(json), without user interaction', async () => {
      s = getSanitizer({byUserGesture: false, byFixedSize: false});

      await s.setStorage(
        StorageLocation.AMP_STATE,
        /* key */ null,
        '{"foo":"bar"}'
      );

      expect(bind.setState).to.be.calledOnce;
      expect(bind.setState).to.be.calledWithExactly(
        {foo: 'bar'},
        {skipEval: true, constrain: undefined, skipAmpState: false}
      );
    });

    it('AMP.setState(json), with user interaction', async () => {
      s = getSanitizer({byUserGesture: true, byFixedSize: false});

      await s.setStorage(
        StorageLocation.AMP_STATE,
        /* key */ null,
        '{"foo":"bar"}'
      );

      expect(bind.setState).to.be.calledOnce;
      expect(bind.setState).to.be.calledWithExactly(
        {foo: 'bar'},
        {skipEval: false, constrain: undefined, skipAmpState: false}
      );
    });

    it('AMP.setState(json), fixed size and no user interaction', async () => {
      s = getSanitizer({byGesture: false, byFixedSize: true});

      await s.setStorage(
        StorageLocation.AMP_STATE,
        /* key */ null,
        '{"foo":"bar"}'
      );

      expect(bind.setState).to.be.calledOnce;
      expect(bind.setState).to.be.calledWithExactly(
        {foo: 'bar'},
        {skipEval: false, constrain: [s.element_], skipAmpState: false}
      );
    });

    it('AMP.setState(not_json)', async () => {
      expectAsyncConsoleError(/Invalid AMP.setState/);
      await s.setStorage(
        StorageLocation.AMP_STATE,
        /* key */ null,
        '"foo":"bar'
      );

      expect(bind.setState).to.not.be.called;
    });

    it('AMP.getState(string)', async () => {
      bind.getStateValue.returns('bar');

      const state = await s.getStorage(StorageLocation.AMP_STATE, 'foo');
      expect(state).to.equal('bar');

      expect(bind.getStateValue).to.be.calledOnce;
      expect(bind.getStateValue).to.be.calledWithExactly('foo');
    });

    it('AMP.getState()', async () => {
      bind.getStateValue.returns({foo: 'bar'});

      const state = await s.getStorage(StorageLocation.AMP_STATE, '');
      expect(state).to.deep.equal({foo: 'bar'});

      expect(bind.getStateValue).to.be.calledOnce;
      expect(bind.getStateValue).to.be.calledWithExactly('.');
    });
  });
});
