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

import {
  getElement,
  isPositiveNumber_,
  isValidPercentage_,
  isVisibilitySpecValid,
  Visibility,
} from '../visibility-impl';
import {DOMRectLtwh, rectIntersection} from '../../../../src/DOM-rect';
import * as inob from '../../../../src/intersection-observer-polyfill';
import {VisibilityState} from '../../../../src/visibility-state';
import {viewerForDoc} from '../../../../src/services';
import {loadPromise} from '../../../../src/event-helper';

import * as sinon from 'sinon';
import {setParentWindow} from '../../../../src/service';
import {AmpDocSingle} from '../../../../src/service/ampdoc-impl';
import {documentStateFor} from '../../../../src/service/document-state';
import * as lolex from 'lolex';

describes.realWin('amp-analytics.visibility', {amp: true}, env => {
  let ampdoc;
  let doc;
  let win;

  beforeEach(() => {
    win = env.win;
    doc = win.document;
    ampdoc = env.ampdoc;
  });

  describe('isVisibilitySpecValid', () => {
    function isSpecValid(spec, result) {
      it('check for visibility spec: ' + JSON.stringify(spec), () => {
        expect(isVisibilitySpecValid({visibilitySpec: spec}),
            JSON.stringify(spec)).to.equal(result);
      });
    }

    isSpecValid(undefined, true);
    isSpecValid({selector: '#abc'}, true);
    isSpecValid({
      selector: '#a', continuousTimeMin: 10, totalTimeMin: 1000,
      visiblePercentageMax: 99, visiblePercentageMin: 10,
    }, true);
    isSpecValid({selector: '#a', continuousTimeMax: 1000}, true);

    isSpecValid({}, false);
    isSpecValid({selector: 'abc'}, false);
    isSpecValid({selector: '#a', continuousTimeMax: 10, continuousTimeMin: 100},
        false);
    isSpecValid({selector: '#a', continuousTimeMax: 100, continuousTimeMin: 10},
        true);
    isSpecValid({selector: '#a', visiblePercentageMax: 101}, false);
  });

  describe('utils', () => {
    function checkPositive(value, expectedResult) {
      it('isPositiveNumber_(' + value + ')', () => {
        expect(isPositiveNumber_(value)).to.equal(expectedResult);
      });
    }

    [1, 0, undefined, 100, 101].forEach(num => {
      checkPositive(num, true);
    });

    ['', -1, NaN].forEach(num => {
      checkPositive(num, false);
    });

    function checkValidPercentage(value, expectedResult) {
      it('isValidPercentage_(' + value + ')', () => {
        expect(isValidPercentage_(value)).to.equal(expectedResult);
      });
    }

    [1, 0, undefined, 100].forEach(num => {
      checkValidPercentage(num, true);
    });

    ['', -1, NaN, 101].forEach(num => {
      checkValidPercentage(num, false);
    });
  });

  describe('getElement', () => {
    let div, img1, img2, analytics, iframe, ampEl, iframeAmpDoc;
    let iframeAnalytics;
    beforeEach(() => {
      ampEl = doc.createElement('span');
      ampEl.className = 'i-amphtml-element';
      ampEl.id = 'ampEl';
      iframe = doc.createElement('iframe');
      div = doc.createElement('div');
      div.id = 'div';
      img1 = doc.createElement('amp-img');
      img1.id = 'img1';
      img2 = doc.createElement('amp-img');
      img2.id = 'img2';
      analytics = doc.createElement('amp-analytics');
      analytics.id = 'analytics';
      img1.appendChild(analytics);
      img1.appendChild(img2);
      div.appendChild(img1);
      iframe.srcdoc = div.outerHTML;
      doc.body.appendChild(ampEl);
      doc.body.appendChild(div);

      const loaded = loadPromise(iframe);
      ampEl.appendChild(iframe);
      iframeAmpDoc = new AmpDocSingle(iframe.contentWindow);
      return loaded.then(() => {
        setParentWindow(iframe.contentWindow, win);
        iframeAnalytics = iframe.contentDocument.querySelector(
            'amp-analytics');
      });
    });

    it('finds element by id', () => {
      expect(getElement(ampdoc, '#ampEl', analytics, undefined)).to.equal(
          ampEl);
    });

    // In the following tests, getElement returns non-amp elements. Those are
    // discarded by visibility-impl later in the code.
    it('finds element by tagname, selectionMethod=closest', () => {
      expect(getElement(ampdoc, 'div', analytics, 'closest'))
          .to.equal(div);
      expect(getElement(ampdoc, 'amp-img', analytics, 'closest'))
          .to.equal(img1);
      expect(getElement(ampdoc, 'amp-img', iframeAnalytics, 'closest'))
          .to.equal(iframe.contentDocument.querySelector('amp-img'));
      // Should restrict elements to contained ampdoc.
      expect(getElement(iframeAmpDoc, 'amp-img', analytics, 'closest'))
          .to.equal(null);
    });

    it('finds element by id, selectionMethod=scope', () => {
      expect(getElement(ampdoc, '#div', analytics, 'scope'))
          .to.equal(null);
      expect(getElement(ampdoc, '#img2', analytics, 'scope'))
          .to.equal(img2);
    });

    it('finds element by tagname, selectionMethod=scope', () => {
      expect(getElement(ampdoc, 'div', analytics, 'scope'))
          .to.equal(null);
      expect(getElement(ampdoc, 'amp-img', analytics, 'scope'))
          .to.equal(img2);
      expect(getElement(ampdoc, 'div', iframeAnalytics, 'scope'))
          .to.equal(null);
      expect(getElement(ampdoc, 'amp-img', iframeAnalytics, 'scope'))
          .to.equal(iframe.contentDocument.querySelectorAll('amp-img')[1]);
    });

    it('finds element for selectionMethod=host', () => {
      expect(getElement(ampdoc, ':host', analytics)).to.equal(null);
      expect(getElement(ampdoc, ':root', analytics)).to.equal(null);
      expect(getElement(ampdoc, ':host', iframeAnalytics)).to.equal(ampEl);
      expect(getElement(ampdoc, ':root', iframeAnalytics, 'something'))
          .to.equal(ampEl);
    });
  });

  describe('listenOnce', () => {
    let resourceLoadedResolver;
    let clock;
    let scrollTop;
    let inObCallback;
    let observeSpy;
    let unobserveSpy;
    let callbackSpy1;
    let callbackSpy2;
    let visibility;
    let ampElement;

    beforeEach(() => {
      clock = lolex.install(win, 0, ['Date', 'setTimeout', 'clearTimeout']);

      const docState = documentStateFor(win);
      sandbox.stub(docState, 'isHidden', () => false);

      ampElement = doc.createElement('amp-analytics');
      ampElement.id = 'abc';
      doc.body.appendChild(ampElement);

      observeSpy = sandbox.stub();
      unobserveSpy = sandbox.stub();
      callbackSpy1 = sandbox.stub();
      callbackSpy2 = sandbox.stub();
      if (inob.nativeIntersectionObserverSupported(ampdoc.win)) {
        sandbox.stub(ampdoc.win, 'IntersectionObserver', callback => {
          inObCallback = callback;
          return {
            observe: observeSpy,
            unobserve: unobserveSpy,
          };
        });
      } else {
        sandbox.stub(inob, 'IntersectionObserverPolyfill', callback => {
          inObCallback = callback;
          return {
            observe: observeSpy,
            unobserve: unobserveSpy,
            tick: sandbox.stub(),
          };
        });
      }
    });

    it('"visible" trigger should work with simple spec', () => {
      const viewer = viewerForDoc(ampdoc);
      viewer.setVisibilityState_(VisibilityState.VISIBLE);
      visibility = createVisibility();

      visibility.listenOnce({
        selector: '#abc',
      }, callbackSpy1, true, ampElement);

      resourceLoadedResolver();
      return Promise.resolve().then(() => {
        expect(observeSpy).to.be.calledWith(ampElement);

        clock.tick(100);
        fireIntersect(25); // visible
        expect(callbackSpy1).to.be.calledWith({
          backgrounded: '0',
          backgroundedAtStart: '0',
          elementHeight: '100',
          elementWidth: '100',
          elementX: '0',
          elementY: '75',
          firstSeenTime: '100',
          firstVisibleTime: '100',
          lastSeenTime: '100',
          lastVisibleTime: '100',
          loadTimeVisibility: '25',
          maxVisiblePercentage: '25',
          minVisiblePercentage: '25',
          totalVisibleTime: '0',
          maxContinuousVisibleTime: '0',
          totalTime: '1234',
        });
      });
    });

    it('"visible" trigger should work with no duration condition', () => {
      viewerForDoc(ampdoc).setVisibilityState_(VisibilityState.VISIBLE);
      visibility = createVisibility();

      visibility.listenOnce({
        selector: '#abc',
        visiblePercentageMin: 20,
      }, callbackSpy1, true, ampElement);

      // add multiple triggers on the same element
      visibility.listenOnce({
        selector: '#abc',
        visiblePercentageMin: 30,
      }, callbackSpy2, true, ampElement);

      // "observe" should not have been called since resource not loaded yet.
      expect(observeSpy).to.be.not.called;
      resourceLoadedResolver();
      return Promise.resolve().then(() => {
        expect(observeSpy).to.be.calledWith(ampElement);

        clock.tick(135);
        fireIntersect(5); // below visiblePercentageMin, no trigger
        expect(callbackSpy1).to.not.be.called;
        expect(callbackSpy2).to.not.be.called;
        expect(unobserveSpy).to.not.be.called;

        clock.tick(100);
        fireIntersect(25); // above spec 1 min visible, trigger callback 1
        expect(callbackSpy1).to.be.calledWith({
          backgrounded: '0',
          backgroundedAtStart: '0',
          elementHeight: '100',
          elementWidth: '100',
          elementX: '0',
          elementY: '75',
          firstSeenTime: '135',
          firstVisibleTime: '235', // 135 + 100
          lastSeenTime: '235',
          lastVisibleTime: '235',
          loadTimeVisibility: '5',
          maxVisiblePercentage: '25',
          minVisiblePercentage: '25',
          totalVisibleTime: '0',         // duration metrics are always 0
          maxContinuousVisibleTime: '0', // as it triggers immediately
          totalTime: '1234',
        });
        expect(callbackSpy2).to.not.be.called;
        expect(unobserveSpy).to.not.be.called;
        callbackSpy1.reset();

        clock.tick(100);
        fireIntersect(35); // above spec 2 min visible, trigger callback 2
        expect(callbackSpy2).to.be.calledWith(sinon.match({
          backgrounded: '0',
          backgroundedAtStart: '0',
          elementHeight: '100',
          elementWidth: '100',
          elementX: '0',
          elementY: '65',
          firstSeenTime: '135',
          firstVisibleTime: '335', // 235 + 100
          lastSeenTime: '335',
          lastVisibleTime: '335',
          loadTimeVisibility: '5',
          maxVisiblePercentage: '35',
          minVisiblePercentage: '35',
          totalVisibleTime: '0',         // duration metrics is always 0
          maxContinuousVisibleTime: '0', // as it triggers immediately
          // totalTime is not testable because no way to stub performance API
        }));
        expect(callbackSpy1).to.not.be.called; // callback 1 not called again
        expect(unobserveSpy).to.be.called; // unobserve when all callback fired
      });
    });

    it('"visible" trigger should work with duration condition', () => {
      const viewer = viewerForDoc(ampdoc);
      viewer.setVisibilityState_(VisibilityState.VISIBLE);
      visibility = createVisibility();

      visibility.listenOnce({
        selector: '#abc',
        continuousTimeMin: 1000,
        visiblePercentageMin: 0,
      }, callbackSpy1, true, ampElement);

      resourceLoadedResolver();
      return Promise.resolve().then(() => {
        expect(observeSpy).to.be.calledWith(ampElement);

        clock.tick(100);
        fireIntersect(25); // visible
        expect(callbackSpy1).to.not.be.called;

        clock.tick(999);
        fireIntersect(0); // this will reset the timer for continuous time
        expect(callbackSpy1).to.not.be.called;

        clock.tick(100);
        fireIntersect(5); // visible again.

        clock.tick(100);
        // Enters background. this will reset the timer for continuous time
        viewer.setVisibilityState_(VisibilityState.HIDDEN);

        clock.tick(2000); // this 2s should not be counted in visible time
        expect(callbackSpy1).to.not.be.called;
        viewer.setVisibilityState_(VisibilityState.VISIBLE); // now we're back

        clock.tick(100);
        fireIntersect(35); // keep being visible
        expect(callbackSpy1).to.not.be.called;
        clock.tick(899); // not yet!
        expect(callbackSpy1).to.not.be.called;
        clock.tick(1);  // now fire
        expect(callbackSpy1).to.be.calledWith({
          backgrounded: '1',
          backgroundedAtStart: '0',
          elementHeight: '100',
          elementWidth: '100',
          elementX: '0',
          elementY: '65',
          firstSeenTime: '100',
          firstVisibleTime: '100',
          lastSeenTime: '4299',
          lastVisibleTime: '4299',
          loadTimeVisibility: '25',
          maxVisiblePercentage: '35',
          minVisiblePercentage: '5',
          totalVisibleTime: '2099',
          maxContinuousVisibleTime: '1000',
          totalTime: '1234',
        });
      });
    });

    it('"backgrounded" & "backgroundedAtStart" should be populated', () => {
      const viewer = viewerForDoc(ampdoc);
      viewer.setVisibilityState_(VisibilityState.HIDDEN);
      visibility = createVisibility();

      visibility.listenOnce({
        selector: '#abc',
        visiblePercentageMin: 0,
      }, callbackSpy1, true, ampElement);

      viewer.setVisibilityState_(VisibilityState.VISIBLE);
      resourceLoadedResolver();
      return Promise.resolve().then(() => {
        expect(observeSpy).to.be.calledWith(ampElement);

        clock.tick(100);
        fireIntersect(25); // visible
        expect(callbackSpy1).to.be.calledWith(sinon.match({
          backgroundedAtStart: '1',
          backgrounded: '1',
        }));
      });
    });

    it('"visible" trigger should fire once', () => {
      const viewer = viewerForDoc(ampdoc);
      viewer.setVisibilityState_(VisibilityState.VISIBLE);
      visibility = createVisibility();

      visibility.listenOnce({
        selector: '#abc',
        visiblePercentageMin: 10,
      }, callbackSpy1, true, ampElement);

      resourceLoadedResolver();
      return Promise.resolve().then(() => {
        expect(observeSpy).to.be.calledWith(ampElement);

        clock.tick(100);
        fireIntersect(25); // visible
        expect(callbackSpy1).to.be.calledOnce;

        callbackSpy1.reset();
        clock.tick(100);
        fireIntersect(0); // invisible
        clock.tick(100);
        fireIntersect(25); // visible again
        expect(callbackSpy1).to.not.be.called;
      });
    });

    it('"hidden" trigger should work with duration condition', () => {
      const viewer = viewerForDoc(ampdoc);
      viewer.setVisibilityState_(VisibilityState.VISIBLE);
      visibility = createVisibility();

      visibility.listenOnce({
        selector: '#abc',
        continuousTimeMin: 1000,
        visiblePercentageMin: 10,
      }, callbackSpy1, false /* hidden trigger */, ampElement);

      resourceLoadedResolver();
      return Promise.resolve().then(() => {
        expect(observeSpy).to.be.calledWith(ampElement);

        clock.tick(100);
        fireIntersect(5); // invisible
        expect(callbackSpy1).to.not.be.called;

        clock.tick(100);
        fireIntersect(25); // visible
        expect(callbackSpy1).to.not.be.called;

        clock.tick(100);
        fireIntersect(5); // invisible
        expect(callbackSpy1).to.not.be.called;

        clock.tick(1000);
        fireIntersect(15); // visible
        expect(callbackSpy1).to.not.be.called;

        clock.tick(1000); // continuous visible
        expect(callbackSpy1).to.not.be.called;

        clock.tick(100);
        fireIntersect(5); // invisible
        expect(callbackSpy1).to.not.be.called;

        clock.tick(100);
        fireIntersect(1); // invisible
        expect(callbackSpy1).to.not.be.called;

        viewer.setVisibilityState_(VisibilityState.HIDDEN);
        expect(callbackSpy1).to.be.called;

        expect(callbackSpy1).to.be.calledWith({
          backgrounded: '1',
          backgroundedAtStart: '0',
          elementHeight: '100',
          elementWidth: '100',
          elementX: '0',
          elementY: '99',
          firstSeenTime: '100',
          firstVisibleTime: '200',
          lastSeenTime: '2500',
          lastVisibleTime: '2400',
          loadTimeVisibility: '5',
          maxVisiblePercentage: '25',
          minVisiblePercentage: '15',
          totalVisibleTime: '1200',
          maxContinuousVisibleTime: '1100',
          totalTime: '1234',
        });
      });
    });

    function createVisibility() {
      const visibility = new Visibility(ampdoc);

      const getIdStub = sandbox.stub();
      getIdStub.returns('0');
      const getIntersectionStub = sandbox.stub();
      ampElement.getResourceId = getIdStub;

      scrollTop = 10;
      const resourceLoadedPromise =
          new Promise(resolve => resourceLoadedResolver = resolve);
      const resource = {
        getLayoutBox: () => DOMRectLtwh(0, scrollTop, 100, 100),
        element: {getIntersectionChangeEntry: getIntersectionStub},
        getId: getIdStub,
        hasLoadedOnce: () => true,
        loadedOnce: () => resourceLoadedPromise,
      };
      sandbox.stub(visibility.resourcesService_, 'getResourceForElement')
          .returns(resource);
      sandbox.stub(
          visibility.resourcesService_, 'getResourceForElementOptional')
              .returns(resource);
      // no way to stub performance API so stub a private method instead
      sandbox.stub(visibility, 'getTotalTime_').returns(1234);
      return visibility;
    }

    function fireIntersect(intersectPercent) {
      scrollTop = 100 - intersectPercent;
      const entry = makeIntersectionEntry(
          [0, scrollTop, 100, 100], [0, 0, 100, 100]);
      inObCallback([entry]);
    }
  });
});

function makeIntersectionEntry(boundingClientRect, rootBounds) {
  boundingClientRect = DOMRectLtwh.apply(null, boundingClientRect);
  rootBounds = DOMRectLtwh.apply(null, rootBounds);
  const intersect = rectIntersection(boundingClientRect, rootBounds);
  const ratio = (intersect.width * intersect.height)
      / (boundingClientRect.width * boundingClientRect.height);
  return {
    intersectionRect: intersect,
    boundingClientRect,
    rootBounds,
    intersectionRatio: ratio,
    target: null,
  };
}
