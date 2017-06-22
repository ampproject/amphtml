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

import {getStyle} from '../../src/style';
import * as rds from '../../src/render-delaying-services';
import {
  installPerformanceService,
  performanceFor,
} from '../../src/service/performance-impl';
import {createIframePromise} from '../../testing/iframe';
import {installResourcesServiceForDoc} from '../../src/service/resources-impl';
import {resourcesForDoc} from '../../src/services';
import * as sinon from 'sinon';
import * as styles from '../../src/style-installer';


describe('Styles', () => {

  let sandbox;
  let win;
  let doc;
  let resources;
  let ampdoc;
  let tickSpy;
  let schedulePassSpy;
  let waitForServicesStub;

  beforeEach(() => {
    return createIframePromise().then(iframe => {
      sandbox = sinon.sandbox.create();
      win = iframe.win;
      doc = win.document;
      installPerformanceService(doc.defaultView);
      const perf = performanceFor(doc.defaultView);
      tickSpy = sandbox.spy(perf, 'tick');
      installResourcesServiceForDoc(doc);
      resources = resourcesForDoc(doc);
      ampdoc = resources.ampdoc;
      schedulePassSpy = sandbox.spy(resources, 'schedulePass');
      waitForServicesStub = sandbox.stub(rds, 'waitForServices');
    });
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('makeBodyVisible', () => {

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
      sandbox.stub(resources, 'renderStarted', () => {
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

  describes.realWin('installStyles', {}, env => {
    let win;
    let doc;

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
        styles.installStyles(doc, cssText, styleEl => {
          resolve(styleEl);
        }, isRuntimeCss, opt_ext);
      });
    }

    it('should install runtime styles', () => {
      const cssText = '/*amp-runtime*/';
      return installStylesAsPromise(cssText, true).then(styleEl => {
        expect(styleEl.parentElement).to.equal(doc.head);
        expect(doc.head.runtimeStyleElement).to.equal(styleEl);
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
            .to.equal(doc.head.runtimeStyleElement);
        expect(styleEl.getAttribute('amp-extension')).to.equal('amp-ext1');
        expect(styleEl.textContent).to.equal(extCssText);
      });
    });

    it('should install user styles after everything else', () => {
      const runtimeCssText = '/*amp-runtime*/';
      const userCssText = '/*user*/';
      const otherEl = doc.createElement('link');
      return installStylesAsPromise(runtimeCssText, true).then(() => {
        doc.head.appendChild(otherEl);
        return installStylesAsPromise(userCssText, false, 'amp-custom');
      }).then(styleEl => {
        expect(styleEl.parentElement).to.equal(doc.head);
        expect(styleEl.previousElementSibling).to.equal(otherEl);
        expect(styleEl.hasAttribute('amp-custom')).to.be.true;
        expect(styleEl.hasAttribute('amp-extension')).to.be.false;
        expect(styleEl.textContent).to.equal(userCssText);
      });
    });

    it('should not create duplicate runtime style', () => {
      let firstStyleEl;
      return installStylesAsPromise('', true).then(styleEl => {
        firstStyleEl = styleEl;
        // Duplicate call.
        return installStylesAsPromise('/*other*/', true);
      }).then(styleEl => {
        expect(styleEl).to.equal(firstStyleEl);
        expect(styleEl.textContent).to.equal('');
        expect(doc.head.querySelectorAll('style[amp-runtime]'))
            .to.have.length(1);
      });
    });

    describe('server layout', () => {

      beforeEach(() => {
        doc.documentElement.setAttribute('i-amphtml-layout', '');
      });

      it('should discover runtime style', () => {
        const serverEl = doc.createElement('style');
        serverEl.setAttribute('amp-runtime', '');
        doc.head.appendChild(serverEl);
        return installStylesAsPromise('/*other*/', true).then(styleEl => {
          expect(doc.head.runtimeStyleElement).to.equal(serverEl);
          expect(styleEl).to.equal(serverEl);
          expect(styleEl.textContent).to.equal('');
          expect(doc.head.querySelectorAll('style[amp-runtime]'))
              .to.have.length(1);
        });
      });

      it('should re-create runtime style if absent', () => {
        return installStylesAsPromise('/*other*/', true).then(styleEl => {
          expect(doc.head.runtimeStyleElement).to.equal(styleEl);
          expect(styleEl.textContent).to.equal('/*other*/');
          expect(doc.head.querySelectorAll('style[amp-runtime]'))
              .to.have.length(1);
        });
      });

      it('should discover extension style', () => {
        const serverEl = doc.createElement('style');
        serverEl.setAttribute('amp-extension', 'amp-ext1');
        doc.head.appendChild(serverEl);
        const promise = installStylesAsPromise('/*other*/', false, 'amp-ext1');
        return promise.then(styleEl => {
          expect(doc.head.runtimeStyleElement).to.not.exist;
          expect(styleEl).to.equal(serverEl);
          expect(styleEl.textContent).to.equal('');
          expect(doc.head.querySelectorAll('style[amp-extension=amp-ext1]'))
              .to.have.length(1);
        });
      });

      it('should re-create extension style', () => {
        const promise = installStylesAsPromise('/*other*/', false, 'amp-ext1');
        return promise.then(styleEl => {
          expect(doc.head.runtimeStyleElement).to.not.exist;
          expect(styleEl.getAttribute('amp-extension')).to.equal('amp-ext1');
          expect(styleEl.textContent).to.equal('/*other*/');
          expect(doc.head.querySelectorAll('style[amp-extension=amp-ext1]'))
              .to.have.length(1);
        });
      });
    });
  });
});
