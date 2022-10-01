import {Deferred} from '#core/data-structures/promise';
import {Signals} from '#core/data-structures/signals';
import {layoutRectLtwh} from '#core/dom/layout/rect';
import {setStyles} from '#core/dom/style';

import {Services} from '#service';
import {AmpDocFie} from '#service/ampdoc-impl';
import {resetScheduledElementForTesting} from '#service/custom-element-registry';
import {installExtensionsService} from '#service/extensions-impl';

import {loadPromise} from '#utils/event-helper';

import {FakeWindow} from '#testing/fake-dom';
import {isAnimationNone} from '#testing/helpers/service';

import {BaseElement} from '../../src/base-element';
import {ElementStub} from '../../src/element-stub';
import {
  FriendlyIframeEmbed,
  Installers,
  installFriendlyIframeEmbed,
  mergeHtmlForTesting,
  preloadFriendlyIframeEmbedExtensions,
  setSrcdocSupportedForTesting,
} from '../../src/friendly-iframe-embed';
import {getFriendlyIframeEmbedOptional} from '../../src/iframe-helper';
import {
  getServiceInEmbedWin,
  registerServiceBuilder,
  registerServiceBuilderInEmbedWin,
  setParentWindow,
} from '../../src/service-helpers';

describes.realWin('friendly-iframe-embed', {amp: true}, (env) => {
  let window, document;
  let iframe;
  let extensionsMock;
  let resourcesMock;
  let ampdocServiceMock;
  let customElementsDefineStub;
  let installServicesStub;
  let preinstallCallback, preinstallCallbackSpy;

  beforeEach(() => {
    window = env.win;
    document = window.document;

    const extensions = Services.extensionsFor(window);
    const resources = Services.resourcesForDoc(document);
    const ampdocService = {
      getAmpDoc: () => env.ampdoc,
      installFieDoc: (url, childWin, options) =>
        new AmpDocFie(childWin, url, env.ampdoc, options),
    };
    extensionsMock = env.sandbox.mock(extensions);
    resourcesMock = env.sandbox.mock(resources);
    ampdocServiceMock = env.sandbox.mock(ampdocService);
    env.sandbox
      .stub(Services, 'ampdocServiceFor')
      .callsFake(() => ampdocService);

    iframe = document.createElement('iframe');

    customElementsDefineStub = null;
    preinstallCallbackSpy = env.sandbox.spy();
    preinstallCallback = (win, ampdoc) => {
      preinstallCallbackSpy(win, ampdoc);
      customElementsDefineStub = env.sandbox.stub(win.customElements, 'define');
    };

    installServicesStub = env.sandbox.stub(
      Installers,
      'installStandardServicesInEmbed'
    );
  });

  afterEach(() => {
    if (iframe.parentElement) {
      iframe.parentElement.removeChild(iframe);
    }
    extensionsMock.verify();
    resourcesMock.verify();
    ampdocServiceMock.verify();
    setSrcdocSupportedForTesting(undefined);
  });

  function stubViewportScrollTop(scrollTop) {
    env.sandbox.stub(Services, 'viewportForDoc').returns({
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
      extensions: [],
    });

    // Attributes set.
    expect(iframe.style.visibility).to.equal('hidden');
    expect(iframe.getAttribute('referrerpolicy')).to.equal('unsafe-url');
    expect(iframe.getAttribute('marginheight')).to.equal('0');
    expect(iframe.getAttribute('marginwidth')).to.equal('0');

    // Iframe has been appended to DOM.
    expect(iframe.parentElement).to.equal(document.body);

    return embedPromise
      .then((embed) => {
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

        // Check that extensions-known has been set.
        return embed.ampdoc.whenExtensionsKnown();
      })
      .then(() => loadPromise(iframe))
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

    return embedPromise.then((embed) => {
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
    // AmpDoc is created.
    const ampdocSignals = new Signals();
    let childWinForAmpDoc;
    const ampdoc = {
      get win() {
        return childWinForAmpDoc;
      },
      getParent: () => env.ampdoc,
      setReady: env.sandbox.spy(),
      signals: () => ampdocSignals,
      getHeadNode: () => childWinForAmpDoc.document.head,
      setExtensionsKnown: env.sandbox.stub(),
    };
    ampdocServiceMock
      .expects('installFieDoc')
      .withExactArgs(
        'https://acme.org/url1',
        env.sandbox.match((arg) => {
          // Match childWin argument.
          childWinForAmpDoc = arg;
          return true;
        }),
        env.sandbox.match((arg) => {
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
      .withExactArgs('amp-test', '0.2')
      .returns(Promise.resolve())
      .once();
    extensionsMock
      .expects('preinstallEmbed')
      .withExactArgs(ampdoc, [
        {extensionId: 'amp-test', extensionVersion: '0.2'},
      ])
      .once();
    extensionsMock
      .expects('installExtensionsInDoc')
      .withExactArgs(ampdoc, [
        {extensionId: 'amp-test', extensionVersion: '0.2'},
      ])
      .returns(Promise.resolve())
      .once();

    let renderCompleteResolver = null;
    const renderCompletePromise = new Promise((resolve) => {
      renderCompleteResolver = resolve;
    });
    env.sandbox
      .stub(FriendlyIframeEmbed.prototype, 'whenRenderComplete')
      .callsFake(() => renderCompletePromise);

    const embedPromise = installFriendlyIframeEmbed(
      iframe,
      document.body,
      {
        url: 'https://acme.org/url1',
        html: '<amp-test></amp-test>',
        extensions: [{extensionId: 'amp-test', extensionVersion: '0.2'}],
      },
      preinstallCallback
    );
    return embedPromise
      .then((embed) => {
        expect(childWinForAmpDoc).to.equal(embed.win);
        expect(ampdoc).to.equal(embed.ampdoc);
        expect(installServicesStub).to.be.calledOnce.calledWith(ampdoc);
        expect(ampdoc.setReady).to.not.be.called;

        // Check that extensions-known has been set.
        expect(embed.ampdoc.setExtensionsKnown).to.be.calledOnce;

        // Complete rendering.
        renderCompleteResolver();
        return renderCompletePromise;
      })
      .then(() => {
        expect(ampdoc.setReady).to.be.calledOnce;
      });
  });

  it('should create ampdoc and install extensions with host', () => {
    // host.
    const hostSignals = new Signals();
    const host = document.createElement('div');
    host.signals = () => hostSignals;
    host.renderStarted = env.sandbox.spy();
    host.getLayoutBox = () => layoutRectLtwh(10, 10, 100, 200);

    // AmpDoc is created.
    let ampdocSignals = null;
    const ampdoc = {
      get win() {
        return childWinForAmpDoc;
      },
      getParent: () => env.ampdoc,
      setReady: env.sandbox.spy(),
      signals: () => ampdocSignals,
      getHeadNode: () => childWinForAmpDoc.document.head,
      setExtensionsKnown: env.sandbox.stub(),
    };
    let childWinForAmpDoc;
    ampdocServiceMock
      .expects('installFieDoc')
      .withExactArgs(
        'https://acme.org/url1',
        env.sandbox.match((arg) => {
          // Match childWin argument.
          childWinForAmpDoc = arg;
          return true;
        }),
        env.sandbox.match((arg) => {
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
      .withExactArgs('amp-test', 'latest')
      .returns(Promise.resolve())
      .once();
    extensionsMock
      .expects('preinstallEmbed')
      .withExactArgs(ampdoc, [
        {extensionId: 'amp-test', extensionVersion: 'latest'},
      ])
      .once();
    extensionsMock
      .expects('installExtensionsInDoc')
      .withExactArgs(ampdoc, [
        {extensionId: 'amp-test', extensionVersion: 'latest'},
      ])
      .returns(Promise.resolve())
      .once();

    let renderCompleteResolver = null;
    const renderCompletePromise = new Promise((resolve) => {
      renderCompleteResolver = resolve;
    });
    env.sandbox
      .stub(FriendlyIframeEmbed.prototype, 'whenRenderComplete')
      .callsFake(() => renderCompletePromise);

    const embedPromise = installFriendlyIframeEmbed(
      iframe,
      document.body,
      {
        url: 'https://acme.org/url1',
        html: '<amp-test></amp-test>',
        extensions: [{extensionId: 'amp-test', extensionVersion: 'latest'}],
        host,
      },
      preinstallCallback
    );
    return embedPromise
      .then((embed) => {
        expect(childWinForAmpDoc).to.equal(embed.win);
        expect(ampdoc).to.equal(embed.ampdoc);
        expect(installServicesStub).to.be.calledOnce.calledWith(ampdoc);
        expect(ampdoc.setReady).to.not.be.called;
        renderCompleteResolver();
        return renderCompletePromise;
      })
      .then(() => {
        expect(ampdoc.setReady).to.be.calledOnce;
        expect(host.renderStarted).to.be.calledOnce;
        expect(ampdoc.signals()).to.equal(hostSignals);
      });
  });

  it('should install extensions', async () => {
    // Extensions preloading have been requested.
    extensionsMock
      .expects('preloadExtension')
      .withExactArgs('amp-test', 'latest')
      .returns(Promise.resolve())
      .atLeast(1);

    await installFriendlyIframeEmbed(
      iframe,
      document.body,
      {
        url: 'https://acme.org/url1',
        html: '<amp-test></amp-test>',
        extensions: [{extensionId: 'amp-test', extensionVersion: 'latest'}],
      },
      preinstallCallback
    );
    expect(customElementsDefineStub.callCount).to.be.above(0);
    expect(customElementsDefineStub).to.be.calledWith('amp-img');
    expect(customElementsDefineStub).to.be.calledWith('amp-test');
  });

  it('should install and dispose services', () => {
    const disposeSpy = env.sandbox.spy();
    const embedService = {
      dispose: disposeSpy,
    };
    const embedPromise = installFriendlyIframeEmbed(
      iframe,
      document.body,
      {
        url: 'https://acme.org/url1',
        html: '<amp-test></amp-test>',
        extensions: [],
      },
      (embedWin) => {
        registerServiceBuilderInEmbedWin(embedWin, 'c', function () {
          return embedService;
        });
      }
    );
    return embedPromise.then((embed) => {
      expect(getServiceInEmbedWin(embed.win, 'c')).to.equal(embedService);
      expect(disposeSpy).to.not.be.called;
      embed.destroy();
      expect(disposeSpy).to.be.calledOnce;
    });
  });

  it('should pause and resume FIE using ampdoc visibility', async () => {
    // AmpDoc is created.
    const ampdocSignals = new Signals();
    let childWinForAmpDoc;
    const ampdoc = {
      get win() {
        return childWinForAmpDoc;
      },
      getParent: () => env.ampdoc,
      setReady: env.sandbox.spy(),
      signals: () => ampdocSignals,
      getHeadNode: () => childWinForAmpDoc.document.head,
      setExtensionsKnown: env.sandbox.stub(),
      overrideVisibilityState: env.sandbox.spy(),
      dispose: env.sandbox.spy(),
    };
    ampdocServiceMock
      .expects('installFieDoc')
      .withExactArgs(
        'https://acme.org/url1',
        env.sandbox.match((arg) => {
          // Match childWin argument.
          childWinForAmpDoc = arg;
          return true;
        }),
        env.sandbox.match(() => true)
      )
      .returns(ampdoc)
      .once();

    env.sandbox
      .stub(FriendlyIframeEmbed.prototype, 'whenRenderStarted')
      .returns(Promise.resolve());

    const embed = await installFriendlyIframeEmbed(
      iframe,
      document.body,
      {
        url: 'https://acme.org/url1',
        html: '',
        extensions: [],
      },
      preinstallCallback
    );

    embed.pause();
    expect(ampdoc.overrideVisibilityState).to.be.calledOnce.calledWith(
      'paused'
    );

    embed.resume();
    expect(ampdoc.overrideVisibilityState).to.be.calledTwice.calledWith(
      'visible'
    );
  });

  it('should signal fie doc ready during install when not streaming', async () => {
    const setReadySpy = env.sandbox.spy(AmpDocFie.prototype, 'setReady');
    await installFriendlyIframeEmbed(
      iframe,
      document.body,
      {
        url: 'https://acme.test/url1',
        html: '<amp-test></amp-test>',
        extensions: [{extensionId: 'amp-test', extensionVersion: 'latest'}],
      },
      preinstallCallback
    );
    expect(setReadySpy).to.be.called;
  });

  it('should wait complete streaming before signaling fie doc ready', async () => {
    const setReadySpy = env.sandbox.spy(AmpDocFie.prototype, 'setReady');
    const fie = await installFriendlyIframeEmbed(
      iframe,
      document.body,
      {
        url: 'https://acme.test/url1',
        html: '<amp-test></amp-test>',
        extensions: [{extensionId: 'amp-test', extensionVersion: 'latest'}],
        skipHtmlMerge: true,
      },
      preinstallCallback
    );
    expect(setReadySpy).not.to.be.called;
    await fie.renderCompleted();
    expect(setReadySpy).to.be.called;
  });

  it('should dispose ampdoc', () => {
    // AmpDoc is created.
    const ampdocSignals = new Signals();
    let childWinForAmpDoc;
    const ampdoc = {
      get win() {
        return childWinForAmpDoc;
      },
      getParent: () => env.ampdoc,
      setReady: env.sandbox.spy(),
      signals: () => ampdocSignals,
      getHeadNode: () => childWinForAmpDoc.document.head,
      setExtensionsKnown: env.sandbox.stub(),
      dispose: env.sandbox.spy(),
    };
    ampdocServiceMock
      .expects('installFieDoc')
      .withExactArgs(
        'https://acme.org/url1',
        env.sandbox.match((arg) => {
          // Match childWin argument.
          childWinForAmpDoc = arg;
          return true;
        }),
        env.sandbox.match(() => true)
      )
      .returns(ampdoc)
      .once();

    // Extensions preloading have been requested.
    extensionsMock
      .expects('preloadExtension')
      .withExactArgs('amp-test', 'latest')
      .returns(Promise.resolve())
      .once();
    extensionsMock
      .expects('preinstallEmbed')
      .withExactArgs(ampdoc, [
        {extensionId: 'amp-test', extensionVersion: 'latest'},
      ])
      .once();
    extensionsMock
      .expects('installExtensionsInDoc')
      .withExactArgs(ampdoc, [
        {extensionId: 'amp-test', extensionVersion: 'latest'},
      ])
      .returns(Promise.resolve())
      .once();

    env.sandbox
      .stub(FriendlyIframeEmbed.prototype, 'whenRenderStarted')
      .returns(Promise.resolve());

    const embedPromise = installFriendlyIframeEmbed(
      iframe,
      document.body,
      {
        url: 'https://acme.org/url1',
        html: '<amp-test></amp-test>',
        extensions: [{extensionId: 'amp-test', extensionVersion: 'latest'}],
      },
      preinstallCallback
    );
    return embedPromise
      .then((embed) => {
        expect(installServicesStub).to.be.calledOnce.calledWith(ampdoc);
        embed.destroy();
      })
      .then(() => {
        expect(ampdoc.dispose).to.be.calledOnce;
      });
  });

  it.skip('should support host', () => {
    const host = document.createElement('amp-host');
    const hostSignals = new Signals();
    host.signals = () => hostSignals;
    host.renderStarted = env.sandbox.spy();
    host.getLayoutBox = () => layoutRectLtwh(10, 10, 100, 200);
    const embedPromise = installFriendlyIframeEmbed(iframe, document.body, {
      url: 'https://acme.org/url1',
      html: '<amp-test></amp-test>',
      host,
    });
    return embedPromise.then((embed) => {
      expect(embed.host).to.equal(host);
      expect(embed.signals()).to.equal(hostSignals);
      expect(host.renderStarted).to.be.calledOnce;
    });
  });

  it.skip('should await initial load', () => {
    resourcesMock
      .expects('getResourcesInRect')
      .withExactArgs(
        env.sandbox.match((arg) => arg == iframe.contentWindow),
        env.sandbox.match(
          (arg) =>
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
      .then((em) => {
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
    host.renderStarted = function () {
      hostSignals.signal('render-start');
    };
    host.getLayoutBox = () => rect;
    resourcesMock
      .expects('getResourcesInRect')
      .withExactArgs(
        env.sandbox.match((arg) => arg == iframe.contentWindow),
        env.sandbox.match(
          (arg) =>
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
      .then((em) => {
        embed = em;
        return embed.whenIniLoaded();
      })
      .then(() => {
        expect(embed.signals().get('ini-load')).to.be.ok;
        return embed.whenReady(); // `whenReady` should also be complete.
      });
  });

  it('should call for remeasure upon resize', async () => {
    const iframe = document.createElement('iframe');
    const {promise, resolve} = new Deferred();

    await installFriendlyIframeEmbed(iframe, document.body, {
      url: 'https://acme.org/url1',
      html: '<a id="a1"></a>',
      extensions: [],
    });

    const mutateSpy = env.sandbox.stub(
      Services.mutatorForDoc(env.ampdoc),
      'mutateElement'
    );
    expect(mutateSpy).to.not.be.called;
    setStyles(iframe, {height: '100px', width: '100px'});
    // Need to wait for resize event.
    iframe.contentWindow.addEventListener('resize', () => {
      resolve();
    });
    await promise;
    expect(mutateSpy).to.be.called;
  });

  it('should preload versioned extensions', () => {
    extensionsMock
      .expects('preloadExtension')
      .withExactArgs('amp-ext1', '0.2')
      .once();
    extensionsMock
      .expects('preloadExtension')
      .withExactArgs('amp-ext2', '0.3')
      .once();
    preloadFriendlyIframeEmbedExtensions(window, [
      {extensionId: 'amp-ext1', extensionVersion: '0.2'},
      {extensionId: 'amp-ext2', extensionVersion: '0.3'},
    ]);
  });

  describe('mergeHtml', () => {
    let spec;

    beforeEach(() => {
      spec = {
        url: 'https://acme.org/embed1',
        html: '<a></a>',
      };
    });

    function extractScriptSrc(html) {
      const beg = html.indexOf('script-src');
      const end = html.indexOf(';', beg + 1);
      if (beg == -1 || end == -1) {
        throw new Error('script-src not found');
      }
      return html.substring(beg + 'script-src'.length, end).trim();
    }

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
      expect(html).to.contain('<base href="https://acme.org/embed1">');
      expect(html).to.contain(
        '<meta http-equiv=Content-Security-Policy content='
      );
      expect(html).to.contain("object-src 'none';child-src 'none'");
      expect(html).to.contain("child-src 'none'\"><a></a>");
    });

    it('should insert into head', () => {
      spec.html = '<html><head>head</head><body>body';
      const html = mergeHtmlForTesting(spec);
      expect(html).to.contain(
        '<html><head><base href="https://acme.org/embed1">' +
          '<meta http-equiv=Content-Security-Policy content='
      );
      expect(html).to.contain("child-src 'none'\">head</head><body>body");
    });

    it('should insert into head w/o html', () => {
      spec.html = '<head>head</head><body>body';
      const html = mergeHtmlForTesting(spec);
      expect(html).to.contain(
        '<head><base href="https://acme.org/embed1">' +
          '<meta http-equiv=Content-Security-Policy content="script-src'
      );
      expect(html).to.contain(
        ";object-src 'none';child-src 'none'\">head</head><body>body"
      );
    });

    it('should insert before body', () => {
      spec.html = '<html><body>body';
      const html = mergeHtmlForTesting(spec);
      expect(html).to.contain(
        '<html><base href="https://acme.org/embed1">' +
          '<meta http-equiv=Content-Security-Policy content="script-src '
      );
      expect(html).to.contain(
        ";object-src 'none';child-src 'none'\"><body>body"
      );
    });

    it('should insert before body w/o html', () => {
      spec.html = '<body>body';
      const html = mergeHtmlForTesting(spec);
      expect(html).to.contain(
        '<base href="https://acme.org/embed1">' +
          '<meta http-equiv=Content-Security-Policy content="script-src '
      );
      expect(html).to.contain(
        ";object-src 'none';child-src 'none'\"><body>body"
      );
    });

    it('should insert after html', () => {
      spec.html = '<html>content';
      const html = mergeHtmlForTesting(spec);
      expect(html).to.contain(
        '<html><base href="https://acme.org/embed1">' +
          '<meta http-equiv=Content-Security-Policy content="script-src '
      );
      expect(html).to.contain(";object-src 'none';child-src 'none'\">content");
    });

    it('should insert CSP', () => {
      spec.html = '<html><head></head><body></body></html>';
      expect(mergeHtmlForTesting(spec)).to.contain(
        '<meta http-equiv=Content-Security-Policy content="script-src '
      );
      expect(mergeHtmlForTesting(spec)).to.contain(
        ";object-src 'none';" +
          "child-src 'none'\">" +
          '</head><body></body></html>'
      );
      spec.html = '<html>foo';
      expect(mergeHtmlForTesting(spec)).to.contain(
        '<html><base href="https://acme.org/embed1">' +
          '<meta http-equiv=Content-Security-Policy ' +
          'content="script-src '
      );
      expect(mergeHtmlForTesting(spec)).to.contain(
        ";object-src 'none';child-src 'none'\">foo"
      );
      spec.html = '<body>foo';
      expect(mergeHtmlForTesting(spec)).to.contain(
        '<base href="https://acme.org/embed1">' +
          '<meta http-equiv=Content-Security-Policy ' +
          'content="script-src '
      );
      expect(mergeHtmlForTesting(spec)).to.contain(
        ";object-src 'none';child-src 'none'\"><body>foo"
      );
    });

    it('should create the correct script-src CSP in dev mode', () => {
      env.sandbox.stub(self, '__AMP_MODE').value({localDev: true});
      spec.html = '<html><head></head><body></body></html>';
      const src = extractScriptSrc(mergeHtmlForTesting(spec));
      expect(src).to.equal(
        'http://localhost:8000/dist/lts/' +
          ' http://localhost:8000/dist/rtv/' +
          ' http://localhost:8000/dist/sw/'
      );
    });

    it('should create the correct script-src CSP in non-dev mode', () => {
      env.sandbox.stub(self, '__AMP_MODE').value({localDev: false});
      spec.html = '<html><head></head><body></body></html>';
      const src = extractScriptSrc(mergeHtmlForTesting(spec));
      expect(src).to.equal(
        'https://cdn.ampproject.org/lts/' +
          ' https://cdn.ampproject.org/rtv/' +
          ' https://cdn.ampproject.org/sw/'
      );
    });
  });

  describe.skip('child document ready and loaded states', () => {
    it('should wait until ready', () => {
      const embedPromise = installFriendlyIframeEmbed(iframe, document.body, {
        url: 'https://acme.org/url1',
        html: '<a id="a1"></a>',
        extensions: [],
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
        extensions: [],
      });
      return embedPromise.then(() => {
        expect(iframe.contentDocument.getElementById('a1')).to.be.ok;
      });
    });

    it('should wait for loaded state', () => {
      const embedPromise = installFriendlyIframeEmbed(iframe, document.body, {
        url: 'https://acme.org/url1',
        html: '<a id="a1"></a>',
        extensions: [],
      });
      return embedPromise.then((embed) => {
        return embed.whenWindowLoaded();
      });
    });

    it('should wait for loaded state for doc.write case', () => {
      setSrcdocSupportedForTesting(false);
      const embedPromise = installFriendlyIframeEmbed(iframe, document.body, {
        url: 'https://acme.org/url1',
        html: '<a id="a1"></a>',
        extensions: [],
      });
      return embedPromise.then((embed) => {
        return embed.whenWindowLoaded();
      });
    });

    it('should add violation listener', () => {
      let eventListenerSpy;
      const container = {
        appendChild: (child) => {
          document.body.appendChild(child);
          eventListenerSpy = env.sandbox.spy(
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
    let loadListener;
    let polls;
    let installStub;

    beforeEach(() => {
      setSrcdocSupportedForTesting(true);

      clock = env.sandbox.useFakeTimers();

      polls = [];
      win = new FakeWindow();
      Object.assign(win, {
        __AMP_SERVICES: {
          'extensions': {
            obj: {
              preloadExtension: () => {},
            },
            ctor: Object,
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
      });

      loadListener = undefined;
      iframe = {
        tagName: 'IFRAME',
        nodeType: 1,
        ownerDocument: {defaultView: win},
        style: {setProperty: () => {}},
        setAttribute: () => {},
        addEventListener: (eventType, listener) => {
          if (eventType == 'load') {
            loadListener = listener;
          }
        },
        removeEventListener: () => {},
      };
      contentWindow = new FakeWindow();
      contentDocument = contentWindow.document;
      contentWindow.frameElement = iframe;
      contentBody = {nodeType: 1, style: {setProperty: () => {}}};
      container = {
        appendChild: () => {},
      };

      installStub = env.sandbox
        .stub(Installers, 'installExtensionsInEmbed')
        .resolves();
    });

    afterEach(() => {
      expect(polls).to.have.length(0);
    });

    it('should poll until ready', () => {
      iframe.contentWindow = contentWindow;
      const embedPromise = installFriendlyIframeEmbed(
        iframe,
        container,
        {
          url: 'https://acme.org/url1',
          html: '<body></body>',
        },
        preinstallCallback
      );
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
          Object.defineProperty(contentDocument, 'body', {value: contentBody});
          clock.tick(5);
          return Promise.race([Promise.resolve(), embedPromise]);
        })
        .then(() => {
          expect(ready).to.be.false;
          expect(polls).to.have.length(1);

          // Body is now not empty.
          contentBody.firstChild = {};
          window.setInterval(() => {
            clock.tick(5);
          }, 5);
          return embedPromise;
        })
        .then(() => {
          expect(ready).to.equal(true, 'Finally ready');
          expect(polls).to.have.length(0);
        });
    });

    it('should stop polling when loaded', async () => {
      iframe.contentWindow = contentWindow;
      const embedPromise = installFriendlyIframeEmbed(iframe, container, {
        url: 'https://acme.org/url1',
        html: '<body></body>',
      });
      expect(polls).to.have.length(1);
      iframe.contentWindow = contentWindow;
      window.setInterval(() => {
        clock.tick(5);
      }, 5);
      loadListener();

      await embedPromise;
      expect(polls).to.have.length(0);
      expect(installStub).to.be.calledOnce;
    });
  });

  describe('full overlay mode', () => {
    const x = 10;
    const y = 500;
    const w = 400;
    const h = 300;

    const winW = 600;
    const winH = 800;

    const mutatorMock = {
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
      document.body.appendChild(parent);

      env.sandbox
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

      env.sandbox.stub(fie, 'getMutator_').returns(mutatorMock);
      env.sandbox.stub(fie, 'getBodyElement').returns(bodyElementMock);

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
      .run('resizes body and fixed container when entering', function* () {
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

    it('should reset body and fixed container when leaving', function* () {
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

describes.realWin('installExtensionsInEmbed', {amp: true}, (env) => {
  let parentWin;
  let extensions;
  let extensionsMock;
  let iframe;
  let iframeWin, iframeDocEl;
  let ampdoc;
  let fie;
  let startRender;
  let installComplete, installCompletePromise;

  beforeEach(async () => {
    parentWin = env.win;
    resetScheduledElementForTesting(parentWin, 'amp-test');
    installExtensionsService(parentWin);
    extensions = Services.extensionsFor(parentWin);
    extensionsMock = env.sandbox.mock(extensions);
    const ampdocService = Services.ampdocServiceFor(parentWin);

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

    startRender = env.sandbox.stub(fie, 'startRender_');
    installComplete = undefined;
    installCompletePromise = new Promise((resolve) => {
      installComplete = resolve;
    });

    // Wait for the iframe to load.
    await promise;
    iframeWin = iframe.contentWindow;
    iframeDocEl = iframeWin.document.documentElement;
    setParentWindow(iframeWin, parentWin);
    ampdoc = ampdocService.installFieDoc(
      'https://example.test/embed',
      iframeWin
    );
  });

  afterEach(() => {
    if (iframe.parentElement) {
      iframe.parentElement.removeChild(iframe);
    }
    extensionsMock.verify();
  });

  it('should set window hierarchy', async () => {
    await Installers.installExtensionsInEmbed(fie, extensions, ampdoc, []);
    expect(iframeWin.__AMP_PARENT).to.equal(parentWin);
    expect(iframeWin.__AMP_TOP).to.equal(parentWin);
    expect(startRender).to.be.calledOnce;
  });

  it('should install runtime styles', async () => {
    await Installers.installExtensionsInEmbed(fie, extensions, ampdoc, []);
    expect(iframeWin.document.querySelector('style[amp-runtime]')).to.exist;
  });

  it('should install built-ins', async () => {
    await Installers.installExtensionsInEmbed(fie, extensions, ampdoc, []);
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

  it('should create new standard services', async () => {
    await Installers.installExtensionsInEmbed(fie, extensions, ampdoc, []);

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

  it('should adopt parent standard services', async () => {
    await Installers.installExtensionsInEmbed(fie, extensions, ampdoc, []);

    const viewer = Services.urlForDoc(iframeDocEl);
    const parentViewer = Services.urlForDoc(parentWin.document.head);
    expect(viewer).to.exist;
    expect(parentViewer).to.exist;
    expect(viewer).to.not.equal(parentViewer);
  });

  it('should install extensions in child window', async () => {
    const extHolder = extensions.getExtensionHolder_('amp-test', 'latest');
    extHolder.scriptPresent = true;

    await Installers.installExtensionsInEmbed(
      fie,
      extensions,
      ampdoc,
      [{extensionId: 'amp-test', extensionVersion: 'latest'}],
      null,
      installComplete
    );

    // Must be stubbed already.
    expect(iframeWin.__AMP_EXTENDED_ELEMENTS['amp-test']).to.equal(ElementStub);
    expect(iframeWin.document.createElement('amp-test').implClass_).to.be.null;
    expect(iframeWin.__AMP_EXTENDED_ELEMENTS['amp-test-sub']).to.be.undefined;

    // Resolve the promise.
    extensions.registerExtension(
      'amp-test',
      '0.1',
      true,
      (AMP) => {
        // Main extension with CSS.
        AMP.registerElement('amp-test', AmpTest, 'a{}');
        // Secondary extension w/o CSS.
        AMP.registerElement('amp-test-sub', AmpTestSub);
      },
      parentWin.AMP
    );

    await installCompletePromise;

    // Main extension.
    expect(parentWin.__AMP_EXTENDED_ELEMENTS['amp-test']).to.be.undefined;
    expect(iframeWin.__AMP_EXTENDED_ELEMENTS['amp-test']).to.equal(AmpTest);
    expect(iframeWin.document.querySelector('style[amp-extension=amp-test]')).to
      .exist;
    // Must be upgraded already.
    expect(iframeWin.document.createElement('amp-test').implClass_).to.equal(
      AmpTest
    );

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
      iframeWin.document.createElement('amp-test-sub').implClass_
    ).to.equal(AmpTestSub);
  });

  it('should adopt extension services', async () => {
    const fooConstructorSpy = env.sandbox.spy();
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

    const barConstructorSpy = env.sandbox.spy();
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

    const extHolder = extensions.getExtensionHolder_('amp-test', 'latest');
    extHolder.scriptPresent = true;

    await Installers.installExtensionsInEmbed(
      fie,
      extensions,
      ampdoc,
      [{extensionId: 'amp-test', extensionVersion: 'latest'}],
      null,
      installComplete
    );

    // Resolve the promise `install`.
    extensions.registerExtension(
      'amp-test',
      '0.1',
      true,
      (AMP) => {
        AMP.registerServiceForDoc('fake-service-foo', FooService);
      },
      parentWin.AMP
    );

    await installCompletePromise;

    expect(fooConstructorSpy).calledOnce.calledWith(ampdoc);
    expect(barConstructorSpy).to.not.be.called;
  });

  it('should call pre-install callback before other installs', async () => {
    let preinstallCount = 0;
    const extHolder = extensions.getExtensionHolder_('amp-test', 'latest');
    extHolder.scriptPresent = true;

    await Installers.installExtensionsInEmbed(
      fie,
      extensions,
      ampdoc,
      [{extensionId: 'amp-test', extensionVersion: 'latest'}],
      function (winArg, ampdocArg) {
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
      },
      installComplete
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
      '0.1',
      true,
      (AMP) => {
        AMP.registerElement('amp-test', AmpTest);
      },
      parentWin.AMP
    );

    await installCompletePromise;

    // Extension elements are stubbed immediately, but registered only
    // after extension is loaded.
    expect(iframeWin.__AMP_EXTENDED_ELEMENTS['amp-test']).to.equal(AmpTest);
  });
});
