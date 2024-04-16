import {Signals} from '#core/data-structures/signals';
import * as docready from '#core/document/ready';
import * as dom from '#core/dom';
import {
  ShadowDomVersion_Enum,
  getShadowDomSupportedVersion,
  isShadowDomSupported,
  setShadowDomSupportedVersionForTesting,
} from '#core/dom/web-components';

import {
  AmpDocFie,
  AmpDocService,
  AmpDocShadow,
  AmpDocSingle,
} from '#service/ampdoc-impl';

import {waitFor} from '#testing/helpers/service';

import {
  getServiceForDoc,
  registerServiceBuilderForDoc,
  setParentWindow,
} from '../../src/service-helpers';
import {createShadowRoot} from '../../src/shadow-embed';

describes.realWin('AmpDocService', {}, (env) => {
  let doc, win;

  beforeEach(() => {
    win = env.win;
    doc = win.document;
  });

  describe('params', () => {
    it('should read params from window name and fragment', () => {
      win.name = '__AMP__param1=value1&other=one';
      win.location.hash = '#paddingTop=17&other=two';
      const ampdoc = new AmpDocService(win, true).getSingleDoc();

      // Fragment parameters take precedence.
      expect(ampdoc.getParam('param1')).to.equal('value1');
      expect(ampdoc.getParam('other')).to.equal('two');
      expect(ampdoc.getParam('paddingTop')).to.equal('17');
    });

    it('should ignore window name and fragment with explicit params', () => {
      win.name = '__AMP__param1=value1&other=one';
      win.location.hash = '#paddingTop=17&other=two';
      const ampdoc = new AmpDocService(win, true, {
        'other': 'zero',
      }).getSingleDoc();

      // Fragment parameters take precedence.
      expect(ampdoc.getParam('other')).to.equal('zero');
      expect(ampdoc.getParam('param1')).to.be.null;
      expect(ampdoc.getParam('paddingTop')).to.be.null;
    });
  });

  describe('single-doc mode', () => {
    let service;

    beforeEach(() => {
      service = new AmpDocService(win, /* isSingleDoc */ true);
    });

    it('should initialize as single-doc', () => {
      expect(service.isSingleDoc()).to.be.true;
      expect(service.getSingleDoc()).to.exist;
      expect(service.getSingleDoc()).to.be.instanceOf(AmpDocSingle);
    });

    it('should not return a conflicting value on a form', () => {
      const node = doc.createElement('form');
      doc.body.appendChild(node);
      // Note: Instead of actually creating an input element with a name that
      // conflicts, just set this directly in case the test is ever run in
      // an compiled environment.
      node.getAmpDoc = 5;

      const ampDoc = service.getAmpDocIfAvailable(node);
      expect(ampDoc).to.equal(service.getSingleDoc());
    });

    it('should always yield the single document', () => {
      expect(() => service.getAmpDoc(null)).to.throw();
      expect(service.getAmpDoc(doc)).to.equal(service.getSingleDoc());
      const div = doc.createElement('div');
      doc.body.appendChild(div);
      expect(service.getAmpDoc(div)).to.equal(service.getSingleDoc());
    });

    it('should return meta content values', () => {
      const meta = doc.createElement('meta');
      meta.setAttribute('name', 'abc');
      meta.setAttribute('content', '123');
      doc.head.appendChild(meta);
      expect(service.getAmpDoc(meta).getMetaByName('abc')).to.equal('123');
    });

    // For example, <amp-next-page> creates shadow documents in single-doc
    // mode.
    describe('shadow documents', () => {
      let host;
      let shadowRoot;
      let content;

      beforeEach(() => {
        content = doc.createElement('span');
        host = doc.createElement('div');
        setShadowDomSupportedVersionForTesting(undefined);
        if (isShadowDomSupported()) {
          if (getShadowDomSupportedVersion() == ShadowDomVersion_Enum.V1) {
            shadowRoot = host.attachShadow({mode: 'open'});
          } else {
            shadowRoot = host.createShadowRoot();
          }
          shadowRoot.appendChild(content);
        }
        doc.body.appendChild(host);
      });

      afterEach(() => {
        if (host.parentNode) {
          host.parentNode.removeChild(host);
        }
      });

      it('should yield the closest shadow doc', () => {
        if (!shadowRoot) {
          return;
        }

        const newAmpDoc = service.installShadowDoc(
          'https://a.org/',
          shadowRoot
        );
        const ampDoc = service.getAmpDoc(content);
        expect(ampDoc).to.equal(newAmpDoc);
      });

      it('should pass shadow doc params', () => {
        if (!shadowRoot) {
          return;
        }

        const ampdoc = service.installShadowDoc('https://a.org/', shadowRoot, {
          params: {
            'other': 'one',
          },
        });
        expect(ampdoc.getParam('other')).to.equal('one');
      });
    });
  });

  describe('shadow-doc mode', () => {
    let service;
    let host, shadowRoot, content;

    beforeEach(() => {
      service = new AmpDocService(win, /* isSingleDoc */ false);
      content = doc.createElement('amp-img');
      host = doc.createElement('div');
      setShadowDomSupportedVersionForTesting(undefined);
      if (isShadowDomSupported()) {
        if (getShadowDomSupportedVersion() == ShadowDomVersion_Enum.V1) {
          shadowRoot = host.attachShadow({mode: 'open'});
        } else {
          shadowRoot = host.createShadowRoot();
        }
        shadowRoot.appendChild(content);
      }
      doc.body.appendChild(host);
    });

    afterEach(() => {
      if (host.parentNode) {
        host.parentNode.removeChild(host);
      }
    });

    it('should not initialize as single-doc', () => {
      expect(service.isSingleDoc()).to.be.false;
      expect(service.singleDoc_).to.not.exist;
    });

    it('should yield custom-element shadow-doc when exists', () => {
      const ampDoc = {};
      content.everAttached = true;
      content.getAmpDoc = () => ampDoc;
      host.appendChild(content);
      expect(service.getAmpDoc(content)).to.equal(ampDoc);
    });

    it('should yield cached or custom-element shadow-doc when exists', () => {
      if (!shadowRoot) {
        return;
      }
      const ampDoc = {};
      shadowRoot['__AMPDOC'] = ampDoc;
      expect(service.getAmpDoc(content)).to.equal(ampDoc);
      expect(service.getAmpDoc(shadowRoot)).to.equal(ampDoc);

      // Override via custom element.
      const ampDoc2 = {};
      content.everAttached = true;
      content.getAmpDoc = () => ampDoc2;
      expect(service.getAmpDoc(content)).to.equal(ampDoc2);

      // Fallback to cached version when custom element returns null.
      content.getAmpDoc = () => null;
      expect(service.getAmpDoc(content)).to.equal(ampDoc);
    });

    it('should create and cache shadow-doc', () => {
      if (!shadowRoot) {
        return;
      }
      expect(() => {
        service.getAmpDoc(content);
      }).to.throw(/No ampdoc found/);

      const newAmpDoc = service.installShadowDoc('https://a.org/', shadowRoot);
      const ampDoc = service.getAmpDoc(content);
      expect(ampDoc).to.equal(newAmpDoc);
      expect(ampDoc).to.exist;
      expect(service.getAmpDoc(shadowRoot)).to.equal(ampDoc);
      expect(ampDoc).to.be.instanceOf(AmpDocShadow);
      expect(ampDoc.shadowRoot_).to.equal(shadowRoot);
      expect(shadowRoot['__AMPDOC']).to.equal(ampDoc);
    });

    it('should fail if shadow root not found', () => {
      if (!shadowRoot) {
        return;
      }
      expect(() => {
        service.getAmpDoc(host);
      }).to.throw(/No ampdoc found/);
    });

    it('should allow checking for an AmpDoc for an external node', () => {
      if (!shadowRoot) {
        return;
      }
      const ampDoc = service.getAmpDocIfAvailable(host);
      expect(ampDoc).to.be.null;
    });

    it('should fail to install shadow doc twice', () => {
      if (!shadowRoot) {
        return;
      }
      service.installShadowDoc('https://a.org/', shadowRoot);
      allowConsoleError(() => {
        expect(() => {
          service.installShadowDoc('https://a.org/', shadowRoot);
        }).to.throw(/The shadow root already contains ampdoc/);
      });
    });

    it('should navigate via host', () => {
      if (!shadowRoot) {
        return;
      }

      const newAmpDoc = service.installShadowDoc('https://a.org/', shadowRoot);
      const ampDoc = service.getAmpDoc(content);
      expect(ampDoc).to.equal(newAmpDoc);

      const content2 = doc.createElement('span');
      const host2 = doc.createElement('div');

      let shadowRoot2;
      if (isShadowDomSupported()) {
        if (getShadowDomSupportedVersion() == ShadowDomVersion_Enum.V1) {
          shadowRoot2 = host2.attachShadow({mode: 'open'});
        } else {
          shadowRoot2 = host2.createShadowRoot();
        }
      }

      shadowRoot2.appendChild(content2);
      shadowRoot.appendChild(host2);
      expect(content2.parentNode).to.equal(shadowRoot2);
      expect(shadowRoot2.host).to.equal(host2);
      expect(host2.shadowRoot).to.equal(shadowRoot2);
      expect(host2.parentNode).to.equal(shadowRoot);

      expect(service.getAmpDoc(host2)).to.equal(ampDoc);
      expect(service.getAmpDoc(content2)).to.equal(ampDoc);
      expect(service.getAmpDoc(shadowRoot2)).to.equal(ampDoc);
    });
  });

  describe('fie-doc mode', () => {
    let service;
    let host, shadowRoot, content;

    beforeEach(() => {
      service = new AmpDocService(win, /* isSingleDoc */ true);
      content = doc.createElement('amp-img');
      host = doc.createElement('div');
      setShadowDomSupportedVersionForTesting(undefined);
      if (isShadowDomSupported()) {
        if (getShadowDomSupportedVersion() == ShadowDomVersion_Enum.V1) {
          shadowRoot = host.attachShadow({mode: 'open'});
        } else {
          shadowRoot = host.createShadowRoot();
        }
        shadowRoot.appendChild(content);
      }
      doc.body.appendChild(host);
    });

    afterEach(() => {
      if (host.parentNode) {
        host.parentNode.removeChild(host);
      }
    });

    it('should initialize as single-doc', () => {
      expect(service.isSingleDoc()).to.be.true;
      expect(service.getSingleDoc()).to.exist;
    });

    it('should yield custom-element doc when exists', () => {
      const ampDoc = {};
      content.everAttached = true;
      content.getAmpDoc = () => ampDoc;
      host.appendChild(content);
      expect(service.getAmpDoc(content)).to.equal(ampDoc);
    });

    it('should yield cached or custom-element shadow-doc when exists', () => {
      if (!shadowRoot) {
        return;
      }
      const ampDoc = {};
      shadowRoot['__AMPDOC'] = ampDoc;
      expect(service.getAmpDoc(content)).to.equal(ampDoc);
      expect(service.getAmpDoc(shadowRoot)).to.equal(ampDoc);

      // Override via custom element.
      const ampDoc2 = {};
      content.everAttached = true;
      content.getAmpDoc = () => ampDoc2;
      expect(service.getAmpDoc(content)).to.equal(ampDoc2);

      // Fallback to cached version when custom element returns null.
      content.getAmpDoc = () => null;
      expect(service.getAmpDoc(content)).to.equal(ampDoc);
    });

    it('should create and cache shadow-doc', () => {
      if (!shadowRoot) {
        return;
      }
      const newAmpDoc = service.installShadowDoc('https://a.org/', shadowRoot);
      const ampDoc = service.getAmpDoc(content);
      expect(ampDoc).to.equal(newAmpDoc);
      expect(ampDoc).to.exist;
      expect(service.getAmpDoc(shadowRoot)).to.equal(ampDoc);
      expect(ampDoc).to.be.instanceOf(AmpDocShadow);
      expect(ampDoc.shadowRoot_).to.equal(shadowRoot);
      expect(shadowRoot['__AMPDOC']).to.equal(ampDoc);
    });

    it('should navigate to parent if shadow root not found', () => {
      if (!shadowRoot) {
        return;
      }
      expect(service.getAmpDoc(host)).to.equal(service.getSingleDoc());
    });

    it('should fail to install shadow doc twice', () => {
      if (!shadowRoot) {
        return;
      }
      service.installShadowDoc('https://a.org/', shadowRoot);
      allowConsoleError(() => {
        expect(() => {
          service.installShadowDoc('https://a.org/', shadowRoot);
        }).to.throw(/The shadow root already contains ampdoc/);
      });
    });

    it('should navigate via host', () => {
      if (!shadowRoot) {
        return;
      }

      const newAmpDoc = service.installShadowDoc('https://a.org/', shadowRoot);
      const ampDoc = service.getAmpDoc(content);
      expect(ampDoc).to.equal(newAmpDoc);

      const content2 = doc.createElement('span');
      const host2 = doc.createElement('div');

      let shadowRoot2;
      if (isShadowDomSupported()) {
        if (getShadowDomSupportedVersion() == ShadowDomVersion_Enum.V1) {
          shadowRoot2 = host2.attachShadow({mode: 'open'});
        } else {
          shadowRoot2 = host2.createShadowRoot();
        }
      }

      shadowRoot2.appendChild(content2);
      shadowRoot.appendChild(host2);
      expect(content2.parentNode).to.equal(shadowRoot2);
      expect(shadowRoot2.host).to.equal(host2);
      expect(host2.shadowRoot).to.equal(shadowRoot2);
      expect(host2.parentNode).to.equal(shadowRoot);

      expect(service.getAmpDoc(host2)).to.equal(ampDoc);
      expect(service.getAmpDoc(content2)).to.equal(ampDoc);
      expect(service.getAmpDoc(shadowRoot2)).to.equal(ampDoc);
    });
  });
});

