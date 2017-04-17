/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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
  IntersectionObserverPolyfill,
  nativeIntersectionObserverSupported,
} from '../../../../src/intersection-observer-polyfill';
import {
  VisibilityManagerForDoc,
  VisibilityManagerForEmbed,
} from '../visibility-manager';
import {VisibilityState} from '../../../../src/visibility-state';
import {documentStateFor} from '../../../../src/service/document-state';
import {layoutRectLtwh, rectIntersection} from '../../../../src/layout-rect';

class IntersectionObserverStub {

  constructor(callback, options) {
    this.callback = callback;
    this.options = options;
    this.elements = [];
    this.disconnected = false;
  }

  observe(element) {
    if (this.disconnected) {
      throw new Error('disconnected');
    }
    if (!this.elements.includes(element)) {
      this.elements.push(element);
    }
  }

  unobserve(element) {
    if (this.disconnected) {
      throw new Error('disconnected');
    }
    const index = this.elements.indexOf(element);
    if (index == -1) {
      throw new Error('element not found');
    }
    this.elements.splice(index, 1);
  }

  disconnect() {
    if (this.disconnected) {
      throw new Error('disconnected');
    }
    this.disconnected = true;
  }
}


describes.fakeWin('VisibilityManagerForDoc', {amp: true}, env => {
  let win;
  let ampdoc;
  let clock;
  let viewer, viewport;
  let root;
  let startVisibilityHandlerCount;
  let eventResolver, eventPromise;

  beforeEach(() => {
    win = env.win;
    ampdoc = env.ampdoc;
    clock = sandbox.useFakeTimers();
    clock.tick(1);

    viewer = win.services.viewer.obj;
    sandbox.stub(viewer, 'getFirstVisibleTime', () => 1);
    viewport = win.services.viewport.obj;
    startVisibilityHandlerCount =
        viewer.visibilityObservable_.getHandlerCount();

    root = new VisibilityManagerForDoc(ampdoc);

    win.IntersectionObserver = IntersectionObserverStub;
    win.IntersectionObserverEntry = function() {};
    win.IntersectionObserverEntry.prototype.intersectionRatio = 1;

    eventPromise = new Promise(resolve => {
      eventResolver = resolve;
    });
  });

  it('should initialize correctly backgrounded', () => {
    viewer.setVisibilityState_(VisibilityState.HIDDEN);
    root = new VisibilityManagerForDoc(ampdoc);

    expect(root.parent).to.be.null;
    expect(root.ampdoc).to.equal(ampdoc);
    expect(root.getStartTime()).to.equal(viewer.getFirstVisibleTime());
    expect(root.isBackgrounded()).to.be.true;
    expect(root.isBackgroundedAtStart()).to.be.true;
    expect(root.children_).to.be.null;  // Don't take extra memory.

    // Will be initialized lazily
    expect(root.intersectionObserver_).to.be.null;

    // Root model starts invisible.
    expect(root.getRootVisibility()).to.equal(0);
  });

  it('should initialize correctly foregrounded', () => {
    expect(root.parent).to.be.null;
    expect(root.ampdoc).to.equal(ampdoc);
    expect(root.getStartTime()).to.equal(viewer.getFirstVisibleTime());
    expect(root.isBackgrounded()).to.be.false;
    expect(root.isBackgroundedAtStart()).to.be.false;

    // Will be initialized lazily
    expect(root.intersectionObserver_).to.be.null;

    // Root model starts invisible.
    expect(root.parent).to.be.null;
    expect(root.getRootVisibility()).to.equal(1);
  });

  it('should switch visibility based on viewer for main doc', () => {
    expect(viewer.visibilityObservable_.getHandlerCount())
        .equal(startVisibilityHandlerCount + 1);
    expect(root.getRootVisibility()).to.equal(1);

    // Go prerender.
    viewer.setVisibilityState_(VisibilityState.PRERENDER);
    expect(root.getRootVisibility()).to.equal(0);

    // Go hidden.
    viewer.setVisibilityState_(VisibilityState.HIDDEN);
    expect(root.getRootVisibility()).to.equal(0);

    // Go visible.
    viewer.setVisibilityState_(VisibilityState.VISIBLE);
    expect(root.getRootVisibility()).to.equal(1);
    expect(root.getStartTime()).to.equal(viewer.getFirstVisibleTime());
  });

  it('should switch visibility for in-a-box', () => {
    win.AMP_MODE = {runtime: 'inabox'};
    root = new VisibilityManagerForDoc(ampdoc);

    // Check observer is correctly set.
    const inOb = root.intersectionObserver_;
    expect(inOb).to.be.instanceOf(IntersectionObserverStub);
    expect(inOb.elements).to.contain(win.document.documentElement);

    // Start as invisible.
    expect(root.getRootVisibility()).to.equal(0);

    // Unrelated event.
    const otherTarget = win.document.createElement('div');
    inOb.callback([{
      target: otherTarget,
      intersectionRatio: 0.3,
    }]);
    expect(root.getRootVisibility()).to.equal(0);

    // Move to the viewport.
    inOb.callback([
      {
        target: otherTarget,
        intersectionRatio: 0.5,
      },
      {
        target: win.document.documentElement,
        intersectionRatio: 0.3,
      },
    ]);
    expect(root.getRootVisibility()).to.equal(0.3);

    // Back out of viewport.
    inOb.callback([
      {
        target: win.document.documentElement,
        intersectionRatio: 0,
      },
    ]);
    expect(root.getRootVisibility()).to.equal(0);
  });

  it('should switch root model to no-visibility on dispose', () => {
    expect(root.getRootVisibility()).to.equal(1);
    root.dispose();
    expect(root.getRootVisibility()).to.equal(0);
  });

  it('should dispose everything', () => {
    const modelsDisposed = sandbox.spy();
    const modelsCalled = sandbox.spy();
    const otherTarget = win.document.createElement('div');
    const spec = {totalTimeMin: 10};
    root.listenRoot(spec, null, null, modelsCalled);
    root.listenElement(otherTarget, spec, null, null, modelsCalled);
    root.listenElement(
        otherTarget, {totalTimeMin: 20}, null, null, modelsCalled);
    expect(root.models_).to.have.length(3);
    root.models_.forEach(model => {
      model.unsubscribe(modelsDisposed);
    });
    const otherUnsubscribes = sandbox.spy();
    root.unsubscribe(otherUnsubscribes);
    root.unsubscribe(otherUnsubscribes);
    const inOb = root.intersectionObserver_;
    expect(inOb.elements).to.contain(otherTarget);

    root.dispose();

    // All other models have been disposed.
    expect(root.models_).to.have.length(0);
    expect(modelsCalled).to.not.be.called;
    expect(modelsDisposed.callCount).to.equal(3);

    // All other unsubscribes have been called.
    expect(otherUnsubscribes.callCount).to.equal(2);

    // Viewer and viewport have been unsubscribed.
    expect(viewer.visibilityObservable_.getHandlerCount())
        .equal(startVisibilityHandlerCount);

    // Intersection observer disconnected.
    expect(inOb.disconnected).to.be.true;
    expect(root.intersectionObserver_).to.be.null;
    expect(inOb.elements).to.not.contain(otherTarget);
  });

  it('should polyfill and dispose intersection observer', () => {
    delete win.IntersectionObserver;

    const startScrollCount = viewport.scrollObservable_.getHandlerCount();
    const startChangeCount = viewport.changeObservable_.getHandlerCount();

    // Check observer is correctly set.
    const inOb = root.getIntersectionObserver_();
    expect(inOb).to.be.instanceOf(IntersectionObserverPolyfill);
    expect(viewport.scrollObservable_.getHandlerCount())
        .to.equal(startScrollCount + 1);
    expect(viewport.changeObservable_.getHandlerCount())
        .to.equal(startChangeCount + 1);

    root.dispose();
    expect(viewport.scrollObservable_.getHandlerCount())
        .to.equal(startScrollCount);
    expect(viewport.changeObservable_.getHandlerCount())
        .to.equal(startChangeCount);
  });

  it('should support polyfill on non-amp root element', () => {
    delete win.IntersectionObserver;
    const inOb = root.getIntersectionObserver_();

    const rootElement = win.document.documentElement;
    root.listenElement(rootElement, {}, null, null, eventResolver);
    expect(root.models_).to.have.length(1);
    const model = root.models_[0];
    expect(inOb.observeEntries_).to.have.length(1);

    // AMP API is polyfilled.
    expect(rootElement.getLayoutBox).to.be.function;
    expect(rootElement.getOwner()).to.be.null;

    // Starts as invisible.
    expect(model.getVisibility_()).to.equal(0);

    // Trigger tick.
    sandbox.stub(viewport, 'getRect', () => {
      return layoutRectLtwh(0, 0, 100, 100);
    });
    sandbox.stub(viewport, 'getLayoutRect', element => {
      if (element == rootElement) {
        return layoutRectLtwh(0, 50, 100, 100);
      }
      return null;
    });
    expect(rootElement.getLayoutBox())
        .to.contain({left: 0, top: 50, width: 100, height: 100});
    viewport.scrollObservable_.fire({type: 'scroll'});
    expect(model.getVisibility_()).to.equal(0.5);

    return eventPromise.then(() => {
      expect(inOb.observeEntries_).to.have.length(0);
    });
  });

  it('should listen on root', () => {
    clock.tick(1);
    const disposed = sandbox.spy();
    const spec = {totalTimeMin: 10};
    root.listenRoot(spec, null, null, eventResolver);

    expect(root.models_).to.have.length(1);
    const model = root.models_[0];
    model.unsubscribe(disposed);
    expect(model.spec_.totalTimeMin).to.equal(10);
    expect(model.getVisibility_()).to.equal(1);

    // Go invisible.
    root.setRootVisibility(0);
    expect(model.getVisibility_()).to.equal(0);

    // Back to visible.
    root.setRootVisibility(1);
    expect(model.getVisibility_()).to.equal(1);

    // Fire event.
    clock.tick(11);
    return eventPromise.then(state => {
      expect(disposed).to.be.calledOnce;
      expect(root.models_).to.have.length(0);

      expect(state.totalVisibleTime).to.equal(10);
      expect(state.firstSeenTime).to.equal(1);
      expect(state.backgrounded).to.equal(0);
      expect(state.backgroundedAtStart).to.equal(0);
      expect(state.totalTime).to.equal(12);
    });
  });

  it('should listen on root with ready signal', () => {
    clock.tick(1);
    const disposed = sandbox.spy();
    const spec = {totalTimeMin: 0};
    const readyPromise = Promise.resolve().then(() => {
      clock.tick(21);
    });
    root.listenRoot(spec, readyPromise, null, eventResolver);

    expect(root.models_).to.have.length(1);
    const model = root.models_[0];
    model.unsubscribe(disposed);

    // Blocked by ready promise: visibility == 0.
    expect(model.getVisibility_()).to.equal(0);

    // Fire event.
    return eventPromise.then(state => {
      expect(model.getVisibility_()).to.equal(1);
      expect(disposed).to.be.calledOnce;
      expect(root.models_).to.have.length(0);

      expect(state.totalVisibleTime).to.equal(0);
      expect(state.firstSeenTime).to.equal(22);
      expect(state.backgrounded).to.equal(0);
      expect(state.backgroundedAtStart).to.equal(0);
      expect(state.totalTime).to.equal(22);
    });
  });

  it('should pass func to create readyReportPromise to model', () => {
    let testPromiseResolver;
    const disposed = sandbox.spy();
    const testPromise = new Promise(resolve => {
      testPromiseResolver = resolve;
    });
    root.listenRoot({}, null, () => {
      return testPromise;
    }, eventResolver);
    expect(root.models_).to.have.length(1);
    const model = root.models_[0];
    model.unsubscribe(disposed);
    clock.tick(11);
    testPromiseResolver();
    return eventPromise.then(state => {
      expect(disposed).to.be.calledOnce;
      expect(state.totalVisibleTime).to.equal(11);
      expect(state.totalTime).to.equal(11);
      expect(state.maxContinuousVisibleTime).to.equal(11);
    });
  });

  it('should unlisten root', () => {
    clock.tick(1);
    const disposed = sandbox.spy();
    const spec = {totalTimeMin: 10};
    const unlisten = root.listenRoot(spec, null, null, eventResolver);

    expect(root.models_).to.have.length(1);
    expect(Object.keys(root.trackedElements_)).to.have.length(0);
    expect(root.getIntersectionObserver_().elements).to.have.length(0);
    const model = root.models_[0];
    model.unsubscribe(disposed);

    unlisten();
    expect(root.models_).to.have.length(0);
    expect(disposed).to.be.calledOnce;
  });

  it('should listen on a element', () => {
    clock.tick(1);
    const disposed = sandbox.spy();
    const target = win.document.createElement('div');
    const spec = {totalTimeMin: 10};
    root.listenElement(target, spec, null, null, eventResolver);

    expect(root.models_).to.have.length(1);
    const model = root.models_[0];
    model.unsubscribe(disposed);
    expect(model.spec_.totalTimeMin).to.equal(10);
    expect(target.__AMP_VIS_ID).to.be.ok;
    expect(root.trackedElements_[target.__AMP_VIS_ID].element).to.equal(target);

    const inOb = root.getIntersectionObserver_();
    expect(inOb.elements).to.contain(target);
    expect(model.getVisibility_()).to.equal(0);

    // In viewport.
    inOb.callback([{
      target,
      intersectionRatio: 0.3,
    }]);
    expect(model.getVisibility_()).to.equal(0.3);

    // Go invisible on root.
    root.setRootVisibility(0);
    expect(model.getVisibility_()).to.equal(0);

    // Back to visible on root.
    root.setRootVisibility(1);
    expect(model.getVisibility_()).to.equal(0.3);

    // Fire event.
    clock.tick(11);
    return eventPromise.then(state => {
      expect(disposed).to.be.calledOnce;
      expect(root.models_).to.have.length(0);
      expect(root.trackedElements_[target.__AMP_VIS_ID]).to.not.exist;
      expect(inOb.elements).to.not.contain(target);

      expect(state.totalVisibleTime).to.equal(10);
      expect(state.firstSeenTime).to.equal(1);
      expect(state.backgrounded).to.equal(0);
      expect(state.backgroundedAtStart).to.equal(0);
      expect(state.totalTime).to.equal(12);

      expect(state.elementX).to.be.undefined;
    });
  });

  it('should protect from invalid intersection values', () => {
    const target = win.document.createElement('div');
    root.listenElement(target, {}, null, eventResolver);
    expect(root.models_).to.have.length(1);
    const model = root.models_[0];

    const inOb = root.getIntersectionObserver_();
    expect(model.getVisibility_()).to.equal(0);

    // Valid value.
    inOb.callback([{target, intersectionRatio: 0.3}]);
    expect(model.getVisibility_()).to.equal(0.3);

    // Invalid negative value.
    inOb.callback([{target, intersectionRatio: -0.01}]);
    expect(model.getVisibility_()).to.equal(0);

    inOb.callback([{target, intersectionRatio: -1000}]);
    expect(model.getVisibility_()).to.equal(0);

    // Invalid overflow value.
    inOb.callback([{target, intersectionRatio: 1.01}]);
    expect(model.getVisibility_()).to.equal(1);

    inOb.callback([{target, intersectionRatio: 1000}]);
    expect(model.getVisibility_()).to.equal(1);
  });

  it('should listen on a element with different specs', () => {
    clock.tick(1);
    const inOb = root.getIntersectionObserver_();
    const target = win.document.createElement('div');

    // Listen to the first spec.
    const disposed1 = sandbox.spy();
    const spec1 = {totalTimeMin: 10};
    root.listenElement(target, spec1, null, null, eventResolver);
    expect(root.models_).to.have.length(1);
    const model1 = root.models_[0];
    expect(model1.spec_.totalTimeMin).to.equal(10);
    model1.unsubscribe(disposed1);
    expect(target.__AMP_VIS_ID).to.be.ok;
    const trackedElement = root.trackedElements_[target.__AMP_VIS_ID];
    expect(trackedElement.element).to.equal(target);
    expect(trackedElement.listeners).to.have.length(1);
    expect(inOb.elements).to.contain(target);

    // In viewport.
    inOb.callback([{
      target,
      intersectionRatio: 0.3,
    }]);
    expect(model1.getVisibility_()).to.equal(0.3);
    expect(trackedElement.intersectionRatio).to.equal(0.3);

    // Second spec on the same element.
    const disposed2 = sandbox.spy();
    const spec2 = {totalTimeMin: 20};
    let eventResolver2;
    const eventPromise2 = new Promise(resolve => {
      eventResolver2 = resolve;
    });
    root.listenElement(target, spec2, null, null, eventResolver2);
    expect(root.models_).to.have.length(2);
    const model2 = root.models_[1];
    expect(model2.spec_.totalTimeMin).to.equal(20);
    model2.unsubscribe(disposed2);
    expect(trackedElement.listeners).to.have.length(2);
    // Immediately visible.
    expect(model2.getVisibility_()).to.equal(0.3);

    // Fire the first event.
    clock.tick(11);
    return eventPromise.then(state => {
      // First event fired. The first model should be cleaned up, but not
      // the other.
      expect(state.totalVisibleTime).to.equal(10);
      expect(disposed1).to.be.calledOnce;
      expect(root.models_).to.have.length(1);
      expect(root.trackedElements_[target.__AMP_VIS_ID])
          .to.equal(trackedElement);
      expect(trackedElement.listeners).to.have.length(1);
      expect(inOb.elements).to.contain(target);

      // Fire the second event.
      clock.tick(10);
      return eventPromise2;
    }).then(state => {
      // Second event fired. Everything should be released now.
      expect(state.totalVisibleTime).to.equal(20);
      expect(disposed2).to.be.calledOnce;
      expect(root.models_).to.have.length(0);
      expect(root.trackedElements_[target.__AMP_VIS_ID]).to.not.exist;
      expect(trackedElement.listeners).to.have.length(0);
      expect(inOb.elements).to.not.contain(target);
    });
  });

  it('should listen on a resource', () => {
    clock.tick(1);
    const target = win.document.createElement('div');
    const resource = {
      getLayoutBox() {
        return {top: 10, left: 11, width: 110, height: 111};
      },
    };
    const resources = win.services.resources.obj;
    sandbox.stub(resources, 'getResourceForElementOptional',
        () => resource);
    const spec = {totalTimeMin: 10};
    root.listenElement(target, spec, null, null, eventResolver);

    const inOb = root.getIntersectionObserver_();
    inOb.callback([{
      target,
      intersectionRatio: 0.3,
    }]);

    // Fire event.
    clock.tick(11);
    return eventPromise.then(state => {
      expect(state.totalVisibleTime).to.equal(10);
      expect(state.elementY).to.equal(10);
      expect(state.elementX).to.equal(11);
      expect(state.elementWidth).to.equal(110);
      expect(state.elementHeight).to.equal(111);
    });
  });
});


