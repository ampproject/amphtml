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

import {
  Resource,
  ResourceState_,
  Resources,
  TaskQueue_,
} from '../../src/service/resources-impl';
import {VisibilityState} from '../../src/service/viewer-impl';
import {dev} from '../../src/log';
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
    resources = new Resources(window);
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should calculate correct calcTaskScore', () => {
    const viewportRect = layoutRectLtwh(0, 100, 300, 400);
    // Task 1 is right in the middle of the viewport and priority 0
    const task_vp0_p0 = {
      resource: {
        getLayoutBox() {
          return layoutRectLtwh(0, 100, 300, 100);
        },
      },
      priority: 0,
    };
    // Task 2 is in the viewport and priority 1
    const task_vp0_p1 = {
      resource: {
        getLayoutBox() {
          return layoutRectLtwh(0, 100, 300, 100);
        },
      },
      priority: 1,
    };
    // Task 3 is above viewport and priority 0
    const task_vpu_p0 = {
      resource: {
        getLayoutBox() {
          return layoutRectLtwh(0, 0, 300, 50);
        },
      },
      priority: 0,
    };
    // Task 4 is above viewport and priority 0
    const task_vpu_p1 = {
      resource: {
        getLayoutBox() {
          return layoutRectLtwh(0, 0, 300, 50);
        },
      },
      priority: 1,
    };
    // Task 5 is below viewport and priority 0
    const task_vpd_p0 = {
      resource: {
        getLayoutBox() {
          return layoutRectLtwh(0, 600, 300, 50);
        },
      },
      priority: 0,
    };
    // Task 6 is below viewport and priority 0
    const task_vpd_p1 = {
      resource: {
        getLayoutBox() {
          return layoutRectLtwh(0, 600, 300, 50);
        },
      },
      priority: 1,
    };

    expect(resources.calcTaskScore_(viewportRect, 0, task_vp0_p0)).to.equal(0);
    expect(resources.calcTaskScore_(viewportRect, 0, task_vp0_p1)).to.equal(10);

    // +2 for "one viewport away" * 2 because dir is opposite
    expect(resources.calcTaskScore_(viewportRect, 0, task_vpu_p0)).to.equal(2);
    expect(resources.calcTaskScore_(viewportRect, 0, task_vpu_p1)).to.equal(12);

    // +1 for "one viewport away" * 1 because dir is the same
    expect(resources.calcTaskScore_(viewportRect, 0, task_vpd_p0)).to.equal(1);
    expect(resources.calcTaskScore_(viewportRect, 0, task_vpd_p1)).to.equal(11);
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
      getState: () => ResourceState_.READY_FOR_LAYOUT,
      isDisplayed: () => true,
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
      getState: () => ResourceState_.READY_FOR_LAYOUT,
      isDisplayed: () => true,
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
      getState: () => ResourceState_.READY_FOR_LAYOUT,
      isDisplayed: () => true,
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
      getState: () => ResourceState_.READY_FOR_LAYOUT,
      isDisplayed: () => true,
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

describe('Resources schedulePause', () => {

  let sandbox;
  let resources;
  let parent;
  let children;
  let child0;
  let child1;
  let child2;

  function createElement() {
    return {
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
    resource.state_ = ResourceState_.LAYOUT_COMPLETE;
    resource.element['__AMP__RESOURCE'] = resource;
    return [element, resource];
  }

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    resources = new Resources(window);
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
    resource.state_ = ResourceState_.READY_FOR_LAYOUT;
    resource.element['__AMP__RESOURCE'] = resource;
    resource.measure = sandbox.spy();
    resource.isDisplayed = () => true;
    resource.isInViewport = () => true;
    return [element, resource];
  }

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    resources = new Resources(window);
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
    resource.state_ = ResourceState_.READY_FOR_LAYOUT;
    resource.layoutBox_ = rect;
    return resource;
  }

  let sandbox;
  let viewportMock;
  let resources;
  let resource1, resource2;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    resources = new Resources(window);
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
    resource1.state_ = ResourceState_.LAYOUT_COMPLETE;
    resource2.state_ = ResourceState_.LAYOUT_COMPLETE;
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
    resource1.state_ = ResourceState_.LAYOUT_COMPLETE;
    resource2.state_ = ResourceState_.LAYOUT_COMPLETE;
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
    expect(resource1.state_).to.equal(ResourceState_.LAYOUT_COMPLETE);
    expect(resource2.state_).to.equal(ResourceState_.LAYOUT_SCHEDULED);
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
    resource1.state_ = ResourceState_.LAYOUT_COMPLETE;
    resource2.state_ = ResourceState_.LAYOUT_COMPLETE;
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
    pendingResource.state_ = ResourceState_.NOT_BUILT;
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

});