describes.sandboxed('AmpDoc.visibilityState', {}, (env) => {
  const EMBED_URL = 'https://example.com/embed';
  let clock;
  let win, doc;
  let childWin, childDoc;
  let top, embedSameWindow, embedOtherWindow, embedChild;

  beforeEach(() => {
    clock = env.sandbox.useFakeTimers();
    clock.tick(1);

    doc = {
      body: null,
      visibilityState: 'visible',
      addEventListener: env.sandbox.spy(),
      removeEventListener: env.sandbox.spy(),
    };
    win = {
      document: doc,
      performance: {
        now: performance.now,
        timeOrigin: 1,
      },
    };

    childDoc = {
      body: null,
      visibilityState: 'visible',
      addEventListener: env.sandbox.spy(),
      removeEventListener: env.sandbox.spy(),
    };
    childWin = {
      document: childDoc,
      performance: {
        now: performance.now,
        timeOrigin: 2,
      },
    };

    top = new AmpDocSingle(win);
    embedSameWindow = new AmpDocFie(win, EMBED_URL, top);
    embedOtherWindow = new AmpDocFie(childWin, EMBED_URL, top);
    embedChild = new AmpDocFie(childWin, EMBED_URL, embedOtherWindow);
  });

  function updateDocumentVisibility(doc, visibilityState) {
    doc.visibilityState = visibilityState;
    if (doc.addEventListener.args.length > 0) {
      doc.addEventListener.args[0][1]();
    }
  }

  it('should set up and destroy listeners', () => {
    // 1 for top, 1 for embedSameWindow.
    expect(doc.addEventListener.callCount).to.equal(2);
    expect(doc.removeEventListener.callCount).to.equal(0);
    // 1 for embedOtherWindow, 1 for embedChild.
    expect(childDoc.addEventListener.callCount).to.equal(2);
    expect(childDoc.removeEventListener.callCount).to.equal(0);
    // 1 for embedSameWindow, 1 for embedOtherWindow.
    expect(top.visibilityStateHandlers_.getHandlerCount()).to.equal(2);
    // No children.
    expect(embedSameWindow.visibilityStateHandlers_.getHandlerCount()).to.equal(
      0
    );
    // 1 for embedChild.
    expect(
      embedOtherWindow.visibilityStateHandlers_.getHandlerCount()
    ).to.equal(1);
    // No children.
    expect(embedChild.visibilityStateHandlers_.getHandlerCount()).to.equal(0);

    // Destroy the nested child.
    embedChild.dispose();
    expect(doc.removeEventListener.callCount).to.equal(0);
    expect(childDoc.removeEventListener.callCount).to.equal(1);
    expect(top.visibilityStateHandlers_.getHandlerCount()).to.equal(2);
    expect(
      embedOtherWindow.visibilityStateHandlers_.getHandlerCount()
    ).to.equal(0);

    // Destroy the embedOtherWindow.
    embedOtherWindow.dispose();
    expect(doc.removeEventListener.callCount).to.equal(0);
    expect(childDoc.removeEventListener.callCount).to.equal(2);
    expect(top.visibilityStateHandlers_.getHandlerCount()).to.equal(1);

    // Destroy the embedSameWindow.
    embedSameWindow.dispose();
    expect(doc.removeEventListener.callCount).to.equal(1);
    expect(top.visibilityStateHandlers_.getHandlerCount()).to.equal(0);

    // Destroy the top.
    top.dispose();
    expect(doc.removeEventListener.callCount).to.equal(2);
  });

  it('should set up and dipose services', () => {
    const disposableFactory = function () {
      return {
        dispose: env.sandbox.spy(),
      };
    };

    // Register a disposable service.
    registerServiceBuilderForDoc(embedChild, 'a', disposableFactory);
    const disposableService = getServiceForDoc(embedChild, 'a');

    // Destroy the nested child.
    embedChild.dispose();

    expect(disposableService.dispose).to.be.calledOnce;
  });

  describe('firstVisibleTime', () => {
    it('should prefer timeOrigin doc initialized to visible', () => {
      // Move page load time to 2021-01-01T12:30Z
      win.performance.timeOrigin = 1609504200000;
      // Page has been active for 30min
      env.sandbox.stub(win.performance, 'now').returns(30 * 60 * 1000);
      // Move epoch time to 2021-01-01T13:00Z
      clock.tick(1609506000000 - Date.now());
      top = new AmpDocSingle(win, {visibilityState: 'visible'});

      expect(top.getFirstVisibleTime()).to.equal(win.performance.timeOrigin);
      expect(top.getFirstVisibleTime()).not.to.equal(Date.now());
    });

    it('should wait for visible', () => {
      // Move page load time to 2021-01-01T12:30Z
      win.performance.timeOrigin = 1609504200000;
      // Page has been active for 30min
      env.sandbox.stub(win.performance, 'now').returns(30 * 60 * 1000);
      // Move epoch time to 2021-01-01T13:00Z
      clock.tick(1609506000000 - Date.now());
      top = new AmpDocSingle(win, {visibilityState: 'prerender'});

      expect(top.getFirstVisibleTime()).to.equal(null);

      top.overrideVisibilityState('visible');
      expect(top.getFirstVisibleTime()).to.equal(1609506000000);
      expect(top.getFirstVisibleTime()).to.equal(Date.now());
    });
  });

  it('should be visible by default', () => {
    expect(top.getVisibilityState()).to.equal('visible');
    expect(embedSameWindow.getVisibilityState()).to.equal('visible');
    expect(embedOtherWindow.getVisibilityState()).to.equal('visible');
    expect(embedChild.getVisibilityState()).to.equal('visible');

    expect(top.isVisible()).to.be.true;
    expect(embedSameWindow.isVisible()).to.be.true;
    expect(embedOtherWindow.isVisible()).to.be.true;
    expect(embedChild.isVisible()).to.be.true;

    expect(top.getFirstVisibleTime()).to.equal(1);
    expect(embedSameWindow.getFirstVisibleTime()).to.equal(1);
    expect(embedOtherWindow.getFirstVisibleTime()).to.equal(2);
    expect(embedChild.getFirstVisibleTime()).to.equal(2);

    expect(top.getLastVisibleTime()).to.equal(1);
    expect(embedSameWindow.getLastVisibleTime()).to.equal(1);
    expect(embedOtherWindow.getLastVisibleTime()).to.equal(2);
    expect(embedChild.getLastVisibleTime()).to.equal(2);

    return Promise.all([
      top.whenFirstVisible(),
      embedSameWindow.whenFirstVisible(),
      embedOtherWindow.whenFirstVisible(),
      embedChild.whenFirstVisible(),
    ]).then(() => {
      return Promise.all([
        top.whenNextVisible(),
        embedSameWindow.whenNextVisible(),
        embedOtherWindow.whenNextVisible(),
        embedChild.whenNextVisible(),
      ]);
    });
  });

  it('should override at construction time', () => {
    top = new AmpDocSingle(win, {visibilityState: 'hidden'});
    embedSameWindow = new AmpDocFie(win, EMBED_URL, top);
    embedOtherWindow = new AmpDocFie(childWin, EMBED_URL, top);
    embedChild = new AmpDocFie(childWin, EMBED_URL, embedOtherWindow);

    expect(top.getVisibilityState()).to.equal('hidden');
    expect(embedSameWindow.getVisibilityState()).to.equal('hidden');
    expect(embedOtherWindow.getVisibilityState()).to.equal('hidden');
    expect(embedChild.getVisibilityState()).to.equal('hidden');

    expect(top.isVisible()).to.be.false;
    expect(embedSameWindow.isVisible()).to.be.false;
    expect(embedOtherWindow.isVisible()).to.be.false;
    expect(embedChild.isVisible()).to.be.false;

    expect(top.getFirstVisibleTime()).to.be.null;
    expect(embedSameWindow.getFirstVisibleTime()).to.be.null;
    expect(embedOtherWindow.getFirstVisibleTime()).to.be.null;
    expect(embedChild.getFirstVisibleTime()).to.be.null;

    expect(top.getLastVisibleTime()).to.be.null;
    expect(embedSameWindow.getLastVisibleTime()).to.be.null;
    expect(embedOtherWindow.getLastVisibleTime()).to.be.null;
    expect(embedChild.getLastVisibleTime()).to.be.null;
  });

  it('should override at construction time via params', () => {
    top = new AmpDocSingle(win, {
      params: {'visibilityState': 'hidden'},
    });
    embedSameWindow = new AmpDocFie(win, EMBED_URL, top);
    embedOtherWindow = new AmpDocFie(childWin, EMBED_URL, top);
    embedChild = new AmpDocFie(childWin, EMBED_URL, embedOtherWindow);

    expect(top.getVisibilityState()).to.equal('hidden');
    expect(embedSameWindow.getVisibilityState()).to.equal('hidden');
    expect(embedOtherWindow.getVisibilityState()).to.equal('hidden');
    expect(embedChild.getVisibilityState()).to.equal('hidden');

    expect(top.isVisible()).to.be.false;
    expect(embedSameWindow.isVisible()).to.be.false;
    expect(embedOtherWindow.isVisible()).to.be.false;
    expect(embedChild.isVisible()).to.be.false;

    expect(top.getFirstVisibleTime()).to.be.null;
    expect(embedSameWindow.getFirstVisibleTime()).to.be.null;
    expect(embedOtherWindow.getFirstVisibleTime()).to.be.null;
    expect(embedChild.getFirstVisibleTime()).to.be.null;

    expect(top.getLastVisibleTime()).to.be.null;
    expect(embedSameWindow.getLastVisibleTime()).to.be.null;
    expect(embedOtherWindow.getLastVisibleTime()).to.be.null;
    expect(embedChild.getLastVisibleTime()).to.be.null;
  });

  it('should override visibilityState after construction', () => {
    top = new AmpDocSingle(win, {visibilityState: 'hidden'});
    embedSameWindow = new AmpDocFie(win, EMBED_URL, top);
    embedOtherWindow = new AmpDocFie(childWin, EMBED_URL, top);
    embedChild = new AmpDocFie(childWin, EMBED_URL, embedOtherWindow);

    clock.tick(1);
    top.overrideVisibilityState('visible');

    expect(top.getVisibilityState()).to.equal('visible');
    expect(embedSameWindow.getVisibilityState()).to.equal('visible');
    expect(embedOtherWindow.getVisibilityState()).to.equal('visible');
    expect(embedChild.getVisibilityState()).to.equal('visible');

    expect(top.isVisible()).to.be.true;
    expect(embedSameWindow.isVisible()).to.be.true;
    expect(embedOtherWindow.isVisible()).to.be.true;
    expect(embedChild.isVisible()).to.be.true;

    const epoch = win.performance.timeOrigin + performance.now();
    const childEpoch = childWin.performance.timeOrigin + performance.now();
    expect(epoch).to.equal(3);
    expect(childEpoch).to.equal(4);
    expect(top.getFirstVisibleTime()).to.equal(epoch);
    expect(embedSameWindow.getFirstVisibleTime()).to.equal(epoch);
    expect(embedOtherWindow.getFirstVisibleTime()).to.equal(childEpoch);
    expect(embedChild.getFirstVisibleTime()).to.equal(childEpoch);

    expect(top.getLastVisibleTime()).to.equal(epoch);
    expect(embedSameWindow.getLastVisibleTime()).to.equal(epoch);
    expect(embedOtherWindow.getLastVisibleTime()).to.equal(childEpoch);
    expect(embedChild.getLastVisibleTime()).to.equal(childEpoch);

    return Promise.all([
      top.whenFirstVisible(),
      embedSameWindow.whenFirstVisible(),
      embedOtherWindow.whenFirstVisible(),
      embedChild.whenFirstVisible(),
    ]).then(() => {
      return Promise.all([
        top.whenNextVisible(),
        embedSameWindow.whenNextVisible(),
        embedOtherWindow.whenNextVisible(),
        embedChild.whenNextVisible(),
      ]);
    });
  });

  it('should update last visibility after construction', () => {
    expect(top.getFirstVisibleTime()).to.equal(1);
    expect(top.getLastVisibleTime()).to.equal(1);

    clock.tick(1);
    top.overrideVisibilityState('hidden');

    expect(top.getVisibilityState()).to.equal('hidden');
    expect(embedSameWindow.getVisibilityState()).to.equal('hidden');
    expect(embedOtherWindow.getVisibilityState()).to.equal('hidden');
    expect(embedChild.getVisibilityState()).to.equal('hidden');

    expect(top.getFirstVisibleTime()).to.equal(1);
    expect(top.getLastVisibleTime()).to.equal(1);

    clock.tick(1);
    top.overrideVisibilityState('visible');

    expect(top.getVisibilityState()).to.equal('visible');
    expect(embedSameWindow.getVisibilityState()).to.equal('visible');
    expect(embedOtherWindow.getVisibilityState()).to.equal('visible');
    expect(embedChild.getVisibilityState()).to.equal('visible');

    const epoch = win.performance.timeOrigin + performance.now();
    expect(epoch).to.equal(4);
    expect(top.getFirstVisibleTime()).to.equal(1);
    expect(top.getLastVisibleTime()).to.equal(epoch);
  });

  it('should update visibility in children', () => {
    clock.tick(1);
    embedOtherWindow.overrideVisibilityState('hidden');

    expect(top.getVisibilityState()).to.equal('visible');
    expect(embedSameWindow.getVisibilityState()).to.equal('visible');
    expect(embedOtherWindow.getVisibilityState()).to.equal('hidden');
    expect(embedChild.getVisibilityState()).to.equal('hidden');

    expect(top.getFirstVisibleTime()).to.equal(1);
    expect(top.getLastVisibleTime()).to.equal(1);
    expect(embedSameWindow.getFirstVisibleTime()).to.equal(1);
    expect(embedSameWindow.getLastVisibleTime()).to.equal(1);
    expect(embedOtherWindow.getFirstVisibleTime()).to.equal(2);
    expect(embedOtherWindow.getLastVisibleTime()).to.equal(2);
    expect(embedChild.getFirstVisibleTime()).to.equal(2);
    expect(embedChild.getLastVisibleTime()).to.equal(2);

    clock.tick(1);
    embedOtherWindow.overrideVisibilityState('visible');

    expect(embedOtherWindow.getVisibilityState()).to.equal('visible');
    expect(embedChild.getVisibilityState()).to.equal('visible');

    expect(top.getFirstVisibleTime()).to.equal(1);
    expect(top.getLastVisibleTime()).to.equal(1);
    expect(embedSameWindow.getFirstVisibleTime()).to.equal(1);
    expect(embedSameWindow.getLastVisibleTime()).to.equal(1);
    expect(embedOtherWindow.getFirstVisibleTime()).to.equal(2);
    expect(embedOtherWindow.getLastVisibleTime()).to.equal(5);
    expect(embedChild.getFirstVisibleTime()).to.equal(2);
    expect(embedChild.getLastVisibleTime()).to.equal(5);
  });

  it('should update when document visibility changes', () => {
    clock.tick(1);
    updateDocumentVisibility(doc, 'hidden');

    expect(top.getVisibilityState()).to.equal('hidden');
    expect(embedSameWindow.getVisibilityState()).to.equal('hidden');
    expect(embedOtherWindow.getVisibilityState()).to.equal('hidden');
    expect(embedChild.getVisibilityState()).to.equal('hidden');

    clock.tick(1);
    updateDocumentVisibility(doc, 'visible');

    expect(top.getVisibilityState()).to.equal('visible');
    expect(embedSameWindow.getVisibilityState()).to.equal('visible');
    expect(embedOtherWindow.getVisibilityState()).to.equal('visible');
    expect(embedChild.getVisibilityState()).to.equal('visible');
  });

  it('should update embed document visibility', () => {
    clock.tick(1);
    updateDocumentVisibility(childDoc, 'hidden');

    expect(top.getVisibilityState()).to.equal('visible');
    expect(embedSameWindow.getVisibilityState()).to.equal('visible');
    expect(embedOtherWindow.getVisibilityState()).to.equal('hidden');
    expect(embedChild.getVisibilityState()).to.equal('hidden');

    clock.tick(1);
    updateDocumentVisibility(childDoc, 'visible');

    expect(top.getVisibilityState()).to.equal('visible');
    expect(embedSameWindow.getVisibilityState()).to.equal('visible');
    expect(embedOtherWindow.getVisibilityState()).to.equal('visible');
    expect(embedChild.getVisibilityState()).to.equal('visible');
  });

  it('should override to prerender/inactive/paused', () => {
    top.overrideVisibilityState('prerender');
    expect(top.getVisibilityState()).to.equal('prerender');
    expect(embedSameWindow.getVisibilityState()).to.equal('prerender');
    expect(embedOtherWindow.getVisibilityState()).to.equal('prerender');
    expect(embedChild.getVisibilityState()).to.equal('prerender');

    top.overrideVisibilityState('inactive');
    expect(top.getVisibilityState()).to.equal('inactive');
    expect(embedSameWindow.getVisibilityState()).to.equal('inactive');
    expect(embedOtherWindow.getVisibilityState()).to.equal('inactive');
    expect(embedChild.getVisibilityState()).to.equal('inactive');

    top.overrideVisibilityState('paused');
    expect(top.getVisibilityState()).to.equal('paused');
    expect(embedSameWindow.getVisibilityState()).to.equal('paused');
    expect(embedOtherWindow.getVisibilityState()).to.equal('paused');
    expect(embedChild.getVisibilityState()).to.equal('paused');
  });

  it('should prioritize document hidden for paused', () => {
    updateDocumentVisibility(doc, 'hidden');
    top.overrideVisibilityState('paused');
    expect(top.getVisibilityState()).to.equal('hidden');
    expect(embedSameWindow.getVisibilityState()).to.equal('hidden');
    expect(embedOtherWindow.getVisibilityState()).to.equal('hidden');
    expect(embedChild.getVisibilityState()).to.equal('hidden');
  });

  it('should be hidden when the browser document is unknown state', () => {
    updateDocumentVisibility(doc, 'what is this');
    expect(top.getVisibilityState()).to.equal('hidden');
    expect(embedSameWindow.getVisibilityState()).to.equal('hidden');
    expect(embedOtherWindow.getVisibilityState()).to.equal('hidden');
    expect(embedChild.getVisibilityState()).to.equal('hidden');
  });

  it('should yield undefined for whenVisible methods', () => {
    return Promise.all([top.whenFirstVisible(), top.whenNextVisible()]).then(
      (results) => {
        expect(results).to.deep.equal([undefined, undefined]);
      }
    );
  });
});

