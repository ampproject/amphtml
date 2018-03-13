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

import * as sinon from 'sinon';
import {
  FriendlyIframeEmbed,
  getFriendlyIframeEmbedOptional,
  installFriendlyIframeEmbed,
  mergeHtmlForTesting,
  setFriendlyIframeEmbedVisible,
  setSrcdocSupportedForTesting,
  whenContentIniLoad,
} from '../../src/friendly-iframe-embed';
import {Services} from '../../src/services';
import {Signals} from '../../src/utils/signals';
import {getStyle} from '../../src/style';
import {installServiceInEmbedScope} from '../../src/service';
import {layoutRectLtwh} from '../../src/layout-rect';
import {loadPromise} from '../../src/event-helper';


describe('friendly-iframe-embed', () => {

  let sandbox;
  let iframe;
  let extensionsMock;
  let resourcesMock;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();

    const extensions = Services.extensionsFor(window);
    const resources = Services.resourcesForDoc(window.document);
    extensionsMock = sandbox.mock(extensions);
    resourcesMock = sandbox.mock(resources);

    iframe = document.createElement('iframe');
  });

  afterEach(() => {
    if (iframe.parentElement) {
      iframe.parentElement.removeChild(iframe);
    }
    extensionsMock.verify();
    resourcesMock.verify();
    setSrcdocSupportedForTesting(undefined);
    sandbox.restore();
  });

  it('should follow main install steps', () => {

    // Resources are not involved.
    extensionsMock.expects('preloadExtension').never();
    resourcesMock.expects('add').never();

    const embedPromise = installFriendlyIframeEmbed(iframe, document.body, {
      url: 'https://acme.org/url1',
      html: '<a href="/url2"></a>',
    });

    // Attributes set.
    expect(iframe.style.visibility).to.equal('hidden');
    expect(iframe.getAttribute('referrerpolicy')).to.equal('unsafe-url');

    // Iframe has been appended to DOM.
    expect(iframe.parentElement).to.equal(document.body);

    return embedPromise.then(embed => {
      expect(embed.win).to.be.ok;
      expect(embed.win).to.equal(iframe.contentWindow);
      expect(embed.iframe).to.equal(iframe);
      expect(embed.spec.url).to.equal('https://acme.org/url1');
      expect(embed.host).to.be.null;
      expect(embed.signals()).to.be.ok;
      expect(getFriendlyIframeEmbedOptional(embed.iframe)).to.equal(embed);

      // Iframe is rendered.
      expect(embed.signals().get('render-start')).to.be.ok;
      expect(iframe.style.visibility).to.equal('');
      expect(embed.win.document.body.style.visibility).to.equal('visible');
      expect(String(embed.win.document.body.style.opacity)).to.equal('1');
      expect(getStyle(embed.win.document.body, 'animation')).to.equal('none');
      expect(embed.win.document.documentElement.classList.contains(
          'i-amphtml-fie')).to.be.true;

      // BASE element has been inserted.
      expect(embed.win.document.querySelector('base').href)
          .to.equal('https://acme.org/url1');
      expect(embed.win.document.querySelector('a').href)
          .to.equal('https://acme.org/url2');

      return loadPromise(iframe);
    }).then(() => {
      // Iframe is marked as complete.
      expect(iframe.readyState).to.equal('complete');
    });
  });

  it('should write doc if srcdoc is not available', () => {
    setSrcdocSupportedForTesting(false);

    const embedPromise = installFriendlyIframeEmbed(iframe, document.body, {
      url: 'https://acme.org/url1',
      html: '<a href="/url2"></a>',
    });

    return embedPromise.then(embed => {
      expect(embed.iframe.src).to.equal('about:blank');
      expect(!!embed.iframe.srcdoc).to.be.false;

      expect(embed.win).to.be.ok;
      expect(embed.win).to.equal(iframe.contentWindow);
      expect(embed.iframe).to.equal(iframe);

      expect(embed.win.document.querySelector('base')).to.exist;
      expect(embed.win.document.querySelector('a')).to.exist;
    });
  });

  it('should install extensions', () => {

    // Extensions preloading have been requested.
    extensionsMock.expects('preloadExtension')
        .withExactArgs('amp-test')
        .returns(Promise.resolve())
        .once();

    // Extensions are installed.
    let installExtWin;
    extensionsMock.expects('installExtensionsInChildWindow')
        .withExactArgs(sinon.match(arg => {
          installExtWin = arg;
          return true;
        }), ['amp-test'], /* preinstallCallback */ undefined)
        .once();

    const embedPromise = installFriendlyIframeEmbed(iframe, document.body, {
      url: 'https://acme.org/url1',
      html: '<amp-test></amp-test>',
      extensionIds: ['amp-test'],
    });
    return embedPromise.then(embed => {
      expect(installExtWin).to.equal(embed.win);
    });
  });

  it('should pass pre-install callback', () => {

    const preinstallCallback = function() {};

    // Extensions are installed.
    extensionsMock.expects('installExtensionsInChildWindow')
        .withExactArgs(sinon.match(() => true), [], preinstallCallback)
        .once();

    const embedPromise = installFriendlyIframeEmbed(iframe, document.body, {
      url: 'https://acme.org/url1',
      html: '<amp-test></amp-test>',
    }, preinstallCallback);
    return embedPromise;
  });

  it('should uninstall all resources', () => {
    extensionsMock.expects('preloadExtension').atLeast(1);
    extensionsMock.expects('installExtensionsInChildWindow').atLeast(1);
    const embedPromise = installFriendlyIframeEmbed(iframe, document.body, {
      url: 'https://acme.org/url1',
      html: '<amp-test></amp-test>',
      extensionIds: ['amp-test'],
    });
    return embedPromise.then(embed => {
      resourcesMock.expects('removeForChildWindow')
          .withExactArgs(embed.win)
          .once();
      embed.destroy();
    });
  });

  it('should install and dispose services', () => {
    const disposeSpy = sandbox.spy();
    const embedService = {
      dispose: disposeSpy,
    };
    const embedPromise = installFriendlyIframeEmbed(iframe, document.body, {
      url: 'https://acme.org/url1',
      html: '<amp-test></amp-test>',
    }, embedWin => {
      installServiceInEmbedScope(embedWin, 'c', embedService);
    });
    return embedPromise.then(embed => {
      expect(embed.win.services['c'].obj).to.equal(embedService);
      expect(disposeSpy).to.not.be.called;
      embed.destroy();
      expect(disposeSpy).to.be.calledOnce;
    });
  });

  it('should start invisible by default and update on request', () => {
    extensionsMock.expects('installExtensionsInChildWindow').once();
    const embedPromise = installFriendlyIframeEmbed(iframe, document.body, {
      url: 'https://acme.org/url1',
      html: '',
      extensionIds: [],
    });
    return embedPromise.then(embed => {
      expect(embed.isVisible()).to.be.false;
      const spy = sandbox.spy();
      embed.onVisibilityChanged(spy);

      setFriendlyIframeEmbedVisible(embed, false);
      expect(embed.isVisible()).to.be.false;
      expect(spy).to.not.be.called;

      setFriendlyIframeEmbedVisible(embed, true);
      expect(embed.isVisible()).to.be.true;
      expect(spy).to.be.calledOnce;
      expect(spy.args[0][0]).to.equal(true);
    });
  });

  it('should support host', () => {
    const host = document.createElement('amp-host');
    const hostSignals = new Signals();
    host.signals = () => hostSignals;
    host.renderStarted = sandbox.spy();
    host.getLayoutBox = () => layoutRectLtwh(10, 10, 100, 200);
    const embedPromise = installFriendlyIframeEmbed(iframe, document.body, {
      url: 'https://acme.org/url1',
      html: '<amp-test></amp-test>',
      host,
    });
    return embedPromise.then(embed => {
      expect(embed.host).to.equal(host);
      expect(embed.signals()).to.equal(hostSignals);
      expect(host.renderStarted).to.be.calledOnce;
    });
  });

  it('should await initial load', () => {
    resourcesMock
        .expects('getResourcesInRect')
        .withExactArgs(
            sinon.match(arg => arg == iframe.contentWindow),
            sinon.match(arg =>
              arg.left == 0 &&
                arg.top == 0 &&
                arg.width == iframe.contentWindow.innerWidth &&
                arg.height == iframe.contentWindow.innerHeight))
        .returns(Promise.resolve([]))
        .once();
    const embedPromise = installFriendlyIframeEmbed(iframe, document.body, {
      url: 'https://acme.org/url1',
      html: '<amp-test></amp-test>',
    });
    let embed;
    return embedPromise.then(em => {
      embed = em;
      return embed.whenIniLoaded();
    }).then(() => {
      expect(embed.signals().get('ini-load')).to.be.ok;
      return embed.whenReady(); // `whenReady` should also be complete.
    });
  });

  it('should await initial with host', () => {
    const rect = layoutRectLtwh(10, 10, 100, 200);
    const host = document.createElement('amp-host');
    const hostSignals = new Signals();
    host.signals = () => hostSignals;
    host.renderStarted = function() {
      hostSignals.signal('render-start');
    };
    host.getLayoutBox = () => rect;
    resourcesMock
        .expects('getResourcesInRect')
        .withExactArgs(
            sinon.match(arg => arg == iframe.contentWindow),
            sinon.match(arg =>
              arg.left == 10 &&
                arg.top == 10 &&
                arg.width == 100 &&
                arg.height == 200))
        .returns(Promise.resolve([]))
        .once();
    const embedPromise = installFriendlyIframeEmbed(iframe, document.body, {
      url: 'https://acme.org/url1',
      html: '<amp-test></amp-test>',
      host,
    });
    let embed;
    return embedPromise.then(em => {
      embed = em;
      return embed.whenIniLoaded();
    }).then(() => {
      expect(embed.signals().get('ini-load')).to.be.ok;
      return embed.whenReady(); // `whenReady` should also be complete.
    });
  });

  it('should find and await all content elements', () => {
    function resource(tagName) {
      const res = {
        element: {
          tagName: tagName.toUpperCase(),
        },
        loadedComplete: false,
      };
      res.loadedOnce = () => Promise.resolve().then(() => {
        res.loadedComplete = true;
      });
      return res;
    }

    let content1;
    let content2;
    let blacklistedAd;
    let blacklistedAnalytics;
    let blacklistedPixel;

    const context = document.createElement('div');
    document.body.appendChild(context);
    resourcesMock
        .expects('getResourcesInRect')
        .withArgs(sinon.match(arg => arg == window))
        .returns(Promise.resolve([
          content1 = resource('amp-img', 0),
          content2 = resource('amp-video', 0),
          blacklistedAd = resource('amp-ad', 0),
          blacklistedAnalytics = resource('amp-analytics', 0),
          blacklistedPixel = resource('amp-pixel', 0),
        ]))
        .once();

    return whenContentIniLoad(context, window).then(() => {
      expect(content1.loadedComplete).to.be.true;
      expect(content2.loadedComplete).to.be.true;
      expect(blacklistedAd.loadedComplete).to.be.false;
      expect(blacklistedAnalytics.loadedComplete).to.be.false;
      expect(blacklistedPixel.loadedComplete).to.be.false;
    });
  });

  describe('mergeHtml', () => {
    let spec;

    beforeEach(() => {
      spec = {
        url: 'https://acme.org/embed1',
        html: '<a></a>',
      };
    });

    it('should install base', () => {
      const html = mergeHtmlForTesting(spec);
      expect(html.indexOf('<base href="https://acme.org/embed1">')).to.equal(0);
    });

    it('should install fonts', () => {
      const FONT1 = 'https://acme.org/font1';
      const FONT2 = 'https://acme.org/font2';
      spec.fonts = [FONT1, FONT2];
      const html = mergeHtmlForTesting(spec);
      const templ = '<link href="FONT" rel="stylesheet" type="text/css">';
      expect(html.indexOf(templ.replace('FONT', FONT1))).to.be.greaterThan(0);
      expect(html.indexOf(templ.replace('FONT', FONT2))).to.be.greaterThan(0);
    });

    it('should escape urls', () => {
      spec.url = 'https://acme.org/embed<1';
      spec.fonts = ['https://acme.org/font<1'];
      const html = mergeHtmlForTesting(spec);
      expect(html.indexOf('<base href="https://acme.org/embed&lt;1">'))
          .to.greaterThan(-1);
      expect(html.indexOf('<link href="https://acme.org/font&lt;1"'))
          .to.greaterThan(-1);
    });

    it('should pre-pend to html', () => {
      const html = mergeHtmlForTesting(spec);
      expect(html).to.equal('<base href="https://acme.org/embed1">'
          + '<meta http-equiv=Content-Security-Policy content='
          + '"script-src \'none\';object-src \'none\';child-src \'none\'">'
          + '<a></a>');
    });

    it('should insert into head', () => {
      spec.html = '<html><head>head</head><body>body';
      const html = mergeHtmlForTesting(spec);
      expect(html).to.equal('<html><head><base href="https://acme.org/embed1">'
          + '<meta http-equiv=Content-Security-Policy content='
          + '"script-src \'none\';object-src \'none\';'
          + 'child-src \'none\'">head</head><body>body');
    });

    it('should insert into head w/o html', () => {
      spec.html = '<head>head</head><body>body';
      const html = mergeHtmlForTesting(spec);
      expect(html).to.equal('<head><base href="https://acme.org/embed1">'
          + '<meta http-equiv=Content-Security-Policy content="'
          + 'script-src \'none\';object-src \'none\';child-src \'none\'">head'
          + '</head><body>body');
    });

    it('should insert before body', () => {
      spec.html = '<html><body>body';
      const html = mergeHtmlForTesting(spec);
      expect(html).to.equal('<html><base href="https://acme.org/embed1">'
          + '<meta http-equiv=Content-Security-Policy content="script-src '
          + '\'none\';object-src \'none\';child-src \'none\'"><body>body');
    });

    it('should insert before body w/o html', () => {
      spec.html = '<body>body';
      const html = mergeHtmlForTesting(spec);
      expect(html).to.equal('<base href="https://acme.org/embed1">'
          + '<meta http-equiv=Content-Security-Policy content="script-src '
          + '\'none\';object-src \'none\';child-src \'none\'"><body>body');
    });

    it('should insert after html', () => {
      spec.html = '<html>content';
      const html = mergeHtmlForTesting(spec);
      expect(html).to.equal('<html><base href="https://acme.org/embed1">'
          + '<meta http-equiv=Content-Security-Policy content="script-src '
          + '\'none\';object-src \'none\';child-src \'none\'">content');
    });

    it('should insert CSP', () => {
      spec.html = '<html><head></head><body></body></html>';
      expect(mergeHtmlForTesting(spec)).to.equal(
          '<html><head><base href="https://acme.org/embed1">' +
          '<meta http-equiv=Content-Security-Policy ' +
          'content="script-src \'none\';object-src \'none\';' +
          'child-src \'none\'">' +
          '</head><body></body></html>');
      spec.html = '<html>foo';
      expect(mergeHtmlForTesting(spec)).to.equal(
          '<html><base href="https://acme.org/embed1">' +
          '<meta http-equiv=Content-Security-Policy ' +
          'content="script-src \'none\';object-src \'none\';' +
          'child-src \'none\'">foo');
      spec.html = '<body>foo';
      expect(mergeHtmlForTesting(spec)).to.equal(
          '<base href="https://acme.org/embed1">' +
          '<meta http-equiv=Content-Security-Policy ' +
          'content="script-src \'none\';object-src \'none\';' +
          'child-src \'none\'"><body>foo');
    });
  });

  describe('child document ready and loaded states', () => {

    it('should wait until ready', () => {
      const embedPromise = installFriendlyIframeEmbed(iframe, document.body, {
        url: 'https://acme.org/url1',
        html: '<a id="a1"></a>',
      });
      return embedPromise.then(() => {
        expect(iframe.contentDocument.getElementById('a1')).to.be.ok;
      });
    });

    it('should wait until ready for doc.write case', () => {
      setSrcdocSupportedForTesting(false);
      const embedPromise = installFriendlyIframeEmbed(iframe, document.body, {
        url: 'https://acme.org/url1',
        html: '<a id="a1"></a>',
      });
      return embedPromise.then(() => {
        expect(iframe.contentDocument.getElementById('a1')).to.be.ok;
      });
    });

    it('should wait for loaded state', () => {
      const embedPromise = installFriendlyIframeEmbed(iframe, document.body, {
        url: 'https://acme.org/url1',
        html: '<a id="a1"></a>',
      });
      return embedPromise.then(embed => {
        return embed.whenWindowLoaded();
      });
    });

    it('should wait for loaded state for doc.write case', () => {
      setSrcdocSupportedForTesting(false);
      const embedPromise = installFriendlyIframeEmbed(iframe, document.body, {
        url: 'https://acme.org/url1',
        html: '<a id="a1"></a>',
      });
      return embedPromise.then(embed => {
        return embed.whenWindowLoaded();
      });
    });

    it('should add violation listener', () => {
      let eventListenerSpy;
      const container = {
        appendChild: child => {
          document.body.appendChild(child);
          eventListenerSpy =
              sandbox.spy(child.contentWindow, 'addEventListener');
        },
      };
      const embedPromise = installFriendlyIframeEmbed(iframe, container, {
        url: 'https://acme.org/url1',
        html: '<a id="a1"></a>',
      });
      return embedPromise.then(() => {
        expect(eventListenerSpy).to.be.calledOnce;
      });
    });
  });

  describe('child document ready polling', () => {
    let clock;
    let win;
    let iframe;
    let contentWindow;
    let contentDocument;
    let contentBody;
    let container;
    let loadListener, errorListener;
    let polls;
    let renderStartStub;

    beforeEach(() => {
      setSrcdocSupportedForTesting(true);

      clock = sandbox.useFakeTimers();

      polls = [];
      win = {
        services: {
          'extensions': {obj: {
            installExtensionsInChildWindow: () => {},
            preloadExtension: () => {},
          }},
        },
        setInterval() {
          const interval = window.setInterval.apply(window, arguments);
          polls.push(interval);
          return interval;
        },
        clearInterval(interval) {
          window.clearInterval.apply(window, arguments);
          const index = polls.indexOf(interval);
          if (index != -1) {
            polls.splice(index, 1);
          }
        },
      };

      loadListener = undefined;
      iframe = {
        tagName: 'IFRAME',
        nodeType: 1,
        ownerDocument: {defaultView: win},
        style: {},
        setAttribute: () => {},
        addEventListener: (eventType, listener) => {
          if (eventType == 'load') {
            loadListener = listener;
          } else if (eventType == 'error') {
            errorListener = listener;
          }
        },
        removeEventListener: () => {},
      };
      contentWindow = {
        addEventListener: () => {},
      };
      contentDocument = {};
      contentBody = {nodeType: 1, style: {}};
      container = {
        appendChild: () => {},
      };
      renderStartStub = sandbox.stub(
          FriendlyIframeEmbed.prototype, 'startRender_');
    });

    afterEach(() => {
      expect(polls).to.have.length(0);
    });

    it('should not poll if body is already ready', () => {
      contentBody.firstChild = {};
      contentDocument.body = contentBody;
      contentWindow.document = contentDocument;
      iframe.contentWindow = contentWindow;
      const embedPromise = installFriendlyIframeEmbed(iframe, container, {
        url: 'https://acme.org/url1',
        html: '<body></body>',
      });
      expect(polls).to.have.length(0);
      let ready = false;
      embedPromise.then(() => {
        ready = true;
      });
      return Promise.race([Promise.resolve(), embedPromise]).then(() => {
        expect(ready).to.be.true;
      });
    });

    it('should poll until ready', () => {
      iframe.contentWindow = contentWindow;
      const embedPromise = installFriendlyIframeEmbed(iframe, container, {
        url: 'https://acme.org/url1',
        html: '<body></body>',
      });
      let ready = false;
      embedPromise.then(() => {
        ready = true;
      });
      expect(polls).to.have.length(1);
      return Promise.race([Promise.resolve(), embedPromise]).then(() => {
        expect(ready).to.be.false;
        expect(polls).to.have.length(1);

        // Window is now available.
        iframe.contentWindow = contentWindow;
        clock.tick(5);
        return Promise.race([Promise.resolve(), embedPromise]);
      }).then(() => {
        expect(ready).to.be.false;
        expect(polls).to.have.length(1);

        // Document is now available.
        contentWindow.document = contentDocument;
        clock.tick(5);
        return Promise.race([Promise.resolve(), embedPromise]);
      }).then(() => {
        expect(ready).to.be.false;
        expect(polls).to.have.length(1);

        // Body is now available.
        contentDocument.body = contentBody;
        clock.tick(5);
        return Promise.race([Promise.resolve(), embedPromise]);
      }).then(() => {
        expect(ready).to.be.false;
        expect(polls).to.have.length(1);

        // Body is now not empty.
        contentBody.firstChild = {};
        clock.tick(5);
        return Promise.race([Promise.resolve(), embedPromise]);
      }).then(() => {
        expect(ready).to.equal(true, 'Finally ready');
        expect(polls).to.have.length(0);
      });
    });

    it('should stop polling when loaded', () => {
      iframe.contentWindow = contentWindow;
      const embedPromise = installFriendlyIframeEmbed(iframe, container, {
        url: 'https://acme.org/url1',
        html: '<body></body>',
      });
      expect(polls).to.have.length(1);
      iframe.contentWindow = contentWindow;
      loadListener();
      return embedPromise.then(() => {
        expect(polls).to.have.length(0);
        expect(renderStartStub).to.be.calledOnce;
      });
    });

    it('should stop polling when loading failed', () => {
      iframe.contentWindow = contentWindow;
      const embedPromise = installFriendlyIframeEmbed(iframe, container, {
        url: 'https://acme.org/url1',
        html: '<body></body>',
      });
      expect(polls).to.have.length(1);
      iframe.contentWindow = contentWindow;
      errorListener();
      return embedPromise.then(() => {
        expect(polls).to.have.length(0);
      });
    });

  });

  describe('full overlay mode', () => {
    const x = 10;
    const y = 500;
    const w = 400;
    const h = 300;

    const winW = 600;
    const winH = 800;

    const vsyncMock = {
      measure: fn => fn(),
    };

    const resourcesMock = {
      mutateElement: (unusedEl, fn) => {
        fn();
        return Promise.resolve();
      },
    };

    let win;
    let iframe;
    let fie;

    beforeEach(() => {
      win = {
        innerWidth: winW,
        innerHeight: winH,
      };
      iframe = document.createElement('iframe');

      sandbox./*OK*/stub(iframe, 'getBoundingClientRect').callsFake(() => ({
        right: x + w,
        left: x,
        top: y,
        bottom: y + h,
        width: w,
        height: h,
      }));

      fie = new FriendlyIframeEmbed(iframe, {
        url: 'https://acme.org/url1',
        html: '<body></body>',
      }, Promise.resolve());

      sandbox.stub(fie, 'getVsync').callsFake(() => vsyncMock);
      sandbox.stub(fie, 'getResources').callsFake(() => resourcesMock);
      sandbox.stub(fie, 'win').callsFake(win);
    });

    it('should resize body and fixed container when entering', function* () {
      const bodyElementMock = document.createElement('div');

      const mutateElementSpy = sandbox.spy(resourcesMock, 'mutateElement');

      sandbox.stub(fie, 'getBodyElement').callsFake(() => bodyElementMock);

      yield fie.enterFullOverlayMode();

      expect(bodyElementMock.style.background).to.equal('transparent');
      expect(bodyElementMock.style.position).to.equal('absolute');
      expect(bodyElementMock.style.width).to.equal(`${w}px`);
      expect(bodyElementMock.style.height).to.equal(`${h}px`);
      expect(bodyElementMock.style.top).to.equal(`${y}px`);
      expect(bodyElementMock.style.left).to.equal(`${x}px`);
      expect(bodyElementMock.style.right).to.equal('auto');
      expect(bodyElementMock.style.bottom).to.equal('auto');

      expect(iframe.style.position).to.equal('fixed');
      expect(iframe.style.left).to.equal('0px');
      expect(iframe.style.right).to.equal('0px');
      expect(iframe.style.top).to.equal('0px');
      expect(iframe.style.bottom).to.equal('0px');
      expect(iframe.style.width).to.equal('100vw');
      expect(iframe.style.height).to.equal('100vh');

      // ensuring that the resource scheduler knows about the iframe change
      expect(mutateElementSpy)
          .to.have.been.calledWith(iframe, sinon.match.any);
    });

    it('should reset body and fixed container when leaving', function* () {
      const bodyElementMock = document.createElement('div');

      const mutateElementSpy = sandbox.spy(resourcesMock, 'mutateElement');

      sandbox.stub(fie, 'getBodyElement').callsFake(() => bodyElementMock);

      yield fie.enterFullOverlayMode();
      yield fie.leaveFullOverlayMode();

      expect(bodyElementMock.style.position).to.be.empty;
      expect(bodyElementMock.style.width).to.be.empty;
      expect(bodyElementMock.style.height).to.be.empty;
      expect(bodyElementMock.style.top).to.be.empty;
      expect(bodyElementMock.style.left).to.be.empty;
      expect(bodyElementMock.style.right).to.be.empty;
      expect(bodyElementMock.style.bottom).to.be.empty;

      expect(iframe.style.position).to.be.empty;
      expect(iframe.style.left).to.be.empty;
      expect(iframe.style.right).to.be.empty;
      expect(iframe.style.top).to.be.empty;
      expect(iframe.style.bottom).to.be.empty;
      expect(iframe.style.width).to.be.empty;
      expect(iframe.style.height).to.be.empty;

      // ensuring that the resource scheduler knows about the iframe change
      expect(mutateElementSpy)
          .to.have.been.calledWith(iframe, sinon.match.any);
    });
  });
});
