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

import {AmpDocShadow} from '../../src/service/ampdoc-impl';
import {ampdocServiceFor} from '../../src/ampdoc';
import {
  copyRuntimeStylesToShadowRoot,
  createShadowEmbedRoot,
  createShadowRoot,
  getShadowRootNode,
  importShadowBody,
  installStylesForShadowRoot,
  isShadowDomSupported,
  isShadowRoot,
  scopeShadowCss,
  setShadowDomSupportedForTesting,
} from '../../src/shadow-embed';
import {extensionsFor} from '../../src/extensions';
import * as sinon from 'sinon';


describe('shadow-embed', () => {
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
  });

  afterEach(() => {
    setShadowDomSupportedForTesting(undefined);
    sandbox.restore();
  });

  it('should report whether native shadow dom supported', () => {
    expect(isShadowDomSupported()).to.equal(
        !!Element.prototype.createShadowRoot);
  });

  it('should copy runtime styles from ampdoc', () => {
    const parentRoot = document.createElement('div');
    const style = document.createElement('style');
    style.setAttribute('amp-runtime', '');
    style.textContent = '.cssClass{}';
    parentRoot.appendChild(style);
    const hostElement = document.createElement('div');
    const shadowRoot = createShadowRoot(hostElement);
    const ampdoc = new AmpDocShadow(window, 'https://a.org/', parentRoot);

    copyRuntimeStylesToShadowRoot(ampdoc, shadowRoot);

    const copy = shadowRoot.querySelector('style[amp-runtime]');
    expect(copy).to.exist;
    expect(copy.textContent).to.contain('.cssClass');
    expect(copy).to.not.equal(style);
  });

  ['native', 'polyfill'].forEach(scenario => {
    describe('shadow APIs ' + scenario, () => {
      let hostElement;

      beforeEach(function() {
        hostElement = document.createElement('div');
        if (scenario == 'polyfill') {
          setShadowDomSupportedForTesting(false);
        }
        if (scenario == 'native' && !isShadowDomSupported()) {
          this.skip();
        }
      });

      it('should transform CSS installStylesForShadowRoot', () => {
        const shadowRoot = createShadowRoot(hostElement);
        const style = installStylesForShadowRoot(shadowRoot, 'body {}', true);
        expect(shadowRoot.contains(style)).to.be.true;
        const css = style.textContent.replace(/\s/g, '');
        if (scenario == 'polyfill') {
          expect(css).to.match(/amp-body/);
        } else {
          expect(css).to.equal('body{}');
        }
      });

      describe('createShadowRoot', () => {
        it('should clear duplicate root', () => {
          const shadowRoot1 = createShadowRoot(hostElement);
          const span = document.createElement('span');
          shadowRoot1.appendChild(span);
          expect(shadowRoot1.contains(span)).to.be.true;

          const shadowRoot2 = createShadowRoot(hostElement);
          expect(shadowRoot2).to.equal(shadowRoot1);
          expect(shadowRoot2.contains(span)).to.be.false;
        });

        it('should have host', () => {
          const shadowRoot = createShadowRoot(hostElement);
          expect(shadowRoot.host).to.equal(hostElement);
        });

        it('should have getElementById', () => {
          const shadowRoot = createShadowRoot(hostElement);
          expect(shadowRoot.getElementById).to.be.ok;

          const spanId = 'test' + Math.floor(Math.random() * 10000);
          const span = document.createElement('span');
          span.id = spanId;
          shadowRoot.appendChild(span);
          expect(shadowRoot.getElementById(spanId)).to.equal(span);
        });

        if (scenario == 'polyfill') {
          it('should add id for polyfill', () => {
            const shadowRoot = createShadowRoot(hostElement);
            expect(shadowRoot.tagName).to.equal('I-AMP-SHADOW-ROOT');
            expect(shadowRoot.id).to.match(/i-amp-sd-\d+/);
          });
        }
      });

      describe('importShadowBody', () => {
        it('should import body with all children', () => {
          const shadowRoot = createShadowRoot(hostElement);
          const source = document.createElement('body');
          const child1 = document.createElement('div');
          child1.id = 'child1';
          const child2 = document.createElement('div');
          child2.id = 'child2';
          source.appendChild(child1);
          source.appendChild(child2);

          const body = importShadowBody(shadowRoot, source);
          expect(body.tagName).to.equal(
              scenario == 'native' ? 'BODY' : 'AMP-BODY');
          expect(body.style.position).to.equal('relative');
          if (scenario == 'polyfill') {
            expect(body.style.display).to.equal('block');
          }
          expect(shadowRoot.contains(body)).to.be.true;
          expect(body.children).to.have.length(2);
          expect(body.children[0].id).to.equal('child1');
          expect(body.children[1].id).to.equal('child2');
        });
      });
    });
  });

  describe('isShadowRoot', () => {

    it('should yield false for non-nodes', () => {
      expect(isShadowRoot(null)).to.be.false;
      expect(isShadowRoot(undefined)).to.be.false;
      expect(isShadowRoot('')).to.be.false;
      expect(isShadowRoot(11)).to.be.false;
    });

    it('should yield false for other types of nodes', () => {
      expect(isShadowRoot(document.createElement('div'))).to.be.false;
      expect(isShadowRoot(document.createTextNode('abc'))).to.be.false;
    });

    it('should yield true for natively-supported createShadowRoot API', () => {
      const element = document.createElement('div');
      if (element.createShadowRoot) {
        const shadowRoot = element.createShadowRoot();
        expect(isShadowRoot(shadowRoot)).to.be.true;
      }
    });

    it('should yield false for document-fragment non-shadow-root node', () => {
      const fragment = document.createDocumentFragment();
      expect(isShadowRoot(fragment)).to.be.false;
    });

    it('should yield true for polyfill', () => {
      expect(isShadowRoot(document.createElement(
          'i-amp-shadow-root'))).to.be.true;
    });
  });

  describe('getShadowRootNode', () => {
    let content, host, shadowRoot;

    beforeEach(() => {
      host = document.createElement('div');
      shadowRoot = createShadowRoot(host);
      content = document.createElement('span');
      shadowRoot.appendChild(content);
    });

    it('should find itself as the root node', () => {
      expect(getShadowRootNode(shadowRoot)).to.equal(shadowRoot);
    });

    it('should find the root node from ancestors', () => {
      expect(getShadowRootNode(content)).to.equal(shadowRoot);
    });

    it('should find the root node via polyfill', () => {
      setShadowDomSupportedForTesting(false);
      expect(getShadowRootNode(content)).to.equal(shadowRoot);
    });
  });

  describe('createShadowEmbedRoot', () => {
    let extensionsMock;
    let hostElement;

    beforeEach(() => {
      const extensions = extensionsFor(window);
      extensionsMock = sandbox.mock(extensions);

      hostElement = document.createElement('div');
      if (!hostElement.createShadowRoot) {
        hostElement.createShadowRoot = () => {
          const shadowRoot = document.createElement('shadow');
          hostElement.appendChild(shadowRoot);
          hostElement.shadowRoot = shadowRoot;
          shadowRoot.host = hostElement;
        };
      }

      const root = document.createElement('div');
      const style = document.createElement('style');
      style.setAttribute('amp-runtime', '');
      root.appendChild(style);
      const ampdoc = new AmpDocShadow(window, 'https://a.org/', root);
      const ampdocService = ampdocServiceFor(window);
      sandbox.stub(ampdocService, 'getAmpDoc', () => ampdoc);
    });

    afterEach(() => {
      extensionsMock.verify();
    });

    it('should create shadow root and context', () => {
      const shadowRoot = createShadowEmbedRoot(hostElement, []);
      expect(shadowRoot).to.exist;
      expect(shadowRoot.AMP).to.exist;
    });

    it('should install runtime styles', () => {
      const shadowRoot = createShadowEmbedRoot(hostElement, []);
      expect(shadowRoot.querySelector('style[amp-runtime]')).to.exist;
    });

    it('should install extensions', () => {
      extensionsMock.expects('loadExtension')
          .withExactArgs('amp-ext1')
          .returns(Promise.resolve({}))
          .once();
      let savedShadowRoot;
      extensionsMock.expects('installFactoriesInShadowRoot')
          .withExactArgs(sinon.match(arg => {
            savedShadowRoot = arg;
            return true;
          }), ['amp-ext1'])
          .returns(Promise.resolve())
          .once();
      const shadowRoot = createShadowEmbedRoot(hostElement, ['amp-ext1']);
      expect(savedShadowRoot).to.equal(shadowRoot);
    });
  });

  describe('scopeShadowCss', () => {
    let shadowRoot;

    beforeEach(() => {
      shadowRoot = document.createElement('div');
      shadowRoot.id = 'h';
    });

    function scope(css) {
      return scopeShadowCss(shadowRoot, css).replace(/[\n\t\n]/g, '');
    }

    it('should replace root selectors', () => {
      expect(scope('html {}')).to.equal('#h amp-html {}');
      expect(scope('body {}')).to.equal('#h amp-body {}');
      expect(scope('html {} body {}')).to.equal(
          '#h amp-html {}#h amp-body {}');
      expect(scope('html, body {}')).to.equal('#h amp-html, #h amp-body {}');
      expect(scope('body.x {}')).to.equal('#h amp-body.x {}');
      expect(scope('body::after {}')).to.equal('#h amp-body::after {}');
      expect(scope('body[x] {}')).to.equal('#h amp-body[x] {}');
    });

    it('should avoid false positives for root selectors', () => {
      expect(scope('.body {}')).to.equal('#h .body {}');
      expect(scope('x-body {}')).to.equal('#h x-body {}');
      expect(scope('body-x {}')).to.equal('#h body-x {}');
      expect(scope('body_x {}')).to.equal('#h body_x {}');
      expect(scope('body1 {}')).to.equal('#h body1 {}');
    });
  });
});
