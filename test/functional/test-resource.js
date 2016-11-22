/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
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
import {layoutRectLtwh} from '../../src/layout-rect';
import * as sinon from 'sinon';


describe('Resource', () => {

  let sandbox;
  let element;
  let elementMock;
  let resources;
  let resource;
  let viewportMock;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();

    element = {
      ownerDocument: {defaultView: window},
      tagName: 'AMP-AD',
      style: {},
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
      dispatchCustomEvent: () => {},
    };
    elementMock = sandbox.mock(element);

    resources = new Resources(new AmpDocSingle(window));
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
    expect(resource.getState()).to.equal(ResourceState.NOT_BUILT);
    expect(resource.getLayoutBox().width).to.equal(0);
    expect(resource.getLayoutBox().height).to.equal(0);
    expect(resource.isInViewport()).to.equal(false);
  });

  it('should initialize correctly when already built', () => {
    elementMock.expects('isBuilt').returns(true).once();
    expect(new Resource(1, element).getState()).to.equal(
        ResourceState.NOT_LAID_OUT);
  });

  it('should not build before upgraded', () => {
    elementMock.expects('isUpgraded').returns(false).atLeast(1);
    elementMock.expects('build').never();

    resource.build();
    expect(resource.getState()).to.equal(ResourceState.NOT_BUILT);
  });


  it('should build after upgraded', () => {
    elementMock.expects('isUpgraded').returns(true).atLeast(1);
    elementMock.expects('build').once();
    resource.build();
    expect(resource.getState()).to.equal(ResourceState.NOT_LAID_OUT);
  });

  it('should blacklist on build failure', () => {
    elementMock.expects('isUpgraded').returns(true).atLeast(1);
    elementMock.expects('build').throws('Failed').once();
    resource.build();
    expect(resource.blacklisted_).to.equal(true);
    expect(resource.getState()).to.equal(ResourceState.NOT_BUILT);
  });

  it('should mark as ready for layout if already measured', () => {
    elementMock.expects('isUpgraded').returns(true).atLeast(1);
    elementMock.expects('build').once();
    const stub = sandbox.stub(resource, 'hasBeenMeasured').returns(true);
    resource.build(false);
    expect(stub.calledOnce).to.be.true;
    expect(resource.getState()).to.equal(ResourceState.READY_FOR_LAYOUT);
  });

  it('should mark as not laid out if not yet measured', () => {
    elementMock.expects('isUpgraded').returns(true).atLeast(1);
    elementMock.expects('build').once();
    const stub = sandbox.stub(resource, 'hasBeenMeasured').returns(false);
    resource.build(false);
    expect(stub.calledOnce).to.be.true;
    expect(resource.getState()).to.equal(ResourceState.NOT_LAID_OUT);
  });

  it('should allow to measure when not upgraded', () => {
    elementMock.expects('isUpgraded').returns(false).atLeast(1);
    const viewport = {
      getLayoutRect() {
        return layoutRectLtwh(0, 100, 300, 100);
      },
      isDeclaredFixed() {
        return false;
      },
    };
    resource.resources_ = {
      win: window,
      getViewport: () => viewport,
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
    expect(resource.getState()).to.equal(ResourceState.NOT_BUILT);
    expect(resource.isFixed()).to.be.false;
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
    expect(resource.getState()).to.equal(ResourceState.READY_FOR_LAYOUT);
    expect(resource.getLayoutBox().left).to.equal(11);
    expect(resource.getLayoutBox().top).to.equal(12);
    expect(resource.getLayoutBox().width).to.equal(111);
    expect(resource.getLayoutBox().height).to.equal(222);
    expect(resource.isFixed()).to.be.false;
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
    resource.state_ = ResourceState.READY_FOR_LAYOUT;
    resource.requestMeasure();
    expect(resource.isMeasureRequested()).to.be.true;
  });

  it('should always layout if has not been laid out before', () => {
    elementMock.expects('isUpgraded').returns(true).atLeast(1);
    resource.state_ = ResourceState.NOT_LAID_OUT;
    resource.layoutBox_ = {left: 11, top: 12, width: 111, height: 222};

    elementMock.expects('getBoundingClientRect')
        .returns(resource.layoutBox_).once();
    resource.measure();
    expect(resource.getState()).to.equal(ResourceState.READY_FOR_LAYOUT);
  });

  it('should not relayout if has box has not changed', () => {
    resource.state_ = ResourceState.LAYOUT_COMPLETE;
    resource.layoutBox_ = {left: 11, top: 12, width: 111, height: 222};

    // Left is not part of validation.
    elementMock.expects('getBoundingClientRect')
        .returns({left: 11 + 10, top: 12, width: 111, height: 222}).once();
    resource.measure();
    expect(resource.getState()).to.equal(ResourceState.LAYOUT_COMPLETE);
    expect(resource.getLayoutBox().left).to.equal(11 + 10);
  });

  it('should not relayout if box changed but element didn\'t opt in', () => {
    elementMock.expects('isUpgraded').returns(true).atLeast(1);
    resource.state_ = ResourceState.LAYOUT_COMPLETE;
    resource.layoutBox_ = {left: 11, top: 12, width: 111, height: 222};

    // Width changed.
    elementMock.expects('getBoundingClientRect')
        .returns({left: 11, top: 12, width: 111 + 10, height: 222}).once();
    elementMock.expects('isRelayoutNeeded').returns(false).atLeast(1);
    resource.measure();
    expect(resource.getState()).to.equal(ResourceState.LAYOUT_COMPLETE);
    expect(resource.getLayoutBox().width).to.equal(111 + 10);
  });

  it('should relayout if box changed when element opted in', () => {
    elementMock.expects('isUpgraded').returns(true).atLeast(1);
    resource.state_ = ResourceState.LAYOUT_COMPLETE;
    resource.layoutBox_ = {left: 11, top: 12, width: 111, height: 222};

    // Width changed.
    elementMock.expects('getBoundingClientRect')
        .returns({left: 11, top: 12, width: 111 + 10, height: 222}).once();
    elementMock.expects('isRelayoutNeeded').returns(true).atLeast(1);
    resource.measure();
    expect(resource.getState()).to.equal(ResourceState.READY_FOR_LAYOUT);
    expect(resource.getLayoutBox().width).to.equal(111 + 10);
  });

  it('should calculate NOT fixed for non-displayed elements', () => {
    elementMock.expects('isUpgraded').returns(true).atLeast(1);
    elementMock.expects('getBoundingClientRect').returns(
        layoutRectLtwh(0, 0, 0, 0)).once();
    element.isAlwaysFixed = () => true;
    resource.measure();
    expect(resource.isFixed()).to.be.false;
  });

  it('should calculate fixed for always-fixed parent', () => {
    elementMock.expects('isUpgraded').returns(true).atLeast(1);
    elementMock.expects('getBoundingClientRect').returns(
        layoutRectLtwh(0, 0, 10, 10)).once();
    element.offsetParent = {
      isAlwaysFixed: () => true,
    };
    resource.measure();
    expect(resource.isFixed()).to.be.true;
  });

  it('should calculate fixed for fixed-style parent', () => {
    elementMock.expects('isUpgraded').returns(true).atLeast(1);
    elementMock.expects('getBoundingClientRect').returns(
        layoutRectLtwh(0, 0, 10, 10)).once();
    const fixedParent = document.createElement('div');
    fixedParent.style.position = 'fixed';
    document.body.appendChild(fixedParent);
    element.offsetParent = fixedParent;
    viewportMock.expects('isDeclaredFixed')
        .withExactArgs(element)
        .returns(false)
        .once();
    viewportMock.expects('isDeclaredFixed')
        .withExactArgs(fixedParent)
        .returns(true)
        .once();
    resource.measure();
    expect(resource.isFixed()).to.be.true;
  });

  it('should hide and update layout box on collapse', () => {
    resource.layoutBox_ = {left: 11, top: 12, width: 111, height: 222};
    resource.isFixed_ = true;
    elementMock.expects('updateLayoutBox')
        .withExactArgs(sinon.match(data => {
          return data.width == 0 && data.height == 0;
        }))
        .once();

    resource.completeCollapse();
    expect(resource.element.style.display).to.equal('none');
    expect(resource.getLayoutBox().width).to.equal(0);
    expect(resource.getLayoutBox().height).to.equal(0);
    expect(resource.isFixed()).to.be.false;
  });


  it('should ignore startLayout if already completed or failed or going',
        () => {
          elementMock.expects('layoutCallback').never();

          resource.state_ = ResourceState.LAYOUT_COMPLETE;
          resource.startLayout(true);

          resource.state_ = ResourceState.LAYOUT_FAILED;
          resource.startLayout(true);

          resource.state_ = ResourceState.READY_FOR_LAYOUT;
          resource.layoutPromise_ = {};
          resource.startLayout(true);
        });

  it('should fail startLayout if not built', () => {
    elementMock.expects('layoutCallback').never();

    resource.state_ = ResourceState.NOT_BUILT;
    expect(() => {
      resource.startLayout(true);
    }).to.throw(/Not ready to start layout/);
  });

  it('should ignore startLayout if not visible', () => {
    elementMock.expects('isUpgraded').returns(true).atLeast(1);
    elementMock.expects('getBoundingClientRect')
        .returns({left: 1, top: 1, width: 1, height: 1}).once();

    elementMock.expects('layoutCallback').never();

    resource.state_ = ResourceState.READY_FOR_LAYOUT;
    resource.layoutBox_ = {left: 11, top: 12, width: 0, height: 0};
    resource.startLayout(true);
  });

  it('should force startLayout for first layout', () => {
    elementMock.expects('isUpgraded').returns(true).atLeast(1);
    elementMock.expects('getBoundingClientRect')
        .returns({left: 1, top: 1, width: 1, height: 1}).once();

    elementMock.expects('layoutCallback').returns(Promise.resolve()).once();

    resource.state_ = ResourceState.READY_FOR_LAYOUT;
    resource.layoutBox_ = {left: 11, top: 12, width: 10, height: 10};
    resource.startLayout(true);
    expect(resource.getState()).to.equal(ResourceState.LAYOUT_SCHEDULED);
  });

  it('should ignore startLayout for re-layout when not opt-in', () => {
    elementMock.expects('isUpgraded').returns(true).atLeast(1);
    elementMock.expects('getBoundingClientRect')
        .returns({left: 1, top: 1, width: 1, height: 1}).once();

    elementMock.expects('layoutCallback').never();

    resource.state_ = ResourceState.READY_FOR_LAYOUT;
    resource.layoutBox_ = {left: 11, top: 12, width: 10, height: 10};
    resource.layoutCount_ = 1;
    elementMock.expects('isRelayoutNeeded').returns(false).atLeast(1);
    resource.startLayout(true);
    expect(resource.getState()).to.equal(ResourceState.LAYOUT_COMPLETE);
  });

  it('should force startLayout for re-layout when opt-in', () => {
    elementMock.expects('isUpgraded').returns(true).atLeast(1);
    elementMock.expects('getBoundingClientRect')
        .returns({left: 1, top: 1, width: 1, height: 1}).once();

    elementMock.expects('layoutCallback').returns(Promise.resolve()).once();

    resource.state_ = ResourceState.READY_FOR_LAYOUT;
    resource.layoutBox_ = {left: 11, top: 12, width: 10, height: 10};
    resource.layoutCount_ = 1;
    elementMock.expects('isRelayoutNeeded').returns(true).atLeast(1);
    resource.startLayout(true);
    expect(resource.getState()).to.equal(ResourceState.LAYOUT_SCHEDULED);
  });

  it('should ignore startLayout when document is hidden' +
        ' and prerender not allowed', () => {
    elementMock.expects('isUpgraded').returns(true).atLeast(0);
    elementMock.expects('getBoundingClientRect')
        .returns({left: 1, top: 1, width: 1, height: 1}).atLeast(0);
    elementMock.expects('prerenderAllowed').returns(false).atLeast(1);

    elementMock.expects('layoutCallback').never();

    resource.state_ = ResourceState.READY_FOR_LAYOUT;
    resource.layoutBox_ = {left: 11, top: 12, width: 10, height: 10};
    resource.layoutCount_ = 0;
    resource.startLayout(false);
    expect(resource.getState()).to.equal(ResourceState.READY_FOR_LAYOUT);
  });

  it('should proceed startLayout when document is hidden' +
        ' and prerender is allowed', () => {
    elementMock.expects('isUpgraded').returns(true).atLeast(0);
    elementMock.expects('getBoundingClientRect')
        .returns({left: 1, top: 1, width: 1, height: 1}).atLeast(0);
    elementMock.expects('prerenderAllowed').returns(true).atLeast(1);

    elementMock.expects('layoutCallback').returns(Promise.resolve()).once();

    resource.state_ = ResourceState.READY_FOR_LAYOUT;
    resource.layoutBox_ = {left: 11, top: 12, width: 10, height: 10};
    resource.layoutCount_ = 0;
    resource.startLayout(false);
    expect(resource.getState()).to.equal(ResourceState.LAYOUT_SCHEDULED);
  });


  it('should complete startLayout', () => {
    elementMock.expects('isUpgraded').returns(true).atLeast(1);
    elementMock.expects('getBoundingClientRect')
        .returns({left: 1, top: 1, width: 1, height: 1}).once();

    elementMock.expects('layoutCallback').returns(Promise.resolve()).once();

    resource.state_ = ResourceState.READY_FOR_LAYOUT;
    resource.layoutBox_ = {left: 11, top: 12, width: 10, height: 10};
    const loaded = resource.loadedOnce();
    const promise = resource.startLayout(true);
    expect(resource.layoutPromise_).to.not.equal(null);
    expect(resource.getState()).to.equal(ResourceState.LAYOUT_SCHEDULED);

    return promise.then(() => {
      expect(resource.getState()).to.equal(ResourceState.LAYOUT_COMPLETE);
      expect(resource.layoutPromise_).to.equal(null);
      return loaded;  // Just making sure this doesn't time out.
    });
  });

  it('should fail startLayout', () => {
    elementMock.expects('isUpgraded').returns(true).atLeast(1);
    elementMock.expects('getBoundingClientRect')
        .returns({left: 1, top: 1, width: 1, height: 1}).once();

    elementMock.expects('layoutCallback').returns(Promise.reject()).once();

    resource.state_ = ResourceState.READY_FOR_LAYOUT;
    resource.layoutBox_ = {left: 11, top: 12, width: 10, height: 10};
    const promise = resource.startLayout(true);
    expect(resource.layoutPromise_).to.not.equal(null);
    expect(resource.getState()).to.equal(ResourceState.LAYOUT_SCHEDULED);

    return promise.then(() => {
      /* global fail: false */
      fail('should not be here');
    }, () => {
      expect(resource.getState()).to.equal(ResourceState.LAYOUT_FAILED);
      expect(resource.layoutPromise_).to.equal(null);
    });
  });

  it('should change size and update state', () => {
    resource.state_ = ResourceState.READY_FOR_LAYOUT;
    elementMock.expects('changeSize').withExactArgs(111, 222).once();
    resource.changeSize(111, 222);
    expect(resource.getState()).to.equal(ResourceState.NOT_LAID_OUT);
  });

  it('should change size but not state', () => {
    resource.state_ = ResourceState.NOT_BUILT;
    elementMock.expects('changeSize').withExactArgs(111, 222).once();
    resource.changeSize(111, 222);
    expect(resource.getState()).to.equal(ResourceState.NOT_BUILT);
  });


  describe('setInViewport', () => {
    it('should call viewportCallback when not built', () => {
      resource.state_ = ResourceState.NOT_BUILT;
      elementMock.expects('viewportCallback').withExactArgs(true).once();
      resource.setInViewport(true);
      expect(resource.isInViewport()).to.equal(true);
    });

    it('should call viewportCallback when built', () => {
      resource.state_ = ResourceState.LAYOUT_COMPLETE;
      elementMock.expects('viewportCallback').withExactArgs(true).once();
      resource.setInViewport(true);
      expect(resource.isInViewport()).to.equal(true);
    });

    it('should call viewportCallback only once', () => {
      resource.state_ = ResourceState.LAYOUT_COMPLETE;
      elementMock.expects('viewportCallback').withExactArgs(true).once();
      resource.setInViewport(true);
      resource.setInViewport(true);
      resource.setInViewport(true);
    });
  });

  describe('Resource set/get ownership', () => {
    let child;
    let parentResource;
    let resources;
    let grandChild;
    beforeEach(() => {
      const parent = {
        ownerDocument: {defaultView: window},
        tagName: 'PARENT',
        isBuilt: () => false,
        contains: () => true,
      };
      child = {
        ownerDocument: {defaultView: window},
        tagName: 'CHILD',
        isBuilt: () => false,
        contains: () => true,
        parentElement: parent,
      };
      grandChild = {
        ownerDocument: {defaultView: window},
        tagName: 'GRANDCHILD',
        isBuilt: () => false,
        contains: () => true,
        getElementsByClassName: () => {return [];},
        parentElement: child,
      };
      parent.getElementsByClassName = () => {return [child, grandChild];};
      child.getElementsByClassName = () => {return [grandChild];};
      resources = new Resources(new AmpDocSingle(window));
      parentResource = new Resource(1, parent, resources);
    });

    it('should set resource before Resource created for child element', () => {
      resources.setOwner(child, parentResource.element);
      const childResource = new Resource(1, child, resources);
      expect(childResource.getOwner()).to.equal(parentResource.element);
    });

    it('should always get the lastest owner value', () => {
      const childResource = new Resource(1, child, resources);
      expect(childResource.getOwner()).to.be.null;
      resources.setOwner(childResource.element, parentResource.element);
      expect(childResource.owner_).to.equal(parentResource.element);
      expect(childResource.getOwner()).to.equal(parentResource.element);
    });

    it('should remove cached value for grandchild', () => {
      const childResource = new Resource(1, child, resources);
      const grandChildResource = new Resource(1, grandChild, resources);
      expect(grandChildResource.getOwner()).to.be.null;
      resources.setOwner(childResource.element, parentResource.element);
      expect(childResource.getOwner()).to.equal(parentResource.element);
      expect(grandChildResource.getOwner()).to.equal(parentResource.element);
    });

    it('should not change owner if it is set via setOwner', () => {
      const childResource = new Resource(1, child, resources);
      const grandChildResource = new Resource(1, grandChild, resources);
      resources.setOwner(grandChildResource.element, parentResource.element);
      expect(grandChildResource.getOwner()).to.equal(parentResource.element);
      resources.setOwner(childResource.element, parentResource.element);
      expect(grandChildResource.getOwner()).to.equal(parentResource.element);
    });
  });

  describe('unlayoutCallback', () => {
    it('should NOT call unlayoutCallback on unbuilt element', () => {
      resource.state_ = ResourceState.NOT_BUILT;
      elementMock.expects('viewportCallback').never();
      elementMock.expects('unlayoutCallback').never();
      resource.unlayout();
      expect(resource.getState()).to.equal(ResourceState.NOT_BUILT);
    });

    it('should call unlayoutCallback on built element and update state',
        () => {
          resource.state_ = ResourceState.LAYOUT_COMPLETE;
          elementMock.expects('unlayoutCallback').returns(true).once();
          elementMock.expects('togglePlaceholder').withArgs(true).once();
          resource.unlayout();
          expect(resource.getState()).to.equal(ResourceState.NOT_LAID_OUT);
        });

    it('updated state should bypass isRelayoutNeeded', () => {
      resource.state_ = ResourceState.LAYOUT_COMPLETE;
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
      resource.state_ = ResourceState.LAYOUT_COMPLETE;
      elementMock.expects('unlayoutCallback').returns(false).once();
      elementMock.expects('togglePlaceholder').withArgs(true).never();
      resource.unlayout();
      expect(resource.getState()).to.equal(ResourceState.LAYOUT_COMPLETE);
    });

    it('should NOT call viewportCallback when resource not in viewport', () => {
      resource.state_ = ResourceState.LAYOUT_COMPLETE;
      resource.isInViewport_ = false;
      elementMock.expects('viewportCallback').never();
      resource.unlayout();
    });

    it('should call viewportCallback when resource in viewport', () => {
      resource.state_ = ResourceState.LAYOUT_COMPLETE;
      resource.isInViewport_ = true;
      elementMock.expects('viewportCallback').withExactArgs(false).once();
      resource.unlayout();
    });

    it('should delegate unload to unlayoutCallback', () => {
      resource.state_ = ResourceState.LAYOUT_COMPLETE;
      elementMock.expects('unlayoutCallback').returns(false).once();
      elementMock.expects('togglePlaceholder').withArgs(true).never();
      resource.unload();
      expect(resource.getState()).to.equal(ResourceState.LAYOUT_COMPLETE);
    });
  });

  describe('pauseCallback', () => {
    it('should NOT call pauseCallback on unbuilt element', () => {
      resource.state_ = ResourceState.NOT_BUILT;
      elementMock.expects('pauseCallback').never();
      resource.pause();
    });

    it('should NOT call pauseCallback on paused element', () => {
      resource.state_ = ResourceState.LAYOUT_COMPLETE;
      resource.paused_ = true;
      elementMock.expects('pauseCallback').never();
      resource.pause();
    });

    it('should call pauseCallback on built element', () => {
      resource.state_ = ResourceState.LAYOUT_COMPLETE;
      elementMock.expects('pauseCallback').once();
      resource.pause();
    });

    it('should NOT call unlayoutCallback', () => {
      resource.state_ = ResourceState.LAYOUT_COMPLETE;
      elementMock.expects('pauseCallback').once();
      elementMock.expects('unlayoutCallback').never();
      resource.pause();
    });

    describe('when unlayoutOnPause', () => {
      beforeEach(() => {
        elementMock.expects('unlayoutOnPause').returns(true).once();
      });

      it('should call unlayoutCallback and update state', () => {
        resource.state_ = ResourceState.LAYOUT_COMPLETE;
        elementMock.expects('pauseCallback').once();
        elementMock.expects('unlayoutCallback').returns(true).once();
        resource.pause();
        expect(resource.getState()).to.equal(ResourceState.NOT_LAID_OUT);
      });

      it('should call unlayoutCallback but NOT update state', () => {
        resource.state_ = ResourceState.LAYOUT_COMPLETE;
        elementMock.expects('pauseCallback').once();
        elementMock.expects('unlayoutCallback').returns(false).once();
        resource.pause();
        expect(resource.getState()).to.equal(ResourceState.LAYOUT_COMPLETE);
      });
    });

    describe('when remove from DOM', () => {
      it('should not call pauseCallback on remove for unbuilt ele', () => {
        resource.state_ = ResourceState.NOT_BUILT;
        resource.pauseOnRemove();
        elementMock.expects('pauseCallback').never();
        elementMock.expects('viewportCallback').never();
      });

      it('should call pauseCallback on remove for built ele', () => {
        resource.state_ = ResourceState.LAYOUT_COMPLETE;
        resource.isInViewport_ = true;
        resource.paused_ = false;
        elementMock.expects('pauseCallback').once();
        elementMock.expects('viewportCallback').once();
        resource.pauseOnRemove();
        expect(resource.isInViewport_).to.equal(false);
        expect(resource.paused_).to.equal(true);
      });
    });
  });

  describe('resumeCallback', () => {
    it('should NOT call resumeCallback on unbuilt element', () => {
      resource.state_ = ResourceState.NOT_BUILT;
      elementMock.expects('resumeCallback').never();
      resource.resume();
    });

    it('should NOT call resumeCallback on un-paused element', () => {
      resource.state_ = ResourceState.LAYOUT_COMPLETE;
      elementMock.expects('resumeCallback').never();
      resource.resume();
    });

    it('should call resumeCallback on built element', () => {
      resource.state_ = ResourceState.LAYOUT_COMPLETE;
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
        isFixed: () => false,
        prerenderAllowed: () => true,
        overlaps: () => true,
      };
      resource2 = {
        hasOwner: () => false,
        isDisplayed: () => true,
        isFixed: () => false,
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
  let resources;
  let resource;
  let viewport;
  let renderOutsideViewport;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();

    element = {
      ownerDocument: {defaultView: window},
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

    resources = new Resources(new AmpDocSingle(window));
    resource = new Resource(1, element, resources);
    viewport = resources.viewport_;
    renderOutsideViewport = sandbox.stub(element, 'renderOutsideViewport');
    sandbox.stub(viewport, 'getRect').returns(layoutRectLtwh(0, 0, 100, 100));
  });

  afterEach(() => {
    sandbox.restore();
  });


  describe('boolean API', () => {
    describe('when element returns true', () => {
      beforeEach(() => {
        renderOutsideViewport.returns(true);
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

        describe('when element is owned', () => {
          beforeEach(() => {
            sandbox.stub(resource, 'hasOwner', () => true);
          });

          it('should allow rendering when bottom falls outside', () => {
            resource.layoutBox_ = layoutRectLtwh(0, 10, 100, 100);
            expect(resource.renderOutsideViewport()).to.equal(true);
          });

          it('should allow rendering when top falls outside', () => {
            resource.layoutBox_ = layoutRectLtwh(0, -10, 100, 100);
            expect(resource.renderOutsideViewport()).to.equal(true);
          });
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

        describe('when element is owned', () => {
          beforeEach(() => {
            sandbox.stub(resource, 'hasOwner', () => true);
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

        describe('when element is owned', () => {
          beforeEach(() => {
            sandbox.stub(resource, 'hasOwner', () => true);
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

        describe('when element is owned', () => {
          beforeEach(() => {
            sandbox.stub(resource, 'hasOwner', () => true);
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

        describe('when element is owned', () => {
          beforeEach(() => {
            sandbox.stub(resource, 'hasOwner', () => true);
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

        describe('when element is owned', () => {
          beforeEach(() => {
            sandbox.stub(resource, 'hasOwner', () => true);
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

        describe('when element is owned', () => {
          beforeEach(() => {
            sandbox.stub(resource, 'hasOwner', () => true);
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
    });

    describe('when element returns false', () => {
      beforeEach(() => {
        renderOutsideViewport.returns(false);
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

        describe('when element is owned', () => {
          beforeEach(() => {
            sandbox.stub(resource, 'hasOwner', () => true);
          });

          it('should allow rendering when bottom falls outside', () => {
            resource.layoutBox_ = layoutRectLtwh(0, 10, 100, 100);
            expect(resource.renderOutsideViewport()).to.equal(true);
          });

          it('should allow rendering when top falls outside', () => {
            resource.layoutBox_ = layoutRectLtwh(0, -10, 100, 100);
            expect(resource.renderOutsideViewport()).to.equal(true);
          });
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

        describe('when element is owned', () => {
          beforeEach(() => {
            sandbox.stub(resource, 'hasOwner', () => true);
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

        describe('when element is owned', () => {
          beforeEach(() => {
            sandbox.stub(resource, 'hasOwner', () => true);
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

        describe('when element is owned', () => {
          beforeEach(() => {
            sandbox.stub(resource, 'hasOwner', () => true);
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

        describe('when element is owned', () => {
          beforeEach(() => {
            sandbox.stub(resource, 'hasOwner', () => true);
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

        describe('when element is owned', () => {
          beforeEach(() => {
            sandbox.stub(resource, 'hasOwner', () => true);
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

        describe('when element is owned', () => {
          beforeEach(() => {
            sandbox.stub(resource, 'hasOwner', () => true);
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
    });
  });

  describe('number API', () => {
    beforeEach(() => {
      renderOutsideViewport.returns(3);
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

      describe('when element is owned', () => {
        beforeEach(() => {
          sandbox.stub(resource, 'hasOwner', () => true);
        });

        it('should allow rendering when bottom falls outside', () => {
          resource.layoutBox_ = layoutRectLtwh(0, 10, 100, 100);
          expect(resource.renderOutsideViewport()).to.equal(true);
        });

        it('should allow rendering when top falls outside', () => {
          resource.layoutBox_ = layoutRectLtwh(0, -10, 100, 100);
          expect(resource.renderOutsideViewport()).to.equal(true);
        });
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

      describe('when element is owned', () => {
        beforeEach(() => {
          sandbox.stub(resource, 'hasOwner', () => true);
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

      describe('when element is owned', () => {
        beforeEach(() => {
          sandbox.stub(resource, 'hasOwner', () => true);
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

      describe('when element is owned', () => {
        beforeEach(() => {
          sandbox.stub(resource, 'hasOwner', () => true);
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

      describe('when element is owned', () => {
        beforeEach(() => {
          sandbox.stub(resource, 'hasOwner', () => true);
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

      describe('when element is owned', () => {
        beforeEach(() => {
          sandbox.stub(resource, 'hasOwner', () => true);
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

      describe('when element is owned', () => {
        beforeEach(() => {
          sandbox.stub(resource, 'hasOwner', () => true);
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

    describe('when element is on the left of viewport', () => {
      beforeEach(() => {
        resource.layoutBox_ = layoutRectLtwh(-200, 0, 100, 100);
      });

      it('should disallow rendering', () => {
        expect(resource.renderOutsideViewport()).to.equal(false);
      });

      it('should disallow rendering when scrolling towards on y-axis', () => {
        resources.lastVelocity_ = -2;
        expect(resource.renderOutsideViewport()).to.equal(false);
      });

      it('should disallow rendering when scrolling away on y-axis', () => {
        resources.lastVelocity_ = 2;
        expect(resource.renderOutsideViewport()).to.equal(false);
      });

      describe('when element is owned', () => {
        beforeEach(() => {
          sandbox.stub(resource, 'hasOwner', () => true);
        });

        it('should allow rendering', () => {
          expect(resource.renderOutsideViewport()).to.equal(true);
        });

        it('should allow rendering when scrolling towards on y-axis', () => {
          resources.lastVelocity_ = -2;
          expect(resource.renderOutsideViewport()).to.equal(true);
        });

        it('should allow rendering when scrolling away on y-axis', () => {
          resources.lastVelocity_ = 2;
          expect(resource.renderOutsideViewport()).to.equal(true);
        });
      });
    });

    describe('when element is on the right of viewport', () => {
      beforeEach(() => {
        resource.layoutBox_ = layoutRectLtwh(200, 0, 100, 100);
      });

      it('should disallow rendering', () => {
        expect(resource.renderOutsideViewport()).to.equal(false);
      });

      it('should disallow rendering when scrolling towards on y-axis', () => {
        resources.lastVelocity_ = -2;
        expect(resource.renderOutsideViewport()).to.equal(false);
      });

      it('should disallow rendering when scrolling away on y-axis', () => {
        resources.lastVelocity_ = 2;
        expect(resource.renderOutsideViewport()).to.equal(false);
      });

      describe('when element is owned', () => {
        beforeEach(() => {
          sandbox.stub(resource, 'hasOwner', () => true);
        });

        it('should allow rendering', () => {
          expect(resource.renderOutsideViewport()).to.equal(true);
        });

        it('should allow rendering when scrolling towards on y-axis', () => {
          resources.lastVelocity_ = -2;
          expect(resource.renderOutsideViewport()).to.equal(true);
        });

        it('should allow rendering when scrolling away on y-axis', () => {
          resources.lastVelocity_ = 2;
          expect(resource.renderOutsideViewport()).to.equal(true);
        });
      });
    });

    describe('when element is fully in viewport', () => {
      beforeEach(() => {
        resource.layoutBox_ = layoutRectLtwh(0, 0, 100, 100);
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

      describe('when element is owned', () => {
        beforeEach(() => {
          sandbox.stub(resource, 'hasOwner', () => true);
        });

        it('should allow rendering', () => {
          expect(resource.renderOutsideViewport()).to.equal(true);
        });

        it('should allow rendering when scrolling towards on y-axis', () => {
          resources.lastVelocity_ = -2;
          expect(resource.renderOutsideViewport()).to.equal(true);
        });

        it('should allow rendering when scrolling away on y-axis', () => {
          resources.lastVelocity_ = 2;
          expect(resource.renderOutsideViewport()).to.equal(true);
        });
      });
    });

    describe('when element is partially in viewport', () => {
      beforeEach(() => {
        resource.layoutBox_ = layoutRectLtwh(-50, -50, 100, 100);
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

      describe('when element is owned', () => {
        beforeEach(() => {
          sandbox.stub(resource, 'hasOwner', () => true);
        });

        it('should allow rendering', () => {
          expect(resource.renderOutsideViewport()).to.equal(true);
        });

        it('should allow rendering when scrolling towards on y-axis', () => {
          resources.lastVelocity_ = -2;
          expect(resource.renderOutsideViewport()).to.equal(true);
        });

        it('should allow rendering when scrolling away on y-axis', () => {
          resources.lastVelocity_ = 2;
          expect(resource.renderOutsideViewport()).to.equal(true);
        });
      });
    });
  });
});
