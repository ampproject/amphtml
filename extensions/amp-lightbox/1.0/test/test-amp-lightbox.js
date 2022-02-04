import '../amp-lightbox';
import {
  ActionTrust_Enum,
  DEFAULT_ACTION,
} from '#core/constants/action-constants';
import {htmlFor} from '#core/dom/static-template';

import {toggleExperiment} from '#experiments';

import {Services} from '#service/';
import {ActionInvocation} from '#service/action-impl';

import {whenCalled} from '#testing/helpers/service';
import {poll} from '#testing/iframe';

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
    let historyPopSpy;
    let historyPushSpy;

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
      toggleExperiment(win, 'bento-lightbox', true, true);

      historyPopSpy = env.sandbox.spy();
      historyPushSpy = env.sandbox.spy();
      env.sandbox.stub(Services, 'historyForDoc').returns({
        push() {
          historyPushSpy();
          return Promise.resolve(11);
        },
        pop() {
          historyPopSpy();
          return Promise.resolve(11);
        },
      });

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
        const trust = ActionTrust_Enum.DEFAULT;
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
        expect(historyPushSpy).to.be.calledOnce;
        expect(historyPopSpy).to.have.not.been.called;

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
