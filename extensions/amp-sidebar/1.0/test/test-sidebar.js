/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
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

import * as Preact from '../../../../src/preact';
import {Sidebar} from '../sidebar';
import {mount} from 'enzyme';

describes.sandboxed('Sidebar preact component', {}, (env) => {
  describe('basic actions', () => {
    let wrapper;
    let ref;
    let sidebar;
    let animateFunction;
    let openButton;
    let closeButton;
    let toggleButton;

    beforeEach(() => {
      animateFunction = Element.prototype.animate;
      Element.prototype.animate = null;
      ref = Preact.createRef();
      wrapper = mount(
        <>
          <Sidebar ref={ref} side="left">
            <div>Content</div>
          </Sidebar>
          <button id="toggle" onClick={() => ref.current.toggle()}></button>
          <button id="open" onClick={() => ref.current.open()}></button>
          <button id="close" onClick={() => ref.current.close()}></button>
        </>
      );

      sidebar = wrapper.find(Sidebar);
      openButton = wrapper.find('#open');
      closeButton = wrapper.find('#close');
      toggleButton = wrapper.find('#toggle');
    });

    afterEach(() => {
      Element.prototype.animate = animateFunction;
    });

    it('close the sidebar when the mask is clicked', () => {
      openButton.getDOMNode().click();
      wrapper.update();

      const maskElement = wrapper.find(Sidebar).getDOMNode().nextSibling;
      maskElement.click();
      wrapper.update();

      // Sidebar closes
      expect(sidebar.getDOMNode()).to.be.null;
    });

    it('should include the content in the sidebar', () => {
      openButton.getDOMNode().click();
      wrapper.update();

      const contentElement = wrapper.find(Sidebar).getDOMNode()
        .firstElementChild.firstElementChild;
      expect(contentElement.textContent).to.equal('Content');
    });

    it('should allow for the sidebar on the right side', () => {
      ref = Preact.createRef();
      wrapper = mount(
        <>
          <Sidebar ref={ref} side="right">
            <div>Content</div>
          </Sidebar>
          <button id="toggle" onClick={() => ref.current.toggle()}></button>
          <button id="open" onClick={() => ref.current.open()}></button>
          <button id="close" onClick={() => ref.current.close()}></button>
        </>
      );

      sidebar = wrapper.find(Sidebar);
      openButton = wrapper.find('#open');
      closeButton = wrapper.find('#close');
      toggleButton = wrapper.find('#toggle');

      openButton.getDOMNode().click();
      wrapper.update();
      sidebar = wrapper.find(Sidebar);

      const sidebarNode = sidebar.getDOMNode();
      expect(sidebarNode.className.includes('right')).to.be.true;
    });

    describe('programatic access to imperative API', () => {
      it('open', () => {
        // Sidebar is initially closed (no rendered nodes)
        expect(sidebar.getDOMNode()).to.be.null;

        ref.current.open();
        wrapper.update();
        sidebar = wrapper.find(Sidebar);

        // Sidebar opens
        expect(sidebar.getDOMNode()).to.not.be.null;

        ref.current.open();
        wrapper.update();
        sidebar = wrapper.find(Sidebar);

        // Sidebar remains opens
        expect(sidebar.getDOMNode()).to.not.be.null;
      });

      it('close', () => {
        // Sidebar is initially closed (no rendered nodes)
        expect(sidebar.getDOMNode()).to.be.null;

        ref.current.open();
        wrapper.update();
        sidebar = wrapper.find(Sidebar);

        // Sidebar opens
        expect(sidebar.getDOMNode()).to.not.be.null;

        ref.current.close();
        wrapper.update();
        sidebar = wrapper.find(Sidebar);

        // Sidebar closes
        expect(sidebar.getDOMNode()).to.be.null;

        ref.current.close();
        wrapper.update();
        sidebar = wrapper.find(Sidebar);

        // Sidebar remains closed
        expect(sidebar.getDOMNode()).to.be.null;
      });

      it('toggle', () => {
        // Sidebar is initially closed (no rendered nodes)
        expect(sidebar.getDOMNode()).to.be.null;

        ref.current.toggle();
        wrapper.update();
        sidebar = wrapper.find(Sidebar);

        // Sidebar opens
        expect(sidebar.getDOMNode()).to.not.be.null;

        ref.current.toggle();
        wrapper.update();
        sidebar = wrapper.find(Sidebar);

        // Sidebar closes
        expect(sidebar.getDOMNode()).to.be.null;
      });
    });

    describe('click button to access imperative API', () => {
      it('open', () => {
        // Sidebar is initially closed (no rendered nodes)
        expect(sidebar.getDOMNode()).to.be.null;

        openButton.getDOMNode().click();
        wrapper.update();
        sidebar = wrapper.find(Sidebar);

        // Sidebar opens
        expect(sidebar.getDOMNode()).to.not.be.null;

        openButton.getDOMNode().click();
        wrapper.update();
        sidebar = wrapper.find(Sidebar);

        // Sidebar remains opens
        expect(sidebar.getDOMNode()).to.not.be.null;
      });

      it('close', () => {
        // Sidebar is initially closed (no rendered nodes)
        expect(sidebar.getDOMNode()).to.be.null;

        openButton.getDOMNode().click();
        wrapper.update();
        sidebar = wrapper.find(Sidebar);

        // Sidebar opens
        expect(sidebar.getDOMNode()).to.not.be.null;

        closeButton.getDOMNode().click();
        wrapper.update();
        sidebar = wrapper.find(Sidebar);

        // Sidebar closes
        expect(sidebar.getDOMNode()).to.be.null;

        closeButton.getDOMNode().click();
        wrapper.update();
        sidebar = wrapper.find(Sidebar);

        // Sidebar remains closed
        expect(sidebar.getDOMNode()).to.be.null;
      });

      it('toggle', () => {
        // Sidebar is initially closed (no rendered nodes)
        expect(sidebar.getDOMNode()).to.be.null;

        toggleButton.getDOMNode().click();
        wrapper.update();
        sidebar = wrapper.find(Sidebar);

        // Sidebar opens
        expect(sidebar.getDOMNode()).to.not.be.null;

        toggleButton.getDOMNode().click();
        wrapper.update();
        sidebar = wrapper.find(Sidebar);

        // Sidebar closes
        expect(sidebar.getDOMNode()).to.be.null;
      });
    });
  });

  describe('animations', () => {
    let wrapper;
    let ref;
    let sidebar;
    let animateStub;
    let animateFunction;
    let openButton;
    let closeButton;

    beforeEach(() => {
      ref = Preact.createRef();
      wrapper = mount(
        <>
          <Sidebar ref={ref} side="left">
            <div>Content</div>
          </Sidebar>
          <button id="toggle" onClick={() => ref.current.toggle()}></button>
          <button id="open" onClick={() => ref.current.open()}></button>
          <button id="close" onClick={() => ref.current.close()}></button>
        </>
      );

      sidebar = wrapper.find(Sidebar);
      openButton = wrapper.find('#open');
      closeButton = wrapper.find('#close');
    });

    afterEach(() => {});

    it('should not animate on mount', () => {
      animateStub = env.sandbox.stub(Element.prototype, 'animate');
      expect(animateStub).to.not.be.called;
    });

    it('should animate when sidebar opens', () => {
      animateStub = env.sandbox.stub(Element.prototype, 'animate');
      const animation = {};
      animateStub.returns(animation);

      // Sidebar is closed
      expect(sidebar.getDOMNode()).to.be.null;

      // Click to open the sidebar
      openButton.simulate('click');

      // Sidebar immediately begins to open
      sidebar = wrapper.find(Sidebar);
      expect(sidebar.getDOMNode()).to.not.be.null;

      // Animation has been started
      // One call each for the mask and the sidebar
      expect(animateStub).to.be.calledTwice;

      const sidebarKeyframes = animateStub.firstCall.firstArg;
      const maskKeyframes = animateStub.secondCall.firstArg;

      const sidebarOptions = animateStub.firstCall.args[1];
      const maskOptions = animateStub.secondCall.args[1];

      expect(sidebarKeyframes[0].transform).to.equal('translateX(-100%)');
      expect(sidebarKeyframes[1].transform).to.equal('translateX(0)');
      expect(sidebarOptions.duration).to.equal(350);
      expect(sidebarOptions.easing).to.equal('cubic-bezier(0,0,.21,1)');
      expect(sidebarOptions.fill).to.equal('both');

      expect(maskKeyframes[0].opacity).to.equal('0');
      expect(maskKeyframes[1].opacity).to.equal('1');
      expect(maskOptions.duration).to.equal(350);
      expect(maskOptions.easing).to.equal('cubic-bezier(0,0,.21,1)');
      expect(maskOptions.fill).to.equal('both');
    });

    it('should animate when sidebar closes', () => {
      animateFunction = Element.prototype.animate;
      Element.prototype.animate = null;

      // Sidebar is closed
      expect(sidebar.getDOMNode()).to.be.null;

      // Click to open the sidebar
      openButton.simulate('click');

      // Synchronously open the sidebar
      sidebar = wrapper.find(Sidebar);
      expect(sidebar.getDOMNode()).to.not.be.null;

      // Turn on animations after Sidebar is opened
      Element.prototype.animate = animateFunction;
      animateStub = env.sandbox.stub(Element.prototype, 'animate');
      const animation = {};
      animateStub.returns(animation);

      // Close the sidebar
      closeButton.simulate('click');

      // Sidebar begins to close but is not immediately closed
      sidebar = wrapper.find(Sidebar);
      expect(sidebar.getDOMNode()).to.not.be.null;

      // Animation has been started
      // One call each for the mask and the sidebar
      expect(animateStub).to.be.calledTwice;

      const sidebarKeyframes = animateStub.firstCall.firstArg;
      const maskKeyframes = animateStub.secondCall.firstArg;

      const sidebarOptions = animateStub.firstCall.args[1];
      const maskOptions = animateStub.secondCall.args[1];

      expect(sidebarKeyframes[0].transform).to.equal('translateX(-100%)');
      expect(sidebarKeyframes[1].transform).to.equal('translateX(0)');
      expect(sidebarOptions.direction).to.equal('reverse');
      expect(sidebarOptions.duration).to.equal(350);
      expect(sidebarOptions.easing).to.equal('cubic-bezier(0,0,.21,1)');
      expect(sidebarOptions.fill).to.equal('both');

      expect(maskKeyframes[0].opacity).to.equal('0');
      expect(maskKeyframes[1].opacity).to.equal('1');
      expect(maskOptions.direction).to.equal('reverse');
      expect(maskOptions.duration).to.equal(350);
      expect(maskOptions.easing).to.equal('cubic-bezier(0,0,.21,1)');
      expect(maskOptions.fill).to.equal('both');

      // Cleanup the animation.
      animation.onfinish();
      wrapper.update();
      sidebar = wrapper.find(Sidebar);
      expect(sidebar.getDOMNode()).to.be.null;
    });

    it('should make animations cancelable', () => {
      animateStub = env.sandbox.stub(Element.prototype, 'animate');
      const animation = {
        cancel: env.sandbox.spy(),
      };
      animateStub.returns(animation);

      // Sidebar is closed
      expect(sidebar.getDOMNode()).to.be.null;

      // Click to open the sidebar
      openButton.simulate('click');

      // Animation has been started
      // One call each for the mask and the sidebar
      expect(animateStub).to.be.calledTwice;

      // Click to close the sidebar and cancel the animation
      closeButton.simulate('click');

      // Expect cancel to be called twice (once for mask and once for sidebar)
      expect(animation.cancel).to.be.calledTwice;
    });

    it('should ignore animations if not available on the platform', () => {
      animateFunction = Element.prototype.animate;
      Element.prototype.animate = null;

      // Sidebar is closed
      expect(sidebar.getDOMNode()).to.be.null;

      // Click to open the sidebar
      openButton.simulate('click');

      // Immediately opens the sidebar
      sidebar = wrapper.find(Sidebar);
      expect(sidebar.getDOMNode()).to.not.be.null;

      // Click to close the sidebar
      closeButton.simulate('click');

      // Immediately closes the sidebar
      sidebar = wrapper.find(Sidebar);
      expect(sidebar.getDOMNode()).to.be.null;

      // Restore animatinos to the system
      Element.prototype.animate = animateFunction;
    });
  });
});
