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

import {Resource, ResourceState_, Resources, TaskQueue_} from
    '../../src/resources';
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
    resources = null;
    clock.restore();
    clock = null;
    sandbox.restore();
    sandbox = null;
  });

  it('should calculate correct calcTaskScore', () => {
    const viewportRect = layoutRectLtwh(0, 100, 300, 400);
    // Task 1 is right in the middle of the viewport and priority 0
    const task_vp0_p0 = {
      resource: {
        getLayoutBox() {
          return layoutRectLtwh(0, 100, 300, 100);
        }
      },
      priority: 0
    };
    // Task 2 is in the viewport and priority 1
    const task_vp0_p1 = {
      resource: {
        getLayoutBox() {
          return layoutRectLtwh(0, 100, 300, 100);
        }
      },
      priority: 1
    };
    // Task 3 is above viewport and priority 0
    const task_vpu_p0 = {
      resource: {
        getLayoutBox() {
          return layoutRectLtwh(0, 0, 300, 50);
        }
      },
      priority: 0
    };
    // Task 4 is above viewport and priority 0
    const task_vpu_p1 = {
      resource: {
        getLayoutBox() {
          return layoutRectLtwh(0, 0, 300, 50);
        }
      },
      priority: 1
    };
    // Task 5 is below viewport and priority 0
    const task_vpd_p0 = {
      resource: {
        getLayoutBox() {
          return layoutRectLtwh(0, 600, 300, 50);
        }
      },
      priority: 0
    };
    // Task 6 is below viewport and priority 0
    const task_vpd_p1 = {
      resource: {
        getLayoutBox() {
          return layoutRectLtwh(0, 600, 300, 50);
        }
      },
      priority: 1
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
      startTime: 0
    };
    // Task 2 is priority 1
    const task_p1 = {
      priority: 1,
      startTime: 0
    };

    // Empty pool
    expect(resources.calcTaskTimeout_(task_p0)).to.equal(0);
    expect(resources.calcTaskTimeout_(task_p1)).to.equal(0);

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
      startLayout: () => {}
    };
    resources.visible_ = false;
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
      layoutScheduled: () => {}
    };
    resources.visible_ = false;
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
      layoutScheduled: () => {}
    };
    resources.scheduleLayoutOrPreload_(resource, true);
    expect(resources.queue_.getSize()).to.equal(1);
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
      viewportCallback: sinon.spy(),
      prerenderAllowed: () => true,
      renderOutsideViewport: () => true,
      isRelayoutNeeded: () => true,
    };
  }

  function createResource(id, rect) {
    const resource = new Resource(id, createElement(rect), resources);
    resource.state_ = ResourceState_.READY_FOR_LAYOUT;
    resource.layoutBox_ = rect;
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
    viewportMock = sandbox.mock(resources.viewport_);

    resource1 = createResource(1, layoutRectLtwh(10, 10, 100, 100));
    resource2 = createResource(2, layoutRectLtwh(10, 1010, 100, 100));
    resources.resources_ = [resource1, resource2];
  });

  afterEach(() => {
    viewportMock.verify();
    viewportMock.restore();
    viewportMock = null;
    resources = null;
    clock.restore();
    clock = null;
    sandbox.restore();
    sandbox = null;
  });

  it('should render two screens when visible', () => {
    resources.visible_ = true;
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
    resources.prerenderSize_ = 1;
    viewportMock.expects('getRect').returns(
        layoutRectLtwh(0, 0, 300, 400)).once();

    resources.discoverWork_();

    expect(resources.queue_.getSize()).to.equal(1);
    expect(resources.queue_.tasks_[0].resource).to.equal(resource1);
  });

  it('should NOT prerender anything with prerenderSize = 0', () => {
    resources.visible_ = false;
    resources.prerenderSize_ = 0;
    viewportMock.expects('getRect').returns(
        layoutRectLtwh(0, 0, 300, 400)).once();

    resources.discoverWork_();

    expect(resources.queue_.getSize()).to.equal(0);
  });
});


