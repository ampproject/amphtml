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

import {LayoutPriority} from '../../src/layout';
import {Owners} from '../../src/service/owners-impl';
import {Resource, ResourceState} from '../../src/service/resource';
import {Signals} from '../../src/utils/signals';
import {layoutRectLtwh} from '../../src/layout-rect';

/*eslint "google-camelcase/google-camelcase": 0*/
describes.realWin(
  'Resources pause/resume/unlayout scheduling',
  {
    amp: true,
  },
  env => {
    let win, doc;
    let resources;
    let owners;
    let parent;
    let children;
    let child0;
    let child1;
    let child2;

    beforeEach(() => {
      win = env.win;
      doc = win.document;
      owners = new Owners(env.ampdoc);
      resources = owners.resources_;
      resources.isRuntimeOn_ = false;
      const parentTuple = createElementWithResource(1);
      parent = parentTuple[0];
      child0 = doc.createElement('div');
      child1 = createElementWithResource(2)[0];
      child2 = createElementWithResource(3)[0];
      children = [child0, child1, child2];
      children.forEach(child => {
        parent.appendChild(child);
      });
    });

    function createAmpElement() {
      const element = document.createElement('div');
      element.classList.add('i-amphtml-element');
      const signals = new Signals();
      element.signals = () => signals;
      element.whenBuilt = () => Promise.resolve();
      element.isBuilt = () => true;
      element.build = () => Promise.resolve();
      element.isUpgraded = () => true;
      element.updateLayoutBox = () => {};
      element.getPlaceholder = () => null;
      element.getLayoutPriority = () => LayoutPriority.CONTENT;
      element.dispatchCustomEvent = () => {};
      element.getLayout = () => 'fixed';
      document.body.appendChild(element);
      return element;
    }

    function createElement() {
      const element = env.createAmpElement('amp-test');
      sandbox.stub(element, 'isBuilt').callsFake(() => true);
      return element;
    }

    function createElementWithResource(id) {
      const element = createElement();
      const resource = new Resource(id, element, resources);
      resource.state_ = ResourceState.LAYOUT_COMPLETE;
      resource.element['__AMP__RESOURCE'] = resource;
      return [element, resource];
    }

    describe('schedulePause', () => {
      it('should not throw with a single element', () => {
        expect(() => {
          owners.schedulePause(parent, child1);
        }).to.not.throw();
      });

      it('should not throw with an array of elements', () => {
        expect(() => {
          owners.schedulePause(parent, [child1, child2]);
        }).to.not.throw();
      });

      it('should be ok with non amp children', () => {
        expect(() => {
          owners.schedulePause(parent, children);
          owners.schedulePause(parent, child0);
        }).to.not.throw();
      });

      it('should call pauseCallback on custom element', () => {
        const stub1 = sandbox.stub(child1, 'pauseCallback');
        const stub2 = sandbox.stub(child2, 'pauseCallback');

        owners.schedulePause(parent, children);
        expect(stub1.calledOnce).to.be.true;
        expect(stub2.calledOnce).to.be.true;
      });

      it('should call unlayoutCallback when unlayoutOnPause', () => {
        const stub1 = sandbox.stub(child1, 'unlayoutCallback');
        const stub2 = sandbox.stub(child2, 'unlayoutCallback');
        sandbox.stub(child1, 'unlayoutOnPause').returns(true);

        owners.schedulePause(parent, children);
        expect(stub1.calledOnce).to.be.true;
        expect(stub2.calledOnce).to.be.false;
      });
    });

    describe('scheduleResume', () => {
      beforeEach(() => {
        // Pause one child.
        owners.schedulePause(parent, child1);
      });

      it('should not throw with a single element', () => {
        expect(() => {
          owners.scheduleResume(parent, child1);
        }).to.not.throw();
      });

      it('should not throw with an array of elements', () => {
        expect(() => {
          owners.scheduleResume(parent, [child1, child2]);
        }).to.not.throw();
      });

      it('should be ok with non amp children', () => {
        expect(() => {
          owners.scheduleResume(parent, children);
          owners.scheduleResume(parent, child0);
        }).to.not.throw();
      });

      it('should call resumeCallback on paused custom elements', () => {
        const stub1 = sandbox.stub(child1, 'resumeCallback');

        owners.scheduleResume(parent, children);
        expect(stub1.calledOnce).to.be.true;
      });

      it('should call resumeCallback on non-paused custom elements', () => {
        const stub2 = sandbox.stub(child2, 'resumeCallback');

        owners.scheduleResume(parent, children);
        expect(stub2.calledOnce).to.be.true;
      });
    });

    describe('scheduleLayout', () => {
      it('should schedule immediately when resource is READY_FOR_LAYOUT', () => {
        const parentElement = createAmpElement();
        const element = createAmpElement();
        parentElement.appendChild(element);
        sandbox
          .stub(element, 'getBoundingClientRect')
          .callsFake(() => layoutRectLtwh(0, 0, 10, 10));
        new Resource(1, parentElement, resources);
        const resource = new Resource(2, element, resources);
        resource.state_ = ResourceState.READY_FOR_LAYOUT;
        sandbox.stub(resource, 'isDisplayed').returns(true);
        sandbox.stub(resource, 'isInViewport').returns(true);
        const measureStub = sandbox.stub(resource, 'measure');
        const scheduleStub = sandbox.stub(
          resources,
          'scheduleLayoutOrPreload_'
        );
        owners.scheduleLayout(parentElement, element);
        expect(measureStub).to.be.calledOnce;
        expect(scheduleStub).to.be.calledOnce;
      });

      it('should schedule after build', () => {
        const parentElement = createAmpElement();
        const element = createAmpElement();
        parentElement.appendChild(element);
        sandbox
          .stub(element, 'getBoundingClientRect')
          .callsFake(() => layoutRectLtwh(0, 0, 10, 10));
        sandbox.stub(element, 'isBuilt').callsFake(() => false);
        new Resource(1, parentElement, resources);
        const resource = new Resource(2, element, resources);
        resource.state_ = ResourceState.NOT_BUILT;
        sandbox.stub(resource, 'isDisplayed').returns(true);
        const measureStub = sandbox.stub(resource, 'measure').callsFake(() => {
          resource.state_ = ResourceState.READY_FOR_LAYOUT;
        });
        const scheduleStub = sandbox.stub(
          resources,
          'scheduleLayoutOrPreload_'
        );
        owners.scheduleLayout(parentElement, element);
        expect(measureStub).to.not.be.called;
        expect(scheduleStub).to.not.be.called;
        return resource
          .build()
          .then(() => {
            return element.whenBuilt();
          })
          .then(() => {
            expect(measureStub).to.be.calledOnce;
            expect(scheduleStub).to.be.calledOnce;
          });
      });
    });

    describe('scheduleUnlayout', () => {
      it('should not throw with a single element', () => {
        expect(() => {
          owners.scheduleUnlayout(parent, child1);
        }).to.not.throw();
      });

      it('should not throw with an array of elements', () => {
        expect(() => {
          owners.scheduleUnlayout(parent, [child1, child2]);
        }).to.not.throw();
      });

      it('should be ok with non amp children', () => {
        expect(() => {
          owners.scheduleUnlayout(parent, children);
        }).to.not.throw();
      });

      it('should schedule on custom element with multiple children', () => {
        const stub1 = sandbox.stub(child1, 'unlayoutCallback');
        const stub2 = sandbox.stub(child2, 'unlayoutCallback');
        owners.scheduleUnlayout(parent, children);
        expect(stub1.called).to.be.true;
        expect(stub2.called).to.be.true;
      });
    });
  }
);

