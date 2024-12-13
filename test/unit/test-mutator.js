import * as fakeTimers from '@sinonjs/fake-timers';

import {VisibilityState_Enum} from '#core/constants/visibility-state';
import {Signals} from '#core/data-structures/signals';
import {LayoutPriority_Enum} from '#core/dom/layout';
import {layoutRectLtwh} from '#core/dom/layout/rect';

import {AmpDocSingle} from '#service/ampdoc-impl';
import {MutatorImpl} from '#service/mutator-impl';
import {Resource, ResourceState_Enum} from '#service/resource';
import {ResourcesImpl} from '#service/resources-impl';

import {installInputService} from '../../src/input';

/** @type {?Event|undefined} */
const NO_EVENT = undefined;

describes.realWin('mutator changeSize', {amp: true}, (env) => {
  let window, document;
  let clock;
  let viewportMock;
  let resources, mutator;
  let resource1, resource2;

  beforeEach(() => {
    window = env.win;
    document = window.document;
    delete window.requestIdleCallback;
    delete window.cancelIdleCallback;
    clock = fakeTimers.withGlobal(window).install();
    const ampdoc = new AmpDocSingle(window);
    resources = new ResourcesImpl(ampdoc);
    resources.isRuntimeOn_ = false;
    resources.win = {
      location: {
        href: 'https://example.org/doc1',
      },
      Date: window.Date,
      getComputedStyle: (el) => {
        return el.fakeComputedStyle
          ? el.fakeComputedStyle
          : window.getComputedStyle(el);
      },
    };
    mutator = new MutatorImpl(ampdoc);
    mutator.win = resources.win;
    mutator.resources_ = resources;

    installInputService(resources.win);

    viewportMock = env.sandbox.mock(mutator.viewport_);

    resource1 = createResource(1, layoutRectLtwh(10, 10, 100, 100));
    resource2 = createResource(2, layoutRectLtwh(10, 1010, 100, 100));
    resources.owners_ = [resource1, resource2];
  });

  afterEach(() => {
    viewportMock.verify();
  });

  function createElement(rect) {
    const signals = new Signals();
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
      layoutCallback: () => Promise.resolve(),
      prerenderAllowed: () => true,
      previewAllowed: () => true,
      renderOutsideViewport: () => false,
      unlayoutCallback: () => true,
      pause: () => {},
      unmount: () => {},
      isRelayoutNeeded: () => true,
      /* eslint-disable local/camelcase */
      contains: (unused_otherElement) => false,
      updateLayoutBox: () => {},
      togglePlaceholder: () => env.sandbox.spy(),
      overflowCallback: (
        unused_overflown,
        unused_requestedHeight,
        unused_requestedWidth
        /* eslint-enable local/camelcase */
      ) => {},
      getLayoutPriority: () => LayoutPriority_Enum.CONTENT,
      signals: () => signals,
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
    resource.state_ = ResourceState_Enum.READY_FOR_LAYOUT;
    resource.initialLayoutBox_ = resource.layoutBox_ = rect;
    resource.changeSize = env.sandbox.spy();
    return resource;
  }

  it('should schedule separate requests', () => {
    mutator.scheduleChangeSize_(
      resource1,
      111,
      100,
      undefined,
      NO_EVENT,
      false
    );
    mutator.scheduleChangeSize_(
      resource2,
      222,
      undefined,
      undefined,
      NO_EVENT,
      true
    );

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
    mutator.scheduleChangeSize_(
      resource1,
      111,
      undefined,
      undefined,
      NO_EVENT,
      false
    );
    expect(resources.requestsChangeSize_.length).to.equal(1);
    expect(resources.requestsChangeSize_[0].resource).to.equal(resource1);
    expect(resources.requestsChangeSize_[0].newHeight).to.equal(111);
    expect(resources.requestsChangeSize_[0].newWidth).to.be.undefined;
    expect(resources.requestsChangeSize_[0].newMargins).to.be.undefined;
    expect(resources.requestsChangeSize_[0].force).to.equal(false);
  });

  it('should remove request change size for unloaded resources', () => {
    mutator.scheduleChangeSize_(
      resource1,
      111,
      undefined,
      undefined,
      NO_EVENT,
      false
    );
    mutator.scheduleChangeSize_(
      resource2,
      111,
      undefined,
      undefined,
      NO_EVENT,
      false
    );
    expect(resources.requestsChangeSize_.length).to.equal(2);
    resource1.state_ = ResourceState_Enum.LAYOUT_SCHEDULED;
    resource1.unlayout();
    resources.cleanupTasks_(resource1);
    expect(resources.requestsChangeSize_.length).to.equal(1);
    expect(resources.requestsChangeSize_[0].resource).to.equal(resource2);
  });

  it('should schedule width only size change', () => {
    mutator.scheduleChangeSize_(
      resource1,
      undefined,
      111,
      undefined,
      NO_EVENT,
      false
    );
    expect(resources.requestsChangeSize_.length).to.equal(1);
    expect(resources.requestsChangeSize_[0].resource).to.equal(resource1);
    expect(resources.requestsChangeSize_[0].newWidth).to.equal(111);
    expect(resources.requestsChangeSize_[0].newHeight).to.be.undefined;
    expect(resources.requestsChangeSize_[0].marginChange).to.be.undefined;
    expect(resources.requestsChangeSize_[0].force).to.equal(false);
  });

  it('should schedule margin only size change', () => {
    mutator.scheduleChangeSize_(
      resource1,
      undefined,
      undefined,
      {top: 1, right: 2, bottom: 3, left: 4},
      NO_EVENT,
      false
    );
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
    mutator.scheduleChangeSize_(resource1, 111, 100, undefined, NO_EVENT, true);
    mutator.scheduleChangeSize_(
      resource1,
      222,
      300,
      undefined,
      NO_EVENT,
      false
    );

    expect(resources.requestsChangeSize_.length).to.equal(1);
    expect(resources.requestsChangeSize_[0].resource).to.equal(resource1);
    expect(resources.requestsChangeSize_[0].newHeight).to.equal(222);
    expect(resources.requestsChangeSize_[0].newWidth).to.equal(300);
    expect(resources.requestsChangeSize_[0].force).to.equal(true);
  });

  it("should NOT change size if it didn't change", () => {
    mutator.scheduleChangeSize_(resource1, 100, 100, undefined, NO_EVENT, true);
    resources.mutateWork_();
    expect(resources.relayoutTop_).to.equal(-1);
    expect(resources.requestsChangeSize_.length).to.equal(0);
    expect(resource1.changeSize).to.have.not.been.called;
  });

  it('should change size', () => {
    mutator.scheduleChangeSize_(resource1, 111, 222, undefined, NO_EVENT, true);
    resources.mutateWork_();
    expect(resources.relayoutTop_).to.equal(resource1.layoutBox_.top);
    expect(resources.requestsChangeSize_.length).to.equal(0);
    expect(resource1.changeSize).to.be.calledOnce;
    expect(resource1.changeSize.firstCall.args[0]).to.equal(111);
    expect(resource1.changeSize.firstCall.args[1]).to.equal(222);
  });

  it('should change size when only width changes', () => {
    mutator.scheduleChangeSize_(resource1, 111, 100, undefined, NO_EVENT, true);
    resources.mutateWork_();
    expect(resource1.changeSize).to.be.calledOnce;
    expect(resource1.changeSize.firstCall).to.have.been.calledWith(111, 100);
  });

  it('should change size when only height changes', () => {
    mutator.scheduleChangeSize_(resource1, 100, 111, undefined, NO_EVENT, true);
    resources.mutateWork_();
    expect(resource1.changeSize).to.be.calledOnce;
    expect(resource1.changeSize.firstCall).to.have.been.calledWith(100, 111);
  });

  it('should pick the smallest relayoutTop', () => {
    mutator.scheduleChangeSize_(resource2, 111, 222, undefined, NO_EVENT, true);
    mutator.scheduleChangeSize_(resource1, 111, 222, undefined, NO_EVENT, true);
    resources.mutateWork_();
    expect(resources.relayoutTop_).to.equal(resource1.layoutBox_.top);
  });

  it('should measure non-measured elements', () => {
    resource1.initialLayoutBox_ = null;
    resource1.measure = env.sandbox.spy();
    resource2.measure = env.sandbox.spy();

    mutator.scheduleChangeSize_(resource1, 111, 200, undefined, NO_EVENT, true);
    mutator.scheduleChangeSize_(resource2, 111, 222, undefined, NO_EVENT, true);
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

  describe('requestChangeSize rules wrt viewport', () => {
    let overflowCallbackSpy;
    let vsyncSpy;
    let viewportRect;

    beforeEach(() => {
      overflowCallbackSpy = env.sandbox.spy();
      resource1.element.overflowCallback = overflowCallbackSpy;

      viewportRect = {top: 2, left: 0, right: 100, bottom: 200, height: 200};
      viewportMock.expects('getRect').returns(viewportRect).atLeast(1);
      resource1.layoutBox_ = {
        top: 10,
        left: 0,
        right: 100,
        bottom: 50,
        height: 50,
      };
      vsyncSpy = env.sandbox.stub(mutator.vsync_, 'run');
      resources.visible_ = true;
    });

    it('should NOT change size when height is unchanged', () => {
      const callback = env.sandbox.spy();
      resource1.layoutBox_ = {
        top: 10,
        left: 0,
        right: 100,
        bottom: 210,
        height: 50,
      };
      mutator.scheduleChangeSize_(
        resource1,
        50,
        /* width */ undefined,
        undefined,
        NO_EVENT,
        false,
        callback
      );
      resources.mutateWork_();
      expect(resource1.changeSize).to.not.been.called;
      expect(overflowCallbackSpy).to.not.been.called;
      expect(callback).to.be.calledOnce;
      expect(callback.args[0][0]).to.be.true;
    });

    it('should NOT change size when height and margins are unchanged', () => {
      const callback = env.sandbox.spy();
      resource1.layoutBox_ = {
        top: 10,
        left: 0,
        right: 100,
        bottom: 210,
        height: 50,
      };
      resource1.element.fakeComputedStyle = {
        marginTop: '1px',
        marginRight: '2px',
        marginBottom: '3px',
        marginLeft: '4px',
      };
      mutator.scheduleChangeSize_(
        resource1,
        50,
        /* width */ undefined,
        {top: 1, right: 2, bottom: 3, left: 4},
        NO_EVENT,
        false,
        callback
      );

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
      const callback = env.sandbox.spy();
      resource1.layoutBox_ = {
        top: 10,
        left: 0,
        right: 100,
        bottom: 210,
        height: 50,
      };
      resource1.element.fakeComputedStyle = {
        marginTop: '1px',
        marginRight: '2px',
        marginBottom: '3px',
        marginLeft: '4px',
      };
      mutator.scheduleChangeSize_(
        resource1,
        50,
        /* width */ undefined,
        {top: 1, right: 2, bottom: 4, left: 4},
        NO_EVENT,
        false,
        callback
      );

      expect(vsyncSpy).to.be.calledOnce;
      const task = vsyncSpy.lastCall.args[0];
      task.measure({});

      resources.mutateWork_();
      expect(resource1.changeSize).to.be.calledOnce;
    });

    it('should change size when forced', () => {
      mutator.scheduleChangeSize_(
        resource1,
        111,
        222,
        undefined,
        NO_EVENT,
        true
      );
      resources.mutateWork_();
      expect(resources.requestsChangeSize_).to.be.empty;
      expect(resource1.changeSize).to.be.calledOnce;
      expect(overflowCallbackSpy).to.be.calledOnce;
      expect(overflowCallbackSpy.firstCall.args[0]).to.equal(false);
    });

    it('should change size when document is invisible', () => {
      resources.visible_ = false;
      env.sandbox
        .stub(resources.ampdoc, 'getVisibilityState')
        .returns(VisibilityState_Enum.PRERENDER);
      mutator.scheduleChangeSize_(
        resource1,
        111,
        222,
        undefined,
        NO_EVENT,
        false
      );
      resources.mutateWork_();
      expect(resources.requestsChangeSize_).to.be.empty;
      expect(resource1.changeSize).to.be.calledOnce;
      expect(overflowCallbackSpy).to.be.calledOnce;
      expect(overflowCallbackSpy.firstCall.args[0]).to.equal(false);
    });

    it('should change size when document is in preview mode', () => {
      env.sandbox
        .stub(resources.ampdoc, 'getVisibilityState')
        .returns(VisibilityState_Enum.PREVIEW);
      mutator.scheduleChangeSize_(
        resource1,
        111,
        222,
        undefined,
        NO_EVENT,
        false
      );
      resources.mutateWork_();
      expect(resources.requestsChangeSize_).to.be.empty;
      expect(resource1.changeSize).to.be.calledOnce;
      expect(overflowCallbackSpy).to.be.calledOnce;
      expect(overflowCallbackSpy.firstCall.args[0]).to.equal(false);
    });

    it('should change size when active', () => {
      resource1.element.contains = () => true;
      mutator.scheduleChangeSize_(
        resource1,
        111,
        222,
        undefined,
        NO_EVENT,
        false
      );
      resources.mutateWork_();
      expect(resources.requestsChangeSize_).to.be.empty;
      expect(resource1.changeSize).to.be.calledOnce;
      expect(overflowCallbackSpy).to.be.calledOnce;
      expect(overflowCallbackSpy.firstCall.args[0]).to.equal(false);
    });

    it('should NOT change size via activation if has not been active', () => {
      viewportMock.expects('getContentHeight').returns(10000).atLeast(0);
      const event = {
        userActivation: {
          hasBeenActive: false,
        },
      };
      mutator.scheduleChangeSize_(resource1, 111, 222, undefined, event, false);
      resources.mutateWork_();
      expect(resource1.changeSize).to.not.be.called;
      expect(overflowCallbackSpy).to.be.calledOnce.calledWith(true);
    });

    it('should change size via activation if has been active', () => {
      viewportMock.expects('getContentHeight').returns(10000).atLeast(0);
      const event = {
        userActivation: {
          hasBeenActive: true,
        },
      };
      mutator.scheduleChangeSize_(resource1, 111, 222, undefined, event, false);
      resources.mutateWork_();
      expect(resources.requestsChangeSize_).to.be.empty;
      expect(resource1.changeSize).to.be.calledOnce;
      expect(overflowCallbackSpy).to.be.calledOnce.calledWith(false);
    });

    it('should change size when below the viewport', () => {
      resource1.layoutBox_ = {
        top: 10,
        left: 0,
        right: 100,
        bottom: 1050,
        height: 50,
      };
      mutator.scheduleChangeSize_(
        resource1,
        111,
        222,
        undefined,
        NO_EVENT,
        false
      );
      resources.mutateWork_();
      expect(resources.requestsChangeSize_).to.be.empty;
      expect(resource1.changeSize).to.be.calledOnce;
      expect(overflowCallbackSpy).to.be.calledOnce;
      expect(overflowCallbackSpy.firstCall.args[0]).to.equal(false);
    });

    it('should change size when below the viewport and top margin also changed', () => {
      resource1.layoutBox_ = {
        top: 200,
        left: 0,
        right: 100,
        bottom: 300,
        height: 100,
      };
      mutator.scheduleChangeSize_(
        resource1,
        111,
        222,
        {top: 20},
        NO_EVENT,
        false
      );

      expect(vsyncSpy).to.be.calledOnce;
      const marginsTask = vsyncSpy.lastCall.args[0];
      marginsTask.measure({});

      resources.mutateWork_();
      expect(resources.requestsChangeSize_).to.be.empty;
      expect(resource1.changeSize).to.be.calledOnce;
      expect(overflowCallbackSpy).to.be.calledOnce;
      expect(overflowCallbackSpy.firstCall.args[0]).to.equal(false);
    });

    it(
      'should change size when box top below the viewport but top margin ' +
        'boundary is above viewport but top margin in unchanged',
      () => {
        resource1.layoutBox_ = {
          top: 200,
          left: 0,
          right: 100,
          bottom: 300,
          height: 100,
        };
        resource1.element.fakeComputedStyle = {
          marginTop: '100px',
          marginRight: '0px',
          marginBottom: '0px',
          marginLeft: '0px',
        };
        mutator.scheduleChangeSize_(
          resource1,
          111,
          222,
          {top: 100},
          NO_EVENT,
          false
        );

        expect(vsyncSpy).to.be.calledOnce;
        const marginsTask = vsyncSpy.lastCall.args[0];
        marginsTask.measure({});

        resources.mutateWork_();
        expect(resources.requestsChangeSize_).to.be.empty;
        expect(resource1.changeSize).to.be.calledOnce;
        expect(overflowCallbackSpy).to.be.calledOnce;
        expect(overflowCallbackSpy.firstCall.args[0]).to.equal(false);
      }
    );

    it(
      'should NOT change size when top margin boundary within viewport ' +
        'and top margin changed',
      () => {
        viewportMock.expects('getContentHeight').returns(10000).atLeast(1);

        const callback = env.sandbox.spy();
        resource1.layoutBox_ = {
          top: 100,
          left: 0,
          right: 100,
          bottom: 300,
          height: 200,
        };
        mutator.scheduleChangeSize_(
          resource1,
          111,
          222,
          {top: 20},
          NO_EVENT,
          false,
          callback
        );

        expect(vsyncSpy).to.be.calledOnce;
        const task = vsyncSpy.lastCall.args[0];
        task.measure({});

        resources.mutateWork_();
        expect(resource1.changeSize).to.not.been.called;
        expect(overflowCallbackSpy).to.not.been.called;
        expect(callback).to.be.calledOnce;
        expect(callback.args[0][0]).to.be.false;
      }
    );

    it('should defer when above the viewport and scrolling on', () => {
      resource1.layoutBox_ = {
        top: -1200,
        left: 0,
        right: 100,
        bottom: -1050,
        height: 50,
      };
      resources.lastVelocity_ = 10;
      resources.lastScrollTime_ = Date.now();
      mutator.scheduleChangeSize_(
        resource1,
        111,
        222,
        undefined,
        NO_EVENT,
        false
      );
      resources.mutateWork_();
      expect(resources.requestsChangeSize_.length).to.equal(1);
      expect(resource1.changeSize).to.not.been.called;
      expect(overflowCallbackSpy).to.not.been.called;
    });

    it(
      'should defer change size if just inside viewport and viewport ' +
        'scrolled by user.',
      () => {
        viewportRect.top = 2;
        resource1.layoutBox_ = {
          top: -50,
          left: 0,
          right: 100,
          bottom: 1,
          height: 51,
        };
        resources.lastVelocity_ = 10;
        resources.lastScrollTime_ = Date.now();
        mutator.scheduleChangeSize_(
          resource1,
          111,
          222,
          undefined,
          NO_EVENT,
          false
        );
        resources.mutateWork_();
        expect(resources.requestsChangeSize_.length).to.equal(1);
        expect(resource1.changeSize).to.not.been.called;
        expect(overflowCallbackSpy).to.not.been.called;
      }
    );

    it(
      'should NOT change size and call overflow callback if viewport not ' +
        'scrolled by user.',
      () => {
        viewportMock.expects('getContentHeight').returns(10000).atLeast(1);
        viewportRect.top = 1;
        resource1.layoutBox_ = {
          top: -50,
          left: 0,
          right: 100,
          bottom: 0,
          height: 51,
        };
        resources.lastVelocity_ = 10;
        resources.lastScrollTime_ = Date.now();
        mutator.scheduleChangeSize_(
          resource1,
          111,
          222,
          undefined,
          NO_EVENT,
          false
        );
        resources.mutateWork_();
        expect(resources.requestsChangeSize_.length).to.equal(0);
        expect(resource1.changeSize).to.not.been.called;
        expect(overflowCallbackSpy).to.be.calledOnce;
        expect(overflowCallbackSpy).to.be.calledWith(true, 111, 222);
      }
    );

    it('should change size when above the vp and adjust scrolling', () => {
      viewportMock.expects('getScrollHeight').returns(2999).once();
      viewportMock.expects('getScrollTop').returns(1777).once();
      resource1.layoutBox_ = {
        top: -1200,
        left: 0,
        right: 100,
        bottom: -1050,
        height: 50,
      };
      resources.lastVelocity_ = 0;
      clock.tick(5000);
      mutator.scheduleChangeSize_(
        resource1,
        111,
        222,
        undefined,
        NO_EVENT,
        false
      );
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
      resource1.layoutBox_ = {
        top: -1200,
        left: 0,
        right: 100,
        bottom: -1100,
        height: 100,
      };
      resources.lastVelocity_ = 0;
      clock.tick(5000);
      mutator.scheduleChangeSize_(
        resource1,
        0,
        222,
        undefined,
        NO_EVENT,
        false
      );
      expect(vsyncSpy).to.be.calledOnce;
      vsyncSpy.resetHistory();
      resources.mutateWork_();

      expect(resources.requestsChangeSize_).to.be.empty;
      expect(resource1.changeSize).to.not.be.called;
      expect(vsyncSpy).to.not.be.called;
    });

    it('should resize if multi request above vp can adjust scroll', () => {
      resource1.layoutBox_ = {
        top: -1200,
        left: 0,
        right: 100,
        bottom: -1100,
        height: 100,
      };
      resource2.layoutBox_ = {
        top: -1300,
        left: 0,
        right: 100,
        bottom: -1200,
        height: 100,
      };
      resources.lastVelocity_ = 0;
      clock.tick(5000);
      mutator.scheduleChangeSize_(
        resource2,
        200,
        222,
        undefined,
        NO_EVENT,
        false
      );
      mutator.scheduleChangeSize_(
        resource1,
        0,
        222,
        undefined,
        NO_EVENT,
        false
      );
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
        top: 10,
        left: 0,
        right: 100,
        bottom: 210,
        height: 200,
      });
      resource1.layoutBox_ = {
        top: -1200,
        left: 0,
        right: 100,
        bottom: -1100,
        height: 100,
      };
      resource2.layoutBox_ = {
        top: -1300,
        left: 0,
        right: 100,
        bottom: -1200,
        height: 100,
      };
      resources.lastVelocity_ = 0;
      clock.tick(5000);
      mutator.scheduleChangeSize_(
        resource1,
        92,
        222,
        undefined,
        NO_EVENT,
        false
      );
      mutator.scheduleChangeSize_(
        resource2,
        92,
        222,
        undefined,
        NO_EVENT,
        false
      );
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
      resource1.layoutBox_ = {
        top: -1200,
        left: 0,
        right: 100,
        bottom: -1050,
        height: 50,
      };
      resources.lastVelocity_ = 0;
      clock.tick(5000);
      mutator.scheduleChangeSize_(
        resource1,
        111,
        222,
        undefined,
        NO_EVENT,
        false
      );
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
      resource1.layoutBox_ = {
        top: -1200,
        left: 0,
        right: 100,
        bottom: -1050,
        height: 50,
      };
      resources.lastVelocity_ = 0;
      clock.tick(5000);
      mutator.scheduleChangeSize_(
        resource1,
        111,
        222,
        undefined,
        NO_EVENT,
        false
      );
      resources.mutateWork_();
      const task = vsyncSpy.lastCall.args[0];
      const state = {};
      task.measure(state);
      viewportMock.expects('getScrollHeight').returns(2000).once();
      viewportMock.expects('setScrollTop').withExactArgs(1).once();
      task.mutate(state);
    });

    it('in vp should NOT call overflowCallback if new height smaller', () => {
      viewportMock.expects('getContentHeight').returns(10000).atLeast(1);
      mutator.scheduleChangeSize_(
        resource1,
        10,
        11,
        undefined,
        NO_EVENT,
        false
      );
      resources.mutateWork_();
      expect(resources.requestsChangeSize_).to.be.empty;
      expect(resource1.changeSize).to.not.been.called;
      expect(overflowCallbackSpy).to.not.been.called;
    });

    it('in viewport should change size if in the last 15% and in the last 1000px', () => {
      viewportRect.top = 9600;
      viewportRect.bottom = 9800;
      resource1.layoutBox_ = {
        top: 9650,
        left: 0,
        right: 100,
        bottom: 9700,
        height: 50,
      };
      mutator.scheduleChangeSize_(
        resource1,
        111,
        222,
        {top: 1, right: 2, bottom: 3, left: 4},
        NO_EVENT,
        false
      );

      expect(vsyncSpy).to.be.calledOnce;
      const marginsTask = vsyncSpy.lastCall.args[0];
      marginsTask.measure({});

      resources.mutateWork_();
      expect(resources.requestsChangeSize_).to.be.empty;
      expect(resource1.changeSize).to.be.calledOnce;
      expect(overflowCallbackSpy).to.be.calledOnce;
      expect(overflowCallbackSpy.firstCall.args[0]).to.equal(false);
    });

    it(
      'in viewport should NOT change size if in the last 15% but NOT ' +
        'in the last 1000px',
      () => {
        viewportMock.expects('getContentHeight').returns(10000).atLeast(1);
        viewportRect.top = 8600;
        viewportRect.bottom = 8800;
        resource1.layoutBox_ = {
          top: 8650,
          left: 0,
          right: 100,
          bottom: 8700,
          height: 50,
        };
        mutator.scheduleChangeSize_(
          resource1,
          111,
          222,
          {top: 1, right: 2, bottom: 3, left: 4},
          NO_EVENT,
          false
        );

        expect(vsyncSpy).to.be.calledOnce;
        const marginsTask = vsyncSpy.lastCall.args[0];
        marginsTask.measure({});

        resources.mutateWork_();
        expect(resources.requestsChangeSize_).to.be.empty;
        expect(resource1.changeSize).to.not.been.called;
        expect(overflowCallbackSpy).to.be.calledOnce;
        expect(overflowCallbackSpy).to.be.calledWith(true, 111, 222, {
          top: 1,
          right: 2,
          bottom: 3,
          left: 4,
        });
      }
    );

    it('in viewport should NOT change size and calls overflowCallback', () => {
      viewportMock.expects('getContentHeight').returns(10000).atLeast(1);
      mutator.scheduleChangeSize_(
        resource1,
        111,
        222,
        {top: 1, right: 2, bottom: 3, left: 4},
        NO_EVENT,
        false
      );

      expect(vsyncSpy).to.be.calledOnce;
      const task = vsyncSpy.lastCall.args[0];
      task.measure({});

      resources.mutateWork_();
      expect(resources.requestsChangeSize_.length).to.equal(0);
      expect(resource1.changeSize).to.not.been.called;
      expect(overflowCallbackSpy).to.be.calledOnce;
      expect(overflowCallbackSpy).to.be.calledWith(true, 111, 222, {
        top: 1,
        right: 2,
        bottom: 3,
        left: 4,
      });
      expect(resource1.getPendingChangeSize()).to.jsonEqual({
        height: 111,
        width: 222,
        margins: {top: 1, right: 2, bottom: 3, left: 4},
      });
    });

    it(
      'should change size if in viewport, but only modifying width and ' +
        'reflow is not possible',
      () => {
        const parent = document.createElement('div');
        parent.style.width = '222px';
        parent.getLayoutSize = () => ({width: 222, height: 111});
        const element = document.createElement('div');
        element.overflowCallback = overflowCallbackSpy;
        parent.appendChild(element);
        document.body.appendChild(parent);

        resource1.element = element;
        resource1.layoutBox_ = {
          top: 0,
          left: 0,
          right: 222,
          bottom: 50,
          height: 50,
          width: 222,
        };
        viewportMock.expects('getContentHeight').returns(10000).atLeast(1);
        mutator.scheduleChangeSize_(
          resource1,
          50,
          222,
          {top: 1, right: 2, bottom: 3, left: 4},
          NO_EVENT,
          false
        );

        expect(vsyncSpy).to.be.calledOnce;
        let task = vsyncSpy.lastCall.args[0];
        task.measure({});

        resources.mutateWork_();

        expect(vsyncSpy).to.be.calledThrice;
        task = vsyncSpy.lastCall.args[0];
        const state = {};
        task.measure(state);
        task.mutate(state);
        expect(resource1.changeSize).to.be.calledOnce;
        expect(resource1.changeSize).to.be.calledWith(50, 222);
        expect(overflowCallbackSpy).to.be.calledOnce;
        expect(overflowCallbackSpy.firstCall.args[0]).to.equal(false);
        document.body.removeChild(parent);
      }
    );

    it(
      'should NOT change size if in viewport, only modifying width and ' +
        'reflow is possible',
      () => {
        const parent = document.createElement('div');
        parent.style.width = '222px';
        parent.getLayoutSize = () => ({width: 222, height: 111});
        const element = document.createElement('div');
        const sibling = document.createElement('div');
        sibling.style.width = '1px';
        sibling.id = 'sibling';
        element.overflowCallback = overflowCallbackSpy;
        parent.appendChild(element);
        parent.appendChild(sibling);
        document.body.appendChild(parent);

        resource1.element = element;
        resource1.layoutBox_ = {
          top: 0,
          left: 0,
          right: 222,
          bottom: 50,
          height: 50,
          width: 222,
        };
        viewportMock.expects('getContentHeight').returns(10000).atLeast(1);
        mutator.scheduleChangeSize_(
          resource1,
          50,
          222,
          {top: 1, right: 2, bottom: 3, left: 4},
          NO_EVENT,
          false
        );

        expect(vsyncSpy).to.be.calledOnce;
        let task = vsyncSpy.lastCall.args[0];
        task.measure({});

        resources.mutateWork_();

        expect(vsyncSpy).to.be.calledThrice;
        task = vsyncSpy.lastCall.args[0];
        const state = {};
        task.measure(state);
        task.mutate(state);
        expect(resource1.changeSize).to.not.be.called;
        expect(overflowCallbackSpy).to.be.calledOnce;
        expect(overflowCallbackSpy.firstCall.args[0]).to.equal(true);
        document.body.removeChild(parent);
      }
    );

    it(
      'should NOT change size when resized margin in viewport and should ' +
        'call overflowCallback',
      () => {
        viewportMock.expects('getContentHeight').returns(10000).atLeast(1);
        resource1.layoutBox_ = {
          top: -48,
          left: 0,
          right: 100,
          bottom: 2,
          height: 50,
        };
        resource1.element.fakeComputedStyle = {
          marginBottom: '21px',
        };

        mutator.scheduleChangeSize_(
          resource1,
          undefined,
          undefined,
          {bottom: 22},
          NO_EVENT,
          false
        );

        expect(vsyncSpy).to.be.calledOnce;
        const task = vsyncSpy.lastCall.args[0];
        task.measure({});

        resources.mutateWork_();
        expect(resources.requestsChangeSize_.length).to.equal(0);
        expect(resource1.changeSize).to.not.been.called;
        expect(overflowCallbackSpy).to.be.calledOnce;
        expect(overflowCallbackSpy).to.be.calledWith(
          true,
          undefined,
          undefined,
          {bottom: 22}
        );
        expect(resource1.getPendingChangeSize()).to.jsonEqual({
          height: undefined,
          width: undefined,
          margins: {bottom: 22},
        });
      }
    );

    it('should change size when resized margin above viewport', () => {
      resource1.layoutBox_ = {
        top: -49,
        left: 0,
        right: 100,
        bottom: 1,
        height: 50,
      };
      resource1.element.fakeComputedStyle = {
        marginBottom: '21px',
      };
      viewportMock.expects('getScrollHeight').returns(2999).once();
      viewportMock.expects('getScrollTop').returns(1777).once();

      resources.lastVelocity_ = 0;
      clock.tick(5000);
      mutator.scheduleChangeSize_(
        resource1,
        undefined,
        undefined,
        {top: 1},
        NO_EVENT,
        false
      );

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
      expect(resource1.changeSize).to.be.calledWith(undefined, undefined, {
        top: 1,
      });
      expect(resources.relayoutTop_).to.equal(resource1.layoutBox_.top);
    });

    it('should reset pending change size when rescheduling', () => {
      viewportMock.expects('getContentHeight').returns(10000).atLeast(1);
      mutator.scheduleChangeSize_(
        resource1,
        111,
        222,
        undefined,
        NO_EVENT,
        false
      );
      resources.mutateWork_();
      expect(resource1.getPendingChangeSize().height).to.equal(111);
      expect(resource1.getPendingChangeSize().width).to.equal(222);

      mutator.scheduleChangeSize_(
        resource1,
        112,
        223,
        undefined,
        NO_EVENT,
        false
      );
      expect(resource1.getPendingChangeSize()).to.be.undefined;
    });

    it('should force resize after focus', () => {
      viewportMock.expects('getContentHeight').returns(10000).atLeast(1);
      mutator.scheduleChangeSize_(
        resource1,
        111,
        222,
        undefined,
        NO_EVENT,
        false
      );
      resources.mutateWork_();
      expect(resource1.getPendingChangeSize()).to.jsonEqual({
        height: 111,
        width: 222,
      });
      expect(resources.requestsChangeSize_).to.be.empty;

      mutator.checkPendingChangeSize_(resource1.element);
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

  describe('requestChangeSize rules for element wrt document', () => {
    beforeEach(() => {
      viewportMock
        .expects('getRect')
        .returns({top: 0, left: 0, right: 100, bottom: 10000, height: 200});
      resource1.layoutBox_ = resource1.initialLayoutBox_ = layoutRectLtwh(
        0,
        10,
        100,
        100
      );
    });

    it('should NOT change size when far the bottom of the document', () => {
      viewportMock.expects('getContentHeight').returns(10000).once();
      mutator.scheduleChangeSize_(
        resource1,
        111,
        222,
        undefined,
        NO_EVENT,
        false
      );
      resources.mutateWork_();
      expect(resource1.changeSize).to.not.been.called;
    });

    it('should change size when close to the bottom of the document', () => {
      viewportMock.expects('getContentHeight').returns(110).once();
      mutator.scheduleChangeSize_(
        resource1,
        111,
        222,
        undefined,
        NO_EVENT,
        false
      );
      resources.mutateWork_();
      expect(resource1.changeSize).to.be.calledOnce;
    });
  });
});

describes.realWin('mutator mutateElement and collapse', {amp: true}, (env) => {
  function createElement(rect, isAmp) {
    const element = env.win.document.createElement(isAmp ? 'amp-test' : 'div');
    if (isAmp) {
      element.classList.add('i-amphtml-element');
    }
    element.signals = () => new Signals();
    element.whenBuilt = () => Promise.resolve();
    element.isBuilt = () => true;
    element.buildInternal = () => Promise.resolve();
    element.isUpgraded = () => true;
    element.updateLayoutBox = () => {};
    element.getPlaceholder = () => null;
    element.getLayoutPriority = () => LayoutPriority_Enum.CONTENT;
    element.getLayout = () => 'fixed';

    element.isInViewport = () => false;
    element.getAttribute = () => null;
    element.hasAttribute = () => false;
    element.getBoundingClientRect = () => rect;
    element.layoutCallback = () => Promise.resolve();
    element.prerenderAllowed = () => true;
    element.previewAllowed = () => true;
    element.renderOutsideViewport = () => true;
    element.isRelayoutNeeded = () => true;
    element.pause = () => {};
    element.unmount = () => {};
    element.unlayoutCallback = () => true;
    element.togglePlaceholder = () => env.sandbox.spy();

    env.win.document.body.appendChild(element);
    return element;
  }

  function createResource(id, rect) {
    const resource = new Resource(
      id,
      createElement(rect, /* isAmp */ true),
      resources
    );
    resource.element['__AMP__RESOURCE'] = resource;
    resource.state_ = ResourceState_Enum.READY_FOR_LAYOUT;
    resource.layoutBox_ = rect;
    resource.changeSize = env.sandbox.spy();
    resource.completeCollapse = env.sandbox.spy();
    return resource;
  }

  let viewportMock;
  let resources, mutator;
  let resource1, resource2;
  let parent1, parent2;
  let relayoutTopStub;
  let resource1RequestMeasureStub, resource2RequestMeasureStub;

  beforeEach(() => {
    resources = new ResourcesImpl(env.ampdoc);
    resources.isRuntimeOn_ = false;
    viewportMock = env.sandbox.mock(resources.viewport_);
    resources.vsync_ = {
      mutate: (callback) => callback(),
      measure: (callback) => callback(),
      runPromise: (task) => {
        const state = {};
        if (task.measure) {
          task.measure(state);
        }
        if (task.mutate) {
          task.mutate(state);
        }
        return Promise.resolve();
      },
      run: (task) => {
        const state = {};
        if (task.measure) {
          task.measure(state);
        }
        if (task.mutate) {
          task.mutate(state);
        }
      },
    };
    relayoutTopStub = env.sandbox.stub(resources, 'setRelayoutTop');
    env.sandbox.stub(resources, 'schedulePass');

    mutator = new MutatorImpl(env.ampdoc);
    mutator.resources_ = resources;
    mutator.viewport_ = resources.viewport_;
    mutator.vsync_ = resources.vsync_;

    resource1 = createResource(1, layoutRectLtwh(10, 10, 100, 100));
    resource2 = createResource(2, layoutRectLtwh(10, 1010, 100, 100));
    resources.owners_ = [resource1, resource2];

    resource1RequestMeasureStub = env.sandbox.stub(resource1, 'requestMeasure');
    resource2RequestMeasureStub = env.sandbox.stub(resource2, 'requestMeasure');

    parent1 = createElement(
      layoutRectLtwh(10, 10, 100, 100),
      /* isAmp */ false
    );
    parent2 = createElement(
      layoutRectLtwh(10, 1010, 100, 100),
      /* isAmp */ false
    );

    parent1.getElementsByClassName = (className) => {
      if (className == 'i-amphtml-element') {
        return [resource1.element];
      }
    };
    parent2.getElementsByClassName = (className) => {
      if (className == 'i-amphtml-element') {
        return [resource2.element];
      }
    };
  });

  afterEach(() => {
    viewportMock.verify();
  });

  it('should mutate from visible to invisible', () => {
    const mutateSpy = env.sandbox.spy();
    const promise = mutator.mutateElement(parent1, () => {
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
    const mutateSpy = env.sandbox.spy();
    const promise = mutator.mutateElement(resource1.element, () => {
      resource1.element.getBoundingClientRect = () =>
        layoutRectLtwh(0, 0, 0, 0);
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
    const mutateSpy = env.sandbox.spy();
    parent1.getBoundingClientRect = () => layoutRectLtwh(0, 0, 0, 0);
    const promise = mutator.mutateElement(parent1, () => {
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
    const mutateSpy = env.sandbox.spy();
    parent1.getBoundingClientRect = () => layoutRectLtwh(10, 10, 100, 100);
    const promise = mutator.mutateElement(parent1, () => {
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

  it('attemptCollapse should not call requestChangeSize', () => {
    // This test ensure that #attemptCollapse won't do any optimization or
    // refactor by calling requestChangeSize.
    // This to support collapsing element above viewport
    // When requestChangeSize succeed, resources manager will measure the new
    // scrollHeight, and we need to make sure the newScrollHeight is measured
    // after setting element display:none
    env.sandbox.stub(resources.viewport_, 'getRect').callsFake(() => {
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
    const promise = new Promise((resolve) => {
      promiseResolve = resolve;
    });
    let index = 0;
    env.sandbox.stub(resources.viewport_, 'getScrollHeight').callsFake(() => {
      // In change element size above viewport path, getScrollHeight will be
      // called twice. And we care that the last measurement is correct,
      // which requires it to be measured after element dispaly set to none.
      if (index == 1) {
        expect(resource1.completeCollapse).to.be.calledOnce;
        promiseResolve();
        return;
      }
      expect(resource1.completeCollapse).to.not.been.called;
      index++;
    });

    resource1.layoutBox_ = {
      top: 1000,
      left: 0,
      right: 100,
      bottom: 1050,
      height: 50,
    };
    resources.lastVelocity_ = 0;
    mutator.attemptCollapse(resource1.element);
    resources.mutateWork_();
    return promise;
  });

  it('attemptCollapse should complete collapse if resize succeed', () => {
    env.sandbox
      .stub(mutator, 'scheduleChangeSize_')
      .callsFake(
        (resource, newHeight, newWidth, newMargins, event, force, callback) => {
          callback(true);
        }
      );
    mutator.attemptCollapse(resource1.element);
    expect(resource1.completeCollapse).to.be.calledOnce;
  });

  it('attemptCollapse should NOT complete collapse if resize fail', () => {
    env.sandbox
      .stub(mutator, 'scheduleChangeSize_')
      .callsFake(
        (resource, newHeight, newWidth, newMargins, event, force, callback) => {
          callback(false);
        }
      );
    mutator.attemptCollapse(resource1.element);
    expect(resource1.completeCollapse).to.not.been.called;
  });

  it('should complete collapse and trigger relayout', () => {
    const oldTop = resource1.getLayoutBox().top;
    mutator.collapseElement(resource1.element);
    expect(resource1.completeCollapse).to.be.calledOnce;
    expect(relayoutTopStub).to.be.calledOnce;
    expect(relayoutTopStub.args[0][0]).to.equal(oldTop);
  });

  it('should ignore relayout on an already collapsed element', () => {
    resource1.layoutBox_.width = 0;
    resource1.layoutBox_.height = 0;
    mutator.collapseElement(resource1.element);
    expect(resource1.completeCollapse).to.be.calledOnce;
    expect(relayoutTopStub).to.have.not.been.called;
  });
});