describes.realWin('EmbedAnalyticsRoot', {
  amp: {ampdoc: 'fie'},
}, env => {
  let parentWin;
  let win;
  let ampdoc;
  let embed;
  let clock;
  let viewer;
  let parentRoot;
  let root;
  let inob;

  beforeEach(() => {
    parentWin = env.parentWin;
    win = env.win;
    ampdoc = env.ampdoc;
    embed = env.embed;
    embed.host = ampdoc.win.document.createElement('amp-host');
    clock = sandbox.useFakeTimers();
    clock.tick(1);

    viewer = parentWin.services.viewer.obj;
    sandbox.stub(viewer, 'getFirstVisibleTime', () => 1);

    parentRoot = new VisibilityManagerForDoc(ampdoc);
    parentWin.IntersectionObserver = IntersectionObserverStub;
    parentWin.IntersectionObserverEntry = function() {};
    parentWin.IntersectionObserverEntry.prototype.intersectionRatio = 1;

    root = new VisibilityManagerForEmbed(parentRoot, embed);
    inob = parentRoot.getIntersectionObserver_();
  });

  it('should dispose with parent', () => {
    const unsubscribeSpy = sandbox.spy();
    root.unsubscribe(unsubscribeSpy);

    expect(parentRoot.children_).to.have.length(1);
    expect(parentRoot.children_[0]).to.equal(root);

    parentRoot.dispose();
    expect(parentRoot.children_).to.have.length(0);
    expect(unsubscribeSpy).to.be.calledOnce;
  });

  it('should remove from parent when disposed', () => {
    const unsubscribeSpy = sandbox.spy();
    root.unsubscribe(unsubscribeSpy);

    expect(parentRoot.children_).to.have.length(1);
    expect(parentRoot.children_[0]).to.equal(root);

    root.dispose();
    expect(parentRoot.children_).to.have.length(0);
    expect(unsubscribeSpy).to.be.calledOnce;
  });

  it('should initialize correctly backgrounded', () => {
    viewer.setVisibilityState_(VisibilityState.HIDDEN);
    root = new VisibilityManagerForEmbed(parentRoot, embed);

    expect(root.parent).to.equal(parentRoot);
    expect(root.ampdoc).to.equal(ampdoc);
    expect(root.getStartTime()).to.equal(embed.getStartTime());
    expect(root.isBackgrounded()).to.be.true;
    expect(root.isBackgroundedAtStart()).to.be.true;

    // Root model starts invisible.
    expect(root.getRootVisibility()).to.equal(0);
  });

  it('should initialize correctly foregrounded', () => {
    expect(root.parent).to.equal(parentRoot);
    expect(root.ampdoc).to.equal(ampdoc);
    expect(root.getStartTime()).to.equal(embed.getStartTime());
    expect(root.isBackgrounded()).to.be.false;
    expect(root.isBackgroundedAtStart()).to.be.false;

    // Root model starts invisible.
    root.setRootVisibility(1);
    expect(root.getRootVisibility()).to.equal(1);
  });

  it('should ask parent to observe host element', () => {
    const id = embed.host.__AMP_VIS_ID;
    expect(parentRoot.trackedElements_[id]).to.be.ok;

    root.dispose();
    expect(parentRoot.trackedElements_[id]).to.be.undefined;
  });

  it('should delegate observation to parent', () => {
    const inOb = {
      observe: sandbox.spy(),
      unobserve: sandbox.spy(),
    };
    parentRoot.intersectionObserver_ = inOb;

    const listener = sandbox.spy();
    const target = win.document.createElement('div');

    // Observe.
    const unlisten = root.observe(target, listener);
    expect(inOb.observe).to.be.calledOnce;
    expect(inOb.observe).to.be.calledWith(target);
    const id = target.__AMP_VIS_ID;
    expect(parentRoot.trackedElements_[id]).to.be.ok;

    // Unobserve.
    unlisten();
    expect(inOb.unobserve).to.be.calledOnce;
    expect(inOb.unobserve).to.be.calledWith(target);
    expect(parentRoot.trackedElements_[id]).to.be.undefined;
  });

  it('should depend on parent for visibility', () => {
    const callbackSpy = sandbox.spy();
    const otherTarget = win.document.createElement('div');
    root.listenRoot({}, null, null, callbackSpy);
    expect(root.models_).to.have.length(1);
    const rootModel = root.models_[0];

    root.listenElement(otherTarget, {}, null, null, callbackSpy);
    expect(root.models_).to.have.length(2);
    const elementModel = root.models_[1];

    // Set up.
    expect(inob.elements).to.contain(embed.host);
    expect(inob.elements).to.contain(otherTarget);

    // Start state.
    expect(parentRoot.getRootVisibility()).to.equal(1);
    expect(root.getRootVisibility()).to.equal(0);
    expect(rootModel.getVisibility_()).to.equal(0);
    expect(elementModel.getVisibility_()).to.equal(0);

    // Make root visible.
    inob.callback([{
      target: embed.host,
      intersectionRatio: 0.5,
    }]);
    expect(root.getRootVisibility()).to.equal(0.5);
    expect(rootModel.getVisibility_()).to.equal(0.5);
    expect(elementModel.getVisibility_()).to.equal(0);

    // Make element visible.
    inob.callback([{
      target: otherTarget,
      intersectionRatio: 0.45,
    }]);
    expect(root.getRootVisibility()).to.equal(0.5);
    expect(rootModel.getVisibility_()).to.equal(0.5);
    expect(elementModel.getVisibility_()).to.equal(0.45);

    // Hide parent.
    viewer.setVisibilityState_(VisibilityState.HIDDEN);
    expect(parentRoot.getRootVisibility()).to.equal(0);
    expect(root.getRootVisibility()).to.equal(0);
    expect(rootModel.getVisibility_()).to.equal(0);
    expect(elementModel.getVisibility_()).to.equal(0);

    // Show parent.
    viewer.setVisibilityState_(VisibilityState.VISIBLE);
    expect(parentRoot.getRootVisibility()).to.equal(1);
    expect(root.getRootVisibility()).to.equal(0.5);
    expect(rootModel.getVisibility_()).to.equal(0.5);
    expect(elementModel.getVisibility_()).to.equal(0.45);

    // Hide root.
    inob.callback([{
      target: embed.host,
      intersectionRatio: 0,
    }]);
    expect(root.getRootVisibility()).to.equal(0);
    expect(rootModel.getVisibility_()).to.equal(0);
    expect(elementModel.getVisibility_()).to.equal(0);

    // Update element.
    inob.callback([{
      target: otherTarget,
      intersectionRatio: 0.55,
    }]);
    expect(root.getRootVisibility()).to.equal(0);
    expect(rootModel.getVisibility_()).to.equal(0);
    expect(elementModel.getVisibility_()).to.equal(0);

    // Show root.
    inob.callback([{
      target: embed.host,
      intersectionRatio: 0.7,
    }]);
    expect(root.getRootVisibility()).to.equal(0.7);
    expect(rootModel.getVisibility_()).to.equal(0.7);
    expect(elementModel.getVisibility_()).to.equal(0.55);
  });
});