describe('Resources changeSize', () => {

  function createElement(rect) {
    return {
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
    resource.state_ = ResourceState_.READY_FOR_LAYOUT;
    resource.layoutBox_ = rect;
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
    resources = new Resources(window);
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

  describe('attemptChangeSize rules when element is in viewport', () => {
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

    it('should NOT change size and calls overflowCallback', () => {
      resources.scheduleChangeSize_(resource1, 111, 222, false);
      resources.mutateWork_();
      expect(resources.requestsChangeSize_.length).to.equal(0);
      expect(resource1.changeSize.callCount).to.equal(0);
      expect(overflowCallbackSpy.callCount).to.equal(1);
      expect(overflowCallbackSpy.firstCall.args[0]).to.equal(true);
      expect(overflowCallbackSpy.firstCall.args[1]).to.equal(111);
      expect(overflowCallbackSpy.firstCall.args[2]).to.equal(222);
      expect(resource1.getPendingChangeSize().height).to.equal(111);
      expect(resource1.getPendingChangeSize().width).to.equal(222);
    });

    it('should change size when new height/width is lower', () => {
      resources.scheduleChangeSize_(resource1, 10, 11, false);
      resources.mutateWork_();
      expect(resources.requestsChangeSize_.length).to.equal(0);
      expect(resource1.changeSize.callCount).to.equal(0);
      expect(overflowCallbackSpy.callCount).to.equal(0);
    });

    it('should change size when forced', () => {
      resources.scheduleChangeSize_(resource1, 111, 222, true);
      resources.mutateWork_();
      expect(resources.requestsChangeSize_.length).to.equal(0);
      expect(resource1.changeSize.callCount).to.equal(1);
      expect(overflowCallbackSpy.callCount).to.equal(1);
      expect(overflowCallbackSpy.firstCall.args[0]).to.equal(false);
    });

    it('should change size when document is invisible', () => {
      resources.visible_ = false;
      sandbox.stub(resources.viewer_, 'getVisibilityState').returns(
        VisibilityState.PRERENDER
      );
      resources.scheduleChangeSize_(resource1, 111, 222, false);
      resources.mutateWork_();
      expect(resources.requestsChangeSize_.length).to.equal(0);
      expect(resource1.changeSize.callCount).to.equal(1);
      expect(overflowCallbackSpy.callCount).to.equal(1);
      expect(overflowCallbackSpy.firstCall.args[0]).to.equal(false);
    });

    it('should change size when active', () => {
      resource1.element.contains = () => true;
      resources.scheduleChangeSize_(resource1, 111, 222, false);
      resources.mutateWork_();
      expect(resources.requestsChangeSize_.length).to.equal(0);
      expect(resource1.changeSize.callCount).to.equal(1);
      expect(overflowCallbackSpy.callCount).to.equal(1);
      expect(overflowCallbackSpy.firstCall.args[0]).to.equal(false);
    });

    it('should change size when below the viewport', () => {
      resource1.layoutBox_ = {top: 10, left: 0, right: 100, bottom: 1050,
          height: 50};
      resources.scheduleChangeSize_(resource1, 111, 222, false);
      resources.mutateWork_();
      expect(resources.requestsChangeSize_.length).to.equal(0);
      expect(resource1.changeSize.callCount).to.equal(1);
      expect(overflowCallbackSpy.callCount).to.equal(1);
      expect(overflowCallbackSpy.firstCall.args[0]).to.equal(false);
    });

    it('should change size when slightly above the viewport', () => {
      resource1.layoutBox_ = {top: 10, left: 0, right: 100, bottom: 190,
          height: 50};
      resources.scheduleChangeSize_(resource1, 111, 222, false);
      resources.mutateWork_();
      expect(resources.requestsChangeSize_.length).to.equal(0);
      expect(resource1.changeSize.callCount).to.equal(1);
      expect(overflowCallbackSpy.callCount).to.equal(1);
      expect(overflowCallbackSpy.firstCall.args[0]).to.equal(false);
    });

    it('should NOT change size when in the middle of the viewport', () => {
      resource1.layoutBox_ = {top: 10, left: 0, right: 100, bottom: 100,
          height: 50};
      resources.scheduleChangeSize_(resource1, 111, 222, false);
      resources.mutateWork_();
      expect(resource1.changeSize.callCount).to.equal(0);
      expect(overflowCallbackSpy.callCount).to.equal(1);
      expect(overflowCallbackSpy.firstCall.args[0]).to.equal(true);
      expect(overflowCallbackSpy.firstCall.args[1]).to.equal(111);
      expect(overflowCallbackSpy.firstCall.args[2]).to.equal(222);
      expect(resource1.getPendingChangeSize().height).to.equal(111);
      expect(resource1.getPendingChangeSize().width).to.equal(222);
    });

    it('should NOT change size when below viewport, but decreases', () => {
      resource1.layoutBox_ = {top: 10, left: 0, right: 100, bottom: 210,
          height: 50};
      resources.scheduleChangeSize_(resource1, 50, 120, false);
      resources.mutateWork_();
      expect(resource1.changeSize.callCount).to.equal(0);
      expect(overflowCallbackSpy.callCount).to.equal(0);
    });

    it('should defer when above the viewport and scrolling on', () => {
      resource1.layoutBox_ = {top: -1200, left: 0, right: 100, bottom: -1050,
          height: 50};
      resources.lastVelocity_ = 10;
      resources.lastScrollTime_ = new Date().getTime();
      resources.scheduleChangeSize_(resource1, 111, 222, false);
      resources.mutateWork_();
      expect(resources.requestsChangeSize_.length).to.equal(1);
      expect(resource1.changeSize.callCount).to.equal(0);
      expect(overflowCallbackSpy.callCount).to.equal(0);
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
      expect(resources.requestsChangeSize_.length).to.equal(0);
      expect(resource1.changeSize.callCount).to.equal(0);

      expect(vsyncSpy.callCount).to.be.greaterThan(1);
      const task = vsyncSpy.lastCall.args[0];
      const state = {};
      task.measure(state);
      expect(state.scrollTop).to.equal(1777);
      expect(state.scrollHeight).to.equal(2999);

      viewportMock.expects('getScrollHeight').returns(3999).once();
      viewportMock.expects('setScrollTop').withExactArgs(2777).once();
      task.mutate(state);
      expect(resource1.changeSize.callCount).to.equal(1);
      expect(resource1.changeSize.firstCall.args[0]).to.equal(111);
      expect(resource1.changeSize.firstCall.args[1]).to.equal(222);
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
      expect(resources.requestsChangeSize_.length).to.equal(0);
      expect(resource1.changeSize.callCount).to.equal(0);

      expect(vsyncSpy.callCount).to.be.greaterThan(1);
      const task = vsyncSpy.lastCall.args[0];
      const state = {};
      task.measure(state);
      expect(state.scrollTop).to.equal(1777);
      expect(state.scrollHeight).to.equal(2999);

      viewportMock.expects('getScrollHeight').returns(2999).once();
      viewportMock.expects('setScrollTop').never();
      task.mutate(state);
      expect(resource1.changeSize.callCount).to.equal(1);
      expect(resource1.changeSize.firstCall.args[0]).to.equal(111);
      expect(resource1.changeSize.firstCall.args[1]).to.equal(222);
      expect(resources.relayoutTop_).to.equal(resource1.layoutBox_.top);
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
      expect(resource1.getPendingChangeSize().height).to.equal(111);
      expect(resource1.getPendingChangeSize().width).to.equal(222);
      expect(resources.requestsChangeSize_.length).to.equal(0);

      resources.checkPendingChangeSize_(resource1.element);
      expect(resource1.getPendingChangeSize()).to.be.undefined;
      expect(resources.requestsChangeSize_.length).to.equal(1);

      resources.mutateWork_();
      expect(resources.requestsChangeSize_.length).to.equal(0);
      expect(resource1.changeSize.callCount).to.equal(1);
      expect(resource1.changeSize.firstCall.args[0]).to.equal(111);
      expect(resource1.changeSize.firstCall.args[1]).to.equal(222);
      expect(overflowCallbackSpy.callCount).to.equal(2);
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
      expect(resource1.changeSize.callCount).to.equal(0);
    });

    it('should change size when close to the bottom of the document', () => {
      viewportMock.expects('getScrollHeight').returns(110).once();
      resources.scheduleChangeSize_(resource1, 111, 222, false);
      resources.mutateWork_();
      expect(resource1.changeSize.callCount).to.equal(1);
    });
  });
});


describe('Resources mutateElement', () => {

  function createElement(rect, isAmp) {
    return {
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
    resource.state_ = ResourceState_.READY_FOR_LAYOUT;
    resource.layoutBox_ = rect;
    resource.changeSize = sandbox.spy();
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
    resources = new Resources(window);
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
});


describe('Resources.TaskQueue', () => {

  let sandbox;
  let clock;
  let queue;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    clock = sandbox.useFakeTimers();
    queue = new TaskQueue_();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should enqueue and dequeue', () => {
    clock.tick(1000);
    expect(queue.getSize()).to.equal(0);
    expect(queue.getLastEnqueueTime()).to.equal(0);
    expect(queue.getLastDequeueTime()).to.equal(0);

    queue.enqueue({id: '1'});
    expect(queue.getTaskById('1').id).to.equal('1');
    expect(queue.getSize()).to.equal(1);
    expect(queue.getLastEnqueueTime()).to.equal(1000);
    expect(queue.getLastDequeueTime()).to.equal(0);

    expect(() => {
      queue.enqueue({id: '1'});
    }).to.throw(/Task already enqueued/);

    queue.dequeue({id: '1'});
    expect(queue.getTaskById('1')).to.equal(null);
    expect(queue.getSize()).to.equal(0);
    expect(queue.getLastEnqueueTime()).to.equal(1000);
    expect(queue.getLastDequeueTime()).to.equal(1000);
  });

  it('should perform score-based peek', () => {
    queue.enqueue({id: 'A', v: 0});
    queue.enqueue({id: 'B', v: 2});
    queue.enqueue({id: 'C', v: 1});

    const task = queue.peek(task => 10 - task.v);
    expect(task.id).to.equal('B');
  });
});


describe('Resources.Resource', () => {

  let sandbox;
  let element;
  let elementMock;
  let resources;
  let resource;
  let viewportMock;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();

    element = {
      tagName: 'AMP-AD',
      isBuilt: () => false,
      isUpgraded: () => false,
      prerenderAllowed: () => false,
      renderOutsideViewport: () => true,
      build: () => false,
      getBoundingClientRect: () => null,
      updateLayoutBox: () => {},
      isRelayoutNeeded: () => false,
      layoutCallback: () => {},
      changeSize: () => {},
      unlayoutOnPause: () => false,
      unlayoutCallback: () => true,
      pauseCallback: () => false,
      resumeCallback: () => false,
      viewportCallback: () => {},
      togglePlaceholder: () => sandbox.spy(),
      getPriority: () => 2,
    };
    elementMock = sandbox.mock(element);

    resources = new Resources(window);
    resource = new Resource(1, element, resources);
    viewportMock = sandbox.mock(resources.viewport_);
  });

  afterEach(() => {
    viewportMock.verify();
    elementMock.verify();
    sandbox.restore();
  });

  it('should initialize correctly', () => {
    expect(resource.getId()).to.equal(1);
    expect(resource.debugid).to.equal('amp-ad#1');
    expect(resource.getPriority()).to.equal(2);
    expect(resource.getState()).to.equal(ResourceState_.NOT_BUILT);
    expect(resource.getLayoutBox().width).to.equal(0);
    expect(resource.getLayoutBox().height).to.equal(0);
    expect(resource.isInViewport()).to.equal(false);
  });

  it('should initialize correctly when already built', () => {
    elementMock.expects('isBuilt').returns(true).once();
    expect(new Resource(1, element).getState()).to.equal(
        ResourceState_.NOT_LAID_OUT);
  });

  it('should not build before upgraded', () => {
    elementMock.expects('isUpgraded').returns(false).atLeast(1);
    elementMock.expects('build').never();

    resource.build();
    expect(resource.getState()).to.equal(ResourceState_.NOT_BUILT);
  });


  it('should build after upgraded', () => {
    elementMock.expects('isUpgraded').returns(true).atLeast(1);
    elementMock.expects('build').once();
    resource.build();
    expect(resource.getState()).to.equal(ResourceState_.NOT_LAID_OUT);
  });

  it('should blacklist on build failure', () => {
    elementMock.expects('isUpgraded').returns(true).atLeast(1);
    elementMock.expects('build').throws('Failed').once();
    resource.build();
    expect(resource.blacklisted_).to.equal(true);
    expect(resource.getState()).to.equal(ResourceState_.NOT_BUILT);
  });

  it('should mark as ready for layout if already measured', () => {
    elementMock.expects('isUpgraded').returns(true).atLeast(1);
    elementMock.expects('build').once();
    const stub = sandbox.stub(resource, 'hasBeenMeasured').returns(true);
    resource.build(false);
    expect(stub.calledOnce).to.be.true;
    expect(resource.getState()).to.equal(ResourceState_.READY_FOR_LAYOUT);
  });

  it('should mark as not laid out if not yet measured', () => {
    elementMock.expects('isUpgraded').returns(true).atLeast(1);
    elementMock.expects('build').once();
    const stub = sandbox.stub(resource, 'hasBeenMeasured').returns(false);
    resource.build(false);
    expect(stub.calledOnce).to.be.true;
    expect(resource.getState()).to.equal(ResourceState_.NOT_LAID_OUT);
  });

  it('should allow to measure when not upgraded', () => {
    elementMock.expects('isUpgraded').returns(false).atLeast(1);
    resource.resources_ = {
      viewport_: {
        getLayoutRect() {
          return layoutRectLtwh(0, 100, 300, 100);
        },
      },
    };
    expect(() => {
      resource.measure();
    }).to.not.throw();
    expect(resource.getLayoutBox()).to.eql(layoutRectLtwh(0, 100, 300, 100));
  });

  it('should allow measure even when not built', () => {
    elementMock.expects('isUpgraded').returns(true).atLeast(1);
    elementMock.expects('getBoundingClientRect').returns(
        layoutRectLtwh(0, 0, 0, 0)).once();
    resource.measure();
    expect(resource.getState()).to.equal(ResourceState_.NOT_BUILT);
  });

  it('should measure and update state', () => {
    elementMock.expects('isUpgraded').returns(true).atLeast(1);
    elementMock.expects('build').once();
    resource.build();

    elementMock.expects('getBoundingClientRect')
        .returns({left: 11, top: 12, width: 111, height: 222})
        .once();
    elementMock.expects('updateLayoutBox')
        .withExactArgs(sinon.match(data => {
          return data.width == 111 && data.height == 222;
        }))
        .once();
    resource.measure();
    expect(resource.getState()).to.equal(ResourceState_.READY_FOR_LAYOUT);
    expect(resource.getLayoutBox().left).to.equal(11);
    expect(resource.getLayoutBox().top).to.equal(12);
    expect(resource.getLayoutBox().width).to.equal(111);
    expect(resource.getLayoutBox().height).to.equal(222);
  });

  it('should update initial box only on first measure', () => {
    elementMock.expects('isUpgraded').returns(true).atLeast(1);
    elementMock.expects('build').once();
    resource.build();

    element.getBoundingClientRect = () =>
        ({left: 11, top: 12, width: 111, height: 222});
    resource.measure();
    expect(resource.getLayoutBox().top).to.equal(12);
    expect(resource.getInitialLayoutBox().top).to.equal(12);

    element.getBoundingClientRect = () =>
        ({left: 11, top: 22, width: 111, height: 222});
    resource.measure();
    expect(resource.getLayoutBox().top).to.equal(22);
    expect(resource.getInitialLayoutBox().top).to.equal(12);
  });

  it('should noop request measure when not built', () => {
    expect(resource.isMeasureRequested()).to.be.false;
    elementMock.expects('getBoundingClientRect').never();
    resource.requestMeasure();
    expect(resource.isMeasureRequested()).to.be.false;
  });

  it('should request measure when built', () => {
    expect(resource.isMeasureRequested()).to.be.false;
    elementMock.expects('getBoundingClientRect').never();
    resource.state_ = ResourceState_.READY_FOR_LAYOUT;
    resource.requestMeasure();
    expect(resource.isMeasureRequested()).to.be.true;
  });

  it('should always layout if has not been laid out before', () => {
    elementMock.expects('isUpgraded').returns(true).atLeast(1);
    resource.state_ = ResourceState_.NOT_LAID_OUT;
    resource.layoutBox_ = {left: 11, top: 12, width: 111, height: 222};

    elementMock.expects('getBoundingClientRect')
        .returns(resource.layoutBox_).once();
    resource.measure();
    expect(resource.getState()).to.equal(ResourceState_.READY_FOR_LAYOUT);
  });

  it('should not relayout if has box has not changed', () => {
    resource.state_ = ResourceState_.LAYOUT_COMPLETE;
    resource.layoutBox_ = {left: 11, top: 12, width: 111, height: 222};

    // Left is not part of validation.
    elementMock.expects('getBoundingClientRect')
        .returns({left: 11 + 10, top: 12, width: 111, height: 222}).once();
    resource.measure();
    expect(resource.getState()).to.equal(ResourceState_.LAYOUT_COMPLETE);
    expect(resource.getLayoutBox().left).to.equal(11 + 10);
  });

  it('should not relayout if box changed but element didn\'t opt in', () => {
    elementMock.expects('isUpgraded').returns(true).atLeast(1);
    resource.state_ = ResourceState_.LAYOUT_COMPLETE;
    resource.layoutBox_ = {left: 11, top: 12, width: 111, height: 222};

    // Width changed.
    elementMock.expects('getBoundingClientRect')
        .returns({left: 11, top: 12, width: 111 + 10, height: 222}).once();
    elementMock.expects('isRelayoutNeeded').returns(false).atLeast(1);
    resource.measure();
    expect(resource.getState()).to.equal(ResourceState_.LAYOUT_COMPLETE);
    expect(resource.getLayoutBox().width).to.equal(111 + 10);
  });

  it('should relayout if box changed when element opted in', () => {
    elementMock.expects('isUpgraded').returns(true).atLeast(1);
    resource.state_ = ResourceState_.LAYOUT_COMPLETE;
    resource.layoutBox_ = {left: 11, top: 12, width: 111, height: 222};

    // Width changed.
    elementMock.expects('getBoundingClientRect')
        .returns({left: 11, top: 12, width: 111 + 10, height: 222}).once();
    elementMock.expects('isRelayoutNeeded').returns(true).atLeast(1);
    resource.measure();
    expect(resource.getState()).to.equal(ResourceState_.READY_FOR_LAYOUT);
    expect(resource.getLayoutBox().width).to.equal(111 + 10);
  });


  it('should ignore startLayout if already completed or failed or going',
        () => {
          elementMock.expects('layoutCallback').never();

          resource.state_ = ResourceState_.LAYOUT_COMPLETE;
          resource.startLayout(true);

          resource.state_ = ResourceState_.LAYOUT_FAILED;
          resource.startLayout(true);

          resource.state_ = ResourceState_.READY_FOR_LAYOUT;
          resource.layoutPromise_ = {};
          resource.startLayout(true);
        });

  it('should fail startLayout if not built', () => {
    elementMock.expects('layoutCallback').never();

    resource.state_ = ResourceState_.NOT_BUILT;
    expect(() => {
      resource.startLayout(true);
    }).to.throw(/Not ready to start layout/);
  });

  it('should ignore startLayout if not visible', () => {
    elementMock.expects('isUpgraded').returns(true).atLeast(1);
    elementMock.expects('getBoundingClientRect')
        .returns({left: 1, top: 1, width: 1, height: 1}).once();

    elementMock.expects('layoutCallback').never();

    resource.state_ = ResourceState_.READY_FOR_LAYOUT;
    resource.layoutBox_ = {left: 11, top: 12, width: 0, height: 0};
    resource.startLayout(true);
  });

  it('should force startLayout for first layout', () => {
    elementMock.expects('isUpgraded').returns(true).atLeast(1);
    elementMock.expects('getBoundingClientRect')
        .returns({left: 1, top: 1, width: 1, height: 1}).once();

    elementMock.expects('layoutCallback').returns(Promise.resolve()).once();

    resource.state_ = ResourceState_.READY_FOR_LAYOUT;
    resource.layoutBox_ = {left: 11, top: 12, width: 10, height: 10};
    resource.startLayout(true);
    expect(resource.getState()).to.equal(ResourceState_.LAYOUT_SCHEDULED);
  });

  it('should ignore startLayout for re-layout when not opt-in', () => {
    elementMock.expects('isUpgraded').returns(true).atLeast(1);
    elementMock.expects('getBoundingClientRect')
        .returns({left: 1, top: 1, width: 1, height: 1}).once();

    elementMock.expects('layoutCallback').never();

    resource.state_ = ResourceState_.READY_FOR_LAYOUT;
    resource.layoutBox_ = {left: 11, top: 12, width: 10, height: 10};
    resource.layoutCount_ = 1;
    elementMock.expects('isRelayoutNeeded').returns(false).atLeast(1);
    resource.startLayout(true);
    expect(resource.getState()).to.equal(ResourceState_.LAYOUT_COMPLETE);
  });

  it('should force startLayout for re-layout when opt-in', () => {
    elementMock.expects('isUpgraded').returns(true).atLeast(1);
    elementMock.expects('getBoundingClientRect')
        .returns({left: 1, top: 1, width: 1, height: 1}).once();

    elementMock.expects('layoutCallback').returns(Promise.resolve()).once();

    resource.state_ = ResourceState_.READY_FOR_LAYOUT;
    resource.layoutBox_ = {left: 11, top: 12, width: 10, height: 10};
    resource.layoutCount_ = 1;
    elementMock.expects('isRelayoutNeeded').returns(true).atLeast(1);
    resource.startLayout(true);
    expect(resource.getState()).to.equal(ResourceState_.LAYOUT_SCHEDULED);
  });

  it('should ignore startLayout when document is hidden' +
        ' and prerender not allowed', () => {
    elementMock.expects('isUpgraded').returns(true).atLeast(0);
    elementMock.expects('getBoundingClientRect')
        .returns({left: 1, top: 1, width: 1, height: 1}).atLeast(0);
    elementMock.expects('prerenderAllowed').returns(false).atLeast(1);

    elementMock.expects('layoutCallback').never();

    resource.state_ = ResourceState_.READY_FOR_LAYOUT;
    resource.layoutBox_ = {left: 11, top: 12, width: 10, height: 10};
    resource.layoutCount_ = 0;
    resource.startLayout(false);
    expect(resource.getState()).to.equal(ResourceState_.READY_FOR_LAYOUT);
  });

  it('should proceed startLayout when document is hidden' +
        ' and prerender is allowed', () => {
    elementMock.expects('isUpgraded').returns(true).atLeast(0);
    elementMock.expects('getBoundingClientRect')
        .returns({left: 1, top: 1, width: 1, height: 1}).atLeast(0);
    elementMock.expects('prerenderAllowed').returns(true).atLeast(1);

    elementMock.expects('layoutCallback').returns(Promise.resolve()).once();

    resource.state_ = ResourceState_.READY_FOR_LAYOUT;
    resource.layoutBox_ = {left: 11, top: 12, width: 10, height: 10};
    resource.layoutCount_ = 0;
    resource.startLayout(false);
    expect(resource.getState()).to.equal(ResourceState_.LAYOUT_SCHEDULED);
  });


  it('should complete startLayout', () => {
    elementMock.expects('isUpgraded').returns(true).atLeast(1);
    elementMock.expects('getBoundingClientRect')
        .returns({left: 1, top: 1, width: 1, height: 1}).once();

    elementMock.expects('layoutCallback').returns(Promise.resolve()).once();

    resource.state_ = ResourceState_.READY_FOR_LAYOUT;
    resource.layoutBox_ = {left: 11, top: 12, width: 10, height: 10};
    const loaded = resource.loaded();
    const promise = resource.startLayout(true);
    expect(resource.layoutPromise_).to.not.equal(null);
    expect(resource.getState()).to.equal(ResourceState_.LAYOUT_SCHEDULED);

    return promise.then(() => {
      expect(resource.getState()).to.equal(ResourceState_.LAYOUT_COMPLETE);
      expect(resource.layoutPromise_).to.equal(null);
      return loaded;  // Just making sure this doesn't time out.
    });
  });

  it('should fail startLayout', () => {
    elementMock.expects('isUpgraded').returns(true).atLeast(1);
    elementMock.expects('getBoundingClientRect')
        .returns({left: 1, top: 1, width: 1, height: 1}).once();

    elementMock.expects('layoutCallback').returns(Promise.reject()).once();

    resource.state_ = ResourceState_.READY_FOR_LAYOUT;
    resource.layoutBox_ = {left: 11, top: 12, width: 10, height: 10};
    const promise = resource.startLayout(true);
    expect(resource.layoutPromise_).to.not.equal(null);
    expect(resource.getState()).to.equal(ResourceState_.LAYOUT_SCHEDULED);

    return promise.then(() => {
      fail('should not be here');
    }, () => {
      expect(resource.getState()).to.equal(ResourceState_.LAYOUT_FAILED);
      expect(resource.layoutPromise_).to.equal(null);
    });
  });

  it('should change size and update state', () => {
    resource.state_ = ResourceState_.READY_FOR_LAYOUT;
    elementMock.expects('changeSize').withExactArgs(111, 222).once();
    resource.changeSize(111, 222);
    expect(resource.getState()).to.equal(ResourceState_.NOT_LAID_OUT);
  });

  it('should change size but not state', () => {
    resource.state_ = ResourceState_.NOT_BUILT;
    elementMock.expects('changeSize').withExactArgs(111, 222).once();
    resource.changeSize(111, 222);
    expect(resource.getState()).to.equal(ResourceState_.NOT_BUILT);
  });


  describe('setInViewport', () => {
    it('should call viewportCallback when not built', () => {
      resource.state_ = ResourceState_.NOT_BUILT;
      elementMock.expects('viewportCallback').withExactArgs(true).once();
      resource.setInViewport(true);
      expect(resource.isInViewport()).to.equal(true);
    });

    it('should call viewportCallback when built', () => {
      resource.state_ = ResourceState_.LAYOUT_COMPLETE;
      elementMock.expects('viewportCallback').withExactArgs(true).once();
      resource.setInViewport(true);
      expect(resource.isInViewport()).to.equal(true);
    });

    it('should call viewportCallback only once', () => {
      resource.state_ = ResourceState_.LAYOUT_COMPLETE;
      elementMock.expects('viewportCallback').withExactArgs(true).once();
      resource.setInViewport(true);
      resource.setInViewport(true);
      resource.setInViewport(true);
    });
  });


  describe('unlayoutCallback', () => {
    it('should NOT call unlayoutCallback on unbuilt element', () => {
      resource.state_ = ResourceState_.NOT_BUILT;
      elementMock.expects('viewportCallback').never();
      elementMock.expects('unlayoutCallback').never();
      resource.unlayout();
      expect(resource.getState()).to.equal(ResourceState_.NOT_BUILT);
    });

    it('should call unlayoutCallback on built element and update state',
        () => {
          resource.state_ = ResourceState_.LAYOUT_COMPLETE;
          elementMock.expects('unlayoutCallback').returns(true).once();
          elementMock.expects('togglePlaceholder').withArgs(true).once();
          resource.unlayout();
          expect(resource.getState()).to.equal(ResourceState_.NOT_LAID_OUT);
        });

    it('updated state should bypass isRelayoutNeeded', () => {
      resource.state_ = ResourceState_.LAYOUT_COMPLETE;
      elementMock.expects('unlayoutCallback').returns(true).once();
      elementMock.expects('togglePlaceholder').withArgs(true).once();
      elementMock.expects('isUpgraded').returns(true).atLeast(1);
      elementMock.expects('getBoundingClientRect')
          .returns({left: 1, top: 1, width: 1, height: 1}).once();

      resource.unlayout();

      elementMock.expects('layoutCallback').returns(Promise.resolve()).once();
      resource.startLayout(true);
    });

    it('should call unlayoutCallback on built element' +
        ' but NOT update state', () => {
      resource.state_ = ResourceState_.LAYOUT_COMPLETE;
      elementMock.expects('unlayoutCallback').returns(false).once();
      elementMock.expects('togglePlaceholder').withArgs(true).never();
      resource.unlayout();
      expect(resource.getState()).to.equal(ResourceState_.LAYOUT_COMPLETE);
    });

    it('should NOT call viewportCallback when resource not in viewport', () => {
      resource.state_ = ResourceState_.LAYOUT_COMPLETE;
      resource.isInViewport_ = false;
      elementMock.expects('viewportCallback').never();
      resource.unlayout();
    });

    it('should call viewportCallback when resource in viewport', () => {
      resource.state_ = ResourceState_.LAYOUT_COMPLETE;
      resource.isInViewport_ = true;
      elementMock.expects('viewportCallback').withExactArgs(false).once();
      resource.unlayout();
    });

    it('should delegate unload to unlayoutCallback', () => {
      resource.state_ = ResourceState_.LAYOUT_COMPLETE;
      elementMock.expects('unlayoutCallback').returns(false).once();
      elementMock.expects('togglePlaceholder').withArgs(true).never();
      resource.unload();
      expect(resource.getState()).to.equal(ResourceState_.LAYOUT_COMPLETE);
    });
  });

  describe('pauseCallback', () => {
    it('should NOT call pauseCallback on unbuilt element', () => {
      resource.state_ = ResourceState_.NOT_BUILT;
      elementMock.expects('pauseCallback').never();
      resource.pause();
    });

    it('should NOT call pauseCallback on paused element', () => {
      resource.state_ = ResourceState_.LAYOUT_COMPLETE;
      resource.paused_ = true;
      elementMock.expects('pauseCallback').never();
      resource.pause();
    });

    it('should call pauseCallback on built element', () => {
      resource.state_ = ResourceState_.LAYOUT_COMPLETE;
      elementMock.expects('pauseCallback').once();
      resource.pause();
    });

    it('should NOT call unlayoutCallback', () => {
      resource.state_ = ResourceState_.LAYOUT_COMPLETE;
      elementMock.expects('pauseCallback').once();
      elementMock.expects('unlayoutCallback').never();
      resource.pause();
    });

    describe('when unlayoutOnPause', () => {
      beforeEach(() => {
        elementMock.expects('unlayoutOnPause').returns(true).once();
      });

      it('should call unlayoutCallback and update state', () => {
        resource.state_ = ResourceState_.LAYOUT_COMPLETE;
        elementMock.expects('pauseCallback').once();
        elementMock.expects('unlayoutCallback').returns(true).once();
        resource.pause();
        expect(resource.getState()).to.equal(ResourceState_.NOT_LAID_OUT);
      });

      it('should call unlayoutCallback but NOT update state', () => {
        resource.state_ = ResourceState_.LAYOUT_COMPLETE;
        elementMock.expects('pauseCallback').once();
        elementMock.expects('unlayoutCallback').returns(false).once();
        resource.pause();
        expect(resource.getState()).to.equal(ResourceState_.LAYOUT_COMPLETE);
      });
    });
  });

  describe('resumeCallback', () => {
    it('should NOT call resumeCallback on unbuilt element', () => {
      resource.state_ = ResourceState_.NOT_BUILT;
      elementMock.expects('resumeCallback').never();
      resource.resume();
    });

    it('should NOT call resumeCallback on un-paused element', () => {
      resource.state_ = ResourceState_.LAYOUT_COMPLETE;
      elementMock.expects('resumeCallback').never();
      resource.resume();
    });

    it('should call resumeCallback on built element', () => {
      resource.state_ = ResourceState_.LAYOUT_COMPLETE;
      resource.paused_ = true;
      elementMock.expects('resumeCallback').once();
      resource.resume();
    });
  });

  describe('getResourcesInViewport', () => {
    let resource1;
    let resource2;

    beforeEach(() => {
      resource1 = {
        hasOwner: () => false,
        isDisplayed: () => true,
        prerenderAllowed: () => true,
        overlaps: () => true,
      };
      resource2 = {
        hasOwner: () => false,
        isDisplayed: () => true,
        prerenderAllowed: () => true,
        overlaps: () => false,
      };
      resources.resources_ = [resource1, resource2];
    });

    it('should return a subset of resources that are currently ' +
       'in the viewport', () => {
      expect(resources.get().length).to.equal(2);
      expect(resources.getResourcesInViewport().length).to.equal(1);
    });

    it('should not return resources that are not allowed to prerender if ' +
       'in prerender mode', () => {
      resource1.prerenderAllowed = () => false;
      expect(resources.get().length).to.equal(2);
      expect(resources.getResourcesInViewport(false).length).to.equal(1);
      expect(resources.getResourcesInViewport(true).length).to.equal(0);
    });
  });
});

