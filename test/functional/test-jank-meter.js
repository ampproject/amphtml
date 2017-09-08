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

import {JankMeter} from '../../src/service/jank-meter';
import * as lolex from 'lolex';


describes.realWin('jank-meter', {}, env => {

  let win;
  let clock;
  let meter;

  beforeEach(() => {
    win = env.win;
    clock = lolex.install(win, 0, ['Date', 'setTimeout', 'clearTimeout']);

    meter = new JankMeter(win);
    meter.perf_ = {
      isPerformanceTrackingOn() {
        return true;
      },
    };
  });

  it('should use first schedule time when scheduled multiple times ', () => {
    meter.onScheduled();
    clock.tick(5);
    meter.onScheduled();
    clock.tick(15);
    meter.onRun();
    expect(meter.totalFrameCnt_).to.equal(1);
    expect(meter.badFrameCnt_).to.equal(1);
  });

  it('should count bad frames correctly', () => {
    runTask(16);
    expect(meter.totalFrameCnt_).to.equal(1);
    expect(meter.badFrameCnt_).to.equal(0);

    runTask(17);
    expect(meter.totalFrameCnt_).to.equal(2);
    expect(meter.badFrameCnt_).to.equal(1);
  });

  function runTask(delay) {
    meter.onScheduled();
    clock.tick(delay);
    meter.onRun();
  }
});
