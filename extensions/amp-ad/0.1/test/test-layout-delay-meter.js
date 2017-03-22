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

import {LayoutDelayMeter} from '../layout-delay-meter';
import {
  installPerformanceService,
  performanceFor,
} from '../../../../src/service/performance-impl';
import * as lolex from 'lolex';

describes.realWin('layout-delay-meter', {
  amp: {
    ampdoc: 'single',
  },
}, env => {

  let win;
  let sandbox;
  let meter;
  let tickSpy;
  let clock;

  beforeEach(() => {
    sandbox = env.sandbox;
    win = env.win;
    installPerformanceService(win);
    const perf = performanceFor(win);
    sandbox.stub(perf, 'isPerformanceTrackingOn', () => true);
    clock = lolex.install(win, 0, ['Date', 'setTimeout', 'clearTimeout']);
    tickSpy = sandbox.spy(perf, 'tickDelta');

    meter = new LayoutDelayMeter(win);
  });

  it('should tick when there is a delay', () => {
    clock.tick(100);
    meter.enterViewport(); // first time in viewport
    clock.tick(100);
    meter.enterViewport(); // second time in viewport
    clock.tick(200);
    meter.startLayout();
    expect(tickSpy).to.be.calledWith('adld', 300);

    // should only tick once.
    tickSpy.reset();
    clock.tick(200);
    meter.startLayout();
    expect(tickSpy).to.not.be.called;
  });

  it('should tick when there is no delay', () => {
    clock.tick(100);
    meter.startLayout();
    clock.tick(200);
    meter.enterViewport();
    expect(tickSpy).to.be.calledWith('adld', 0);

    // should only tick once.
    tickSpy.reset();
    clock.tick(200);
    meter.enterViewport();
    expect(tickSpy).to.not.be.called;
  });

  it('should not tick if it never enterViewport', () => {
    clock.tick(100);
    meter.startLayout();
    clock.tick(200);
    expect(tickSpy).not.to.be.called;
  });

  it('should not tick if it never startLayout', () => {
    clock.tick(100);
    meter.enterViewport();
    clock.tick(200);
    expect(tickSpy).not.to.be.called;
  });
});
