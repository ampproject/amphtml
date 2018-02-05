/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
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

import * as rds from '../../src/render-delaying-services';
import * as sinon from 'sinon';
import * as styles from '../../src/style-installer';
import {AmpDocShadow, AmpDocSingle} from '../../src/service/ampdoc-impl';
import {Services} from '../../src/services';
import {createShadowRoot} from '../../src/shadow-embed';
import {getStyle} from '../../src/style';
import {installPerformanceService} from '../../src/service/performance-impl';
import {setShadowDomSupportedVersionForTesting} from '../../src/web-components';


describe('Styles', () => {

  describes.realWin('makeBodyVisible', {amp: true}, env => {
    let win, doc, ampdoc;
    let resources;
    let tickSpy;
    let schedulePassSpy;
    let waitForServicesStub;

    beforeEach(() => {
      win = env.win;
      doc = win.document;
      ampdoc = env.ampdoc;
      installPerformanceService(win);
      const perf = Services.performanceFor(win);
      tickSpy = sandbox.spy(perf, 'tick');
      resources = Services.resourcesForDoc(ampdoc);
      schedulePassSpy = sandbox.spy(resources, 'schedulePass');
      waitForServicesStub = sandbox.stub(rds, 'waitForServices');
    });

    it('should work with waitForService=false', () => {
      expect(getStyle(doc.body, 'opacity')).to.equal('');
      expect(getStyle(doc.body, 'visibility')).to.equal('');
      expect(getStyle(doc.body, 'animation')).to.equal('');
      expect(ampdoc.signals().get('render-start')).to.be.null;

      styles.makeBodyVisible(doc);
      expect(doc.body).to.exist;
      expect(getStyle(doc.body, 'opacity')).to.equal('1');
      expect(getStyle(doc.body, 'visibility')).to.equal('visible');
      expect(getStyle(doc.body, 'animation')).to.equal('none');
      expect(ampdoc.signals().get('render-start')).to.be.ok;
    });

    it('should ignore resources failures for render-start', () => {
      sandbox.stub(resources, 'renderStarted').callsFake(() => {
        throw new Error('intentional');
      });
      styles.makeBodyVisible(doc);
      expect(ampdoc.signals().get('render-start')).to.be.null;
    });

    it('should wait for render delaying services', () => {
      expect(getStyle(doc.body, 'opacity')).to.equal('');
      expect(getStyle(doc.body, 'visibility')).to.equal('');
      expect(getStyle(doc.body, 'animation')).to.equal('');
      expect(ampdoc.signals().get('render-start')).to.be.null;

      waitForServicesStub.withArgs(win)
          .returns(Promise.resolve(['service1', 'service2']));
      styles.makeBodyVisible(doc, true);
      styles.makeBodyVisible(doc, true); // 2nd call should make no difference
      return new Promise(resolve => {
        setTimeout(resolve, 0);
      }).then(() => {
        expect(getStyle(doc.body, 'opacity')).to.equal('1');
        expect(getStyle(doc.body, 'visibility')).to.equal('visible');
        expect(getStyle(doc.body, 'animation')).to.equal('none');
        expect(tickSpy.withArgs('mbv')).to.be.calledOnce;
        expect(schedulePassSpy.withArgs(1, true)).to.be.calledOnce;
        expect(ampdoc.signals().get('render-start')).to.be.ok;
      });
    });

    it('should skip schedulePass if no render delaying services', () => {
      waitForServicesStub.withArgs(win).returns(Promise.resolve([]));
      styles.makeBodyVisible(doc, true);
      return new Promise(resolve => {
        setTimeout(resolve, 0);
      }).then(() => {
        expect(tickSpy.withArgs('mbv')).to.be.calledOnce;
        expect(schedulePassSpy).to.not.be.calledWith(sinon.match.number, true);
        expect(ampdoc.signals().get('render-start')).to.be.ok;
      });
    });
  });

  describes.repeated('installStylesForDoc', {
    'single': {},
    'shadow native': {},
    'shadow polyfill': {},
  }, variantName => {
    const url = 'https://acme.org/doc1';

    describes.realWin(' ', {}, env => {
      let win, doc, ampdoc;
      let head;

      beforeEach(() => {
        win = env.win;
        doc = win.document;

        // Don't install AMP runtime itself, because test fixtures automatically
        // setup stylesheets as well.
        if (variantName == 'single') {
          ampdoc = new AmpDocSingle(win);
        } else {
          const hostElement = doc.createElement('div');
          doc.body.appendChild(hostElement);
          setShadowDomSupportedVersionForTesting(undefined);
          if (variantName == 'shadow polyfill') {
            setShadowDomSupportedVersionForTesting('none');
          }
          const shadowRoot = createShadowRoot(hostElement);
          ampdoc = new AmpDocShadow(win, url, shadowRoot);
        }
        head = ampdoc.getHeadNode();
      });

      afterEach(() => {
        setShadowDomSupportedVersionForTesting(undefined);
      });

      /**
       * @param {!Document} doc
       * @param {string} cssText
       * @param {boolean} isRuntimeCss
       * @param {string=} opt_ext
       * @return {!Promise<!Element>}
       */
      function installStylesAsPromise(cssText, isRuntimeCss, opt_ext) {
        return new Promise(resolve => {
          styles.installStylesForDoc(ampdoc, cssText, resolve,
              isRuntimeCss, opt_ext);
        });
      }

      it('should install runtime styles', () => {
        const cssText = 'amp-element{}';
        return installStylesAsPromise(cssText, true).then(styleEl => {
          expect(styleEl.parentNode).to.equal(head);
          expect(head.__AMP_CSS_SM['amp-runtime']).to.equal(styleEl);
          expect(styleEl.hasAttribute('amp-runtime')).to.be.true;
          expect(styleEl.textContent).to.match(/amp-element\s*\{/);
        });
      });

      it('should install extension styles after runtime', () => {
        const runtimeCssText = 'amp-runtime{}';
        const extCssText = 'amp-ext1{}';
        return installStylesAsPromise(runtimeCssText, true).then(() => {
          const otherEl = doc.createElement('link');
          head.appendChild(otherEl);
          // Install extension styles.
          return installStylesAsPromise(extCssText, false, 'amp-ext1');
        }).then(styleEl => {
          expect(styleEl.parentNode).to.equal(head);
          expect(styleEl.previousElementSibling)
              .to.equal(head.__AMP_CSS_SM['amp-runtime']);
          expect(styleEl.getAttribute('amp-extension')).to.equal('amp-ext1');
          expect(styleEl.textContent).to.match(/amp-ext1\s*\{/);
        });
      });



      it('should install user styles after everything else', () => {
        const runtimeCssText = 'amp-runtime{}';
        const userCssText = 'user{}';
        const otherEl = doc.createElement('link');
        return installStylesAsPromise(runtimeCssText, true).then(() => {
          head.appendChild(otherEl);
          return installStylesAsPromise(userCssText, false, 'amp-custom');
        }).then(styleEl => {
          expect(styleEl.parentNode).to.equal(head);
          expect(styleEl.previousElementSibling).to.equal(otherEl);
          expect(styleEl.hasAttribute('amp-custom')).to.be.true;
          expect(styleEl.hasAttribute('amp-extension')).to.be.false;
          expect(styleEl.textContent).to.match(/user\s*\{/);
        });
      });

      it('should not create duplicate runtime style', () => {
        let firstStyleEl;
        return installStylesAsPromise('', true).then(styleEl => {
          firstStyleEl = styleEl;
          // Duplicate call.
          return installStylesAsPromise('other{}', true);
        }).then(styleEl => {
          expect(styleEl).to.equal(firstStyleEl);
          expect(styleEl.textContent).to.equal('');
          expect(head.querySelectorAll('style[amp-runtime]'))
              .to.have.length(1);
        });
      });

      it('should discover existing runtime style', () => {
        const serverEl = doc.createElement('style');
        serverEl.setAttribute('amp-runtime', '');
        head.appendChild(serverEl);
        return installStylesAsPromise('other{}', true).then(styleEl => {
          expect(head.__AMP_CSS_SM['amp-runtime']).to.equal(serverEl);
          expect(styleEl).to.equal(serverEl);
          expect(styleEl.textContent).to.equal('');
          expect(head.querySelectorAll('style[amp-runtime]'))
              .to.have.length(1);
        });
      });

      it('should re-create runtime style if absent', () => {
        return installStylesAsPromise('other{}', true).then(styleEl => {
          expect(head.__AMP_CSS_SM['amp-runtime']).to.equal(styleEl);
          expect(styleEl.textContent).to.match(/other\s*\{/);
          expect(head.querySelectorAll('style[amp-runtime]'))
              .to.have.length(1);
        });
      });

      it('should discover existing extension style', () => {
        const serverEl = doc.createElement('style');
        serverEl.setAttribute('amp-extension', 'amp-ext1');
        head.appendChild(serverEl);
        const promise = installStylesAsPromise('other{}', false, 'amp-ext1');
        return promise.then(styleEl => {
          expect(head.__AMP_CSS_SM['amp-runtime']).to.not.exist;
          expect(styleEl).to.equal(serverEl);
          expect(styleEl.textContent).to.equal('');
          expect(head.querySelectorAll('style[amp-extension=amp-ext1]'))
              .to.have.length(1);
        });
      });

      it('should re-create extension style', () => {
        installStylesAsPromise('runtime{}', true);
        const promise = installStylesAsPromise('other{}', false, 'amp-ext1');
        return promise.then(styleEl => {
          expect(styleEl.getAttribute('amp-extension')).to.equal('amp-ext1');
          expect(styleEl.textContent).to.match(/other\s*\{/);
          expect(head.querySelectorAll('style[amp-extension=amp-ext1]'))
              .to.have.length(1);
        });
      });

      it('should re-create extension style w/o cache', () => {
        const runtimeStyle = doc.createElement('style');
        runtimeStyle.setAttribute('amp-runtime', '');
        head.appendChild(runtimeStyle);
        // Additional element to test the correct insertion order.
        head.appendChild(doc.createElement('link'));
        const promise = installStylesAsPromise('other{}', false, 'amp-ext1');
        return promise.then(styleEl => {
          expect(styleEl.getAttribute('amp-extension')).to.equal('amp-ext1');
          expect(styleEl.textContent).to.match(/other\s*\{/);
          expect(head.querySelectorAll('style[amp-extension=amp-ext1]'))
              .to.have.length(1);
          expect(styleEl.previousElementSibling).to.equal(runtimeStyle);
        });
      });

      it('should use the cached extension style', () => {
        const cachedExtStyle = doc.createElement('style');
        cachedExtStyle.textContent = 'ext1{}';
        head.appendChild(cachedExtStyle);
        head.__AMP_CSS_SM = {
          'amp-extension=amp-ext1': cachedExtStyle,
        };
        const promise = installStylesAsPromise('other{}', false, 'amp-ext1');
        return promise.then(styleEl => {
          expect(styleEl).to.equal(cachedExtStyle);
          expect(head.__AMP_CSS_SM['amp-extension=amp-ext1'])
              .to.equal(cachedExtStyle);
          // Ensure the style is not re-inserted.
          expect(head.querySelectorAll('style[amp-extension=amp-ext1]'))
              .to.have.length(0);
        });
      });

      it('should create a amp-custom style', () => {
        const promise = installStylesAsPromise(
            'other{}', false, 'amp-custom');
        return promise.then(styleEl => {
          expect(styleEl.getAttribute('amp-custom')).to.equal('');
          expect(head.lastElementChild).to.equal(styleEl);
          expect(styleEl.textContent).to.match(/other\s*\{/);
          expect(head.querySelectorAll('style[amp-custom]'))
              .to.have.length(1);
        });
      });

      it('should create a amp-keyframes style', () => {
        const promise = installStylesAsPromise(
            'other{}', false, 'amp-keyframes');
        return promise.then(styleEl => {
          expect(styleEl.getAttribute('amp-keyframes')).to.equal('');
          expect(head.lastElementChild).to.equal(styleEl);
          expect(styleEl.textContent).to.match(/other\s*\{/);
          expect(head.querySelectorAll('style[amp-keyframes]'))
              .to.have.length(1);
        });
      });

      it('should use a transform', () => {
        styles.installCssTransformer(head, function(css) {
          return css.toUpperCase();
        });
        const promise1 = installStylesAsPromise('style1{}', true);
        const promise2 = installStylesAsPromise(
            'style2{}', false, 'amp-ext1');
        const promise3 = installStylesAsPromise(
            'style3{}', false, 'amp-custom');
        return Promise.all([promise1, promise2, promise3]).then(styleEls => {
          expect(styleEls).to.have.length(3);
          expect(styleEls[0].textContent).to.contain('STYLE1');
          expect(styleEls[1].textContent).to.contain('STYLE2');
          expect(styleEls[2].textContent).to.contain('STYLE3');
        });
      });
    });
  });


  describes.realWin('installStylesLegacy', {}, env => {
    let win, doc;

    beforeEach(() => {
      win = env.win;
      doc = win.document;
    });

    /**
     * @param {!Document} doc
     * @param {string} cssText
     * @param {boolean} isRuntimeCss
     * @param {string=} opt_ext
     * @return {!Promise<!Element>}
     */
    function installStylesAsPromise(cssText, isRuntimeCss, opt_ext) {
      return new Promise(resolve => {
        styles.installStylesLegacy(doc, cssText, resolve,
            isRuntimeCss, opt_ext);
      });
    }

    it('should install runtime styles', () => {
      const cssText = '/*amp-runtime*/';
      return installStylesAsPromise(cssText, true).then(styleEl => {
        expect(styleEl.parentElement).to.equal(doc.head);
        expect(doc.head.__AMP_CSS_SM['amp-runtime']).to.equal(styleEl);
        expect(styleEl.hasAttribute('amp-runtime')).to.be.true;
        expect(styleEl.textContent).to.equal(cssText);
      });
    });

    it('should install extension styles after runtime', () => {
      const runtimeCssText = '/*amp-runtime*/';
      const extCssText = '/*amp-ext1*/';
      return installStylesAsPromise(runtimeCssText, true).then(() => {
        const otherEl = doc.createElement('link');
        doc.head.appendChild(otherEl);
        // Install extension styles.
        return installStylesAsPromise(extCssText, false, 'amp-ext1');
      }).then(styleEl => {
        expect(styleEl.parentElement).to.equal(doc.head);
        expect(styleEl.previousElementSibling)
            .to.equal(doc.head.__AMP_CSS_SM['amp-runtime']);
        expect(styleEl.getAttribute('amp-extension')).to.equal('amp-ext1');
        expect(styleEl.textContent).to.equal(extCssText);
      });
    });

    it('should create a amp-custom style', () => {
      const promise = installStylesAsPromise('/*other*/', false, 'amp-custom');
      return promise.then(styleEl => {
        expect(styleEl.getAttribute('amp-custom')).to.equal('');
        expect(doc.head.lastElementChild).to.equal(styleEl);
        expect(styleEl.textContent).to.equal('/*other*/');
        expect(doc.head.querySelectorAll('style[amp-custom]'))
            .to.have.length(1);
      });
    });
  });
});
