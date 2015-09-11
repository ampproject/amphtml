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

import {Resources, TaskQueue_} from '../../src/resources';
import {layoutRectLtwh} from '../../src/layout-rect';
import * as sinon from 'sinon';

describe('Resources', () => {

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

  it('calcTaskScore', () => {
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

  it('calcTaskTimeout', () => {
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


  it('TaskQueue - enqueue/dequeue', () => {
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

  it('TaskQueue - peek', () => {
    queue.enqueue({id: 'A', v: 0});
    queue.enqueue({id: 'B', v: 2});
    queue.enqueue({id: 'C', v: 1});

    let task = queue.peek((task) => 10 - task.v);
    expect(task.id).to.equal('B');
  });

});
