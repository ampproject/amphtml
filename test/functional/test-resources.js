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
import {Resources} from '../../src/service/resources-impl';
import {Resource, ResourceState} from '../../src/service/resource';
import {VisibilityState} from '../../src/visibility-state';
import {layoutRectLtwh} from '../../src/layout-rect';
import * as sinon from 'sinon';

/*eslint "google-camelcase/google-camelcase": 0*/
describe('Resources', () => {

  let sandbox;
  let clock;
  let resources;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    clock = sandbox.useFakeTimers();
    resources = new Resources(new AmpDocSingle(window));
    resources.isRuntimeOn_ = false;
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should calculate correct calcTaskScore', () => {
    const viewportRect = layoutRectLtwh(0, 100, 300, 400);
    sandbox.stub(resources.viewport_, 'getRect', () => viewportRect);

    // Task 1 is right in the middle of the viewport and priority 0
    const task_in_viewport_p0 = {
      resource: {
        getLayoutBox() {
          return layoutRectLtwh(0, 200, 300, 100);
        },
        isFixed() {
          return false;
        },
      },
      priority: 0,
    };
    // Task 2 is in the viewport and priority 1
    const task_in_viewport_p1 = {
      resource: {
        getLayoutBox() {
          return layoutRectLtwh(0, 200, 300, 100);
        },
        isFixed() {
          return false;
        },
      },
      priority: 1,
    };
    // Task 3 is above viewport and priority 0
    const task_above_viewport_p0 = {
      resource: {
        getLayoutBox() {
          return layoutRectLtwh(0, 0, 300, 50);
        },
        isFixed() {
          return false;
        },
      },
      priority: 0,
    };
    // Task 4 is above viewport and priority 1
    const task_above_viewport_p1 = {
      resource: {
        getLayoutBox() {
          return layoutRectLtwh(0, 0, 300, 50);
        },
        isFixed() {
          return false;
        },
      },
      priority: 1,
    };
    // Task 5 is below viewport and priority 0
    const task_below_viewport_p0 = {
      resource: {
        getLayoutBox() {
          return layoutRectLtwh(0, 600, 300, 50);
        },
        isFixed() {
          return false;
        },
      },
      priority: 0,
    };
    // Task 6 is below viewport and priority 1
    const task_below_viewport_p1 = {
      resource: {
        getLayoutBox() {
          return layoutRectLtwh(0, 600, 300, 50);
        },
        isFixed() {
          return false;
        },
      },
      priority: 1,
    };
    // Task 7 is fixed right in the middle of the viewport and priority 0
    const task_fixed_in_viewport_p0 = {
      resource: {
        getLayoutBox() {
          return layoutRectLtwh(0, 200, 300, 100);
        },
        isFixed() {
          return false;
        },
      },
      priority: 0,
    };
    // Task 8 is fixed in the viewport and priority 1
    const task_fixed_in_viewport_p1 = {
      resource: {
        getLayoutBox() {
          return layoutRectLtwh(0, 200, 300, 100);
        },
        isFixed() {
          return false;
        },
      },
      priority: 1,
    };
    // Task 9 is fixed above viewport and priority 0
    const task_fixed_above_viewport_p0 = {
      resource: {
        getLayoutBox() {
          return layoutRectLtwh(0, 0, 300, 50);
        },
        isFixed() {
          return false;
        },
      },
      priority: 0,
    };
    // Task 10 is fixed above viewport and priority 1
    const task_fixed_above_viewport_p1 = {
      resource: {
        getLayoutBox() {
          return layoutRectLtwh(0, 0, 300, 50);
        },
        isFixed() {
          return false;
        },
      },
      priority: 1,
    };
    // Task 11 is fixed below viewport and priority 0
    const task_fixed_below_viewport_p0 = {
      resource: {
        getLayoutBox() {
          return layoutRectLtwh(0, 600, 300, 50);
        },
        isFixed() {
          return false;
        },
      },
      priority: 0,
    };
    // Task 12 is fixed below viewport and priority 1
    const task_fixed_below_viewport_p1 = {
      resource: {
        getLayoutBox() {
          return layoutRectLtwh(0, 600, 300, 50);
        },
        isFixed() {
          return false;
        },
      },
      priority: 1,
    };

    // 0 for in viewport
    expect(resources.calcTaskScore_(task_in_viewport_p0)).to.equal(0);
    expect(resources.calcTaskScore_(task_in_viewport_p1)).to.equal(10);

    // +2 for "one viewport away" * 2 because dir is opposite
    expect(resources.calcTaskScore_(task_above_viewport_p0)).to.equal(2);
    expect(resources.calcTaskScore_(task_above_viewport_p1)).to.equal(12);

    // +1 for "one viewport away" * 1 because dir is the same
    expect(resources.calcTaskScore_(task_below_viewport_p0)).to.equal(1);
    expect(resources.calcTaskScore_(task_below_viewport_p1)).to.equal(11);

    // 0 for fixed in viewport
    expect(resources.calcTaskScore_(task_fixed_in_viewport_p0)).to.equal(0);
    expect(resources.calcTaskScore_(task_fixed_in_viewport_p1)).to.equal(10);

    // +2 for fixed "one viewport away", * 2 because dir is opposite
    expect(resources.calcTaskScore_(task_fixed_above_viewport_p0)).to.equal(2);
    expect(resources.calcTaskScore_(task_fixed_above_viewport_p1)).to.equal(12);

    // +1 for fixed "one viewport away" * 1 because dir is the same
    expect(resources.calcTaskScore_(task_fixed_below_viewport_p0)).to.equal(1);
    expect(resources.calcTaskScore_(task_fixed_below_viewport_p1)).to.equal(11);
  });

  it('should calculate correct calcTaskTimeout', () => {
    // Task 1 is priority 0
    const task_p0 = {
      priority: 0,
      startTime: 0,
    };
    // Task 2 is priority 1
    const task_p1 = {
      priority: 1,
      startTime: 0,
    };

    // Empty pool
    expect(resources.calcTaskTimeout_(task_p0)).to.equal(0);
    expect(resources.calcTaskTimeout_(task_p1)).to.equal(0);

    // Idle render penalty after first visible
    resources.firstVisibleTime_ = 0;
    expect(resources.calcTaskTimeout_(task_p0)).to.equal(0);
    expect(resources.calcTaskTimeout_(task_p1)).to.equal(1000);

    // Hight priority task in pool
    resources.exec_.tasks_ = [task_p0];
    expect(resources.calcTaskTimeout_(task_p0)).to.equal(0);
    expect(resources.calcTaskTimeout_(task_p1)).to.equal(1000);

    clock.tick(100);
    expect(resources.calcTaskTimeout_(task_p1)).to.equal(900);

    clock.tick(1000);
    expect(resources.calcTaskTimeout_(task_p1)).to.equal(0);

    // Lower priority task in pool
    resources.exec_.tasks_ = [task_p1];
    expect(resources.calcTaskTimeout_(task_p0)).to.equal(0);
    expect(resources.calcTaskTimeout_(task_p1)).to.equal(0);

    // Multiple tasks in queue - maximum is picked
    task_p0.startTime = 1100;
    resources.exec_.tasks_ = [task_p0, task_p1];
    expect(resources.calcTaskTimeout_(task_p0)).to.equal(0);
    expect(resources.calcTaskTimeout_(task_p1)).to.equal(1000);
  });

  it('should not schedule non-prerenderable resource when' +
        ' document is hidden', () => {
    const resource = {
      getState: () => ResourceState.READY_FOR_LAYOUT,
      isDisplayed: () => true,
      isFixed: () => false,
      isInViewport: () => true,
      prerenderAllowed: () => false,
      renderOutsideViewport: () => false,
      startLayout: () => {},
    };
    resources.visible_ = false;
    sandbox.stub(resources.viewer_, 'getVisibilityState').returns(
      VisibilityState.PRERENDER
    );
    resources.scheduleLayoutOrPreload_(resource, true);
    expect(resources.queue_.getSize()).to.equal(0);
  });

  it('should schedule prerenderable resource when' +
        ' document is hidden', () => {
    const resource = {
      getState: () => ResourceState.READY_FOR_LAYOUT,
      isDisplayed: () => true,
      isFixed: () => false,
      isInViewport: () => true,
      prerenderAllowed: () => true,
      renderOutsideViewport: () => true,
      getPriority: () => 1,
      startLayout: () => {},
      layoutScheduled: () => {},
      getTaskId: () => 'resource#P',
    };
    resources.visible_ = false;
    sandbox.stub(resources.viewer_, 'getVisibilityState').returns(
      VisibilityState.PRERENDER
    );
    resources.scheduleLayoutOrPreload_(resource, true);
    expect(resources.queue_.getSize()).to.equal(1);
  });

  it('should not schedule non-renderOutsideViewport resource when' +
        ' resource is not visible', () => {
    const resource = {
      getState: () => ResourceState.READY_FOR_LAYOUT,
      isDisplayed: () => true,
      isFixed: () => false,
      isInViewport: () => false,
      prerenderAllowed: () => true,
      renderOutsideViewport: () => false,
      startLayout: () => {},
    };
    resources.scheduleLayoutOrPreload_(resource, true);
    expect(resources.queue_.getSize()).to.equal(0);
  });

  it('should schedule renderOutsideViewport resource when' +
        ' resource is not visible', () => {
    const resource = {
      getState: () => ResourceState.READY_FOR_LAYOUT,
      isDisplayed: () => true,
      isFixed: () => false,
      isInViewport: () => false,
      prerenderAllowed: () => true,
      renderOutsideViewport: () => true,
      getPriority: () => 1,
      startLayout: () => {},
      layoutScheduled: () => {},
      getTaskId: () => 'resource#L',
    };
    resources.scheduleLayoutOrPreload_(resource, true);
    expect(resources.queue_.getSize()).to.equal(1);
  });
});

