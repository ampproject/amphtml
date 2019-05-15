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
  AmpDocService,
  AmpDocShadow,
  AmpDocSingle,
} from '../../src/service/ampdoc-impl';
import {
  ShadowDomVersion,
  getShadowDomSupportedVersion,
  isShadowDomSupported,
} from '../../src/web-components';
import {createShadowRoot} from '../../src/shadow-embed';
import {toggleExperiment} from '../../src/experiments';


describe('AmpDocService', () => {

  let sandbox;

  beforeEach(() => {
    sandbox = sinon.sandbox;
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('single-doc mode', () => {

    let service;

    beforeEach(() => {
      service = new AmpDocService(window, /* isSingleDoc */ true);
    });

    it('should initialize as single-doc', () => {
      expect(service.isSingleDoc()).to.be.true;
      expect(service.singleDoc_).to.exist;
      expect(service.singleDoc_).to.be.instanceOf(AmpDocSingle);
    });

    it('should always yield the single document', () => {
      expect(service.getAmpDoc(null)).to.equal(service.singleDoc_);
      expect(service.getAmpDoc(document)).to.equal(service.singleDoc_);
      const div = document.createElement('div');
      document.body.appendChild(div);
      expect(service.getAmpDoc(div)).to.equal(service.singleDoc_);
    });

    it('should yield the single doc when ampdoc-closest is enabled', () => {
      toggleExperiment(window, 'ampdoc-closest', true);
      service = new AmpDocService(window, /* isSingleDoc */ true);
      expect(service.getAmpDoc(null)).to.equal(service.singleDoc_);
      expect(service.getAmpDoc(document)).to.equal(service.singleDoc_);
      const div = document.createElement('div');
      document.body.appendChild(div);
      expect(service.getAmpDoc(div)).to.equal(service.singleDoc_);
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
        toggleExperiment(window, 'ampdoc-closest', false);
      });

      it('should yield the single doc', () => {
        if (!shadowRoot) {
          return;
        }

        service.installShadowDoc('https://a.org/', shadowRoot);
        const ampDoc = service.getAmpDoc(content);
        expect(ampDoc).to.equal(service.singleDoc_);
      });

      it('should yield the shadow doc when explicitly asked', () => {
        if (!shadowRoot) {
          return;
        }

        const newAmpDoc = service.installShadowDoc('https://a.org/', shadowRoot);
        const ampDoc = service.getAmpDoc(content, {closestAmpDoc: true});
        expect(ampDoc).to.equal(newAmpDoc);
      });

      it('should yield the shadow doc when ampdoc-closest is enabled', () => {
        if (!shadowRoot) {
          return;
        }

        toggleExperiment(window, 'ampdoc-closest', true);
        service = new AmpDocService(window, /* isSingleDoc */ true);
        const newAmpDoc = service.installShadowDoc('https://a.org/', shadowRoot);
        const ampDoc = service.getAmpDoc(content);
        expect(ampDoc).to.equal(newAmpDoc);
      });
    });
  });

  describe('shadow-doc mode', () => {

    let service;
    let host, shadowRoot, content;

    beforeEach(() => {
      service = new AmpDocService(window, /* isSingleDoc */ false);
      content = document.createElement('span');
      host = document.createElement('div');
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
      content.ampdoc_ = ampDoc;
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
      content.ampdoc_ = ampDoc2;
      expect(service.getAmpDoc(content)).to.equal(ampDoc2);

      // Fallback to cached version when custom element returns null.
      content.ampdoc_ = null;
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
      allowConsoleError(() => { expect(() => {
        service.installShadowDoc('https://a.org/', shadowRoot);
      }).to.throw(/The shadow root already contains ampdoc/); });
    });

    // TODO(dvoytenko, #11827): Make this test work on Safari.
    it.configure().skipSafari().run('should navigate via host', () => {
      if (!shadowRoot) {
        return;
      }

      const newAmpDoc = service.installShadowDoc('https://a.org/', shadowRoot);
      const ampDoc = service.getAmpDoc(content);
      expect(ampDoc).to.equal(newAmpDoc);

      const content2 = document.createElement('span');
      const host2 = document.createElement('div');
      const shadowRoot2 = host2.createShadowRoot();
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

describe('AmpDocSingle', () => {

  let sandbox;
  let ampdoc;

  beforeEach(() => {
    sandbox = sinon.sandbox;
    ampdoc = new AmpDocSingle(window);
  });

  afterEach(() => {
    sandbox.restore();
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
    return Promise.all([ampdoc.whenBodyAvailable(), ampdoc.whenReady()])
        .then(results => {
          expect(results[0]).to.equal(window.document.body);
          expect(ampdoc.getBody()).to.equal(window.document.body);
          expect(ampdoc.isBodyAvailable()).to.be.true;
          expect(ampdoc.isReady()).to.be.true;
        });
  });

  it('should wait for body and ready state', () => {
    const doc = {body: null};
    const win = {document: doc};

    let bodyCallback;
    sandbox.stub(dom, 'waitForBodyPromise').callsFake(() => {
      return new Promise(resolve => {
        bodyCallback = resolve;
      });
    });
    let ready = false;
    sandbox.stub(docready, 'isDocumentReady').callsFake(() => {
      return ready;
    });
    let readyCallback;
    sandbox.stub(docready, 'whenDocumentReady').callsFake(() => {
      return new Promise(resolve => {
        readyCallback = resolve;
      });
    });

    const ampdoc = new AmpDocSingle(win);

    expect(ampdoc.isBodyAvailable()).to.be.false;
    allowConsoleError(() => {
      expect(() => ampdoc.getBody()).to.throw(/body not available/);
    });
    const bodyPromise = ampdoc.whenBodyAvailable();
    const readyPromise = ampdoc.whenReady();

    doc.body = {nodeType: 1};
    bodyCallback();
    ready = true;
    readyCallback();
    expect(ampdoc.isBodyAvailable()).to.be.true;
    expect(ampdoc.getBody()).to.equal(doc.body);
    expect(ampdoc.isReady()).to.be.true;
    return Promise.all([bodyPromise, readyPromise]).then(results => {
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


describe('AmpDocShadow', () => {

  const URL = 'https://example.org/document';

  let sandbox;
  let content, host, shadowRoot;
  let ampdoc;

  beforeEach(() => {
    sandbox = sinon.sandbox;
    content = document.createElement('div');
    host = document.createElement('div');
    shadowRoot = createShadowRoot(host);
    shadowRoot.appendChild(content);
    ampdoc = new AmpDocShadow(window, URL, shadowRoot);
  });

  afterEach(() => {
    sandbox.restore();
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
    const bodyPromise = ampdoc.whenBodyAvailable();
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
    allowConsoleError(() => { expect(() => {
      ampdoc.setBody(body);
    }).to.throw(/Duplicate body/); });
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
    allowConsoleError(() => { expect(() => {
      ampdoc.setReady();
    }).to.throw(/Duplicate ready state/); });
  });
});
