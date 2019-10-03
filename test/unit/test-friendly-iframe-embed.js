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

import {BaseElement} from '../../src/base-element';
import {ElementStub} from '../../src/element-stub';
import {
  FriendlyIframeEmbed,
  installFriendlyIframeEmbed,
  installStandardServicesInEmbed,
  mergeHtmlForTesting,
  setFriendlyIframeEmbedVisible,
  setSrcdocSupportedForTesting,
} from '../../src/friendly-iframe-embed';
import {Services} from '../../src/services';
import {Signals} from '../../src/utils/signals';
import {getFriendlyIframeEmbedOptional} from '../../src/iframe-helper';
import {
  getService,
  installServiceInEmbedScope,
  registerServiceBuilder,
  setParentWindow,
} from '../../src/service';
import {installExtensionsService} from '../../src/service/extensions-impl';
import {isAnimationNone} from '../../testing/test-helper';
import {layoutRectLtwh} from '../../src/layout-rect';
import {loadPromise} from '../../src/event-helper';
import {resetScheduledElementForTesting} from '../../src/service/custom-element-registry';
import {toggleExperiment} from '../../src/experiments';
import {updateFieModeForTesting} from '../../src/service/ampdoc-impl';

describes.realWin('friendly-iframe-embed', {amp: true}, env => {
  let window, document;
  let iframe;
  let extensionsMock;
  let resourcesMock;
  let ampdocServiceMock;
  let installExtensionsInChildWindowStub;
  let installExtensionsInFieStub;

  beforeEach(() => {
    window = env.win;
    document = window.document;

    const extensions = Services.extensionsFor(window);
    const resources = Services.resourcesForDoc(window.document);
    const ampdocService = {
      installFieDoc: () => {},
    };
    extensionsMock = sandbox.mock(extensions);
    resourcesMock = sandbox.mock(resources);
    ampdocServiceMock = sandbox.mock(ampdocService);
    sandbox.stub(Services, 'ampdocServiceFor').callsFake(() => ampdocService);

    iframe = document.createElement('iframe');

    installExtensionsInChildWindowStub = sandbox
      .stub(FriendlyIframeEmbed.prototype, 'installExtensionsInChildWindow')
      .returns(Promise.resolve());

    installExtensionsInFieStub = sandbox
      .stub(FriendlyIframeEmbed.prototype, 'installExtensionsInFie')
      .returns(Promise.resolve());
  });

  afterEach(() => {
    if (iframe.parentElement) {
      iframe.parentElement.removeChild(iframe);
    }
    extensionsMock.verify();
    resourcesMock.verify();
    ampdocServiceMock.verify();
    setSrcdocSupportedForTesting(undefined);
    toggleExperiment(window, 'ampdoc-fie', false);
    sandbox.restore();
  });

  function stubViewportScrollTop(scrollTop) {
    sandbox.stub(Services, 'viewportForDoc').returns({
      getScrollTop: () => scrollTop,
    });
  }

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
    expect(iframe.getAttribute('marginheight')).to.equal('0');
    expect(iframe.getAttribute('marginwidth')).to.equal('0');

    // Iframe has been appended to DOM.
    expect(iframe.parentElement).to.equal(document.body);

    return embedPromise
      .then(embed => {
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
        expect(isAnimationNone(embed.win.document.body)).to.be.true;
        expect(
          embed.win.document.documentElement.classList.contains('i-amphtml-fie')
        ).to.be.true;

        // BASE element has been inserted.
        expect(embed.win.document.querySelector('base').href).to.equal(
          'https://acme.org/url1'
        );
        expect(embed.win.document.querySelector('a').href).to.equal(
          'https://acme.org/url2'
        );

        return loadPromise(iframe);
      })
      .then(() => {
        // Iframe is marked as complete.
        expect(iframe.readyState).to.equal('complete');
      });
  });

  it.skip('should write doc if srcdoc is not available', () => {
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

  it('should create ampdoc and install extensions', () => {
    toggleExperiment(window, 'ampdoc-fie', true);

    // AmpDoc is created.
    const ampdocSignals = new Signals();
    const ampdoc = {
      setReady: sandbox.spy(),
      signals: () => ampdocSignals,
    };
    let childWinForAmpDoc;
    ampdocServiceMock
      .expects('installFieDoc')
      .withExactArgs(
        'https://acme.org/url1',
        sinon.match(arg => {
          // Match childWin argument.
          childWinForAmpDoc = arg;
          return true;
        }),
        sinon.match(arg => {
          // Match options with no signals.
          expect(arg && arg.signals).to.not.be.ok;
          return true;
        })
      )
      .returns(ampdoc)
      .once();

    // Extensions preloading have been requested.
    extensionsMock
      .expects('preloadExtension')
      .withExactArgs('amp-test')
      .returns(Promise.resolve())
      .once();

    let readyResolver = null;
    const readyPromise = new Promise(resolve => {
      readyResolver = resolve;
    });
    sandbox
      .stub(FriendlyIframeEmbed.prototype, 'whenReady')
      .callsFake(() => readyPromise);

    const embedPromise = installFriendlyIframeEmbed(iframe, document.body, {
      url: 'https://acme.org/url1',
      html: '<amp-test></amp-test>',
      extensionIds: ['amp-test'],
    });
    return embedPromise
      .then(embed => {
        expect(childWinForAmpDoc).to.equal(embed.win);
        expect(ampdoc).to.equal(embed.ampdoc);
        expect(installExtensionsInFieStub).to.be.calledWithMatch(
          sinon.match.any,
          sinon.match.same(ampdoc)
        );
        expect(ampdoc.setReady).to.not.be.called;
        readyResolver();
        return readyPromise;
      })
      .then(() => {
        expect(ampdoc.setReady).to.be.calledOnce;
      });
  });

  it('should create ampdoc and install extensions with host', () => {
    toggleExperiment(window, 'ampdoc-fie', true);

    // host.
    const hostSignals = new Signals();
    const host = document.createElement('div');
    host.signals = () => hostSignals;
    host.renderStarted = sandbox.spy();
    host.getLayoutBox = () => layoutRectLtwh(10, 10, 100, 200);

    // AmpDoc is created.
    let ampdocSignals = null;
    const ampdoc = {
      setReady: sandbox.spy(),
      signals: () => ampdocSignals,
    };
    let childWinForAmpDoc;
    ampdocServiceMock
      .expects('installFieDoc')
      .withExactArgs(
        'https://acme.org/url1',
        sinon.match(arg => {
          // Match childWin argument.
          childWinForAmpDoc = arg;
          return true;
        }),
        sinon.match(arg => {
          // Match options with no signals.
          ampdocSignals = arg && arg.signals;
          expect(ampdocSignals).to.be.ok;
          return true;
        })
      )
      .returns(ampdoc)
      .once();

    // Extensions preloading have been requested.
    extensionsMock
      .expects('preloadExtension')
      .withExactArgs('amp-test')
      .returns(Promise.resolve())
      .once();

    let readyResolver = null;
    const readyPromise = new Promise(resolve => {
      readyResolver = resolve;
    });
    sandbox
      .stub(FriendlyIframeEmbed.prototype, 'whenReady')
      .callsFake(() => readyPromise);

    const embedPromise = installFriendlyIframeEmbed(iframe, document.body, {
      url: 'https://acme.org/url1',
      html: '<amp-test></amp-test>',
      extensionIds: ['amp-test'],
      host,
    });
    return embedPromise
      .then(embed => {
        expect(childWinForAmpDoc).to.equal(embed.win);
        expect(ampdoc).to.equal(embed.ampdoc);
        expect(installExtensionsInFieStub).to.be.calledWithMatch(
          sinon.match.any,
          sinon.match.same(ampdoc)
        );
        expect(ampdoc.setReady).to.not.be.called;
        readyResolver();
        return readyPromise;
      })
      .then(() => {
        expect(ampdoc.setReady).to.be.calledOnce;
        expect(host.renderStarted).to.be.calledOnce;
        expect(ampdoc.signals()).to.equal(hostSignals);
      });
  });

  it('should install extensions', () => {
    // Extensions preloading have been requested.
    extensionsMock
      .expects('preloadExtension')
      .withExactArgs('amp-test')
      .returns(Promise.resolve())
      .once();

    const embedPromise = installFriendlyIframeEmbed(iframe, document.body, {
      url: 'https://acme.org/url1',
      html: '<amp-test></amp-test>',
      extensionIds: ['amp-test'],
    });
    return embedPromise.then(embed => {
      expect(installExtensionsInChildWindowStub).to.be.calledWith(
        sinon.match.any,
        sinon.match.same(embed.win)
      );
    });
  });

  it('should pass pre-install callback', () => {
    const preinstallCallback = function() {};

    const embedPromise = installFriendlyIframeEmbed(
      iframe,
      document.body,
      {
        url: 'https://acme.org/url1',
        html: '<amp-test></amp-test>',
      },
      preinstallCallback
    );
    return embedPromise.then(() => {
      expect(installExtensionsInChildWindowStub).to.be.calledOnce;
    });
  });

  it.skip('should install and dispose services', () => {
    const disposeSpy = sandbox.spy();
    const embedService = {
      dispose: disposeSpy,
    };
    const embedPromise = installFriendlyIframeEmbed(
      iframe,
      document.body,
      {
        url: 'https://acme.org/url1',
        html: '<amp-test></amp-test>',
      },
      embedWin => {
        installServiceInEmbedScope(embedWin, 'c', embedService);
      }
    );
    return embedPromise.then(embed => {
      expect(embed.win.__AMP_SERVICES['c'].obj).to.equal(embedService);
      expect(disposeSpy).to.not.be.called;
      embed.destroy();
      expect(disposeSpy).to.be.calledOnce;
    });
  });

  it('should dispose ampdoc', () => {
    toggleExperiment(window, 'ampdoc-fie', true);

    // AmpDoc is created.
    const ampdocSignals = new Signals();
    const ampdoc = {
      setReady: sandbox.spy(),
      signals: () => ampdocSignals,
      dispose: sandbox.spy(),
    };
    ampdocServiceMock
      .expects('installFieDoc')
      .returns(ampdoc)
      .once();

    // Extensions preloading have been requested.
    extensionsMock
      .expects('preloadExtension')
      .withExactArgs('amp-test')
      .returns(Promise.resolve())
      .once();

    sandbox
      .stub(FriendlyIframeEmbed.prototype, 'whenReady')
      .returns(Promise.resolve());

    const embedPromise = installFriendlyIframeEmbed(iframe, document.body, {
      url: 'https://acme.org/url1',
      html: '<amp-test></amp-test>',
      extensionIds: ['amp-test'],
    });
    return embedPromise
      .then(embed => {
        expect(installExtensionsInFieStub).to.be.calledOnce;
        embed.destroy();
      })
      .then(() => {
        expect(ampdoc.dispose).to.be.calledOnce;
      });
  });

  it('should start invisible by default and update on request', () => {
    const embedPromise = installFriendlyIframeEmbed(iframe, document.body, {
      url: 'https://acme.org/url1',
      html: '',
      extensionIds: [],
    });
    return embedPromise.then(embed => {
      expect(installExtensionsInChildWindowStub).to.be.calledOnce;
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

  it.skip('should support host', () => {
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

  it.skip('should await initial load', () => {
    resourcesMock
      .expects('getResourcesInRect')
      .withExactArgs(
        sinon.match(arg => arg == iframe.contentWindow),
        sinon.match(
          arg =>
            arg.left == 0 &&
            arg.top == 0 &&
            arg.width == iframe.contentWindow.innerWidth &&
            arg.height == iframe.contentWindow.innerHeight
        )
      )
      .returns(Promise.resolve([]))
      .once();
    const embedPromise = installFriendlyIframeEmbed(iframe, document.body, {
      url: 'https://acme.org/url1',
      html: '<amp-test></amp-test>',
    });
    let embed;
    return embedPromise
      .then(em => {
        embed = em;
        return embed.whenIniLoaded();
      })
      .then(() => {
        expect(embed.signals().get('ini-load')).to.be.ok;
        return embed.whenReady(); // `whenReady` should also be complete.
      });
  });

  it.skip('should await initial with host', () => {
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
        sinon.match(
          arg =>
            arg.left == 10 &&
            arg.top == 10 &&
            arg.width == 100 &&
            arg.height == 200
        )
      )
      .returns(Promise.resolve([]))
      .once();
    const embedPromise = installFriendlyIframeEmbed(iframe, document.body, {
      url: 'https://acme.org/url1',
      html: '<amp-test></amp-test>',
      host,
    });
    let embed;
    return embedPromise
      .then(em => {
        embed = em;
        return embed.whenIniLoaded();
      })
      .then(() => {
        expect(embed.signals().get('ini-load')).to.be.ok;
        return embed.whenReady(); // `whenReady` should also be complete.
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
      expect(
        html.indexOf('<base href="https://acme.org/embed&lt;1">')
      ).to.greaterThan(-1);
      expect(
        html.indexOf('<link href="https://acme.org/font&lt;1"')
      ).to.greaterThan(-1);
    });

    it('should pre-pend to html', () => {
      const html = mergeHtmlForTesting(spec);
      expect(html).to.equal(
        '<base href="https://acme.org/embed1">' +
          '<meta http-equiv=Content-Security-Policy content=' +
          "\"script-src 'none';object-src 'none';child-src 'none'\">" +
          '<a></a>'
      );
    });

    it('should insert into head', () => {
      spec.html = '<html><head>head</head><body>body';
      const html = mergeHtmlForTesting(spec);
      expect(html).to.equal(
        '<html><head><base href="https://acme.org/embed1">' +
          '<meta http-equiv=Content-Security-Policy content=' +
          "\"script-src 'none';object-src 'none';" +
          "child-src 'none'\">head</head><body>body"
      );
    });

    it('should insert into head w/o html', () => {
      spec.html = '<head>head</head><body>body';
      const html = mergeHtmlForTesting(spec);
      expect(html).to.equal(
        '<head><base href="https://acme.org/embed1">' +
          '<meta http-equiv=Content-Security-Policy content="' +
          "script-src 'none';object-src 'none';child-src 'none'\">head" +
          '</head><body>body'
      );
    });

    it('should insert before body', () => {
      spec.html = '<html><body>body';
      const html = mergeHtmlForTesting(spec);
      expect(html).to.equal(
        '<html><base href="https://acme.org/embed1">' +
          '<meta http-equiv=Content-Security-Policy content="script-src ' +
          "'none';object-src 'none';child-src 'none'\"><body>body"
      );
    });

    it('should insert before body w/o html', () => {
      spec.html = '<body>body';
      const html = mergeHtmlForTesting(spec);
      expect(html).to.equal(
        '<base href="https://acme.org/embed1">' +
          '<meta http-equiv=Content-Security-Policy content="script-src ' +
          "'none';object-src 'none';child-src 'none'\"><body>body"
      );
    });

    it('should insert after html', () => {
      spec.html = '<html>content';
      const html = mergeHtmlForTesting(spec);
      expect(html).to.equal(
        '<html><base href="https://acme.org/embed1">' +
          '<meta http-equiv=Content-Security-Policy content="script-src ' +
          "'none';object-src 'none';child-src 'none'\">content"
      );
    });

    it('should insert CSP', () => {
      spec.html = '<html><head></head><body></body></html>';
      expect(mergeHtmlForTesting(spec)).to.equal(
        '<html><head><base href="https://acme.org/embed1">' +
          '<meta http-equiv=Content-Security-Policy ' +
          "content=\"script-src 'none';object-src 'none';" +
          "child-src 'none'\">" +
          '</head><body></body></html>'
      );
      spec.html = '<html>foo';
      expect(mergeHtmlForTesting(spec)).to.equal(
        '<html><base href="https://acme.org/embed1">' +
          '<meta http-equiv=Content-Security-Policy ' +
          "content=\"script-src 'none';object-src 'none';" +
          "child-src 'none'\">foo"
      );
      spec.html = '<body>foo';
      expect(mergeHtmlForTesting(spec)).to.equal(
        '<base href="https://acme.org/embed1">' +
          '<meta http-equiv=Content-Security-Policy ' +
          "content=\"script-src 'none';object-src 'none';" +
          "child-src 'none'\"><body>foo"
      );
    });
  });

  describe.skip('child document ready and loaded states', () => {
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
          eventListenerSpy = sandbox.spy(
            child.contentWindow,
            'addEventListener'
          );
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
        __AMP_SERVICES: {
          'extensions': {
            obj: {
              preloadExtension: () => {},
            },
          },
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
        FriendlyIframeEmbed.prototype,
        'startRender_'
      );
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
      return Promise.race([Promise.resolve(), embedPromise])
        .then(() => {
          expect(ready).to.be.false;
          expect(polls).to.have.length(1);

          // Window is now available.
          iframe.contentWindow = contentWindow;
          clock.tick(5);
          return Promise.race([Promise.resolve(), embedPromise]);
        })
        .then(() => {
          expect(ready).to.be.false;
          expect(polls).to.have.length(1);

          // Document is now available.
          contentWindow.document = contentDocument;
          clock.tick(5);
          return Promise.race([Promise.resolve(), embedPromise]);
        })
        .then(() => {
          expect(ready).to.be.false;
          expect(polls).to.have.length(1);

          // Body is now available.
          contentDocument.body = contentBody;
          clock.tick(5);
          return Promise.race([Promise.resolve(), embedPromise]);
        })
        .then(() => {
          expect(ready).to.be.false;
          expect(polls).to.have.length(1);

          // Body is now not empty.
          contentBody.firstChild = {};
          clock.tick(5);
          return embedPromise;
        })
        .then(() => {
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

    // TODO(#16916): Make this test work with synchronous throws.
    it.skip('should stop polling when loading failed', () => {
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

    const resourcesMock = {
      measureMutateElement: (unusedEl, measure, mutate) => {
        if (measure) {
          measure();
        }
        if (mutate) {
          mutate();
        }
        return Promise.resolve();
      },
    };

    let win;

    function createFie(bodyElementMock, parentType = 'amp-ad') {
      const iframe = document.createElement('iframe');
      const parent = document.createElement(parentType);

      parent.appendChild(iframe);

      sandbox
        ./*OK*/ stub(iframe, 'getBoundingClientRect')
        .returns(layoutRectLtwh(x, y, w, h));

      const fie = new FriendlyIframeEmbed(
        iframe,
        {
          url: 'https://acme.org/url1',
          html: '<body></body>',
        },
        Promise.resolve()
      );

      sandbox.stub(fie, 'getResources_').returns(resourcesMock);
      sandbox.stub(fie, 'getBodyElement').returns(bodyElementMock);

      fie.win = win;

      return fie;
    }

    beforeEach(() => {
      win = {
        innerWidth: winW,
        innerHeight: winH,
      };
    });

    it('should not throw if inside an amp-ad', () => {
      const bodyElementMock = document.createElement('div');
      const fie = createFie(bodyElementMock, 'amp-ad');

      const scrollTop = 0;
      stubViewportScrollTop(scrollTop);

      expect(() => fie.enterFullOverlayMode()).to.not.throw();
    });

    it('should throw if not inside an amp-ad', () => {
      const bodyElementMock = document.createElement('div');
      const fie = createFie(bodyElementMock, 'not-an-amp-ad');

      const scrollTop = 0;
      stubViewportScrollTop(scrollTop);

      allowConsoleError(() => {
        expect(() => fie.enterFullOverlayMode()).to.throw(
          /Only .?amp-ad.? is allowed/
        );
      });
    });

    it.configure()
      .skipFirefox()
      .run('resizes body and fixed container when entering', function*() {
        const bodyElementMock = document.createElement('div');
        const fie = createFie(bodyElementMock);

        const scrollTop = 45;
        stubViewportScrollTop(scrollTop);

        yield fie.enterFullOverlayMode();

        expect(bodyElementMock.style.background).to.equal('transparent');
        expect(bodyElementMock.style.position).to.equal('absolute');
        expect(bodyElementMock.style.width).to.equal(`${w}px`);
        expect(bodyElementMock.style.height).to.equal(`${h}px`);
        expect(bodyElementMock.style.top).to.equal(`${y - scrollTop}px`);
        expect(bodyElementMock.style.left).to.equal(`${x}px`);
        expect(bodyElementMock.style.right).to.equal('auto');
        expect(bodyElementMock.style.bottom).to.equal('auto');

        const {iframe} = fie;

        expect(iframe.style.position).to.equal('fixed');
        expect(iframe.style.left).to.equal('0px');
        expect(iframe.style.right).to.equal('0px');
        expect(iframe.style.top).to.equal('0px');
        expect(iframe.style.bottom).to.equal('0px');
        expect(iframe.style.width).to.equal('100vw');
        expect(iframe.style.height).to.equal('100vh');
      });

    it('should reset body and fixed container when leaving', function*() {
      const bodyElementMock = document.createElement('div');
      const fie = createFie(bodyElementMock);

      const scrollTop = 19;
      stubViewportScrollTop(scrollTop);

      yield fie.enterFullOverlayMode();
      yield fie.leaveFullOverlayMode();

      expect(bodyElementMock.style.position).to.be.empty;
      expect(bodyElementMock.style.width).to.be.empty;
      expect(bodyElementMock.style.height).to.be.empty;
      expect(bodyElementMock.style.top).to.be.empty;
      expect(bodyElementMock.style.left).to.be.empty;
      expect(bodyElementMock.style.right).to.be.empty;
      expect(bodyElementMock.style.bottom).to.be.empty;

      const {iframe} = fie;

      expect(iframe.style.position).to.be.empty;
      expect(iframe.style.left).to.be.empty;
      expect(iframe.style.right).to.be.empty;
      expect(iframe.style.top).to.be.empty;
      expect(iframe.style.bottom).to.be.empty;
      expect(iframe.style.width).to.be.empty;
      expect(iframe.style.height).to.be.empty;
    });
  });
});

class AmpTest extends BaseElement {}
class AmpTestSub extends BaseElement {}

// TODO(#22733): remove once ampdoc-fie is launched.
describes.realWin('installExtensionsInChildWindow', {amp: true}, env => {
  let parentWin;
  let extensions;
  let extensionsMock;
  let iframe;
  let iframeWin;
  let fie;

  beforeEach(() => {
    parentWin = env.win;
    resetScheduledElementForTesting(parentWin, 'amp-test');
    installExtensionsService(parentWin);
    extensions = Services.extensionsFor(parentWin);
    extensionsMock = sandbox.mock(extensions);

    [
      'urlForDoc',
      'actionServiceForDoc',
      'standardActionsForDoc',
      'navigationForDoc',
      'timerFor',
    ].forEach(s => {
      class FakeService {
        static installInEmbedWindow() {}
      }
      sandbox.stub(FakeService, 'installInEmbedWindow');
      sandbox.stub(Services, s).returns(new FakeService());
    });

    iframe = parentWin.document.createElement('iframe');
    const promise = loadPromise(iframe);
    const html = '<div id="one"></div>';
    if ('srcdoc' in iframe) {
      iframe.srcdoc = html;
    } else {
      iframe.src = 'about:blank';
      const childDoc = iframe.contentWindow.document;
      childDoc.open();
      childDoc.write(html);
      childDoc.close();
    }
    parentWin.document.body.appendChild(iframe);
    fie = new FriendlyIframeEmbed(
      iframe,
      {
        url: 'https://acme.org/url1',
        html: '<body></body>',
      },
      Promise.resolve(),
      env.ampdoc
    );
    return promise.then(() => {
      iframeWin = iframe.contentWindow;
      setParentWindow(iframeWin, parentWin);
    });
  });

  afterEach(() => {
    if (iframe.parentElement) {
      iframe.parentElement.removeChild(iframe);
    }
    extensionsMock.verify();
  });

  it('should set window hierarchy', () => {
    fie.installExtensionsInChildWindow(extensions, iframeWin, []);
    expect(iframeWin.__AMP_PARENT).to.equal(parentWin);
    expect(iframeWin.__AMP_TOP).to.equal(parentWin);
  });

  it('should install runtime styles', () => {
    fie.installExtensionsInChildWindow(extensions, iframeWin, []);
    expect(iframeWin.document.querySelector('style[amp-runtime]')).to.exist;
  });

  it('should install built-ins', () => {
    fie.installExtensionsInChildWindow(extensions, iframeWin, []);
    expect(iframeWin.__AMP_EXTENDED_ELEMENTS).to.exist;
    expect(iframeWin.__AMP_EXTENDED_ELEMENTS['amp-img']).to.exist;
    expect(iframeWin.__AMP_EXTENDED_ELEMENTS['amp-img']).to.not.equal(
      ElementStub
    );
    expect(iframeWin.__AMP_EXTENDED_ELEMENTS['amp-pixel']).to.exist;
    expect(iframeWin.__AMP_EXTENDED_ELEMENTS['amp-pixel']).to.not.equal(
      ElementStub
    );
    // Legacy elements are installed as well.
    expect(iframeWin.__AMP_EXTENDED_ELEMENTS['amp-ad']).to.equal(ElementStub);
    expect(iframeWin.__AMP_EXTENDED_ELEMENTS['amp-embed']).to.equal(
      ElementStub
    );
    expect(iframeWin.__AMP_EXTENDED_ELEMENTS['amp-video']).to.equal(
      ElementStub
    );
  });

  it('should adopt standard services', () => {
    fie.installExtensionsInChildWindow(extensions, iframeWin, []);

    const any = {}; // Input doesn't matter since services are stubbed.
    const url = Services.urlForDoc(any);
    const actions = Services.actionServiceForDoc(any);
    const standardActions = Services.standardActionsForDoc(any);
    const navigation = Services.navigationForDoc(any);

    expect(url.constructor.installInEmbedWindow).to.be.called;
    expect(actions.constructor.installInEmbedWindow).to.be.called;
    expect(standardActions.constructor.installInEmbedWindow).to.be.called;
    expect(navigation.constructor.installInEmbedWindow).to.be.called;

    expect(getService(iframeWin, 'timer')).to.exist;
  });

  it('should install extensions in child window', () => {
    const extHolder = extensions.getExtensionHolder_('amp-test');
    extHolder.scriptPresent = true;
    const promise = fie.installExtensionsInChildWindow(extensions, iframeWin, [
      'amp-test',
    ]);
    // Must be stubbed already.
    expect(iframeWin.__AMP_EXTENDED_ELEMENTS['amp-test']).to.equal(ElementStub);
    expect(
      iframeWin.document.createElement('amp-test').implementation_
    ).to.be.instanceOf(ElementStub);
    expect(iframeWin.__AMP_EXTENDED_ELEMENTS['amp-test-sub']).to.be.undefined;
    // Resolve the promise.
    extensions.registerExtension(
      'amp-test',
      AMP => {
        // Main extension with CSS.
        AMP.registerElement('amp-test', AmpTest, 'a{}');
        // Secondary extension w/o CSS.
        AMP.registerElement('amp-test-sub', AmpTestSub);
      },
      parentWin.AMP
    );
    return promise.then(() => {
      // Main extension.
      expect(parentWin.__AMP_EXTENDED_ELEMENTS['amp-test']).to.be.undefined;
      expect(iframeWin.__AMP_EXTENDED_ELEMENTS['amp-test']).to.equal(AmpTest);
      expect(iframeWin.document.querySelector('style[amp-extension=amp-test]'))
        .to.exist;
      // Must be upgraded already.
      expect(
        iframeWin.document.createElement('amp-test').implementation_
      ).to.be.instanceOf(AmpTest);

      // Secondary extension.
      expect(parentWin.__AMP_EXTENDED_ELEMENTS['amp-test-sub']).to.be.undefined;
      expect(iframeWin.__AMP_EXTENDED_ELEMENTS['amp-test-sub']).to.equal(
        AmpTestSub
      );
      expect(
        iframeWin.document.querySelector('style[amp-extension=amp-test-sub]')
      ).to.not.exist;
      // Must be upgraded already.
      expect(
        iframeWin.document.createElement('amp-test-sub').implementation_
      ).to.be.instanceOf(AmpTestSub);
    });
  });

  it('should adopt extension services', () => {
    class FooService {
      static installInEmbedWindow() {}
    }
    sandbox.stub(FooService, 'installInEmbedWindow');
    registerServiceBuilder(
      parentWin,
      'fake-service-foo',
      FooService,
      /* opt_instantiate */ true
    );

    class BarService {
      static installInEmbedWindow() {}
    }
    sandbox.stub(BarService, 'installInEmbedWindow');
    registerServiceBuilder(
      parentWin,
      'fake-service-bar',
      BarService,
      /* opt_instantiate */ true
    );

    const extHolder = extensions.getExtensionHolder_('amp-test');
    extHolder.scriptPresent = true;
    const install = fie.installExtensionsInChildWindow(extensions, iframeWin, [
      'amp-test',
    ]);

    // Resolve the promise `install`.
    extensions.registerExtension(
      'amp-test',
      AMP => {
        AMP.registerServiceForDoc('fake-service-foo', FooService);
      },
      parentWin.AMP
    );

    return install.then(() => {
      expect(FooService.installInEmbedWindow).calledOnce;
      expect(BarService.installInEmbedWindow).to.not.be.called;
    });
  });

  // TODO(#16916): Make this test work with synchronous throws.
  it.skip('should call pre-install callback before other installs', () => {
    let preinstallCount = 0;
    const extHolder = extensions.getExtensionHolder_('amp-test');
    extHolder.scriptPresent = true;
    const promise = fie.installExtensionsInChildWindow(
      extensions,
      iframeWin,
      ['amp-test'],
      function() {
        // Built-ins not installed yet.
        expect(
          iframeWin.__AMP_EXTENDED_ELEMENTS &&
            iframeWin.__AMP_EXTENDED_ELEMENTS['amp-img']
        ).to.not.exist;
        // Extension is not loaded yet.
        expect(
          iframeWin.__AMP_EXTENDED_ELEMENTS &&
            iframeWin.__AMP_EXTENDED_ELEMENTS['amp-test']
        ).to.not.exist;
        preinstallCount++;
      }
    );
    expect(preinstallCount).to.equal(1);
    expect(iframeWin.__AMP_EXTENDED_ELEMENTS).to.exist;
    expect(iframeWin.__AMP_EXTENDED_ELEMENTS['amp-img']).to.exist;
    expect(iframeWin.__AMP_EXTENDED_ELEMENTS['amp-img']).to.not.equal(
      ElementStub
    );
    expect(iframeWin.__AMP_EXTENDED_ELEMENTS['amp-test']).to.equal(ElementStub);

    // Resolve the promise.
    extensions.registerExtension(
      'amp-test',
      AMP => {
        AMP.registerElement('amp-test', AmpTest);
      },
      parentWin.AMP
    );
    return promise.then(() => {
      // Extension elements are stubbed immediately, but registered only
      // after extension is loaded.
      expect(iframeWin.__AMP_EXTENDED_ELEMENTS['amp-test']).to.equal(AmpTest);
    });
  });

  describe('installStandardServicesInEmbed', () => {
    it('verify order of adopted services for embed', () => {
      installStandardServicesInEmbed(iframeWin);

      const any = {}; // Input doesn't matter since services are stubbed.
      const url = Services.urlForDoc(any);
      const actions = Services.actionServiceForDoc(any);
      const standardActions = Services.standardActionsForDoc(any);
      const navigation = Services.navigationForDoc(any);

      // Expected order: url, action, standard-actions, navigation, timer.
      const one = url.constructor.installInEmbedWindow;
      const two = actions.constructor.installInEmbedWindow;
      const three = standardActions.constructor.installInEmbedWindow;
      const four = navigation.constructor.installInEmbedWindow;

      expect(one).to.be.calledBefore(two);
      expect(two).to.be.calledBefore(three);
      expect(three).to.be.calledBefore(four);
      expect(four).to.be.called;
    });
  });
});

describes.realWin('installExtensionsInFie', {amp: true}, env => {
  let parentWin;
  let extensions;
  let extensionsMock;
  let iframe;
  let iframeWin, iframeDocEl;
  let ampdoc;
  let fie;

  beforeEach(() => {
    parentWin = env.win;
    toggleExperiment(parentWin, 'ampdoc-fie', true);
    resetScheduledElementForTesting(parentWin, 'amp-test');
    installExtensionsService(parentWin);
    extensions = Services.extensionsFor(parentWin);
    extensionsMock = sandbox.mock(extensions);
    const ampdocService = Services.ampdocServiceFor(parentWin);
    updateFieModeForTesting(ampdocService, true);

    iframe = parentWin.document.createElement('iframe');
    const promise = loadPromise(iframe);
    const html = '<div id="one"></div>';
    if ('srcdoc' in iframe) {
      iframe.srcdoc = html;
    } else {
      iframe.src = 'about:blank';
      const childDoc = iframe.contentWindow.document;
      childDoc.open();
      childDoc.write(html);
      childDoc.close();
    }
    parentWin.document.body.appendChild(iframe);
    fie = new FriendlyIframeEmbed(
      iframe,
      {
        url: 'https://acme.org/url1',
        html: '<body></body>',
      },
      Promise.resolve(),
      env.ampdoc
    );
    return promise.then(() => {
      iframeWin = iframe.contentWindow;
      iframeDocEl = iframeWin.document.documentElement;
      setParentWindow(iframeWin, parentWin);
      ampdoc = ampdocService.installFieDoc(
        'https://example.com/embed',
        iframeWin
      );
    });
  });

  afterEach(() => {
    toggleExperiment(parentWin, 'ampdoc-fie', false);
    if (iframe.parentElement) {
      iframe.parentElement.removeChild(iframe);
    }
    extensionsMock.verify();
  });

  it('should set window hierarchy', () => {
    fie.installExtensionsInFie(extensions, ampdoc, []);
    expect(iframeWin.__AMP_PARENT).to.equal(parentWin);
    expect(iframeWin.__AMP_TOP).to.equal(parentWin);
  });

  it('should install runtime styles', () => {
    fie.installExtensionsInFie(extensions, ampdoc, []);
    expect(iframeWin.document.querySelector('style[amp-runtime]')).to.exist;
  });

  it('should install built-ins', () => {
    fie.installExtensionsInFie(extensions, ampdoc, []);
    expect(iframeWin.__AMP_EXTENDED_ELEMENTS).to.exist;
    expect(iframeWin.__AMP_EXTENDED_ELEMENTS['amp-img']).to.exist;
    expect(iframeWin.__AMP_EXTENDED_ELEMENTS['amp-img']).to.not.equal(
      ElementStub
    );
    expect(iframeWin.__AMP_EXTENDED_ELEMENTS['amp-pixel']).to.exist;
    expect(iframeWin.__AMP_EXTENDED_ELEMENTS['amp-pixel']).to.not.equal(
      ElementStub
    );
    // Legacy elements are installed as well.
    expect(iframeWin.__AMP_EXTENDED_ELEMENTS['amp-ad']).to.equal(ElementStub);
    expect(iframeWin.__AMP_EXTENDED_ELEMENTS['amp-embed']).to.equal(
      ElementStub
    );
    expect(iframeWin.__AMP_EXTENDED_ELEMENTS['amp-video']).to.equal(
      ElementStub
    );
  });

  it('should create new standard services', () => {
    fie.installExtensionsInFie(extensions, ampdoc, []);

    const url = Services.urlForDoc(iframeDocEl);
    const actions = Services.actionServiceForDoc(iframeDocEl);
    const standardActions = Services.standardActionsForDoc(iframeDocEl);
    const navigation = Services.navigationForDoc(iframeDocEl);

    expect(url).to.exist;
    expect(actions).to.exist;
    expect(standardActions).to.exist;
    expect(navigation).to.exist;
    expect(Services.timerFor(iframeWin)).to.exist;

    const parentUrl = Services.urlForDoc(parentWin.document.head);
    expect(parentUrl).to.exist;
    expect(url).to.not.equal(parentUrl);
  });

  it('should adopt parent standard services', () => {
    fie.installExtensionsInFie(extensions, ampdoc, []);

    const viewer = Services.urlForDoc(iframeDocEl);
    const parentViewer = Services.urlForDoc(parentWin.document.head);
    expect(viewer).to.exist;
    expect(parentViewer).to.exist;
    expect(viewer).to.not.equal(parentViewer);
  });

  it('should install extensions in child window', () => {
    const extHolder = extensions.getExtensionHolder_('amp-test');
    extHolder.scriptPresent = true;
    const promise = fie.installExtensionsInFie(extensions, ampdoc, [
      'amp-test',
    ]);
    // Must be stubbed already.
    expect(iframeWin.__AMP_EXTENDED_ELEMENTS['amp-test']).to.equal(ElementStub);
    expect(
      iframeWin.document.createElement('amp-test').implementation_
    ).to.be.instanceOf(ElementStub);
    expect(iframeWin.__AMP_EXTENDED_ELEMENTS['amp-test-sub']).to.be.undefined;
    // Resolve the promise.
    extensions.registerExtension(
      'amp-test',
      AMP => {
        // Main extension with CSS.
        AMP.registerElement('amp-test', AmpTest, 'a{}');
        // Secondary extension w/o CSS.
        AMP.registerElement('amp-test-sub', AmpTestSub);
      },
      parentWin.AMP
    );
    return promise.then(() => {
      // Main extension.
      expect(parentWin.__AMP_EXTENDED_ELEMENTS['amp-test']).to.be.undefined;
      expect(iframeWin.__AMP_EXTENDED_ELEMENTS['amp-test']).to.equal(AmpTest);
      expect(iframeWin.document.querySelector('style[amp-extension=amp-test]'))
        .to.exist;
      // Must be upgraded already.
      expect(
        iframeWin.document.createElement('amp-test').implementation_
      ).to.be.instanceOf(AmpTest);

      // Secondary extension.
      expect(parentWin.__AMP_EXTENDED_ELEMENTS['amp-test-sub']).to.be.undefined;
      expect(iframeWin.__AMP_EXTENDED_ELEMENTS['amp-test-sub']).to.equal(
        AmpTestSub
      );
      expect(
        iframeWin.document.querySelector('style[amp-extension=amp-test-sub]')
      ).to.not.exist;
      // Must be upgraded already.
      expect(
        iframeWin.document.createElement('amp-test-sub').implementation_
      ).to.be.instanceOf(AmpTestSub);
    });
  });

  it('should adopt extension services', () => {
    const fooConstructorSpy = sandbox.spy();
    class FooService {
      constructor(arg) {
        fooConstructorSpy(arg);
      }
    }
    registerServiceBuilder(
      parentWin,
      'fake-service-foo',
      FooService,
      /* opt_instantiate */ false
    );

    const barConstructorSpy = sandbox.spy();
    class BarService {
      constructor(arg) {
        barConstructorSpy(arg);
      }
    }
    registerServiceBuilder(
      parentWin,
      'fake-service-bar',
      BarService,
      /* opt_instantiate */ false
    );

    const extHolder = extensions.getExtensionHolder_('amp-test');
    extHolder.scriptPresent = true;
    const install = fie.installExtensionsInFie(extensions, ampdoc, [
      'amp-test',
    ]);

    // Resolve the promise `install`.
    extensions.registerExtension(
      'amp-test',
      AMP => {
        AMP.registerServiceForDoc('fake-service-foo', FooService);
      },
      parentWin.AMP
    );

    return install.then(() => {
      expect(fooConstructorSpy).calledOnce.calledWith(ampdoc);
      expect(barConstructorSpy).to.not.be.called;
    });
  });

  it('should call pre-install callback before other installs', () => {
    let preinstallCount = 0;
    const extHolder = extensions.getExtensionHolder_('amp-test');
    extHolder.scriptPresent = true;
    const promise = fie.installExtensionsInFie(
      extensions,
      ampdoc,
      ['amp-test'],
      function(winArg, ampdocArg) {
        expect(winArg).to.equal(iframeWin);
        expect(ampdocArg).to.equal(ampdoc);
        // Built-ins not installed yet.
        expect(
          iframeWin.__AMP_EXTENDED_ELEMENTS &&
            iframeWin.__AMP_EXTENDED_ELEMENTS['amp-img']
        ).to.not.exist;
        // Extension is not loaded yet.
        expect(
          iframeWin.__AMP_EXTENDED_ELEMENTS &&
            iframeWin.__AMP_EXTENDED_ELEMENTS['amp-test']
        ).to.not.exist;
        preinstallCount++;
      }
    );
    expect(preinstallCount).to.equal(1);
    expect(iframeWin.__AMP_EXTENDED_ELEMENTS).to.exist;
    expect(iframeWin.__AMP_EXTENDED_ELEMENTS['amp-img']).to.exist;
    expect(iframeWin.__AMP_EXTENDED_ELEMENTS['amp-img']).to.not.equal(
      ElementStub
    );
    expect(iframeWin.__AMP_EXTENDED_ELEMENTS['amp-test']).to.equal(ElementStub);

    // Resolve the promise.
    extensions.registerExtension(
      'amp-test',
      AMP => {
        AMP.registerElement('amp-test', AmpTest);
      },
      parentWin.AMP
    );
    return promise.then(() => {
      // Extension elements are stubbed immediately, but registered only
      // after extension is loaded.
      expect(iframeWin.__AMP_EXTENDED_ELEMENTS['amp-test']).to.equal(AmpTest);
    });
  });
});