describe('Resources pause/resume/unlayout scheduling', () => {

  let sandbox;
  let resources;
  let parent;
  let children;
  let child0;
  let child1;
  let child2;

  function createElement() {
    return {
      ownerDocument: {defaultView: window},
      tagName: 'amp-test',
      isBuilt() {
        return true;
      },
      isUpgraded() {
        return true;
      },
      getAttribute() {
        return null;
      },
      contains() {
        return true;
      },
      classList: {
        contains() {
          return true;
        },
      },
      getPlaceholder() {
      },
      pauseCallback() {
      },
      resumeCallback() {
      },
      unlayoutCallback() {
        return false;
      },
      unlayoutOnPause() {
        return false;
      },
      getPriority() {
        return 0;
      },
    };
  }

  function createElementWithResource(id) {
    const element = createElement();
    const resource = new Resource(id, element, resources);
    resource.state_ = ResourceState.LAYOUT_COMPLETE;
    resource.element['__AMP__RESOURCE'] = resource;
    return [element, resource];
  }

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    resources = new Resources(new AmpDocSingle(window));
    resources.isRuntimeOn_ = false;
    const parentTuple = createElementWithResource(1);
    parent = parentTuple[0];
    child0 = document.createElement('div');
    child1 = createElementWithResource(2)[0];
    child2 = createElementWithResource(3)[0];
    children = [child0, child1, child2];
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('schedulePause', () => {
    it('should not throw with a single element', () => {
      expect(() => {
        resources.schedulePause(parent, child1);
      }).to.not.throw();
    });

    it('should not throw with an array of elements', () => {
      expect(() => {
        resources.schedulePause(parent, [child1, child2]);
      }).to.not.throw();
    });

    it('should be ok with non amp children', () => {
      expect(() => {
        resources.schedulePause(parent, children);
        resources.schedulePause(parent, child0);
      }).to.not.throw();
    });

    it('should call pauseCallback on custom element', () => {
      const stub1 = sandbox.stub(child1, 'pauseCallback');
      const stub2 = sandbox.stub(child2, 'pauseCallback');

      resources.schedulePause(parent, children);
      expect(stub1.calledOnce).to.be.true;
      expect(stub2.calledOnce).to.be.true;
    });

    it('should call unlayoutCallback when unlayoutOnPause', () => {
      const stub1 = sandbox.stub(child1, 'unlayoutCallback');
      const stub2 = sandbox.stub(child2, 'unlayoutCallback');
      sandbox.stub(child1, 'unlayoutOnPause').returns(true);

      resources.schedulePause(parent, children);
      expect(stub1.calledOnce).to.be.true;
      expect(stub2.calledOnce).to.be.false;
    });
  });

  describe('scheduleResume', () => {
    beforeEach(() => {
      // Pause one child.
      resources.schedulePause(parent, child1);
    });

    it('should not throw with a single element', () => {
      expect(() => {
        resources.scheduleResume(parent, child1);
      }).to.not.throw();
    });

    it('should not throw with an array of elements', () => {
      expect(() => {
        resources.scheduleResume(parent, [child1, child2]);
      }).to.not.throw();
    });

    it('should be ok with non amp children', () => {
      expect(() => {
        resources.scheduleResume(parent, children);
        resources.scheduleResume(parent, child0);
      }).to.not.throw();
    });

    it('should call resumeCallback on paused custom elements', () => {
      const stub1 = sandbox.stub(child1, 'resumeCallback');

      resources.scheduleResume(parent, children);
      expect(stub1.calledOnce).to.be.true;
    });

    it('should not call resumeCallback on non-paused custom elements', () => {
      const stub2 = sandbox.stub(child2, 'resumeCallback');

      resources.scheduleResume(parent, children);
      expect(stub2.calledOnce).to.be.false;
    });
  });

  describe('scheduleUnlayout', () => {
    it('should not throw with a single element', () => {
      expect(() => {
        resources.scheduleUnlayout(parent, child1);
      }).to.not.throw();
    });

    it('should not throw with an array of elements', () => {
      expect(() => {
        resources.scheduleUnlayout(parent, [child1, child2]);
      }).to.not.throw();
    });

    it('should be ok with non amp children', () => {
      expect(() => {
        resources.scheduleUnlayout(parent, children);
      }).to.not.throw();
    });

    it('should schedule on custom element with multiple children', () => {
      const stub1 = sandbox.stub(child1, 'unlayoutCallback');
      const stub2 = sandbox.stub(child2, 'unlayoutCallback');
      resources.scheduleUnlayout(parent, children);
      expect(stub1.called).to.be.true;
      expect(stub2.called).to.be.true;
    });
  });
});