describes.realWin('AmpDocSingle', {}, (env) => {
  let win, doc;
  let ampdoc;

  beforeEach(() => {
    win = env.win;
    doc = win.document;
    ampdoc = new AmpDocSingle(win);
  });

  it('should return window', () => {
    expect(ampdoc.win).to.equal(win);
    expect(ampdoc.getUrl()).to.equal(win.location.href);
  });

  it('should return document as root', () => {
    expect(ampdoc.getRootNode()).to.equal(win.document);
    expect(ampdoc.getHeadNode()).to.equal(win.document.head);
    expect(ampdoc.isSingleDoc()).to.be.true;
  });

  it('should find element by id', () => {
    const id = 'ampdoc_test_element_' + Date.now();
    const element = doc.createElement('div');
    element.setAttribute('id', id);
    doc.body.appendChild(element);
    expect(ampdoc.getElementById(id)).to.equal(element);
  });

  it('should initialize ready state and body immediately', () => {
    expect(ampdoc.getBody()).to.equal(win.document.body);
    expect(ampdoc.isBodyAvailable()).to.be.true;
    expect(ampdoc.isReady()).to.be.true;
    return Promise.all([ampdoc.waitForBodyOpen(), ampdoc.whenReady()]).then(
      (results) => {
        expect(results[0]).to.equal(win.document.body);
        expect(ampdoc.getBody()).to.equal(win.document.body);
        expect(ampdoc.isBodyAvailable()).to.be.true;
        expect(ampdoc.isReady()).to.be.true;
      }
    );
  });

  it('should wait for body and ready state', () => {
    const doc = {
      body: null,
      addEventListener: function () {},
      removeEventListener: function () {},
    };
    const win = {
      document: doc,
      performance: env.win.performance,
    };

    let bodyCallback;
    env.sandbox.stub(dom, 'waitForBodyOpenPromise').callsFake(() => {
      return new Promise((resolve) => {
        bodyCallback = resolve;
      });
    });
    let ready = false;
    env.sandbox.stub(docready, 'isDocumentReady').callsFake(() => {
      return ready;
    });
    let readyCallback;
    env.sandbox.stub(docready, 'whenDocumentReady').callsFake(() => {
      return new Promise((resolve) => {
        readyCallback = resolve;
      });
    });

    const ampdoc = new AmpDocSingle(win);

    expect(ampdoc.isBodyAvailable()).to.be.false;
    allowConsoleError(() => {
      expect(() => ampdoc.getBody()).to.throw(/body not available/);
    });
    const bodyPromise = ampdoc.waitForBodyOpen();
    const readyPromise = ampdoc.whenReady();

    doc.body = {nodeType: 1};
    bodyCallback();
    ready = true;
    readyCallback();
    expect(ampdoc.isBodyAvailable()).to.be.true;
    expect(ampdoc.getBody()).to.equal(doc.body);
    expect(ampdoc.isReady()).to.be.true;
    return Promise.all([bodyPromise, readyPromise]).then((results) => {
      expect(results[0]).to.equal(doc.body);
      expect(ampdoc.isBodyAvailable()).to.be.true;
      expect(ampdoc.getBody()).to.equal(doc.body);
      expect(ampdoc.isReady()).to.be.true;
    });
  });

  it('should declare extension', () => {
    expect(ampdoc.declaresExtension('ext1')).to.be.false;
    expect(ampdoc.declaresExtension('ext1', '0.2')).to.be.false;
    expect(ampdoc.declaresExtension('ext2')).to.be.false;
    ampdoc.declareExtension('ext1', '0.2');
    expect(ampdoc.declaresExtension('ext1')).to.be.true;
    expect(ampdoc.declaresExtension('ext1', '0.2')).to.be.true;
    expect(ampdoc.declaresExtension('ext1', '0.1')).to.be.false;
    expect(ampdoc.declaresExtension('ext2')).to.be.false;

    ampdoc.declareExtension('ext2', '0.3');
    expect(ampdoc.declaresExtension('ext1')).to.be.true;
    expect(ampdoc.declaresExtension('ext2')).to.be.true;
    expect(ampdoc.declaresExtension('ext2', '0.3')).to.be.true;
    expect(ampdoc.declaresExtension('ext2', '0.1')).to.be.false;
  });

  it('should ignore duplicate extensions', () => {
    expect(ampdoc.declaresExtension('ext1')).to.be.false;
    ampdoc.declareExtension('ext1', '0.2');
    expect(ampdoc.declaresExtension('ext1')).to.be.true;
    expect(ampdoc.declaresExtension('ext1', '0.2')).to.be.true;

    // Repeat.
    ampdoc.declareExtension('ext1', '0.2');
    expect(ampdoc.declaresExtension('ext1')).to.be.true;
    expect(ampdoc.declaresExtension('ext1', '0.2')).to.be.true;

    // A different version is not allowed.
    expect(() => ampdoc.declareExtension('ext1', '0.1')).to.throw();
  });
});