describe('Resource renderOutsideViewport', () => {
  let sandbox;
  let element;
  let elementMock;
  let resources;
  let resource;
  let viewport;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();

    element = {
      tagName: 'AMP-AD',
      isBuilt: () => false,
      isUpgraded: () => false,
      prerenderAllowed: () => false,
      renderOutsideViewport: () => true,
      build: () => false,
      getBoundingClientRect: () => null,
      updateLayoutBox: () => {},
      isRelayoutNeeded: () => false,
      layoutCallback: () => {},
      changeSize: () => {},
      unlayoutOnPause: () => false,
      unlayoutCallback: () => true,
      pauseCallback: () => false,
      resumeCallback: () => false,
      viewportCallback: () => {},
      getPriority: () => 0,
    };
    elementMock = sandbox.mock(element);

    resources = new Resources(window);
    resource = new Resource(1, element, resources);
    viewport = resources.viewport_;
    sandbox.stub(viewport, 'getRect').returns(layoutRectLtwh(0, 0, 100, 100));
  });

  afterEach(() => {
    elementMock.verify();
    sandbox.restore();
  });


  describe('boolean API', () => {
    describe('when element returns true', () => {
      beforeEach(() => {
        elementMock.expects('renderOutsideViewport').returns(true).once();
      });

      describe('when element is inside viewport', () => {
        it('should allow rendering when bottom falls outside', () => {
          resource.layoutBox_ = layoutRectLtwh(0, 10, 100, 100);
          expect(resource.renderOutsideViewport()).to.equal(true);
        });

        it('should allow rendering when top falls outside', () => {
          resource.layoutBox_ = layoutRectLtwh(0, -10, 100, 100);
          expect(resource.renderOutsideViewport()).to.equal(true);
        });
      });

      describe('when element is just below viewport', () => {
        beforeEach(() => {
          resource.layoutBox_ = layoutRectLtwh(0, 110, 100, 100);
        });

        it('should allow rendering when scrolling towards', () => {
          resources.lastVelocity_ = 2;
          expect(resource.renderOutsideViewport()).to.equal(true);
        });

        it('should allow rendering when scrolling away', () => {
          resources.lastVelocity_ = -2;
          expect(resource.renderOutsideViewport()).to.equal(true);
        });
      });

      describe('when element is marginally below viewport', () => {
        beforeEach(() => {
          resource.layoutBox_ = layoutRectLtwh(0, 250, 100, 100);
        });

        it('should allow rendering when scrolling towards', () => {
          resources.lastVelocity_ = 2;
          expect(resource.renderOutsideViewport()).to.equal(true);
        });

        it('should allow rendering when scrolling away', () => {
          resources.lastVelocity_ = -2;
          expect(resource.renderOutsideViewport()).to.equal(true);
        });
      });

      describe('when element is wayyy below viewport', () => {
        beforeEach(() => {
          resource.layoutBox_ = layoutRectLtwh(0, 1000, 100, 100);
        });

        it('should allow rendering', () => {
          expect(resource.renderOutsideViewport()).to.equal(true);
        });

        it('should allow rendering when scrolling towards', () => {
          resources.lastVelocity_ = 2;
          expect(resource.renderOutsideViewport()).to.equal(true);
        });

        it('should allow rendering when scrolling away', () => {
          resources.lastVelocity_ = -2;
          expect(resource.renderOutsideViewport()).to.equal(true);
        });
      });

      describe('when element is just above viewport', () => {
        beforeEach(() => {
          resource.layoutBox_ = layoutRectLtwh(0, -10, 100, 100);
        });

        it('should allow rendering when scrolling towards', () => {
          resources.lastVelocity_ = -2;
          expect(resource.renderOutsideViewport()).to.equal(true);
        });

        it('should allow rendering when scrolling away', () => {
          resources.lastVelocity_ = 2;
          expect(resource.renderOutsideViewport()).to.equal(true);
        });
      });

      describe('when element is marginally above viewport', () => {
        beforeEach(() => {
          resource.layoutBox_ = layoutRectLtwh(0, -250, 100, 100);
        });

        it('should allow rendering when scrolling towards', () => {
          resources.lastVelocity_ = -2;
          expect(resource.renderOutsideViewport()).to.equal(true);
        });

        it('should allow rendering when scrolling away', () => {
          resources.lastVelocity_ = 2;
          expect(resource.renderOutsideViewport()).to.equal(true);
        });
      });

      describe('when element is wayyy above viewport', () => {
        beforeEach(() => {
          resource.layoutBox_ = layoutRectLtwh(0, -1000, 100, 100);
        });

        it('should allow rendering', () => {
          expect(resource.renderOutsideViewport()).to.equal(true);
        });

        it('should allow rendering when scrolling towards', () => {
          resources.lastVelocity_ = -2;
          expect(resource.renderOutsideViewport()).to.equal(true);
        });

        it('should allow rendering when scrolling away', () => {
          resources.lastVelocity_ = 2;
          expect(resource.renderOutsideViewport()).to.equal(true);
        });
      });
    });

    describe('when element returns false', () => {
      beforeEach(() => {
        elementMock.expects('renderOutsideViewport').returns(false).once();
      });

      describe('when element is inside viewport', () => {
        it('should allow rendering when bottom falls outside', () => {
          resource.layoutBox_ = layoutRectLtwh(0, 10, 100, 100);
          expect(resource.renderOutsideViewport()).to.equal(false);
        });

        it('should allow rendering when top falls outside', () => {
          resource.layoutBox_ = layoutRectLtwh(0, -10, 100, 100);
          expect(resource.renderOutsideViewport()).to.equal(false);
        });
      });

      describe('when element is just below viewport', () => {
        beforeEach(() => {
          resource.layoutBox_ = layoutRectLtwh(0, 110, 100, 100);
        });

        it('should disallow rendering when scrolling towards', () => {
          resources.lastVelocity_ = 2;
          expect(resource.renderOutsideViewport()).to.equal(false);
        });

        it('should disallow rendering when scrolling away', () => {
          resources.lastVelocity_ = -2;
          expect(resource.renderOutsideViewport()).to.equal(false);
        });
      });

      describe('when element is marginally below viewport', () => {
        beforeEach(() => {
          resource.layoutBox_ = layoutRectLtwh(0, 250, 100, 100);
        });

        it('should disallow rendering when scrolling towards', () => {
          resources.lastVelocity_ = 2;
          expect(resource.renderOutsideViewport()).to.equal(false);
        });

        it('should disallow rendering when scrolling away', () => {
          resources.lastVelocity_ = -2;
          expect(resource.renderOutsideViewport()).to.equal(false);
        });
      });

      describe('when element is wayyy below viewport', () => {
        beforeEach(() => {
          resource.layoutBox_ = layoutRectLtwh(0, 1000, 100, 100);
        });

        it('should disallow rendering', () => {
          expect(resource.renderOutsideViewport()).to.equal(false);
        });

        it('should disallow rendering when scrolling towards', () => {
          resources.lastVelocity_ = 2;
          expect(resource.renderOutsideViewport()).to.equal(false);
        });

        it('should disallow rendering when scrolling away', () => {
          resources.lastVelocity_ = -2;
          expect(resource.renderOutsideViewport()).to.equal(false);
        });
      });

      describe('when element is just above viewport', () => {
        beforeEach(() => {
          resource.layoutBox_ = layoutRectLtwh(0, -10, 100, 100);
        });

        it('should disallow rendering when scrolling towards', () => {
          resources.lastVelocity_ = -2;
          expect(resource.renderOutsideViewport()).to.equal(false);
        });

        it('should disallow rendering when scrolling away', () => {
          resources.lastVelocity_ = 2;
          expect(resource.renderOutsideViewport()).to.equal(false);
        });
      });

      describe('when element is marginally above viewport', () => {
        beforeEach(() => {
          resource.layoutBox_ = layoutRectLtwh(0, -250, 100, 100);
        });

        it('should disallow rendering when scrolling towards', () => {
          resources.lastVelocity_ = -2;
          expect(resource.renderOutsideViewport()).to.equal(false);
        });

        it('should disallow rendering when scrolling away', () => {
          resources.lastVelocity_ = 2;
          expect(resource.renderOutsideViewport()).to.equal(false);
        });
      });

      describe('when element is wayyy above viewport', () => {
        beforeEach(() => {
          resource.layoutBox_ = layoutRectLtwh(0, -1000, 100, 100);
        });

        it('should disallow rendering', () => {
          expect(resource.renderOutsideViewport()).to.equal(false);
        });

        it('should disallow rendering when scrolling towards', () => {
          resources.lastVelocity_ = -2;
          expect(resource.renderOutsideViewport()).to.equal(false);
        });

        it('should disallow rendering when scrolling away', () => {
          resources.lastVelocity_ = 2;
          expect(resource.renderOutsideViewport()).to.equal(false);
        });
      });
    });
  });

  describe('number API', () => {
    beforeEach(() => {
      elementMock.expects('renderOutsideViewport').returns(3).once();
    });

    describe('when element is inside viewport', () => {
      it('should allow rendering when bottom falls outside', () => {
        resource.layoutBox_ = layoutRectLtwh(0, 10, 100, 100);
        expect(resource.renderOutsideViewport()).to.equal(true);
      });

      it('should allow rendering when top falls outside', () => {
        resource.layoutBox_ = layoutRectLtwh(0, -10, 100, 100);
        expect(resource.renderOutsideViewport()).to.equal(true);
      });
    });

    describe('when element is just below viewport', () => {
      beforeEach(() => {
        resource.layoutBox_ = layoutRectLtwh(0, 110, 100, 100);
      });

      it('should allow rendering when scrolling towards', () => {
        resources.lastVelocity_ = 2;
        expect(resource.renderOutsideViewport()).to.equal(true);
      });

      it('should allow rendering when scrolling away', () => {
        resources.lastVelocity_ = -2;
        expect(resource.renderOutsideViewport()).to.equal(true);
      });
    });

    describe('when element is marginally below viewport', () => {
      beforeEach(() => {
        resource.layoutBox_ = layoutRectLtwh(0, 250, 100, 100);
      });

      it('should allow rendering when scrolling towards', () => {
        resources.lastVelocity_ = 2;
        expect(resource.renderOutsideViewport()).to.equal(true);
      });

      it('should disallow rendering when scrolling away', () => {
        resources.lastVelocity_ = -2;
        expect(resource.renderOutsideViewport()).to.equal(false);
      });
    });

    describe('when element is wayyy below viewport', () => {
      beforeEach(() => {
        resource.layoutBox_ = layoutRectLtwh(0, 1000, 100, 100);
      });

      it('should disallow rendering', () => {
        expect(resource.renderOutsideViewport()).to.equal(false);
      });

      it('should disallow rendering when scrolling towards', () => {
        resources.lastVelocity_ = 2;
        expect(resource.renderOutsideViewport()).to.equal(false);
      });

      it('should disallow rendering when scrolling away', () => {
        resources.lastVelocity_ = -2;
        expect(resource.renderOutsideViewport()).to.equal(false);
      });
    });

    describe('when element is just above viewport', () => {
      beforeEach(() => {
        resource.layoutBox_ = layoutRectLtwh(0, -10, 100, 100);
      });

      it('should allow rendering when scrolling towards', () => {
        resources.lastVelocity_ = -2;
        expect(resource.renderOutsideViewport()).to.equal(true);
      });

      it('should allow rendering when scrolling away', () => {
        resources.lastVelocity_ = 2;
        expect(resource.renderOutsideViewport()).to.equal(true);
      });
    });

    describe('when element is marginally above viewport', () => {
      beforeEach(() => {
        resource.layoutBox_ = layoutRectLtwh(0, -250, 100, 100);
      });

      it('should allow rendering when scrolling towards', () => {
        resources.lastVelocity_ = -2;
        expect(resource.renderOutsideViewport()).to.equal(true);
      });

      it('should disallow rendering when scrolling away', () => {
        resources.lastVelocity_ = 2;
        expect(resource.renderOutsideViewport()).to.equal(false);
      });
    });

    describe('when element is wayyy above viewport', () => {
      beforeEach(() => {
        resource.layoutBox_ = layoutRectLtwh(0, -1000, 100, 100);
      });

      it('should disallow rendering', () => {
        expect(resource.renderOutsideViewport()).to.equal(false);
      });

      it('should disallow rendering when scrolling towards', () => {
        resources.lastVelocity_ = -2;
        expect(resource.renderOutsideViewport()).to.equal(false);
      });

      it('should disallow rendering when scrolling away', () => {
        resources.lastVelocity_ = 2;
        expect(resource.renderOutsideViewport()).to.equal(false);
      });
    });
  });
});

