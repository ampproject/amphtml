import { ViewerTracker } from "../viewer-tracker";

/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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

describes.realWin('ViewerTracker', {amp: true}, env => {
  let ampdoc;
  let viewTracker;

  beforeEach(() => {
    ampdoc = env.ampdoc;
    viewTracker = new ViewerTracker(ampdoc);
  });

  describe('scheduleView', () => {
    it('should call `reportWhenViewed_`, if viewer is visible' ,() => {
      const whenViewedStub = sandbox.stub(viewTracker, 'reportWhenViewed_');
      sandbox.stub(viewTracker.viewer_, 'isVisible').callsFake(() => true);
      viewTracker.scheduleView();
      return ampdoc.whenReady().then(() => {
        expect(whenViewedStub).to.be.calledOnce;
      });
    });

    it('should call `reportWhenViewed_`, when viewer gets visible' ,() => {
      let visibleState = false;
      const whenViewedStub = sandbox.stub(viewTracker, 'reportWhenViewed_');
      const visibilityChangedStub =
          sandbox.stub(viewTracker.viewer_, 'onVisibilityChanged');
      sandbox.stub(viewTracker.viewer_, 'isVisible')
          .callsFake(() => visibleState);
      viewTracker.scheduleView();
      return ampdoc.whenReady().then(() => {
        expect(whenViewedStub).to.not.be.calledOnce;
        expect(visibilityChangedStub).to.be.calledOnce;
        const callback = visibilityChangedStub.getCall(0).args[0];
        expect(callback).to.be.instanceOf(Function);
        visibleState = true;
        callback();
        expect(whenViewedStub).to.be.calledOnce;
      });
    });
  });

  describe('reportWhenViewed_', () => {
    it('should call whenViewed_', () => {
      const whenViewedStub = sandbox.stub(viewTracker, 'whenViewed_');
      viewTracker.reportWhenViewed_(2000);
      expect(whenViewedStub).to.be.calledOnce;
    });
  });
});
