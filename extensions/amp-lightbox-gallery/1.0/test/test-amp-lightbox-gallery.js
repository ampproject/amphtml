import '../amp-lightbox-gallery';
import {
  ActionTrust_Enum,
  DEFAULT_ACTION,
} from '#core/constants/action-constants';
import {createElementWithAttributes} from '#core/dom';
import {htmlFor} from '#core/dom/static-template';

import {toggleExperiment} from '#experiments';

import {Services} from '#service/';
import {ActionInvocation} from '#service/action-impl';

import * as analytics from '#utils/analytics';

import {waitFor, whenCalled} from '#testing/helpers/service';
import {poll} from '#testing/iframe';

import {installLightboxGallery} from '../amp-lightbox-gallery';

const TAG = 'amp-lightbox-gallery';

describes.realWin(
  'amp-lightbox-gallery-v1.0',
  {
    amp: {
      extensions: ['amp-lightbox-gallery:1.0'],
    },
  },
  (env) => {
    let win;
    let doc;
    let html;
    let element;
    let historyPopSpy;
    let historyPushSpy;

    async function waitForOpen(el, open) {
      const isOpenOrNot = () => el.hasAttribute('open') === open;
      // Extend timeout due to animation delay.
      await poll('element open updated', isOpenOrNot, undefined, 500);
    }

    function invocation(element, method, args = {}) {
      const source = null;
      const caller = null;
      const event = null;
      const trust = ActionTrust_Enum.HIGH;
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

    beforeEach(() => {
      win = env.win;
      doc = win.document;
      html = htmlFor(doc);
      toggleExperiment(win, 'bento-lightbox-gallery', true, true);

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
    });

    afterEach(() => {
      element?.parentNode?.removeChild(element);
    });

    it('should render', async () => {
      await installLightboxGallery(env.ampdoc);
      element = doc.getElementById(TAG);
      await element.buildInternal();
      expect(element.hasAttribute('open')).to.be.false;
      expect(element.hasAttribute('hidden')).to.be.true;
    });

    describe('uniqueness', () => {
      let duplicate;

      afterEach(() => {
        duplicate?.parentNode?.removeChild(duplicate);
      });

      it('should remove duplicate element', async () => {
        await installLightboxGallery(env.ampdoc);
        element = doc.getElementById(TAG);
        await element.mountInternal();
        duplicate = createElementWithAttributes(doc, TAG, {
          'layout': 'nodisplay',
        });

        // first attempt is removed
        doc.body.appendChild(duplicate);
        expect(duplicate.mountInternal()).to.be.rejectedWith(/CANCELLED/);
        await waitFor(
          () => duplicate.parentNode == null,
          'Waiting for duplicate detached.'
        );
        expect(element.parentNode).not.to.be.null;

        // second attempt is removed
        doc.body.appendChild(duplicate);
        expect(duplicate.mountInternal()).to.be.rejectedWith(/CANCELLED/);
        await waitFor(
          () => duplicate.parentNode == null,
          'Waiting for duplicate detached.'
        );
        expect(element.parentNode).not.to.be.null;
      });

      it('should allow duplicate if first instance is removed', async () => {
        await installLightboxGallery(env.ampdoc);
        element = doc.getElementById(TAG);
        await element.mountInternal();
        element.parentNode.removeChild(element);

        duplicate = createElementWithAttributes(doc, TAG, {
          'layout': 'nodisplay',
        });
        doc.body.appendChild(duplicate);
        await duplicate.mountInternal();

        expect(duplicate.parentNode).not.to.be.null;
        expect(element.parentNode).to.be.null;
      });
    });

    describe('mutability', () => {
      let img;

      beforeEach(async () => {
        img = html` <img lightbox src="img.jpg" /> `;
        doc.body.appendChild(img);
        await installLightboxGallery(env.ampdoc);
        element = doc.getElementById(TAG);
        await element.buildInternal();
      });

      it('should open when writing "open" attribute', async () => {
        const triggerAnalyticsStub = env.sandbox.stub(
          analytics,
          'triggerAnalyticsEvent'
        );
        env.sandbox.stub(element, 'setAsContainerInternal');
        env.sandbox.stub(element, 'removeAsContainerInternal');

        expect(element.hasAttribute('open')).to.be.false;
        expect(element.hasAttribute('hidden')).to.be.true;

        element.setAttribute('open', '');
        await waitFor(
          () => !element.hasAttribute('hidden'),
          'lightbox is shown'
        );

        const renderedImgs = element.shadowRoot.querySelectorAll(
          '[part=lightbox] img'
        );
        expect(renderedImgs).to.have.lengthOf(1);
        expect(renderedImgs[0].tagName).to.equal('IMG');
        expect(renderedImgs[0].srcset).to.equal('img.jpg 1x');

        await whenCalled(element.setAsContainerInternal);
        expect(historyPushSpy).to.be.calledOnce;
        expect(historyPopSpy).to.have.not.been.called;
        expect(triggerAnalyticsStub).to.have.been.calledOnceWithExactly(
          element,
          'lightboxOpened'
        );

        const scroller = element.shadowRoot.querySelector('[part=scroller]');
        expect(scroller).not.to.be.null;
        expect(element.setAsContainerInternal).to.be.calledWith(scroller);
        expect(element.removeAsContainerInternal).to.not.be.called;
      });

      it('should close when removing "open" attribute', async () => {
        env.sandbox.stub(element, 'setAsContainerInternal');
        env.sandbox.stub(element, 'removeAsContainerInternal');

        expect(element.hasAttribute('open')).to.be.false;
        expect(element.hasAttribute('hidden')).to.be.true;

        element.setAttribute('open', '');
        await waitFor(
          () => !element.hasAttribute('hidden'),
          'lightbox is shown'
        );

        const renderedImgs = element.shadowRoot.querySelectorAll(
          '[part=lightbox] img'
        );
        expect(renderedImgs).to.have.lengthOf(1);
        expect(renderedImgs[0].tagName).to.equal('IMG');
        expect(renderedImgs[0].srcset).to.equal('img.jpg 1x');

        await whenCalled(element.setAsContainerInternal);
        expect(historyPushSpy).to.be.calledOnce;
        expect(historyPopSpy).to.have.not.been.called;

        const scroller = element.shadowRoot.querySelector('[part=scroller]');
        expect(scroller).not.to.be.null;
        expect(element.setAsContainerInternal).to.be.calledOnce;
        expect(element.setAsContainerInternal).to.be.calledWith(scroller);
        expect(element.removeAsContainerInternal).to.not.be.called;

        element.removeAttribute('open');
        // Extend timeout due to animation delay.
        await poll(
          'lightbox is hidden',
          () => element.hasAttribute('hidden'),
          undefined,
          500
        );
        expect(element.shadowRoot.querySelector('[part=lightbox]')).to.be.null;

        expect(element.setAsContainerInternal).to.be.calledOnce;
        expect(element.removeAsContainerInternal).to.be.calledOnce;
        expect(historyPushSpy).to.be.calledOnce;
        expect(historyPopSpy).to.be.calledOnce;
      });
    });

    describe('imperative api', () => {
      let img;

      beforeEach(async () => {
        img = html` <img lightbox src="img.jpg" /> `;
        doc.body.appendChild(img);
        await installLightboxGallery(env.ampdoc);
        element = doc.getElementById(TAG);
        await element.buildInternal();
      });

      it('should open with default action', async () => {
        const triggerAnalyticsStub = env.sandbox.stub(
          analytics,
          'triggerAnalyticsEvent'
        );
        env.sandbox.stub(element, 'setAsContainerInternal');
        env.sandbox.stub(element, 'removeAsContainerInternal');

        expect(element.hasAttribute('open')).to.be.false;
        expect(element.hasAttribute('hidden')).to.be.true;

        element.enqueAction(invocation(element, DEFAULT_ACTION));
        await waitForOpen(element, true);
        expect(element.hasAttribute('hidden')).to.be.false;

        const renderedImgs = element.shadowRoot.querySelectorAll(
          '[part=lightbox] img'
        );
        expect(renderedImgs).to.have.lengthOf(1);
        expect(renderedImgs[0].tagName).to.equal('IMG');
        expect(renderedImgs[0].srcset).to.equal('img.jpg 1x');

        await whenCalled(element.setAsContainerInternal);
        expect(historyPushSpy).to.be.calledOnce;
        expect(historyPopSpy).to.have.not.been.called;
        expect(triggerAnalyticsStub).to.have.been.calledOnceWithExactly(
          element,
          'lightboxOpened'
        );

        const scroller = element.shadowRoot.querySelector('[part=scroller]');
        expect(scroller).not.to.be.null;
        expect(element.setAsContainerInternal).to.be.calledWith(scroller);
        expect(element.removeAsContainerInternal).to.not.be.called;
      });

      it('should open with "open" action', async () => {
        const triggerAnalyticsStub = env.sandbox.stub(
          analytics,
          'triggerAnalyticsEvent'
        );
        env.sandbox.stub(element, 'setAsContainerInternal');
        env.sandbox.stub(element, 'removeAsContainerInternal');

        expect(element.hasAttribute('open')).to.be.false;
        expect(element.hasAttribute('hidden')).to.be.true;

        element.enqueAction(invocation(element, 'open'));
        await waitForOpen(element, true);
        expect(element.hasAttribute('hidden')).to.be.false;

        const renderedImgs = element.shadowRoot.querySelectorAll(
          '[part="lightbox"]  img'
        );
        expect(renderedImgs).to.have.lengthOf(1);
        expect(renderedImgs[0].tagName).to.equal('IMG');
        expect(renderedImgs[0].srcset).to.equal('img.jpg 1x');

        await whenCalled(element.setAsContainerInternal);
        expect(historyPushSpy).to.be.calledOnce;
        expect(historyPopSpy).to.have.not.been.called;
        expect(triggerAnalyticsStub).to.have.been.calledOnceWithExactly(
          element,
          'lightboxOpened'
        );

        const scroller = element.shadowRoot.querySelector('[part=scroller]');
        expect(scroller).not.to.be.null;
        expect(element.setAsContainerInternal).to.be.calledWith(scroller);
        expect(element.removeAsContainerInternal).to.not.be.called;
      });

      it('should open with "open" action and toggle to grid view', async () => {
        env.sandbox.stub(element, 'setAsContainerInternal');
        env.sandbox.stub(element, 'removeAsContainerInternal');

        expect(element.hasAttribute('open')).to.be.false;
        expect(element.hasAttribute('hidden')).to.be.true;

        element.enqueAction(invocation(element, 'open'));
        await waitForOpen(element, true);
        expect(element.hasAttribute('hidden')).to.be.false;

        const triggerAnalyticsStub = env.sandbox.stub(
          analytics,
          'triggerAnalyticsEvent'
        );
        const event = document.createEvent('SVGEvents');
        event.initEvent('click');
        element.shadowRoot
          .querySelector('[aria-label="Switch to grid view"]')
          .dispatchEvent(event);
        expect(triggerAnalyticsStub).to.have.been.calledOnceWithExactly(
          element,
          'thumbnailsViewToggled'
        );
      });
    });

    describe('grouping', () => {
      let lightboxElements;

      beforeEach(async () => {
        lightboxElements = html`<div>
          <img id="my-img" lightbox src="img.jpg" />
          <amp-base-carousel lightbox>
            <img src="img1.jpg" />
            <img id="my-slide" src="img2.jpg" />
            <img src="img3.jpg" />
          </amp-base-carousel>
          <img id="custom-img" lightbox="custom-group" src="img4.jpg" />
          <amp-stream-gallery lightbox>
            <img src="img5.jpg" />
            <img id="my-gallery-slide" src="img6.jpg" />
            <img src="img7.jpg" />
          </amp-stream-gallery>
        </div>`;
        doc.body.appendChild(lightboxElements);
        await installLightboxGallery(env.ampdoc);
        element = doc.getElementById(TAG);
        await element.buildInternal();
      });

      it('should open to default group', async () => {
        env.sandbox.stub(element, 'setAsContainerInternal');
        env.sandbox.stub(element, 'removeAsContainerInternal');

        expect(element.hasAttribute('open')).to.be.false;
        expect(element.hasAttribute('hidden')).to.be.true;

        element.enqueAction(
          invocation(element, DEFAULT_ACTION, {id: 'my-img'})
        );
        await waitForOpen(element, true);
        expect(element.hasAttribute('hidden')).to.be.false;

        const renderedImgs = element.shadowRoot.querySelectorAll(
          '[part=lightbox] img'
        );
        expect(renderedImgs).to.have.lengthOf(1);
        expect(renderedImgs[0].tagName).to.equal('IMG');
        expect(renderedImgs[0].srcset).to.equal('img.jpg 1x');

        await whenCalled(element.setAsContainerInternal);
        expect(historyPushSpy).to.be.calledOnce;
        expect(historyPopSpy).to.have.not.been.called;

        const scroller = element.shadowRoot.querySelector('[part=scroller]');
        expect(scroller).not.to.be.null;
        expect(element.setAsContainerInternal).to.be.calledWith(scroller);
        expect(element.removeAsContainerInternal).to.not.be.called;
      });

      it('should open to default carousel group (amp-base-carousel)', async () => {
        env.sandbox.stub(element, 'setAsContainerInternal');
        env.sandbox.stub(element, 'removeAsContainerInternal');

        expect(element.hasAttribute('open')).to.be.false;
        expect(element.hasAttribute('hidden')).to.be.true;

        element.enqueAction(
          invocation(element, DEFAULT_ACTION, {id: 'my-slide'})
        );
        await waitForOpen(element, true);
        expect(element.hasAttribute('hidden')).to.be.false;

        const renderedImgs = element.shadowRoot.querySelectorAll(
          '[part=lightbox] img'
        );
        expect(renderedImgs).to.have.lengthOf(3);
        expect(renderedImgs[0].tagName).to.equal('IMG');
        expect(renderedImgs[0].srcset).to.equal('img1.jpg 1x');
        expect(renderedImgs[1].tagName).to.equal('IMG');
        expect(renderedImgs[1].srcset).to.equal('img2.jpg 1x');
        expect(renderedImgs[2].tagName).to.equal('IMG');
        expect(renderedImgs[2].srcset).to.equal('img3.jpg 1x');

        await whenCalled(element.setAsContainerInternal);
        expect(historyPushSpy).to.be.calledOnce;
        expect(historyPopSpy).to.have.not.been.called;

        const scroller = element.shadowRoot.querySelector('[part=scroller]');
        expect(scroller).not.to.be.null;
        expect(element.setAsContainerInternal).to.be.calledWith(scroller);
        expect(element.removeAsContainerInternal).to.not.be.called;
      });

      it('should open to default carousel group (amp-stream-gallery)', async () => {
        env.sandbox.stub(element, 'setAsContainerInternal');
        env.sandbox.stub(element, 'removeAsContainerInternal');

        expect(element.hasAttribute('open')).to.be.false;
        expect(element.hasAttribute('hidden')).to.be.true;

        element.enqueAction(
          invocation(element, DEFAULT_ACTION, {id: 'my-gallery-slide'})
        );
        await waitForOpen(element, true);
        expect(element.hasAttribute('hidden')).to.be.false;

        const renderedImgs = element.shadowRoot.querySelectorAll(
          '[part=lightbox] img'
        );
        expect(renderedImgs).to.have.lengthOf(3);
        expect(renderedImgs[0].tagName).to.equal('IMG');
        expect(renderedImgs[0].srcset).to.equal('img5.jpg 1x');
        expect(renderedImgs[1].tagName).to.equal('IMG');
        expect(renderedImgs[1].srcset).to.equal('img6.jpg 1x');
        expect(renderedImgs[2].tagName).to.equal('IMG');
        expect(renderedImgs[2].srcset).to.equal('img7.jpg 1x');

        await whenCalled(element.setAsContainerInternal);
        expect(historyPushSpy).to.be.calledOnce;
        expect(historyPopSpy).to.have.not.been.called;

        const scroller = element.shadowRoot.querySelector('[part=scroller]');
        expect(scroller).not.to.be.null;
        expect(element.setAsContainerInternal).to.be.calledWith(scroller);
        expect(element.removeAsContainerInternal).to.not.be.called;
      });

      it('should open to given named group', async () => {
        env.sandbox.stub(element, 'setAsContainerInternal');
        env.sandbox.stub(element, 'removeAsContainerInternal');

        expect(element.hasAttribute('open')).to.be.false;
        expect(element.hasAttribute('hidden')).to.be.true;

        element.enqueAction(
          invocation(element, DEFAULT_ACTION, {id: 'custom-img'})
        );
        await waitForOpen(element, true);
        expect(element.hasAttribute('hidden')).to.be.false;

        const renderedImgs = element.shadowRoot.querySelectorAll(
          '[part=lightbox] img'
        );
        expect(renderedImgs).to.have.lengthOf(1);
        expect(renderedImgs[0].tagName).to.equal('IMG');
        expect(renderedImgs[0].srcset).to.equal('img4.jpg 1x');

        await whenCalled(element.setAsContainerInternal);
        expect(historyPushSpy).to.be.calledOnce;
        expect(historyPopSpy).to.have.not.been.called;

        const scroller = element.shadowRoot.querySelector('[part=scroller]');
        expect(scroller).not.to.be.null;
        expect(element.setAsContainerInternal).to.be.calledWith(scroller);
        expect(element.removeAsContainerInternal).to.not.be.called;
      });
    });

    describe('captions', () => {
      it('should render with caption via figure', async () => {
        const img = html` <figure>
          <img lightbox src="img.jpg" />
          <figcaption>figure img</figcaption>
        </figure>`;
        doc.body.appendChild(img);
        await installLightboxGallery(env.ampdoc);
        element = doc.getElementById(TAG);
        await element.buildInternal();

        element.enqueAction(invocation(element, DEFAULT_ACTION));
        await waitForOpen(element, true);
        expect(element.hasAttribute('hidden')).to.be.false;

        expect(
          element.shadowRoot.querySelector('.amp-lightbox-gallery-caption')
            .textContent
        ).to.equal('figure img');
      });

      it('should render with caption via aria-describedby', async () => {
        const img = html` <div>
          <img lightbox src="img.jpg" aria-describedby="description" />
          <div id="description">description img</div>
        </div>`;
        doc.body.appendChild(img);
        await installLightboxGallery(env.ampdoc);
        element = doc.getElementById(TAG);
        await element.buildInternal();

        element.enqueAction(invocation(element, DEFAULT_ACTION));
        await waitForOpen(element, true);
        expect(element.hasAttribute('hidden')).to.be.false;

        expect(
          element.shadowRoot.querySelector('.amp-lightbox-gallery-caption')
            .textContent
        ).to.equal('description img');
      });

      it('should render with caption via aria-labelledby', async () => {
        const img = html` <div>
          <img lightbox src="img.jpg" aria-labelledby="label" />
          <div id="label">label img</div>
        </div>`;
        doc.body.appendChild(img);
        await installLightboxGallery(env.ampdoc);
        element = doc.getElementById(TAG);
        await element.buildInternal();

        element.enqueAction(invocation(element, DEFAULT_ACTION));
        await waitForOpen(element, true);
        expect(element.hasAttribute('hidden')).to.be.false;

        expect(
          element.shadowRoot.querySelector('.amp-lightbox-gallery-caption')
            .textContent
        ).to.equal('label img');
      });

      it('should render with caption via alt', async () => {
        doc.body.appendChild(
          html` <img lightbox src="img.jpg" alt="alt img" />`
        );
        await installLightboxGallery(env.ampdoc);
        element = doc.getElementById(TAG);
        await element.buildInternal();

        element.enqueAction(invocation(element, DEFAULT_ACTION));
        await waitForOpen(element, true);
        expect(element.hasAttribute('hidden')).to.be.false;

        expect(
          element.shadowRoot.querySelector('.amp-lightbox-gallery-caption')
            .textContent
        ).to.equal('alt img');
      });

      it('should render with caption via aria-label', async () => {
        doc.body.appendChild(
          html` <img lightbox src="img.jpg" aria-label="aria-label img" />`
        );
        await installLightboxGallery(env.ampdoc);
        element = doc.getElementById(TAG);
        await element.buildInternal();

        element.enqueAction(invocation(element, DEFAULT_ACTION));
        await waitForOpen(element, true);
        expect(element.hasAttribute('hidden')).to.be.false;

        expect(
          element.shadowRoot.querySelector('.amp-lightbox-gallery-caption')
            .textContent
        ).to.equal('aria-label img');
      });

      it('should prefer figure description to all other labels', async () => {
        doc.body.appendChild(
          html` <div>
            <figure>
              <img
                lightbox
                src="img.jpg"
                alt="alt img"
                aria-label="aria-label img"
                aria-labelledby="label"
                aria-describedby="description"
              />
              <figcaption>figure img</figcaption>
            </figure>
            <div id="label">label img</div>
            <div id="description">description img</div>
          </div>`
        );
        await installLightboxGallery(env.ampdoc);
        element = doc.getElementById(TAG);
        await element.buildInternal();

        element.enqueAction(invocation(element, DEFAULT_ACTION));
        await waitForOpen(element, true);
        expect(element.hasAttribute('hidden')).to.be.false;

        expect(
          element.shadowRoot.querySelector('.amp-lightbox-gallery-caption')
            .textContent
        ).to.equal('figure img');
      });

      it('should prefer aria-describedby to aria-labelledby, alt, and aria-label', async () => {
        doc.body.appendChild(
          html` <div>
            <img
              lightbox
              src="img.jpg"
              alt="alt img"
              aria-label="aria-label img"
              aria-labelledby="label"
              aria-describedby="description"
            />
            <div id="label">label img</div>
            <div id="description">description img</div>
          </div>`
        );
        await installLightboxGallery(env.ampdoc);
        element = doc.getElementById(TAG);
        await element.buildInternal();

        element.enqueAction(invocation(element, DEFAULT_ACTION));
        await waitForOpen(element, true);
        expect(element.hasAttribute('hidden')).to.be.false;

        expect(
          element.shadowRoot.querySelector('.amp-lightbox-gallery-caption')
            .textContent
        ).to.equal('description img');
      });

      it('should prefer aria-labelledby to alt and aria-label', async () => {
        doc.body.appendChild(
          html` <div>
            <img
              lightbox
              src="img.jpg"
              alt="alt img"
              aria-label="aria-label img"
              aria-labelledby="label"
            />
            <div id="label">label img</div>
          </div>`
        );
        await installLightboxGallery(env.ampdoc);
        element = doc.getElementById(TAG);
        await element.buildInternal();

        element.enqueAction(invocation(element, DEFAULT_ACTION));
        await waitForOpen(element, true);
        expect(element.hasAttribute('hidden')).to.be.false;

        expect(
          element.shadowRoot.querySelector('.amp-lightbox-gallery-caption')
            .textContent
        ).to.equal('label img');
      });

      it('should prefer alt to aria-label', async () => {
        doc.body.appendChild(
          html` <div>
            <img
              lightbox
              src="img.jpg"
              alt="alt img"
              aria-label="aria-label img"
            />
          </div>`
        );
        await installLightboxGallery(env.ampdoc);
        element = doc.getElementById(TAG);
        await element.buildInternal();

        element.enqueAction(invocation(element, DEFAULT_ACTION));
        await waitForOpen(element, true);
        expect(element.hasAttribute('hidden')).to.be.false;

        expect(
          element.shadowRoot.querySelector('.amp-lightbox-gallery-caption')
            .textContent
        ).to.equal('alt img');
      });

      it('should toggle overflowing caption on click', async () => {
        const img = html` <figure>
          <img lightbox src="img.jpg" />
          <figcaption>
            This is the caption for the first image. Lorem Ipsum is simply dummy
            text of the printing and typesetting industry. Lorem Ipsum has been
            the industry's standard dummy text ever since the 1500s, when an
            unknown printer took a galley of type and scrambled it to make a
            type specimen book. It has survived not only five centuries, but
            also the leap into electronic typesetting, remaining essentially
            unchanged. It was popularised in the 1960s with the release of
            Letraset sheets containing Lorem Ipsum passages, and more recently
            with desktop publishing software like Aldus PageMaker including
            versions of Lorem Ipsum. Lorem Ipsum is simply dummy text of the
            printing and typesetting industry. Lorem Ipsum is simply dummy text
            of the printing and typesetting industry. Lorem Ipsum is simply
            dummy text of the printing and typesetting industry.
          </figcaption>
        </figure>`;
        doc.body.appendChild(img);
        await installLightboxGallery(env.ampdoc);
        element = doc.getElementById(TAG);
        await element.buildInternal();

        element.enqueAction(invocation(element, DEFAULT_ACTION));
        await waitForOpen(element, true);
        expect(element.hasAttribute('hidden')).to.be.false;

        const triggerAnalyticsStub = env.sandbox.stub(
          analytics,
          'triggerAnalyticsEvent'
        );
        element.shadowRoot
          .querySelector('.amp-lightbox-gallery-caption')
          .click();
        expect(triggerAnalyticsStub).to.have.been.calledOnceWithExactly(
          element,
          'descriptionOverflowToggled'
        );
      });
    });
  }
);
