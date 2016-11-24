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

import {adopt} from '../../../../src/runtime';
import {
  getElement,
  isPositiveNumber_,
  isValidPercentage_,
  isVisibilitySpecValid,
  Visibility,
} from '../visibility-impl';
import {layoutRectLtwh, rectIntersection} from '../../../../src/layout-rect';
import {isFiniteNumber} from '../../../../src/types';
import {VisibilityState} from '../../../../src/visibility-state';
import {viewerForDoc} from '../../../../src/viewer';
import {viewportForDoc} from '../../../../src/viewport';
import {loadPromise} from '../../../../src/event-helper';

import * as sinon from 'sinon';
import {AmpDocSingle} from '../../../../src/service/ampdoc-impl';
import {installTimerService} from '../../../../src/service/timer-impl';
import {installPlatformService} from '../../../../src/service/platform-impl';
import {
  installResourcesServiceForDoc,
} from '../../../../src/service/resources-impl';
import {documentStateFor} from '../../../../src/document-state';

adopt(window);

describe('amp-analytics.visibility', () => {

  let sandbox;
  let visibility;
  let getIntersectionStub;
  let viewportScrollTopStub;
  let viewportScrollLeftStub;
  let callbackStub;
  let clock;
  let ampElement;
  let ampdoc;

  const INTERSECTION_0P = makeIntersectionEntry([100, 100, 100, 100],
      [0, 0, 100, 100]);
  const INTERSECTION_1P = makeIntersectionEntry([90, 90, 100, 100],
      [0, 0, 100, 100]);
  const INTERSECTION_50P = makeIntersectionEntry([50, 0, 100, 100],
      [0, 0, 100, 100]);

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    clock = sandbox.useFakeTimers();
    const docState = documentStateFor(window);
    sandbox.stub(docState, 'isHidden', () => false);
    ampdoc = new AmpDocSingle(window);
    installResourcesServiceForDoc(ampdoc);
    installPlatformService(window);
    installTimerService(window);

    ampElement = document.createElement('amp-analytics');
    ampElement.id = 'abc';
    document.body.appendChild(ampElement);

    const getIdStub = sandbox.stub();
    getIdStub.returns('0');
    getIntersectionStub = sandbox.stub();
    callbackStub = sandbox.stub();

    const viewport = viewportForDoc(ampdoc);
    viewportScrollTopStub = sandbox.stub(viewport, 'getScrollTop');
    viewportScrollTopStub.returns(0);
    viewportScrollLeftStub = sandbox.stub(viewport, 'getScrollLeft');
    viewportScrollLeftStub.returns(0);
    viewerForDoc(ampdoc).setVisibilityState_(VisibilityState.VISIBLE);
    visibility = new Visibility(ampdoc);
    sandbox.stub(visibility.resourcesService_, 'getResourceForElement')
        .returns({
          getLayoutBox: () => {},
          element: {getIntersectionChangeEntry: getIntersectionStub},
          getId: getIdStub,
          hasLoadedOnce: () => true});
  });

  afterEach(() => {
    document.body.removeChild(ampElement);
    sandbox.restore();
  });

  function makeIntersectionEntry(boundingClientRect, rootBounds) {
    boundingClientRect = layoutRectLtwh.apply(null, boundingClientRect);
    rootBounds = layoutRectLtwh.apply(null, rootBounds);
    const intersect = rectIntersection(boundingClientRect, rootBounds);
    const ratio = (intersect.width * intersect.height)
        / (boundingClientRect.width * boundingClientRect.height);
    return {
      intersectionRect: intersect,
      boundingClientRect,
      rootBounds,
      intersectionRatio: ratio,
    };
  }

  function listen(intersectionChange, config, expectedCalls, opt_expectedVars,
      opt_visible) {
    opt_visible = opt_visible === undefined ? true : opt_visible;
    getIntersectionStub.returns(intersectionChange);
    config['selector'] = '#abc';
    visibility.listenOnce(config, callbackStub, opt_visible, ampElement);
    clock.tick(20);
    verifyExpectedVars(expectedCalls, opt_expectedVars);
  }

  function verifyChange(intersectionChange, expectedCalls, opt_expectedVars) {
    getIntersectionStub.returns(intersectionChange);
    visibility.scrollListener_();
    verifyExpectedVars(expectedCalls, opt_expectedVars);
  }

  function verifyExpectedVars(expectedCalls, opt_expectedVars) {
    expect(callbackStub.callCount).to.equal(expectedCalls);
    if (opt_expectedVars && expectedCalls > 0) {
      for (let c = 0; c < opt_expectedVars.length; c++) {
        sinon.assert.calledWith(callbackStub.getCall(c), opt_expectedVars[c]);
      }
    }
  }

  it('fires for trivial on=visible config', () => {
    listen(INTERSECTION_50P, {
      visiblePercentageMin: 0, visiblePercentageMax: 100}, 1);
  });

  it('fires for trivial on=hidden config', () => {
    listen(INTERSECTION_50P, {
      visiblePercentageMin: 0, visiblePercentageMax: 100}, 0, undefined, false);

    visibility.viewer_.setVisibilityState_(VisibilityState.HIDDEN);
    expect(callbackStub.callCount).to.equal(1);
  });

  it('fires for non-trivial on=visible config', () => {
    viewportScrollTopStub.returns(13);
    viewportScrollLeftStub.returns(5);
    listen(makeIntersectionEntry([51, 0, 100, 100], [0, 0, 100, 100]),
          {visiblePercentageMin: 49, visiblePercentageMax: 80}, 0);

    const intersection =
        makeIntersectionEntry([30, 10, 100, 100], [0, 0, 100, 100]);
    verifyChange(intersection, 1, [sinon.match({
      backgrounded: '0',
      backgroundedAtStart: '0',
      elementX: '35', // 5 + 30
      elementY: '23', // 13 + 10
      elementWidth: '100',
      elementHeight: '100',
      loadTimeVisibility: '49', // (100 - 51) * (100 - 0) / 100,
      minVisiblePercentage: '63',
      maxVisiblePercentage: '63',
      totalTime: sinon.match(value => {
        return isFiniteNumber(Number(value));
      }),
    })]);
  });

  it('fires for non-trivial on=hidden config', () => {
    listen(makeIntersectionEntry([51, 0, 100, 100], [0, 0, 100, 100]),
          {visiblePercentageMin: 49, visiblePercentageMax: 80}, 0, undefined,
          false);

    verifyChange(INTERSECTION_50P, 0, undefined);
    visibility.viewer_.setVisibilityState_(VisibilityState.HIDDEN);
    verifyExpectedVars(1, [sinon.match({
      backgrounded: '1',
      backgroundedAtStart: '0',
      elementX: '50',
      elementY: '0',
      elementWidth: '100',
      elementHeight: '100',
      loadTimeVisibility: '49', // (100 - 51) * (100 - 0) / 100
      totalTime: sinon.match(value => {
        return isFiniteNumber(Number(value));
      }),
    })]);
  });

  it('fires only once', () => {
    listen(INTERSECTION_50P, {
      visiblePercentageMin: 49, visiblePercentageMax: 80,
    }, 1);

    verifyChange(INTERSECTION_0P, 1);
    verifyChange(INTERSECTION_50P, 1);
  });

  it('fires with just totalTimeMin condition', () => {
    listen(INTERSECTION_0P, {totalTimeMin: 1000}, 0);

    clock.tick(999);
    verifyChange(INTERSECTION_0P, 0);

    clock.tick(1);
    expect(callbackStub.callCount).to.equal(1);
    sinon.assert.calledWith(callbackStub.getCall(0), sinon.match({
      totalVisibleTime: '1000',
    }));
  });

  it('fires with just continuousTimeMin condition', () => {
    listen(INTERSECTION_0P, {continuousTimeMin: 1000}, 0);

    clock.tick(999);
    verifyChange(INTERSECTION_0P, 0);

    clock.tick(1);
    expect(callbackStub.callCount).to.equal(1);
  });

  it('fires with totalTimeMin=1k and visiblePercentageMin=0', () => {
    listen(INTERSECTION_0P, {totalTimeMin: 1000, visiblePercentageMin: 1}, 0);

    verifyChange(INTERSECTION_1P, 0);
    clock.tick(1000);
    verifyChange(INTERSECTION_50P, 0);

    clock.tick(1000);
    expect(callbackStub.callCount).to.equal(1);
    // There is a 20ms offset in some timedurations because of initial
    // timeout in the listenOnce logic.
    sinon.assert.calledWith(callbackStub.getCall(0), sinon.match({
      maxContinuousVisibleTime: '1000',
      totalVisibleTime: '1000',
      firstSeenTime: '20',
      fistVisibleTime: '1020',
      lastSeenTime: '2020',
      lastVisibleTime: '2020',
    }));
  });

  it('fires for continuousTimeMin=1k and totalTimeMin=2k', () => {
    // This test counts time from when the ad is loaded.
    listen(INTERSECTION_0P, {totalTimeMin: 2000, continuousTimeMin: 1000}, 0);

    clock.tick(1000);
    verifyChange(INTERSECTION_0P, 0);

    clock.tick(1000);
    expect(callbackStub.callCount).to.equal(1);
  });

  it('fires for continuousTimeMin=1k and visiblePercentageMin=50', () => {
    // This test counts time from when the ad is loaded.
    listen(INTERSECTION_50P,
        {continuousTimeMin: 1000, visiblePercentageMin: 49}, 0);

    clock.tick(999);
    verifyChange(INTERSECTION_0P, 0);

    clock.tick(1000);
    verifyChange(INTERSECTION_50P, 0);

    clock.tick(100);
    expect(callbackStub.callCount).to.equal(0);
    clock.tick(900);
    expect(callbackStub.callCount).to.equal(1);
    sinon.assert.calledWith(callbackStub.getCall(0), sinon.match({
      maxContinuousVisibleTime: '1000',
      minVisiblePercentage: '50',
      maxVisiblePercentage: '50',
      totalVisibleTime: '1999',
    }));
  });

  it('populates backgroundedAtStart=1', () => {
    visibility.backgroundedAtStart_ = true;
    listen(INTERSECTION_50P, {
      visiblePercentageMin: 0, visiblePercentageMax: 100}, 1, [sinon.match({
        'backgroundedAtStart': '1',
      })]);
  });

  it('populates backgroundedAtStart=0', () => {
    const viewerStub = sandbox.stub(visibility.viewer_, 'getVisibilityState');
    viewerStub.returns(VisibilityState.VISIBLE);
    visibility.backgroundedAtStart_ = false;
    listen(INTERSECTION_50P, {
      visiblePercentageMin: 0, visiblePercentageMax: 100}, 1, [sinon.match({
        'backgroundedAtStart': '0',
        'backgrounded': '0',
      })]);

    viewerStub.returns(VisibilityState.HIDDEN);
    visibility.visibilityListener_();
    viewerStub.returns(VisibilityState.VISIBLE);
    listen(INTERSECTION_50P, {
      visiblePercentageMin: 0, visiblePercentageMax: 100}, 2, [
        sinon.match({}),
        sinon.match({
          'backgroundedAtStart': '0',
          'backgrounded': '1',
        })]);
  });

  describe('populates backgrounded variable', () => {
    let viewerStub;
    beforeEach(() => {
      viewerStub = sandbox.stub(visibility.viewer_, 'getVisibilityState');
    });

    function verifyState(state, expectedValue) {
      it('for visibility state=' + state, () => {
        viewerStub.returns(state);
        visibility.visibilityListener_();
        viewerStub.returns(VisibilityState.VISIBLE);

        listen(INTERSECTION_50P, {
          visiblePercentageMin: 0, visiblePercentageMax: 100}, 1, [sinon.match({
            'backgrounded': expectedValue,
          })]);
      });
    }

    verifyState(VisibilityState.VISIBLE, '0');
    verifyState(VisibilityState.HIDDEN, '1');
    verifyState(VisibilityState.PAUSED, '1');
    verifyState(VisibilityState.INACTIVE, '1');
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
    };

    [1, 0, undefined, 100].forEach(num => {
      checkValidPercentage(num, true);
    });

    ['', -1, NaN, 101].forEach(num => {
      checkValidPercentage(num, false);
    });
  });

  describe('getElement', () => {
    let div, img1, img2, analytics, iframe, ampEl, iframeAmpDoc,
      iframeAnalytics;
    beforeEach(() => {
      ampEl = document.createElement('span');
      ampEl.className = '-amp-element';
      ampEl.id = 'ampEl';
      iframe = document.createElement('iframe');
      div = document.createElement('div');
      div.id = 'div';
      img1 = document.createElement('amp-img');
      img1.id = 'img1';
      img2 = document.createElement('amp-img');
      img2.id = 'img2';
      analytics = document.createElement('amp-analytics');
      analytics.id = 'analytics';
      img1.appendChild(analytics);
      img1.appendChild(img2);
      div.appendChild(img1);
      iframe.srcdoc = div.outerHTML;
      document.body.appendChild(ampEl);
      document.body.appendChild(div);

      const loaded = loadPromise(iframe);
      ampEl.appendChild(iframe);
      iframeAmpDoc = new AmpDocSingle(iframe.contentWindow);
      return loaded.then(() => {
        iframeAnalytics = iframe.contentDocument.querySelector(
            'amp-analytics');
      });
    });

    afterEach(() => {
      document.body.removeChild(ampEl);
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
      // Should restrict elements to contained ampdoc.
      expect(getElement(ampdoc, 'amp-img', iframeAnalytics, 'closest'))
          .to.equal(null);
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
    });

    it('finds element for selectionMethod=host', () => {
      expect(getElement(iframeAmpDoc, ':host', iframeAnalytics))
          .to.equal(ampEl);
      expect(getElement(iframeAmpDoc, ':root', iframeAnalytics, 'something'))
          .to.equal(ampEl);
    });
  });
});
