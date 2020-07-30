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
import {DomWriterBulk, DomWriterStreamer} from '../../src/utils/dom-writer';
import {
  ShadowDomVersion,
  setShadowCssSupportedForTesting,
  setShadowDomSupportedVersionForTesting,
} from '../../src/web-components';
import {
  createShadowDomWriter,
  createShadowRoot,
  getShadowRootNode,
  importShadowBody,
  installShadowStyle,
  resetShadowStyleCacheForTesting,
  scopeShadowCss,
  setShadowDomStreamingSupportedForTesting,
} from '../../src/shadow-embed';
import {installStylesForDoc} from '../../src/style-installer';
import {toArray} from '../../src/types';

describes.sandboxed('shadow-embed', {}, () => {
  afterEach(() => {
    setShadowDomSupportedVersionForTesting(undefined);
  });

  [ShadowDomVersion.NONE, ShadowDomVersion.V0, ShadowDomVersion.V1].forEach(
    (scenario) => {
      describe('shadow APIs', () => {
        let hostElement;

        beforeEach(function () {
          hostElement = document.createElement('div');
          setShadowDomSupportedVersionForTesting(scenario);
          setShadowCssSupportedForTesting(undefined);
        });

        describe(scenario, function () {
          before(function () {
            if (
              scenario == ShadowDomVersion.V0 &&
              !Element.prototype.createShadowRoot
            ) {
              this.skipTest();
            }

            if (
              scenario == ShadowDomVersion.V1 &&
              !Element.prototype.attachShadow
            ) {
              this.skipTest();
            }
          });

          it('should transform CSS installStylesForDoc for shadow root', () => {
            const shadowRoot = createShadowRoot(hostElement);
            const ampdoc = new AmpDocShadow(
              window,
              'https://a.org/',
              shadowRoot
            );
            const style = installStylesForDoc(ampdoc, 'body {}', null, true);
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

              it('should add host style for polyfill', () => {
                const doc = hostElement.ownerDocument;
                doc.body.appendChild(hostElement);
                const slot = doc.createElement('div');
                hostElement.appendChild(slot);
                expect(slot).to.have.display('block');
                const shadowRoot = createShadowRoot(hostElement);
                expect(hostElement).to.have.class(
                  'i-amphtml-shadow-host-polyfill'
                );
                expect(slot).to.have.display('none');
                expect(shadowRoot).to.not.have.display('none');
                doc.body.removeChild(hostElement);
              });
            }

            // Test scenarios where Shadow Css is not supported
            it('Should add an id and class for CSS \
                encapsulation to the shadow root', () => {
              setShadowCssSupportedForTesting(false);
              const shadowRoot = createShadowRoot(hostElement);
              expect(shadowRoot.id).to.match(/i-amphtml-sd-\d+/);
              // Browserify does not support arrow functions with params.
              // Using Old School for
              const shadowRootClassListArray = toArray(
                shadowRoot.host.classList
              );
              let foundShadowCssClass = false;
              for (let i = 0; i < shadowRootClassListArray.length; i++) {
                if (shadowRootClassListArray[i].match(/i-amphtml-sd-\d+/)) {
                  foundShadowCssClass = true;
                  break;
                }
              }
              expect(foundShadowCssClass).to.be.ok;
            });

            it('Should transform CSS for the shadow root', () => {
              setShadowCssSupportedForTesting(false);
              const shadowRoot = createShadowRoot(hostElement);
              const ampdoc = new AmpDocShadow(
                window,
                'https://a.org/',
                shadowRoot
              );
              const style = installStylesForDoc(ampdoc, 'body {}', null, true);
              expect(shadowRoot.contains(style)).to.be.true;
              const css = style.textContent.replace(/\s/g, '');
              expect(css).to.match(/amp-body/);
            });
          });

          describe('stylesheets', () => {
            let parentStylesheet;

            beforeEach(() => {
              parentStylesheet = document.createElement('style');
              parentStylesheet.textContent = '.x {background: red}';
              document.body.appendChild(parentStylesheet);
              document.body.appendChild(hostElement);
            });

            afterEach(() => {
              document.body.removeChild(parentStylesheet);
              document.body.removeChild(hostElement);
            });

            it('should have shadow stylesheets and not global', () => {
              const shadowRoot = createShadowRoot(hostElement);
              const shadowStyle = document.createElement('style');
              shadowStyle.textContent = '.x {background: green}';
              shadowRoot.appendChild(shadowStyle);

              const {styleSheets} = shadowRoot;
              expect(styleSheets).to.exist;
              expect(styleSheets).to.have.length(1);
              expect(styleSheets[0].ownerNode).to.equal(shadowStyle);
            });
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
                scenario == ShadowDomVersion.NONE ? 'AMP-BODY' : 'BODY'
              );
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
                scenario == ShadowDomVersion.NONE ? 'AMP-BODY' : 'BODY'
              );
              expect(body.style.position).to.equal('relative');
              if (scenario == ShadowDomVersion.NONE) {
                expect(body.style.display).to.equal('block');
              }
              expect(shadowRoot.contains(body)).to.be.true;
              expect(body.children).to.have.length(0);
            });

            it('should allow reusing same body', () => {
              const firstBody = importShadowBody(shadowRoot, source, true);
              const newSource = document.createElement('body');
              newSource.appendChild(document.createElement('span'));
              const secondBody = importShadowBody(shadowRoot, newSource, true);

              expect(shadowRoot.body).to.equal(secondBody);
              expect(shadowRoot.children).to.have.length(1);
              expect(firstBody).not.to.equal(secondBody);
              expect(secondBody.children).to.have.length(1);
              expect(secondBody.firstChild.tagName).to.equal('SPAN');
            });
          });
        });
      });
    }
  );

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
      expect(scope('html {}')).to.equal('.h amp-html {}');
      expect(scope('body {}')).to.equal('.h amp-body {}');
      expect(scope('html {} body {}')).to.equal('.h amp-html {}.h amp-body {}');
      expect(scope('html, body {}')).to.equal('.h amp-html, .h amp-body {}');
      expect(scope('body.x {}')).to.equal('.h amp-body.x {}');
      expect(scope('body::after {}')).to.equal('.h amp-body::after {}');
      expect(scope('body[x] {}')).to.equal('.h amp-body[x] {}');
    });

    it('should avoid false positives for root selectors', () => {
      expect(scope('.body {}')).to.equal('.h .body {}');
      expect(scope('x-body {}')).to.equal('.h x-body {}');
      expect(scope('body-x {}')).to.equal('.h body-x {}');
      expect(scope('body_x {}')).to.equal('.h body_x {}');
      expect(scope('body1 {}')).to.equal('.h body1 {}');
    });
  });

  describe('installShadowStyle', () => {
    let shadowRoot, shadowRoot2;

    beforeEach(() => {
      shadowRoot = document.createElement('div');
      shadowRoot2 = document.createElement('div');
    });

    afterEach(() => {
      resetShadowStyleCacheForTesting(window);
    });

    it('should re-use constructable stylesheet when supported', function () {
      try {
        new CSSStyleSheet();
      } catch (e) {
        // Leave. Not supported.
        this.skip();
        return;
      }

      shadowRoot.adoptedStyleSheets = [];
      installShadowStyle(shadowRoot, 'A', '* {color: red}');

      expect(shadowRoot.adoptedStyleSheets).to.have.length(1);
      const styleSheet1 = shadowRoot.adoptedStyleSheets[0];
      expect(styleSheet1.rules).to.have.length(1);
      expect(styleSheet1.rules[0].cssText.replace(/(\s|;)/g, '')).to.equal(
        '*{color:red}'
      );
      expect(shadowRoot.querySelector('style')).to.be.null;

      // A different stylesheet.
      installShadowStyle(shadowRoot, 'B', '* {color: blue}');
      expect(shadowRoot.adoptedStyleSheets).to.have.length(2);

      // Repeated call uses the cache.
      shadowRoot2.adoptedStyleSheets = [];
      installShadowStyle(shadowRoot2, 'A', 'not even CSS');
      expect(shadowRoot2.adoptedStyleSheets).to.have.length(1);
      expect(shadowRoot2.adoptedStyleSheets[0]).to.equal(styleSheet1);

      // A different stylesheet in a differet root.
      shadowRoot2.adoptedStyleSheets = [];
      installShadowStyle(shadowRoot2, 'B', '* {color: blue}');
      expect(shadowRoot2.adoptedStyleSheets).to.have.length(1);
      expect(shadowRoot2.adoptedStyleSheets[0]).to.not.equal(styleSheet1);
    });

    it('should create a legacy stylesheet when constructable not supported', () => {
      installShadowStyle(shadowRoot, 'A', '* {color: red}');

      const styleEl = shadowRoot.querySelector('style');
      expect(styleEl.textContent).to.equal('* {color: red}');
    });
  });

  describe('createShadowDomWriter', () => {
    let createHTMLDocumentSpy;
    let win;
    let isFirefox;

    beforeEach(() => {
      createHTMLDocumentSpy = window.sandbox.spy();
      isFirefox = false;
      const platform = {
        isFirefox: () => isFirefox,
      };
      win = {
        navigator: {
          userAgent: '',
        },
        document: {
          implementation: {
            createHTMLDocument: (type) => {
              createHTMLDocumentSpy(type);
              return {
                open: () => {},
              };
            },
          },
        },
        __AMP_SERVICES: {
          'platform': {obj: platform},
          'vsync': {obj: {}},
        },
      };
    });

    afterEach(() => {
      setShadowDomStreamingSupportedForTesting(undefined);
    });

    it('should resolve to streamer', () => {
      expect(createShadowDomWriter(win)).to.be.instanceOf(DomWriterStreamer);
      expect(createHTMLDocumentSpy).to.be.calledOnce;
      expect(createHTMLDocumentSpy).to.be.calledWith('');
    });

    it('should resolve to bulk without API', () => {
      delete win.document.implementation.createHTMLDocument;
      expect(createShadowDomWriter(win)).to.be.instanceOf(DomWriterBulk);
      delete win.document.implementation;
      expect(createShadowDomWriter(win)).to.be.instanceOf(DomWriterBulk);
      expect(createHTMLDocumentSpy).to.not.be.called;
    });

    it('should resolve to bulk on firefox', () => {
      isFirefox = true;
      expect(createShadowDomWriter(win)).to.be.instanceOf(DomWriterBulk);
      expect(createHTMLDocumentSpy).to.not.be.called;
    });
  });
});
