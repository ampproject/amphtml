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
        await element.build();

        container = element.shadowRoot.firstElementChild;
        openButton = fullHtml.querySelector('#open');
        closeButton = fullHtml.querySelector('#close');
        toggleButton = fullHtml.querySelector('#toggle');
      });

      afterEach(() => {
        Element.prototype.animate = animateFunction;
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

      it('should close when the mask is clicked', async () => {
        element.enqueAction(invocation('open'));
        await waitForOpen(element, true);

        expect(container.children.length).to.equal(2);
        const mask = container.children[1];
        mask.click();

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

      beforeEach(async () => {
        win = env.win;
        html = htmlFor(win.document);
        toggleExperiment(win, 'bento-sidebar', true, true);
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
        await element.build();

        container = element.shadowRoot.firstElementChild;
        openButton = fullHtml.querySelector('#open');
        closeButton = fullHtml.querySelector('#close');
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

        // once for mask, once for sidebar
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

        // once for mask, once for sidebar
        expect(animateStub).to.be.calledTwice;

        // still displayed while animating
        expect(element).to.have.attribute('open');
        expect(container.children.length).to.not.equal(0);

        animation.onfinish();
        await waitForOpen(element, false);
        expect(element).to.not.have.attribute('open');
        expect(container.children.length).to.equal(0);
      });
    });
  }
);
