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

import * as docready from '../../src/document-ready';
import * as dom from '../../src/dom';
import {
  AmpDocFie,
  AmpDocService,
  AmpDocShadow,
  AmpDocSingle,
} from '../../src/service/ampdoc-impl';
import {
  ShadowDomVersion,
  getShadowDomSupportedVersion,
  isShadowDomSupported,
  setShadowDomSupportedVersionForTesting,
} from '../../src/web-components';
import {Signals} from '../../src/utils/signals';
import {createShadowRoot} from '../../src/shadow-embed';
import {setParentWindow} from '../../src/service';
import {toggleAmpdocFieForTesting} from '../../src/ampdoc-fie';

describes.sandboxed('AmpDocService', {}, () => {
  afterEach(() => {
    delete window.document['__AMPDOC'];
  });

  describe('params', () => {
    let doc, win;

    beforeEach(() => {
      doc = {
        body: null,
        visibilityState: 'visible',
        addEventListener: function () {},
        removeEventListener: function () {},
      };
      win = {
        location: {},
        document: doc,
      };
    });

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
      service = new AmpDocService(window, /* isSingleDoc */ true);
    });

    it('should initialize as single-doc', () => {
      expect(service.isSingleDoc()).to.be.true;
      expect(service.getSingleDoc()).to.exist;
      expect(service.getSingleDoc()).to.be.instanceOf(AmpDocSingle);
    });

    it('should not return a conflicting value on a form', () => {
      const node = document.createElement('form');
      // Note: Instead of actually creating an input element with a name that
      // conflicts, just set this directly in case the test is ever run in
      // an compiled environment.
      node.getAmpDoc = 5;

      const ampDoc = service.getAmpDocIfAvailable(node);
      expect(ampDoc).to.equal(service.getSingleDoc());
    });

    it('should not return a conflicting value on a document fragment', () => {
      // This is a stand-in for testing a document, without actually modifying
      // the document to keep the test side-effect free.
      const frag = document.createDocumentFragment();
      frag.getAmpDoc = 5;

      const ampDoc = service.getAmpDocIfAvailable(frag);
      expect(ampDoc).to.equal(service.getSingleDoc());
    });

    it('should always yield the single document', () => {
      expect(() => service.getAmpDoc(null)).to.throw();
      expect(service.getAmpDoc(document)).to.equal(service.getSingleDoc());
      const div = document.createElement('div');
      document.body.appendChild(div);
      expect(service.getAmpDoc(div)).to.equal(service.getSingleDoc());
    });

    it('should return meta content values', () => {
      const meta = document.createElement('meta');
      meta.setAttribute('name', 'abc');
      meta.setAttribute('content', '123');
      document.head.appendChild(meta);
      expect(service.getAmpDoc(meta).getMetaByName('abc')).to.equal('123');
    });

    // For example, <amp-next-page> creates shadow documents in single-doc
    // mode.
    describe('shadow documents', () => {
      let host;
      let shadowRoot;
      let content;

      beforeEach(() => {
        content = document.createElement('span');
        host = document.createElement('div');
        setShadowDomSupportedVersionForTesting(undefined);
        if (isShadowDomSupported()) {
          if (getShadowDomSupportedVersion() == ShadowDomVersion.V1) {
            shadowRoot = host.attachShadow({mode: 'open'});
          } else {
            shadowRoot = host.createShadowRoot();
          }
          shadowRoot.appendChild(content);
        }
        document.body.appendChild(host);
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
      service = new AmpDocService(window, /* isSingleDoc */ false);
      content = document.createElement('amp-img');
      host = document.createElement('div');
      setShadowDomSupportedVersionForTesting(undefined);
      if (isShadowDomSupported()) {
        if (getShadowDomSupportedVersion() == ShadowDomVersion.V1) {
          shadowRoot = host.attachShadow({mode: 'open'});
        } else {
          shadowRoot = host.createShadowRoot();
        }
        shadowRoot.appendChild(content);
      }
      document.body.appendChild(host);
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

      const content2 = document.createElement('span');
      const host2 = document.createElement('div');

      let shadowRoot2;
      if (isShadowDomSupported()) {
        if (getShadowDomSupportedVersion() == ShadowDomVersion.V1) {
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
      toggleAmpdocFieForTesting(window, true);
      service = new AmpDocService(window, /* isSingleDoc */ true);
      content = document.createElement('amp-img');
      host = document.createElement('div');
      setShadowDomSupportedVersionForTesting(undefined);
      if (isShadowDomSupported()) {
        if (getShadowDomSupportedVersion() == ShadowDomVersion.V1) {
          shadowRoot = host.attachShadow({mode: 'open'});
        } else {
          shadowRoot = host.createShadowRoot();
        }
        shadowRoot.appendChild(content);
      }
      document.body.appendChild(host);
    });

    afterEach(() => {
      toggleAmpdocFieForTesting(window, false);
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

      const content2 = document.createElement('span');
      const host2 = document.createElement('div');

      let shadowRoot2;
      if (isShadowDomSupported()) {
        if (getShadowDomSupportedVersion() == ShadowDomVersion.V1) {
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

    describes.realWin('fie-doc', {}, (env) => {
      let childWin;

      beforeEach(() => {
        childWin = env.win;
        setParentWindow(childWin, service.win);
      });

      it('should create and cache fie-doc', () => {
        const newAmpDoc = service.installFieDoc('https://a.org/', childWin);
        const content = document.createElement('div');
        childWin.document.body.appendChild(content);
        const ampDoc = service.getAmpDoc(content);
        expect(ampDoc).to.equal(newAmpDoc);
        expect(ampDoc.getParent()).to.equal(service.getSingleDoc());
        expect(childWin.document['__AMPDOC']).to.equal(ampDoc);
      });

      it('should pass fie doc params', () => {
        const ampdoc = service.installFieDoc('https://a.org/', childWin, {
          params: {
            'other': 'one',
          },
        });
        expect(ampdoc.getParam('other')).to.equal('one');
      });
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
    win = {document: doc};

    childDoc = {
      body: null,
      visibilityState: 'visible',
      addEventListener: env.sandbox.spy(),
      removeEventListener: env.sandbox.spy(),
    };
    childWin = {document: childDoc};

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
    expect(embedOtherWindow.getFirstVisibleTime()).to.equal(1);
    expect(embedChild.getFirstVisibleTime()).to.equal(1);

    expect(top.getLastVisibleTime()).to.equal(1);
    expect(embedSameWindow.getLastVisibleTime()).to.equal(1);
    expect(embedOtherWindow.getLastVisibleTime()).to.equal(1);
    expect(embedChild.getLastVisibleTime()).to.equal(1);

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

    expect(top.getFirstVisibleTime()).to.equal(2);
    expect(embedSameWindow.getFirstVisibleTime()).to.equal(2);
    expect(embedOtherWindow.getFirstVisibleTime()).to.equal(2);
    expect(embedChild.getFirstVisibleTime()).to.equal(2);

    expect(top.getLastVisibleTime()).to.equal(2);
    expect(embedSameWindow.getLastVisibleTime()).to.equal(2);
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

    expect(top.getFirstVisibleTime()).to.equal(1);
    expect(top.getLastVisibleTime()).to.equal(3);
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
    expect(embedOtherWindow.getFirstVisibleTime()).to.equal(1);
    expect(embedOtherWindow.getLastVisibleTime()).to.equal(1);
    expect(embedChild.getFirstVisibleTime()).to.equal(1);
    expect(embedChild.getLastVisibleTime()).to.equal(1);

    clock.tick(1);
    embedOtherWindow.overrideVisibilityState('visible');

    expect(embedOtherWindow.getVisibilityState()).to.equal('visible');
    expect(embedChild.getVisibilityState()).to.equal('visible');

    expect(top.getFirstVisibleTime()).to.equal(1);
    expect(top.getLastVisibleTime()).to.equal(1);
    expect(embedSameWindow.getFirstVisibleTime()).to.equal(1);
    expect(embedSameWindow.getLastVisibleTime()).to.equal(1);
    expect(embedOtherWindow.getFirstVisibleTime()).to.equal(1);
    expect(embedOtherWindow.getLastVisibleTime()).to.equal(3);
    expect(embedChild.getFirstVisibleTime()).to.equal(1);
    expect(embedChild.getLastVisibleTime()).to.equal(3);
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

describes.sandboxed('AmpDocSingle', {}, (env) => {
  let ampdoc;

  beforeEach(() => {
    ampdoc = new AmpDocSingle(window);
  });

  it('should return window', () => {
    expect(ampdoc.win).to.equal(window);
    expect(ampdoc.getUrl()).to.equal(window.location.href);
  });

  it('should return document as root', () => {
    expect(ampdoc.getRootNode()).to.equal(window.document);
    expect(ampdoc.getHeadNode()).to.equal(window.document.head);
    expect(ampdoc.isSingleDoc()).to.be.true;
  });

  it('should find element by id', () => {
    const id = 'ampdoc_test_element_' + Date.now();
    const element = document.createElement('div');
    element.setAttribute('id', id);
    document.body.appendChild(element);
    expect(ampdoc.getElementById(id)).to.equal(element);
  });

  it('should initialize ready state and body immediately', () => {
    expect(ampdoc.getBody()).to.equal(window.document.body);
    expect(ampdoc.isBodyAvailable()).to.be.true;
    expect(ampdoc.isReady()).to.be.true;
    return Promise.all([ampdoc.waitForBodyOpen(), ampdoc.whenReady()]).then(
      (results) => {
        expect(results[0]).to.equal(window.document.body);
        expect(ampdoc.getBody()).to.equal(window.document.body);
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
    const win = {document: doc};

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
    expect(ampdoc.declaresExtension('ext2')).to.be.false;
    ampdoc.declareExtension('ext1');
    expect(ampdoc.declaresExtension('ext1')).to.be.true;
    expect(ampdoc.declaresExtension('ext2')).to.be.false;

    ampdoc.declareExtension('ext2');
    expect(ampdoc.declaresExtension('ext1')).to.be.true;
    expect(ampdoc.declaresExtension('ext2')).to.be.true;
  });

  it('should ignore duplicate extensions', () => {
    expect(ampdoc.declaresExtension('ext1')).to.be.false;
    ampdoc.declareExtension('ext1');
    expect(ampdoc.declaresExtension('ext1')).to.be.true;
    expect(ampdoc.declaredExtensions_).to.have.length(1);

    // Repeat.
    ampdoc.declareExtension('ext1');
    expect(ampdoc.declaredExtensions_).to.have.length(1);
    expect(ampdoc.declaresExtension('ext1')).to.be.true;
  });
});

describes.sandboxed('AmpDocShadow', {}, () => {
  const URL = 'https://example.org/document';

  let content, host, shadowRoot;
  let ampdoc;

  beforeEach(() => {
    content = document.createElement('div');
    host = document.createElement('div');
    shadowRoot = createShadowRoot(host);
    shadowRoot.appendChild(content);
    ampdoc = new AmpDocShadow(window, URL, shadowRoot);
  });

  it('should return window', () => {
    if (!ampdoc) {
      return;
    }
    expect(ampdoc.win).to.equal(window);
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
    const element = document.createElement('div');
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

  let service;
  let childWin;
  let parent;
  let ampdoc;

  beforeEach(() => {
    service = new AmpDocService(window, /* isSingleDoc */ true);
    childWin = env.win;
    setParentWindow(childWin, window);
    parent = service.getSingleDoc();
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
    const element = document.createElement('div');
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
