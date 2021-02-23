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
import {Observable} from '../../src/observable';
import {Services} from '../../src/services';
import {installActivityServiceForTesting} from '../../extensions/amp-analytics/0.1/activity-impl';
import {installPlatformService} from '../../src/service/platform-impl';
import {installTimerService} from '../../src/service/timer-impl';
import {installViewerServiceForDoc} from '../../src/service/viewer-impl';
import {installViewportServiceForDoc} from '../../src/service/viewport/viewport-impl';
import {installVsyncService} from '../../src/service/vsync-impl';
import {markElementScheduledForTesting} from '../../src/service/custom-element-registry';

describe('Activity getTotalEngagedTime', () => {
  let clock;
  let fakeDoc;
  let fakeWin;
  let ampdoc;
  let viewport;
  let activity;
  let whenFirstVisibleResolve;
  let visibilityObservable;
  let mousedownObservable;
  let mouseleaveObservable;
  let scrollObservable;

  beforeEach(() => {
    clock = window.sandbox.useFakeTimers();

    // start at something other than 0
    clock.tick(123456);

    visibilityObservable = new Observable();
    mousedownObservable = new Observable();
    mouseleaveObservable = new Observable();
    scrollObservable = new Observable();

    fakeDoc = {
      nodeType: /* DOCUMENT */ 9,
      addEventListener(eventName, callback) {
        if (eventName === 'mousedown') {
          mousedownObservable.add(callback);
        } else if (eventName === 'mouseleave') {
          mouseleaveObservable.add(callback);
        }
      },
      documentElement: {
        style: {
          // required to instantiate Viewport service
          paddingTop: 0,
          setProperty: () => {},
        },
        classList: {
          add: () => {},
        },
      },
      body: {
        nodeType: 1,
        style: {},
      },
      head: {
        nodeType: /* ELEMENT */ 1,
      },
    };

    fakeWin = {
      __AMP_SERVICES: {},
      document: fakeDoc,
      location: {
        href: 'https://cdn.ampproject.org/v/www.origin.com/foo/?f=0',
      },
      navigator: window.navigator,
      setTimeout: window.setTimeout,
      clearTimeout: window.clearTimeout,
      // required to instantiate Viewport service
      addEventListener: () => {},
      removeEventListener: () => {},
      Promise: window.Promise,
    };
    fakeDoc.defaultView = fakeWin;
    fakeDoc.head.defaultView = fakeWin;

    ampdoc = new AmpDocSingle(fakeWin);
    fakeWin.__AMP_SERVICES['ampdoc'] = {
      obj: {
        getAmpDoc: () => ampdoc,
        isSingleDoc: () => true,
        getSingleDoc: () => ampdoc,
      },
    };

    installTimerService(fakeWin);
    installVsyncService(fakeWin);
    installPlatformService(fakeWin);
    installViewerServiceForDoc(ampdoc);

    const whenFirstVisiblePromise = new Promise((resolve) => {
      whenFirstVisibleResolve = resolve;
    });
    window.sandbox
      .stub(ampdoc, 'whenFirstVisible')
      .returns(whenFirstVisiblePromise);
    window.sandbox.stub(ampdoc, 'onVisibilityChanged').callsFake((handler) => {
      return visibilityObservable.add(handler);
    });

    installViewportServiceForDoc(ampdoc);
    viewport = Services.viewportForDoc(ampdoc);

    window.sandbox.stub(viewport, 'onScroll').callsFake((handler) => {
      scrollObservable.add(handler);
    });

    markElementScheduledForTesting(fakeWin, 'amp-analytics');
    installActivityServiceForTesting(ampdoc);

    return Services.activityForDoc(ampdoc.getHeadNode()).then((a) => {
      activity = a;
    });
  });

  it('should have 0 engaged time if there is no activity', () => {
    return expect(activity.getTotalEngagedTime()).to.equal(0);
  });

  it('should have 5 seconds of engaged time after doc becomes visible', () => {
    whenFirstVisibleResolve();
    return ampdoc.whenFirstVisible().then(() => {
      clock.tick(10000);
      return expect(activity.getTotalEngagedTime()).to.equal(5);
    });
  });

  it('should have 4 seconds of engaged time 4 seconds after visible', () => {
    whenFirstVisibleResolve();
    return ampdoc.whenFirstVisible().then(() => {
      clock.tick(4000);
      return expect(activity.getTotalEngagedTime()).to.equal(4);
    });
  });

  it('should have 10 seconds of engaged time', () => {
    whenFirstVisibleResolve();
    return ampdoc.whenFirstVisible().then(() => {
      clock.tick(6000);
      mousedownObservable.fire();
      clock.tick(20000);
      return expect(activity.getTotalEngagedTime()).to.equal(10);
    });
  });

  it('should have the same engaged time in separate requests', () => {
    whenFirstVisibleResolve();
    return ampdoc.whenFirstVisible().then(() => {
      clock.tick(3456);
      mousedownObservable.fire();
      clock.tick(10232);
      const first = activity.getTotalEngagedTime();
      clock.tick(25255);
      return expect(activity.getTotalEngagedTime()).to.equal(first);
    });
  });

  it('should not accumulate engaged time after inactivity', () => {
    const isVisibleStub = window.sandbox
      .stub(ampdoc, 'isVisible')
      .returns(true);
    whenFirstVisibleResolve();
    return ampdoc
      .whenFirstVisible()
      .then(() => {
        clock.tick(3000);
        mousedownObservable.fire();
        clock.tick(1000);
        isVisibleStub.returns(false);
        visibilityObservable.fire();
        clock.tick(10000);
        return expect(activity.getTotalEngagedTime()).to.equal(4);
      })
      .then(() => {
        mousedownObservable.fire();
        mouseleaveObservable.fire();
        clock.tick(2000);
        return expect(activity.getTotalEngagedTime()).to.equal(4);
      });
  });

  it('should accumulate engaged time over multiple activities', () => {
    whenFirstVisibleResolve();
    return ampdoc.whenFirstVisible().then(() => {
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

  it(
    'should set event listeners on the document for' +
      ' "mousedown", "mouseup", "mousemove", "keyup", "keydown", "mouseleave"',
    () => {
      const addEventListenerSpy = window.sandbox.spy(
        fakeDoc,
        'addEventListener'
      );
      expect(addEventListenerSpy).to.not.have.been.calledWith(
        'mousedown',
        activity.boundHandleActivity_
      );
      expect(addEventListenerSpy).to.not.have.been.calledWith(
        'mouseup',
        activity.boundHandleActivity_
      );
      expect(addEventListenerSpy).to.not.have.been.calledWith(
        'mousemove',
        activity.boundHandleActivity_
      );
      expect(addEventListenerSpy).to.not.have.been.calledWith(
        'keydown',
        activity.boundHandleActivity_
      );
      expect(addEventListenerSpy).to.not.have.been.calledWith(
        'keyup',
        activity.boundHandleActivity_
      );
      expect(addEventListenerSpy).to.not.have.been.calledWith(
        'mouseleave',
        activity.boundHandleActivity_
      );
      whenFirstVisibleResolve();
      return ampdoc.whenFirstVisible().then(() => {
        expect(addEventListenerSpy.getCall(0).args[0]).to.equal('mousedown');
        expect(addEventListenerSpy.getCall(1).args[0]).to.equal('mouseup');
        expect(addEventListenerSpy.getCall(2).args[0]).to.equal('mousemove');
        expect(addEventListenerSpy.getCall(3).args[0]).to.equal('keydown');
        expect(addEventListenerSpy.getCall(4).args[0]).to.equal('keyup');
        expect(addEventListenerSpy.getCall(5).args[0]).to.equal('mouseleave');
      });
    }
  );
});

describe('Activity getIncrementalEngagedTime', () => {
  let clock;
  let fakeDoc;
  let fakeWin;
  let ampdoc;
  let viewport;
  let activity;
  let whenFirstVisibleResolve;
  let visibilityObservable;
  let mousedownObservable;
  let scrollObservable;

  beforeEach(() => {
    clock = window.sandbox.useFakeTimers();

    // start at something other than 0
    clock.tick(123456);

    visibilityObservable = new Observable();
    mousedownObservable = new Observable();
    scrollObservable = new Observable();

    fakeDoc = {
      nodeType: /* DOCUMENT */ 9,
      addEventListener(eventName, callback) {
        if (eventName === 'mousedown') {
          mousedownObservable.add(callback);
        }
      },
      documentElement: {
        style: {
          // required to instantiate Viewport service
          paddingTop: 0,
          setProperty: () => {},
        },
        classList: {
          add: () => {},
        },
      },
      body: {
        nodeType: 1,
        style: {},
      },
      head: {
        nodeType: /* ELEMENT */ 1,
      },
    };

    fakeWin = {
      __AMP_SERVICES: {},
      document: fakeDoc,
      location: {
        href: 'https://cdn.ampproject.org/v/www.origin.com/foo/?f=0',
      },
      navigator: window.navigator,
      setTimeout: window.setTimeout,
      clearTimeout: window.clearTimeout,
      // required to instantiate Viewport service
      addEventListener: () => {},
      removeEventListener: () => {},
      Promise: window.Promise,
    };
    fakeDoc.defaultView = fakeWin;
    fakeDoc.head.defaultView = fakeWin;

    ampdoc = new AmpDocSingle(fakeWin);
    fakeWin.__AMP_SERVICES['ampdoc'] = {
      obj: {
        getAmpDoc: () => ampdoc,
        isSingleDoc: () => true,
        getSingleDoc: () => ampdoc,
      },
    };

    installTimerService(fakeWin);
    installVsyncService(fakeWin);
    installPlatformService(fakeWin);
    installViewerServiceForDoc(ampdoc);

    const whenFirstVisiblePromise = new Promise((resolve) => {
      whenFirstVisibleResolve = resolve;
    });
    window.sandbox
      .stub(ampdoc, 'whenFirstVisible')
      .returns(whenFirstVisiblePromise);
    window.sandbox.stub(ampdoc, 'onVisibilityChanged').callsFake((handler) => {
      return visibilityObservable.add(handler);
    });

    installViewportServiceForDoc(ampdoc);
    viewport = Services.viewportForDoc(ampdoc);

    window.sandbox.stub(viewport, 'onScroll').callsFake((handler) => {
      scrollObservable.add(handler);
    });

    markElementScheduledForTesting(fakeWin, 'amp-analytics');
    installActivityServiceForTesting(ampdoc);

    return Services.activityForDoc(ampdoc.getHeadNode()).then((a) => {
      activity = a;
    });
  });

  it('should have 0 seconds of incremental engaged time with no activity', () => {
    return expect(activity.getIncrementalEngagedTime('tests')).to.equal(0);
  });

  it(
    'should have 5 seconds of incremental engaged time after doc ' +
      'becomes visible',
    () => {
      whenFirstVisibleResolve();
      return ampdoc.whenFirstVisible().then(() => {
        clock.tick(10000);
        return expect(activity.getIncrementalEngagedTime('tests')).to.equal(5);
      });
    }
  );

  it('should have 4 seconds of incremental engaged time after 4 seconds', () => {
    whenFirstVisibleResolve();
    return ampdoc.whenFirstVisible().then(() => {
      clock.tick(4000);
      return expect(activity.getIncrementalEngagedTime('tests')).to.equal(4);
    });
  });

  it('should reset incremental engaged time after each poll', () => {
    whenFirstVisibleResolve();
    return ampdoc.whenFirstVisible().then(() => {
      clock.tick(10000);
      mousedownObservable.fire();
      const first = activity.getIncrementalEngagedTime('tests');
      expect(first).to.equal(5);
      expect(first).to.equal(activity.getTotalEngagedTime());
      expect(activity.getIncrementalEngagedTime('tests')).to.equal(0);
      clock.tick(10000);
      const second = activity.getIncrementalEngagedTime('tests');
      expect(second).to.equal(5);
      return expect(second).not.to.equal(activity.getTotalEngagedTime());
    });
  });

  it('should not reset incremental engaged time if reset is false', () => {
    whenFirstVisibleResolve();
    return ampdoc.whenFirstVisible().then(() => {
      // don't reset
      mousedownObservable.fire();
      clock.tick(10000);
      // more engaged time, don't reset
      const second = activity.getIncrementalEngagedTime('tests', false);
      expect(second).to.equal(5);
      mousedownObservable.fire();
      clock.tick(10000);
      // more engaged time, don't reset
      const third = activity.getIncrementalEngagedTime('tests', false);
      expect(third).to.equal(10);
      // more engaged time, reset
      const fourth = activity.getIncrementalEngagedTime('tests', true);
      expect(fourth).to.equal(10);
      mousedownObservable.fire();
      clock.tick(10000);
      // more engaged time, don't reset
      const fifth = activity.getIncrementalEngagedTime('tests', false);
      expect(fifth).to.equal(5);
      // reset with default value
      const sixth = activity.getIncrementalEngagedTime('tests');
      expect(sixth).to.equal(5);
      // should be reset
      const seventh = activity.getIncrementalEngagedTime('tests', false);
      return expect(seventh).to.equal(0);
    });
  });

  it('should keep individual incremental engaged times per name', () => {
    whenFirstVisibleResolve();
    return ampdoc.whenFirstVisible().then(() => {
      clock.tick(10000);
      mousedownObservable.fire();
      const alpha = activity.getIncrementalEngagedTime('alpha');
      const bravo = activity.getIncrementalEngagedTime('bravo');
      // both names should be equal
      expect(alpha).to.equal(bravo);
      mousedownObservable.fire();
      clock.tick(10000);
      // check alpha and not bravo to reset alpha
      const alpha2 = activity.getIncrementalEngagedTime('alpha');
      expect(alpha2).to.equal(5);
      mousedownObservable.fire();
      clock.tick(10000);
      // check bravo and alpha, alpha should be half bravo
      const bravo2 = activity.getIncrementalEngagedTime('bravo');
      const alpha3 = activity.getIncrementalEngagedTime('alpha');
      expect(bravo2).to.equal(10);
      return expect(alpha3).to.equal(5);
    });
  });
});