describe('Resources schedulePreload', () => {

  let sandbox;
  let resources;
  let parent;
  let children;
  let child0;
  let child1;
  let child2;
  let placeholder;

  function createElement() {
    return {
      ownerDocument: {defaultView: window},
      tagName: 'amp-test',
      isBuilt() {
        return true;
      },
      isUpgraded() {
        return true;
      },
      getAttribute() {
        return null;
      },
      contains() {
        return true;
      },
      classList: {
        contains() {
          return true;
        },
      },
      getPlaceholder() {
        return placeholder;
      },
      renderOutsideViewport() {
        return false;
      },
      layoutCallback() {
      },
      pauseCallback() {
      },
      unlayoutCallback() {
        return false;
      },
      unlayoutOnPause() {
        return false;
      },
      getPriority() {
        return 0;
      },
    };
  }

  function createElementWithResource(id) {
    const element = createElement();
    const resource = new Resource(id, element, resources);
    resource.state_ = ResourceState.READY_FOR_LAYOUT;
    resource.element['__AMP__RESOURCE'] = resource;
    resource.measure = sandbox.spy();
    resource.isDisplayed = () => true;
    resource.isInViewport = () => true;
    return [element, resource];
  }

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    resources = new Resources(new AmpDocSingle(window));
    resources.isRuntimeOn_ = false;
    const parentTuple = createElementWithResource(1);
    parent = parentTuple[0];
    placeholder = document.createElement('div');
    child0 = document.createElement('div');
    child1 = createElementWithResource(2)[0];
    child2 = createElementWithResource(3)[0];
    children = [child0, child1, child2];
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should not throw with a single element', () => {
    expect(() => {
      resources.schedulePreload(parent, child1);
    }).to.not.throw();
  });

  it('should not throw with an array of elements', () => {
    expect(() => {
      resources.schedulePreload(parent, [child1, child2]);
    }).to.not.throw();
  });

  it('should be ok with non amp children', () => {
    expect(() => {
      resources.schedulePreload(parent, children);
    }).to.not.throw();
  });

  it('should schedule on custom element with multiple children', () => {
    const stub1 = sandbox.stub(resources, 'schedule_');
    resources.schedulePreload(parent, children);
    expect(stub1.called).to.be.true;
    expect(stub1.callCount).to.be.equal(2);
  });

  it('should schedule on nested custom element placeholder', () => {
    const stub1 = sandbox.stub(resources, 'schedule_');

    const placeholder1 = createElementWithResource(4)[0];
    child1.getPlaceholder = () => placeholder1;

    const placeholder2 = createElementWithResource(5)[0];
    child2.getPlaceholder = () => placeholder2;

    resources.schedulePreload(parent, children);
    expect(stub1.called).to.be.true;
    expect(stub1.callCount).to.be.equal(4);
  });

  it('should schedule amp-* placeholder inside non-amp element', () => {
    const stub1 = sandbox.stub(resources, 'schedule_');

    const insidePlaceholder1 = createElementWithResource(4)[0];
    const placeholder1 = document.createElement('div');
    child0.getElementsByClassName = () => [insidePlaceholder1];
    child0.getPlaceholder = () => placeholder1;

    resources.schedulePreload(parent, children);
    expect(stub1.called).to.be.true;
    expect(stub1.callCount).to.be.equal(3);
  });
});


