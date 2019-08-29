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

import {Resource, ResourceState} from '../../src/service/resource';
import {Services} from '../../src/services';

describes.realWin(
  'owners-impl',
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
    let sandbox;
    let scheduleLayoutOrPreloadStub;

    beforeEach(() => {
      win = env.win;
      doc = win.document;
      sandbox = env.sandbox;
      owners = Services.ownersForDoc(env.ampdoc);
      resources = Services.resourcesForDoc(env.ampdoc);
      resources.isRuntimeOn_ = false;
      parent = createElementWithResource(1);
      doc.body.appendChild(parent);
      child0 = doc.createElement('div');
      child1 = createElementWithResource(2);
      child2 = createElementWithResource(3);
      children = [child0, child1, child2];
      children.forEach(child => {
        parent.appendChild(child);
      });
      scheduleLayoutOrPreloadStub = sandbox.stub(
        resources,
        'scheduleLayoutOrPreload'
      );
    });

    function createElement() {
      const element = env.createAmpElement('amp-test');
      element.ampdoc_ = env.ampdoc;
      element.isUpgradedForTesting = true;
      element.isBuiltForTesting = true;
      sandbox.stub(element, 'isBuilt').returns(element.isUpgradedForTesting);
      sandbox.stub(element, 'isUpgraded').returns(element.isBuiltForTesting);
      return element;
    }

    function createElementWithResource(
      id,
      state = ResourceState.LAYOUT_COMPLETE
    ) {
      const element = createElement();
      const resource = new Resource(id, element, resources);
      resource.state_ = state;
      sandbox.stub(resource, 'measure').callsFake(() => {
        resource.state_ = ResourceState.READY_FOR_LAYOUT;
      });
      resource.isDisplayed = () => true;
      resource.isInViewport = () => true;
      return element;
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
      it('should schedule when resource is READY_FOR_LAYOUT', () => {
        const resource1 = resources.getResourceForElement(child1);
        resource1.state_ = ResourceState.READY_FOR_LAYOUT;
        owners.scheduleLayout(parent, child1);
        expect(scheduleLayoutOrPreloadStub).to.be.calledWith(
          resource1,
          true,
          parent.getLayoutPriority()
        );
      });

      it('should schedule after build', async () => {
        child1.isBuiltForTesting = false;
        const resource1 = resources.getResourceForElement(child1);
        resource1.state_ = ResourceState.NOT_BUILT;
        let buildResource;
        sandbox.stub(resource1, 'whenBuilt').returns(
          new Promise(resolve => {
            buildResource = resolve;
          })
        );
        owners.scheduleLayout(parent, child1);
        expect(scheduleLayoutOrPreloadStub).to.not.be.called;
        buildResource();
        await Promise.resolve();
        expect(scheduleLayoutOrPreloadStub).to.be.calledOnce;
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

    describe('schedulePreload', () => {
      beforeEach(() => {
        [parent, child1, child2].forEach(element => {
          resources.getResourceForElement(element).state_ =
            ResourceState.READY_FOR_LAYOUT;
        });
      });

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
        owners.schedulePreload(parent, children);
        expect(scheduleLayoutOrPreloadStub).to.be.calledTwice;
      });

      it('should schedule on nested custom element placeholder', () => {
        const placeholder1 = createElementWithResource(
          4,
          ResourceState.READY_FOR_LAYOUT
        );
        child1.getPlaceholder = () => placeholder1;

        const placeholder2 = createElementWithResource(
          5,
          ResourceState.READY_FOR_LAYOUT
        );
        child2.getPlaceholder = () => placeholder2;

        owners.schedulePreload(parent, children);
        expect(scheduleLayoutOrPreloadStub.callCount).to.equal(4);
      });

      it('should schedule amp-* placeholder inside non-amp element', () => {
        const insidePlaceholder1 = createElementWithResource(
          4,
          ResourceState.READY_FOR_LAYOUT
        );
        const placeholder1 = doc.createElement('div');
        child0.getElementsByClassName = () => [insidePlaceholder1];
        child0.getPlaceholder = () => placeholder1;

        owners.schedulePreload(parent, children);
        expect(scheduleLayoutOrPreloadStub).to.be.calledThrice;
      });
    });
  }
);
