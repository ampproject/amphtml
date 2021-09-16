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
import '../amp-sidebar';
import {ActionInvocation} from '../../../../src/service/action-impl';
import {ActionTrust} from '../../../../src/action-constants';
import {htmlFor} from '../../../../src/static-template';
import {toggleExperiment} from '../../../../src/experiments';
import {waitFor} from '../../../../testing/test-helper';

describes.realWin(
  'amp-sidebar:1.0',
  {
    amp: {
      extensions: ['amp-sidebar:1.0'],
    },
  },
  (env) => {
    async function waitForOpen(el, open) {
      const isOpenOrNot = () => el.hasAttribute('open') === open;
      await waitFor(isOpenOrNot, 'element open updated');
    }

    describe('basic actions', () => {
      let win;
      let html;
      let fullHtml;
      let element;
      let container;
      let openButton;
      let closeButton;
      let toggleButton;
      let animateFunction;
      let consoleWarnSpy;
      let consoleWarn;

      function invocation(method, args = {}) {
        const source = null;
        const caller = null;
        const event = null;
        const trust = ActionTrust.DEFAULT;
        return new ActionInvocation(
          element,
          method,
          args,
          source,
          caller,
          event,
          trust
        );
      }

      beforeEach(async () => {
        win = env.win;
        html = htmlFor(win.document);
        toggleExperiment(win, 'bento-sidebar', true, true);
        // disable animations for synchronous testing
        animateFunction = Element.prototype.animate;
        Element.prototype.animate = null;
        // disable warnings and check against spy when needed
        consoleWarn = console.warn;
        console.warn = () => true;
        consoleWarnSpy = env.sandbox.spy(console, 'warn');

        fullHtml = html`
          <div>
            <amp-sidebar id="sidebar" side="left">
              <div>
                <span>
                  Lorem ipsum dolor sit amet, has nisl nihil convenire et, vim
                  at aeque inermis reprehendunt.
                </span>
                <ul>
                  <li>1</li>
                  <li>2</li>
                  <li>3</li>
                </ul>
              </div>
            </amp-sidebar>
            <div id="buttons">
              <button id="toggle" on="tap:sidebar.toggle()">toggle</button>
              <button id="open" on="tap:sidebar.open()">open</button>
              <button id="close" on="tap:sidebar.close()">close</button>
            </div>
          </div>
        `;
        element = fullHtml.firstElementChild;
        win.document.body.appendChild(fullHtml);
        await element.buildInternal();

        container = element.shadowRoot.firstElementChild;
        openButton = fullHtml.querySelector('#open');
        closeButton = fullHtml.querySelector('#close');
        toggleButton = fullHtml.querySelector('#toggle');
      });

      afterEach(() => {
        Element.prototype.animate = animateFunction;
        console.warn = consoleWarn;
      });

      it('open attribute is synced with component mounted', async () => {
        // sidebar is initially closed
        expect(element).to.not.have.attribute('open');
        expect(container.children.length).to.equal(0);

        openButton.click();
        await waitForOpen(element, true);

        expect(element).to.have.attribute('open');
        expect(container.children.length).to.not.equal(0);

        closeButton.click();
        await waitForOpen(element, false);

        expect(element).to.not.have.attribute('open');
        expect(container.children.length).to.equal(0);
      });

      it('should open and close when "open" attribute is set', async () => {
        // sidebar is initially closed
        expect(element).to.not.have.attribute('open');
        expect(container.children.length).to.equal(0);

        element.setAttribute('open', '');
        await waitForOpen(element, true);

        expect(element).to.have.attribute('open');
        expect(container.children.length).to.not.equal(0);

        element.removeAttribute('open');
        await waitForOpen(element, false);

        expect(element).to.not.have.attribute('open');
        expect(container.children.length).to.equal(0);
      });

      it('should close when the backdrop is clicked', async () => {
        element.enqueAction(invocation('open'));
        await waitForOpen(element, true);

        expect(container.children.length).to.equal(2);
        const backdrop = container.children[1];
        backdrop.click();

        await waitForOpen(element, false);

        expect(element).to.not.have.attribute('open');
        expect(container.children.length).to.equal(0);
      });

      it('should render all children of the sidebar', async () => {
        // closed sidebar should not render any content
        expect(container.children.length).to.equal(0);

        // open the sidebar
        openButton.click();
        await waitForOpen(element, true);
        expect(element).to.have.attribute('open');

        // confirm slot within the shadow root
        expect(container.children.length).to.equal(2);
        expect(container.children[0].firstElementChild).to.be.ok;
        expect(container.children[0].firstElementChild.firstElementChild).to.be
          .ok;
        expect(
          container.children[0].firstElementChild.firstElementChild.nodeName
        ).to.equal('SLOT');

        // confirm slotted contents (children of sidebar)
        expect(element.children.length).to.equal(1);
        const sidebarChildren = element.children[0];
        expect(sidebarChildren.children.length).to.equal(2);
        expect(sidebarChildren.firstElementChild.nodeName).to.equal('SPAN');
        expect(sidebarChildren.lastElementChild.nodeName).to.equal('UL');
        expect(sidebarChildren.firstElementChild.textContent.trim()).to.include(
          'Lorem ipsum dolor sit amet'
        );
        expect(sidebarChildren.lastElementChild.children.length).to.equal(3);
      });

      it('should render with default colors', async () => {
        // open the sidebar
        openButton.click();
        await waitForOpen(element, true);
        expect(element).to.have.attribute('open');

        const {
          firstElementChild: sidebarElement,
          lastElementChild: backdropElement,
        } = container;

        expect(win.getComputedStyle(sidebarElement).color).to.equal(
          'rgb(0, 0, 0)'
        );
        expect(win.getComputedStyle(sidebarElement).backgroundColor).to.equal(
          'rgb(239, 239, 239)'
        );
        expect(win.getComputedStyle(backdropElement).backgroundColor).to.equal(
          'rgba(0, 0, 0, 0.5)'
        );
      });

      it('should reflect user supplied CSS for various properties', async () => {
        const style = html`
          <style>
            amp-sidebar {
              color: rgb(1, 1, 1);
              background-color: rgb(2, 2, 2);
              height: 300px;
              width: 301px;
              padding: 15px;
              border: solid 1px black;
              top: 10px;
              max-height: 500px !important;
              max-width: 600px !important;
              min-width: 200px !important;
              outline: solid 1px red;
              z-index: 15;
            }
            amp-sidebar::part(backdrop) {
              background-color: rgb(3, 3, 3);
            }
          </style>
        `;
        fullHtml.appendChild(style);

        // open the sidebar
        openButton.click();
        await waitForOpen(element, true);
        expect(element).to.have.attribute('open');

        const {
          firstElementChild: sidebarElement,
          lastElementChild: backdropElement,
        } = container;

        expect(win.getComputedStyle(sidebarElement).color).to.equal(
          'rgb(1, 1, 1)'
        );
        expect(win.getComputedStyle(sidebarElement).backgroundColor).to.equal(
          'rgb(2, 2, 2)'
        );
        expect(win.getComputedStyle(sidebarElement).height).to.equal('300px');
        expect(win.getComputedStyle(sidebarElement).width).to.equal('301px');
        expect(win.getComputedStyle(sidebarElement).padding).to.equal('15px');
        expect(win.getComputedStyle(sidebarElement).border).to.equal(
          '1px solid rgb(0, 0, 0)'
        );
        expect(win.getComputedStyle(sidebarElement).top).to.equal('10px');
        expect(win.getComputedStyle(sidebarElement).maxHeight).to.equal(
          '500px'
        );
        expect(win.getComputedStyle(sidebarElement).maxWidth).to.equal('600px');
        expect(win.getComputedStyle(sidebarElement).minWidth).to.equal('200px');
        expect(win.getComputedStyle(sidebarElement).outline).to.equal(
          'rgb(255, 0, 0) solid 1px'
        );
        expect(win.getComputedStyle(sidebarElement).zIndex).to.equal('15');

        expect(win.getComputedStyle(backdropElement).backgroundColor).to.equal(
          'rgb(3, 3, 3)'
        );
      });

      it('should not update some CSS properties w/o !important', async () => {
        const style = html`
          <style>
            amp-sidebar {
              max-height: 500px;
              max-width: 600px;
              min-width: 200px;
            }
          </style>
        `;
        fullHtml.appendChild(style);

        // open the sidebar
        openButton.click();
        await waitForOpen(element, true);
        expect(element).to.have.attribute('open');

        const {firstElementChild: sidebarElement} = container;

        // maxHeight defaults to 100vh, so should be the same height as viewport
        expect(win.getComputedStyle(sidebarElement).maxHeight).to.equal(
          `${win.innerHeight}px`
        );

        // maxWidth is not set as !important so is overridable
        expect(win.getComputedStyle(sidebarElement).maxWidth).to.equal(`600px`);

        // 45px is default, user supplied 200px does not overwrite w/o !important
        expect(win.getComputedStyle(sidebarElement).minWidth).to.equal('45px');
      });

      it('should display a warning when sidebar is not child of body', async () => {
        // sidebar is wrapped in a div so not direct child of body
        // warning should be calledOnce
        expect(consoleWarnSpy).to.be.calledOnce;

        const noWarnSidebar = html`
          <amp-sidebar id="sidebar" side="left">
            <div>
              <span>
                Lorem ipsum dolor sit amet, has nisl nihil convenire et, vim at
                aeque inermis reprehendunt.
              </span>
              <ul>
                <li>1</li>
                <li>2</li>
                <li>3</li>
              </ul>
            </div>
          </amp-sidebar>
        `;
        win.document.body.appendChild(noWarnSidebar);
        await noWarnSidebar.buildInternal();

        // the 'noWarnSidebar' above is appended directly to the body and
        // should not throw a warning
        // the stub should still only have been called once
        expect(consoleWarnSpy).to.be.calledOnce;
      });

      it('should default "left" or "right" based on document.dir when side not provided', async () => {
        const documentDir = win.document.dir;

        /**
         * document.dir is not 'rtl' and side is not provided to the element
         * so we should default to 'left'
         */
        win.document.dir = 'blah';
        fullHtml = html`
          <div>
            <amp-sidebar id="sidebar2">
              <div>Hello World!</div>
            </amp-sidebar>
            <div id="buttons">
              <button id="open" on="tap:sidebar2.open()">open</button>
            </div>
          </div>
        `;
        element = fullHtml.firstElementChild;
        win.document.body.appendChild(fullHtml);
        await element.buildInternal();
        container = element.shadowRoot.firstElementChild;
        openButton = fullHtml.querySelector('#open');

        // open the sidebar
        openButton.click();
        await waitForOpen(element, true);
        expect(element).to.have.attribute('open');
        let sidebarElement = container.firstElementChild;

        // defaults to left if document is not 'ltr'
        expect(sidebarElement.className.includes('left')).to.be.true;

        /**
         * document.dir is 'rtl' and side is not provided to the element
         * so we should default to 'right'
         */
        win.document.dir = 'rtl';
        fullHtml = html`
          <div>
            <amp-sidebar id="sidebar3">
              <div>Hello World!</div>
            </amp-sidebar>
            <div id="buttons">
              <button id="open" on="tap:sidebar3.open()">open</button>
            </div>
          </div>
        `;
        element = fullHtml.firstElementChild;
        win.document.body.appendChild(fullHtml);
        await element.buildInternal();
        container = element.shadowRoot.firstElementChild;
        openButton = fullHtml.querySelector('#open');

        // open the sidebar
        openButton.click();
        await waitForOpen(element, true);
        expect(element).to.have.attribute('open');
        sidebarElement = container.firstElementChild;

        // defaults to right if document is 'rtl'
        expect(sidebarElement.className.includes('right')).to.be.true;

        win.document.dir = documentDir;
      });

      it('should have `overscroll-behavior: none` to prevent background scrolling', async () => {
        // open the sidebar
        openButton.click();
        await waitForOpen(element, true);
        expect(element).to.have.attribute('open');

        const {
          firstElementChild: sidebarElement,
          lastElementChild: backdropElement,
        } = container;

        expect(
          win.getComputedStyle(sidebarElement).overscrollBehavior
        ).to.equal('none');
        expect(
          win.getComputedStyle(backdropElement).overscrollBehavior
        ).to.equal('none');
      });

      describe('programatic access to imperative API', () => {
        it('open', async () => {
          // sidebar is initially closed
          expect(element).to.not.have.attribute('open');
          element.enqueAction(invocation('open'));
          await waitForOpen(element, true);

          // sidebar is opened
          expect(element).to.have.attribute('open');
        });

        it('close', async () => {
          // sidebar is initially closed
          expect(element).to.not.have.attribute('open');

          // open the sidebar
          element.enqueAction(invocation('open'));
          await waitForOpen(element, true);

          // sidebar is opened
          expect(element).to.have.attribute('open');

          // test the close action
          element.enqueAction(invocation('close'));

          // sidebar is closed
          await waitForOpen(element, false);
          expect(element).to.not.have.attribute('open');
        });

        it('toggle', async () => {
          // sidebar is initially closed
          expect(element).to.not.have.attribute('open');

          // toggle action
          element.enqueAction(invocation('toggle'));
          await waitForOpen(element, true);

          // sidebar is opened
          expect(element).to.have.attribute('open');

          // toggle action
          element.enqueAction(invocation('toggle'));
          await waitForOpen(element, false);

          // sidebar is closed
          expect(element).to.not.have.attribute('open');
        });
      });

      describe('click button to access imperative API', () => {
        it('open', async () => {
          // sidebar is initially closed
          expect(element).to.not.have.attribute('open');
          openButton.click();
          await waitForOpen(element, true);

          // sidebar is opened
          expect(element).to.have.attribute('open');
        });

        it('close', async () => {
          // sidebar is initially closed
          expect(element).to.not.have.attribute('open');

          // open the sidebar
          openButton.click();
          await waitForOpen(element, true);

          // sidebar is opened
          expect(element).to.have.attribute('open');

          // test the close button
          closeButton.click();

          // sidebar is closed
          await waitForOpen(element, false);
          expect(element).to.not.have.attribute('open');
        });

        it('toggle', async () => {
          // sidebar is initially closed
          expect(element).to.not.have.attribute('open');

          // toggle action
          toggleButton.click();
          await waitForOpen(element, true);

          // sidebar is opened
          expect(element).to.have.attribute('open');

          // toggle action
          toggleButton.click();
          await waitForOpen(element, false);

          // sidebar is closed
          expect(element).to.not.have.attribute('open');
        });
      });
    });

    describe('animations', () => {
      let win;
      let html;
      let fullHtml;
      let element;
      let container;
      let openButton;
      let closeButton;
      let animateStub;
      let consoleWarn;

      beforeEach(async () => {
        win = env.win;
        html = htmlFor(win.document);
        toggleExperiment(win, 'bento-sidebar', true, true);

        // disable warnings since sidebar is child of a div container
        // (and not body)
        consoleWarn = console.warn;
        console.warn = () => true;

        fullHtml = html`
          <div>
            <amp-sidebar id="sidebar" side="left">
              <div>
                <span>
                  Lorem ipsum dolor sit amet, has nisl nihil convenire et, vim
                  at aeque inermis reprehendunt.
                </span>
                <ul>
                  <li>1</li>
                  <li>2</li>
                  <li>3</li>
                </ul>
              </div>
            </amp-sidebar>
            <div id="buttons">
              <button id="toggle" on="tap:sidebar.toggle()">toggle</button>
              <button id="open" on="tap:sidebar.open()">open</button>
              <button id="close" on="tap:sidebar.close()">close</button>
            </div>
          </div>
        `;
        element = fullHtml.firstElementChild;
        win.document.body.appendChild(fullHtml);
        await element.buildInternal();

        container = element.shadowRoot.firstElementChild;
        openButton = fullHtml.querySelector('#open');
        closeButton = fullHtml.querySelector('#close');
      });

      afterEach(() => {
        console.warn = consoleWarn;
      });

      it('should not animate on build', () => {
        animateStub = env.sandbox.stub(Element.prototype, 'animate');
        expect(animateStub).to.not.be.called;
      });

      it('should animate expand', async () => {
        const animation = {};
        animateStub = env.sandbox.stub(Element.prototype, 'animate');
        animateStub.returns(animation);

        // sidebar is initially closed
        expect(element).to.not.have.attribute('open');
        expect(container.children.length).to.equal(0);

        openButton.click();
        await waitForOpen(element, true);

        // once for backdrop, once for sidebar
        expect(animateStub).to.be.calledTwice;
        animation.onfinish();

        expect(element).to.have.attribute('open');
        expect(container.children.length).to.not.equal(0);
      });

      it('should animate collapse', async () => {
        const animateFunction = Element.prototype.animate;
        Element.prototype.animate = null;

        // sidebar is initially closed
        expect(element).to.not.have.attribute('open');
        expect(container.children.length).to.equal(0);

        // synchronous open
        openButton.click();
        await waitForOpen(element, true);

        // turn on animations
        Element.prototype.animate = animateFunction;
        const animation = {};
        animateStub = env.sandbox.stub(Element.prototype, 'animate');
        animateStub.returns(animation);

        closeButton.click();
        await waitFor(() => animateStub.callCount > 0, 'animation started');

        // once for backdrop, once for sidebar
        expect(animateStub).to.be.calledTwice;

        // still displayed while animating
        expect(element).to.have.attribute('open');
        expect(container.children.length).to.not.equal(0);

        animation.onfinish();
        await waitForOpen(element, false);
        expect(element).to.not.have.attribute('open');
        expect(container.children.length).to.equal(0);
      });

      it('should reverse animations if closed while opening', async () => {
        const animation = {
          reverse: env.sandbox.spy(),
        };
        animateStub = env.sandbox.stub(Element.prototype, 'animate');
        animateStub.returns(animation);

        // sidebar is initially closed
        expect(element).to.not.have.attribute('open');
        expect(container.children.length).to.equal(0);

        // begin open animation
        openButton.click();
        await waitForOpen(element, true);

        // animate stub called once for backdrop, once for sidebar
        expect(animateStub).to.be.calledTwice;

        // close the sidebar and reverse the animation (mid animation)
        closeButton.click();

        // animation begins to reverse
        await waitFor(
          () => animation.reverse.callCount > 0,
          'reverse animation has begun'
        );
        expect(animation.reverse).to.be.calledTwice;
      });

      it('should reverse animations if opened while closing', async () => {
        const animateFunction = Element.prototype.animate;
        Element.prototype.animate = null;

        // sidebar is initially closed
        expect(element).to.not.have.attribute('open');
        expect(container.children.length).to.equal(0);

        // synchronous open
        openButton.click();
        await waitForOpen(element, true);

        // turn on animations
        Element.prototype.animate = animateFunction;
        const animation = {reverse: env.sandbox.spy()};
        animateStub = env.sandbox.stub(Element.prototype, 'animate');
        animateStub.returns(animation);

        // sidebar is initially opened
        expect(element).to.have.attribute('open');
        expect(container.children.length).to.not.equal(0);

        // begin close animation
        closeButton.click();
        await waitFor(() => animateStub.callCount > 0, 'animation has begun');

        // animate stub called once for backdrop, once for sidebar
        expect(animateStub).to.be.calledTwice;

        // open the sidebar and reverse the animation (mid animation)
        openButton.click();

        // animation begins to reverse
        await waitFor(
          () => animation.reverse.callCount > 0,
          'reverse animation has begun'
        );
        expect(animation.reverse).to.be.calledTwice;
      });
    });
  }
);