describe('Resources discoverWork', () => {

  function createElement(rect) {
    return {
      ownerDocument: {defaultView: window},
      tagName: 'amp-test',
      isBuilt: () => {
        return true;
      },
      isUpgraded: () => {
        return true;
      },
      getAttribute: () => {
        return null;
      },
      getBoundingClientRect: () => rect,
      updateLayoutBox: () => {},
      applySizesAndMediaQuery: () => {},
      layoutCallback: () => Promise.resolve(),
      viewportCallback: sandbox.spy(),
      prerenderAllowed: () => true,
      renderOutsideViewport: () => true,
      isRelayoutNeeded: () => true,
      pauseCallback: () => {},
      unlayoutCallback: () => true,
      unlayoutOnPause: () => true,
      togglePlaceholder: () => sandbox.spy(),
      getPriority: () => 1,
    };
  }

  function createResource(id, rect) {
    const resource = new Resource(id, createElement(rect), resources);
    resource.state_ = ResourceState.READY_FOR_LAYOUT;
    resource.layoutBox_ = rect;
    return resource;
  }

  let sandbox;
  let viewportMock;
  let resources;
  let resource1, resource2;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    resources = new Resources(new AmpDocSingle(window));
    viewportMock = sandbox.mock(resources.viewport_);

    resource1 = createResource(1, layoutRectLtwh(10, 10, 100, 100));
    resource2 = createResource(2, layoutRectLtwh(10, 1010, 100, 100));
    resources.resources_ = [resource1, resource2];
    resources.vsync_ = {
      mutate: callback => callback(),
    };
  });

  afterEach(() => {
    viewportMock.verify();
    sandbox.restore();
  });

  it('should render two screens when visible', () => {
    resources.visible_ = true;
    sandbox.stub(resources.viewer_, 'getVisibilityState').returns(
      VisibilityState.VISIBLE
    );
    viewportMock.expects('getRect').returns(
        layoutRectLtwh(0, 0, 300, 400)).once();

    resources.discoverWork_();

    expect(resources.queue_.getSize()).to.equal(2);
    expect(resources.queue_.tasks_[0].resource).to.equal(resource1);
    expect(resources.queue_.tasks_[1].resource).to.equal(resource2);
  });

  it('should NOT rerender anything', () => {
    resource1.state_ = ResourceState.LAYOUT_COMPLETE;
    resource2.state_ = ResourceState.LAYOUT_COMPLETE;
    resources.visible_ = true;
    sandbox.stub(resources.viewer_, 'getVisibilityState').returns(
      VisibilityState.VISIBLE
    );
    viewportMock.expects('getRect').returns(
        layoutRectLtwh(0, 0, 300, 400)).once();

    resources.discoverWork_();

    expect(resources.queue_.getSize()).to.equal(0);
  });

  it('should re-render from requested position', () => {
    resource1.state_ = ResourceState.LAYOUT_COMPLETE;
    resource2.state_ = ResourceState.LAYOUT_COMPLETE;
    resource1.element.getBoundingClientRect =
        () => layoutRectLtwh(10, 10, 100, 101);
    resource2.element.getBoundingClientRect =
        () => layoutRectLtwh(10, 1010, 100, 101);
    resources.visible_ = true;
    sandbox.stub(resources.viewer_, 'getVisibilityState').returns(
      VisibilityState.VISIBLE
    );
    resources.relayoutAll_ = false;
    resources.relayoutTop_ = 1000;
    viewportMock.expects('getRect').returns(
        layoutRectLtwh(0, 0, 300, 400)).once();

    resources.discoverWork_();

    expect(resources.relayoutTop_).to.equal(-1);
    expect(resources.queue_.getSize()).to.equal(1);
    expect(resources.queue_.tasks_[0].resource).to.equal(resource2);
    expect(resource1.state_).to.equal(ResourceState.LAYOUT_COMPLETE);
    expect(resource2.state_).to.equal(ResourceState.LAYOUT_SCHEDULED);
  });

  it('should prerender only one screen with prerenderSize = 1', () => {
    resources.visible_ = false;
    sandbox.stub(resources.viewer_, 'getVisibilityState').returns(
      VisibilityState.PRERENDER
    );
    resources.prerenderSize_ = 1;
    viewportMock.expects('getRect').returns(
        layoutRectLtwh(0, 0, 300, 1009)).once();

    resources.discoverWork_();

    expect(resources.queue_.getSize()).to.equal(1);
    expect(resources.queue_.tasks_[0].resource).to.equal(resource1);
  });

  it('should NOT prerender anything with prerenderSize = 0', () => {
    resources.visible_ = false;
    sandbox.stub(resources.viewer_, 'getVisibilityState').returns(
      VisibilityState.PRERENDER
    );
    resources.prerenderSize_ = 0;
    viewportMock.expects('getRect').returns(
        layoutRectLtwh(0, 0, 300, 400)).once();

    resources.discoverWork_();

    expect(resources.queue_.getSize()).to.equal(0);
  });

  it('should remeasure when requested and scheduled unloads', () => {
    resource1.state_ = ResourceState.LAYOUT_COMPLETE;
    resource2.state_ = ResourceState.LAYOUT_COMPLETE;
    resources.visible_ = true;
    sandbox.stub(resources.viewer_, 'getVisibilityState').returns(
      VisibilityState.VISIBLE
    );
    viewportMock.expects('getRect').returns(
        layoutRectLtwh(0, 0, 300, 400)).atLeast(1);

    const resource1MeasureStub = sandbox.stub(resource1, 'measure',
        resource1.measure.bind(resource1));
    const resource1UnloadStub = sandbox.stub(resource1, 'unload');
    const resource2MeasureStub = sandbox.stub(resource2, 'measure',
        resource2.measure.bind(resource2));
    const resource2UnloadStub = sandbox.stub(resource2, 'unload');

    // 1st pass: measure for the first time.
    resources.discoverWork_();
    expect(resource1MeasureStub.callCount).to.equal(1);
    expect(resource1UnloadStub.callCount).to.equal(0);
    expect(resource2MeasureStub.callCount).to.equal(1);
    expect(resource2UnloadStub.callCount).to.equal(0);

    // 2nd pass: do not remeasure anything.
    resources.discoverWork_();
    expect(resource1MeasureStub.callCount).to.equal(1);
    expect(resource1UnloadStub.callCount).to.equal(0);
    expect(resource2MeasureStub.callCount).to.equal(1);
    expect(resource2UnloadStub.callCount).to.equal(0);

    // 3rd pass: request remeasures and an unload.
    resource1.requestMeasure();
    resource2.requestMeasure();
    expect(resource1.isMeasureRequested()).to.be.true;
    expect(resource2.isMeasureRequested()).to.be.true;
    resource2.element.getBoundingClientRect =
        () => layoutRectLtwh(0, 0, 0, 0);  // Equiv to display:none.
    resources.discoverWork_();
    expect(resource1MeasureStub.callCount).to.equal(2);
    expect(resource1UnloadStub.callCount).to.equal(0);
    expect(resource2MeasureStub.callCount).to.equal(2);
    expect(resource2UnloadStub.callCount).to.equal(1);
  });

  it('should eject stale tasks when element unloaded', () => {
    const pendingResource = createResource(5, layoutRectLtwh(0, 0, 0, 0));
    pendingResource.state_ = ResourceState.NOT_BUILT;
    resources.pendingBuildResources_ = [pendingResource];
    resources.visible_ = true;
    // Don't resolve layout - immulating DOM being removed and load
    // promise not resolving.
    resource2.layoutCallback = new Promise(unusedResolve => {});
    resource2.unlayoutCallback = () => true;
    resource2.prerenderAllowed = () => false;

    resource1.layoutCallback = new Promise(unusedResolve => {});
    resource1.unlayoutCallback = () => true;

    sandbox.stub(resources.viewer_, 'getVisibilityState').returns(
        VisibilityState.VISIBLE
    );
    viewportMock.expects('getRect').returns(
        layoutRectLtwh(0, 0, 300, 400)).atLeast(1);

    resources.discoverWork_();
    expect(resources.queue_.getSize()).to.equal(2);
    expect(resources.queue_.tasks_[0].resource).to.equal(resource1);
    expect(resources.queue_.tasks_[1].resource).to.equal(resource2);
    expect(resources.pendingBuildResources_.length).to.equal(1);

    resources.work_();
    expect(resources.exec_.getSize()).to.equal(2);

    // Remove unloaded resources from exec queue.
    resource2.unload();
    resources.cleanupTasks_(resource2);
    expect(resources.exec_.getSize()).to.equal(1);

    // Shouldn't remove tasks if the resource is not unloaded.
    resources.cleanupTasks_(resource1);
    expect(resources.exec_.getSize()).to.equal(1);

    // Can successfully reschedules unloaded elements.
    resources.discoverWork_();
    expect(resources.queue_.getSize()).to.equal(1);
    expect(resources.queue_.tasks_[0].resource).to.equal(resource2);

    // Removes them even from scheduling queue.
    resource2.unload();
    resources.cleanupTasks_(resource2, /* opt_removePending */ true);
    expect(resources.queue_.getSize()).to.equal(0);
    expect(resources.pendingBuildResources_.length).to.equal(1);

    const pendingElement = {'__AMP__RESOURCE': pendingResource};
    resources.remove(pendingElement);
    expect(resources.pendingBuildResources_.length).to.equal(0);
  });

  it('should update inViewport before scheduling layouts', () => {
    resources.visible_ = true;
    sandbox.stub(resources.viewer_, 'getVisibilityState').returns(
      VisibilityState.VISIBLE
    );
    viewportMock.expects('getRect').returns(
        layoutRectLtwh(0, 0, 300, 400)).once();
    const setInViewport = sandbox.spy(resource1, 'setInViewport');
    const schedule = sandbox.spy(resources, 'scheduleLayoutOrPreload_');

    resources.discoverWork_();

    expect(resource1.isInViewport()).to.be.true;
    expect(setInViewport).to.have.been.calledBefore(schedule);
  });

  it('should build resource when not built', () => {
    const schedulePassStub = sandbox.stub(resources, 'schedulePass');
    sandbox.stub(resources, 'schedule_');
    resources.documentReady_ = true;
    resource1.element.isBuilt = () => false;
    resource1.state_ = ResourceState.NOT_BUILT;
    resource1.build = sandbox.spy();

    resources.discoverWork_();

    expect(resource1.build).to.be.calledOnce;
    expect(schedulePassStub).to.not.be.called;
  });

  it('should build resource when not built and before doc ready', () => {
    const schedulePassStub = sandbox.stub(resources, 'schedulePass');
    sandbox.stub(resources, 'schedule_');
    resources.documentReady_ = false;
    resource1.element.nextSibling = {};
    resource1.element.isBuilt = () => false;
    resource1.state_ = ResourceState.NOT_BUILT;
    resource1.build = sandbox.spy();

    resources.discoverWork_();

    expect(resource1.build).to.be.calledOnce;
    expect(schedulePassStub).to.not.be.called;
  });

  it('should not build a blacklisted resource', () => {
    const schedulePassStub = sandbox.stub(resources, 'schedulePass');
    sandbox.stub(resources, 'schedule_');
    resources.documentReady_ = true;
    resource1.state_ = ResourceState.NOT_BUILT;
    resource1.element.isBuilt = () => false;
    resource1.blacklisted_ = true;
    resource1.build = sandbox.spy();

    resources.discoverWork_();

    expect(resource1.build).to.not.be.called;
    expect(schedulePassStub).to.not.be.called;
  });

  it('should not build a blacklisted resource before doc ready', () => {
    const schedulePassStub = sandbox.stub(resources, 'schedulePass');
    sandbox.stub(resources, 'schedule_');
    resource1.nextSibling = {};
    resource1.state_ = ResourceState.NOT_BUILT;
    resource1.element.isBuilt = () => false;
    resource1.blacklisted_ = true;
    resource1.build = sandbox.spy();

    resources.discoverWork_();

    expect(resource1.build).to.not.be.called;
    expect(schedulePassStub).to.not.be.called;
  });
});