describes.realWin('AmpDocShadow', {}, (env) => {
  const URL = 'https://example.org/document';

  let win, doc;
  let content, host, shadowRoot;
  let ampdoc;

  beforeEach(() => {
    win = env.win;
    doc = win.document;
    content = doc.createElement('div');
    host = doc.createElement('div');
    shadowRoot = createShadowRoot(host);
    shadowRoot.appendChild(content);
    ampdoc = new AmpDocShadow(win, URL, shadowRoot);
  });

  it('should return window', () => {
    if (!ampdoc) {
      return;
    }
    expect(ampdoc.win).to.equal(win);
    expect(ampdoc.isSingleDoc()).to.be.false;
    expect(ampdoc.getUrl()).to.equal(URL);
  });

  it('should return document as root', () => {
    if (!ampdoc) {
      return;
    }
    expect(ampdoc.getRootNode()).to.equal(shadowRoot);
    expect(ampdoc.getHeadNode()).to.equal(shadowRoot);
  });

  it('should find element by id', () => {
    if (!ampdoc) {
      return;
    }
    const id = 'ampdoc_test_element_' + Date.now();
    const element = doc.createElement('div');
    element.setAttribute('id', id);
    content.appendChild(element);
    expect(ampdoc.getElementById(id)).to.equal(element);
  });

  it('should update when body is available', () => {
    // Body is still expected.
    expect(ampdoc.isBodyAvailable()).to.be.false;
    allowConsoleError(() => {
      expect(() => ampdoc.getBody()).to.throw(/body not available/);
    });
    expect(ampdoc.bodyResolver_).to.be.ok;

    // Set body.
    const bodyPromise = ampdoc.waitForBodyOpen();
    const body = {nodeType: 1};
    ampdoc.setBody(body);
    expect(ampdoc.isBodyAvailable()).to.be.true;
    expect(ampdoc.getBody()).to.equal(body);
    expect(ampdoc.bodyResolver_).to.be.undefined;
    expect(ampdoc.bodyPromise_).to.be.ok;
    return bodyPromise.then(() => {
      expect(ampdoc.isBodyAvailable()).to.be.true;
      expect(ampdoc.getBody()).to.equal(body);
    });
  });

  it('should only allow one body update', () => {
    const body = {nodeType: 1};
    ampdoc.setBody(body);
    allowConsoleError(() => {
      expect(() => {
        ampdoc.setBody(body);
      }).to.throw(/Duplicate body/);
    });
  });

  it('should update when doc is ready', () => {
    // "Ready" is still expected.
    expect(ampdoc.isReady()).to.be.false;
    expect(ampdoc.readyResolver_).to.be.ok;

    // Set ready.
    const readyPromise = ampdoc.whenReady();
    ampdoc.setReady();
    expect(ampdoc.isReady()).to.be.true;
    expect(ampdoc.readyResolver_).to.be.undefined;
    expect(ampdoc.readyPromise_).to.be.ok;
    return readyPromise.then(() => {
      expect(ampdoc.isReady()).to.be.true;
    });
  });

  it('should only allow one ready update', () => {
    ampdoc.setReady();
    allowConsoleError(() => {
      expect(() => {
        ampdoc.setReady();
      }).to.throw(/Duplicate ready state/);
    });
  });
});

