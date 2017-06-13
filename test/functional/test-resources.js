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
    resources.pass_.cancel();
  });

  function createAmpElement() {
    const element = document.createElement('div');
    element.classList.add('i-amphtml-element');
    element.whenBuilt = () => Promise.resolve();
    element.isBuilt = () => true;
    element.build = () => {};
    element.isUpgraded = () => true;
    element.updateLayoutBox = () => {};
    element.getPlaceholder = () => null;
    element.getPriority = () => 0;
    element.dispatchCustomEvent = () => {};
    return element;
  }

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
        ' document is in prerender', () => {
    const resource = {
      getState: () => ResourceState.READY_FOR_LAYOUT,
      isDisplayed: () => true,
      isFixed: () => false,
      isInViewport: () => true,
      prerenderAllowed: () => false,
      renderOutsideViewport: () => false,
      startLayout: () => {},
      applySizesAndMediaQuery: () => {},
    };
    resources.visible_ = false;
    sandbox.stub(resources.viewer_, 'getVisibilityState').returns(
      VisibilityState.PRERENDER
    );
    resources.scheduleLayoutOrPreload_(resource, true);
    expect(resources.queue_.getSize()).to.equal(0);
  });

  it('should schedule prerenderable resource when' +
        ' document is in prerender', () => {
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
      applySizesAndMediaQuery: () => {},
    };
    resources.visible_ = false;
    sandbox.stub(resources.viewer_, 'getVisibilityState').returns(
      VisibilityState.PRERENDER
    );
    resources.scheduleLayoutOrPreload_(resource, true);
    expect(resources.queue_.getSize()).to.equal(1);
    expect(resources.queue_.tasks_[0].forceOutsideViewport).to.be.false;
  });

  it('should not schedule prerenderable resource when' +
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
      applySizesAndMediaQuery: () => {},
    };
    resources.visible_ = false;
    sandbox.stub(resources.viewer_, 'getVisibilityState').returns(
      VisibilityState.HIDDEN
    );
    resources.scheduleLayoutOrPreload_(resource, true);
    expect(resources.queue_.getSize()).to.equal(0);
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
      applySizesAndMediaQuery: () => {},
    };
    resources.scheduleLayoutOrPreload_(resource, true);
    expect(resources.queue_.getSize()).to.equal(0);
  });

  it('should force schedule non-renderOutsideViewport resource when' +
        ' resource is not visible', () => {
    const resource = {
      getState: () => ResourceState.READY_FOR_LAYOUT,
      isDisplayed: () => true,
      isFixed: () => false,
      isInViewport: () => false,
      prerenderAllowed: () => true,
      renderOutsideViewport: () => false,
      getPriority: () => 1,
      startLayout: () => {},
      layoutScheduled: () => {},
      getTaskId: () => 'resource#L',
      applySizesAndMediaQuery: () => {},
    };
    resources.scheduleLayoutOrPreload_(resource, true, 0, /* force */ true);
    expect(resources.queue_.getSize()).to.equal(1);
    expect(resources.queue_.tasks_[0].forceOutsideViewport).to.be.true;
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
      applySizesAndMediaQuery: () => {},
    };
    resources.scheduleLayoutOrPreload_(resource, true);
    expect(resources.queue_.getSize()).to.equal(1);
    expect(resources.queue_.tasks_[0].forceOutsideViewport).to.be.false;
  });

  it('should require layout for non-scheduled element', () => {
    const element = createAmpElement();
    sandbox.stub(element, 'getBoundingClientRect',
        () => layoutRectLtwh(0, 0, 100, 100));
    const resource = new Resource(1, element, resources);
    const measureSpy = sandbox.spy(resource, 'measure');
    const buildSpy = sandbox.spy(resource.element, 'whenBuilt');
    const scheduleStub = sandbox.stub(resources, 'scheduleLayoutOrPreload_',
        () => resource.loadPromiseResolve_());
    const promise = resources.requireLayout(resource.element);
    return Promise.all([promise, element.whenBuilt()]).then(() => {
      expect(scheduleStub).to.be.calledOnce;
      expect(measureSpy).to.be.calledOnce;
      expect(buildSpy).to.be.calledTwice;  // 1 for scheduler + 1 for test.
    });
  });

  it('should require layout for scheduled element', () => {
    const element = createAmpElement();
    sandbox.stub(element, 'getBoundingClientRect',
        () => layoutRectLtwh(0, 0, 100, 100));
    const resource = new Resource(1, element, resources);
    resource.layoutScheduled();
    const measureSpy = sandbox.spy(resource, 'measure');
    const scheduleStub = sandbox.stub(resources, 'scheduleLayoutOrPreload_');
    const promise = resources.requireLayout(resource.element);
    resource.loadPromiseResolve_();
    return Promise.all([promise, element.whenBuilt()]).then(() => {
      expect(scheduleStub).to.not.be.called;
      expect(measureSpy).to.not.be.called;
    });
  });

  it('should not require layout for undisplayed element', () => {
    const element = createAmpElement();
    sandbox.stub(element, 'getBoundingClientRect',
        () => layoutRectLtwh(0, 0, 0, 0));
    const resource = new Resource(1, element, resources);
    const measureSpy = sandbox.spy(resource, 'measure');
    const scheduleStub = sandbox.stub(resources, 'scheduleLayoutOrPreload_');
    const promise = resources.requireLayout(resource.element);
    return promise.then(() => {
      expect(scheduleStub).to.not.be.called;
      expect(measureSpy).to.be.calledOnce;
    });
  });

  it('should not require layout for already completed element', () => {
    const element = createAmpElement();
    sandbox.stub(element, 'getBoundingClientRect',
        () => layoutRectLtwh(0, 0, 0, 0));
    const resource = new Resource(1, element, resources);
    resource.layoutComplete_(true);
    const measureSpy = sandbox.spy(resource, 'measure');
    const scheduleStub = sandbox.stub(resources, 'scheduleLayoutOrPreload_');
    const promise = resources.requireLayout(resource.element);
    return promise.then(() => {
      expect(scheduleStub).to.not.be.called;
      expect(measureSpy).to.not.be.called;
    });
  });

  it('should schedule immediately when element is built', () => {
    const parentElement = createAmpElement();
    const element = createAmpElement();
    parentElement.appendChild(element);
    sandbox.stub(element, 'getBoundingClientRect',
        () => layoutRectLtwh(0, 0, 10, 10));
    sandbox.stub(element, 'isBuilt', () => true);
    const parentResource = new Resource(1, parentElement, resources);
    const resource = new Resource(2, element, resources);
    const measureSpy = sandbox.spy(resource, 'measure');
    const scheduleStub = sandbox.stub(resources, 'scheduleLayoutOrPreload_');
    resources.scheduleLayoutOrPreloadForSubresources_(
        parentResource, true, [element]);
    expect(measureSpy).to.be.calledOnce;
    expect(scheduleStub).to.be.calledOnce;
  });

  it('should schedule after build', () => {
    const parentElement = createAmpElement();
    const element = createAmpElement();
    parentElement.appendChild(element);
    sandbox.stub(element, 'getBoundingClientRect',
        () => layoutRectLtwh(0, 0, 10, 10));
    sandbox.stub(element, 'isBuilt', () => false);
    const parentResource = new Resource(1, parentElement, resources);
    const resource = new Resource(2, element, resources);
    const measureSpy = sandbox.spy(resource, 'measure');
    const scheduleStub = sandbox.stub(resources, 'scheduleLayoutOrPreload_');
    resources.scheduleLayoutOrPreloadForSubresources_(
        parentResource, true, [element]);
    expect(measureSpy).to.not.be.called;
    expect(scheduleStub).to.not.be.called;
    resource.build();
    return element.whenBuilt().then(() => {
      expect(measureSpy).to.be.calledOnce;
      expect(scheduleStub).to.be.calledOnce;
    });
  });

  it('should update priority and schedule pass', () => {
    const element = document.createElement('div');
    element.isBuilt = () => true;
    element.getPriority = () => 2;
    const resource = new Resource(1, element, resources);
    resources.pass_.cancel();
    expect(resource.getPriority()).to.equal(2);

    resources.updatePriority(element, 1);
    expect(resource.getPriority()).to.equal(1);
    expect(resources.pass_.isPending()).to.be.true;
  });

  it('should update priority and update tasks', () => {
    resources.pass_.cancel();

    // Target element.
    const element = document.createElement('div');
    element.isBuilt = () => true;
    element.getPriority = () => 2;
    const resource = new Resource(1, element, resources);
    resources.schedule_(resource, 'L', 0, 0, () => {});
    const task = resources.queue_.tasks_[0];
    expect(task.priority).to.equal(2);

    // Another element.
    const element2 = document.createElement('div');
    element2.isBuilt = () => true;
    element2.getPriority = () => 2;
    const resource2 = new Resource(2, element2, resources);
    resources.schedule_(resource2, 'L', 0, 0, () => {});
    const task2 = resources.queue_.tasks_[1];
    expect(task2.priority).to.equal(2);

    resources.updatePriority(element, 1);
    expect(resource.getPriority()).to.equal(1);
    expect(resources.pass_.isPending()).to.be.true;
    expect(task.priority).to.equal(1);
    // The other task is not updated.
    expect(task2.priority).to.equal(2);
  });
});