describe('Resources changeSize', () => {

  function createElement(rect) {
    return {
      ownerDocument: {defaultView: window},
      tagName: 'amp-test',
      isBuilt: () => {
        return true;
      },
      isUpgraded: () => {
        return true;
      },
      getAttribute: () => {
        return null;
      },
      getBoundingClientRect: () => rect,
      applySizesAndMediaQuery: () => {},
      layoutCallback: () => Promise.resolve(),
      viewportCallback: sandbox.spy(),
      prerenderAllowed: () => true,
      renderOutsideViewport: () => false,
      unlayoutCallback: () => true,
      pauseCallback: () => {},
      unlayoutOnPause: () => true,
      isRelayoutNeeded: () => true,
      contains: unused_otherElement => false,
      updateLayoutBox: () => {},
      togglePlaceholder: () => sandbox.spy(),
      overflowCallback:
          (unused_overflown, unused_requestedHeight, unused_requestedWidth) => {
          },
      getPriority: () => 0,
    };
  }

  function createResource(id, rect) {
    const resource = new Resource(id, createElement(rect), resources);
    resource.element['__AMP__RESOURCE'] = resource;
    resource.state_ = ResourceState.READY_FOR_LAYOUT;
    resource.initialLayoutBox_ = resource.layoutBox_ = rect;
    resource.changeSize = sandbox.spy();
    return resource;
  }

  let sandbox;
  let clock;
  let viewportMock;
  let resources;
  let resource1, resource2;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    clock = sandbox.useFakeTimers();
    resources = new Resources(new AmpDocSingle(window));
    resources.isRuntimeOn_ = false;
    viewportMock = sandbox.mock(resources.viewport_);

    resource1 = createResource(1, layoutRectLtwh(10, 10, 100, 100));
    resource2 = createResource(2, layoutRectLtwh(10, 1010, 100, 100));
    resources.resources_ = [resource1, resource2];
  });

  afterEach(() => {
    viewportMock.verify();
    sandbox.restore();
  });

  it('should schedule separate requests', () => {
    resources.scheduleChangeSize_(resource1, 111, 100, false);
    resources.scheduleChangeSize_(resource2, 222, undefined, true);

    expect(resources.requestsChangeSize_.length).to.equal(2);
    expect(resources.requestsChangeSize_[0].resource).to.equal(resource1);
    expect(resources.requestsChangeSize_[0].newHeight).to.equal(111);
    expect(resources.requestsChangeSize_[0].newWidth).to.equal(100);
    expect(resources.requestsChangeSize_[0].force).to.equal(false);

    expect(resources.requestsChangeSize_[1].resource).to.equal(resource2);
    expect(resources.requestsChangeSize_[1].newHeight).to.equal(222);
    expect(resources.requestsChangeSize_[1].newWidth).to.be.undefined;
    expect(resources.requestsChangeSize_[1].force).to.equal(true);
  });

  it('should schedule height only size change', () => {
    resources.scheduleChangeSize_(resource1, 111, undefined, false);
    expect(resources.requestsChangeSize_.length).to.equal(1);
    expect(resources.requestsChangeSize_[0].resource).to.equal(resource1);
    expect(resources.requestsChangeSize_[0].newHeight).to.equal(111);
    expect(resources.requestsChangeSize_[0].newWidth).to.be.undefined;
    expect(resources.requestsChangeSize_[0].force).to.equal(false);
  });

  it('should remove request change size for unloaded resources', () => {
    resources.scheduleChangeSize_(resource1, 111, undefined, false);
    resources.scheduleChangeSize_(resource2, 111, undefined, false);
    expect(resources.requestsChangeSize_.length).to.equal(2);
    resource1.unload();
    resources.cleanupTasks_(resource1);
    expect(resources.requestsChangeSize_.length).to.equal(1);
    expect(resources.requestsChangeSize_[0].resource).to.equal(resource2);
  });

  it('should schedule width only size change', () => {
    resources.scheduleChangeSize_(resource1, undefined, 111,false);
    expect(resources.requestsChangeSize_.length).to.equal(1);
    expect(resources.requestsChangeSize_[0].resource).to.equal(resource1);
    expect(resources.requestsChangeSize_[0].newWidth).to.equal(111);
    expect(resources.requestsChangeSize_[0].newHeight).to.be.undefined;
    expect(resources.requestsChangeSize_[0].force).to.equal(false);
  });

  it('should only schedule latest request for the same resource', () => {
    resources.scheduleChangeSize_(resource1, 111, 100, true);
    resources.scheduleChangeSize_(resource1, 222, 300, false);

    expect(resources.requestsChangeSize_.length).to.equal(1);
    expect(resources.requestsChangeSize_[0].resource).to.equal(resource1);
    expect(resources.requestsChangeSize_[0].newHeight).to.equal(222);
    expect(resources.requestsChangeSize_[0].newWidth).to.equal(300);
    expect(resources.requestsChangeSize_[0].force).to.equal(true);
  });

  it('should NOT change size if it didn\'t change', () => {
    resources.scheduleChangeSize_(resource1, 100, 100, true);
    resources.mutateWork_();
    expect(resources.relayoutTop_).to.equal(-1);
    expect(resources.requestsChangeSize_.length).to.equal(0);
    expect(resource1.changeSize.callCount).to.equal(0);
  });

  it('should change size', () => {
    resources.scheduleChangeSize_(resource1, 111, 222, true);
    resources.mutateWork_();
    expect(resources.relayoutTop_).to.equal(resource1.layoutBox_.top);
    expect(resources.requestsChangeSize_.length).to.equal(0);
    expect(resource1.changeSize.callCount).to.equal(1);
    expect(resource1.changeSize.firstCall.args[0]).to.equal(111);
    expect(resource1.changeSize.firstCall.args[1]).to.equal(222);
  });

  it('should pick the smallest relayoutTop', () => {
    resources.scheduleChangeSize_(resource2, 111, 222, true);
    resources.scheduleChangeSize_(resource1, 111, 222, true);
    resources.mutateWork_();
    expect(resources.relayoutTop_).to.equal(resource1.layoutBox_.top);
  });

  it('should measure non-measured elements', () => {
    resource1.initialLayoutBox_ = null;
    resource1.measure = sandbox.spy();
    resource2.measure = sandbox.spy();

    resources.scheduleChangeSize_(resource1, 111, 200, true);
    resources.scheduleChangeSize_(resource2, 111, 222, true);
    expect(resource1.hasBeenMeasured()).to.be.false;
    expect(resource2.hasBeenMeasured()).to.be.true;

    // Not yet scheduled, will wait until vsync.
    expect(resource1.measure).to.not.be.called;

    // Scheduling is done after vsync.
    resources.vsync_.runScheduledTasks_();
    expect(resource1.measure).to.be.calledOnce;
    expect(resource2.measure).to.not.be.called;

    // Notice that the `resource2` was scheduled first since it didn't
    // require vsync.
    expect(resources.requestsChangeSize_).to.have.length(2);
    expect(resources.requestsChangeSize_[0].resource).to.equal(resource2);
    expect(resources.requestsChangeSize_[1].resource).to.equal(resource1);
  });

  describe('attemptChangeSize rules wrt viewport', () => {
    let overflowCallbackSpy;
    let vsyncSpy;

    beforeEach(() => {
      overflowCallbackSpy = sandbox.spy();
      resource1.element.overflowCallback = overflowCallbackSpy;
      viewportMock.expects('getRect').returns(
          {top: 0, left: 0, right: 100, bottom: 200, height: 200}).atLeast(1);
      viewportMock.expects('getScrollHeight').returns(10000).atLeast(1);
      resource1.layoutBox_ = {top: 10, left: 0, right: 100, bottom: 50,
          height: 50};
      vsyncSpy = sandbox.stub(resources.vsync_, 'run');
    });

    it('should NOT change size when height is unchanged', () => {
      const callback = sandbox.spy();
      resource1.layoutBox_ = {top: 10, left: 0, right: 100, bottom: 210,
          height: 50};
      resources.scheduleChangeSize_(resource1, 50, /* width */ undefined, false,
          callback);
      resources.mutateWork_();
      expect(resource1.changeSize).to.not.been.called;
      expect(overflowCallbackSpy).to.not.been.called;
      expect(callback).to.be.calledOnce;
      expect(callback.args[0][0]).to.be.true;
    });

    it('should change size when forced', () => {
      resources.scheduleChangeSize_(resource1, 111, 222, true);
      resources.mutateWork_();
      expect(resources.requestsChangeSize_).to.be.empty;
      expect(resource1.changeSize).to.be.calledOnce;
      expect(overflowCallbackSpy).to.be.calledOnce;
      expect(overflowCallbackSpy.firstCall.args[0]).to.equal(false);
    });

    it('should change size when document is invisible', () => {
      resources.visible_ = false;
      sandbox.stub(resources.viewer_, 'getVisibilityState').returns(
        VisibilityState.PRERENDER
      );
      resources.scheduleChangeSize_(resource1, 111, 222, false);
      resources.mutateWork_();
      expect(resources.requestsChangeSize_).to.be.empty;
      expect(resource1.changeSize).to.be.calledOnce;
      expect(overflowCallbackSpy).to.be.calledOnce;
      expect(overflowCallbackSpy.firstCall.args[0]).to.equal(false);
    });

    it('should change size when active', () => {
      resource1.element.contains = () => true;
      resources.scheduleChangeSize_(resource1, 111, 222, false);
      resources.mutateWork_();
      expect(resources.requestsChangeSize_).to.be.empty;
      expect(resource1.changeSize).to.be.calledOnce;
      expect(overflowCallbackSpy).to.be.calledOnce;
      expect(overflowCallbackSpy.firstCall.args[0]).to.equal(false);
    });

    it('should change size when below the viewport', () => {
      resource1.layoutBox_ = {top: 10, left: 0, right: 100, bottom: 1050,
          height: 50};
      resources.scheduleChangeSize_(resource1, 111, 222, false);
      resources.mutateWork_();
      expect(resources.requestsChangeSize_).to.be.empty;
      expect(resource1.changeSize).to.be.calledOnce;
      expect(overflowCallbackSpy).to.be.calledOnce;
      expect(overflowCallbackSpy.firstCall.args[0]).to.equal(false);
    });

    it('should defer when above the viewport and scrolling on', () => {
      resource1.layoutBox_ = {top: -1200, left: 0, right: 100, bottom: -1050,
          height: 50};
      resources.lastVelocity_ = 10;
      resources.lastScrollTime_ = Date.now();
      resources.scheduleChangeSize_(resource1, 111, 222, false);
      resources.mutateWork_();
      expect(resources.requestsChangeSize_.length).to.equal(1);
      expect(resource1.changeSize).to.not.been.called;
      expect(overflowCallbackSpy).to.not.been.called;
    });

    it('should change size when above the vp and adjust scrolling', () => {
      viewportMock.expects('getScrollHeight').returns(2999).once();
      viewportMock.expects('getScrollTop').returns(1777).once();
      resource1.layoutBox_ = {top: -1200, left: 0, right: 100, bottom: -1050,
          height: 50};
      resources.lastVelocity_ = 0;
      clock.tick(5000);
      resources.scheduleChangeSize_(resource1, 111, 222, false);
      resources.mutateWork_();
      expect(resources.requestsChangeSize_).to.be.empty;
      expect(resource1.changeSize).to.not.been.called;

      expect(vsyncSpy.callCount).to.be.greaterThan(1);
      const task = vsyncSpy.lastCall.args[0];
      const state = {};
      task.measure(state);
      expect(state.scrollTop).to.equal(1777);
      expect(state.scrollHeight).to.equal(2999);

      viewportMock.expects('getScrollHeight').returns(3999).once();
      viewportMock.expects('setScrollTop').withExactArgs(2777).once();
      task.mutate(state);
      expect(resource1.changeSize).to.be.calledOnce;
      expect(resource1.changeSize).to.be.calledWith(111, 222);
      expect(resources.relayoutTop_).to.equal(resource1.layoutBox_.top);
    });

    it('should NOT adjust scrolling if size did not increase', () => {
      viewportMock.expects('getScrollHeight').returns(2999).once();
      viewportMock.expects('getScrollTop').returns(1777).once();
      resource1.layoutBox_ = {top: -1200, left: 0, right: 100, bottom: -1050,
          height: 50};
      resources.lastVelocity_ = 0;
      clock.tick(5000);
      resources.scheduleChangeSize_(resource1, 111, 222, false);
      resources.mutateWork_();
      expect(resources.requestsChangeSize_).to.be.empty;
      expect(resource1.changeSize).to.not.been.called;

      expect(vsyncSpy.callCount).to.be.greaterThan(1);
      const task = vsyncSpy.lastCall.args[0];
      const state = {};
      task.measure(state);
      expect(state.scrollTop).to.equal(1777);
      expect(state.scrollHeight).to.equal(2999);

      viewportMock.expects('getScrollHeight').returns(2999).once();
      viewportMock.expects('setScrollTop').never();
      task.mutate(state);
      expect(resource1.changeSize).to.be.calledOnce;
      expect(resource1.changeSize).to.be.calledWith(111, 222);
      expect(resources.relayoutTop_).to.equal(resource1.layoutBox_.top);
    });

    it('in vp should NOT call overflowCallback if new height smaller', () => {
      resources.scheduleChangeSize_(resource1, 10, 11, false);
      resources.mutateWork_();
      expect(resources.requestsChangeSize_).to.be.empty;
      expect(resource1.changeSize).to.not.been.called;
      expect(overflowCallbackSpy).to.not.been.called;
    });

    it('in viewport should NOT change size and calls overflowCallback', () => {
      resources.scheduleChangeSize_(resource1, 111, 222, false);
      resources.mutateWork_();
      expect(resources.requestsChangeSize_.length).to.equal(0);
      expect(resource1.changeSize).to.not.been.called;
      expect(overflowCallbackSpy).to.be.calledOnce;
      expect(overflowCallbackSpy).to.be.calledWith(true, 111, 222);
      expect(resource1.getPendingChangeSize()).to.jsonEqual(
          {height: 111, width: 222});
    });

    it('should reset pending change size when rescheduling', () => {
      resources.scheduleChangeSize_(resource1, 111, 222, false);
      resources.mutateWork_();
      expect(resource1.getPendingChangeSize().height).to.equal(111);
      expect(resource1.getPendingChangeSize().width).to.equal(222);

      resources.scheduleChangeSize_(resource1, 112, 223, false);
      expect(resource1.getPendingChangeSize()).to.be.undefined;
    });

    it('should force resize after focus', () => {
      resources.scheduleChangeSize_(resource1, 111, 222, false);
      resources.mutateWork_();
      expect(resource1.getPendingChangeSize()).to.jsonEqual(
          {height: 111, width: 222});
      expect(resources.requestsChangeSize_).to.be.empty;

      resources.checkPendingChangeSize_(resource1.element);
      expect(resource1.getPendingChangeSize()).to.be.undefined;
      expect(resources.requestsChangeSize_.length).to.equal(1);

      resources.mutateWork_();
      expect(resources.requestsChangeSize_).to.be.empty;
      expect(resource1.changeSize).to.be.calledOnce;
      expect(resource1.changeSize).to.be.calledWith(111, 222);
      expect(overflowCallbackSpy).to.be.calledTwice;
      expect(overflowCallbackSpy.lastCall.args[0]).to.equal(false);
    });
  });

  describe('attemptChangeSize rules for element wrt document', () => {

    beforeEach(() => {
      viewportMock.expects('getRect').returns(
          {top: 0, left: 0, right: 100, bottom: 10000, height: 200}).atLeast(1);
      resource1.layoutBox_ = resource1.initialLayoutBox_ =
          layoutRectLtwh(0, 10, 100, 100);
    });

    it('should NOT change size when far the bottom of the document', () => {
      viewportMock.expects('getScrollHeight').returns(10000).once();
      resources.scheduleChangeSize_(resource1, 111, 222, false);
      resources.mutateWork_();
      expect(resource1.changeSize).to.not.been.called;
    });

    it('should change size when close to the bottom of the document', () => {
      viewportMock.expects('getScrollHeight').returns(110).once();
      resources.scheduleChangeSize_(resource1, 111, 222, false);
      resources.mutateWork_();
      expect(resource1.changeSize).to.be.calledOnce;
    });
  });
});


