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
    let viewportRect = layoutRectLtwh(0, 100, 300, 400);
    // Task 1 is right in the middle of the viewport and priority 0
    let task_vp0_p0 = {
      resource: {
        getLayoutBox() {
          return layoutRectLtwh(0, 100, 300, 100)
        }
      },
      priority: 0
    };
    // Task 2 is in the viewport and priority 1
    let task_vp0_p1 = {
      resource: {
        getLayoutBox() {
          return layoutRectLtwh(0, 100, 300, 100)
        }
      },
      priority: 1
    };
    // Task 3 is above viewport and priority 0
    let task_vpu_p0 = {
      resource: {
        getLayoutBox() {
          return layoutRectLtwh(0, 0, 300, 50)
        }
      },
      priority: 0
    };
    // Task 4 is above viewport and priority 0
    let task_vpu_p1 = {
      resource: {
        getLayoutBox() {
          return layoutRectLtwh(0, 0, 300, 50)
        }
      },
      priority: 1
    };
    // Task 5 is below viewport and priority 0
    let task_vpd_p0 = {
      resource: {
        getLayoutBox() {
          return layoutRectLtwh(0, 600, 300, 50)
        }
      },
      priority: 0
    };
    // Task 6 is below viewport and priority 0
    let task_vpd_p1 = {
      resource: {
        getLayoutBox() {
          return layoutRectLtwh(0, 600, 300, 50)
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
    let task_p0 = {
      priority: 0,
      startTime: 0
    };
    // Task 2 is priority 1
    let task_p1 = {
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

    let task = queue.peek((task) => 10 - task.v);
    expect(task.id).to.equal('B');
  });
});