describe('Resources fix IE matchMedia', () => {
  let sandbox;
  let clock;
  let windowApi, windowMock;
  let platformMock;
  let resources;
  let devErrorStub;
  let schedulePassStub;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    clock = sandbox.useFakeTimers();
    resources = new Resources(window);
    resources.relayoutAll_ = false;
    resources.doPass_ = () => {};
    platformMock = sandbox.mock(resources.platform_);
    devErrorStub = sandbox.stub(dev, 'error');
    schedulePassStub = sandbox.stub(resources, 'schedulePass');

    windowApi = {
      innerWidth: 320,
      setInterval: () => {},
      clearInterval: () => {},
      matchMedia: () => {},
    };
    windowMock = sandbox.mock(windowApi);
  });

  afterEach(() => {
    platformMock.verify();
    windowMock.verify();
    sandbox.restore();
  });

  it('should bypass polling for non-IE browsers', () => {
    platformMock.expects('isIe').returns(false);
    windowMock.expects('matchMedia').never();
    windowMock.expects('setInterval').never();
    resources.fixMediaIe_(windowApi);
    expect(resources.relayoutAll_).to.be.true;
    expect(devErrorStub.callCount).to.equal(0);
    expect(schedulePassStub.callCount).to.equal(0);
  });

  it('should bypass polling when matchMedia is not broken', () => {
    platformMock.expects('isIe').returns(true);
    windowMock.expects('matchMedia')
        .withExactArgs('(min-width: 320px) AND (max-width: 320px)')
        .returns({matches: true})
        .once();
    windowMock.expects('setInterval').never();
    resources.fixMediaIe_(windowApi);
    expect(resources.relayoutAll_).to.be.true;
    expect(devErrorStub.callCount).to.equal(0);
    expect(schedulePassStub.callCount).to.equal(0);
  });

  it('should poll when matchMedia is wrong, but eventually succeeds', () => {
    platformMock.expects('isIe').returns(true);

    // Scheduling pass.
    windowMock.expects('matchMedia')
        .withExactArgs('(min-width: 320px) AND (max-width: 320px)')
        .returns({matches: false})
        .once();
    const intervalId = 111;
    let intervalCallback;
    windowMock.expects('setInterval')
        .withExactArgs(
            sinon.match(arg => {
              intervalCallback = arg;
              return true;
            }),
            10
        )
        .returns(intervalId)
        .once();

    resources.fixMediaIe_(windowApi);
    expect(resources.relayoutAll_).to.be.false;
    expect(devErrorStub.callCount).to.equal(0);
    expect(schedulePassStub.callCount).to.equal(0);
    expect(intervalCallback).to.exist;
    windowMock.verify();
    windowMock./*OK*/restore();

    // Second pass.
    clock.tick(10);
    windowMock = sandbox.mock(windowApi);
    windowMock.expects('matchMedia')
        .withExactArgs('(min-width: 320px) AND (max-width: 320px)')
        .returns({matches: false})
        .once();
    windowMock.expects('clearInterval').never();
    intervalCallback();
    expect(resources.relayoutAll_).to.be.false;
    expect(devErrorStub.callCount).to.equal(0);
    expect(schedulePassStub.callCount).to.equal(0);
    windowMock.verify();
    windowMock./*OK*/restore();

    // Third pass - succeed.
    clock.tick(10);
    windowMock = sandbox.mock(windowApi);
    windowMock.expects('matchMedia')
        .withExactArgs('(min-width: 320px) AND (max-width: 320px)')
        .returns({matches: true})
        .once();
    windowMock.expects('clearInterval').withExactArgs(intervalId).once();
    intervalCallback();
    expect(resources.relayoutAll_).to.be.true;
    expect(schedulePassStub.callCount).to.equal(1);
    expect(devErrorStub.callCount).to.equal(0);
    windowMock.verify();
    windowMock./*OK*/restore();
  });

  it('should poll until times out', () => {
    platformMock.expects('isIe').returns(true);

    // Scheduling pass.
    windowMock.expects('matchMedia')
        .withExactArgs('(min-width: 320px) AND (max-width: 320px)')
        .returns({matches: false})
        .atLeast(2);
    const intervalId = 111;
    let intervalCallback;
    windowMock.expects('setInterval')
        .withExactArgs(
            sinon.match(arg => {
              intervalCallback = arg;
              return true;
            }),
            10
        )
        .returns(intervalId)
        .once();
    windowMock.expects('clearInterval').withExactArgs(intervalId).once();

    resources.fixMediaIe_(windowApi);
    expect(resources.relayoutAll_).to.be.false;
    expect(devErrorStub.callCount).to.equal(0);
    expect(schedulePassStub.callCount).to.equal(0);
    expect(intervalCallback).to.exist;

    // Second pass.
    clock.tick(10);
    intervalCallback();
    expect(resources.relayoutAll_).to.be.false;
    expect(devErrorStub.callCount).to.equal(0);
    expect(schedulePassStub.callCount).to.equal(0);

    // Third pass - timeout.
    clock.tick(2000);
    intervalCallback();
    expect(resources.relayoutAll_).to.be.true;
    expect(schedulePassStub.callCount).to.equal(1);
    expect(devErrorStub.callCount).to.equal(1);
  });

  it('should tolerate matchMedia exceptions', () => {
    platformMock.expects('isIe').returns(true);

    windowMock.expects('matchMedia')
        .withExactArgs('(min-width: 320px) AND (max-width: 320px)')
        .throws(new Error('intentional'))
        .once();
    windowMock.expects('setInterval').never();

    resources.fixMediaIe_(windowApi);
    expect(resources.relayoutAll_).to.be.true;
    expect(devErrorStub.callCount).to.equal(1);
    expect(schedulePassStub.callCount).to.equal(0);
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
      tagName: 'amp-test',
      isBuilt() {
        return true;
      },
      isUpgraded() {
        return true;
      },
    };
    element.build = sandbox.spy();
    return element;
  }

  function createElementWithResource(id) {
    const element = createElement();
    const resource = new Resource(id, element, resources);
    resource.state_ = ResourceState_.NOT_BUILT;
    resource.element['__AMP__RESOURCE'] = resource;
    return [element, resource];
  }

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    resources = new Resources(window);
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

  it('should build elements immediately if the document is ready', () => {
    resources.documentReady_ = false;
    resources.add(child1);
    expect(child1.build.called).to.be.false;
    resources.documentReady_ = true;
    resources.add(child2);
    expect(child2.build.calledOnce).to.be.true;
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
      resources.documentReady_ = false;
      resources.pendingBuildResources_ = [resource1, resource2];
      resources.buildReadyResources_();
      expect(child1.build.called).to.be.false;
      expect(child2.build.called).to.be.false;
      expect(resources.pendingBuildResources_.length).to.be.equal(2);

      child1.nextSibling = child2;
      resources.buildReadyResources_();
      expect(child1.build.called).to.be.true;
      expect(child2.build.called).to.be.false;
      expect(resources.pendingBuildResources_.length).to.be.equal(1);
      expect(resources.pendingBuildResources_[0]).to.be.equal(resource2);

      child2.parentNode = parent;
      parent.nextSibling = true;
      resources.buildReadyResources_();
      expect(child1.build.calledTwice).to.be.false;
      expect(child2.build.called).to.be.true;
      expect(resources.pendingBuildResources_.length).to.be.equal(0);
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
    });
  });
});