describe('Resources mutateElement and collapse', () => {

  function createElement(rect, isAmp) {
    return {
      ownerDocument: {defaultView: window},
      tagName: isAmp ? 'amp-test' : 'div',
      classList: {
        contains: className => isAmp && className == '-amp-element',
      },
      getElementsByClassName: () => [],
      isBuilt: () => {
        return true;
      },
      isUpgraded: () => {
        return true;
      },
      getAttribute: () => {
        return null;
      },
      getBoundingClientRect: () => rect,
      applySizesAndMediaQuery: () => {},
      layoutCallback: () => Promise.resolve(),
      viewportCallback: sandbox.spy(),
      prerenderAllowed: () => true,
      renderOutsideViewport: () => false,
      isRelayoutNeeded: () => true,
      contains: unused_otherElement => false,
      updateLayoutBox: () => {},
      overflowCallback: (unused_overflown, unused_requestedHeight) => {},
      unlayoutOnPause: () => false,
      pauseCallback: () => {},
      unlayoutCallback: () => {},
      getPriority: () => 0,
    };
  }

  function createResource(id, rect) {
    const resource = new Resource(
        id,
        createElement(rect, /* isAmp */ true),
        resources);
    resource.element['__AMP__RESOURCE'] = resource;
    resource.state_ = ResourceState.READY_FOR_LAYOUT;
    resource.layoutBox_ = rect;
    resource.changeSize = sandbox.spy();
    resource.completeCollapse = sandbox.spy();
    return resource;
  }

  let sandbox;
  let viewportMock;
  let resources;
  let resource1, resource2;
  let parent1, parent2;
  let relayoutTopStub;
  let resource1RequestMeasureStub, resource2RequestMeasureStub;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    resources = new Resources(new AmpDocSingle(window));
    resources.isRuntimeOn_ = false;
    viewportMock = sandbox.mock(resources.viewport_);
    resources.vsync_ = {
      mutate: callback => callback(),
      measure: callback => callback(),
      runPromise: task => {
        const state = {};
        if (task.measure) {
          task.measure(state);
        }
        if (task.mutate) {
          task.mutate(state);
        }
        return Promise.resolve();
      },
    };
    relayoutTopStub = sandbox.stub(resources, 'setRelayoutTop_');
    sandbox.stub(resources, 'schedulePass');

    resource1 = createResource(1, layoutRectLtwh(10, 10, 100, 100));
    resource2 = createResource(2, layoutRectLtwh(10, 1010, 100, 100));
    resources.resources_ = [resource1, resource2];

    resource1RequestMeasureStub = sandbox.stub(resource1, 'requestMeasure');
    resource2RequestMeasureStub = sandbox.stub(resource2, 'requestMeasure');

    parent1 = createElement(layoutRectLtwh(10, 10, 100, 100),
        /* isAmp */ false);
    parent2 = createElement(layoutRectLtwh(10, 1010, 100, 100),
        /* isAmp */ false);

    parent1.getElementsByClassName = className => {
      if (className == '-amp-element') {
        return [resource1.element];
      }
    };
    parent2.getElementsByClassName = className => {
      if (className == '-amp-element') {
        return [resource2.element];
      }
    };
  });

  afterEach(() => {
    viewportMock.verify();
    sandbox.restore();
  });

  it('should mutate from visible to invisible', () => {
    const mutateSpy = sandbox.spy();
    const promise = resources.mutateElement(parent1, () => {
      parent1.getBoundingClientRect = () => layoutRectLtwh(0, 0, 0, 0);
      mutateSpy();
    });
    return promise.then(() => {
      expect(mutateSpy.callCount).to.equal(1);
      expect(resource1RequestMeasureStub.callCount).to.equal(1);
      expect(resource2RequestMeasureStub.callCount).to.equal(0);
      expect(relayoutTopStub.callCount).to.equal(1);
      expect(relayoutTopStub.getCall(0).args[0]).to.equal(10);
    });
  });

  it('should mutate from visible to invisible on itself', () => {
    const mutateSpy = sandbox.spy();
    const promise = resources.mutateElement(resource1.element, () => {
      resource1.element.getBoundingClientRect =
          () => layoutRectLtwh(0, 0, 0, 0);
      mutateSpy();
    });
    return promise.then(() => {
      expect(mutateSpy.callCount).to.equal(1);
      expect(resource1RequestMeasureStub.callCount).to.equal(1);
      expect(resource2RequestMeasureStub.callCount).to.equal(0);
      expect(relayoutTopStub.callCount).to.equal(1);
      expect(relayoutTopStub.getCall(0).args[0]).to.equal(10);
    });
  });

  it('should mutate from invisible to visible', () => {
    const mutateSpy = sandbox.spy();
    parent1.getBoundingClientRect = () => layoutRectLtwh(0, 0, 0, 0);
    const promise = resources.mutateElement(parent1, () => {
      parent1.getBoundingClientRect = () => layoutRectLtwh(10, 10, 100, 100);
      mutateSpy();
    });
    return promise.then(() => {
      expect(mutateSpy.callCount).to.equal(1);
      expect(resource1RequestMeasureStub.callCount).to.equal(1);
      expect(resource2RequestMeasureStub.callCount).to.equal(0);
      expect(relayoutTopStub.callCount).to.equal(1);
      expect(relayoutTopStub.getCall(0).args[0]).to.equal(10);
    });
  });

  it('should mutate from visible to visible', () => {
    const mutateSpy = sandbox.spy();
    parent1.getBoundingClientRect = () => layoutRectLtwh(10, 10, 100, 100);
    const promise = resources.mutateElement(parent1, () => {
      parent1.getBoundingClientRect = () => layoutRectLtwh(10, 1010, 100, 100);
      mutateSpy();
    });
    return promise.then(() => {
      expect(mutateSpy.callCount).to.equal(1);
      expect(resource1RequestMeasureStub.callCount).to.equal(1);
      expect(resource2RequestMeasureStub.callCount).to.equal(0);
      expect(relayoutTopStub.callCount).to.equal(2);
      expect(relayoutTopStub.getCall(0).args[0]).to.equal(10);
      expect(relayoutTopStub.getCall(1).args[0]).to.equal(1010);
    });
  });

  it('should complete collapse and trigger relayout', () => {
    const oldTop = resource1.getLayoutBox().top;
    resources.collapseElement(resource1.element);
    expect(resource1.completeCollapse.callCount).to.equal(1);
    expect(relayoutTopStub.callCount).to.equal(1);
    expect(relayoutTopStub.args[0][0]).to.equal(oldTop);
  });

  it('should ignore relayout on an already collapsed element', () => {
    resource1.layoutBox_.width = 0;
    resource1.layoutBox_.height = 0;
    resources.collapseElement(resource1.element);
    expect(resource1.completeCollapse.callCount).to.equal(1);
    expect(relayoutTopStub.callCount).to.equal(0);
  });

  it('should notify owner', () => {
    const owner = {
      contains: () => true,
      collapsedCallback: sandbox.spy(),
    };
    Resource.setOwner(resource1.element, owner);
    resources.collapseElement(resource1.element);
    expect(owner.collapsedCallback.callCount).to.equal(1);
    expect(owner.collapsedCallback.args[0][0]).to.equal(resource1.element);
  });
});


