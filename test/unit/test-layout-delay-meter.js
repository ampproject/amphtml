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

import * as lolex from 'lolex';
import {LayoutDelayMeter} from '../../src/layout-delay-meter';
import {Services} from '../../src/services';
import {installPerformanceService} from '../../src/service/performance-impl';
import {installPlatformService} from '../../src/service/platform-impl';

describes.realWin(
  'layout-delay-meter',
  {
    amp: {
      ampdoc: 'single',
    },
  },
  env => {
    let win;
    let meter;
    let tickSpy;
    let clock;

    beforeEach(() => {
      win = env.win;
      installPlatformService(win);
      installPerformanceService(win);
      const perf = Services.performanceFor(win);
      env.sandbox.stub(perf, 'isPerformanceTrackingOn').callsFake(() => true);
      clock = lolex.install({
        target: win,
        toFake: ['Date', 'setTimeout', 'clearTimeout'],
      });
      tickSpy = env.sandbox.spy(perf, 'tickDelta');

      meter = new LayoutDelayMeter(win, 2);
    });

    afterEach(() => {
      clock.uninstall();
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
      tickSpy.resetHistory();
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
      tickSpy.resetHistory();
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
  }
);