describe('Resources changeHeight', () => {

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
      viewportCallback: sinon.spy(),
      prerenderAllowed: () => true,
      renderOutsideViewport: () => false,
      isRelayoutNeeded: () => true,
      contains: otherElement => false,
      updateLayoutBox: () => {},
      overflowCallback: (overflown, requestedHeight) => {},
    };
  }

  function createResource(id, rect) {
    const resource = new Resource(id, createElement(rect), resources);
    resource.element['__AMP__RESOURCE'] = resource;
    resource.state_ = ResourceState_.READY_FOR_LAYOUT;
    resource.layoutBox_ = rect;
    resource.changeHeight = sinon.spy();
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
    viewportMock = sandbox.mock(resources.viewport_);

    resource1 = createResource(1, layoutRectLtwh(10, 10, 100, 100));
    resource2 = createResource(2, layoutRectLtwh(10, 1010, 100, 100));
    resources.resources_ = [resource1, resource2];
  });

  afterEach(() => {
    viewportMock.verify();
    viewportMock.restore();
    viewportMock = null;
    resources = null;
    clock.restore();
    clock = null;
    sandbox.restore();
    sandbox = null;
  });

  it('should schedule separate requests', () => {
    resources.scheduleChangeHeight_(resource1, 111, false);
    resources.scheduleChangeHeight_(resource2, 222, true);

    expect(resources.requestsChangeHeight_.length).to.equal(2);
    expect(resources.requestsChangeHeight_[0].resource).to.equal(resource1);
    expect(resources.requestsChangeHeight_[0].newHeight).to.equal(111);
    expect(resources.requestsChangeHeight_[0].force).to.equal(false);

    expect(resources.requestsChangeHeight_[1].resource).to.equal(resource2);
    expect(resources.requestsChangeHeight_[1].newHeight).to.equal(222);
    expect(resources.requestsChangeHeight_[1].force).to.equal(true);
  });

  it('should only schedule latest request for the same resource', () => {
    resources.scheduleChangeHeight_(resource1, 111, true);
    resources.scheduleChangeHeight_(resource1, 222, false);

    expect(resources.requestsChangeHeight_.length).to.equal(1);
    expect(resources.requestsChangeHeight_[0].resource).to.equal(resource1);
    expect(resources.requestsChangeHeight_[0].newHeight).to.equal(222);
    expect(resources.requestsChangeHeight_[0].force).to.equal(true);
  });

  it('should NOT change height if it didn\'t change', () => {
    resources.scheduleChangeHeight_(resource1, 100, true);
    resources.mutateWork_();
    expect(resources.relayoutTop_).to.equal(-1);
    expect(resources.requestsChangeHeight_.length).to.equal(0);
    expect(resource1.changeHeight.callCount).to.equal(0);
  });

  it('should change height', () => {
    resources.scheduleChangeHeight_(resource1, 111, true);
    resources.mutateWork_();
    expect(resources.relayoutTop_).to.equal(resource1.layoutBox_.top);
    expect(resources.requestsChangeHeight_.length).to.equal(0);
    expect(resource1.changeHeight.callCount).to.equal(1);
    expect(resource1.changeHeight.firstCall.args[0]).to.equal(111);
  });

  it('should pick the smallest relayoutTop', () => {
    resources.scheduleChangeHeight_(resource2, 111, true);
    resources.scheduleChangeHeight_(resource1, 111, true);
    resources.mutateWork_();
    expect(resources.relayoutTop_).to.equal(resource1.layoutBox_.top);
  });

  describe('requestChangeHeight rules when element is in viewport', () => {
    let overflowCallbackSpy;
    let vsyncSpy;

    beforeEach(() => {
      overflowCallbackSpy = sinon.spy();
      resource1.element.overflowCallback = overflowCallbackSpy;
      viewportMock.expects('getRect').returns(
          {top: 0, left: 0, right: 100, bottom: 200, height: 200}).atLeast(1);
      resource1.layoutBox_ = {top: 10, left: 0, right: 100, bottom: 50,
          height: 50};
      vsyncSpy = sandbox.stub(resources.vsync_, 'run');
    });

    afterEach(() => {
      vsyncSpy.reset();
      vsyncSpy.restore();
    });

    it('should NOT change height and calls overflowCallback', () => {
      resources.scheduleChangeHeight_(resource1, 111, false);
      resources.mutateWork_();
      expect(resources.requestsChangeHeight_.length).to.equal(0);
      expect(resource1.changeHeight.callCount).to.equal(0);
      expect(overflowCallbackSpy.callCount).to.equal(1);
      expect(overflowCallbackSpy.firstCall.args[0]).to.equal(true);
      expect(overflowCallbackSpy.firstCall.args[1]).to.equal(111);
      expect(resource1.getPendingChangeHeight()).to.equal(111);
    });

    it('should change height when new height is lower', () => {
      resources.scheduleChangeHeight_(resource1, 10, false);
      resources.mutateWork_();
      expect(resources.requestsChangeHeight_.length).to.equal(0);
      expect(resource1.changeHeight.callCount).to.equal(0);
      expect(overflowCallbackSpy.callCount).to.equal(0);
    });

    it('should change height when forced', () => {
      resources.scheduleChangeHeight_(resource1, 111, true);
      resources.mutateWork_();
      expect(resources.requestsChangeHeight_.length).to.equal(0);
      expect(resource1.changeHeight.callCount).to.equal(1);
      expect(overflowCallbackSpy.callCount).to.equal(1);
      expect(overflowCallbackSpy.firstCall.args[0]).to.equal(false);
    });

    it('should change height when document is invisible', () => {
      resources.visible_ = false;
      resources.scheduleChangeHeight_(resource1, 111, false);
      resources.mutateWork_();
      expect(resources.requestsChangeHeight_.length).to.equal(0);
      expect(resource1.changeHeight.callCount).to.equal(1);
      expect(overflowCallbackSpy.callCount).to.equal(1);
      expect(overflowCallbackSpy.firstCall.args[0]).to.equal(false);
    });

    it('should change height when active', () => {
      resource1.element.contains = () => true;
      resources.scheduleChangeHeight_(resource1, 111, false);
      resources.mutateWork_();
      expect(resources.requestsChangeHeight_.length).to.equal(0);
      expect(resource1.changeHeight.callCount).to.equal(1);
      expect(overflowCallbackSpy.callCount).to.equal(1);
      expect(overflowCallbackSpy.firstCall.args[0]).to.equal(false);
    });

    it('should change height when below the viewport', () => {
      resource1.layoutBox_ = {top: 10, left: 0, right: 100, bottom: 1050,
          height: 50};
      resources.scheduleChangeHeight_(resource1, 111, false);
      resources.mutateWork_();
      expect(resources.requestsChangeHeight_.length).to.equal(0);
      expect(resource1.changeHeight.callCount).to.equal(1);
      expect(overflowCallbackSpy.callCount).to.equal(1);
      expect(overflowCallbackSpy.firstCall.args[0]).to.equal(false);
    });

    it('should change height when slightly above the viewport', () => {
      resource1.layoutBox_ = {top: 10, left: 0, right: 100, bottom: 180,
          height: 50};
      resources.scheduleChangeHeight_(resource1, 111, false);
      resources.mutateWork_();
      expect(resources.requestsChangeHeight_.length).to.equal(0);
      expect(resource1.changeHeight.callCount).to.equal(1);
      expect(overflowCallbackSpy.callCount).to.equal(1);
      expect(overflowCallbackSpy.firstCall.args[0]).to.equal(false);
    });

    it('should NOT change height when significantly above the viewport', () => {
      resource1.layoutBox_ = {top: 10, left: 0, right: 100, bottom: 100,
          height: 50};
      resources.scheduleChangeHeight_(resource1, 111, false);
      resources.mutateWork_();
      expect(resource1.changeHeight.callCount).to.equal(0);
      expect(overflowCallbackSpy.callCount).to.equal(1);
      expect(overflowCallbackSpy.firstCall.args[0]).to.equal(true);
      expect(overflowCallbackSpy.firstCall.args[1]).to.equal(111);
      expect(resource1.getPendingChangeHeight()).to.equal(111);
    });

    it('should defer when above the viewport and scrolling on', () => {
      resource1.layoutBox_ = {top: -1200, left: 0, right: 100, bottom: -1050,
          height: 50};
      resources.lastVelocity_ = 10;
      resources.lastScrollTime_ = new Date().getTime();
      resources.scheduleChangeHeight_(resource1, 111, false);
      resources.mutateWork_();
      expect(resources.requestsChangeHeight_.length).to.equal(1);
      expect(resource1.changeHeight.callCount).to.equal(0);
      expect(overflowCallbackSpy.callCount).to.equal(0);
    });

    it('should change height when above the vp and adjust scrolling', () => {
      viewportMock.expects('getScrollHeight').returns(2999).once();
      viewportMock.expects('getScrollTop').returns(1777).once();
      resource1.layoutBox_ = {top: -1200, left: 0, right: 100, bottom: -1050,
          height: 50};
      resources.lastVelocity_ = 0;
      clock.tick(5000);
      resources.scheduleChangeHeight_(resource1, 111, false);
      resources.mutateWork_();
      expect(resources.requestsChangeHeight_.length).to.equal(0);
      expect(resource1.changeHeight.callCount).to.equal(0);

      expect(vsyncSpy.callCount).to.be.greaterThan(1);
      const task = vsyncSpy.lastCall.args[0];
      const state = {};
      task.measure(state);
      expect(state.scrollTop).to.equal(1777);
      expect(state.scrollHeight).to.equal(2999);

      viewportMock.expects('getScrollHeight').returns(3999).once();
      viewportMock.expects('setScrollTop').withExactArgs(2777).once();
      task.mutate(state);
      expect(resource1.changeHeight.callCount).to.equal(1);
      expect(resource1.changeHeight.firstCall.args[0]).to.equal(111);
      expect(resources.relayoutTop_).to.equal(resource1.layoutBox_.top);
    });

    it('should NOT adjust scrolling if height did not increase', () => {
      viewportMock.expects('getScrollHeight').returns(2999).once();
      viewportMock.expects('getScrollTop').returns(1777).once();
      resource1.layoutBox_ = {top: -1200, left: 0, right: 100, bottom: -1050,
          height: 50};
      resources.lastVelocity_ = 0;
      clock.tick(5000);
      resources.scheduleChangeHeight_(resource1, 111, false);
      resources.mutateWork_();
      expect(resources.requestsChangeHeight_.length).to.equal(0);
      expect(resource1.changeHeight.callCount).to.equal(0);

      expect(vsyncSpy.callCount).to.be.greaterThan(1);
      const task = vsyncSpy.lastCall.args[0];
      const state = {};
      task.measure(state);
      expect(state.scrollTop).to.equal(1777);
      expect(state.scrollHeight).to.equal(2999);

      viewportMock.expects('getScrollHeight').returns(2999).once();
      viewportMock.expects('setScrollTop').never();
      task.mutate(state);
      expect(resource1.changeHeight.callCount).to.equal(1);
      expect(resource1.changeHeight.firstCall.args[0]).to.equal(111);
      expect(resources.relayoutTop_).to.equal(resource1.layoutBox_.top);
    });

    it('should reset pending change height when rescheduling', () => {
      resources.scheduleChangeHeight_(resource1, 111, false);
      resources.mutateWork_();
      expect(resource1.getPendingChangeHeight()).to.equal(111);

      resources.scheduleChangeHeight_(resource1, 112, false);
      expect(resource1.getPendingChangeHeight()).to.be.undefined;
    });

    it('should force resize after focus', () => {
      resources.scheduleChangeHeight_(resource1, 111, false);
      resources.mutateWork_();
      expect(resource1.getPendingChangeHeight()).to.equal(111);
      expect(resources.requestsChangeHeight_.length).to.equal(0);

      resources.checkPendingChangeHeight_(resource1.element);
      expect(resource1.getPendingChangeHeight()).to.be.undefined;
      expect(resources.requestsChangeHeight_.length).to.equal(1);

      resources.mutateWork_();
      expect(resources.requestsChangeHeight_.length).to.equal(0);
      expect(resource1.changeHeight.callCount).to.equal(1);
      expect(resource1.changeHeight.firstCall.args[0]).to.equal(111);
      expect(overflowCallbackSpy.callCount).to.equal(2);
      expect(overflowCallbackSpy.lastCall.args[0]).to.equal(false);
    });
  });
});