describe('Resources.add', () => {
  let sandbox;
  let resources;
  let parent;
  let parentResource;
  let child1;
  let resource1;
  let child2;
  let resource2;

  function createElement() {
    const element = {
      ownerDocument: {defaultView: window},
      tagName: 'amp-test',
      isBuilt() {
        return true;
      },
      isUpgraded() {
        return true;
      },
      dispatchCustomEvent() {
        return;
      },
    };
    element.build = sandbox.spy();
    return element;
  }

  function createElementWithResource(id) {
    const element = createElement();
    const resource = new Resource(id, element, resources);
    resource.state_ = ResourceState.NOT_BUILT;
    resource.element['__AMP__RESOURCE'] = resource;
    return [element, resource];
  }

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    resources = new Resources(new AmpDocSingle(window));
    resources.pendingBuildResources_ = [];
    parent = createElementWithResource(1)[0];
    parentResource = parent['__AMP__RESOURCE'];
    child1 = createElementWithResource(2)[0];
    resource1 = child1['__AMP__RESOURCE'];
    child2 = createElementWithResource(3)[0];
    resource2 = child2['__AMP__RESOURCE'];
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should enforce that viewport is ready for first add', () => {
    const ensureViewportReady = sandbox.stub(resources.viewport_,
        'ensureReadyForElements');
    resources.add(child1);
    expect(ensureViewportReady).to.be.calledOnce;

    // Second `add` is ignored.
    resources.add(child2);
    expect(ensureViewportReady).to.be.calledOnce;
  });

  it('should build elements immediately if the document is ready', () => {
    const schedulePassStub = sandbox.stub(resources, 'schedulePass');
    child1.isBuilt = () => false;
    child2.isBuilt = () => false;
    resources.documentReady_ = false;
    resources.add(child1);
    expect(child1.build.called).to.be.false;
    resources.documentReady_ = true;
    resources.add(child2);
    expect(child2.build.calledOnce).to.be.true;
    expect(schedulePassStub).to.be.calledOnce;
  });

  it('should not schedule pass when immediate build fails', () => {
    const schedulePassStub = sandbox.stub(resources, 'schedulePass');
    child1.isBuilt = () => false;
    const child1BuildSpy = sandbox.spy();
    child1.build = () => {
      // Emulate an error happening during an element build.
      child1BuildSpy();
      throw new Error('child1-build-error');
    };
    resources.documentReady_ = true;
    resources.add(child1);
    expect(child1BuildSpy.calledOnce).to.be.true;
    expect(schedulePassStub).to.not.be.called;
  });

  it('should add element to pending build when document is not ready', () => {
    child1.isBuilt = () => false;
    child2.isBuilt = () => false;
    resources.buildReadyResources_ = sandbox.spy();
    resources.documentReady_ = false;
    resources.add(child1);
    expect(child1.build.called).to.be.false;
    expect(resources.pendingBuildResources_.length).to.be.equal(1);
    resources.add(child2);
    expect(child2.build.called).to.be.false;
    expect(resources.pendingBuildResources_.length).to.be.equal(2);
    expect(resources.buildReadyResources_.calledTwice).to.be.true;
  });

  describe('buildReadyResources_', () => {
    it('should build ready resources and remove them from pending', () => {
      sandbox.stub(resources, 'schedulePass');
      resources.documentReady_ = false;
      resources.pendingBuildResources_ = [resource1, resource2];
      resources.buildReadyResources_();
      expect(child1.build.called).to.be.false;
      expect(child2.build.called).to.be.false;
      expect(resources.pendingBuildResources_.length).to.be.equal(2);
      expect(resources.schedulePass.called).to.be.false;

      child1.nextSibling = child2;
      resources.buildReadyResources_();
      expect(child1.build.called).to.be.true;
      expect(child2.build.called).to.be.false;
      expect(resources.pendingBuildResources_.length).to.be.equal(1);
      expect(resources.pendingBuildResources_[0]).to.be.equal(resource2);
      expect(resources.schedulePass.calledOnce).to.be.true;

      child2.parentNode = parent;
      parent.nextSibling = true;
      resources.buildReadyResources_();
      expect(child1.build.calledTwice).to.be.false;
      expect(child2.build.called).to.be.true;
      expect(resources.pendingBuildResources_.length).to.be.equal(0);
      expect(resources.schedulePass.calledTwice).to.be.true;
    });

    it('should not try to build resources already being built', () => {
      resources.documentReady_ = false;
      resources.pendingBuildResources_ = [resource1, resource2];
      resources.buildReadyResources_();
      expect(child1.build.called).to.be.false;
      expect(child2.build.called).to.be.false;
      expect(resources.pendingBuildResources_.length).to.be.equal(2);

      const newChild = createElementWithResource(3)[0];
      newChild.nextSibling = true;
      const newResource = newChild['__AMP__RESOURCE'];
      const child1BuildSpy = sandbox.spy();
      child1.nextSibling = child2;
      child1.build = () => {
        // Simulate parent elements adding children elements to simulate
        // the infinite loop of building pending resources and make sure
        // that we're handling it well.
        child1BuildSpy();
        resources.pendingBuildResources_.push(newResource);
        resources.buildReadyResources_();
      };
      resources.buildReadyResources_();
      expect(child1BuildSpy.called).to.be.true;
      expect(child2.build.called).to.be.false;
      expect(newChild.build.called).to.be.true;
      expect(resources.pendingBuildResources_.length).to.be.equal(1);
      expect(resources.pendingBuildResources_[0]).to.be.equal(resource2);

      child2.parentNode = parent;
      parent.nextSibling = true;
      resources.buildReadyResources_();
      expect(child1BuildSpy.calledTwice).to.be.false;
      expect(child2.build.called).to.be.true;
      expect(newChild.build.calledTwice).to.be.false;
      expect(resources.pendingBuildResources_.length).to.be.equal(0);
    });

    it('should build everything pending when document is ready', () => {
      const schedulePassStub = sandbox.stub(resources, 'schedulePass');
      resources.documentReady_ = true;
      resources.pendingBuildResources_ = [parentResource, resource1, resource2];
      const child1BuildSpy = sandbox.spy();
      child1.build = () => {
        // Emulate an error happening during an element build.
        child1BuildSpy();
        throw new Error('child1-build-error');
      };
      resources.buildReadyResources_();
      expect(child1BuildSpy.called).to.be.true;
      expect(child2.build.called).to.be.true;
      expect(parent.build.called).to.be.true;
      expect(resources.pendingBuildResources_.length).to.be.equal(0);
      expect(schedulePassStub).to.be.calledOnce;
    });

    it('should not schedule pass if all builds failed', () => {
      const schedulePassStub = sandbox.stub(resources, 'schedulePass');
      resources.documentReady_ = true;
      resources.pendingBuildResources_ = [resource1];
      const child1BuildSpy = sandbox.spy();
      child1.build = () => {
        // Emulate an error happening during an element build.
        child1BuildSpy();
        throw new Error('child1-build-error');
      };
      resources.buildReadyResources_();
      expect(child1BuildSpy.called).to.be.true;
      expect(resources.pendingBuildResources_.length).to.be.equal(0);
      expect(schedulePassStub).to.not.be.called;
    });
  });
});
