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
import '../amp-lightbox';
import {ActionInvocation} from '../../../../src/service/action-impl';
import {ActionTrust, DEFAULT_ACTION} from '../../../../src/action-constants';
import {htmlFor} from '../../../../src/static-template';
import {poll} from '../../../../testing/iframe';
import {toggleExperiment} from '../../../../src/experiments';
import {whenCalled} from '../../../../testing/test-helper';

describes.realWin(
  'amp-lightbox:1.0',
  {
    amp: {
      extensions: ['amp-lightbox:1.0'],
    },
  },
  (env) => {
    let win;
    let html;
    let element;

    async function waitForOpen(el, open) {
      const isOpenOrNot = () => el.hasAttribute('open') === open;
      // Extend timeout due to animation delay.
      await poll('element open updated', isOpenOrNot, undefined, 500);
    }

    function getContent() {
      expect(element.shadowRoot).not.to.be.undefined;
      // Get slot if it exists, or <c> element otherwise.
      return element.shadowRoot.querySelector('c slot, c:empty');
    }

    beforeEach(async () => {
      win = env.win;
      html = htmlFor(win.document);
      toggleExperiment(win, 'bento-selector', true, true);
      element = html`
        <amp-lightbox layout="nodisplay">
          <p>Hello World</p>
        </amp-lightbox>
      `;
      win.document.body.appendChild(element);
      await element.buildInternal();
    });

    afterEach(() => {
      win.document.body.removeChild(element);
    });

    it('should render closed', async () => {
      expect(element.hasAttribute('open')).to.be.false;
      expect(element.hasAttribute('hidden')).to.be.true;
      const content = getContent();
      expect(content.tagName).to.equal('C');
      expect(content.children).to.have.lengthOf(0);
    });

    describe('imperative api', () => {
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

      it('should open with default action', async () => {
        env.sandbox.stub(element, 'setAsContainerInternal');
        env.sandbox.stub(element, 'removeAsContainerInternal');

        expect(element.hasAttribute('open')).to.be.false;
        expect(element.hasAttribute('hidden')).to.be.true;

        const eventSpy = env.sandbox.spy();
        element.addEventListener('open', eventSpy);

        element.enqueAction(invocation(DEFAULT_ACTION));
        await waitForOpen(element, true);
        expect(element.hasAttribute('hidden')).to.be.false;

        const content = getContent();
        expect(content.tagName).to.equal('SLOT');
        const contentEls = content.assignedElements();
        expect(contentEls).to.have.lengthOf(1);
        expect(contentEls[0].tagName).to.equal('P');
        expect(contentEls[0].textContent).to.equal('Hello World');

        expect(eventSpy).to.be.calledOnce;

        await whenCalled(element.setAsContainerInternal);
        const scroller = element.shadowRoot.querySelector('[part=scroller]');
        expect(scroller).to.exist;
        expect(element.setAsContainerInternal).to.be.calledWith(scroller);
        expect(element.removeAsContainerInternal).to.not.be.called;
      });

      it('should open and close', async () => {
        env.sandbox.stub(element, 'setAsContainerInternal');
        env.sandbox.stub(element, 'removeAsContainerInternal');

        expect(element.hasAttribute('open')).to.be.false;
        expect(element.hasAttribute('hidden')).to.be.true;

        const openSpy = env.sandbox.spy();
        const closeSpy = env.sandbox.spy();
        element.addEventListener('open', openSpy);
        element.addEventListener('close', closeSpy);

        element.enqueAction(invocation('open'));
        await waitForOpen(element, true);
        expect(element.hasAttribute('hidden')).to.be.false;

        let content = getContent();
        expect(content.tagName).to.equal('SLOT');
        const contentEls = content.assignedElements();
        expect(contentEls).to.have.lengthOf(1);
        expect(contentEls[0].tagName).to.equal('P');
        expect(contentEls[0].textContent).to.equal('Hello World');

        expect(openSpy).to.be.calledOnce;
        expect(closeSpy).not.to.have.been.called;

        element.enqueAction(invocation('close'));
        await waitForOpen(element, false);
        expect(element.hasAttribute('hidden')).to.be.true;
        content = getContent();
        expect(content.tagName).to.equal('C');
        expect(content.children).to.have.lengthOf(0);

        expect(openSpy).to.be.calledOnce;
        expect(closeSpy).to.be.calledOnce;
        expect(element.setAsContainerInternal).to.not.be.called;
        expect(element.removeAsContainerInternal).to.be.calledOnce;
      });
    });
  }
);
