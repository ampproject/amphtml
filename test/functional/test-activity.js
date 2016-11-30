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

import {AmpDocSingle} from '../../src/service/ampdoc-impl';
import {Activity} from '../../extensions/amp-analytics/0.1/activity-impl';
import {activityForDoc} from '../../src/activity';
import {fromClassForDoc} from '../../src/service';
import {installPlatformService} from '../../src/service/platform-impl';
import {installViewerServiceForDoc} from '../../src/service/viewer-impl';
import {installTimerService} from '../../src/service/timer-impl';
import {installViewportServiceForDoc} from '../../src/service/viewport-impl';
import {viewportForDoc} from '../../src/viewport';
import {Observable} from '../../src/observable';
import * as sinon from 'sinon';

describe('Activity getTotalEngagedTime', () => {

  let sandbox;
  let clock;
  let fakeDoc;
  let fakeWin;
  let ampdoc;
  let viewer;
  let viewport;
  let activity;
  let whenFirstVisibleResolve;
  let visibilityObservable;
  let mousedownObservable;
  let scrollObservable;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    clock = sandbox.useFakeTimers();

    // start at something other than 0
    clock.tick(123456);

    visibilityObservable = new Observable();
    mousedownObservable = new Observable();
    scrollObservable = new Observable();

    fakeDoc = {
      nodeType: /* DOCUMENT */ 9,
      addEventListener: function(eventName, callback) {
        if (eventName === 'mousedown') {
          mousedownObservable.add(callback);
        }
      },
      documentElement: {
        style: {
          // required to instantiate Viewport service
          paddingTop: 0,
        },
        classList: {
          add: () => {},
        },
      },
      body: {
        nodeType: 1,
        style: {},
      },
    };

    fakeWin = {
      services: {},
      document: fakeDoc,
      ampExtendedElements: {
        'amp-analytics': true,
      },
      location: {
        href: 'https://cdn.ampproject.org/v/www.origin.com/foo/?f=0',
      },
      navigator: window.navigator,
      setTimeout: window.setTimeout,
      clearTimeout: window.clearTimeout,
      // required to instantiate Viewport service
      addEventListener: () => {},
      removeEventListener: () => {},
    };
    fakeDoc.defaultView = fakeWin;

    ampdoc = new AmpDocSingle(fakeWin);
    fakeWin.services['ampdoc'] = {obj: {
      getAmpDoc: () => ampdoc,
      isSingleDoc: () => true,
    }};

    installTimerService(fakeWin);
    installPlatformService(fakeWin);
    viewer = installViewerServiceForDoc(ampdoc);

    const whenFirstVisiblePromise = new Promise(resolve => {
      whenFirstVisibleResolve = resolve;
    });
    sandbox.stub(viewer, 'whenFirstVisible').returns(whenFirstVisiblePromise);
    sandbox.stub(viewer, 'onVisibilityChanged', handler => {
      visibilityObservable.add(handler);
    });

    installViewportServiceForDoc(ampdoc);
    viewport = viewportForDoc(ampdoc);

    sandbox.stub(viewport, 'onScroll', handler => {
      scrollObservable.add(handler);
    });

    fromClassForDoc(ampdoc, 'activity', Activity);

    return activityForDoc(ampdoc).then(a => {
      activity = a;
    });
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should use the stubed viewer in tests', () => {
    return expect(activity.viewer_).to.equal(viewer);
  });

  it('should have 0 engaged time if there is no activity', () => {
    return expect(activity.getTotalEngagedTime()).to.equal(0);
  });

  it('should have 5 seconds of engaged time after viewer becomes' +
     ' visible', () => {
    whenFirstVisibleResolve();
    return viewer.whenFirstVisible().then(() => {
      clock.tick(10000);
      return expect(activity.getTotalEngagedTime()).to.equal(5);
    });
  });

  it('should have 4 seconds of engaged time 4 seconds after visible', () => {
    whenFirstVisibleResolve();
    return viewer.whenFirstVisible().then(() => {
      clock.tick(4000);
      return expect(activity.getTotalEngagedTime()).to.equal(4);
    });
  });

  it('should have 10 seconds of engaged time', () => {
    whenFirstVisibleResolve();
    return viewer.whenFirstVisible().then(() => {
      clock.tick(6000);
      mousedownObservable.fire();
      clock.tick(20000);
      return expect(activity.getTotalEngagedTime()).to.equal(10);
    });
  });

  it('should have the same engaged time in separate requests', () => {
    whenFirstVisibleResolve();
    return viewer.whenFirstVisible().then(() => {
      clock.tick(3456);
      mousedownObservable.fire();
      clock.tick(10232);
      const first = activity.getTotalEngagedTime();
      clock.tick(25255);
      return expect(activity.getTotalEngagedTime()).to.equal(first);
    });
  });

  it('should not accumulate engaged time after inactivity', () => {
    const isVisibleStub = sandbox.stub(viewer, 'isVisible').returns(true);
    whenFirstVisibleResolve();
    return viewer.whenFirstVisible().then(() => {
      clock.tick(3000);
      mousedownObservable.fire();
      clock.tick(1000);
      isVisibleStub.returns(false);
      visibilityObservable.fire();
      clock.tick(10000);
      return expect(activity.getTotalEngagedTime()).to.equal(4);
    });
  });

  it('should accumulate engaged time over multiple activities', () => {
    whenFirstVisibleResolve();
    return viewer.whenFirstVisible().then(() => {
      clock.tick(10000);
      mousedownObservable.fire();
      clock.tick(10000);
      scrollObservable.fire();
      clock.tick(10000);
      mousedownObservable.fire();
      clock.tick(10000);
      return expect(activity.getTotalEngagedTime()).to.equal(20);
    });
  });

  it('should set event listeners on the document for' +
     ' "mousedown", "mouseup", "mousemove", "keyup", "keydown"', () => {
    const addEventListenerSpy = sandbox.spy(fakeDoc, 'addEventListener');
    expect(addEventListenerSpy).to.not.have.been.calledWith('mousedown',
        activity.boundHandleActivity_);
    expect(addEventListenerSpy).to.not.have.been.calledWith('mouseup',
        activity.boundHandleActivity_);
    expect(addEventListenerSpy).to.not.have.been.calledWith('mousemove',
        activity.boundHandleActivity_);
    expect(addEventListenerSpy).to.not.have.been.calledWith('keydown',
        activity.boundHandleActivity_);
    expect(addEventListenerSpy).to.not.have.been.calledWith('keyup',
        activity.boundHandleActivity_);
    whenFirstVisibleResolve();
    return viewer.whenFirstVisible().then(() => {
      expect(addEventListenerSpy).to.have.been.calledWith('mousedown',
          activity.boundHandleActivity_);
      expect(addEventListenerSpy).to.have.been.calledWith('mouseup',
          activity.boundHandleActivity_);
      expect(addEventListenerSpy).to.have.been.calledWith('mousemove',
          activity.boundHandleActivity_);
      expect(addEventListenerSpy).to.have.been.calledWith('keydown',
          activity.boundHandleActivity_);
      expect(addEventListenerSpy).to.have.been.calledWith('keyup',
          activity.boundHandleActivity_);
    });
  });
});