describes.realWin('AmpDocFie', {}, (env) => {
  const URL = 'https://example.org/document';

  let win, doc;
  let service;
  let frame;
  let childWin;
  let parent;
  let ampdoc;

  beforeEach(async () => {
    win = env.win;
    doc = win.document;
    service = new AmpDocService(win, /* isSingleDoc */ true);
    parent = service.getSingleDoc();

    frame = doc.createElement('iframe');
    frame.srcdoc = '<div>works</div>';
    doc.body.appendChild(frame);
    await waitFor(
      () => frame.contentDocument && frame.contentDocument.querySelector('div'),
      'child iframe initialized'
    );
    childWin = frame.contentWindow;
    setParentWindow(childWin, win);
    ampdoc = new AmpDocFie(childWin, URL, parent);
  });

  it('should create AmpDocFie', () => {
    const ampdoc = service.installFieDoc(URL, childWin);
    expect(ampdoc.win).to.equal(childWin);
    expect(ampdoc.isSingleDoc()).to.be.false;
    expect(ampdoc.getUrl()).to.equal(URL);
    expect(ampdoc.getParent()).to.equal(parent);
  });

  it('should create AmpDocFie with provided signals', () => {
    const signals = new Signals();
    ampdoc = new AmpDocFie(childWin, URL, parent, {signals});
    expect(ampdoc.signals()).to.equal(signals);
  });

  it('should return window', () => {
    expect(ampdoc.win).to.equal(childWin);
    expect(ampdoc.isSingleDoc()).to.be.false;
    expect(ampdoc.getUrl()).to.equal(URL);
    expect(ampdoc.getParent()).to.equal(parent);
  });

  it('should return document as root', () => {
    expect(ampdoc.getRootNode()).to.equal(childWin.document);
    expect(ampdoc.getHeadNode()).to.equal(childWin.document.head);
  });

  it('should find element by id', () => {
    const id = 'ampdoc_test_element_' + Date.now();
    const element = doc.createElement('div');
    element.setAttribute('id', id);
    childWin.document.body.appendChild(element);
    expect(ampdoc.getElementById(id)).to.equal(element);
  });

  it('should update when body is available', () => {
    expect(ampdoc.isBodyAvailable()).to.be.true;
    expect(ampdoc.getBody()).to.equal(childWin.document.body);
    return ampdoc.waitForBodyOpen().then((body) => {
      expect(body).to.equal(childWin.document.body);
    });
  });

  it('should update when doc is ready', () => {
    // "Ready" is still expected.
    expect(ampdoc.isReady()).to.be.false;
    expect(ampdoc.readyResolver_).to.be.ok;

    // Set ready.
    const readyPromise = ampdoc.whenReady();
    ampdoc.setReady();
    expect(ampdoc.isReady()).to.be.true;
    expect(ampdoc.readyResolver_).to.be.undefined;
    expect(ampdoc.readyPromise_).to.be.ok;
    return readyPromise.then(() => {
      expect(ampdoc.isReady()).to.be.true;
    });
  });

  it('should only allow one ready update', () => {
    ampdoc.setReady();
    allowConsoleError(() => {
      expect(() => {
        ampdoc.setReady();
      }).to.throw(/Duplicate ready state/);
    });
  });
});
