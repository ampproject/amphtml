import {CSS} from '#build/bento-lightbox-1.0.css';

import {BaseElement as BentoLightbox} from '#bento/components/bento-lightbox/1.0/base-element';
import {adoptStyles} from '#bento/util/unit-helpers';

import {htmlFor} from '#core/dom/static-template';

import {defineBentoElement} from '#preact/bento-ce';

import {poll} from '#testing/iframe';

describes.realWin(
  'bento-lightbox:1.0',
  {
    amp: false,
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

      element = html`
        <bento-lightbox>
          <p>Hello World</p>
        </bento-lightbox>
      `;
      win.document.body.appendChild(element);

      defineBentoElement('bento-lightbox', BentoLightbox, win);
      adoptStyles(win, CSS);

      await element.getApi();
    });

    afterEach(() => {
      win.document.body.removeChild(element);
    });

    describe('imperative api', () => {
      it('should open with default action', async () => {
        const api = await element.getApi();

        expect(element.hasAttribute('open')).to.be.false;
        // todo(kvchari): debug
        // expect(element.hasAttribute('hidden')).to.be.true;

        const eventSpy = env.sandbox.spy();
        element.addEventListener('open', eventSpy);

        api.open();
        await waitForOpen(element, true);
        expect(element.hasAttribute('hidden')).to.be.false;

        const content = getContent();
        expect(content.tagName).to.equal('SLOT');
        const contentEls = content.assignedElements();
        expect(contentEls).to.have.lengthOf(1);
        expect(contentEls[0].tagName).to.equal('P');
        expect(contentEls[0].textContent).to.equal('Hello World');

        expect(eventSpy).to.be.calledOnce;

        const scroller = element.shadowRoot.querySelector('[part=scroller]');
        expect(scroller).to.exist;
      });

      it('should open and close', async () => {
        const api = await element.getApi();

        expect(element.hasAttribute('open')).to.be.false;
        // todo(kvchari): debug
        // expect(element.hasAttribute('hidden')).to.be.true;

        const openSpy = env.sandbox.spy();
        const closeSpy = env.sandbox.spy();
        element.addEventListener('open', openSpy);
        element.addEventListener('close', closeSpy);

        api.open();
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

        api.close();
        await waitForOpen(element, false);
        expect(element.hasAttribute('hidden')).to.be.true;
        content = getContent();
        expect(content.tagName).to.equal('C');
        expect(content.children).to.have.lengthOf(0);

        expect(openSpy).to.be.calledOnce;
        expect(closeSpy).to.be.calledOnce;
      });
    });
  }
);