describes.realWin('getElementLayoutBox', {}, env => {
  let win;
  let sandbox;
  let resources;
  let vsyncSpy;

  function addResourceForElement(id, element) {
    element.isBuilt = () => { return true; };
    element.isUpgraded = () => { return true; };
    element.isRelayoutNeeded = () => { return true; };
    element.updateLayoutBox = () => {};
    const resource = new Resource(id, element, resources);
    resource.state_ = ResourceState.LAYOUT_COMPLETE;
    resource.element['__AMP__RESOURCE'] = resource;
    return resource;
  }

  beforeEach(() => {
    win = env.win;
    sandbox = sinon.sandbox.create();
    resources = new Resources(new AmpDocSingle(window));
    resources.isRuntimeOn_ = false;
    vsyncSpy = sandbox.stub(resources.vsync_, 'run', task => {
      task.measure({});
    });
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should measure the element in a vsync measure', () => {
    const element = document.createElement('div');
    element.style.position = 'absolute';
    element.style.top = '5px';
    element.style.left = '10px';
    element.style.width = '50px';
    element.style.height = '80px';
    win.document.body.appendChild(element);

    return resources.getElementLayoutBox(element).then(box => {
      expect(vsyncSpy).to.have.been.called;
      expect(box.top).to.equal(5);
      expect(box.left).to.equal(10);
      expect(box.width).to.equal(50);
      expect(box.height).to.equal(80);
    });
  });

  it('should measure the element via its resource in a vsync measure', () => {
    const element = document.createElement('div');
    element.style.position = 'absolute';
    element.style.top = '5px';
    element.style.left = '10px';
    element.style.width = '50px';
    element.style.height = '80px';
    win.document.body.appendChild(element);

    const resource = addResourceForElement(1, element);
    expect(resource.hasBeenMeasured()).to.be.false;

    return resources.getElementLayoutBox(element).then(box => {
      expect(vsyncSpy).to.have.been.called;
      expect(box.top).to.equal(5);
      expect(box.left).to.equal(10);
      expect(box.width).to.equal(50);
      expect(box.height).to.equal(80);
      expect(resource.hasBeenMeasured()).to.be.true;
    });
  });

  it('should use the already measured value from the resource', () => {
    const element = document.createElement('div');
    element.style.position = 'absolute';
    element.style.top = '5px';
    element.style.left = '10px';
    element.style.width = '50px';
    element.style.height = '80px';
    win.document.body.appendChild(element);

    const resource = addResourceForElement(1, element);
    resource.measure();
    expect(resource.hasBeenMeasured()).to.be.true;

    return resources.getElementLayoutBox(element).then(box => {
      expect(vsyncSpy).not.to.have.been.called;
      expect(box.top).to.equal(5);
      expect(box.left).to.equal(10);
      expect(box.width).to.equal(50);
      expect(box.height).to.equal(80);
      expect(resource.hasBeenMeasured()).to.be.true;
    });
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
      hasAttribute() {
        return false;
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
      hasAttribute() {
        return false;
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
      hasAttribute: () => false,
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
      fakeComputedStyle: {
        marginTop: '0px',
        marginRight: '0px',
        marginBottom: '0px',
        marginLeft: '0px',
      },
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

    resources.win = {
      document,
      getComputedStyle: el => {
        return el.fakeComputedStyle ?
            el.fakeComputedStyle : window.getComputedStyle(el);
      },
    };

    resource1 = createResource(1, layoutRectLtwh(10, 10, 100, 100));
    resource2 = createResource(2, layoutRectLtwh(10, 1010, 100, 100));
    resources.resources_ = [resource1, resource2];
    resources.vsync_ = {
      mutate: callback => callback(),
      measurePromise: callback => Promise.resolve(callback()),
    };
  });

  afterEach(() => {
    viewportMock.verify();
    sandbox.restore();
  });

  it('should set ready-scan signal on first ready pass after amp init', () => {
    resources.isRuntimeOn_ = true;
    resources.documentReady_ = true;
    resources.firstPassAfterDocumentReady_ = true;
    sandbox.stub(resources.visibilityStateMachine_, 'setState');
    resources.doPass();
    expect(resources.ampdoc.signals().get('ready-scan')).to.be.null;
    resources.ampInitComplete();
    resources.doPass();
    resources.isRuntimeOn_ = false;
    expect(resources.ampdoc.signals().get('ready-scan')).to.be.ok;
  });

  it('should measure unbuilt elements', () => {
    resources.visible_ = true;
    sandbox.stub(resources.viewer_, 'getVisibilityState').returns(
      VisibilityState.VISIBLE
    );
    viewportMock.expects('getRect').returns(
        layoutRectLtwh(0, 0, 300, 400)).once();
    resource1.isBuilt = () => false;
    const mediaSpy = sandbox.stub(resource1.element, 'applySizesAndMediaQuery');
    expect(resource1.hasBeenMeasured()).to.be.false;
    resource1.isBuilt = () => false;

    resources.discoverWork_();

    expect(resource1.hasBeenMeasured()).to.be.true;
    expect(mediaSpy).to.be.calledOnce;
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
    resource1.hasBeenMeasured = () => true;
    resource2.hasBeenMeasured = () => true;
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
    expect(resource1MeasureStub).to.be.calledOnce;
    expect(resource1UnloadStub).to.have.not.been.called;
    expect(resource2MeasureStub).to.be.calledOnce;
    expect(resource2UnloadStub).to.have.not.been.called;

    // 2nd pass: do not remeasure anything.
    resources.discoverWork_();
    expect(resource1MeasureStub).to.be.calledOnce;
    expect(resource1UnloadStub).to.have.not.been.called;
    expect(resource2MeasureStub).to.be.calledOnce;
    expect(resource2UnloadStub).to.have.not.been.called;

    // 3rd pass: request remeasures and an unload.
    resource1.requestMeasure();
    resource2.requestMeasure();
    expect(resource1.isMeasureRequested()).to.be.true;
    expect(resource2.isMeasureRequested()).to.be.true;
    resource2.element.getBoundingClientRect =
        () => layoutRectLtwh(0, 0, 0, 0);  // Equiv to display:none.
    resources.discoverWork_();
    expect(resource1MeasureStub).to.have.callCount(2);
    expect(resource1UnloadStub).to.have.not.been.called;
    expect(resource2MeasureStub).to.have.callCount(2);
    expect(resource2UnloadStub).to.be.calledOnce;
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

  it('should schedule resource for execution', () => {
    resources.scheduleLayoutOrPreload_(resource1, true);
    expect(resources.queue_.getSize()).to.equal(1);
    expect(resources.queue_.tasks_[0].resource).to.equal(resource1);

    const measureSpy = sandbox.spy(resource1, 'measure');
    resources.work_();
    expect(resources.exec_.getSize()).to.equal(1);
    expect(measureSpy).to.be.calledOnce;
    expect(resource1.getState()).to.equal(ResourceState.LAYOUT_SCHEDULED);
  });

  it('should not schedule resource execution outside viewport', () => {
    resources.scheduleLayoutOrPreload_(resource1, true);
    expect(resources.queue_.getSize()).to.equal(1);
    expect(resources.queue_.tasks_[0].resource).to.equal(resource1);

    const measureSpy = sandbox.spy(resource1, 'measure');
    const layoutCanceledSpy = sandbox.spy(resource1, 'layoutCanceled');
    sandbox.stub(resource1, 'isInViewport', () => false);
    sandbox.stub(resource1, 'renderOutsideViewport', () => false);
    resources.work_();
    expect(resources.exec_.getSize()).to.equal(0);
    expect(measureSpy).to.be.calledOnce;
    expect(layoutCanceledSpy).to.be.calledOnce;
    expect(resource1.getState()).to.equal(ResourceState.READY_FOR_LAYOUT);
  });

  it('should force schedule resource execution outside viewport', () => {
    resources.scheduleLayoutOrPreload_(resource1, true, 0, /* force */ true);
    expect(resources.queue_.getSize()).to.equal(1);
    expect(resources.queue_.tasks_[0].resource).to.equal(resource1);

    const measureSpy = sandbox.spy(resource1, 'measure');
    sandbox.stub(resource1, 'isInViewport', () => false);
    sandbox.stub(resource1, 'renderOutsideViewport', () => false);
    resources.work_();
    expect(resources.exec_.getSize()).to.equal(1);
    expect(measureSpy).to.be.calledOnce;
    expect(resource1.getState()).to.equal(ResourceState.LAYOUT_SCHEDULED);
  });

  it('should schedule resource prerender when doc in prerender mode', () => {
    resources.scheduleLayoutOrPreload_(resource1, true);
    expect(resources.queue_.getSize()).to.equal(1);
    expect(resources.queue_.tasks_[0].resource).to.equal(resource1);

    resources.visible_ = false;
    sandbox.stub(resources.viewer_, 'getVisibilityState', () => 'prerender');
    sandbox.stub(resource1, 'isInViewport', () => true);
    sandbox.stub(resource1, 'prerenderAllowed', () => true);

    const measureSpy = sandbox.spy(resource1, 'measure');
    const layoutCanceledSpy = sandbox.spy(resource1, 'layoutCanceled');
    resources.work_();
    expect(resources.exec_.getSize()).to.equal(1);
    expect(measureSpy).to.be.calledOnce;
    expect(layoutCanceledSpy).to.not.be.called;
    expect(resource1.getState()).to.equal(ResourceState.LAYOUT_SCHEDULED);
  });

  it('should not schedule resource prerender', () => {
    resources.scheduleLayoutOrPreload_(resource1, true);
    expect(resources.queue_.getSize()).to.equal(1);
    expect(resources.queue_.tasks_[0].resource).to.equal(resource1);

    resources.visible_ = false;
    sandbox.stub(resources.viewer_, 'getVisibilityState', () => 'prerender');
    sandbox.stub(resource1, 'isInViewport', () => true);
    sandbox.stub(resource1, 'prerenderAllowed', () => false);

    const measureSpy = sandbox.spy(resource1, 'measure');
    const layoutCanceledSpy = sandbox.spy(resource1, 'layoutCanceled');
    resources.work_();
    expect(resources.exec_.getSize()).to.equal(0);
    expect(measureSpy).to.be.calledOnce;
    expect(layoutCanceledSpy).to.be.calledOnce;
    expect(resource1.getState()).to.equal(ResourceState.READY_FOR_LAYOUT);
  });

  it('should schedule resource execution when doc is hidden', () => {
    resources.scheduleLayoutOrPreload_(resource1, true);
    expect(resources.queue_.getSize()).to.equal(1);
    expect(resources.queue_.tasks_[0].resource).to.equal(resource1);

    resources.visible_ = false;
    sandbox.stub(resources.viewer_, 'getVisibilityState', () => 'hidden');
    sandbox.stub(resource1, 'isInViewport', () => true);
    sandbox.stub(resource1, 'prerenderAllowed', () => true);

    const measureSpy = sandbox.spy(resource1, 'measure');
    const layoutCanceledSpy = sandbox.spy(resource1, 'layoutCanceled');
    resources.work_();
    expect(resources.exec_.getSize()).to.equal(0);
    expect(measureSpy).to.be.calledOnce;
    expect(layoutCanceledSpy).to.be.calledOnce;
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

  it('should not grant permission to build when threshold reached', () => {
    let hasBeenVisible = false;
    sandbox.stub(resources.viewer_, 'hasBeenVisible', () => hasBeenVisible);

    for (let i = 0; i < 20; i++) {
      expect(resources.grantBuildPermission()).to.be.true;
    }
    expect(resources.grantBuildPermission()).to.be.false;
    hasBeenVisible = true;
    expect(resources.grantBuildPermission()).to.be.true;
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

  describe('getResourcesInRect', () => {

    beforeEach(() => {
      resources.isRuntimeOn_ = false;
      resources.ampdoc.signals().signal('ready-scan');
    });

    it('should wait until ready-scan', () => {
      const rect = layoutRectLtwh(0, 0, 100, 100);
      resources.ampdoc.signals().reset('ready-scan');
      expect(resource1.hasBeenMeasured()).to.be.false;
      const promise = resources.getResourcesInRect(window, rect);
      resource1.measure();
      const stub = sandbox.stub(resource1, 'measure');
      resources.ampdoc.signals().signal('ready-scan');
      return promise.then(() => {
        expect(stub).to.not.be.called;
      });
    });

    it('should measure when needed only', () => {
      const rect = layoutRectLtwh(0, 0, 100, 100);
      expect(resource1.hasBeenMeasured()).to.be.false;
      expect(resource2.hasBeenMeasured()).to.be.false;
      resource1.measure();
      const stub1 = sandbox.stub(resource1, 'measure');
      const stub2 = sandbox.stub(resource2, 'measure');
      return resources.getResourcesInRect(window, rect).then(() => {
        expect(stub1).to.not.be.called;
        expect(stub2).to.be.calledOnce;
      });
    });

    it('should measure only filtered elements', () => {
      const rect = layoutRectLtwh(0, 0, 100, 100);
      expect(resource1.hasBeenMeasured()).to.be.false;
      expect(resource2.hasBeenMeasured()).to.be.false;
      resource1.hostWin = {};
      resource2.hasOwner = () => true;
      const stub1 = sandbox.stub(resource1, 'measure');
      const stub2 = sandbox.stub(resource2, 'measure');
      return resources.getResourcesInRect(window, rect).then(() => {
        expect(stub1).to.not.be.called;
        expect(stub2).to.not.be.called;
      });
    });

    it('should resolve visible elements', () => {
      const rect = layoutRectLtwh(0, 0, 100, 1500);
      return resources.getResourcesInRect(window, rect).then(res => {
        expect(res).to.have.length(2);
        expect(res[0]).to.equal(resource1);
        expect(res[1]).to.equal(resource2);
      });
    });

    it('should ignore invisible elements', () => {
      const rect = layoutRectLtwh(0, 0, 100, 1500);
      resource2.element.getBoundingClientRect =
          () => layoutRectLtwh(0, 0, 0, 0);
      return resources.getResourcesInRect(window, rect).then(res => {
        expect(res).to.have.length(1);
        expect(res[0]).to.equal(resource1);
      });
    });

    it('should ignore out-of-rect elements', () => {
      const rect = layoutRectLtwh(0, 0, 100, 100);
      return resources.getResourcesInRect(window, rect).then(res => {
        expect(res).to.have.length(1);
        expect(res[0]).to.equal(resource1);
      });
    });

    it('should allow out-of-rect fixed elements', () => {
      const rect = layoutRectLtwh(0, 0, 100, 100);
      resource2.isFixed = () => true;
      return resources.getResourcesInRect(window, rect).then(res => {
        expect(res).to.have.length(2);
        expect(res[0]).to.equal(resource1);
        expect(res[1]).to.equal(resource2);
      });
    });

    it('should filter out elements', () => {
      const rect = layoutRectLtwh(0, 0, 100, 1500);
      resource1.hostWin = {};
      resource2.hasOwner = () => true;
      return resources.getResourcesInRect(window, rect).then(res => {
        expect(res).to.have.length(0);
      });
    });
  });
});

describes.realWin('Resources scrollHeight', {
  amp: {
    runtimeOn: true,
  },
}, env => {
  let win;
  let resources;
  let viewerSendMessageStub;

  beforeEach(() => {
    win = env.win;
    resources = win.services.resources.obj;
    viewerSendMessageStub = sandbox.stub(resources.viewer_, 'sendMessage');
    sandbox.stub(resources.vsync_, 'run', task => {
      task.measure({});
    });
  });

  it('should measure initial scrollHeight', () => {
    const scrollHeight = resources.viewport_.getScrollHeight();
    expect(resources.maybeChangeHeight_).to.equal(false);
    expect(resources.documentReady_).to.equal(true);
    expect(resources.scrollHeight_).to.equal(scrollHeight);
  });

  it('should send scrollHeight to viewer if height was changed', () => {
    sandbox.stub(resources.viewport_, 'getScrollHeight', () => {
      return 200;
    });
    resources.maybeChangeHeight_ = true;

    resources.doPass();

    expect(resources.maybeChangeHeight_).to.equal(false);
    expect(resources.scrollHeight_).to.equal(200);
    expect(viewerSendMessageStub).to.be.calledOnce;
    expect(viewerSendMessageStub).to.be.calledWith(
        'documentHeight', {height: 200}, true);
  });

  it('should not send scrollHeight to viewer if height is not changed', () => {
    const scrollHeight = resources.viewport_.getScrollHeight();
    resources.maybeChangeHeight_ = true;

    resources.doPass();

    expect(resources.maybeChangeHeight_).to.equal(false);
    expect(resources.scrollHeight_).to.equal(scrollHeight);
    expect(viewerSendMessageStub).to.not.be.called;
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
      hasAttribute: () => false,
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
      fakeComputedStyle: {
        marginTop: '0px',
        marginRight: '0px',
        marginBottom: '0px',
        marginLeft: '0px',
      },
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
    resources.win = {
      getComputedStyle: el => {
        return el.fakeComputedStyle ?
            el.fakeComputedStyle : window.getComputedStyle(el);
      },
    };
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
    resources.scheduleChangeSize_(resource1, 111, 100, undefined, false);
    resources.scheduleChangeSize_(resource2, 222, undefined, undefined, true);

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
    resources.scheduleChangeSize_(resource1, 111, undefined, undefined, false);
    expect(resources.requestsChangeSize_.length).to.equal(1);
    expect(resources.requestsChangeSize_[0].resource).to.equal(resource1);
    expect(resources.requestsChangeSize_[0].newHeight).to.equal(111);
    expect(resources.requestsChangeSize_[0].newWidth).to.be.undefined;
    expect(resources.requestsChangeSize_[0].newMargins).to.be.undefined;
    expect(resources.requestsChangeSize_[0].force).to.equal(false);
  });

  it('should remove request change size for unloaded resources', () => {
    resources.scheduleChangeSize_(resource1, 111, undefined, undefined, false);
    resources.scheduleChangeSize_(resource2, 111, undefined, undefined, false);
    expect(resources.requestsChangeSize_.length).to.equal(2);
    resource1.unload();
    resources.cleanupTasks_(resource1);
    expect(resources.requestsChangeSize_.length).to.equal(1);
    expect(resources.requestsChangeSize_[0].resource).to.equal(resource2);
  });

  it('should schedule width only size change', () => {
    resources.scheduleChangeSize_(resource1, undefined, 111, undefined, false);
    expect(resources.requestsChangeSize_.length).to.equal(1);
    expect(resources.requestsChangeSize_[0].resource).to.equal(resource1);
    expect(resources.requestsChangeSize_[0].newWidth).to.equal(111);
    expect(resources.requestsChangeSize_[0].newHeight).to.be.undefined;
    expect(resources.requestsChangeSize_[0].marginChange).to.be.undefined;
    expect(resources.requestsChangeSize_[0].force).to.equal(false);
  });

  it('should schedule margin only size change', () => {
    resources.scheduleChangeSize_(resource1, undefined, undefined,
        {top: 1, right: 2, bottom: 3, left: 4}, false);
    resources.vsync_.runScheduledTasks_();
    expect(resources.requestsChangeSize_.length).to.equal(1);
    expect(resources.requestsChangeSize_[0].resource).to.equal(resource1);
    expect(resources.requestsChangeSize_[0].newWidth).to.be.undefined;
    expect(resources.requestsChangeSize_[0].newHeight).to.be.undefined;
    expect(resources.requestsChangeSize_[0].marginChange).to.eql({
      newMargins: {top: 1, right: 2, bottom: 3, left: 4},
      currentMargins: {top: 0, right: 0, bottom: 0, left: 0},
    });
    expect(resources.requestsChangeSize_[0].force).to.equal(false);
  });

  it('should only schedule latest request for the same resource', () => {
    resources.scheduleChangeSize_(resource1, 111, 100, undefined, true);
    resources.scheduleChangeSize_(resource1, 222, 300, undefined, false);

    expect(resources.requestsChangeSize_.length).to.equal(1);
    expect(resources.requestsChangeSize_[0].resource).to.equal(resource1);
    expect(resources.requestsChangeSize_[0].newHeight).to.equal(222);
    expect(resources.requestsChangeSize_[0].newWidth).to.equal(300);
    expect(resources.requestsChangeSize_[0].force).to.equal(true);
  });

  it('should NOT change size if it didn\'t change', () => {
    resources.scheduleChangeSize_(resource1, 100, 100, undefined, true);
    resources.mutateWork_();
    expect(resources.relayoutTop_).to.equal(-1);
    expect(resources.requestsChangeSize_.length).to.equal(0);
    expect(resource1.changeSize).to.have.not.been.called;
  });

  it('should change size', () => {
    resources.scheduleChangeSize_(resource1, 111, 222, undefined, true);
    resources.mutateWork_();
    expect(resources.relayoutTop_).to.equal(resource1.layoutBox_.top);
    expect(resources.requestsChangeSize_.length).to.equal(0);
    expect(resource1.changeSize).to.be.calledOnce;
    expect(resource1.changeSize.firstCall.args[0]).to.equal(111);
    expect(resource1.changeSize.firstCall.args[1]).to.equal(222);
  });

  it('should pick the smallest relayoutTop', () => {
    resources.scheduleChangeSize_(resource2, 111, 222, undefined, true);
    resources.scheduleChangeSize_(resource1, 111, 222, undefined, true);
    resources.mutateWork_();
    expect(resources.relayoutTop_).to.equal(resource1.layoutBox_.top);
  });

  it('should measure non-measured elements', () => {
    resource1.initialLayoutBox_ = null;
    resource1.measure = sandbox.spy();
    resource2.measure = sandbox.spy();

    resources.scheduleChangeSize_(resource1, 111, 200, undefined, true);
    resources.scheduleChangeSize_(resource2, 111, 222, undefined, true);
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
    let viewportRect;

    beforeEach(() => {
      overflowCallbackSpy = sandbox.spy();
      resource1.element.overflowCallback = overflowCallbackSpy;

      viewportRect = {top: 2, left: 0, right: 100, bottom: 200, height: 200};
      viewportMock.expects('getRect').returns(viewportRect).atLeast(1);
      viewportMock.expects('getScrollHeight').returns(10000).atLeast(1);
      resource1.layoutBox_ = {top: 10, left: 0, right: 100, bottom: 50,
        height: 50};
      vsyncSpy = sandbox.stub(resources.vsync_, 'run');
      resources.visible_ = true;
    });

    it('should NOT change size when height is unchanged', () => {
      const callback = sandbox.spy();
      resource1.layoutBox_ = {top: 10, left: 0, right: 100, bottom: 210,
        height: 50};
      resources.scheduleChangeSize_(resource1, 50, /* width */ undefined,
          undefined, false, callback);
      resources.mutateWork_();
      expect(resource1.changeSize).to.not.been.called;
      expect(overflowCallbackSpy).to.not.been.called;
      expect(callback).to.be.calledOnce;
      expect(callback.args[0][0]).to.be.true;
    });

    it('should NOT change size when height and margins are unchanged', () => {
      const callback = sandbox.spy();
      resource1.layoutBox_ = {top: 10, left: 0, right: 100, bottom: 210,
        height: 50};
      resource1.element.fakeComputedStyle = {
        marginTop: '1px',
        marginRight: '2px',
        marginBottom: '3px',
        marginLeft: '4px',
      };
      resources.scheduleChangeSize_(resource1, 50, /* width */ undefined,
          {top: 1, right: 2, bottom: 3, left: 4}, false, callback);

      expect(vsyncSpy).to.be.calledOnce;
      const task = vsyncSpy.lastCall.args[0];
      task.measure({});

      resources.mutateWork_();
      expect(resource1.changeSize).to.not.been.called;
      expect(overflowCallbackSpy).to.not.been.called;
      expect(callback).to.be.calledOnce;
      expect(callback.args[0][0]).to.be.true;
    });

    it('should change size when margins but not height changed', () => {
      const callback = sandbox.spy();
      resource1.layoutBox_ = {top: 10, left: 0, right: 100, bottom: 210,
        height: 50};
      resource1.element.fakeComputedStyle = {
        marginTop: '1px',
        marginRight: '2px',
        marginBottom: '3px',
        marginLeft: '4px',
      };
      resources.scheduleChangeSize_(resource1, 50, /* width */ undefined,
          {top: 1, right: 2, bottom: 4, left: 4}, false, callback);

      expect(vsyncSpy).to.be.calledOnce;
      const task = vsyncSpy.lastCall.args[0];
      task.measure({});

      resources.mutateWork_();
      expect(resource1.changeSize).to.be.calledOnce;
    });

    it('should change size when forced', () => {
      resources.scheduleChangeSize_(resource1, 111, 222, undefined, true);
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
      resources.scheduleChangeSize_(resource1, 111, 222, undefined, false);
      resources.mutateWork_();
      expect(resources.requestsChangeSize_).to.be.empty;
      expect(resource1.changeSize).to.be.calledOnce;
      expect(overflowCallbackSpy).to.be.calledOnce;
      expect(overflowCallbackSpy.firstCall.args[0]).to.equal(false);
    });

    it('should change size when active', () => {
      resource1.element.contains = () => true;
      resources.scheduleChangeSize_(resource1, 111, 222, undefined, false);
      resources.mutateWork_();
      expect(resources.requestsChangeSize_).to.be.empty;
      expect(resource1.changeSize).to.be.calledOnce;
      expect(overflowCallbackSpy).to.be.calledOnce;
      expect(overflowCallbackSpy.firstCall.args[0]).to.equal(false);
    });

    it('should change size when below the viewport', () => {
      resource1.layoutBox_ = {top: 10, left: 0, right: 100, bottom: 1050,
        height: 50};
      resources.scheduleChangeSize_(resource1, 111, 222, undefined, false);
      resources.mutateWork_();
      expect(resources.requestsChangeSize_).to.be.empty;
      expect(resource1.changeSize).to.be.calledOnce;
      expect(overflowCallbackSpy).to.be.calledOnce;
      expect(overflowCallbackSpy.firstCall.args[0]).to.equal(false);
    });

    it('should change size when below the viewport and top margin also changed',
        () => {
          resource1.layoutBox_ = {top: 200, left: 0, right: 100, bottom: 300,
            height: 100};
          resources.scheduleChangeSize_(resource1, 111, 222, {top: 20}, false);

          expect(vsyncSpy).to.be.calledOnce;
          const marginsTask = vsyncSpy.lastCall.args[0];
          marginsTask.measure({});

          resources.mutateWork_();
          expect(resources.requestsChangeSize_).to.be.empty;
          expect(resource1.changeSize).to.be.calledOnce;
          expect(overflowCallbackSpy).to.be.calledOnce;
          expect(overflowCallbackSpy.firstCall.args[0]).to.equal(false);
        });

    it('should change size when box top below the viewport but top margin ' +
        'boundary is above viewport but top margin in unchanged', () => {
      resource1.layoutBox_ = {top: 200, left: 0, right: 100, bottom: 300,
        height: 100};
      resource1.element.fakeComputedStyle = {
        marginTop: '100px',
        marginRight: '0px',
        marginBottom: '0px',
        marginLeft: '0px',
      };
      resources.scheduleChangeSize_(resource1, 111, 222, {top: 100}, false);

      expect(vsyncSpy).to.be.calledOnce;
      const marginsTask = vsyncSpy.lastCall.args[0];
      marginsTask.measure({});

      resources.mutateWork_();
      expect(resources.requestsChangeSize_).to.be.empty;
      expect(resource1.changeSize).to.be.calledOnce;
      expect(overflowCallbackSpy).to.be.calledOnce;
      expect(overflowCallbackSpy.firstCall.args[0]).to.equal(false);
    });

    it('should NOT change size when top margin boundary within viewport ' +
        'and top margin changed', () => {
      const callback = sandbox.spy();
      resource1.layoutBox_ = {top: 100, left: 0, right: 100, bottom: 300,
        height: 200};
      resources.scheduleChangeSize_(
          resource1, 111, 222, {top: 20}, false, callback);

      expect(vsyncSpy).to.be.calledOnce;
      const task = vsyncSpy.lastCall.args[0];
      task.measure({});

      resources.mutateWork_();
      expect(resource1.changeSize).to.not.been.called;
      expect(overflowCallbackSpy).to.not.been.called;
      expect(callback).to.be.calledOnce;
      expect(callback.args[0][0]).to.be.false;
    });

    it('should defer when above the viewport and scrolling on', () => {
      resource1.layoutBox_ = {top: -1200, left: 0, right: 100, bottom: -1050,
        height: 50};
      resources.lastVelocity_ = 10;
      resources.lastScrollTime_ = Date.now();
      resources.scheduleChangeSize_(resource1, 111, 222, undefined, false);
      resources.mutateWork_();
      expect(resources.requestsChangeSize_.length).to.equal(1);
      expect(resource1.changeSize).to.not.been.called;
      expect(overflowCallbackSpy).to.not.been.called;
    });

    it('should defer change size if just inside viewport and viewport ' +
        'scrolled by user.', () => {
      viewportRect.top = 2;
      resource1.layoutBox_ = {top: -50, left: 0, right: 100, bottom: 1,
        height: 51};
      resources.lastVelocity_ = 10;
      resources.lastScrollTime_ = Date.now();
      resources.scheduleChangeSize_(resource1, 111, 222, false);
      resources.mutateWork_();
      expect(resources.requestsChangeSize_.length).to.equal(1);
      expect(resource1.changeSize).to.not.been.called;
      expect(overflowCallbackSpy).to.not.been.called;
    });

    it('should NOT change size and call overflow callback if viewport not ' +
        'scrolled by user.', () => {
      viewportRect.top = 1;
      resource1.layoutBox_ = {top: -50, left: 0, right: 100, bottom: 0,
        height: 51};
      resources.lastVelocity_ = 10;
      resources.lastScrollTime_ = Date.now();
      resources.scheduleChangeSize_(resource1, 111, 222, false);
      resources.mutateWork_();
      expect(resources.requestsChangeSize_.length).to.equal(0);
      expect(resource1.changeSize).to.not.been.called;
      expect(overflowCallbackSpy).to.be.calledOnce;
      expect(overflowCallbackSpy).to.be.calledWith(true, 111, 222);
    });

    it('should change size when above the vp and adjust scrolling', () => {
      viewportMock.expects('getScrollHeight').returns(2999).once();
      viewportMock.expects('getScrollTop').returns(1777).once();
      resource1.layoutBox_ = {top: -1200, left: 0, right: 100, bottom: -1050,
        height: 50};
      resources.lastVelocity_ = 0;
      clock.tick(5000);
      resources.scheduleChangeSize_(resource1, 111, 222, undefined, false);
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

    it('should NOT resize when above vp but cannot adjust scrolling', () => {
      resource1.layoutBox_ = {top: -1200, left: 0, right: 100, bottom: -1100,
        height: 100};
      resources.lastVelocity_ = 0;
      clock.tick(5000);
      resources.scheduleChangeSize_(resource1, 0, 222, undefined, false);
      expect(vsyncSpy).to.be.calledOnce;
      vsyncSpy.reset();
      resources.mutateWork_();

      expect(resources.requestsChangeSize_).to.be.empty;
      expect(resource1.changeSize).to.not.be.called;
      expect(vsyncSpy).to.not.be.called;
    });

    it('should resize if multi request above vp can adjust scroll', () => {
      resource1.layoutBox_ = {top: -1200, left: 0, right: 100, bottom: -1100,
        height: 100};
      resource2.layoutBox_ = {top: -1300, left: 0, right: 100, bottom: -1200,
        height: 100};
      resources.lastVelocity_ = 0;
      clock.tick(5000);
      resources.scheduleChangeSize_(resource2, 200, 222, undefined, false);
      resources.scheduleChangeSize_(resource1, 0, 222, undefined, false);
      resources.mutateWork_();

      const task = vsyncSpy.lastCall.args[0];
      const state = {};
      task.mutate(state);

      expect(resource1.changeSize).to.be.calledOnce;
      expect(resource2.changeSize).to.be.calledOnce;
    });

    it('should NOT resize if multi req above vp cannot adjust scroll', () => {
      // Only to satisfy expectation in beforeEach
      resources.viewport_.getRect();

      viewportMock.expects('getRect').returns({
        top: 10, left: 0, right: 100, bottom: 210, height: 200,
      }).once();
      resource1.layoutBox_ = {top: -1200, left: 0, right: 100, bottom: -1100,
        height: 100};
      resource2.layoutBox_ = {top: -1300, left: 0, right: 100, bottom: -1200,
        height: 100};
      resources.lastVelocity_ = 0;
      clock.tick(5000);
      resources.scheduleChangeSize_(resource1, 92, 222, undefined, false);
      resources.scheduleChangeSize_(resource2, 92, 222, undefined, false);
      resources.mutateWork_();
      const task = vsyncSpy.lastCall.args[0];
      const state = {};
      task.mutate(state);
      expect(resource1.changeSize).to.be.calledOnce;
      expect(resource2.changeSize).to.not.be.called;
    });

    it('should NOT adjust scrolling if height not change above vp', () => {
      viewportMock.expects('getScrollHeight').returns(2999).once();
      viewportMock.expects('getScrollTop').returns(1777).once();
      resource1.layoutBox_ = {top: -1200, left: 0, right: 100, bottom: -1050,
        height: 50};
      resources.lastVelocity_ = 0;
      clock.tick(5000);
      resources.scheduleChangeSize_(resource1, 111, 222, undefined, false);
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

    it('should adjust scrolling if height change above vp', () => {
      viewportMock.expects('getScrollHeight').returns(2999).once();
      viewportMock.expects('getScrollTop').returns(1000).once();
      resource1.layoutBox_ = {top: -1200, left: 0, right: 100, bottom: -1050,
        height: 50};
      resources.lastVelocity_ = 0;
      clock.tick(5000);
      resources.scheduleChangeSize_(resource1, 111, 222, undefined, false);
      resources.mutateWork_();
      const task = vsyncSpy.lastCall.args[0];
      const state = {};
      task.measure(state);
      viewportMock.expects('getScrollHeight').returns(2000).once();
      viewportMock.expects('setScrollTop').withExactArgs(1).once();
      task.mutate(state);
    });

    it('in vp should NOT call overflowCallback if new height smaller', () => {
      resources.scheduleChangeSize_(resource1, 10, 11, undefined, false);
      resources.mutateWork_();
      expect(resources.requestsChangeSize_).to.be.empty;
      expect(resource1.changeSize).to.not.been.called;
      expect(overflowCallbackSpy).to.not.been.called;
    });

    it('in viewport should NOT change size and calls overflowCallback', () => {
      resources.scheduleChangeSize_(resource1, 111, 222,
          {top: 1, right: 2, bottom: 3, left: 4}, false);

      expect(vsyncSpy).to.be.calledOnce;
      const task = vsyncSpy.lastCall.args[0];
      task.measure({});

      resources.mutateWork_();
      expect(resources.requestsChangeSize_.length).to.equal(0);
      expect(resource1.changeSize).to.not.been.called;
      expect(overflowCallbackSpy).to.be.calledOnce;
      expect(overflowCallbackSpy).to.be.calledWith(true, 111, 222,
          {top: 1, right: 2, bottom: 3, left: 4});
      expect(resource1.getPendingChangeSize()).to.jsonEqual(
        {height: 111, width: 222,
          margins: {top: 1, right: 2, bottom: 3, left: 4}});
    });

    it('should NOT change size when resized margin in viewport and should ' +
        'call overflowCallback', () => {
      resource1.layoutBox_ = {top: -48, left: 0, right: 100, bottom: 2,
        height: 50};
      resource1.element.fakeComputedStyle = {
        marginBottom: '21px',
      };

      resources.scheduleChangeSize_(resource1, undefined, undefined,
          {bottom: 22}, false);

      expect(vsyncSpy).to.be.calledOnce;
      const task = vsyncSpy.lastCall.args[0];
      task.measure({});

      resources.mutateWork_();
      expect(resources.requestsChangeSize_.length).to.equal(0);
      expect(resource1.changeSize).to.not.been.called;
      expect(overflowCallbackSpy).to.be.calledOnce;
      expect(overflowCallbackSpy).to.be.calledWith(true, undefined,
          undefined, {bottom: 22});
      expect(resource1.getPendingChangeSize()).to.jsonEqual(
          {height: undefined, width: undefined, margins: {bottom: 22}});
    });

    it('should change size when resized margin above viewport', () => {
      resource1.layoutBox_ = {top: -49, left: 0, right: 100, bottom: 1,
        height: 50};
      resource1.element.fakeComputedStyle = {
        marginBottom: '21px',
      };
      viewportMock.expects('getScrollHeight').returns(2999).once();
      viewportMock.expects('getScrollTop').returns(1777).once();

      resources.lastVelocity_ = 0;
      clock.tick(5000);
      resources.scheduleChangeSize_(resource1, undefined, undefined,
          {top: 1}, false);

      expect(vsyncSpy).to.be.calledOnce;
      const marginsTask = vsyncSpy.lastCall.args[0];
      marginsTask.measure({});

      resources.mutateWork_();
      expect(resources.requestsChangeSize_).to.be.empty;
      expect(resource1.changeSize).to.not.been.called;

      expect(vsyncSpy.callCount).to.be.greaterThan(2);
      const scrollAdjustTask = vsyncSpy.lastCall.args[0];
      const state = {};
      scrollAdjustTask.measure(state);
      expect(state.scrollTop).to.equal(1777);
      expect(state.scrollHeight).to.equal(2999);

      viewportMock.expects('getScrollHeight').returns(3999).once();
      viewportMock.expects('setScrollTop').withExactArgs(2777).once();
      scrollAdjustTask.mutate(state);
      expect(resource1.changeSize).to.be.calledOnce;
      expect(resource1.changeSize).to.be.calledWith(undefined, undefined,
          {top: 1});
      expect(resources.relayoutTop_).to.equal(resource1.layoutBox_.top);
    });

    it('should reset pending change size when rescheduling', () => {
      resources.scheduleChangeSize_(resource1, 111, 222, undefined, false);
      resources.mutateWork_();
      expect(resource1.getPendingChangeSize().height).to.equal(111);
      expect(resource1.getPendingChangeSize().width).to.equal(222);

      resources.scheduleChangeSize_(resource1, 112, 223, undefined, false);
      expect(resource1.getPendingChangeSize()).to.be.undefined;
    });

    it('should force resize after focus', () => {
      resources.scheduleChangeSize_(resource1, 111, 222, undefined, false);
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
      resources.scheduleChangeSize_(resource1, 111, 222, undefined, false);
      resources.mutateWork_();
      expect(resource1.changeSize).to.not.been.called;
    });

    it('should change size when close to the bottom of the document', () => {
      viewportMock.expects('getScrollHeight').returns(110).once();
      resources.scheduleChangeSize_(resource1, 111, 222, undefined, false);
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
        contains: className => isAmp && className == 'i-amphtml-element',
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
      hasAttribute: () => null,
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
      run: task => {
        const state = {};
        if (task.measure) {
          task.measure(state);
        }
        if (task.mutate) {
          task.mutate(state);
        }
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
      if (className == 'i-amphtml-element') {
        return [resource1.element];
      }
    };
    parent2.getElementsByClassName = className => {
      if (className == 'i-amphtml-element') {
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
      expect(mutateSpy).to.be.calledOnce;
      expect(resource1RequestMeasureStub).to.be.calledOnce;
      expect(resource2RequestMeasureStub).to.have.not.been.called;
      expect(relayoutTopStub).to.be.calledOnce;
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
      expect(mutateSpy).to.be.calledOnce;
      expect(resource1RequestMeasureStub).to.be.calledOnce;
      expect(resource2RequestMeasureStub).to.have.not.been.called;
      expect(relayoutTopStub).to.be.calledOnce;
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
      expect(mutateSpy).to.be.calledOnce;
      expect(resource1RequestMeasureStub).to.be.calledOnce;
      expect(resource2RequestMeasureStub).to.have.not.been.called;
      expect(relayoutTopStub).to.be.calledOnce;
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
      expect(mutateSpy).to.be.calledOnce;
      expect(resource1RequestMeasureStub).to.be.calledOnce;
      expect(resource2RequestMeasureStub).to.have.not.been.called;
      expect(relayoutTopStub).to.have.callCount(2);
      expect(relayoutTopStub.getCall(0).args[0]).to.equal(10);
      expect(relayoutTopStub.getCall(1).args[0]).to.equal(1010);
    });
  });

  it('attemptCollapse should not call attemptChangeSize', () => {
    // This test ensure that #attemptCollapse won't do any optimization or
    // refactor by calling attemptChangeSize.
    // This to support collapsing element above viewport
    // When attemptChangeSize succeed, resources manager will measure the new
    // scrollHeight, and we need to make sure the newScrollHeight is measured
    // after setting element display:none
    sandbox.stub(resources.viewport_, 'getRect', () => {
      return {
        top: 1500,
        bottom: 1800,
        left: 0,
        right: 500,
        width: 500,
        height: 300,
      };
    });
    let promiseResolve = null;
    const promise = new Promise(resolve => {
      promiseResolve = resolve;
    });
    let index = 0;
    sandbox.stub(resources.viewport_, 'getScrollHeight', () => {
      // In change element size above viewport path, getScrollHeight will be
      // called three times. And we care that the last measurement is correct,
      // which requires it to be measured after element dispaly set to none.
      if (index == 2) {
        expect(resource1.completeCollapse).to.be.calledOnce;
        promiseResolve();
        return;
      }
      expect(resource1.completeCollapse).to.not.been.called;
      index++;
    });

    resource1.layoutBox_ = {top: 1000, left: 0, right: 100, bottom: 1050,
      height: 50};
    resources.lastVelocity_ = 0;
    resources.attemptCollapse(resource1.element);
    resources.mutateWork_();
    return promise;
  });

  it('attemptCollapse should complete collapse if resize succeed', () => {
    sandbox.stub(resources, 'scheduleChangeSize_', (resource, newHeight,
        newWidth, newMargins, force, callback) => {
      callback(true);
    });
    resources.attemptCollapse(resource1.element);
    expect(resource1.completeCollapse).to.be.calledOnce;
  });

  it('attemptCollapse should NOT complete collapse if resize fail', () => {
    sandbox.stub(resources, 'scheduleChangeSize_', (resource, newHeight,
        newWidth, newMargins, force, callback) => {
      callback(false);
    });
    resources.attemptCollapse(resource1.element);
    expect(resource1.completeCollapse).to.not.been.called;
  });

  it('should complete collapse and trigger relayout', () => {
    const oldTop = resource1.getLayoutBox().top;
    resources.collapseElement(resource1.element);
    expect(resource1.completeCollapse).to.be.calledOnce;
    expect(relayoutTopStub).to.be.calledOnce;
    expect(relayoutTopStub.args[0][0]).to.equal(oldTop);
  });

  it('should ignore relayout on an already collapsed element', () => {
    resource1.layoutBox_.width = 0;
    resource1.layoutBox_.height = 0;
    resources.collapseElement(resource1.element);
    expect(resource1.completeCollapse).to.be.calledOnce;
    expect(relayoutTopStub).to.have.not.been.called;
  });
});


describe('Resources.add/upgrade/remove', () => {
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
      hasAttribute() {
        return false;
      },
      isBuilt() {
        return true;
      },
      isUpgraded() {
        return true;
      },
      reconstructWhenReparented() {
        return true;
      },
      pauseCallback() {},
      resumeCallback() {},
      dispatchCustomEvent() {},
      applySizesAndMediaQuery() {},
      updateLayoutBox() {},
      getBoundingClientRect() {
        return layoutRectLtwh(0, 0, 0, 0);
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
    resources.upgraded(child1);
    expect(child1.build.called).to.be.false;
    resources.documentReady_ = true;
    resources.add(child2);
    resources.upgraded(child2);
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
    resources.upgraded(child1);
    expect(child1BuildSpy.calledOnce).to.be.true;
    expect(schedulePassStub).to.not.be.called;
  });

  it('should add element to pending build when document is not ready', () => {
    child1.isBuilt = () => false;
    child2.isBuilt = () => false;
    resources.buildReadyResources_ = sandbox.spy();
    resources.documentReady_ = false;
    resources.add(child1);
    resources.upgraded(child1);
    expect(child1.build.called).to.be.false;
    expect(resources.pendingBuildResources_.length).to.be.equal(1);
    resources.add(child2);
    resources.upgraded(child2);
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

    it('should NOT build past the root node when pending', () => {
      sandbox.stub(resources, 'schedulePass');
      resources.documentReady_ = false;
      resources.pendingBuildResources_ = [resource1];
      resources.buildReadyResources_();
      expect(child1.build.called).to.be.false;
      expect(resources.pendingBuildResources_.length).to.be.equal(1);
      expect(resources.schedulePass.called).to.be.false;

      child1.parentNode = parent;
      parent.nextSibling = true;
      sandbox.stub(resources.ampdoc, 'getRootNode', () => parent);
      resources.buildReadyResources_();
      expect(child1.build.called).to.be.false;
      expect(resources.pendingBuildResources_.length).to.be.equal(1);
      expect(resources.schedulePass.called).to.be.false;
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

  describe('remove', () => {
    it('should remove resource and pause', () => {
      child1.isBuilt = () => true;
      resources.add(child1);
      const resource = child1['__AMP__RESOURCE'];
      const pauseOnRemoveStub = sandbox.stub(resource, 'pauseOnRemove');
      const disconnectStub = sandbox.stub(resource, 'disconnect');
      resources.remove(child1);
      expect(resources.resources_.indexOf(resource)).to.equal(-1);
      expect(pauseOnRemoveStub).to.be.calledOnce;
      expect(disconnectStub).to.not.be.called;
    });

    it('should disconnect resource when embed is destroyed', () => {
      child1.isBuilt = () => true;
      resources.add(child1);
      const resource = child1['__AMP__RESOURCE'];
      const pauseOnRemoveStub = sandbox.stub(resource, 'pauseOnRemove');
      const disconnectStub = sandbox.stub(resource, 'disconnect');
      const childWin = {};
      resource.hostWin = childWin;
      resources.removeForChildWindow(childWin);
      expect(resources.resources_.indexOf(resource)).to.equal(-1);
      expect(pauseOnRemoveStub).to.be.calledOnce;
      expect(disconnectStub).to.be.called;
    });
  });

  describe('reparent', () => {
    let scheduleBuildStub;
    let resource;

    beforeEach(() => {
      scheduleBuildStub = sandbox.stub(
          resources, 'buildOrScheduleBuildForResource_');
      child1.isBuilt = () => true;
      resources.add(child1);
      resources.upgraded(child1);
      resource = Resource.forElementOptional(child1);
      resources.remove(child1);
    });

    it('should keep reference to the resource', () => {
      expect(resource).to.not.be.null;
      expect(Resource.forElementOptional(child1)).to.equal(resource);
      expect(resources.resources_).to.not.contain(resource);
      expect(scheduleBuildStub).to.be.calledOnce;
      expect(resource.isMeasureRequested()).to.be.false;
    });
  });
});