describes.realWin('VisibilityManager integrated', {amp: true}, env => {
  let win, doc;
  let ampdoc;
  let viewer;
  let resources;
  let clock, startTime;
  let scrollTop;
  let inObCallback;
  let observeSpy;
  let unobserveSpy;
  let visibility;
  let ampElement;
  let eventPromise, eventResolver;
  let eventPromise2, eventResolver2;
  let readyPromise, readyResolver;
  let readyReportPromise, readyReportResolver;

  beforeEach(() => {
    win = env.win;
    doc = win.document;
    ampdoc = env.ampdoc;
    viewer = win.services.viewer.obj;
    resources = win.services.resources.obj;

    observeSpy = sandbox.stub();
    unobserveSpy = sandbox.stub();
    const inob = callback => {
      inObCallback = callback;
      return {
        observe: observeSpy,
        unobserve: unobserveSpy,
      };
    };
    if (nativeIntersectionObserverSupported(ampdoc.win)) {
      sandbox.stub(win, 'IntersectionObserver', inob);
    } else {
      win.IntersectionObserver = inob;
      win.IntersectionObserverEntry = function() {};
      win.IntersectionObserverEntry.prototype.intersectionRatio = 0;
      expect(nativeIntersectionObserverSupported(ampdoc.win)).to.be.true;
    }

    readyPromise = new Promise(resolve => {
      readyResolver = resolve;
    });
    readyReportPromise = new Promise(resolve => {
      readyReportResolver = resolve;
    });
    eventPromise = new Promise(resolve => {
      eventResolver = resolve;
    });
    eventPromise2 = new Promise(resolve => {
      eventResolver2 = resolve;
    });

    const docState = documentStateFor(win);
    sandbox.stub(docState, 'isHidden', () => false);
    sandbox.stub(viewer, 'getFirstVisibleTime', () => startTime);

    ampElement = doc.createElement('amp-img');
    ampElement.id = 'abc';
    ampElement.setAttribute('width', '100');
    ampElement.setAttribute('height', '100');
    doc.body.appendChild(ampElement);
    return new Promise(resolve => {
      if (resources.getResourceForElementOptional(ampElement)) {
        resolve();
      } else {
        const interval = setInterval(() => {
          if (resources.getResourceForElementOptional(ampElement)) {
            clearInterval(interval);
            resolve();
          }
        }, 4);
      }
    }).then(() => {
      clock = sandbox.useFakeTimers();
      startTime = 10000;
      clock.tick(startTime);

      const resource = resources.getResourceForElement(ampElement);
      scrollTop = 10;
      sandbox.stub(resource, 'getLayoutBox',
          () => layoutRectLtwh(0, scrollTop, 100, 100));
    });
  });

  function fireIntersect(intersectPercent) {
    scrollTop = 100 - intersectPercent;
    const entry = makeIntersectionEntry(
        [0, scrollTop, 100, 100], [0, 0, 100, 100]);
    inObCallback([entry]);
  }

  function makeIntersectionEntry(boundingClientRect, rootBounds) {
    boundingClientRect = layoutRectLtwh.apply(null, boundingClientRect);
    rootBounds = layoutRectLtwh.apply(null, rootBounds);
    const intersect = rectIntersection(boundingClientRect, rootBounds);
    const ratio = (intersect.width * intersect.height) /
        (boundingClientRect.width * boundingClientRect.height);
    return {
      intersectionRect: intersect,
      boundingClientRect,
      rootBounds,
      intersectionRatio: ratio,
      target: ampElement,
    };
  }

  function isModelResolved(model) {
    return !model.eventResolver_;
  }

  it('should execute "visible" trigger with simple spec', () => {
    viewer.setVisibilityState_(VisibilityState.VISIBLE);
    visibility = new VisibilityManagerForDoc(ampdoc);

    visibility.listenElement(ampElement, {}, readyPromise, () => {
      return readyReportPromise;
    }, eventResolver);

    return Promise.resolve().then(() => {
      clock.tick(100);
      fireIntersect(25); // visible
      readyResolver();
    }).then(() => {
      clock.tick(5);
      readyReportResolver();
      return eventPromise;
    }).then(state => {
      expect(state).to.contains({
        backgrounded: 0,
        backgroundedAtStart: 0,
        elementHeight: 100,
        elementWidth: 100,
        elementX: 0,
        elementY: 75,
        firstSeenTime: 100,
        lastSeenTime: 105,
        lastVisibleTime: 105,
        loadTimeVisibility: 25,
        maxVisiblePercentage: 25,
        minVisiblePercentage: 25,
        totalVisibleTime: 5,
        maxContinuousVisibleTime: 5,
      });
    });
  });

  it('should triger "visible" with no duration condition', () => {
    viewer.setVisibilityState_(VisibilityState.VISIBLE);
    visibility = new VisibilityManagerForDoc(ampdoc);

    visibility.listenElement(
        ampElement,
        {visiblePercentageMin: 20},
        readyPromise,
        null,
        eventResolver);

    // add multiple triggers on the same element
    visibility.listenElement(
        ampElement,
        {visiblePercentageMin: 30},
        readyPromise,
        null,
        eventResolver2);

    // "observe" should not have been called since resource not loaded yet.
    expect(observeSpy).to.be.called;
    readyResolver();
    return Promise.resolve().then(() => {
      expect(observeSpy).to.be.calledWith(ampElement);

      clock.tick(135);
      fireIntersect(5); // below visiblePercentageMin, no trigger

      clock.tick(100);
      fireIntersect(25); // above spec 1 min visible, trigger callback 1
      return eventPromise.then(state => {
        expect(state).to.contains({
          backgrounded: 0,
          backgroundedAtStart: 0,
          elementHeight: 100,
          elementWidth: 100,
          elementX: 0,
          elementY: 75,
          firstSeenTime: 135,
          lastSeenTime: 235,
          lastVisibleTime: 235,
          loadTimeVisibility: 5,
          maxVisiblePercentage: 25,
          minVisiblePercentage: 25,
          totalVisibleTime: 0,  // duration metrics are always 0
          maxContinuousVisibleTime: 0,  // as it triggers immediately
        });
        expect(unobserveSpy).to.not.be.called;

        clock.tick(100);
        fireIntersect(35); // above spec 2 min visible, trigger callback 2
        return eventPromise2;
      }).then(state => {
        expect(state).to.contains({
          backgrounded: 0,
          backgroundedAtStart: 0,
          elementHeight: 100,
          elementWidth: 100,
          elementX: 0,
          elementY: 65,
          firstSeenTime: 135,
          lastSeenTime: 335,
          lastVisibleTime: 335,
          loadTimeVisibility: 5,
          maxVisiblePercentage: 35,
          minVisiblePercentage: 35,
          totalVisibleTime: 0,  // duration metrics is always 0
          maxContinuousVisibleTime: 0,  // as it triggers immediately
        });
      });
    }).then(() => {
      expect(unobserveSpy).to.be.called; // unobserve when all callback fired
    });
  });

  it('should trigger "visible" with duration condition', () => {
    viewer.setVisibilityState_(VisibilityState.VISIBLE);
    visibility = new VisibilityManagerForDoc(ampdoc);

    visibility.listenElement(
        ampElement,
        {continuousTimeMin: 1000},
        readyPromise,
        null,
        eventResolver);
    const model = visibility.models_[0];

    readyResolver();
    return Promise.resolve().then(() => {
      expect(observeSpy).to.be.calledWith(ampElement);

      clock.tick(100);
      fireIntersect(25); // visible
      expect(isModelResolved(model)).to.be.false;

      clock.tick(999);
      fireIntersect(0); // this will reset the timer for continuous time
      expect(isModelResolved(model)).to.be.false;

      clock.tick(100);
      fireIntersect(5); // visible again.
      expect(isModelResolved(model)).to.be.false;

      clock.tick(100);
      // Enters background. this will reset the timer for continuous time
      viewer.setVisibilityState_(VisibilityState.HIDDEN);
      expect(isModelResolved(model)).to.be.false;

      clock.tick(2000); // this 2s should not be counted in visible time
      expect(isModelResolved(model)).to.be.false;
      viewer.setVisibilityState_(VisibilityState.VISIBLE); // now we're back

      clock.tick(100);
      fireIntersect(35); // keep being visible
      expect(isModelResolved(model)).to.be.false;
      clock.tick(899); // not yet!
      expect(isModelResolved(model)).to.be.false;
      clock.tick(1);  // now fire
      expect(isModelResolved(model)).to.be.true;
      return eventPromise.then(state => {
        expect(state).to.contains({
          backgrounded: 1,
          backgroundedAtStart: 0,
          elementHeight: 100,
          elementWidth: 100,
          elementX: 0,
          elementY: 65,
          firstSeenTime: 100,
          lastSeenTime: 4299,
          lastVisibleTime: 4299,
          loadTimeVisibility: 25,
          maxVisiblePercentage: 35,
          minVisiblePercentage: 5,
          totalVisibleTime: 2099,
          maxContinuousVisibleTime: 1000,
        });
      });
    });
  });

  it('should populate "backgrounded" and "backgroundedAtStart"', () => {
    viewer.setVisibilityState_(VisibilityState.HIDDEN);
    visibility = new VisibilityManagerForDoc(ampdoc);

    visibility.listenElement(
        ampElement,
        {},
        readyPromise,
        null,
        eventResolver);

    viewer.setVisibilityState_(VisibilityState.VISIBLE);
    readyResolver();
    return Promise.resolve().then(() => {
      expect(observeSpy).to.be.calledWith(ampElement);

      clock.tick(100);
      fireIntersect(25); // visible
      return eventPromise.then(state => {
        expect(state).to.contains({
          backgroundedAtStart: 1,
          backgrounded: 1,
        });
      });
    });
  });
});
