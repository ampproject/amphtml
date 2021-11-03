import {Services} from '#service';
import {Resource, ResourceState_Enum} from '#service/resource';

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
    });

    function createElement() {
      const element = env.createAmpElement('amp-test');
      env.sandbox.stub(element, 'isUpgraded').returns(true);
      return element;
    }

    function createElementWithResource(
      id,
      state = ResourceState_Enum.LAYOUT_COMPLETE
    ) {
      const element = createElement();
      const resource = new Resource(id, element, resources);
      resource.state_ = state;
      env.sandbox.stub(resource, 'measure').callsFake(() => {
        resource.state_ = ResourceState_Enum.READY_FOR_LAYOUT;
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

      it('should call pause on custom element', () => {
        const stub1 = env.sandbox.stub(children[1], 'pause');
        const stub2 = env.sandbox.stub(children[2], 'pause');

        owners.schedulePause(parent, children);
        expect(stub1.calledOnce).to.be.true;
        expect(stub2.calledOnce).to.be.true;
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

      it('should call resume on paused custom elements', () => {
        const stub1 = env.sandbox.stub(children[1], 'resume');

        owners.scheduleResume(parent, children);
        expect(stub1.calledOnce).to.be.true;
      });

      it('should call resume on non-paused custom elements', () => {
        const stub2 = env.sandbox.stub(children[2], 'resume');

        owners.scheduleResume(parent, children);
        expect(stub2.calledOnce).to.be.true;
      });
    });

    describe('scheduleLayout', () => {
      it('should schedule when resource is READY_FOR_LAYOUT', () => {
        const resource1 = setElementResourceState(
          children[1],
          ResourceState_Enum.READY_FOR_LAYOUT
        );
        const ensureLoadedStub = env.sandbox
          .stub(resource1.element, 'ensureLoaded')
          .resolves();
        owners.scheduleLayout(parent, children[1]);
        expect(ensureLoadedStub).to.be.calledWith(parent.getLayoutPriority());
      });

      it('should schedule even when not build', async () => {
        const resource1 = setElementResourceState(
          children[1],
          ResourceState_Enum.NOT_BUILT
        );
        env.sandbox.stub(resource1, 'whenBuilt').returns(new Promise(() => {}));
        const ensureLoadedStub = env.sandbox
          .stub(resource1.element, 'ensureLoaded')
          .resolves();
        owners.scheduleLayout(parent, children[1]);
        expect(ensureLoadedStub).to.be.calledWith(parent.getLayoutPriority());
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
        setAllResourceState(ResourceState_Enum.NOT_BUILT);
        [parent, children[1], children[2]].forEach((element) => {
          setElementResourceState(element, ResourceState_Enum.READY_FOR_LAYOUT);
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
        const ensureLoadedStub1 = env.sandbox
          .stub(children[1], 'ensureLoaded')
          .resolves();
        const ensureLoadedStub2 = env.sandbox
          .stub(children[2], 'ensureLoaded')
          .resolves();
        owners.schedulePreload(parent, children);
        expect(ensureLoadedStub1).to.be.calledOnce.calledWith(
          parent.getLayoutPriority()
        );
        expect(ensureLoadedStub2).to.be.calledOnce.calledWith(
          parent.getLayoutPriority()
        );
      });

      it('should schedule on nested custom element placeholder', () => {
        const placeholder1 = createElementWithResource(
          10,
          ResourceState_Enum.READY_FOR_LAYOUT
        );
        children[1].getPlaceholder = () => placeholder1;

        const placeholder2 = createElementWithResource(
          11,
          ResourceState_Enum.READY_FOR_LAYOUT
        );
        children[2].getPlaceholder = () => placeholder2;

        const stub1 = env.sandbox.stub(children[1], 'ensureLoaded');
        const stub2 = env.sandbox.stub(children[2], 'ensureLoaded');
        const stub3 = env.sandbox.stub(placeholder1, 'ensureLoaded');
        const stub4 = env.sandbox.stub(placeholder2, 'ensureLoaded');

        owners.schedulePreload(parent, children);
        expect(stub1).to.be.calledOnce;
        expect(stub2).to.be.calledOnce;
        expect(stub3).to.be.calledOnce;
        expect(stub4).to.be.calledOnce;
      });

      it('should schedule amp-* placeholder inside non-amp element', () => {
        const insidePlaceholder1 = createElementWithResource(
          10,
          ResourceState_Enum.READY_FOR_LAYOUT
        );
        const placeholder1 = doc.createElement('div');
        children[0].getElementsByClassName = () => [insidePlaceholder1];
        children[0].getPlaceholder = () => placeholder1;

        const stub1 = env.sandbox.stub(insidePlaceholder1, 'ensureLoaded');

        owners.schedulePreload(parent, children);
        expect(stub1).to.be.calledOnce;
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
          env.sandbox.stub(element, 'ensureLoaded').resolves(resource.getId());
        });
      });

      it('should layout AMP element itself', async () => {
        setAllResourceState(ResourceState_Enum.READY_FOR_LAYOUT);
        const scheduledElements = await owners.requireLayout(parent);
        expect(scheduledElements).to.deep.equal([0]);
      });

      it("should layout non-AMP element's all AMP children", async () => {
        setAllResourceState(ResourceState_Enum.READY_FOR_LAYOUT);
        const scheduledElements = await owners.requireLayout(children[0]);
        expect(scheduledElements).to.deep.equal([3, 4]);
      });

      it('should layout element w/ state=LAYOUT_FAILED', async () => {
        setElementResourceState(parent, ResourceState_Enum.LAYOUT_FAILED);
        const scheduledElements = await owners.requireLayout(parent);
        expect(scheduledElements).to.deep.equal([0]);
      });

      it('should layout element w/ state=LAYOUT_COMPLETE', async () => {
        setElementResourceState(parent, ResourceState_Enum.LAYOUT_COMPLETE);
        const scheduledElements = await owners.requireLayout(parent);
        expect(scheduledElements).to.deep.equal([0]);
      });

      it('should not double schedule element w/ state=LAYOUT_SCHEDULED', async () => {
        setElementResourceState(parent, ResourceState_Enum.LAYOUT_SCHEDULED);
        const scheduledElements = await owners.requireLayout(parent);
        expect(scheduledElements).to.deep.equal([0]);
      });

      it('should not require layout for undisplayed element', async () => {
        const resource = setElementResourceState(
          parent,
          ResourceState_Enum.READY_FOR_LAYOUT
        );
        resource.isDisplayedForTesting = false;
        const scheduledElements = await owners.requireLayout(parent);
        expect(scheduledElements).to.deep.equal([0]);
      });
    });
  }
);
