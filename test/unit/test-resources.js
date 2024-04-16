import * as fakeTimers from '@sinonjs/fake-timers';

import {VisibilityState_Enum} from '#core/constants/visibility-state';
import {Signals} from '#core/data-structures/signals';
import {LayoutPriority_Enum} from '#core/dom/layout';
import {layoutRectLtwh} from '#core/dom/layout/rect';

import {Services} from '#service';
import {AmpDocSingle} from '#service/ampdoc-impl';
import {Resource, ResourceState_Enum} from '#service/resource';
import {ResourcesImpl} from '#service/resources-impl';

import {loadPromise} from '#utils/event-helper';

/*eslint "local/camelcase": 0*/
describes.realWin('Resources', {amp: true}, (env) => {
  let window, document;
  let clock;
  let resources;

  beforeEach(() => {
    window = env.win;
    document = window.document;
    delete window.requestIdleCallback;
    delete window.cancelIdleCallback;
    clock = fakeTimers.withGlobal(window).install();
    resources = new ResourcesImpl(new AmpDocSingle(window));
    resources.isRuntimeOn_ = false;
  });

  afterEach(() => {
    resources.pass_.cancel();
  });

  function createResource(opts) {
    const {
      id,
      idleRenderOutsideViewport,
      isBuilding,
      isBuilt,
      isDisplayed,
      isFixed,
      isInViewport,
      layoutPriority,
      prerenderAllowed,
      previewAllowed,
      renderOutsideViewport,
      state,
      taskId,
    } = {
      id: '1',
      isBuilt: false,
      isBuilding: false,
      state: ResourceState_Enum.NOT_BUILT,
      isDisplayed: true,
      isFixed: false,
      isInViewport: true,
      prerenderAllowed: false,
      previewAllowed: false,
      renderOutsideViewport: false,
      idleRenderOutsideViewport: false,
      layoutPriority: LayoutPriority_Enum.CONTENT,
      taskId: 'resource#P',
      ...opts,
    };

    const element = document.createElement('amp-el');
    element.R1 = () => false;
    element.isBuilt = () => isBuilt;
    element.isBuilding = () => isBuilding;
    element.pause = () => {};
    element.unmount = () => {};

    const resource = new Resource(id, element, resources);
    env.sandbox.stub(resource, 'getState').returns(state);
    env.sandbox.stub(resource, 'isDisplayed').returns(isDisplayed);
    env.sandbox.stub(resource, 'isFixed').returns(isFixed);
    env.sandbox.stub(resource, 'isInViewport').returns(isInViewport);
    env.sandbox.stub(resource, 'prerenderAllowed').returns(prerenderAllowed);
    env.sandbox.stub(resource, 'previewAllowed').returns(previewAllowed);
    env.sandbox
      .stub(resource, 'renderOutsideViewport')
      .returns(renderOutsideViewport);
    env.sandbox
      .stub(resource, 'idleRenderOutsideViewport')
      .returns(idleRenderOutsideViewport);
    env.sandbox.stub(resource, 'getLayoutPriority').returns(layoutPriority);
    env.sandbox.stub(resource, 'getTaskId').returns(taskId);

    env.sandbox.stub(resource, 'layoutScheduled');
    env.sandbox.stub(resource, 'startLayout');

    return resource;
  }

  it('should calculate correct calcTaskScore', () => {
    const viewportRect = layoutRectLtwh(0, 100, 300, 400);
    env.sandbox.stub(resources.viewport_, 'getRect').returns(viewportRect);

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

  it(
    'should not schedule non-prerenderable resource when' +
      ' document is in prerender',
    () => {
      const resource = createResource({
        state: ResourceState_Enum.READY_FOR_LAYOUT,
      });
      resources.visible_ = false;
      env.sandbox
        .stub(resources.ampdoc, 'getVisibilityState')
        .returns(VisibilityState_Enum.PRERENDER);
      resources.scheduleLayoutOrPreload(resource, true);
      expect(resources.queue_.getSize()).to.equal(0);
    }
  );

  it(
    'should not schedule non-previewable resource when' +
      ' document is in preview',
    () => {
      const resource = createResource({
        state: ResourceState_Enum.READY_FOR_LAYOUT,
      });
      resources.visible_ = false;
      env.sandbox
        .stub(resources.ampdoc, 'getVisibilityState')
        .returns(VisibilityState_Enum.PREVIEW);
      resources.scheduleLayoutOrPreload(resource, true);
      expect(resources.queue_.getSize()).to.equal(0);
    }
  );

  it('should schedule previewable resource when document is in preview', () => {
    const resource = createResource({
      state: ResourceState_Enum.READY_FOR_LAYOUT,
      previewAllowed: true,
      renderOutsideViewport: true,
      layoutPriority: LayoutPriority_Enum.METADATA,
    });
    resources.visible_ = false;
    env.sandbox
      .stub(resources.ampdoc, 'getVisibilityState')
      .returns(VisibilityState_Enum.PREVIEW);
    resources.scheduleLayoutOrPreload(resource, true);
    expect(resources.queue_.getSize()).to.equal(1);
    expect(resources.queue_.tasks_[0].forceOutsideViewport).to.be.false;
  });

  it('should not schedule previewable resource when document is hidden', () => {
    const resource = createResource({
      state: ResourceState_Enum.READY_FOR_LAYOUT,
      previewAllowed: true,
      renderOutsideViewport: true,
      layoutPriority: LayoutPriority_Enum.METADATA,
    });
    resources.visible_ = false;
    env.sandbox
      .stub(resources.ampdoc, 'getVisibilityState')
      .returns(VisibilityState_Enum.HIDDEN);
    resources.scheduleLayoutOrPreload(resource, true);
    expect(resources.queue_.getSize()).to.equal(0);
  });

  it(
    'should not schedule non-renderOutsideViewport resource when' +
      ' resource is not visible',
    () => {
      const resource = createResource({
        state: ResourceState_Enum.READY_FOR_LAYOUT,
        isInViewport: false,
        prerenderAllowed: true,
      });
      resources.scheduleLayoutOrPreload(resource, true);
      expect(resources.queue_.getSize()).to.equal(0);
    }
  );

  it(
    'should force schedule non-renderOutsideViewport resource when' +
      ' resource is not visible',
    () => {
      const resource = createResource({
        state: ResourceState_Enum.READY_FOR_LAYOUT,
        isInViewport: false,
        prerenderAllowed: true,
        layoutPriority: LayoutPriority_Enum.METADATA,
        taskId: 'resource#L',
      });
      resources.scheduleLayoutOrPreload(
        resource,
        true,
        0,
        /* ignoreQuota */ true
      );
      expect(resources.queue_.getSize()).to.equal(1);
      expect(resources.queue_.tasks_[0].forceOutsideViewport).to.be.true;
    }
  );

  it(
    'should schedule renderOutsideViewport resource when' +
      ' resource is not visible',
    () => {
      const resource = createResource({
        state: ResourceState_Enum.READY_FOR_LAYOUT,
        prerenderAllowed: true,
        renderOutsideViewport: true,
        layoutPriority: LayoutPriority_Enum.METADATA,
        taskId: 'resource#L',
      });
      resources.scheduleLayoutOrPreload(resource, true);
      expect(resources.queue_.getSize()).to.equal(1);
      expect(resources.queue_.tasks_[0].forceOutsideViewport).to.be.false;
    }
  );

  it(
    'should schedule idleRenderOutsideViewport resource when' +
      ' resource is not visible',
    () => {
      const resource = createResource({
        state: ResourceState_Enum.READY_FOR_LAYOUT,
        isInViewport: false,
        prerenderAllowed: true,
        idleRenderOutsideViewport: true,
        layoutPriority: LayoutPriority_Enum.METADATA,
        taskId: 'resource#L',
      });
      resources.scheduleLayoutOrPreload(resource, true);
      expect(resources.queue_.getSize()).to.equal(1);
      expect(resources.queue_.tasks_[0].forceOutsideViewport).to.be.false;
    }
  );

  it('should update priority and schedule pass', () => {
    const element = document.createElement('div');
    element.isBuilt = () => true;
    element.getLayoutPriority = () => LayoutPriority_Enum.ADS;
    const resource = new Resource(1, element, resources);
    resources.pass_.cancel();
    expect(resource.getLayoutPriority()).to.equal(LayoutPriority_Enum.ADS);

    resources.updateLayoutPriority(element, LayoutPriority_Enum.METADATA);
    expect(resource.getLayoutPriority()).to.equal(LayoutPriority_Enum.METADATA);
    expect(resources.pass_.isPending()).to.be.true;
  });

  it('should update priority and update tasks', () => {
    resources.pass_.cancel();

    // Target element.
    const element = document.createElement('div');
    element.isBuilt = () => true;
    element.getLayoutPriority = () => LayoutPriority_Enum.ADS;
    const resource = new Resource(1, element, resources);
    resources.schedule_(resource, 'L', 0, 0, () => {});
    const task = resources.queue_.tasks_[0];
    expect(task.priority).to.equal(LayoutPriority_Enum.ADS);

    // Another element.
    const element2 = document.createElement('div');
    element2.isBuilt = () => true;
    element2.getLayoutPriority = () => LayoutPriority_Enum.ADS;
    const resource2 = new Resource(2, element2, resources);
    resources.schedule_(resource2, 'L', 0, 0, () => {});
    const task2 = resources.queue_.tasks_[1];
    expect(task2.priority).to.equal(LayoutPriority_Enum.ADS);

    resources.updateLayoutPriority(element, LayoutPriority_Enum.METADATA);
    expect(resource.getLayoutPriority()).to.equal(LayoutPriority_Enum.METADATA);
    expect(resources.pass_.isPending()).to.be.true;
    expect(task.priority).to.equal(LayoutPriority_Enum.METADATA);
    // The other task is not updated.
    expect(task2.priority).to.equal(LayoutPriority_Enum.ADS);
  });
});

describes.fakeWin(
  'Resources startup',
  {
    win: {
      readyState: 'loading',
    },
    amp: true,
  },
  (env) => {
    let win;
    let clock;
    let resources;
    let schedulePassStub;
    let sandbox;

    beforeEach(() => {
      win = env.win;
      sandbox = env.sandbox;
      clock = sandbox.useFakeTimers();
      resources = Services.resourcesForDoc(win.document.body);
      resources.relayoutAll_ = false;
      schedulePassStub = sandbox.stub(resources, 'schedulePass');
    });

    it('should run a full reload pass on window.onload', () => {
      expect(resources.relayoutAll_).to.be.false;
      expect(schedulePassStub).to.not.be.called;
      win.readyState = 'complete';
      win.eventListeners.fire({type: 'load'});
      win.document.eventListeners.fire({type: 'readystatechange'});
      return resources.ampdoc
        .whenReady()
        .then(() => {
          return loadPromise(win);
        })
        .then(() => {
          expect(resources.relayoutAll_).to.be.true;
          expect(schedulePassStub).to.have.been.called;
        });
    });

    it('should run a full reload pass on fonts timeout', () => {
      win.readyState = 'complete';
      win.document.eventListeners.fire({type: 'readystatechange'});
      let basePassCount = 0;
      return resources.ampdoc
        .whenReady()
        .then(() => {
          expect(resources.relayoutAll_).to.be.false;
          basePassCount = schedulePassStub.callCount;
          clock.tick(3100);
        })
        .then(() => {
          expect(resources.relayoutAll_).to.be.true;
          expect(schedulePassStub).to.have.callCount(basePassCount + 1);
        });
    });

    it('should run a full reload pass on document.fonts.ready', () => {
      win.readyState = 'interactive';
      win.document.eventListeners.fire({type: 'readystatechange'});
      win.document.fonts.status = 'loading';
      let basePassCount = 0;
      return resources.ampdoc
        .whenReady()
        .then(() => {})
        .then(() => {
          // This is the regular remeasure on doc-ready.
          expect(resources.relayoutAll_).to.be.true;
          resources.relayoutAll_ = false;
          basePassCount = schedulePassStub.callCount;
          return win.document.fonts.ready;
        })
        .then(() => {
          // Wait one micro task.
          return Promise.resolve();
        })
        .then(() => {
          expect(resources.relayoutAll_).to.be.true;
          // Remeasure on doc-ready and fonts-ready.
          expect(schedulePassStub).to.have.callCount(basePassCount + 1);
        });
    });

    it('should not remeasure if fonts load before doc-ready', () => {
      win.readyState = 'interactive';
      win.document.eventListeners.fire({type: 'readystatechange'});
      win.document.fonts.status = 'loaded';
      let basePassCount = 0;
      return resources.ampdoc
        .whenReady()
        .then(() => {})
        .then(() => {
          // This is the regular remeasure on doc-ready.
          expect(resources.relayoutAll_).to.be.true;
          resources.relayoutAll_ = false;
          basePassCount = schedulePassStub.callCount;
          return win.document.fonts.ready;
        })
        .then(() => {
          // Wait one micro task.
          return Promise.resolve();
        })
        .then(() => {
          expect(resources.relayoutAll_).to.be.false;
          // Only remeasure on doc-ready.
          expect(schedulePassStub).to.have.callCount(basePassCount);
        });
    });

    it('should run a full reload when a new element is connected', () => {
      expect(resources.relayoutAll_).to.be.false;
      expect(schedulePassStub).to.not.be.called;
      const el = win.document.createElement('amp-img');
      el.isBuilt = () => {
        return true;
      };
      el.isUpgraded = () => {
        return true;
      };
      el.isRelayoutNeeded = () => {
        return true;
      };
      el.updateLayoutBox = () => {};
      win.document.body.appendChild(el);
      resources.add(el);
      expect(resources.relayoutAll_).to.be.false;
      clock.tick(1000);
      expect(resources.relayoutAll_).to.be.true;
    });
  }
);

describes.realWin('Resources discoverWork', {amp: true}, (env) => {
  function createElement(rect) {
    const element = env.win.document.createElement('amp-test');
    element.classList.add('i-amphtml-element');
    element.R1 = () => false;
    element.signals = () => new Signals();
    element.whenBuilt = () => Promise.resolve();
    element.isBuilt = () => true;
    element.buildInternal = () => Promise.resolve();
    element.isUpgraded = () => true;
    element.updateLayoutBox = () => {};
    element.getPlaceholder = () => null;
    element.getLayoutPriority = () => LayoutPriority_Enum.CONTENT;
    element.getLayout = () => 'fixed';

    element.idleRenderOutsideViewport = () => true;
    element.isInViewport = () => false;
    element.getAttribute = () => null;
    element.hasAttribute = () => false;
    element.getBoundingClientRect = () => rect;
    element.layoutCallback = () => Promise.resolve();
    element.viewportCallback = sandbox.spy();
    element.prerenderAllowed = () => true;
    element.previewAllowed = () => true;
    element.renderOutsideViewport = () => true;
    element.isRelayoutNeeded = () => true;
    element.pause = () => {};
    element.unmount = () => {};
    element.unlayoutCallback = () => true;
    element.togglePlaceholder = () => sandbox.spy();
    element.fakeComputedStyle = {
      marginTop: '0px',
      marginRight: '0px',
      marginBottom: '0px',
      marginLeft: '0px',
    };
    env.win.document.body.appendChild(element);
    return element;
  }

  function createResource(id, rect) {
    const resource = new Resource(id, createElement(rect), resources);
    resource.state_ = ResourceState_Enum.READY_FOR_LAYOUT;
    resource.layoutBox_ = rect;
    return resource;
  }

  let viewportMock;
  let resources;
  let resource1, resource2;
  let sandbox;

  beforeEach(() => {
    sandbox = env.sandbox;

    const viewer = Services.viewerForDoc(env.ampdoc);
    sandbox.stub(viewer, 'isRuntimeOn').returns(true);
    resources = new ResourcesImpl(env.ampdoc);
    resources.remeasurePass_.schedule = () => {};
    resources.pass_.schedule = () => {};
    viewportMock = sandbox.mock(resources.viewport_);

    sandbox.stub(env.win, 'getComputedStyle').callsFake((el) => {
      return el.fakeComputedStyle
        ? el.fakeComputedStyle
        : window.getComputedStyle(el);
    });

    resource1 = createResource(1, layoutRectLtwh(10, 10, 100, 100));
    resource2 = createResource(2, layoutRectLtwh(10, 1010, 100, 100));
    resources.resources_ = [resource1, resource2];
    resources.vsync_ = {
      mutate: (callback) => callback(),
      measure: (callback) => callback(),
      measurePromise: (callback) => Promise.resolve(callback()),
    };
  });

  afterEach(() => {
    viewportMock.verify();
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
    sandbox
      .stub(resources.ampdoc, 'getVisibilityState')
      .returns(VisibilityState_Enum.VISIBLE);
    viewportMock.expects('getRect').returns(layoutRectLtwh(0, 0, 300, 400));
    resource1.isBuilt = () => false;
    expect(resource1.hasBeenMeasured()).to.be.false;
    resource1.isBuilt = () => false;

    resources.discoverWork_();

    expect(resource1.hasBeenMeasured()).to.be.true;
  });

  it('should render two screens when visible', () => {
    resources.visible_ = true;
    sandbox
      .stub(resources.ampdoc, 'getVisibilityState')
      .returns(VisibilityState_Enum.VISIBLE);
    viewportMock.expects('getRect').returns(layoutRectLtwh(0, 0, 300, 400));

    resources.discoverWork_();

    expect(resources.queue_.getSize()).to.equal(2);
    expect(resources.queue_.tasks_[0].resource).to.equal(resource1);
    expect(resources.queue_.tasks_[1].resource).to.equal(resource2);
  });

  it('should NOT rerender anything', () => {
    resource1.state_ = ResourceState_Enum.LAYOUT_COMPLETE;
    resource2.state_ = ResourceState_Enum.LAYOUT_COMPLETE;
    resources.visible_ = true;
    sandbox
      .stub(resources.ampdoc, 'getVisibilityState')
      .returns(VisibilityState_Enum.VISIBLE);
    viewportMock.expects('getRect').returns(layoutRectLtwh(0, 0, 300, 400));

    resources.discoverWork_();

    expect(resources.queue_.getSize()).to.equal(0);
  });

  it('should re-render from requested position', () => {
    resource1.state_ = ResourceState_Enum.LAYOUT_COMPLETE;
    resource2.state_ = ResourceState_Enum.LAYOUT_COMPLETE;
    resource1.hasBeenMeasured = () => true;
    resource2.hasBeenMeasured = () => true;
    resource1.element.getBoundingClientRect = () =>
      layoutRectLtwh(10, 10, 100, 101);
    resource2.element.getBoundingClientRect = () =>
      layoutRectLtwh(10, 1010, 100, 101);
    resources.visible_ = true;
    sandbox
      .stub(resources.ampdoc, 'getVisibilityState')
      .returns(VisibilityState_Enum.VISIBLE);
    resources.relayoutAll_ = false;
    resources.relayoutTop_ = 1000;
    viewportMock.expects('getRect').returns(layoutRectLtwh(0, 0, 300, 400));

    resources.discoverWork_();

    expect(resources.relayoutTop_).to.equal(-1);
    expect(resources.queue_.getSize()).to.equal(1);
    expect(resources.queue_.tasks_[0].resource).to.equal(resource2);
    expect(resource1.state_).to.equal(ResourceState_Enum.LAYOUT_COMPLETE);
    expect(resource2.state_).to.equal(ResourceState_Enum.LAYOUT_SCHEDULED);
  });

  it('should prerender only one screen in visibilityState=prerender', () => {
    resources.visible_ = false;
    sandbox
      .stub(resources.ampdoc, 'getVisibilityState')
      .returns(VisibilityState_Enum.PRERENDER);
    viewportMock.expects('getRect').returns(layoutRectLtwh(0, 0, 300, 1009));

    resources.discoverWork_();

    expect(resources.queue_.getSize()).to.equal(1);
    expect(resources.queue_.tasks_[0].resource).to.equal(resource1);
  });

  // TODO(dvoytenko, #12476): Make this test work with sinon 4.0.
  it.skip('should remeasure when requested and scheduled unloads', () => {
    resource1.state_ = ResourceState_Enum.LAYOUT_COMPLETE;
    resource2.state_ = ResourceState_Enum.LAYOUT_COMPLETE;
    resources.visible_ = true;
    sandbox
      .stub(resources.ampdoc, 'getVisibilityState')
      .returns(VisibilityState_Enum.VISIBLE);
    viewportMock.expects('getRect').returns(layoutRectLtwh(0, 0, 300, 400));

    const resource1MeasureStub = sandbox
      .stub(resource1, 'measure')
      .callsFake(resource1.measure.bind(resource1));
    const resource1UnloadStub = sandbox.stub(resource1, 'unload');
    const resource2MeasureStub = sandbox
      .stub(resource2, 'measure')
      .callsFake(resource2.measure.bind(resource2));
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
    resource2.element.getBoundingClientRect = () => layoutRectLtwh(0, 0, 0, 0); // Equiv to display:none.
    resources.discoverWork_();
    expect(resource1MeasureStub).to.have.callCount(2);
    expect(resource1UnloadStub).to.have.not.been.called;
    expect(resource2MeasureStub).to.have.callCount(2);
    expect(resource2UnloadStub).to.be.calledOnce;
  });

  it('should eject stale tasks when element unloaded', () => {
    const pendingResource = createResource(5, layoutRectLtwh(0, 0, 0, 0));
    pendingResource.state_ = ResourceState_Enum.NOT_BUILT;
    resources.pendingBuildResources_ = [pendingResource];
    resources.visible_ = true;
    // Don't resolve layout - immulating DOM being removed and load
    // promise not resolving.
    resource2.layoutCallback = new Promise((unusedResolve) => {});
    resource2.unlayoutCallback = () => true;
    resource2.prerenderAllowed = () => false;

    resource1.layoutCallback = new Promise((unusedResolve) => {});
    resource1.unlayoutCallback = () => true;

    sandbox
      .stub(resources.ampdoc, 'getVisibilityState')
      .returns(VisibilityState_Enum.VISIBLE);
    viewportMock
      .expects('getRect')
      .returns(layoutRectLtwh(0, 0, 300, 400))
      .atLeast(1);

    resources.discoverWork_();
    expect(resources.queue_.getSize()).to.equal(2);
    expect(resources.queue_.tasks_[0].resource).to.equal(resource1);
    expect(resources.queue_.tasks_[1].resource).to.equal(resource2);
    expect(resources.pendingBuildResources_.length).to.equal(1);

    resources.work_();
    expect(resources.exec_.getSize()).to.equal(2);

    // Remove unloaded resources from exec queue.
    resource2.abortController_ = null;
    resource2.unlayout();
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
    resource2.abortController_ = null;
    resource2.unlayout();
    resources.cleanupTasks_(resource2, /* opt_removePending */ true);
    expect(resources.queue_.getSize()).to.equal(0);
    expect(resources.pendingBuildResources_.length).to.equal(1);

    const pendingElement = {'__AMP__RESOURCE': pendingResource};
    resources.remove(pendingElement);
    expect(resources.pendingBuildResources_.length).to.equal(0);
  });

  it('should schedule resource for execution', () => {
    resources.scheduleLayoutOrPreload(resource1, true);
    expect(resources.queue_.getSize()).to.equal(1);
    expect(resources.queue_.tasks_[0].resource).to.equal(resource1);

    const measureSpy = sandbox.spy(resource1, 'measure');
    resources.work_();
    expect(resources.exec_.getSize()).to.equal(1);
    expect(measureSpy).to.be.calledOnce;
    expect(resource1.getState()).to.equal(ResourceState_Enum.LAYOUT_SCHEDULED);
  });

  it('should record layout schedule time on the resource element', () => {
    resources.scheduleLayoutOrPreload(resource1, true);

    resources.work_();
    expect(resource1.getState()).to.equal(ResourceState_Enum.LAYOUT_SCHEDULED);
    expect(resource1.element.layoutScheduleTime).to.be.greaterThan(0);
  });

  it('should not schedule resource execution outside viewport', () => {
    resources.scheduleLayoutOrPreload(resource1, true);
    expect(resources.queue_.getSize()).to.equal(1);
    expect(resources.queue_.tasks_[0].resource).to.equal(resource1);

    const measureSpy = sandbox.spy(resource1, 'measure');
    const layoutCanceledSpy = sandbox.spy(resource1, 'layoutCanceled');
    sandbox.stub(resource1, 'isInViewport').returns(false);
    sandbox.stub(resource1, 'renderOutsideViewport').returns(false);
    sandbox.stub(resource1, 'idleRenderOutsideViewport').returns(false);
    resources.work_();
    expect(resources.exec_.getSize()).to.equal(0);
    expect(measureSpy).to.be.calledOnce;
    expect(layoutCanceledSpy).to.be.calledOnce;
    expect(resource1.getState()).to.equal(ResourceState_Enum.READY_FOR_LAYOUT);
  });

  it('should force schedule resource execution outside viewport', () => {
    resources.scheduleLayoutOrPreload(
      resource1,
      true,
      0,
      /* ignoreQuota */ true
    );
    expect(resources.queue_.getSize()).to.equal(1);
    expect(resources.queue_.tasks_[0].resource).to.equal(resource1);

    const measureSpy = sandbox.spy(resource1, 'measure');
    sandbox.stub(resource1, 'isInViewport').returns(false);
    sandbox.stub(resource1, 'renderOutsideViewport').returns(false);
    sandbox.stub(resource1, 'idleRenderOutsideViewport').returns(false);
    resources.work_();
    expect(resources.exec_.getSize()).to.equal(1);
    expect(measureSpy).to.be.calledOnce;
    expect(resource1.getState()).to.equal(ResourceState_Enum.LAYOUT_SCHEDULED);
  });

  it('should schedule resource prerender when doc in prerender mode', () => {
    resources.scheduleLayoutOrPreload(resource1, true);
    expect(resources.queue_.getSize()).to.equal(1);
    expect(resources.queue_.tasks_[0].resource).to.equal(resource1);

    resources.visible_ = false;
    sandbox.stub(resources.ampdoc, 'getVisibilityState').returns('prerender');
    sandbox.stub(resource1, 'isInViewport').returns(true);
    sandbox.stub(resource1, 'prerenderAllowed').returns(true);

    const measureSpy = sandbox.spy(resource1, 'measure');
    const layoutCanceledSpy = sandbox.spy(resource1, 'layoutCanceled');
    resources.work_();
    expect(resources.exec_.getSize()).to.equal(1);
    expect(measureSpy).to.be.calledOnce;
    expect(layoutCanceledSpy).to.not.be.called;
    expect(resource1.getState()).to.equal(ResourceState_Enum.LAYOUT_SCHEDULED);
  });

  it('should not schedule resource prerender', () => {
    resources.scheduleLayoutOrPreload(resource1, true);
    expect(resources.queue_.getSize()).to.equal(1);
    expect(resources.queue_.tasks_[0].resource).to.equal(resource1);

    resources.visible_ = false;
    sandbox.stub(resources.ampdoc, 'getVisibilityState').returns('prerender');
    sandbox.stub(resource1, 'isInViewport').returns(true);
    sandbox.stub(resource1, 'prerenderAllowed').returns(false);

    const measureSpy = sandbox.spy(resource1, 'measure');
    const layoutCanceledSpy = sandbox.spy(resource1, 'layoutCanceled');
    resources.work_();
    expect(resources.exec_.getSize()).to.equal(0);
    expect(measureSpy).to.be.calledOnce;
    expect(layoutCanceledSpy).to.be.calledOnce;
    expect(resource1.getState()).to.equal(ResourceState_Enum.READY_FOR_LAYOUT);
  });

  it('should schedule resource preview when doc in preview mode', () => {
    resources.scheduleLayoutOrPreload(resource1, true);
    expect(resources.queue_.getSize()).to.equal(1);
    expect(resources.queue_.tasks_[0].resource).to.equal(resource1);

    resources.visible_ = false;
    sandbox.stub(resources.ampdoc, 'getVisibilityState').returns('preview');
    sandbox.stub(resource1, 'isInViewport').returns(true);
    sandbox.stub(resource1, 'previewAllowed').returns(true);

    const measureSpy = sandbox.spy(resource1, 'measure');
    const layoutCanceledSpy = sandbox.spy(resource1, 'layoutCanceled');
    resources.work_();
    expect(resources.exec_.getSize()).to.equal(1);
    expect(measureSpy).to.be.calledOnce;
    expect(layoutCanceledSpy).to.not.be.called;
    expect(resource1.getState()).to.equal(ResourceState_Enum.LAYOUT_SCHEDULED);
  });

  it('should not schedule resource preview', () => {
    resources.scheduleLayoutOrPreload(resource1, true);
    expect(resources.queue_.getSize()).to.equal(1);
    expect(resources.queue_.tasks_[0].resource).to.equal(resource1);

    resources.visible_ = false;
    sandbox.stub(resources.ampdoc, 'getVisibilityState').returns('preview');
    sandbox.stub(resource1, 'isInViewport').returns(true);
    sandbox.stub(resource1, 'previewAllowed').returns(false);

    const measureSpy = sandbox.spy(resource1, 'measure');
    const layoutCanceledSpy = sandbox.spy(resource1, 'layoutCanceled');
    resources.work_();
    expect(resources.exec_.getSize()).to.equal(0);
    expect(measureSpy).to.be.calledOnce;
    expect(layoutCanceledSpy).to.be.calledOnce;
    expect(resource1.getState()).to.equal(ResourceState_Enum.READY_FOR_LAYOUT);
  });

  it('should schedule resource execution when doc is hidden', () => {
    resources.scheduleLayoutOrPreload(resource1, true);
    expect(resources.queue_.getSize()).to.equal(1);
    expect(resources.queue_.tasks_[0].resource).to.equal(resource1);

    resources.visible_ = false;
    sandbox.stub(resources.ampdoc, 'getVisibilityState').returns('hidden');
    sandbox.stub(resource1, 'isInViewport').returns(true);
    sandbox.stub(resource1, 'prerenderAllowed').returns(true);

    const measureSpy = sandbox.spy(resource1, 'measure');
    const layoutCanceledSpy = sandbox.spy(resource1, 'layoutCanceled');
    resources.work_();
    expect(resources.exec_.getSize()).to.equal(0);
    expect(measureSpy).to.be.calledOnce;
    expect(layoutCanceledSpy).to.be.calledOnce;
  });

  it('should update inViewport before scheduling layouts', () => {
    resources.visible_ = true;
    sandbox
      .stub(resources.ampdoc, 'getVisibilityState')
      .returns(VisibilityState_Enum.VISIBLE);
    viewportMock.expects('getRect').returns(layoutRectLtwh(0, 0, 300, 400));
    const setInViewport = sandbox.spy(resource1, 'setInViewport');
    const schedule = sandbox.spy(resources, 'scheduleLayoutOrPreload');

    resources.discoverWork_();

    expect(setInViewport).to.have.been.calledBefore(schedule);
    expect(setInViewport).to.have.been.calledWith(true);
  });

  it('should build resource when not built', () => {
    const buildResourceSpy = sandbox.spy(resources, 'buildResourceUnsafe_');
    sandbox.stub(resources, 'schedule_');
    resources.documentReady_ = true;
    resource1.element.isBuilt = sandbox
      .stub()
      .onFirstCall()
      .returns(true)
      .onSecondCall()
      .returns(false);
    resource2.element.idleRenderOutsideViewport = () => false;
    resource1.state_ = ResourceState_Enum.NOT_BUILT;
    resource1.build = sandbox.spy();

    resources.discoverWork_();

    expect(resource1.build).to.be.calledOnce;
    expect(buildResourceSpy).calledWithExactly(
      resource1,
      /* ignoreQuota */ false
    );
  });

  it('should build resource when not built and before doc ready', () => {
    const buildResourceSpy = sandbox.spy(resources, 'buildResourceUnsafe_');
    sandbox.stub(resources, 'schedule_');
    resources.documentReady_ = false;
    sandbox.stub(resource1.element, 'nextSibling').returns({});
    resource1.element.isBuilt = sandbox
      .stub()
      .onFirstCall()
      .returns(false)
      .onSecondCall()
      .returns(true);
    resource2.element.idleRenderOutsideViewport = () => false;
    resource1.state_ = ResourceState_Enum.NOT_BUILT;
    resource1.build = sandbox.spy();

    resources.discoverWork_();

    expect(resource1.build).to.be.calledOnce;
    expect(buildResourceSpy).calledWithExactly(resource1);
  });

  it('should NOT build non-prerenderable resources in prerender', () => {
    sandbox
      .stub(resources.ampdoc, 'getVisibilityState')
      .returns(VisibilityState_Enum.PRERENDER);
    sandbox.stub(resources, 'schedule_');
    resources.documentReady_ = true;

    resource1.element.isBuilt = () => false;
    resource1.prerenderAllowed = () => false;
    resource1.state_ = ResourceState_Enum.NOT_BUILT;
    resource1.build = sandbox.spy();
    resource2.element.idleRenderOutsideViewport = () => false;

    resources.discoverWork_();

    expect(resource1.build).to.not.be.called;
  });

  it('should NOT build non-previewable resources in preview', () => {
    sandbox
      .stub(resources.ampdoc, 'getVisibilityState')
      .returns(VisibilityState_Enum.PREVIEW);
    sandbox.stub(resources, 'schedule_');
    resources.documentReady_ = true;

    resource1.element.isBuilt = () => false;
    resource1.previewAllowed = () => false;
    resource1.state_ = ResourceState_Enum.NOT_BUILT;
    resource1.build = sandbox.spy();
    resource2.element.idleRenderOutsideViewport = () => false;

    resources.discoverWork_();

    expect(resource1.build).to.not.be.called;
  });

  it('should NOT build when quota reached', () => {
    sandbox.stub(resources.ampdoc, 'hasBeenVisible').returns(false);
    sandbox.stub(resources, 'schedule_');
    resources.documentReady_ = true;
    resources.buildAttemptsCount_ = 21; // quota is 20

    resource1.element.isBuilt = () => false;
    resource1.element.idleRenderOutsideViewport = () => true;
    resource1.prerenderAllowed = () => true;
    resource1.isBuildRenderBlocking = () => false;
    resource1.state_ = ResourceState_Enum.NOT_BUILT;
    resource1.build = sandbox.spy();

    resources.buildOrScheduleBuildForResource_(resource1);
    expect(resource1.build).to.not.be.called;
  });

  it('should build render blocking resource even if quota is reached', () => {
    sandbox.stub(resources.ampdoc, 'hasBeenVisible').returns(false);
    sandbox.stub(resources, 'schedule_');
    resources.documentReady_ = true;
    resources.buildAttemptsCount_ = 21; // quota is 20

    resource1.element.isBuilt = () => false;
    resource1.element.idleRenderOutsideViewport = () => true;
    resource1.prerenderAllowed = () => true;
    resource1.isBuildRenderBlocking = () => true;
    resource1.state_ = ResourceState_Enum.NOT_BUILT;
    resource1.build = sandbox.spy();

    resources.buildOrScheduleBuildForResource_(resource1);
    expect(resource1.build).to.be.called;
  });

  it('should layout resource if outside viewport but idle', () => {
    const schedulePassStub = sandbox.stub(resources, 'schedulePass');
    resources.documentReady_ = true;
    sandbox.stub(resource1.element, 'nextSibling').returns({});
    resource1.element.isBuilt = () => true;
    resource1.element.renderOutsideViewport = () => false;
    resource1.element.idleRenderOutsideViewport = () => true;
    resource2.element.renderOutsideViewport = () => false;
    resource2.element.idleRenderOutsideViewport = () => false;
    resource1.state_ = ResourceState_Enum.READY_FOR_LAYOUT;

    resources.discoverWork_();

    expect(schedulePassStub).to.be.calledOnce;
  });

  it('should force build resources during discoverWork layout phase', () => {
    const buildResourceSpy = sandbox.spy(resources, 'buildResourceUnsafe_');
    sandbox.stub(resources, 'schedule_');
    resources.documentReady_ = true;
    // Emulates a resource not building.
    resource1.element.isBuilt = sandbox.stub().returns(false);
    resource2.element.idleRenderOutsideViewport = () => false;
    resource1.state_ = ResourceState_Enum.NOT_BUILT;
    resource1.build = sandbox.spy();

    resources.discoverWork_();

    expect(resource1.build).to.be.calledTwice;
    // discoverWork_ phase 1 build.
    expect(buildResourceSpy).calledWithExactly(
      resource1,
      /* ignoreQuota */ false
    );
    // discoverWork_ phase 4 layout grants build.
    expect(buildResourceSpy).calledWithExactly(
      resource1,
      /* ignoreQuota */ true
    );
  });

  describe('onNextPass', () => {
    it('should only run callbacks once.', () => {
      resources.isRuntimeOn_ = true;
      resources.documentReady_ = true;
      resources.firstPassAfterDocumentReady_ = true;

      const passCallback = sandbox.spy();
      resources.onNextPass(passCallback);

      resources.doPass();
      expect(passCallback).to.be.calledOnce;

      resources.doPass();
      expect(passCallback).to.be.calledOnce;
    });
  });
});

describes.realWin(
  'Resources contentHeight',
  {
    amp: {
      runtimeOn: true,
    },
  },
  (env) => {
    let win;
    let resources;
    let viewerSendMessageStub, viewportContentHeightChangedStub;
    let sandbox;

    beforeEach(() => {
      win = env.win;
      sandbox = env.sandbox;
      resources = win.__AMP_SERVICES.resources.obj;
      viewerSendMessageStub = sandbox.stub(resources.viewer_, 'sendMessage');
      viewportContentHeightChangedStub = sandbox.stub(
        resources.viewport_,
        'contentHeightChanged'
      );
      sandbox.stub(resources.vsync_, 'run').callsFake((task) => {
        task.measure({});
      });
    });

    it('should measure initial contentHeight', () => {
      const contentHeight = resources.viewport_.getContentHeight();
      expect(resources.maybeChangeHeight_).to.equal(false);
      expect(resources.documentReady_).to.equal(true);
      expect(resources.contentHeight_).to.equal(contentHeight);
    });

    it('should only send contentHeight to the viewer once amp finishes init', () => {
      resources.firstPassAfterDocumentReady_ = false;
      resources.documentReady_ = false;
      resources.ampInitialized_ = false;
      resources.doPass();
      expect(viewerSendMessageStub).not.called;

      resources.firstPassAfterDocumentReady_ = true;
      resources.documentReady_ = true;
      resources.ampInitialized_ = true;
      resources.doPass();
      expect(viewerSendMessageStub).calledWithExactly(
        'documentHeight',
        {height: 0},
        true
      );
    });

    it('should send contentHeight to viewer if height was changed', () => {
      sandbox.stub(resources.viewport_, 'getContentHeight').returns(200);
      resources.maybeChangeHeight_ = true;

      resources.doPass();

      expect(resources.maybeChangeHeight_).to.equal(false);
      expect(resources.contentHeight_).to.equal(200);
      expect(viewerSendMessageStub).to.be.calledOnce;
      expect(viewerSendMessageStub.lastCall.args[0]).to.equal('documentHeight');
      expect(viewerSendMessageStub.lastCall.args[1].height).to.equal(200);
      expect(viewerSendMessageStub.lastCall.args[2]).to.equal(true);
      expect(viewportContentHeightChangedStub).to.be.calledOnce;
    });

    it('should not send contentHeight to viewer if height is not changed', () => {
      const contentHeight = resources.viewport_.getContentHeight();
      resources.maybeChangeHeight_ = true;

      resources.doPass();

      expect(resources.maybeChangeHeight_).to.equal(false);
      expect(resources.contentHeight_).to.equal(contentHeight);
      expect(viewerSendMessageStub).to.not.be.called;
      expect(viewportContentHeightChangedStub).to.not.be.called;
    });

    it('should send contentHeight to viewer if viewport resizes', () => {
      sandbox.stub(resources.viewport_, 'getContentHeight').returns(200);
      resources.viewport_.changed_(/* relayoutAll */ true, /* velocity */ 0);
      resources.doPass();

      expect(resources.maybeChangeHeight_).to.equal(false);
      expect(resources.contentHeight_).to.equal(200);
      expect(viewerSendMessageStub).to.be.calledOnce;
      expect(viewerSendMessageStub.lastCall.args[0]).to.equal('documentHeight');
      expect(viewerSendMessageStub.lastCall.args[1].height).to.equal(200);
      expect(viewerSendMessageStub.lastCall.args[2]).to.equal(true);
      expect(viewportContentHeightChangedStub).to.be.calledOnce;
    });
  }
);

describes.fakeWin('Resources.add/upgrade/remove', {amp: true}, (env) => {
  let resources;
  let parent;
  let parentResource;
  let child1;
  let resource1;
  let child2;
  let resource2;
  let sandbox;

  function createElement() {
    const signals = new Signals();
    const element = {
      ownerDocument: {defaultView: window},
      tagName: 'amp-test',
      hasAttribute() {
        return false;
      },
      isBuilding() {
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
      pause() {},
      resume() {},
      unmount() {},
      updateLayoutBox() {},
      getBoundingClientRect() {
        return layoutRectLtwh(0, 0, 0, 0);
      },
      signals() {
        return signals;
      },
    };
    element.buildInternal = sandbox.stub().returns(Promise.resolve());
    return element;
  }

  function createElementWithResource(id) {
    const element = createElement();
    const resource = new Resource(id, element, resources);
    resource.state_ = ResourceState_Enum.NOT_BUILT;
    resource.element['__AMP__RESOURCE'] = resource;
    return [element, resource];
  }

  function stubBuild(resource) {
    const origBuild = resource.build;
    sandbox.stub(resource, 'build').callsFake(() => {
      resource.buildPromise = origBuild.call(resource);
      return resource.buildPromise;
    });
    return resource;
  }

  beforeEach(() => {
    sandbox = env.sandbox;
    const infPromise = new Promise(() => {});
    sandbox.stub(env.ampdoc, 'whenReady').returns(infPromise);
    resources = new ResourcesImpl(env.ampdoc);
    resources.isBuildOn_ = true;
    resources.pendingBuildResources_ = [];
    parent = createElementWithResource(1)[0];
    parentResource = parent['__AMP__RESOURCE'];
    child1 = createElementWithResource(2)[0];
    resource1 = child1['__AMP__RESOURCE'];
    child2 = createElementWithResource(3)[0];
    resource2 = child2['__AMP__RESOURCE'];
  });

  it('should enforce that viewport is ready for first add', () => {
    const ensureViewportReady = sandbox.stub(
      resources.viewport_,
      'ensureReadyForElements'
    );
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
    expect(child1.buildInternal).to.not.be.called;
    resources.documentReady_ = true;
    resources.add(child2);
    const resource2 = stubBuild(Resource.forElementOptional(child2));
    resources.upgraded(child2);
    expect(child2.buildInternal).to.be.calledOnce;
    expect(schedulePassStub).to.not.be.called;
    return resource2.buildPromise.then(() => {
      expect(schedulePassStub).to.be.calledOnce;
    });
  });

  it('should not schedule pass when immediate build fails', () => {
    const schedulePassStub = sandbox.stub(resources, 'schedulePass');
    child1.isBuilt = () => false;
    const child1BuildSpy = sandbox.spy();
    child1.buildInternal = () => {
      // Emulate an error happening during an element build.
      child1BuildSpy();
      return Promise.reject(new Error('child1-build-error'));
    };
    resources.documentReady_ = true;
    resources.add(child1);
    const resource1 = stubBuild(Resource.forElementOptional(child1));
    resources.upgraded(child1);
    expect(resources.get()).to.contain(resource1);
    return resource1.buildPromise.then(
      () => {
        throw new Error('must have failed');
      },
      () => {
        expect(child1BuildSpy).to.be.calledOnce;
        expect(schedulePassStub).to.not.be.called;
        expect(resources.get()).to.not.contain(resource1);
      }
    );
  });

  it('should add element to pending build when document is not ready', () => {
    child1.isBuilt = () => false;
    child2.isBuilt = () => false;
    resources.buildReadyResources_ = sandbox.spy();
    resources.documentReady_ = false;
    resources.add(child1);
    resources.upgraded(child1);
    expect(child1.buildInternal.called).to.be.false;
    expect(resources.pendingBuildResources_.length).to.be.equal(1);
    resources.add(child2);
    resources.upgraded(child2);
    expect(child2.buildInternal.called).to.be.false;
    expect(resources.pendingBuildResources_.length).to.be.equal(2);
    expect(resources.buildReadyResources_.calledTwice).to.be.true;
    const resource1 = Resource.forElementOptional(child1);
    const resource2 = Resource.forElementOptional(child2);
    expect(resources.get()).to.contain(resource1);
    expect(resources.get()).to.contain(resource2);
    expect(resource1.isBuilding()).to.be.false;
    expect(resource2.isBuilding()).to.be.false;
  });

  describe('buildReadyResources_', () => {
    let schedulePassStub;

    beforeEach(() => {
      schedulePassStub = sandbox.stub(resources, 'schedulePass');
      resources.isBuildOn_ = true;
      resources.documentReady_ = false;
      resource1 = stubBuild(resource1);
      resource2 = stubBuild(resource2);
      parentResource = stubBuild(parentResource);
      resources.resources_ = [resource1, resource2];
    });

    it('should build ready resources and remove them from pending', () => {
      resources.pendingBuildResources_ = [resource1, resource2];
      resources.buildReadyResources_();
      expect(child1.buildInternal.called).to.be.false;
      expect(child2.buildInternal.called).to.be.false;
      expect(resources.pendingBuildResources_.length).to.be.equal(2);
      expect(resources.schedulePass.called).to.be.false;

      child1.nextSibling = child2;
      resources.buildReadyResources_();
      expect(child1.buildInternal.called).to.be.true;
      expect(child2.buildInternal.called).to.be.false;
      expect(resources.pendingBuildResources_.length).to.be.equal(1);
      expect(resources.pendingBuildResources_[0]).to.be.equal(resource2);
      expect(resource1.isBuilding()).to.be.true;
      expect(resource2.isBuilding()).to.be.false;
      return resource1.buildPromise
        .then(() => {
          expect(resources.schedulePass.calledOnce).to.be.true;

          child2.parentNode = parent;
          parent.nextSibling = true;
          resources.buildReadyResources_();
          expect(child1.buildInternal).to.be.calledOnce;
          expect(child2.buildInternal.called).to.be.true;
          expect(resources.pendingBuildResources_.length).to.be.equal(0);
          expect(resource2.isBuilding()).to.be.true;
          return resource2.buildPromise;
        })
        .then(() => {
          expect(resources.get()).to.contain(resource1);
          expect(resources.get()).to.contain(resource2);
          expect(resource1.isBuilding()).to.be.false;
          expect(resource2.isBuilding()).to.be.false;
          expect(resources.schedulePass.calledTwice).to.be.true;
        });
    });

    it('should NOT build past the root node when pending', () => {
      resources.pendingBuildResources_ = [resource1];
      resources.buildReadyResources_();
      expect(child1.buildInternal.called).to.be.false;
      expect(resources.pendingBuildResources_.length).to.be.equal(1);
      expect(resources.schedulePass.called).to.be.false;

      child1.parentNode = parent;
      parent.nextSibling = true;
      sandbox.stub(resources.ampdoc, 'getRootNode').returns(parent);
      resources.buildReadyResources_();
      expect(child1.buildInternal.called).to.be.false;
      expect(resources.pendingBuildResources_.length).to.be.equal(1);
      expect(resources.schedulePass.called).to.be.false;
    });

    it('should not try to build resources already being built', () => {
      resources.pendingBuildResources_ = [resource1, resource2];
      resources.buildReadyResources_();
      expect(child1.buildInternal.called).to.be.false;
      expect(child2.buildInternal.called).to.be.false;
      expect(resources.pendingBuildResources_.length).to.be.equal(2);

      const newChild = createElementWithResource(3)[0];
      newChild.nextSibling = true;
      const newResource = newChild['__AMP__RESOURCE'];
      const child1BuildSpy = sandbox.spy();
      child1.nextSibling = child2;
      child1.buildInternal = () => {
        // Simulate parent elements adding children elements to simulate
        // the infinite loop of building pending resources and make sure
        // that we're handling it well.
        child1BuildSpy();
        resources.pendingBuildResources_.push(newResource);
        resources.buildReadyResources_();
        return Promise.resolve();
      };
      resources.buildReadyResources_();
      expect(child1BuildSpy.called).to.be.true;
      expect(child2.buildInternal.called).to.be.false;
      expect(newChild.buildInternal.called).to.be.true;
      expect(resources.pendingBuildResources_.length).to.be.equal(1);
      expect(resources.pendingBuildResources_[0]).to.be.equal(resource2);

      child2.parentNode = parent;
      parent.nextSibling = true;
      resources.buildReadyResources_();
      expect(child1BuildSpy.calledTwice).to.be.false;
      expect(child2.buildInternal.called).to.be.true;
      expect(newChild.buildInternal.calledTwice).to.be.false;
      expect(resources.pendingBuildResources_.length).to.be.equal(0);
    });

    it('should build everything pending when document is ready', () => {
      resources.documentReady_ = true;
      resources.pendingBuildResources_ = [parentResource, resource1, resource2];
      const child1BuildSpy = sandbox.spy();
      child1.buildInternal = () => {
        // Emulate an error happening during an element build.
        child1BuildSpy();
        return Promise.reject(new Error('child1-build-error'));
      };
      resources.buildReadyResources_();
      expect(child1BuildSpy.called).to.be.true;
      expect(child2.buildInternal.called).to.be.true;
      expect(parent.buildInternal.called).to.be.true;
      expect(resources.pendingBuildResources_.length).to.be.equal(0);
      return Promise.all([
        parentResource.buildPromise,
        resource2.buildPromise,
        resource1.buildPromise.then(
          () => {
            throw new Error('must have failed');
          },
          () => {
            // Ignore error.
          }
        ),
      ]).then(() => {
        expect(schedulePassStub).to.be.calledTwice;
        // Failed build.
        expect(resources.get()).to.not.contain(resource1);
        expect(resource1.isBuilding()).to.be.false;
        // Successful build.
        expect(resources.get()).to.contain(resource2);
        expect(resource2.isBuilding()).to.be.false;
      });
    });

    it('should not schedule pass if all builds failed', () => {
      resources.documentReady_ = true;
      resources.pendingBuildResources_ = [resource1];
      const child1BuildSpy = sandbox.spy();
      child1.buildInternal = () => {
        // Emulate an error happening during an element build.
        child1BuildSpy();
        return Promise.reject(new Error('child1-build-error'));
      };
      resources.buildReadyResources_();
      expect(child1BuildSpy.called).to.be.true;
      expect(resources.pendingBuildResources_.length).to.be.equal(0);
      return resource1.buildPromise.then(
        () => {
          throw new Error('must have failed');
        },
        () => {
          expect(schedulePassStub).to.not.be.called;
          expect(resources.get()).to.not.contain(resource1);
          expect(resource1.isBuilding()).to.be.false;
        }
      );
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
      expect(resources.get()).to.not.contain(resource);
      expect(pauseOnRemoveStub).to.be.calledOnce;
      expect(disconnectStub).to.not.be.called;
    });
  });

  it("remove should remove all of a resource's tasks", () => {
    const states = [
      ResourceState_Enum.NOT_LAID_OUT,
      ResourceState_Enum.READY_FOR_LAYOUT,
      ResourceState_Enum.LAYOUT_SCHEDULED,
    ];

    states.forEach((state) => {
      resource1.state_ = state;
      resources.exec_.enqueue({id: 1, resource: resource1});
      resources.queue_.enqueue({id: 1, resource: resource1});

      expect(resources.exec_.getSize()).to.equal(1);
      expect(resources.queue_.getSize()).to.equal(1);
      resources.remove(child1);
      expect(resources.exec_.getSize()).to.equal(0);
      expect(resources.queue_.getSize()).to.equal(0);
    });
  });

  describe('reparent', () => {
    let scheduleBuildStub;
    let resource;

    beforeEach(() => {
      scheduleBuildStub = sandbox.stub(
        resources,
        'buildOrScheduleBuildForResource_'
      );
      child1.isBuilt = () => true;
      resources.add(child1);
      resources.upgraded(child1);
      resource = Resource.forElementOptional(child1);
      resources.remove(child1);
    });

    it('should keep reference to the resource', () => {
      expect(resource).to.not.be.null;
      expect(Resource.forElementOptional(child1)).to.equal(resource);
      expect(resources.get()).to.not.contain(resource);
      expect(scheduleBuildStub).to.be.calledOnce;
      expect(resource.isMeasureRequested()).to.be.false;
    });
  });
});
