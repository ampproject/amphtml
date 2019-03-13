/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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

import {VisibilityManagerForMApp} from '../visibility-manager-for-mapp';
import {VisibilityState} from '../../../../src/visibility-state';
import {dict} from '../../../../src/utils/object';
import {layoutRectLtwh} from '../../../../src/layout-rect';

class MockVisibilityInterface {
  constructor(opt_ratio, opt_rect) {
    this.callback_ = null;
    this.initRatio_ = opt_ratio || 0;
    this.initRect_ = opt_rect || null;
  }

  onVisibilityChange(callback) {
    this.callback_ = callback;
    callback(this.constructVisibilityData_(this.initRatio_, this.initRect_));
  }

  constructVisibilityData_(ratio, opt_rect) {
    return {
      visibleRect: opt_rect || layoutRectLtwh(0, 0, 100, 101),
      visibleRatio: ratio,
    };
  }

  fireVisibilityChangeForTesting(ratio, opt_rect) {
    if (!this.callback_) {
      return;
    }
    this.callback_(this.constructVisibilityData_(ratio, opt_rect));
  }
}


describes.fakeWin('VisibilityManagerForMapp', {amp: true}, env => {
  let win;
  let ampdoc;
  let clock;
  let viewer;
  let root;
  let eventResolver, eventPromise;
  let visibilityInterface;

  beforeEach(() => {
    win = env.win;
    ampdoc = env.ampdoc;
    clock = sandbox.useFakeTimers();
    clock.tick(1);

    viewer = win.services.viewer.obj;
    sandbox.stub(viewer, 'getFirstVisibleTime').callsFake(() => 1);
    visibilityInterface = new MockVisibilityInterface();
    root =
        new VisibilityManagerForMApp(ampdoc, visibilityInterface);

    win.IntersectionObserver = null;

    eventPromise = new Promise(resolve => {
      eventResolver = resolve;
    });
  });

  it('should initialize correctly', () => {
    viewer.setVisibilityState_(VisibilityState.HIDDEN);
    visibilityInterface = new MockVisibilityInterface(0.5);
    root =
        new VisibilityManagerForMApp(ampdoc, visibilityInterface);
    expect(root.parent).to.be.null;
    expect(root.ampdoc).to.equal(ampdoc);
    expect(root.getStartTime()).to.equal(viewer.getFirstVisibleTime());
    expect(root.isBackgrounded()).to.be.true;
    expect(root.isBackgroundedAtStart()).to.be.true;

    // Root model starts invisible.
    expect(root.getRootVisibility()).to.equal(0.5);
    expect(root.getRootMinOpacity()).to.equal(1);
  });

  it('should resolve root layout box', () => {
    expect(root.getRootLayoutBox()).to.contain({
      left: 0,
      top: 0,
      width: 100,
      height: 101,
    });
  });

  it('should switch visibility based on VisibilityInterface trigger', () => {
    expect(root.getRootVisibility()).to.equal(0);
    visibilityInterface.fireVisibilityChangeForTesting(0.5);
    expect(root.getRootVisibility()).to.equal(0.5);

    visibilityInterface.fireVisibilityChangeForTesting(0.5);
    expect(root.getRootVisibility()).to.equal(0.5);
  });

  it('should switch root model to no-visibility on dispose', () => {
    visibilityInterface = new MockVisibilityInterface(1);
    root =
        new VisibilityManagerForMApp(ampdoc, visibilityInterface);
    expect(root.getRootVisibility()).to.equal(1);
    root.dispose();
    expect(root.getRootVisibility()).to.equal(0);
  });

  it('should not support listen on element', () => {
    const target = win.document.createElement('div');
    //root.listenElement(target, {}, null, null, () => {});
    allowConsoleError(() => { expect(() => {
      root.listenElement(target, {}, null, null, () => {});
    }).to.throw(/element level visibility not supported/); });
    allowConsoleError(() => { expect(() => {
      root.observe();
    }).to.throw(/element level visibility not supported/); });
    allowConsoleError(() => { expect(() => {
      root.getElementVisibility();
    }).to.throw(/element level visibility not supported/); });
  });

  it('should protect from invalid intersection values', () => {
    root.listenRoot({}, null, null, eventResolver);
    expect(root.models_).to.have.length(1);
    const model = root.models_[0];

    expect(model.getVisibility_()).to.equal(0);

    // Valid value.
    visibilityInterface.fireVisibilityChangeForTesting(0.3);
    expect(model.getVisibility_()).to.equal(0.3);

    // Invalid negative value.
    visibilityInterface.fireVisibilityChangeForTesting(-0.01);
    expect(model.getVisibility_()).to.equal(0);

    // // Invalid overflow value.
    visibilityInterface.fireVisibilityChangeForTesting(1.01);
    expect(model.getVisibility_()).to.equal(1);
  });

  it('listen on root integrated', () => {
    // There's a clock.tick(1) in beforeEach, so firstSeenTime is
    // /*tick*/1 + /*tick*/1 - /*viewer.getFirstVisibleTime*/ 1)
    clock.tick(1);
    const disposed = sandbox.spy();
    const spec = dict({
      'totalTimeMin': 10,
      'visiblePercentageMin': 20,
    });
    root.listenRoot(spec, null, null, eventResolver);

    expect(root.models_).to.have.length(1);
    const model = root.models_[0];
    model.unsubscribe(disposed);

    // Go visible.
    visibilityInterface.fireVisibilityChangeForTesting(0.5);
    clock.tick(8);

    // Less than visiblePercentageMin
    visibilityInterface.fireVisibilityChangeForTesting(0.19);
    clock.tick(3);

    expect(disposed).to.not.be.called;

    // Back to visible range
    visibilityInterface.fireVisibilityChangeForTesting(
        0.3, layoutRectLtwh(1, 2, 100, 201));
    clock.tick(3);
    return eventPromise.then(state => {
      expect(disposed).to.be.calledOnce;
      expect(root.models_).to.have.length(0);
      expect(state.totalVisibleTime).to.equal(10);

      expect(state.firstSeenTime).to.equal(1);
      expect(state.backgrounded).to.equal(0);
      expect(state.backgroundedAtStart).to.equal(0);

      expect(state.totalTime).to.equal(15);
      expect(state.opacity).to.equal(1);

      expect(state.elementX).to.equal(1);
      expect(state.elementY).to.equal(2);
      expect(state.elementWidth).to.equal(100);
      expect(state.elementHeight).to.equal(201);
      expect(state.intersectionRatio).to.equal(0.3);
    });
  });
});
