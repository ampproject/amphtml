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
  AmpDocService,
  AmpDocSingle,
  AmpDocShadow,
} from '../../src/service/ampdoc-impl';
import * as sinon from 'sinon';


describe('AmpDocService', () => {

  let sandbox;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
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
      expect(service.getAmpDoc(document.createElement('div')))
          .to.equal(service.singleDoc_);
    });
  });

  describe('shadow-doc mode', () => {

    let service;
    let host, shadowRoot, content;

    beforeEach(() => {
      service = new AmpDocService(window, /* isSingleDoc */ false);
      content = document.createElement('span');
      host = document.createElement('div');
      if (host.createShadowRoot) {
        shadowRoot = host.createShadowRoot();
        shadowRoot.appendChild(content);
      }
    });

    it('should initialize as single-doc', () => {
      expect(service.isSingleDoc()).to.be.false;
      expect(service.singleDoc_).to.not.exist;
    });

    it('should yield custom-element shadow-doc when exists', () => {
      const ampDoc = {};
      content.getAmpDoc = () => ampDoc;
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
      content.getAmpDoc = () => ampDoc2;
      expect(service.getAmpDoc(content)).to.equal(ampDoc2);

      // Fallback to cached version when custom element returns null.
      content.getAmpDoc = () => null;
      expect(service.getAmpDoc(content)).to.equal(ampDoc);
    });

    it('should create and cached shadow-doc', () => {
      if (!shadowRoot) {
        return;
      }
      const ampDoc = service.getAmpDoc(content);
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
      }).to.throw(/No root found/);
    });
  });
});


describe('AmpDocSingle', () => {

  let ampdoc;

  beforeEach(() => {
    ampdoc = new AmpDocSingle(window);
  });

  it('should return window', () => {
    expect(ampdoc.win).to.equal(window);
  });

  it('should return document as root', () => {
    expect(ampdoc.getRootNode()).to.equal(window.document);
    expect(ampdoc.isSingleDoc()).to.be.true;
  });

  it('should find element by id', () => {
    const id = 'ampdoc_test_element_' + Date.now();
    const element = document.createElement('div');
    element.setAttribute('id', id);
    document.body.appendChild(element);
    expect(ampdoc.getElementById(id)).to.equal(element);
  });
});


describe('AmpDocShadow', () => {

  let content, host, shadowRoot;
  let ampdoc;

  beforeEach(() => {
    content = document.createElement('div');
    host = document.createElement('div');
    if (host.createShadowRoot) {
      shadowRoot = host.createShadowRoot();
      shadowRoot.appendChild(content);
      ampdoc = new AmpDocShadow(window, shadowRoot);
    }
  });

  it('should return window', () => {
    if (!ampdoc) {
      return;
    }
    expect(ampdoc.win).to.equal(window);
    expect(ampdoc.isSingleDoc()).to.be.false;
  });

  it('should return document as root', () => {
    if (!ampdoc) {
      return;
    }
    expect(ampdoc.getRootNode()).to.equal(shadowRoot);
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
});
