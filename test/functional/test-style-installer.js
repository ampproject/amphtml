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
import {installPerformanceService} from '../../src/service/performance-impl';
import {createIframePromise} from '../../testing/iframe';
import {installResourcesServiceForDoc} from '../../src/service/resources-impl';
import * as sinon from 'sinon';
import * as styles from '../../src/style-installer';


describe('Styles', () => {

  let sandbox;
  let win;
  let doc;
  let tickSpy;
  let schedulePassSpy;
  let waitForServicesStub;

  beforeEach(() => {
    return createIframePromise().then(iframe => {
      sandbox = sinon.sandbox.create();
      win = iframe.win;
      doc = win.document;
      const perf = installPerformanceService(doc.defaultView);
      tickSpy = sandbox.spy(perf, 'tick');

      const resources = installResourcesServiceForDoc(doc);
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

      styles.makeBodyVisible(doc);
      expect(doc.body).to.exist;
      expect(getStyle(doc.body, 'opacity')).to.equal('1');
      expect(getStyle(doc.body, 'visibility')).to.equal('visible');
      expect(getStyle(doc.body, 'animation')).to.equal('none');
    });

    it('should wait for render delaying services', done => {
      expect(getStyle(doc.body, 'opacity')).to.equal('');
      expect(getStyle(doc.body, 'visibility')).to.equal('');
      expect(getStyle(doc.body, 'animation')).to.equal('');

      waitForServicesStub.withArgs(win)
          .returns(Promise.resolve(['service1', 'service2']));
      styles.makeBodyVisible(doc, true);
      styles.makeBodyVisible(doc, true); // 2nd call should make no difference
      setTimeout(() => {
        expect(getStyle(doc.body, 'opacity')).to.equal('1');
        expect(getStyle(doc.body, 'visibility')).to.equal('visible');
        expect(getStyle(doc.body, 'animation')).to.equal('none');
        expect(tickSpy.withArgs('mbv')).to.be.calledOnce;
        expect(schedulePassSpy.withArgs(1, true)).to.be.calledOnce;
        done();
      }, 0);
    });

    it('should skip schedulePass if no render delaying services', done => {
      waitForServicesStub.withArgs(win).returns(Promise.resolve([]));
      styles.makeBodyVisible(doc, true);
      setTimeout(() => {
        expect(tickSpy.withArgs('mbv')).to.be.calledOnce;
        expect(schedulePassSpy).to.not.be.calledWith(sinon.match.number, true);
        done();
      }, 0);
    });
  });

  describe('installStyles', () => {

    it('should install runtime styles', () => {
      const cssText = '/*amp-runtime*/';
      return new Promise(resolve => {
        styles.installStyles(doc, cssText, () => {
          resolve();
        }, true);
      }).then(() => {
        const styleEl = doc.head.querySelector('style');
        expect(styleEl.hasAttribute('amp-runtime')).to.be.true;
        expect(styleEl.textContent).to.equal(cssText);
        doc.head.removeChild(styleEl);
      });
    });

    it('should install extension styles after runtime', () => {
      const runtimeCssText = '/*amp-runtime*/';
      const extCssText = '/*amp-ext1*/';
      styles.installStyles(doc, runtimeCssText, () => {
      }, true);
      return new Promise(resolve => {
        styles.installStyles(doc, extCssText, () => {
          resolve();
        }, false, 'amp-ext1');
      }).then(() => {
        const styleEls = doc.head.querySelectorAll('style');
        expect(styleEls[0].hasAttribute('amp-runtime')).to.be.true;
        expect(styleEls[1].getAttribute('amp-extension')).to.equal('amp-ext1');
        expect(styleEls[1].textContent).to.equal(extCssText);
        doc.head.removeChild(styleEls[0]);
        doc.head.removeChild(styleEls[1]);
      });
    });
  });
});
