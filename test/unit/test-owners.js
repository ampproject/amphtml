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
  (env) => {
    let win, doc;
    let resources;
    let owners;
    let parent;
    let children;
    let scheduleLayoutOrPreloadStub;

    beforeEach(() => {
      win = env.win;
      doc = win.document;
      owners = Services.ownersForDoc(env.ampdoc);
      resources = Services.resourcesForDoc(env.ampdoc);
      resources.isRuntimeOn_ = false;
      // DOM tree (numbers are resource IDs):
      // body -- 0 -- div -- 3
      //                  -- 4
      //           -- 1
      //           -- 2
      parent = createElementWithResource(0);
      doc.body.appendChild(parent);
      const child0 = doc.createElement('div');
      parent.appendChild(child0);
      children = [child0];
      for (let i = 1; i <= 4; ++i) {
        children[i] = createElementWithResource(i);
        if (i <= 2) {
          parent.appendChild(children[i]);
        } else {
          children[0].appendChild(children[i]);
        }
      }
      scheduleLayoutOrPreloadStub = env.sandbox.stub(
        resources,
        'scheduleLayoutOrPreload'
      );
    });

    function createElement() {
      const element = env.createAmpElement('amp-test');
      env.sandbox.stub(element, 'isUpgraded').returns(true);
      return element;
    }

    function createElementWithResource(
      id,
      state = ResourceState.LAYOUT_COMPLETE
    ) {
      const element = createElement();
      const resource = new Resource(id, element, resources);
      resource.state_ = state;
      env.sandbox.stub(resource, 'measure').callsFake(() => {
        resource.state_ = ResourceState.READY_FOR_LAYOUT;
      });
      resource.isDisplayedForTesting = true;
      env.sandbox
        .stub(resource, 'isDisplayed')
        .callsFake(() => resource.isDisplayedForTesting);
      resource.isInViewport = () => true;
      return element;
    }

    function setAllResourceState(state) {
      children.concat([parent]).forEach((element) => {
        setElementResourceState(element, state);
      });
    }

    function setElementResourceState(element, state) {
      const resource = resources.getResourceForElementOptional(element);
      if (resource) {
        resource.state_ = state;
      }
      return resource;
    }

    describe('schedulePause', () => {
      it('should not throw with a single element', () => {
        expect(() => {
          owners.schedulePause(parent, children[1]);
        }).to.not.throw();
      });

      it('should not throw with an array of elements', () => {
        expect(() => {
          owners.schedulePause(parent, [children[1], children[2]]);
        }).to.not.throw();
      });

      it('should be ok with non amp children', () => {
        expect(() => {
          owners.schedulePause(parent, children);
          owners.schedulePause(parent, children[0]);
        }).to.not.throw();
      });

      it('should call pauseCallback on custom element', () => {
        const stub1 = env.sandbox.stub(children[1], 'pauseCallback');
        const stub2 = env.sandbox.stub(children[2], 'pauseCallback');

        owners.schedulePause(parent, children);
        expect(stub1.calledOnce).to.be.true;
        expect(stub2.calledOnce).to.be.true;
      });

      it('should call unlayoutCallback when unlayoutOnPause', () => {
        const stub1 = env.sandbox.stub(children[1], 'unlayoutCallback');
        const stub2 = env.sandbox.stub(children[2], 'unlayoutCallback');
        env.sandbox.stub(children[1], 'unlayoutOnPause').returns(true);

        owners.schedulePause(parent, children);
        expect(stub1.calledOnce).to.be.true;
        expect(stub2.calledOnce).to.be.false;
      });
    });

    describe('scheduleResume', () => {
      beforeEach(() => {
        // Pause one child.
        owners.schedulePause(parent, children[1]);
      });

      it('should not throw with a single element', () => {
        expect(() => {
          owners.scheduleResume(parent, children[1]);
        }).to.not.throw();
      });

      it('should not throw with an array of elements', () => {
        expect(() => {
          owners.scheduleResume(parent, [children[1], children[2]]);
        }).to.not.throw();
      });

      it('should be ok with non amp children', () => {
        expect(() => {
          owners.scheduleResume(parent, children);
          owners.scheduleResume(parent, children[0]);
        }).to.not.throw();
      });

      it('should call resumeCallback on paused custom elements', () => {
        const stub1 = env.sandbox.stub(children[1], 'resumeCallback');

        owners.scheduleResume(parent, children);
        expect(stub1.calledOnce).to.be.true;
      });

      it('should call resumeCallback on non-paused custom elements', () => {
        const stub2 = env.sandbox.stub(children[2], 'resumeCallback');

        owners.scheduleResume(parent, children);
        expect(stub2.calledOnce).to.be.true;
      });
    });

    describe('scheduleLayout', () => {
      it('should schedule when resource is READY_FOR_LAYOUT', () => {
        const resource1 = setElementResourceState(
          children[1],
          ResourceState.READY_FOR_LAYOUT
        );
        owners.scheduleLayout(parent, children[1]);
        expect(scheduleLayoutOrPreloadStub).to.be.calledWith(
          resource1,
          true,
          parent.getLayoutPriority()
        );
      });

      it('should schedule after build', async () => {
        const resource1 = setElementResourceState(
          children[1],
          ResourceState.NOT_BUILT
        );
        let buildResource;
        env.sandbox.stub(resource1, 'whenBuilt').returns(
          new Promise((resolve) => {
            buildResource = resolve;
          })
        );
        owners.scheduleLayout(parent, children[1]);
        expect(scheduleLayoutOrPreloadStub).to.not.be.called;
        buildResource();
        await Promise.resolve();
        expect(scheduleLayoutOrPreloadStub).to.be.calledWith(resource1, true);
      });
    });

    describe('scheduleUnlayout', () => {
      it('should not throw with a single element', () => {
        expect(() => {
          owners.scheduleUnlayout(parent, children[1]);
        }).to.not.throw();
      });

      it('should not throw with an array of elements', () => {
        expect(() => {
          owners.scheduleUnlayout(parent, [children[1], children[2]]);
        }).to.not.throw();
      });

      it('should be ok with non amp children', () => {
        expect(() => {
          owners.scheduleUnlayout(parent, children);
        }).to.not.throw();
      });

      it('should schedule on custom element with multiple children', () => {
        const stub1 = env.sandbox.stub(children[1], 'unlayoutCallback');
        const stub2 = env.sandbox.stub(children[2], 'unlayoutCallback');
        owners.scheduleUnlayout(parent, children);
        expect(stub1.called).to.be.true;
        expect(stub2.called).to.be.true;
      });
    });

    describe('schedulePreload', () => {
      beforeEach(() => {
        setAllResourceState(ResourceState.NOT_BUILT);
        [parent, children[1], children[2]].forEach((element) => {
          setElementResourceState(element, ResourceState.READY_FOR_LAYOUT);
        });
      });

      it('should not throw with a single element', () => {
        expect(() => {
          owners.schedulePreload(parent, children[1]);
        }).to.not.throw();
      });

      it('should not throw with an array of elements', () => {
        expect(() => {
          owners.schedulePreload(parent, [children[1], children[2]]);
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
          10,
          ResourceState.READY_FOR_LAYOUT
        );
        children[1].getPlaceholder = () => placeholder1;

        const placeholder2 = createElementWithResource(
          11,
          ResourceState.READY_FOR_LAYOUT
        );
        children[2].getPlaceholder = () => placeholder2;

        owners.schedulePreload(parent, children);
        expect(scheduleLayoutOrPreloadStub.callCount).to.equal(4);
      });

      it('should schedule amp-* placeholder inside non-amp element', () => {
        const insidePlaceholder1 = createElementWithResource(
          10,
          ResourceState.READY_FOR_LAYOUT
        );
        const placeholder1 = doc.createElement('div');
        children[0].getElementsByClassName = () => [insidePlaceholder1];
        children[0].getPlaceholder = () => placeholder1;

        owners.schedulePreload(parent, children);
        expect(scheduleLayoutOrPreloadStub).to.be.calledThrice;
      });
    });

    describe('requireLayout', () => {
      beforeEach(() => {
        children.concat([parent]).forEach((element) => {
          const resource = resources.getResourceForElementOptional(element);
          if (!resource) {
            return;
          }
          env.sandbox.stub(resource, 'whenBuilt').returns(Promise.resolve());
          env.sandbox.stub(resource, 'loadedOnce').returns(Promise.resolve());
        });
      });

      it('should layout AMP element itself', async () => {
        setAllResourceState(ResourceState.READY_FOR_LAYOUT);
        const scheduledElements = await owners.requireLayout(parent);
        expect(scheduledElements).to.have.length(1);
        expect(scheduleLayoutOrPreloadStub).to.be.calledOnce;
        expect(scheduleLayoutOrPreloadStub).to.be.calledWith(
          resources.getResourceForElement(parent),
          true
        );
      });

      it("should layout non-AMP element's all AMP children", async () => {
        setAllResourceState(ResourceState.READY_FOR_LAYOUT);
        const scheduledElements = await owners.requireLayout(children[0]);
        expect(scheduledElements).to.have.length(2);
        expect(scheduleLayoutOrPreloadStub).to.be.calledTwice;
        expect(scheduleLayoutOrPreloadStub).to.be.calledWith(
          resources.getResourceForElement(children[3]),
          true
        );
        expect(scheduleLayoutOrPreloadStub).to.be.calledWith(
          resources.getResourceForElement(children[4]),
          true
        );
      });

      it('should layout element w/ state=LAYOUT_FAILED', async () => {
        const resource = setElementResourceState(
          parent,
          ResourceState.LAYOUT_FAILED
        );
        await owners.requireLayout(parent);
        expect(scheduleLayoutOrPreloadStub).to.be.calledOnce;
        expect(scheduleLayoutOrPreloadStub).to.be.calledWith(resource, true);
      });

      it('should not layout element w/ state=LAYOUT_COMPLETE', async () => {
        setElementResourceState(parent, ResourceState.LAYOUT_COMPLETE);
        const scheduledElements = await owners.requireLayout(parent);
        expect(scheduledElements).to.have.length(0);
        expect(scheduleLayoutOrPreloadStub).to.not.be.called;
      });

      it('should not double schedule element w/ state=LAYOUT_SCHEDULED', async () => {
        setElementResourceState(parent, ResourceState.LAYOUT_SCHEDULED);
        const scheduledElements = await owners.requireLayout(parent);
        expect(scheduledElements).to.have.length(1);
        expect(scheduleLayoutOrPreloadStub).to.not.be.called;
      });

      it('should not require layout for undisplayed element', async () => {
        const resource = setElementResourceState(
          parent,
          ResourceState.READY_FOR_LAYOUT
        );
        resource.isDisplayedForTesting = false;
        const scheduledElements = await owners.requireLayout(parent);
        expect(scheduledElements).to.have.length(1);
        expect(scheduleLayoutOrPreloadStub).to.not.be.called;
      });
    });
  }
);
