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

import {
  installFriendlyIframeEmbed,
  mergeHtmlForTesting,
  setSrcdocSupportedForTesting,
} from '../../src/friendly-iframe-embed';
import {getStyle} from '../../src/style';
import {extensionsFor} from '../../src/extensions';
import {installServiceInEmbedScope} from '../../src/service';
import {loadPromise} from '../../src/event-helper';
import {resourcesForDoc} from '../../src/resources';
import * as sinon from 'sinon';


describe('friendly-iframe-embed', () => {

  let sandbox;
  let iframe;
  let extensionsMock;
  let resourcesMock;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();

    const extensions = extensionsFor(window);
    const resources = resourcesForDoc(window.document);
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
    extensionsMock.expects('loadExtension').never();
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

      // Iframe is made visible again.
      expect(iframe.style.visibility).to.equal('');
      expect(embed.win.document.body.style.visibility).to.equal('visible');
      expect(String(embed.win.document.body.style.opacity)).to.equal('1');
      expect(getStyle(embed.win.document.body, 'animation')).to.equal('none');

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
    extensionsMock.expects('loadExtension')
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
    extensionsMock.expects('loadExtension').atLeast(1);
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
      expect(html).to.equal('<base href="https://acme.org/embed1"><a></a>');
    });

    it('should insert into head', () => {
      spec.html = '<html><head>head</head><body>body';
      const html = mergeHtmlForTesting(spec);
      expect(html).to.equal(
          '<html><head>'
          + '<base href="https://acme.org/embed1">'
          + 'head</head><body>body');
    });

    it('should insert into head w/o html', () => {
      spec.html = '<head>head</head><body>body';
      const html = mergeHtmlForTesting(spec);
      expect(html).to.equal(
          '<head>'
          + '<base href="https://acme.org/embed1">'
          + 'head</head><body>body');
    });

    it('should insert before body', () => {
      spec.html = '<html><body>body';
      const html = mergeHtmlForTesting(spec);
      expect(html).to.equal(
          '<html>'
          + '<base href="https://acme.org/embed1">'
          + '<body>body');
    });

    it('should insert before body w/o html', () => {
      spec.html = '<body>body';
      const html = mergeHtmlForTesting(spec);
      expect(html).to.equal(
          '<base href="https://acme.org/embed1">'
          + '<body>body');
    });

    it('should insert after html', () => {
      spec.html = '<html>content';
      const html = mergeHtmlForTesting(spec);
      expect(html).to.equal(
          '<html>'
          + '<base href="https://acme.org/embed1">'
          + 'content');
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
        return embed.whenLoaded();
      });
    });

    it('should wait for loaded state for doc.write case', () => {
      setSrcdocSupportedForTesting(false);
      const embedPromise = installFriendlyIframeEmbed(iframe, document.body, {
        url: 'https://acme.org/url1',
        html: '<a id="a1"></a>',
      });
      return embedPromise.then(embed => {
        return embed.whenLoaded();
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

    beforeEach(() => {
      setSrcdocSupportedForTesting(true);

      clock = sandbox.useFakeTimers();

      polls = [];
      win = {
        services: {
          'extensions': {obj: {
            installExtensionsInChildWindow: () => {},
            loadExtension: () => {},
          }},
        },
        setInterval: function() {
          const interval = window.setInterval.apply(window, arguments);
          polls.push(interval);
          return interval;
        },
        clearInterval: function(interval) {
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
      contentWindow = {};
      contentDocument = {};
      contentBody = {nodeType: 1, style: {}};
      container = {
        appendChild: () => {},
      };
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
      const embedPromise = installFriendlyIframeEmbed(iframe, container, {
        url: 'https://acme.org/url1',
        html: '<body></body>',
      });
      expect(polls).to.have.length(1);
      iframe.contentWindow = contentWindow;
      loadListener();
      return embedPromise.then(() => {
        expect(polls).to.have.length(0);
      });
    });

    it('should stop polling when loading failed', () => {
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
});
