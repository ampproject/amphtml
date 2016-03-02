/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
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

import {installFramerateService} from '../../src/service/framerate-impl';
import * as sinon from 'sinon';

describe('the framerate service', () => {

  let fr;
  let win;
  let lastRafCallback;
  let call = 0;
  let visible;
  let csiOn;
  let performance;
  let viewer;
  let sandbox;
  let clock;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    clock = sandbox.useFakeTimers();
    lastRafCallback = null;
    visible = true;
    csiOn = true;
    performance = {
      tickDelta: sinon.spy(),
      flush: sinon.spy(),
    };
    viewer = {
      isVisible: () => {
        return visible;
      },
      isPerformanceTrackingOn() {
        return csiOn;
      },
      onVisibilityChanged: sinon.spy(),
    };
    win = {
      services: {
        performance: {obj: performance},
        viewer: {obj: viewer},
      },
      requestAnimationFrame: cb => {
        lastRafCallback = cb;
        return call++;
      },
      cancelAnimationFrame: index => {
        if (index === null) {
          return;
        }
        expect(index).to.equal(call - 1);
      },
    };
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should tick and flush', () => {
    fr = installFramerateService(win);
    expect(lastRafCallback).to.not.be.null;
    expect(call).to.equal(1);
    fr.collect();
    fr.collect();
    fr.collect();
    expect(call).to.equal(1);
    clock.tick(16);
    lastRafCallback();
    clock.tick(16);
    lastRafCallback();
    expect(fr.frameCount_).to.equal(1);
    clock.tick(16);
    lastRafCallback();
    expect(fr.frameCount_).to.equal(2);
    for (let i = 0; i < 100; i++) {
      clock.tick(16);
      lastRafCallback();
    }
    clock.tick(5000);
    lastRafCallback();
    expect(performance.tickDelta.callCount).to.equal(1);
    expect(performance.flush.callCount).to.equal(1);
    expect(performance.tickDelta.args[0][0]).to.equal('fps');
    expect(performance.tickDelta.args[0][1]).to.within(15, 16);
    expect(fr.frameCount_).to.equal(0);

    // Second round
    fr.collect();
    clock.tick(16);
    lastRafCallback();
    clock.tick(16);
    lastRafCallback();
    expect(fr.frameCount_).to.equal(1);
    clock.tick(16);
    lastRafCallback();
    expect(fr.frameCount_).to.equal(2);
    for (let i = 0; i < 50; i++) {
      clock.tick(16);
      lastRafCallback();
    }
    clock.tick(5000);
    lastRafCallback();
    expect(performance.tickDelta.callCount).to.equal(2);
    expect(performance.flush.callCount).to.equal(2);
    expect(performance.tickDelta.args[1][0]).to.equal('fps');
    expect(performance.tickDelta.args[1][1]).to.within(9, 10);
  });

  it('does nothing with an invisible window', () => {
    visible = false;
    fr = installFramerateService(win);
    expect(viewer.onVisibilityChanged.callCount).to.equal(1);
    expect(fr.isActive_).to.be.false;
    fr.collect();
    expect(fr.requestedFrame_).to.be.null;
    visible = true;
    viewer.onVisibilityChanged.args[0][0]();
    expect(fr.isActive_).to.be.true;
    fr.collect();
    expect(fr.requestedFrame_).to.not.be.null;
    visible = false;
    viewer.onVisibilityChanged.args[0][0](false);
    expect(fr.isActive_).to.be.false;
    expect(fr.requestedFrame_).to.be.null;
    fr.collect();
    expect(fr.requestedFrame_).to.be.null;
  });

  it('sends extra tick for ads', () => {
    fr = installFramerateService(win);
    fr.collect(document.createElement('amp-ad'));
    for (let i = 0; i < 100; i++) {
      clock.tick(16);
      lastRafCallback();
    }
    clock.tick(5000);
    lastRafCallback();
    expect(performance.tickDelta.callCount).to.equal(2);
    expect(performance.flush.callCount).to.equal(1);
    expect(performance.tickDelta.args[0][0]).to.equal('fps');
    expect(performance.tickDelta.args[0][1]).to.within(15, 16);
    expect(performance.tickDelta.args[1][0]).to.equal('fal');
    expect(performance.tickDelta.args[1][1]).to.within(15, 16);
    // Second round
    fr.collect();
    for (let i = 0; i < 50; i++) {
      clock.tick(16);
      lastRafCallback();
    }
    clock.tick(5000);
    lastRafCallback();
    expect(performance.tickDelta.callCount).to.equal(4);
    expect(performance.flush.callCount).to.equal(2);
    expect(performance.tickDelta.args[2][0]).to.equal('fps');
    expect(performance.tickDelta.args[3][0]).to.equal('fal');
  });

  it('respects viewer csi flag', () => {
    csiOn = false;

    fr = installFramerateService(win);
    expect(viewer.onVisibilityChanged.callCount).to.equal(1);
    expect(fr.isActive_).to.be.false;
    fr.collect();
    expect(fr.requestedFrame_).to.be.null;
    visible = true;
    viewer.onVisibilityChanged.args[0][0]();
    expect(fr.isActive_).to.be.false;
    fr.collect();
    expect(fr.requestedFrame_).to.be.null;
    viewer.onVisibilityChanged.args[0][0](false);
    expect(fr.isActive_).to.be.false;
    expect(fr.requestedFrame_).to.be.null;
    fr.collect();
    expect(fr.requestedFrame_).to.be.null;

    csiOn = true;
    fr.collect();
    viewer.onVisibilityChanged.args[0][0](false);
    expect(fr.requestedFrame_).to.not.be.null;
  });
});
