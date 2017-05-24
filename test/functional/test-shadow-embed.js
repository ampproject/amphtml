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
import {
  ShadowDomWriter,
  copyRuntimeStylesToShadowRoot,
  createShadowEmbedRoot,
  createShadowRoot,
  getShadowRootNode,
  importShadowBody,
  installStylesForShadowRoot,
  isShadowRoot,
  scopeShadowCss,
} from '../../src/shadow-embed';
import {ampdocServiceFor} from '../../src/ampdoc';
import {
  setShadowDomSupportedVersionForTesting,
  ShadowDomVersion,
} from '../../src/web-components';
import {extensionsFor} from '../../src/services';
import * as sinon from 'sinon';


describes.sandboxed('shadow-embed', {}, () => {
  afterEach(() => {
    setShadowDomSupportedVersionForTesting(undefined);
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

  [ShadowDomVersion.NONE, ShadowDomVersion.V0, ShadowDomVersion.V1]
      .forEach(scenario => {
        describe('shadow APIs ' + scenario, () => {
          let hostElement;

          beforeEach(function() {
            hostElement = document.createElement('div');
            setShadowDomSupportedVersionForTesting(scenario);

            if (scenario == ShadowDomVersion.V0 &&
                !Element.prototype.createShadowRoot) {
              this.skip();
            }

            if (scenario == ShadowDomVersion.V1 &&
                !Element.prototype.attachShadow) {
              this.skip();
            }
          });

          it('should transform CSS installStylesForShadowRoot', () => {
            const shadowRoot = createShadowRoot(hostElement);
            const style = installStylesForShadowRoot(
                shadowRoot, 'body {}', true);
            expect(shadowRoot.contains(style)).to.be.true;
            const css = style.textContent.replace(/\s/g, '');
            if (scenario == ShadowDomVersion.NONE) {
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

            if (scenario == ShadowDomVersion.NONE) {
              it('should add id for polyfill', () => {
                const shadowRoot = createShadowRoot(hostElement);
                expect(shadowRoot.tagName).to.equal('I-AMPHTML-SHADOW-ROOT');
                expect(shadowRoot.id).to.match(/i-amphtml-sd-\d+/);
              });
            }
          });

          describe('importShadowBody', () => {
            let shadowRoot, source, child1, child2;

            beforeEach(() => {
              shadowRoot = createShadowRoot(hostElement);
              source = document.createElement('body');
              child1 = document.createElement('div');
              child1.id = 'child1';
              child2 = document.createElement('div');
              child2.id = 'child2';
              source.appendChild(child1);
              source.appendChild(child2);
            });

            it('should import body with all children', () => {
              expect(shadowRoot.body).to.be.undefined;
              const body = importShadowBody(shadowRoot, source, true);
              expect(shadowRoot.body).to.equal(body);
              expect(body.tagName).to.equal(
                  scenario == ShadowDomVersion.NONE ? 'AMP-BODY' : 'BODY');
              expect(body.style.position).to.equal('relative');
              if (scenario == ShadowDomVersion.NONE) {
                expect(body.style.display).to.equal('block');
              }
              expect(shadowRoot.contains(body)).to.be.true;
              expect(body.children).to.have.length(2);
              expect(body.children[0].id).to.equal('child1');
              expect(body.children[1].id).to.equal('child2');
            });

            it('should import shallow body', () => {
              expect(shadowRoot.body).to.be.undefined;
              const body = importShadowBody(shadowRoot, source, false);
              expect(shadowRoot.body).to.equal(body);
              expect(body.tagName).to.equal(
                  scenario == ShadowDomVersion.NONE ? 'AMP-BODY' : 'BODY');
              expect(body.style.position).to.equal('relative');
              if (scenario == ShadowDomVersion.NONE) {
                expect(body.style.display).to.equal('block');
              }
              expect(shadowRoot.contains(body)).to.be.true;
              expect(body.children).to.have.length(0);
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

    it('should yield true for natively-supported attachShadow API', () => {
      const element = document.createElement('div');
      if (element.attachShadow) {
        const shadowRoot = element.attachShadow({mode: 'open'});
        expect(isShadowRoot(shadowRoot)).to.be.true;
      }
    });

    it('should yield false for document-fragment non-shadow-root node', () => {
      const fragment = document.createDocumentFragment();
      expect(isShadowRoot(fragment)).to.be.false;
    });

    it('should yield true for polyfill', () => {
      expect(isShadowRoot(document.createElement(
          'i-amphtml-shadow-root'))).to.be.true;
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
      setShadowDomSupportedVersionForTesting(ShadowDomVersion.NONE);
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

  describes.fakeWin('ShadowDomWriter', {amp: true}, env => {
    let win;
    let writer;
    let onBodySpy, onBodyChunkSpy;
    let onBodyPromise, onBodyChunkPromiseResolver, onEndPromise;

    beforeEach(() => {
      win = env.win;
      writer = new ShadowDomWriter(win);
      onBodySpy = sandbox.spy();
      onBodyChunkSpy = sandbox.spy();
      onBodyPromise = new Promise(resolve => {
        writer.onBody(parsedDoc => {
          resolve(parsedDoc.body);
          onBodySpy();
          return win.document.body;
        });
      });
      writer.onBodyChunk(() => {
        if (onBodyChunkPromiseResolver) {
          onBodyChunkPromiseResolver();
          onBodyChunkPromiseResolver = null;
        }
        onBodyChunkSpy();
      });
      onEndPromise = new Promise(resolve => {
        writer.onEnd(resolve);
      });
    });

    function waitForNextBodyChunk() {
      return new Promise(resolve => {
        onBodyChunkPromiseResolver = resolve;
      });
    }

    it('should complete when writer has been closed', () => {
      writer.close();
      return onEndPromise.then(() => {
        expect(onBodySpy).to.be.calledOnce;
        env.flushVsync();
        expect(onBodyChunkSpy).to.not.be.called;
      });
    });

    it('should resolve body as soon as available', () => {
      writer.write('<body class="b">');
      expect(onBodySpy).to.not.be.called;
      return onBodyPromise.then(body => {
        expect(body.getAttribute('class')).to.equal('b');
        expect(onBodySpy).to.be.calledOnce;
      });
    });

    it('should schedule body chunk', () => {
      writer.write('<body>');
      return onBodyPromise.then(() => {
        expect(onBodySpy).to.be.calledOnce;
        writer.write('<child>');
        expect(onBodyChunkSpy).to.not.be.called;
        return waitForNextBodyChunk().then(() => {
          env.flushVsync();
          expect(onBodySpy).to.be.calledOnce;
          expect(onBodyChunkSpy).to.be.calledOnce;
          expect(win.document.body.querySelector('child')).to.exist;

          writer.write('</child><child2>');
          return waitForNextBodyChunk().then(() => {
            env.flushVsync();
            expect(win.document.body.querySelector('child2')).to.exist;
          });
        });
      });
    });

    it('should schedule several body chunks together', () => {
      writer.write('<body>');
      return onBodyPromise.then(() => {
        expect(onBodySpy).to.be.calledOnce;
        writer.write('<child></child>');
        expect(onBodyChunkSpy).to.not.be.called;
        const promise = waitForNextBodyChunk();
        writer.write('<child2></child2>');
        return promise.then(() => {
          expect(onBodyChunkSpy).to.be.calledOnce;
          expect(win.document.body.querySelector('child')).to.exist;
          expect(win.document.body.querySelector('child2')).to.exist;
        });
      });
    });
  });
});