describes.realWin('Owners schedulePreload', {amp: true}, env => {
  let win, doc;
  let resources;
  let owners;
  let parent;
  let children;
  let child0;
  let child1;
  let child2;

  beforeEach(() => {
    win = env.win;
    doc = win.document;
    owners = new Owners(env.ampdoc);
    resources = owners.resources_;
    resources.isRuntimeOn_ = false;
    const parentTuple = createElementWithResource(1);
    parent = parentTuple[0];
    child0 = doc.createElement('div');
    child1 = createElementWithResource(2)[0];
    child2 = createElementWithResource(3)[0];
    children = [child0, child1, child2];
    children.forEach(child => {
      parent.appendChild(child);
    });
  });

  function createElement() {
    const element = env.createAmpElement('amp-test');
    sandbox.stub(element, 'isBuilt').callsFake(() => true);
    sandbox.stub(element, 'isUpgraded').callsFake(() => true);
    return element;
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

  it('should not throw with a single element', () => {
    expect(() => {
      owners.schedulePreload(parent, child1);
    }).to.not.throw();
  });

  it('should not throw with an array of elements', () => {
    expect(() => {
      owners.schedulePreload(parent, [child1, child2]);
    }).to.not.throw();
  });

  it('should be ok with non amp children', () => {
    expect(() => {
      owners.schedulePreload(parent, children);
    }).to.not.throw();
  });

  it('should schedule on custom element with multiple children', () => {
    const stub1 = sandbox.stub(resources, 'schedule_');
    owners.schedulePreload(parent, children);
    expect(stub1.called).to.be.true;
    expect(stub1.callCount).to.be.equal(2);
  });

  it('should schedule on nested custom element placeholder', () => {
    const stub1 = sandbox.stub(resources, 'schedule_');

    const placeholder1 = createElementWithResource(4)[0];
    child1.getPlaceholder = () => placeholder1;

    const placeholder2 = createElementWithResource(5)[0];
    child2.getPlaceholder = () => placeholder2;

    owners.schedulePreload(parent, children);
    expect(stub1.called).to.be.true;
    expect(stub1.callCount).to.be.equal(4);
  });

  it('should schedule amp-* placeholder inside non-amp element', () => {
    const stub1 = sandbox.stub(resources, 'schedule_');

    const insidePlaceholder1 = createElementWithResource(4)[0];
    const placeholder1 = doc.createElement('div');
    child0.getElementsByClassName = () => [insidePlaceholder1];
    child0.getPlaceholder = () => placeholder1;

    owners.schedulePreload(parent, children);
    expect(stub1.called).to.be.true;
    expect(stub1.callCount).to.be.equal(3);
  });
});
