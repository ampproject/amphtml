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

import * as sinon from 'sinon';
import {AmpDocSingle} from '../../src/service/ampdoc-impl';
import {Resource, ResourceState} from '../../src/service/resource';
import {Resources} from '../../src/service/resources-impl';
import {Services} from '../../src/services';
import {layoutRectLtwh} from '../../src/layout-rect';


describes.realWin('Resource', {amp: true}, env => {
  let win, doc;
  let element;
  let elementMock;
  let resources;
  let resource;
  let viewportMock;

  beforeEach(() => {
    win = env.win;
    doc = win.document;

    element = env.createAmpElement('amp-ad');
    sandbox.stub(element, 'getPriority').callsFake(() => 2);
    elementMock = sandbox.mock(element);

    const viewer = Services.viewerForDoc(document);
    sandbox.stub(viewer, 'isRuntimeOn').callsFake(() => false);
    resources = new Resources(new AmpDocSingle(window));
    resource = new Resource(1, element, resources);
    viewportMock = sandbox.mock(resources.viewport_);

    resources.win = {
      document,
      getComputedStyle: el => {
        return el.fakeComputedStyle ?
          el.fakeComputedStyle : window.getComputedStyle(el);
      },
    };
  });

  afterEach(() => {
    viewportMock.verify();
    elementMock.verify();
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
    elementMock.expects('updateLayoutBox').never();

    expect(resource.build()).to.be.null;
    expect(resource.getState()).to.equal(ResourceState.NOT_BUILT);
  });


  it('should build after upgraded', () => {
    const buildPromise = Promise.resolve();
    elementMock.expects('isUpgraded').returns(true).atLeast(1);
    elementMock.expects('build').returns(buildPromise).once();
    elementMock.expects('updateLayoutBox').never();
    return resource.build().then(() => {
      expect(resource.getState()).to.equal(ResourceState.NOT_LAID_OUT);
    });
  });

  it('should not build if permission is not granted', () => {
    let permission = false;
    elementMock.expects('isUpgraded').returns(true).atLeast(1);
    sandbox.stub(resources, 'grantBuildPermission').callsFake(() => permission);
    elementMock.expects('updateLayoutBox').never();
    expect(resource.build()).to.be.null;
    expect(resource.getState()).to.equal(ResourceState.NOT_BUILT);

    permission = true;
    elementMock.expects('build').returns(Promise.resolve()).once();
    return resource.build().then(() => {
      expect(resource.getState()).to.equal(ResourceState.NOT_LAID_OUT);
    });
  });

  it('should blacklist on build failure', () => {
    elementMock.expects('isUpgraded').returns(true).atLeast(1);
    elementMock.expects('build')
        .returns(Promise.reject(new Error('intentional'))).once();
    elementMock.expects('updateLayoutBox').never();
    const buildPromise = resource.build();
    expect(resource.isBuilding()).to.be.true;
    return buildPromise.then(() => {
      throw new Error('must have failed');
    }, () => {
      expect(resource.isBuilding()).to.be.false;
      expect(resource.getState()).to.equal(ResourceState.NOT_BUILT);
    });
  });

  it('should mark as ready for layout if already measured', () => {
    const box = layoutRectLtwh(0, 0, 100, 200);
    elementMock.expects('isUpgraded').returns(true).atLeast(1);
    elementMock.expects('build').returns(Promise.resolve()).once();
    elementMock.expects('updateLayoutBox')
        .withExactArgs(box)
        .once();
    const stub = sandbox.stub(resource, 'hasBeenMeasured').returns(true);
    resource.layoutBox_ = box;
    return resource.build().then(() => {
      expect(stub).to.be.calledOnce;
      expect(resource.getState()).to.equal(ResourceState.READY_FOR_LAYOUT);
    });
  });

  it('should mark as not laid out if not yet measured', () => {
    elementMock.expects('isUpgraded').returns(true).atLeast(1);
    elementMock.expects('build').returns(Promise.resolve()).once();
    const stub = sandbox.stub(resource, 'hasBeenMeasured').returns(false);
    return resource.build().then(() => {
      expect(stub.calledOnce).to.be.true;
      expect(resource.getState()).to.equal(ResourceState.NOT_LAID_OUT);
    });
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
    resource.resources_.getViewport = () => viewport;
    expect(() => {
      resource.measure();
    }).to.not.throw();
    expect(resource.getLayoutBox()).to.eql(layoutRectLtwh(0, 100, 300, 100));
    // pageLayoutBox == layoutBox
    expect(resource.getPageLayoutBox()).to.eql(
        layoutRectLtwh(0, 100, 300, 100));
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
    elementMock.expects('build').returns(Promise.resolve()).once();
    return resource.build().then(() => {
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
  });

  it('should update initial box only on first measure', () => {
    elementMock.expects('isUpgraded').returns(true).atLeast(1);
    elementMock.expects('build').returns(Promise.resolve()).once();
    return resource.build().then(() => {
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
  });

  it('should request measure even when not built', () => {
    expect(resource.isMeasureRequested()).to.be.false;
    elementMock.expects('getBoundingClientRect').never();
    resource.requestMeasure();
    expect(resource.isMeasureRequested()).to.be.true;
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
    viewportMock.expects('getScrollTop').returns(11).atLeast(0);
    Object.defineProperty(element, 'offsetParent', {
      value: {
        isAlwaysFixed: () => true,
      },
    });
    resource.measure();
    expect(resource.isFixed()).to.be.true;
    // layoutBox != pageLayoutBox
    expect(resource.getLayoutBox()).to.eql(layoutRectLtwh(0, 11, 10, 10));
    expect(resource.getPageLayoutBox()).to.eql(layoutRectLtwh(0, 0, 10, 10));
  });

  it('should calculate fixed for fixed-style parent', () => {
    elementMock.expects('isUpgraded').returns(true).atLeast(1);
    elementMock.expects('getBoundingClientRect').returns(
        layoutRectLtwh(0, 0, 10, 10)).once();
    viewportMock.expects('getScrollTop').returns(11).atLeast(0);
    const fixedParent = doc.createElement('div');
    fixedParent.style.position = 'fixed';
    doc.body.appendChild(fixedParent);
    fixedParent.appendChild(element);
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
    // layoutBox != pageLayoutBox
    expect(resource.getLayoutBox()).to.eql(layoutRectLtwh(0, 11, 10, 10));
    expect(resource.getPageLayoutBox()).to.eql(layoutRectLtwh(0, 0, 10, 10));
  });

  it('should not subtract viewport scroll offset for inabox', () => {
    win.AMP_MODE = {runtime: 'inabox'};
    elementMock.expects('isUpgraded').returns(true).atLeast(1);
    elementMock.expects('getBoundingClientRect').returns(
        layoutRectLtwh(0, 0, 10, 10)).once();
    viewportMock.expects('getScrollTop').returns(123).atLeast(0);
    const fixedParent = doc.createElement('div');
    fixedParent.style.position = 'fixed';
    doc.body.appendChild(fixedParent);
    fixedParent.appendChild(element);
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
    expect(resource.getLayoutBox()).to.eql(layoutRectLtwh(0, 123, 10, 10));
  });

  describe('placeholder measure', () => {
    let rect;

    beforeEach(() => {
      element.setAttribute('placeholder', '');
      Object.defineProperty(element, 'parentElement', {
        value: doc.createElement('amp-iframe'),
      });
      element.parentElement.__AMP__RESOURCE = {};
      elementMock.expects('isUpgraded').returns(true).atLeast(1);
      elementMock.expects('build').returns(Promise.resolve()).once();
      rect = {left: 11, top: 12, width: 111, height: 222};
      resource = new Resource(1, element, resources);
      return resource.build();
    });

    it('should measure placeholder with stubbed parent', () => {
      elementMock.expects('getBoundingClientRect').returns(rect).once();
      resource.measure();

      expect(resource.getState()).to.equal(ResourceState.READY_FOR_LAYOUT);
      expect(resource.hasBeenMeasured()).to.be.true;
    });

    it('should NOT measure placeholder with unstubbed parent', () => {
      // Parent is not stubbed yet, w/o __AMP__RESOURCE.
      delete element.parentElement.__AMP__RESOURCE;

      elementMock.expects('getBoundingClientRect').never();
      resource.measure();

      expect(resource.getState()).to.equal(ResourceState.NOT_LAID_OUT);
      expect(resource.hasBeenMeasured()).to.be.false;
    });

    it('should support abnormal case with no parent', () => {
      delete element.parentElement;

      elementMock.expects('getBoundingClientRect').returns(rect).once();
      resource.measure();

      expect(resource.getState()).to.equal(ResourceState.READY_FOR_LAYOUT);
      expect(resource.hasBeenMeasured()).to.be.true;
    });

    it('should support abnormal case with non-AMP parent', () => {
      element.parentElement = document.createElement('div');

      elementMock.expects('getBoundingClientRect').returns(rect).once();
      resource.measure();

      expect(resource.getState()).to.equal(ResourceState.READY_FOR_LAYOUT);
      expect(resource.hasBeenMeasured()).to.be.true;
    });
  });

  it('should hide and update layout box on collapse', () => {
    resource.layoutBox_ = {left: 11, top: 12, width: 111, height: 222};
    resource.isFixed_ = true;
    elementMock.expects('updateLayoutBox')
        .withExactArgs(sinon.match(data => {
          return data.width == 0 && data.height == 0;
        }))
        .once();
    const owner = {
      collapsedCallback: sandbox.spy(),
    };
    sandbox.stub(resource, 'getOwner').callsFake(() => {
      return owner;
    });
    resource.completeCollapse();
    expect(resource.element.style.display).to.equal('none');
    expect(resource.getLayoutBox().width).to.equal(0);
    expect(resource.getLayoutBox().height).to.equal(0);
    expect(resource.isFixed()).to.be.false;
    expect(owner.collapsedCallback).to.be.calledOnce;
  });

  it('should show and request measure on expand', () => {
    resource.element.style.display = 'none';
    resource.layoutBox_ = {left: 11, top: 12, width: 0, height: 0};
    resource.isFixed_ = false;
    resource.requestMeasure = sandbox.stub();

    resource.completeExpand();
    expect(resource.element.style.display).to.not.equal('none');
    expect(resource.requestMeasure).to.be.calledOnce;
  });

  it('should show and request measure on expand', () => {
    resource.element.style.display = 'none';
    resource.layoutBox_ = {left: 11, top: 12, width: 0, height: 0};
    resource.isFixed_ = false;
    resource.requestMeasure = sandbox.stub();

    resource.completeExpand();
    expect(resource.element.style.display).to.not.equal('none');
    expect(resource.requestMeasure).to.be.calledOnce;
  });


  it('should ignore startLayout if already completed or failed or going',
      () => {
        elementMock.expects('layoutCallback').never();

        resource.state_ = ResourceState.LAYOUT_COMPLETE;
        resource.startLayout();

        resource.state_ = ResourceState.LAYOUT_FAILED;
        resource.startLayout();

        resource.state_ = ResourceState.READY_FOR_LAYOUT;
        resource.layoutPromise_ = {};
        resource.startLayout();
      });

  it('should fail startLayout if not built', () => {
    elementMock.expects('layoutCallback').never();

    resource.state_ = ResourceState.NOT_BUILT;
    expect(() => {
      resource.startLayout();
    }).to.throw(/Not ready to start layout/);
  });

  it('should ignore startLayout if not visible', () => {
    elementMock.expects('layoutCallback').never();
    resource.state_ = ResourceState.READY_FOR_LAYOUT;
    resource.layoutBox_ = {left: 11, top: 12, width: 0, height: 0};
    expect(() => {
      resource.startLayout();
    }).to.throw(/Not displayed/);
  });

  it('should force startLayout for first layout', () => {
    elementMock.expects('layoutCallback').returns(Promise.resolve()).once();

    resource.state_ = ResourceState.READY_FOR_LAYOUT;
    resource.layoutBox_ = {left: 11, top: 12, width: 10, height: 10};
    resource.startLayout();
    expect(resource.getState()).to.equal(ResourceState.LAYOUT_SCHEDULED);
  });

  it('should ignore startLayout for re-layout when not opt-in', () => {
    elementMock.expects('layoutCallback').never();

    resource.state_ = ResourceState.READY_FOR_LAYOUT;
    resource.layoutBox_ = {left: 11, top: 12, width: 10, height: 10};
    resource.layoutCount_ = 1;
    elementMock.expects('isRelayoutNeeded').returns(false).atLeast(1);
    resource.startLayout();
    expect(resource.getState()).to.equal(ResourceState.LAYOUT_COMPLETE);
  });

  it('should force startLayout for re-layout when opt-in', () => {
    elementMock.expects('layoutCallback').returns(Promise.resolve()).once();

    resource.state_ = ResourceState.READY_FOR_LAYOUT;
    resource.layoutBox_ = {left: 11, top: 12, width: 10, height: 10};
    resource.layoutCount_ = 1;
    elementMock.expects('isRelayoutNeeded').returns(true).atLeast(1);
    resource.startLayout();
    expect(resource.getState()).to.equal(ResourceState.LAYOUT_SCHEDULED);
  });

  it('should complete startLayout', () => {
    elementMock.expects('layoutCallback').returns(Promise.resolve()).once();

    resource.state_ = ResourceState.READY_FOR_LAYOUT;
    resource.layoutBox_ = {left: 11, top: 12, width: 10, height: 10};
    const loaded = resource.loadedOnce();
    const promise = resource.startLayout();
    expect(resource.layoutPromise_).to.not.equal(null);
    expect(resource.getState()).to.equal(ResourceState.LAYOUT_SCHEDULED);

    return promise.then(() => {
      expect(resource.getState()).to.equal(ResourceState.LAYOUT_COMPLETE);
      expect(resource.layoutPromise_).to.equal(null);
      return loaded; // Just making sure this doesn't time out.
    });
  });

  it('should complete startLayout with height == 0', () => {
    elementMock.expects('layoutCallback').returns(Promise.resolve()).once();
    elementMock.expects('getLayout').returns('fluid').once();

    resource.state_ = ResourceState.READY_FOR_LAYOUT;
    resource.layoutBox_ = {left: 11, top: 12, width: 10, height: 0};
    const loaded = resource.loadedOnce();
    const promise = resource.startLayout();
    expect(resource.layoutPromise_).to.not.equal(null);
    expect(resource.getState()).to.equal(ResourceState.LAYOUT_SCHEDULED);

    return promise.then(() => {
      expect(resource.getState()).to.equal(ResourceState.LAYOUT_COMPLETE);
      expect(resource.layoutPromise_).to.equal(null);
      return loaded;
    });
  });

  it('should fail startLayout', () => {
    const error = new Error('intentional');
    elementMock.expects('layoutCallback')
        .returns(Promise.reject(error)).once();

    resource.state_ = ResourceState.READY_FOR_LAYOUT;
    resource.layoutBox_ = {left: 11, top: 12, width: 10, height: 10};
    const promise = resource.startLayout();
    expect(resource.layoutPromise_).to.not.equal(null);
    expect(resource.getState()).to.equal(ResourceState.LAYOUT_SCHEDULED);

    return promise.then(() => {
      /* global fail: false */
      fail('should not be here');
    }, () => {
      expect(resource.getState()).to.equal(ResourceState.LAYOUT_FAILED);
      expect(resource.layoutPromise_).to.equal(null);
      expect(resource.lastLayoutError_).to.equal(error);

      // Should fail with the same error again.
      return resource.startLayout();
    }).then(() => {
      /* global fail: false */
      fail('should not be here');
    }, reason => {
      expect(reason).to.equal(error);
    });
  });

  it('should record layout schedule time', () => {
    resource.layoutScheduled(300);
    expect(resource.element.layoutScheduleTime).to.equal(300);

    // The time should be updated if scheduled multiple times.
    resource.layoutScheduled(400);
    expect(resource.element.layoutScheduleTime).to.equal(400);

    expect(resource.getState()).to.equal(ResourceState.LAYOUT_SCHEDULED);
  });

  it('should not record layout schedule time in startLayout', () => {
    resource.state_ = ResourceState.READY_FOR_LAYOUT;
    resource.layoutBox_ = {left: 11, top: 12, width: 10, height: 10};
    resource.startLayout();

    expect(resource.element.layoutScheduleTime).to.be.undefined;
    expect(resource.getState()).to.equal(ResourceState.LAYOUT_SCHEDULED);
  });

  it('should change size and update state', () => {
    expect(resource.isMeasureRequested()).to.be.false;
    resource.state_ = ResourceState.READY_FOR_LAYOUT;
    elementMock.expects('changeSize').withExactArgs(111, 222,
        {top: 1, right: 2, bottom: 3, left: 4}).once();
    resource.changeSize(111, 222, {top: 1, right: 2, bottom: 3, left: 4});
    expect(resource.isMeasureRequested()).to.be.true;
  });

  it('should change size but not state', () => {
    resource.state_ = ResourceState.NOT_BUILT;
    elementMock.expects('changeSize').withExactArgs(111, 222,
        {top: 1, right: 2, bottom: 3, left: 4}).once();
    resource.changeSize(111, 222, {top: 1, right: 2, bottom: 3, left: 4});
    expect(resource.getState()).to.equal(ResourceState.NOT_BUILT);
  });

  it('should update priority', () => {
    expect(resource.getPriority()).to.equal(2);

    resource.updatePriority(2);
    expect(resource.getPriority()).to.equal(2);

    resource.updatePriority(3);
    expect(resource.getPriority()).to.equal(3);

    resource.updatePriority(1);
    expect(resource.getPriority()).to.equal(1);

    resource.updatePriority(0);
    expect(resource.getPriority()).to.equal(0);
  });


  describe('setInViewport', () => {
    it('should call viewportCallback when not built', () => {
      resource.state_ = ResourceState.NOT_BUILT;
      resource.setInViewport(true);
      expect(resource.isInViewport()).to.equal(true);
    });

    it('should call viewportCallback when built', () => {
      resource.state_ = ResourceState.LAYOUT_COMPLETE;
      resource.setInViewport(true);
      expect(resource.isInViewport()).to.equal(true);
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
        hasAttribute: () => false,
        isBuilt: () => false,
        contains: () => true,
      };
      child = {
        ownerDocument: {defaultView: window},
        tagName: 'CHILD',
        hasAttribute: () => false,
        isBuilt: () => false,
        contains: () => true,
        parentElement: parent,
      };
      grandChild = {
        ownerDocument: {defaultView: window},
        tagName: 'GRANDCHILD',
        hasAttribute: () => false,
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
      resource.measure();
      resource.startLayout();
    });

    it('should call unlayoutCallback on built element' +
        ' but NOT update state', () => {
      resource.state_ = ResourceState.LAYOUT_COMPLETE;
      elementMock.expects('unlayoutCallback').returns(false).once();
      elementMock.expects('togglePlaceholder').withArgs(true).never();
      resource.unlayout();
      expect(resource.getState()).to.equal(ResourceState.LAYOUT_COMPLETE);
    });

    it('should call viewportCallback when resource not in viewport', () => {
      resource.state_ = ResourceState.LAYOUT_COMPLETE;
      elementMock.expects('viewportCallback').withExactArgs(false).once();
      resource.unlayout();
    });

    it('should call viewportCallback when resource in viewport', () => {
      resource.state_ = ResourceState.LAYOUT_COMPLETE;
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
    it('should call pauseCallback on unbuilt element', () => {
      resource.state_ = ResourceState.NOT_BUILT;
      elementMock.expects('pauseCallback').once();
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
      it('should call pauseCallback on remove for unbuilt ele', () => {
        resource.state_ = ResourceState.NOT_BUILT;
        elementMock.expects('pauseCallback').once();
        resource.pauseOnRemove();
      });

      it('should call pauseCallback on remove for built ele', () => {
        resource.state_ = ResourceState.LAYOUT_COMPLETE;
        elementMock.expects('pauseCallback').once();
        resource.pauseOnRemove();
      });

      it('should call disconnectedCallback on remove for built ele', () => {
        expect(Resource.forElementOptional(resource.element))
            .to.equal(resource);
        elementMock.expects('disconnectedCallback').once();
        resource.disconnect();
        expect(Resource.forElementOptional(resource.element)).to.not.exist;
      });
    });
  });

  describe('resumeCallback', () => {
    it('should call resumeCallback on unbuilt element', () => {
      resource.state_ = ResourceState.NOT_BUILT;
      elementMock.expects('resumeCallback').once();
      resource.resume();
    });

    it('should call resumeCallback on un-paused element', () => {
      resource.state_ = ResourceState.LAYOUT_COMPLETE;
      elementMock.expects('resumeCallback').once();
      resource.resume();
    });
  });
});

describe('Resource idleRenderOutsideViewport', () => {
  let sandbox;
  let element;
  let resources;
  let resource;
  let idleRenderOutsideViewport;
  let withinViewportMultiplier;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    sandbox = sinon.sandbox.create();
    idleRenderOutsideViewport = sandbox.stub();
    element = {
      idleRenderOutsideViewport,
      ownerDocument: {defaultView: window},
      tagName: 'AMP-AD',
      hasAttribute: () => false,
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
    withinViewportMultiplier =
        sandbox.stub(resource, 'withinViewportMultiplier');
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should return true if withinViewportMultiplier', () => {
    idleRenderOutsideViewport.returns(5);
    withinViewportMultiplier.withArgs(5).returns(true);
    expect(resource.idleRenderOutsideViewport()).to.equal(true);
  });

  it('should return false for false element idleRenderOutsideViewport', () => {
    idleRenderOutsideViewport.returns(false);
    withinViewportMultiplier.withArgs(false).returns(false);
    expect(resource.idleRenderOutsideViewport()).to.equal(false);
  });
});

describe('Resource renderOutsideViewport', () => {
  let sandbox;
  let element;
  let resources;
  let resource;
  let viewport;
  let renderOutsideViewport;
  let resolveRenderOutsideViewportSpy;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();

    element = {
      ownerDocument: {defaultView: window},
      tagName: 'AMP-AD',
      hasAttribute: () => false,
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
    resolveRenderOutsideViewportSpy =
      sandbox.spy(resource, 'resolveRenderOutsideViewport_');
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
          expect(resolveRenderOutsideViewportSpy).to.be.calledOnce;
        });

        it('should allow rendering when top falls outside', () => {
          resource.layoutBox_ = layoutRectLtwh(0, -10, 100, 100);
          expect(resource.renderOutsideViewport()).to.equal(true);
          expect(resolveRenderOutsideViewportSpy).to.be.calledOnce;
        });

        describe('when element is owned', () => {
          beforeEach(() => {
            sandbox.stub(resource, 'hasOwner').callsFake(() => true);
          });

          it('should allow rendering when bottom falls outside', () => {
            resource.layoutBox_ = layoutRectLtwh(0, 10, 100, 100);
            expect(resource.renderOutsideViewport()).to.equal(true);
            expect(resolveRenderOutsideViewportSpy).to.be.calledOnce;
          });

          it('should allow rendering when top falls outside', () => {
            resource.layoutBox_ = layoutRectLtwh(0, -10, 100, 100);
            expect(resource.renderOutsideViewport()).to.equal(true);
            expect(resolveRenderOutsideViewportSpy).to.be.calledOnce;
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
          expect(resolveRenderOutsideViewportSpy).to.be.calledOnce;
        });

        it('should allow rendering when scrolling away', () => {
          resources.lastVelocity_ = -2;
          expect(resource.renderOutsideViewport()).to.equal(true);
          expect(resolveRenderOutsideViewportSpy).to.be.calledOnce;
        });

        describe('when element is owned', () => {
          beforeEach(() => {
            sandbox.stub(resource, 'hasOwner').callsFake(() => true);
          });

          it('should allow rendering when scrolling towards', () => {
            resources.lastVelocity_ = 2;
            expect(resource.renderOutsideViewport()).to.equal(true);
            expect(resolveRenderOutsideViewportSpy).to.be.calledOnce;
          });

          it('should allow rendering when scrolling away', () => {
            resources.lastVelocity_ = -2;
            expect(resource.renderOutsideViewport()).to.equal(true);
            expect(resolveRenderOutsideViewportSpy).to.be.calledOnce;
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
          expect(resolveRenderOutsideViewportSpy).to.be.calledOnce;
        });

        it('should allow rendering when scrolling away', () => {
          resources.lastVelocity_ = -2;
          expect(resource.renderOutsideViewport()).to.equal(true);
          expect(resolveRenderOutsideViewportSpy).to.be.calledOnce;
        });

        describe('when element is owned', () => {
          beforeEach(() => {
            sandbox.stub(resource, 'hasOwner').callsFake(() => true);
          });

          it('should allow rendering when scrolling towards', () => {
            resources.lastVelocity_ = 2;
            expect(resource.renderOutsideViewport()).to.equal(true);
            expect(resolveRenderOutsideViewportSpy).to.be.calledOnce;
          });

          it('should allow rendering when scrolling away', () => {
            resources.lastVelocity_ = -2;
            expect(resource.renderOutsideViewport()).to.equal(true);
            expect(resolveRenderOutsideViewportSpy).to.be.calledOnce;
          });
        });
      });

      describe('when element is wayyy below viewport', () => {
        beforeEach(() => {
          resource.layoutBox_ = layoutRectLtwh(0, 1000, 100, 100);
        });

        it('should allow rendering', () => {
          expect(resource.renderOutsideViewport()).to.equal(true);
          expect(resolveRenderOutsideViewportSpy).to.be.calledOnce;
        });

        it('should allow rendering when scrolling towards', () => {
          resources.lastVelocity_ = 2;
          expect(resource.renderOutsideViewport()).to.equal(true);
          expect(resolveRenderOutsideViewportSpy).to.be.calledOnce;
        });

        it('should allow rendering when scrolling away', () => {
          resources.lastVelocity_ = -2;
          expect(resource.renderOutsideViewport()).to.equal(true);
          expect(resolveRenderOutsideViewportSpy).to.be.calledOnce;
        });

        describe('when element is owned', () => {
          beforeEach(() => {
            sandbox.stub(resource, 'hasOwner').callsFake(() => true);
          });

          it('should allow rendering', () => {
            expect(resource.renderOutsideViewport()).to.equal(true);
            expect(resolveRenderOutsideViewportSpy).to.be.calledOnce;
          });

          it('should allow rendering when scrolling towards', () => {
            resources.lastVelocity_ = 2;
            expect(resource.renderOutsideViewport()).to.equal(true);
            expect(resolveRenderOutsideViewportSpy).to.be.calledOnce;
          });

          it('should allow rendering when scrolling away', () => {
            resources.lastVelocity_ = -2;
            expect(resource.renderOutsideViewport()).to.equal(true);
            expect(resolveRenderOutsideViewportSpy).to.be.calledOnce;
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
          expect(resolveRenderOutsideViewportSpy).to.be.calledOnce;
        });

        it('should allow rendering when scrolling away', () => {
          resources.lastVelocity_ = 2;
          expect(resource.renderOutsideViewport()).to.equal(true);
          expect(resolveRenderOutsideViewportSpy).to.be.calledOnce;
        });

        describe('when element is owned', () => {
          beforeEach(() => {
            sandbox.stub(resource, 'hasOwner').callsFake(() => true);
          });

          it('should allow rendering when scrolling towards', () => {
            resources.lastVelocity_ = -2;
            expect(resource.renderOutsideViewport()).to.equal(true);
            expect(resolveRenderOutsideViewportSpy).to.be.calledOnce;
          });

          it('should allow rendering when scrolling away', () => {
            resources.lastVelocity_ = 2;
            expect(resource.renderOutsideViewport()).to.equal(true);
            expect(resolveRenderOutsideViewportSpy).to.be.calledOnce;
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
          expect(resolveRenderOutsideViewportSpy).to.be.calledOnce;
        });

        it('should allow rendering when scrolling away', () => {
          resources.lastVelocity_ = 2;
          expect(resource.renderOutsideViewport()).to.equal(true);
          expect(resolveRenderOutsideViewportSpy).to.be.calledOnce;
        });

        describe('when element is owned', () => {
          beforeEach(() => {
            sandbox.stub(resource, 'hasOwner').callsFake(() => true);
          });

          it('should allow rendering when scrolling towards', () => {
            resources.lastVelocity_ = -2;
            expect(resource.renderOutsideViewport()).to.equal(true);
            expect(resolveRenderOutsideViewportSpy).to.be.calledOnce;
          });

          it('should allow rendering when scrolling away', () => {
            resources.lastVelocity_ = 2;
            expect(resource.renderOutsideViewport()).to.equal(true);
            expect(resolveRenderOutsideViewportSpy).to.be.calledOnce;
          });
        });
      });

      describe('when element is wayyy above viewport', () => {
        beforeEach(() => {
          resource.layoutBox_ = layoutRectLtwh(0, -1000, 100, 100);
        });

        it('should allow rendering', () => {
          expect(resource.renderOutsideViewport()).to.equal(true);
          expect(resolveRenderOutsideViewportSpy).to.be.calledOnce;
        });

        it('should allow rendering when scrolling towards', () => {
          resources.lastVelocity_ = -2;
          expect(resource.renderOutsideViewport()).to.equal(true);
          expect(resolveRenderOutsideViewportSpy).to.be.calledOnce;
        });

        it('should allow rendering when scrolling away', () => {
          resources.lastVelocity_ = 2;
          expect(resource.renderOutsideViewport()).to.equal(true);
          expect(resolveRenderOutsideViewportSpy).to.be.calledOnce;
        });

        describe('when element is owned', () => {
          beforeEach(() => {
            sandbox.stub(resource, 'hasOwner').callsFake(() => true);
          });

          it('should allow rendering', () => {
            expect(resource.renderOutsideViewport()).to.equal(true);
            expect(resolveRenderOutsideViewportSpy).to.be.calledOnce;
          });

          it('should allow rendering when scrolling towards', () => {
            resources.lastVelocity_ = -2;
            expect(resource.renderOutsideViewport()).to.equal(true);
            expect(resolveRenderOutsideViewportSpy).to.be.calledOnce;
          });

          it('should allow rendering when scrolling away', () => {
            resources.lastVelocity_ = 2;
            expect(resource.renderOutsideViewport()).to.equal(true);
            expect(resolveRenderOutsideViewportSpy).to.be.calledOnce;
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
          expect(resolveRenderOutsideViewportSpy).to.not.be.called;
        });

        it('should allow rendering when top falls outside', () => {
          resource.layoutBox_ = layoutRectLtwh(0, -10, 100, 100);
          expect(resource.renderOutsideViewport()).to.equal(false);
          expect(resolveRenderOutsideViewportSpy).to.not.be.called;
        });

        describe('when element is owned', () => {
          beforeEach(() => {
            sandbox.stub(resource, 'hasOwner').callsFake(() => true);
          });

          it('should allow rendering when bottom falls outside', () => {
            resource.layoutBox_ = layoutRectLtwh(0, 10, 100, 100);
            expect(resource.renderOutsideViewport()).to.equal(true);
            expect(resolveRenderOutsideViewportSpy).to.be.calledOnce;
          });

          it('should allow rendering when top falls outside', () => {
            resource.layoutBox_ = layoutRectLtwh(0, -10, 100, 100);
            expect(resource.renderOutsideViewport()).to.equal(true);
            expect(resolveRenderOutsideViewportSpy).to.be.calledOnce;
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
          expect(resolveRenderOutsideViewportSpy).to.not.be.called;
        });

        it('should disallow rendering when scrolling away', () => {
          resources.lastVelocity_ = -2;
          expect(resource.renderOutsideViewport()).to.equal(false);
          expect(resolveRenderOutsideViewportSpy).to.not.be.called;
        });

        describe('when element is owned', () => {
          beforeEach(() => {
            sandbox.stub(resource, 'hasOwner').callsFake(() => true);
          });

          it('should allow rendering when scrolling towards', () => {
            resources.lastVelocity_ = 2;
            expect(resource.renderOutsideViewport()).to.equal(true);
            expect(resolveRenderOutsideViewportSpy).to.be.calledOnce;
          });

          it('should allow rendering when scrolling away', () => {
            resources.lastVelocity_ = -2;
            expect(resource.renderOutsideViewport()).to.equal(true);
            expect(resolveRenderOutsideViewportSpy).to.be.calledOnce;
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
          expect(resolveRenderOutsideViewportSpy).to.not.be.called;
        });

        it('should disallow rendering when scrolling away', () => {
          resources.lastVelocity_ = -2;
          expect(resource.renderOutsideViewport()).to.equal(false);
          expect(resolveRenderOutsideViewportSpy).to.not.be.called;
        });

        describe('when element is owned', () => {
          beforeEach(() => {
            sandbox.stub(resource, 'hasOwner').callsFake(() => true);
          });

          it('should allow rendering when scrolling towards', () => {
            resources.lastVelocity_ = 2;
            expect(resource.renderOutsideViewport()).to.equal(true);
            expect(resolveRenderOutsideViewportSpy).to.be.calledOnce;
          });

          it('should allow rendering when scrolling away', () => {
            resources.lastVelocity_ = -2;
            expect(resource.renderOutsideViewport()).to.equal(true);
            expect(resolveRenderOutsideViewportSpy).to.be.calledOnce;
          });
        });
      });

      describe('when element is wayyy below viewport', () => {
        beforeEach(() => {
          resource.layoutBox_ = layoutRectLtwh(0, 1000, 100, 100);
        });

        it('should disallow rendering', () => {
          expect(resource.renderOutsideViewport()).to.equal(false);
          expect(resolveRenderOutsideViewportSpy).to.not.be.called;
        });

        it('should disallow rendering when scrolling towards', () => {
          resources.lastVelocity_ = 2;
          expect(resource.renderOutsideViewport()).to.equal(false);
          expect(resolveRenderOutsideViewportSpy).to.not.be.called;
        });

        it('should disallow rendering when scrolling away', () => {
          resources.lastVelocity_ = -2;
          expect(resource.renderOutsideViewport()).to.equal(false);
          expect(resolveRenderOutsideViewportSpy).to.not.be.called;
        });

        describe('when element is owned', () => {
          beforeEach(() => {
            sandbox.stub(resource, 'hasOwner').callsFake(() => true);
          });

          it('should allow rendering', () => {
            expect(resource.renderOutsideViewport()).to.equal(true);
            expect(resolveRenderOutsideViewportSpy).to.be.calledOnce;
          });

          it('should allow rendering when scrolling towards', () => {
            resources.lastVelocity_ = 2;
            expect(resource.renderOutsideViewport()).to.equal(true);
            expect(resolveRenderOutsideViewportSpy).to.be.calledOnce;
          });

          it('should allow rendering when scrolling away', () => {
            resources.lastVelocity_ = -2;
            expect(resource.renderOutsideViewport()).to.equal(true);
            expect(resolveRenderOutsideViewportSpy).to.be.calledOnce;
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
          expect(resolveRenderOutsideViewportSpy).to.not.be.called;
        });

        it('should disallow rendering when scrolling away', () => {
          resources.lastVelocity_ = 2;
          expect(resource.renderOutsideViewport()).to.equal(false);
          expect(resolveRenderOutsideViewportSpy).to.not.be.called;
        });

        describe('when element is owned', () => {
          beforeEach(() => {
            sandbox.stub(resource, 'hasOwner').callsFake(() => true);
          });

          it('should allow rendering when scrolling towards', () => {
            resources.lastVelocity_ = -2;
            expect(resource.renderOutsideViewport()).to.equal(true);
            expect(resolveRenderOutsideViewportSpy).to.be.calledOnce;
          });

          it('should allow rendering when scrolling away', () => {
            resources.lastVelocity_ = 2;
            expect(resource.renderOutsideViewport()).to.equal(true);
            expect(resolveRenderOutsideViewportSpy).to.be.calledOnce;
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
          expect(resolveRenderOutsideViewportSpy).to.not.be.called;
        });

        it('should disallow rendering when scrolling away', () => {
          resources.lastVelocity_ = 2;
          expect(resource.renderOutsideViewport()).to.equal(false);
          expect(resolveRenderOutsideViewportSpy).to.not.be.called;
        });

        describe('when element is owned', () => {
          beforeEach(() => {
            sandbox.stub(resource, 'hasOwner').callsFake(() => true);
          });

          it('should allow rendering when scrolling towards', () => {
            resources.lastVelocity_ = -2;
            expect(resource.renderOutsideViewport()).to.equal(true);
            expect(resolveRenderOutsideViewportSpy).to.be.calledOnce;
          });

          it('should allow rendering when scrolling away', () => {
            resources.lastVelocity_ = 2;
            expect(resource.renderOutsideViewport()).to.equal(true);
            expect(resolveRenderOutsideViewportSpy).to.be.calledOnce;
          });
        });
      });

      describe('when element is wayyy above viewport', () => {
        beforeEach(() => {
          resource.layoutBox_ = layoutRectLtwh(0, -1000, 100, 100);
        });

        it('should disallow rendering', () => {
          expect(resource.renderOutsideViewport()).to.equal(false);
          expect(resolveRenderOutsideViewportSpy).to.not.be.called;
        });

        it('should disallow rendering when scrolling towards', () => {
          resources.lastVelocity_ = -2;
          expect(resource.renderOutsideViewport()).to.equal(false);
          expect(resolveRenderOutsideViewportSpy).to.not.be.called;
        });

        it('should disallow rendering when scrolling away', () => {
          resources.lastVelocity_ = 2;
          expect(resource.renderOutsideViewport()).to.equal(false);
          expect(resolveRenderOutsideViewportSpy).to.not.be.called;
        });

        describe('when element is owned', () => {
          beforeEach(() => {
            sandbox.stub(resource, 'hasOwner').callsFake(() => true);
          });

          it('should allow rendering', () => {
            expect(resource.renderOutsideViewport()).to.equal(true);
            expect(resolveRenderOutsideViewportSpy).to.be.calledOnce;
          });

          it('should allow rendering when scrolling towards', () => {
            resources.lastVelocity_ = -2;
            expect(resource.renderOutsideViewport()).to.equal(true);
            expect(resolveRenderOutsideViewportSpy).to.be.calledOnce;
          });

          it('should allow rendering when scrolling away', () => {
            resources.lastVelocity_ = 2;
            expect(resource.renderOutsideViewport()).to.equal(true);
            expect(resolveRenderOutsideViewportSpy).to.be.calledOnce;
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
        expect(resolveRenderOutsideViewportSpy).to.be.calledOnce;
      });

      it('should allow rendering when top falls outside', () => {
        resource.layoutBox_ = layoutRectLtwh(0, -10, 100, 100);
        expect(resource.renderOutsideViewport()).to.equal(true);
        expect(resolveRenderOutsideViewportSpy).to.be.calledOnce;
      });

      describe('when element is owned', () => {
        beforeEach(() => {
          sandbox.stub(resource, 'hasOwner').callsFake(() => true);
        });

        it('should allow rendering when bottom falls outside', () => {
          resource.layoutBox_ = layoutRectLtwh(0, 10, 100, 100);
          expect(resource.renderOutsideViewport()).to.equal(true);
          expect(resolveRenderOutsideViewportSpy).to.be.calledOnce;
        });

        it('should allow rendering when top falls outside', () => {
          resource.layoutBox_ = layoutRectLtwh(0, -10, 100, 100);
          expect(resource.renderOutsideViewport()).to.equal(true);
          expect(resolveRenderOutsideViewportSpy).to.be.calledOnce;
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
        expect(resolveRenderOutsideViewportSpy).to.be.calledOnce;
      });

      it('should allow rendering when scrolling away', () => {
        resources.lastVelocity_ = -2;
        expect(resource.renderOutsideViewport()).to.equal(true);
        expect(resolveRenderOutsideViewportSpy).to.be.calledOnce;
      });

      describe('when element is owned', () => {
        beforeEach(() => {
          sandbox.stub(resource, 'hasOwner').callsFake(() => true);
        });

        it('should allow rendering when scrolling towards', () => {
          resources.lastVelocity_ = 2;
          expect(resource.renderOutsideViewport()).to.equal(true);
          expect(resolveRenderOutsideViewportSpy).to.be.calledOnce;
        });

        it('should allow rendering when scrolling away', () => {
          resources.lastVelocity_ = -2;
          expect(resource.renderOutsideViewport()).to.equal(true);
          expect(resolveRenderOutsideViewportSpy).to.be.calledOnce;
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
        expect(resolveRenderOutsideViewportSpy).to.be.calledOnce;
      });

      it('should disallow rendering when scrolling away', () => {
        resources.lastVelocity_ = -2;
        expect(resource.renderOutsideViewport()).to.equal(false);
        expect(resolveRenderOutsideViewportSpy).to.not.be.called;
      });

      describe('when element is owned', () => {
        beforeEach(() => {
          sandbox.stub(resource, 'hasOwner').callsFake(() => true);
        });

        it('should allow rendering when scrolling towards', () => {
          resources.lastVelocity_ = 2;
          expect(resource.renderOutsideViewport()).to.equal(true);
          expect(resolveRenderOutsideViewportSpy).to.be.calledOnce;
        });

        it('should allow rendering when scrolling away', () => {
          resources.lastVelocity_ = -2;
          expect(resource.renderOutsideViewport()).to.equal(true);
          expect(resolveRenderOutsideViewportSpy).to.be.calledOnce;
        });
      });
    });

    describe('when element is wayyy below viewport', () => {
      beforeEach(() => {
        resource.layoutBox_ = layoutRectLtwh(0, 1000, 100, 100);
      });

      it('should disallow rendering', () => {
        expect(resource.renderOutsideViewport()).to.equal(false);
        expect(resolveRenderOutsideViewportSpy).to.not.be.called;
      });

      it('should disallow rendering when scrolling towards', () => {
        resources.lastVelocity_ = 2;
        expect(resource.renderOutsideViewport()).to.equal(false);
        expect(resolveRenderOutsideViewportSpy).to.not.be.called;
      });

      it('should disallow rendering when scrolling away', () => {
        resources.lastVelocity_ = -2;
        expect(resource.renderOutsideViewport()).to.equal(false);
        expect(resolveRenderOutsideViewportSpy).to.not.be.called;
      });

      describe('when element is owned', () => {
        beforeEach(() => {
          sandbox.stub(resource, 'hasOwner').callsFake(() => true);
        });

        it('should allow rendering', () => {
          expect(resource.renderOutsideViewport()).to.equal(true);
          expect(resolveRenderOutsideViewportSpy).to.be.calledOnce;
        });

        it('should allow rendering when scrolling towards', () => {
          resources.lastVelocity_ = 2;
          expect(resource.renderOutsideViewport()).to.equal(true);
          expect(resolveRenderOutsideViewportSpy).to.be.calledOnce;
        });

        it('should allow rendering when scrolling away', () => {
          resources.lastVelocity_ = -2;
          expect(resource.renderOutsideViewport()).to.equal(true);
          expect(resolveRenderOutsideViewportSpy).to.be.calledOnce;
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
        expect(resolveRenderOutsideViewportSpy).to.be.calledOnce;
      });

      it('should allow rendering when scrolling away', () => {
        resources.lastVelocity_ = 2;
        expect(resource.renderOutsideViewport()).to.equal(true);
        expect(resolveRenderOutsideViewportSpy).to.be.calledOnce;
      });

      describe('when element is owned', () => {
        beforeEach(() => {
          sandbox.stub(resource, 'hasOwner').callsFake(() => true);
        });

        it('should allow rendering when scrolling towards', () => {
          resources.lastVelocity_ = -2;
          expect(resource.renderOutsideViewport()).to.equal(true);
          expect(resolveRenderOutsideViewportSpy).to.be.calledOnce;
        });

        it('should allow rendering when scrolling away', () => {
          resources.lastVelocity_ = 2;
          expect(resource.renderOutsideViewport()).to.equal(true);
          expect(resolveRenderOutsideViewportSpy).to.be.calledOnce;
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
        expect(resolveRenderOutsideViewportSpy).to.be.calledOnce;
      });

      it('should disallow rendering when scrolling away', () => {
        resources.lastVelocity_ = 2;
        expect(resource.renderOutsideViewport()).to.equal(false);
        expect(resolveRenderOutsideViewportSpy).to.not.be.called;
      });

      describe('when element is owned', () => {
        beforeEach(() => {
          sandbox.stub(resource, 'hasOwner').callsFake(() => true);
        });

        it('should allow rendering when scrolling towards', () => {
          resources.lastVelocity_ = -2;
          expect(resource.renderOutsideViewport()).to.equal(true);
          expect(resolveRenderOutsideViewportSpy).to.be.calledOnce;
        });

        it('should allow rendering when scrolling away', () => {
          resources.lastVelocity_ = 2;
          expect(resource.renderOutsideViewport()).to.equal(true);
          expect(resolveRenderOutsideViewportSpy).to.be.calledOnce;
        });
      });
    });

    describe('when element is wayyy above viewport', () => {
      beforeEach(() => {
        resource.layoutBox_ = layoutRectLtwh(0, -1000, 100, 100);
      });

      it('should disallow rendering', () => {
        expect(resource.renderOutsideViewport()).to.equal(false);
        expect(resolveRenderOutsideViewportSpy).to.not.be.called;
      });

      it('should disallow rendering when scrolling towards', () => {
        resources.lastVelocity_ = -2;
        expect(resource.renderOutsideViewport()).to.equal(false);
        expect(resolveRenderOutsideViewportSpy).to.not.be.called;
      });

      it('should disallow rendering when scrolling away', () => {
        resources.lastVelocity_ = 2;
        expect(resource.renderOutsideViewport()).to.equal(false);
        expect(resolveRenderOutsideViewportSpy).to.not.be.called;
      });

      describe('when element is owned', () => {
        beforeEach(() => {
          sandbox.stub(resource, 'hasOwner').callsFake(() => true);
        });

        it('should allow rendering', () => {
          expect(resource.renderOutsideViewport()).to.equal(true);
          expect(resolveRenderOutsideViewportSpy).to.be.calledOnce;
        });

        it('should allow rendering when scrolling towards', () => {
          resources.lastVelocity_ = -2;
          expect(resource.renderOutsideViewport()).to.equal(true);
          expect(resolveRenderOutsideViewportSpy).to.be.calledOnce;
        });

        it('should allow rendering when scrolling away', () => {
          resources.lastVelocity_ = 2;
          expect(resource.renderOutsideViewport()).to.equal(true);
          expect(resolveRenderOutsideViewportSpy).to.be.calledOnce;
        });
      });
    });

    describe('when element is on the left of viewport', () => {
      beforeEach(() => {
        resource.layoutBox_ = layoutRectLtwh(-200, 0, 100, 100);
      });

      it('should disallow rendering', () => {
        expect(resource.renderOutsideViewport()).to.equal(false);
        expect(resolveRenderOutsideViewportSpy).to.not.be.called;
      });

      it('should disallow rendering when scrolling towards on y-axis', () => {
        resources.lastVelocity_ = -2;
        expect(resource.renderOutsideViewport()).to.equal(false);
        expect(resolveRenderOutsideViewportSpy).to.not.be.called;
      });

      it('should disallow rendering when scrolling away on y-axis', () => {
        resources.lastVelocity_ = 2;
        expect(resource.renderOutsideViewport()).to.equal(false);
        expect(resolveRenderOutsideViewportSpy).to.not.be.called;
      });

      describe('when element is owned', () => {
        beforeEach(() => {
          sandbox.stub(resource, 'hasOwner').callsFake(() => true);
        });

        it('should allow rendering', () => {
          expect(resource.renderOutsideViewport()).to.equal(true);
          expect(resolveRenderOutsideViewportSpy).to.be.calledOnce;
        });

        it('should allow rendering when scrolling towards on y-axis', () => {
          resources.lastVelocity_ = -2;
          expect(resource.renderOutsideViewport()).to.equal(true);
          expect(resolveRenderOutsideViewportSpy).to.be.calledOnce;
        });

        it('should allow rendering when scrolling away on y-axis', () => {
          resources.lastVelocity_ = 2;
          expect(resource.renderOutsideViewport()).to.equal(true);
          expect(resolveRenderOutsideViewportSpy).to.be.calledOnce;
        });
      });
    });

    describe('when element is on the right of viewport', () => {
      beforeEach(() => {
        resource.layoutBox_ = layoutRectLtwh(200, 0, 100, 100);
      });

      it('should disallow rendering', () => {
        expect(resource.renderOutsideViewport()).to.equal(false);
        expect(resolveRenderOutsideViewportSpy).to.not.be.called;
      });

      it('should disallow rendering when scrolling towards on y-axis', () => {
        resources.lastVelocity_ = -2;
        expect(resource.renderOutsideViewport()).to.equal(false);
        expect(resolveRenderOutsideViewportSpy).to.not.be.called;
      });

      it('should disallow rendering when scrolling away on y-axis', () => {
        resources.lastVelocity_ = 2;
        expect(resource.renderOutsideViewport()).to.equal(false);
        expect(resolveRenderOutsideViewportSpy).to.not.be.called;
      });

      describe('when element is owned', () => {
        beforeEach(() => {
          sandbox.stub(resource, 'hasOwner').callsFake(() => true);
        });

        it('should allow rendering', () => {
          expect(resource.renderOutsideViewport()).to.equal(true);
          expect(resolveRenderOutsideViewportSpy).to.be.calledOnce;
        });

        it('should allow rendering when scrolling towards on y-axis', () => {
          resources.lastVelocity_ = -2;
          expect(resource.renderOutsideViewport()).to.equal(true);
          expect(resolveRenderOutsideViewportSpy).to.be.calledOnce;
        });

        it('should allow rendering when scrolling away on y-axis', () => {
          resources.lastVelocity_ = 2;
          expect(resource.renderOutsideViewport()).to.equal(true);
          expect(resolveRenderOutsideViewportSpy).to.be.calledOnce;
        });
      });
    });

    describe('when element is fully in viewport', () => {
      beforeEach(() => {
        resource.layoutBox_ = layoutRectLtwh(0, 0, 100, 100);
      });

      it('should allow rendering', () => {
        expect(resource.renderOutsideViewport()).to.equal(true);
        expect(resolveRenderOutsideViewportSpy).to.be.calledOnce;
      });

      it('should allow rendering when scrolling towards', () => {
        resources.lastVelocity_ = -2;
        expect(resource.renderOutsideViewport()).to.equal(true);
        expect(resolveRenderOutsideViewportSpy).to.be.calledOnce;
      });

      it('should allow rendering when scrolling away', () => {
        resources.lastVelocity_ = 2;
        expect(resource.renderOutsideViewport()).to.equal(true);
        expect(resolveRenderOutsideViewportSpy).to.be.calledOnce;
      });

      describe('when element is owned', () => {
        beforeEach(() => {
          sandbox.stub(resource, 'hasOwner').callsFake(() => true);
        });

        it('should allow rendering', () => {
          expect(resource.renderOutsideViewport()).to.equal(true);
          expect(resolveRenderOutsideViewportSpy).to.be.calledOnce;
        });

        it('should allow rendering when scrolling towards on y-axis', () => {
          resources.lastVelocity_ = -2;
          expect(resource.renderOutsideViewport()).to.equal(true);
          expect(resolveRenderOutsideViewportSpy).to.be.calledOnce;
        });

        it('should allow rendering when scrolling away on y-axis', () => {
          resources.lastVelocity_ = 2;
          expect(resource.renderOutsideViewport()).to.equal(true);
          expect(resolveRenderOutsideViewportSpy).to.be.calledOnce;
        });
      });
    });

    describe('when element is partially in viewport', () => {
      beforeEach(() => {
        resource.layoutBox_ = layoutRectLtwh(-50, -50, 100, 100);
      });

      it('should allow rendering', () => {
        expect(resource.renderOutsideViewport()).to.equal(true);
        expect(resolveRenderOutsideViewportSpy).to.be.calledOnce;
      });

      it('should allow rendering when scrolling towards', () => {
        resources.lastVelocity_ = -2;
        expect(resource.renderOutsideViewport()).to.equal(true);
        expect(resolveRenderOutsideViewportSpy).to.be.calledOnce;
      });

      it('should allow rendering when scrolling away', () => {
        resources.lastVelocity_ = 2;
        expect(resource.renderOutsideViewport()).to.equal(true);
        expect(resolveRenderOutsideViewportSpy).to.be.calledOnce;
      });

      describe('when element is owned', () => {
        beforeEach(() => {
          sandbox.stub(resource, 'hasOwner').callsFake(() => true);
        });

        it('should allow rendering', () => {
          expect(resource.renderOutsideViewport()).to.equal(true);
          expect(resolveRenderOutsideViewportSpy).to.be.calledOnce;
        });

        it('should allow rendering when scrolling towards on y-axis', () => {
          resources.lastVelocity_ = -2;
          expect(resource.renderOutsideViewport()).to.equal(true);
          expect(resolveRenderOutsideViewportSpy).to.be.calledOnce;
        });

        it('should allow rendering when scrolling away on y-axis', () => {
          resources.lastVelocity_ = 2;
          expect(resource.renderOutsideViewport()).to.equal(true);
          expect(resolveRenderOutsideViewportSpy).to.be.calledOnce;
        });
      });
    });
  });

  describe('resolveRenderOutsideViewport', () => {
    it('should resolve correctly', () => {
      const promise = resource.whenWithinRenderOutsideViewport();
      // Multiple calls should return the same promise.
      expect(resource.whenWithinRenderOutsideViewport()).to.equal(promise);
      expect(resource.renderOutsideViewportPromise_).to.be.ok;
      expect(resource.renderOutsideViewportResolve_).to.be.ok;
      // Call again should do nothing.
      resource.resolveRenderOutsideViewport_();
      resource.resolveRenderOutsideViewport_();
      expect(resource.renderOutsideViewportPromise_).to.not.be.ok;
      expect(resource.renderOutsideViewportResolve_).to.not.be.ok;
      return promise;
    });

    it('should resolve immediately if already laid out', () => {
      sandbox.stub(resource, 'isLayoutPending').returns(false);
      return resource.whenWithinRenderOutsideViewport();
    });
  });
});