describe('Resources.TaskQueue', () => {

  let sandbox;
  let clock;
  let resources;
  let queue;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    clock = sandbox.useFakeTimers();
    resources = new Resources(window);
    queue = new TaskQueue_();
  });

  afterEach(() => {
    resources = null;
    clock.restore();
    clock = null;
    sandbox.restore();
    sandbox = null;
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
  let clock;
  let element;
  let elementMock;
  let resources;
  let resource;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    clock = sandbox.useFakeTimers();

    element = {
      tagName: 'AMP-AD',
      isBuilt: () => false,
      isUpgraded: () => false,
      prerenderAllowed: () => false,
      renderOutsideViewport: () => true,
      build: force => false,
      getBoundingClientRect: () => null,
      updateLayoutBox: () => {},
      isRelayoutNeeded: () => false,
      layoutCallback: () => {},
      changeHeight: () => {},
      documentInactiveCallback: () => false,
      viewportCallback: () => {}
    };
    elementMock = sandbox.mock(element);

    resources = new Resources(window);
    resource = new Resource(1, element, resources);
  });

  afterEach(() => {
    resource = null;
    elementMock.verify();
    elementMock = null;
    element = null;
    clock.restore();
    clock = null;
    sandbox.restore();
    sandbox = null;
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

    // Force = false.
    expect(resource.build(false)).to.equal(false);
    expect(resource.getState()).to.equal(ResourceState_.NOT_BUILT);

    // Force = true.
    expect(resource.build(true)).to.equal(false);
    expect(resource.getState()).to.equal(ResourceState_.NOT_BUILT);
  });

  it('should build after upgraded, but before ready', () => {
    elementMock.expects('isUpgraded').returns(true).atLeast(1);
    elementMock.expects('build').withExactArgs(false).returns(false).once();
    expect(resource.build(false)).to.equal(false);
    expect(resource.getState()).to.equal(ResourceState_.NOT_BUILT);
  });

  it('should build after upgraded', () => {
    elementMock.expects('isUpgraded').returns(true).atLeast(1);
    elementMock.expects('build').withExactArgs(false).returns(true).once();
    expect(resource.build(false)).to.equal(true);
    expect(resource.getState()).to.equal(ResourceState_.NOT_LAID_OUT);
  });

  it('should force-build after upgraded', () => {
    elementMock.expects('isUpgraded').returns(true).atLeast(1);
    elementMock.expects('build').withExactArgs(true).returns(true).once();
    expect(resource.build(true)).to.equal(true);
    expect(resource.getState()).to.equal(ResourceState_.NOT_LAID_OUT);
  });

  it('should blacklist on build failure', () => {
    elementMock.expects('isUpgraded').returns(true).atLeast(1);
    elementMock.expects('build').withExactArgs(true)
        .throws('Failed').once();
    expect(resource.build(true)).to.equal(false);
    expect(resource.blacklisted_).to.equal(true);
    expect(resource.getState()).to.equal(ResourceState_.NOT_BUILT);

    // Second attempt would not even try to build.
    expect(resource.build(true)).to.equal(false);
  });

  it('should fail measure when not upgraded', () => {
    elementMock.expects('isUpgraded').returns(false).atLeast(1);
    expect(() => {
      resource.measure();
    }).to.throw(/Must be upgraded to measure: amp-ad#1/);
  });

  it('should noop measure when not built', () => {
    elementMock.expects('isUpgraded').returns(true).atLeast(1);
    elementMock.expects('getBoundingClientRect').never();
    resource.measure();
    expect(resource.getState()).to.equal(ResourceState_.NOT_BUILT);
  });

  it('should measure and update state', () => {
    elementMock.expects('isUpgraded').returns(true).atLeast(1);
    elementMock.expects('build').returns(true).once();
    expect(resource.build(true)).to.equal(true);

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
    elementMock.expects('isUpgraded').returns(true).atLeast(1);
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
    const promise = resource.startLayout(true);
    expect(resource.layoutPromise_).to.not.equal(null);
    expect(resource.getState()).to.equal(ResourceState_.LAYOUT_SCHEDULED);

    return promise.then(() => {
      expect(resource.getState()).to.equal(ResourceState_.LAYOUT_COMPLETE);
      expect(resource.layoutPromise_).to.equal(null);
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


  it('should change height and update state', () => {
    resource.state_ = ResourceState_.READY_FOR_LAYOUT;
    elementMock.expects('changeHeight').withExactArgs(111).once();
    resource.changeHeight(111);
    expect(resource.getState()).to.equal(ResourceState_.NOT_LAID_OUT);
  });

  it('should change height but not state', () => {
    resource.state_ = ResourceState_.NOT_BUILT;
    elementMock.expects('changeHeight').withExactArgs(111).once();
    resource.changeHeight(111);
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


  describe('documentInactiveCallback', () => {
    it('should NOT call documentInactiveCallback on unbuilt element', () => {
      resource.state_ = ResourceState_.NOT_BUILT;
      elementMock.expects('viewportCallback').never();
      elementMock.expects('documentInactiveCallback').never();
      resource.documentBecameInactive();
      expect(resource.getState()).to.equal(ResourceState_.NOT_BUILT);
    });

    it('should call documentInactiveCallback on built element and update state',
        () => {
          resource.state_ = ResourceState_.LAYOUT_COMPLETE;
          elementMock.expects('documentInactiveCallback').returns(true).once();
          resource.documentBecameInactive();
          expect(resource.getState()).to.equal(ResourceState_.NOT_LAID_OUT);
        });

    it('should call documentInactiveCallback on built element' +
        ' but NOT update state', () => {
      resource.state_ = ResourceState_.LAYOUT_COMPLETE;
      elementMock.expects('documentInactiveCallback').returns(false).once();
      resource.documentBecameInactive();
      expect(resource.getState()).to.equal(ResourceState_.LAYOUT_COMPLETE);
    });

    it('should NOT call viewportCallback when resource not in viewport', () => {
      resource.state_ = ResourceState_.LAYOUT_COMPLETE;
      resource.isInViewport_ = false;
      elementMock.expects('viewportCallback').never();
      resource.documentBecameInactive();
    });

    it('should call viewportCallback when resource in viewport', () => {
      resource.state_ = ResourceState_.LAYOUT_COMPLETE;
      resource.isInViewport_ = true;
      elementMock.expects('viewportCallback').withExactArgs(false).once();
      resource.documentBecameInactive();
    });
  });

});
