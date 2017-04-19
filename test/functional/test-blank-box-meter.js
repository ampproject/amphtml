/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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

import {BlankBoxMeter} from '../../src/service/blank-box-meter';
import {
    installPerformanceService,
} from '../../src/service/performance-impl';

const P0 = 0;
const P1 = 1;
const P2 = 2;
const ATF = true;
const BTF = false;

describes.realWin('blank-box-meter', {
  amp: {
    ampdoc: 'single',
  },
}, env => {

  let win;
  let sandbox;
  let meter;
  let tickSpy;

  beforeEach(() => {
    sandbox = env.sandbox;
    win = env.win;
    const perf = installPerformanceService(win);
    sandbox.stub(perf, 'isPerformanceTrackingOn', () => true);
    tickSpy = sandbox.spy(perf, 'tickDelta');

    meter = new BlankBoxMeter(win);
  });

  it('should tick when there is a delay', () => {
    meter.layoutComplete(createFakeResource(1, P0, BTF));
    meter.layoutComplete(createFakeResource(2, P0, BTF));

    meter.enterViewport(createFakeResource(1, P0, BTF));
    meter.enterViewport(createFakeResource(2, P0, BTF));
    meter.enterViewport(createFakeResource(3, P0, BTF));

    checkCounters(2, 3);

    // Another BTF resource enter viewport before layout
    meter.enterViewport(createFakeResource(4, P0, BTF));
    checkCounters(2, 4);

    // Another BTF resource enter viewport after layout
    meter.layoutComplete(createFakeResource(5, P0, BTF));
    expect(tickSpy).not.to.be.called;
    meter.enterViewport(createFakeResource(5, P0, BTF));
    checkCounters(3, 5);
    expect(tickSpy).to.be.calledWith('glp', 60);

    // ATF resource should be ignored
    meter.layoutComplete(createFakeResource(6, P0, ATF));
    meter.enterViewport(createFakeResource(6, P0, ATF));
    checkCounters(3, 5);

    // P1 resource should be ignored
    meter.layoutComplete(createFakeResource(7, P1, ATF));
    meter.enterViewport(createFakeResource(7, P1, ATF));
    checkCounters(3, 5);

    // P2 resource should be ignored
    meter.layoutComplete(createFakeResource(8, P2, ATF));
    meter.enterViewport(createFakeResource(8, P2, ATF));
    checkCounters(3, 5);

    // Resource layout twice
    meter.layoutComplete(createFakeResource(1, P0, BTF));
    checkCounters(3, 5);

    // Resource enter viewport twice
    meter.enterViewport(createFakeResource(1, P0, BTF));
    checkCounters(3, 5);

    // Another BTF resource enter viewport after layout
    tickSpy.reset();
    meter.layoutComplete(createFakeResource(9, P0, BTF));
    meter.enterViewport(createFakeResource(9, P0, BTF));
    checkCounters(4, 6);
    // should not tick twice
    expect(tickSpy).to.not.be.called;
  });

  function checkCounters(
      inViewportLayoutCompleteNum, everInViewportResourcesNum) {
    expect(meter.inViewportLayoutCompleteNum_)
        .to.equal(inViewportLayoutCompleteNum);
    expect(meter.getEverInViewportResourcesNum_())
        .to.equal(everInViewportResourcesNum);
  }
});

function createFakeResource(resId, priority, inFirstViewport) {
  return {
    getId: () => resId,
    getPriority: () => priority,
    isInFirstViewport: () => inFirstViewport,
  };
}