describe('Resources.Resource', () => {

  let sandbox;
  let clock;
  let element;
  let elementMock;
  let resource;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    clock = sandbox.useFakeTimers();

    element = {
      tagName: 'AMP-AD',
      isBuilt: () => {return false;},
      isUpgraded: () => {return false;},
      build: (force) => {return false;},
      getBoundingClientRect: () => {return null;},
      isRelayoutNeeded: () => {return false;},
      layoutCallback: () => {}
    };
    elementMock = sandbox.mock(element);

    resource = new Resource(1, element);
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
        ResourceState_.NEVER_LAID_OUT);
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
    expect(resource.getState()).to.equal(ResourceState_.NEVER_LAID_OUT);
  });

  it('should force-build after upgraded', () => {
    elementMock.expects('isUpgraded').returns(true).atLeast(1);
    elementMock.expects('build').withExactArgs(true).returns(true).once();
    expect(resource.build(true)).to.equal(true);
    expect(resource.getState()).to.equal(ResourceState_.NEVER_LAID_OUT);
  });

  it('should blacklist on build failure', () => {
    elementMock.expects('isUpgraded').returns(true).atLeast(1);
    elementMock.expects('build').withExactArgs(true).
        throws('Failed').once();
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

    elementMock.expects('getBoundingClientRect').
        returns({left: 11, top: 12, width: 111, height: 222}).
        once();
    resource.measure();
    expect(resource.getState()).to.equal(ResourceState_.READY_FOR_LAYOUT);
    expect(resource.getLayoutBox().left).to.equal(11);
    expect(resource.getLayoutBox().top).to.equal(12);
    expect(resource.getLayoutBox().width).to.equal(111);
    expect(resource.getLayoutBox().height).to.equal(222);
  });

  it('should always layout if has not been laid out before', () => {
    elementMock.expects('isUpgraded').returns(true).atLeast(1);
    resource.state_ = ResourceState_.NEVER_LAID_OUT;
    resource.layoutBox_ = {left: 11, top: 12, width: 111, height: 222};

    elementMock.expects('getBoundingClientRect').
        returns(resource.layoutBox_).once();
    resource.measure();
    expect(resource.getState()).to.equal(ResourceState_.READY_FOR_LAYOUT);
  });

  it('should not relayout if has box has not changed', () => {
    elementMock.expects('isUpgraded').returns(true).atLeast(1);
    resource.state_ = ResourceState_.LAYOUT_COMPLETE;
    resource.layoutBox_ = {left: 11, top: 12, width: 111, height: 222};

    // Left is not part of validation.
    elementMock.expects('getBoundingClientRect').
        returns({left: 11 + 10, top: 12, width: 111, height: 222}).once();
    resource.measure();
    expect(resource.getState()).to.equal(ResourceState_.LAYOUT_COMPLETE);
    expect(resource.getLayoutBox().left).to.equal(11 + 10);
  });

  it('should not relayout if box changed but element didn\'t opt in', () => {
    elementMock.expects('isUpgraded').returns(true).atLeast(1);
    resource.state_ = ResourceState_.LAYOUT_COMPLETE;
    resource.layoutBox_ = {left: 11, top: 12, width: 111, height: 222};

    // Width changed.
    elementMock.expects('getBoundingClientRect').
        returns({left: 11, top: 12, width: 111 + 10, height: 222}).once();
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
    elementMock.expects('getBoundingClientRect').
        returns({left: 11, top: 12, width: 111 + 10, height: 222}).once();
    elementMock.expects('isRelayoutNeeded').returns(true).atLeast(1);
    resource.measure();
    expect(resource.getState()).to.equal(ResourceState_.READY_FOR_LAYOUT);
    expect(resource.getLayoutBox().width).to.equal(111 + 10);
  });


  it('should ignore startLayout if already completed or failed or going',
        () => {
    elementMock.expects('layoutCallback').never();

    resource.state_ = ResourceState_.LAYOUT_COMPLETE;
    resource.startLayout();

    resource.state_ = ResourceState_.LAYOUT_FAILED;
    resource.startLayout();

    resource.state_ = ResourceState_.READY_FOR_LAYOUT;
    resource.layoutPromise_ = {};
    resource.startLayout();
  });

  it('should fail startLayout if not built', () => {
    elementMock.expects('layoutCallback').never();

    resource.state_ = ResourceState_.NOT_BUILT;
    expect(() => {
      resource.startLayout();
    }).to.throw(/Not ready to start layout/);
  });

  it('should ignore startLayout if not visible', () => {
    elementMock.expects('isUpgraded').returns(true).atLeast(1);
    elementMock.expects('getBoundingClientRect').
        returns({left: 1, top: 1, width: 1, height: 1}).once();

    elementMock.expects('layoutCallback').never();

    resource.state_ = ResourceState_.READY_FOR_LAYOUT;
    resource.layoutBox_ = {left: 11, top: 12, width: 0, height: 0};
    resource.startLayout();
  });

  it('should force startLayout for first layout', () => {
    elementMock.expects('isUpgraded').returns(true).atLeast(1);
    elementMock.expects('getBoundingClientRect').
        returns({left: 1, top: 1, width: 1, height: 1}).once();

    elementMock.expects('layoutCallback').returns(Promise.resolve()).once();

    resource.state_ = ResourceState_.READY_FOR_LAYOUT;
    resource.layoutBox_ = {left: 11, top: 12, width: 10, height: 10};
    resource.startLayout();
    expect(resource.getState()).to.equal(ResourceState_.LAYOUT_SCHEDULED);
  });

  it('should ignore startLayout for re-layout when not opt-in', () => {
    elementMock.expects('isUpgraded').returns(true).atLeast(1);
    elementMock.expects('getBoundingClientRect').
        returns({left: 1, top: 1, width: 1, height: 1}).once();

    elementMock.expects('layoutCallback').never();

    resource.state_ = ResourceState_.READY_FOR_LAYOUT;
    resource.layoutBox_ = {left: 11, top: 12, width: 10, height: 10};
    resource.layoutCount_ = 1;
    elementMock.expects('isRelayoutNeeded').returns(false).atLeast(1);
    resource.startLayout();
    expect(resource.getState()).to.equal(ResourceState_.LAYOUT_COMPLETE);
  });

  it('should force startLayout for re-layout when opt-in', () => {
    elementMock.expects('isUpgraded').returns(true).atLeast(1);
    elementMock.expects('getBoundingClientRect').
        returns({left: 1, top: 1, width: 1, height: 1}).once();

    elementMock.expects('layoutCallback').returns(Promise.resolve()).once();

    resource.state_ = ResourceState_.READY_FOR_LAYOUT;
    resource.layoutBox_ = {left: 11, top: 12, width: 10, height: 10};
    resource.layoutCount_ = 1;
    elementMock.expects('isRelayoutNeeded').returns(true).atLeast(1);
    resource.startLayout();
    expect(resource.getState()).to.equal(ResourceState_.LAYOUT_SCHEDULED);
  });


  it('should complete startLayout', () => {
    elementMock.expects('isUpgraded').returns(true).atLeast(1);
    elementMock.expects('getBoundingClientRect').
        returns({left: 1, top: 1, width: 1, height: 1}).once();

    elementMock.expects('layoutCallback').returns(Promise.resolve()).once();

    resource.state_ = ResourceState_.READY_FOR_LAYOUT;
    resource.layoutBox_ = {left: 11, top: 12, width: 10, height: 10};
    let promise = resource.startLayout();
    expect(resource.layoutPromise_).to.not.equal(null);
    expect(resource.getState()).to.equal(ResourceState_.LAYOUT_SCHEDULED);

    return promise.then(() => {
      expect(resource.getState()).to.equal(ResourceState_.LAYOUT_COMPLETE);
      expect(resource.layoutPromise_).to.equal(null);
    });
  });

  it('should fail startLayout', () => {
    elementMock.expects('isUpgraded').returns(true).atLeast(1);
    elementMock.expects('getBoundingClientRect').
        returns({left: 1, top: 1, width: 1, height: 1}).once();

    elementMock.expects('layoutCallback').returns(Promise.reject()).once();

    resource.state_ = ResourceState_.READY_FOR_LAYOUT;
    resource.layoutBox_ = {left: 11, top: 12, width: 10, height: 10};
    let promise = resource.startLayout();
    expect(resource.layoutPromise_).to.not.equal(null);
    expect(resource.getState()).to.equal(ResourceState_.LAYOUT_SCHEDULED);

    return promise.then(() => {
      fail('should not be here');
    }, () => {
      expect(resource.getState()).to.equal(ResourceState_.LAYOUT_FAILED);
      expect(resource.layoutPromise_).to.equal(null);
    });
  });
});
