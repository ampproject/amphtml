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
import {createIframePromise} from '../../../../testing/iframe';
import {
  isPositiveNumber_,
  isValidPercentage_,
  isVisibilitySpecValid,
  installVisibilityService,
} from '../visibility-impl';
import {installResourcesService} from '../../../../src/service/resources-impl';
import {installViewerService} from '../../../../src/service/viewer-impl';
import {installViewportService} from '../../../../src/service/viewport-impl';
import {layoutRectLtwh, rectIntersection} from '../../../../src/layout-rect';
import {visibilityFor} from '../../../../src/visibility';
import {VisibilityState} from '../../../../src/visibility-state';
import * as sinon from 'sinon';


adopt(window);

// The tests have amp-analytics tag because they should be run whenever
// amp-analytics is changed.
describe('Visibility (tag: amp-analytics)', () => {

  let sandbox;
  let visibility;
  let getIntersectionStub;
  let callbackStub;
  let win;

  const INTERSECTION_0P = makeIntersectionEntry([100, 100, 100, 100],
      [0, 0, 100, 100]);
  const INTERSECTION_1P = makeIntersectionEntry([90, 90, 100, 100],
      [0, 0, 100, 100]);
  const INTERSECTION_50P = makeIntersectionEntry([50, 0, 100, 100],
      [0, 0, 100, 100]);

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    sandbox.useFakeTimers();

    const getIdStub = sandbox.stub();
    getIdStub.returns('0');
    getIntersectionStub = sandbox.stub();
    callbackStub = sandbox.stub();

    return createIframePromise().then(iframe => {
      installViewerService(iframe.win);
      installViewportService(iframe.win);
      installResourcesService(iframe.win);
      installVisibilityService(iframe.win);

      return visibilityFor(iframe.win).then(v => {
        visibility = v;
        sandbox.stub(visibility.resourcesService_,
            'getResourceForElement').returns({
              element: {getIntersectionChangeEntry: getIntersectionStub},
              getId: getIdStub,
              isLayoutPending: () => false});
      });
    });
  });

  afterEach(() => {
    visibility = null;
    getIntersectionStub = null;
    callbackStub = null;;
    sandbox.restore();
  });

  function makeIntersectionEntry(boundingClientRect, rootBounds) {
    boundingClientRect = layoutRectLtwh.apply(win, boundingClientRect);
    rootBounds = layoutRectLtwh.apply(win, rootBounds);
    return {
      intersectionRect: rectIntersection(boundingClientRect, rootBounds),
      boundingClientRect,
      rootBounds,
    };
  }

  function listen(intersectionChange, config, expectedCalls, opt_expectedVars) {
    getIntersectionStub.returns(intersectionChange);
    config['selector'] = '#abc';
    visibility.listenOnce(config, callbackStub);
    sandbox.clock.tick(20);
    expect(callbackStub.callCount).to.equal(expectedCalls);
    if (opt_expectedVars && expectedCalls > 0) {
      for (let c = 0; c < opt_expectedVars.length; c++) {
        sinon.assert.calledWith(callbackStub.getCall(c), opt_expectedVars[c]);
      }
    }
  }

  function verifyChange(intersectionChange, expectedCalls, opt_expectedVars) {
    getIntersectionStub.returns(intersectionChange);
    visibility.scrollListener_();
    expect(callbackStub.callCount).to.equal(expectedCalls);
    if (opt_expectedVars && expectedCalls > 0) {
      for (let c = 0; c < opt_expectedVars.length; c++) {
        sinon.assert.calledWith(callbackStub.getCall(c), opt_expectedVars[c]);
      }
    }
  }

  it('fires for trivial config', () => {
    listen(INTERSECTION_50P, {
      visiblePercentageMin: 0, visiblePercentageMax: 100}, 1);
  });

  it('fires for non-trivial config', () => {
    listen(makeIntersectionEntry([51, 0, 100, 100], [0, 0, 100, 100]),
          {visiblePercentageMin: 49, visiblePercentageMax: 80}, 0);

    verifyChange(INTERSECTION_50P, 1, [sinon.match({
      backgrounded: '0',
      backgroundedAtStart: '0',
      elementX: '50',
      elementY: '0',
      elementWidth: '100',
      elementHeight: '100',
      loadTimeVisibility: '50',
      totalTime: sinon.match(value => {
        return !isNaN(Number(value));
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

    sandbox.clock.tick(999);
    verifyChange(INTERSECTION_0P, 0);

    sandbox.clock.tick(1);
    expect(callbackStub.callCount).to.equal(1);
    sinon.assert.calledWith(callbackStub.getCall(0), sinon.match({
      totalVisibleTime: '1000',
    }));
  });

  it('fires with just continuousTimeMin condition', () => {
    listen(INTERSECTION_0P, {continuousTimeMin: 1000}, 0);

    sandbox.clock.tick(999);
    verifyChange(INTERSECTION_0P, 0);

    sandbox.clock.tick(1);
    expect(callbackStub.callCount).to.equal(1);
  });

  it('fires with totalTimeMin=1k and visiblePercentageMin=0', () => {
    listen(INTERSECTION_0P, {totalTimeMin: 1000, visiblePercentageMin: 1}, 0);

    verifyChange(INTERSECTION_1P, 0);
    sandbox.clock.tick(1000);
    verifyChange(INTERSECTION_50P, 0);

    sandbox.clock.tick(1000);
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

    sandbox.clock.tick(1000);
    verifyChange(INTERSECTION_0P, 0);

    sandbox.clock.tick(1000);
    expect(callbackStub.callCount).to.equal(1);
  });

  it('fires for continuousTimeMin=1k and visiblePercentageMin=50', () => {
    // This test counts time from when the ad is loaded.
    listen(INTERSECTION_50P,
        {continuousTimeMin: 1000, visiblePercentageMin: 49}, 0);

    sandbox.clock.tick(999);
    verifyChange(INTERSECTION_0P, 0);

    sandbox.clock.tick(1000);
    verifyChange(INTERSECTION_50P, 0);

    sandbox.clock.tick(100);
    expect(callbackStub.callCount).to.equal(0);
    sandbox.clock.tick(900);
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
    visibility.backgroundedAtStart_ = false;
    listen(INTERSECTION_50P, {
      visiblePercentageMin: 0, visiblePercentageMax: 100}, 1, [sinon.match({
        'backgroundedAtStart': '0',
        'backgrounded': '0',
      })]);

    viewerStub.returns(VisibilityState.HIDDEN);
    visibility.visibilityListener_();
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
    it('passes valid visibility spec', () => {
      const specs = [
        undefined,
        {selector: '#abc'},
        {
          selector: '#a', continuousTimeMin: 10, totalTimeMin: 1000,
          visiblePercentageMax: 99, visiblePercentageMin: 10,
        },
        {selector: '#a', continuousTimeMax: 1000, unload: true},
      ];
      for (const s in specs) {
        expect(isVisibilitySpecValid({visibilitySpec: specs[s]}, true),
            JSON.stringify(specs[s])).to.be.true;
      }
    });

    it('rejects invalid visibility spec', () => {
      const specs = [
        {},
        {selector: 'abc'},
        {selector: '#a', continuousTimeMin: -10},
        {
          selector: '#a', continuousTimeMax: 10, continuousTimeMin: 100,
          unload: true,
        },
        {selector: '#a', continuousTimeMax: 100, continuousTimeMin: 10},
        {selector: '#a', visiblePercentageMax: 101},
      ];
      for (const s in specs) {
        expect(isVisibilitySpecValid({visibilitySpec: specs[s]}, true),
            JSON.stringify(specs[s])).to.be.false;
      }
    });
  });

  describe('utils', () => {
    it('isPositiveNumber_', () => {
      ['', 1, 0, undefined, 100, 101].forEach(num => {
        expect(isPositiveNumber_(num)).to.be.true;
      });
      [-1, NaN].forEach(num => {
        expect(isPositiveNumber_(num)).to.be.false;
      });
    });

    it('isValidPercentage_', () => {
      ['', 1, 0, undefined, 100].forEach(num => {
        expect(isValidPercentage_(num)).to.be.true;
      });
      [-1, NaN, 101].forEach(num => {
        expect(isValidPercentage_(num)).to.be.false;
      });
    });
  });
});
