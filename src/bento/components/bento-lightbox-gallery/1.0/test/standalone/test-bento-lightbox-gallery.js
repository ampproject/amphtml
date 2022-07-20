import {expect} from 'chai';

import {CSS} from '#build/bento-lightbox-gallery-1.0.css';

import {BaseElement as BentoBaseCarousel} from '#bento/components/bento-base-carousel/1.0/base-element';
import {BaseElement as BentoLightboxGallery} from '#bento/components/bento-lightbox-gallery/1.0/base-element';
import {adoptStyles} from '#bento/util/unit-helpers';

import {createElementWithAttributes} from '#core/dom';
import {htmlFor} from '#core/dom/static-template';

import {defineBentoElement} from '#preact/bento-ce';

import {waitFor} from '#testing/helpers/service';
import {poll} from '#testing/iframe';

import {BaseElement as BentoStreamGallery} from '../../../../../../../extensions/amp-stream-gallery/1.0/base-element';

const TAG = 'bento-lightbox-gallery';

describes.realWin(
  'bento-lightbox-gallery-v1.0',
  {
    amp: false,
  },
  (env) => {
    let win;
    let doc;
    let html;
    let element;

    beforeEach(() => {
      win = env.win;
      doc = win.document;
      html = htmlFor(doc);

      defineBentoElement('bento-lightbox-gallery', BentoLightboxGallery, win);
      defineBentoElement('bento-base-carousel', BentoBaseCarousel, win);
      defineBentoElement('bento-stream-gallery', BentoStreamGallery, win);
      adoptStyles(win, CSS);
    });

    /**
     *
     * @param {typeof globalThis} win
     */
    async function installLightboxGallery(win) {
      element = win.document.createElement('bento-lightbox-gallery');
      win.document.body.append(element);
      await element.getApi();
    }

    async function waitForOpen(el, open) {
      const isOpenOrNot = () => el.hasAttribute('open') === open;
      // Extend timeout due to animation delay.
      await poll('element open updated', isOpenOrNot, undefined, 500);
    }

    // function invocation(element, method, args = {}) {
    //   const source = null;
    //   const caller = null;
    //   const event = null;
    //   const trust = ActionTrust_Enum.HIGH;
    //   return new ActionInvocation(
    //     element,
    //     method,
    //     args,
    //     source,
    //     caller,
    //     event,
    //     trust
    //   );
    // }

    afterEach(() => {
      element?.remove();
    });

    it('should render', async () => {
      await installLightboxGallery(win);
      // console.log(win.document.body);
      // element = doc.querySelector('bento-lightbox-gallery');
      // await element.getApi();
      expect(element.hasAttribute('open')).to.be.false;
      // todo(kvchari): debug why this doesn't work
      // expect(element.hasAttribute('hidden')).to.be.true;
    });

    describe('uniqueness', () => {
      let duplicate;

      afterEach(() => {
        duplicate?.parentNode?.removeChild(duplicate);
      });

      it('should remove duplicate element', async () => {
        await installLightboxGallery(win);
        duplicate = createElementWithAttributes(doc, TAG);

        // first attempt is removed
        doc.body.appendChild(duplicate);
        await waitFor(
          () => !duplicate.parentNode,
          'Waiting for duplicate detached.'
        );
        expect(element.parentNode).not.to.be.null;

        // second attempt is removed
        doc.body.appendChild(duplicate);
        await waitFor(
          () => !duplicate.parentNode,
          'Waiting for duplicate detached.'
        );
        expect(element.parentNode).not.to.be.null;
      });

      it('should allow duplicate if first instance is removed', async () => {
        await installLightboxGallery(win);
        element.parentNode.removeChild(element);

        duplicate = createElementWithAttributes(doc, TAG);
        doc.body.appendChild(duplicate);
        await duplicate.getApi();

        expect(duplicate.parentNode).not.to.be.null;
        expect(element.parentNode).to.be.null;
      });
    });

    describe('mutability', () => {
      let img;

      beforeEach(async () => {
        img = html` <img lightbox src="img.jpg" /> `;
        doc.body.appendChild(img);
        await installLightboxGallery(win);
      });

      it('should open when writing "open" attribute', async () => {
        element.setAttribute('hidden', '');
        expect(element.hasAttribute('open')).to.be.false;

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

        const scroller = element.shadowRoot.querySelector('[part=scroller]');
        expect(scroller).not.to.be.null;
      });

      it('should close when removing "open" attribute', async () => {
        element.setAttribute('hidden', '');
        expect(element.hasAttribute('open')).to.be.false;

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
        const scroller = element.shadowRoot.querySelector('[part=scroller]');
        expect(scroller).not.to.be.null;

        element.removeAttribute('open');
        // Extend timeout due to animation delay.
        await poll(
          'lightbox is hidden',
          () => element.hasAttribute('hidden'),
          undefined,
          500
        );
        expect(element.shadowRoot.querySelector('[part=lightbox]')).to.be.null;
      });
    });

    describe('imperative api', () => {
      let img;

      beforeEach(async () => {
        img = html` <img lightbox src="img.jpg" /> `;
        doc.body.appendChild(img);
        await installLightboxGallery(win);
      });

      it('should open with "open" method', async () => {
        expect(element.hasAttribute('open')).to.be.false;
        // todo(kvchari): debug
        // expect(element.hasAttribute('hidden')).to.be.true;

        const api = await element.getApi();
        api.open();
        await waitForOpen(element, true);
        expect(element.hasAttribute('hidden')).to.be.false;

        const renderedImgs = element.shadowRoot.querySelectorAll(
          '[part="lightbox"]  img'
        );
        expect(renderedImgs).to.have.lengthOf(1);
        expect(renderedImgs[0].tagName).to.equal('IMG');
        expect(renderedImgs[0].srcset).to.equal('img.jpg 1x');

        const scroller = element.shadowRoot.querySelector('[part=scroller]');
        expect(scroller).not.to.be.null;
      });

      it('should open with "open" method and toggle to grid view', async () => {
        expect(element.hasAttribute('open')).to.be.false;
        // todo(kvchari): debug
        // expect(element.hasAttribute('hidden')).to.be.true;

        const api = await element.getApi();
        api.open();
        await waitForOpen(element, true);
        expect(element.hasAttribute('hidden')).to.be.false;

        element.shadowRoot
          .querySelector('[aria-label="Switch to grid view"]')
          .dispatchEvent(new Event('click'));

        // wait a micotask to let grid show
        await Promise.resolve();
        expect(
          element.shadowRoot.querySelectorAll('[class*="grid"]')
        ).to.have.lengthOf(1);
      });
    });

    describe('grouping', () => {
      let lightboxElements;

      beforeEach(async () => {
        lightboxElements = html`<div>
          <img id="my-img" lightbox src="img.jpg" />
          <bento-base-carousel lightbox>
            <img src="img1.jpg" />
            <img id="my-slide" src="img2.jpg" />
            <img src="img3.jpg" />
          </bento-base-carousel>
          <img id="custom-img" lightbox="custom-group" src="img4.jpg" />
          <bento-stream-gallery lightbox>
            <img src="img5.jpg" />
            <img id="my-gallery-slide" src="img6.jpg" />
            <img src="img7.jpg" />
          </bento-stream-gallery>
        </div>`;
        doc.body.appendChild(lightboxElements);
        await installLightboxGallery(win);
      });

      it('should open to default group', async () => {
        expect(element.hasAttribute('open')).to.be.false;
        // todo(kvchari): debug
        // expect(element.hasAttribute('hidden')).to.be.true;

        element.parentNode.querySelector('#my-img').click();

        await waitForOpen(element, true);
        expect(element.hasAttribute('hidden')).to.be.false;

        const renderedImgs = element.shadowRoot.querySelectorAll(
          '[part=lightbox] img'
        );
        expect(renderedImgs).to.have.lengthOf(1);
        expect(renderedImgs[0].tagName).to.equal('IMG');
        expect(renderedImgs[0].srcset).to.equal('img.jpg 1x');

        const scroller = element.shadowRoot.querySelector('[part=scroller]');
        expect(scroller).not.to.be.null;
      });

      it('should open to default carousel group (bento-base-carousel)', async () => {
        expect(element.hasAttribute('open')).to.be.false;
        // todo(kvchari): debug
        // expect(element.hasAttribute('hidden')).to.be.true;

        element.parentNode.querySelector('#my-slide').click();
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
        const scroller = element.shadowRoot.querySelector('[part=scroller]');
        expect(scroller).not.to.be.null;
      });

      it('should open to default carousel group (bento-stream-gallery)', async () => {
        expect(element.hasAttribute('open')).to.be.false;
        // todo(kvchari): debug
        // expect(element.hasAttribute('hidden')).to.be.true;

        element.parentNode.querySelector('#my-gallery-slide').click();
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
        const scroller = element.shadowRoot.querySelector('[part=scroller]');
        expect(scroller).not.to.be.null;
      });

      it('should open to given named group', async () => {
        expect(element.hasAttribute('open')).to.be.false;
        // todo(kvchari): debug
        // expect(element.hasAttribute('hidden')).to.be.true;

        element.parentNode.querySelector('#custom-img').click();
        await waitForOpen(element, true);
        expect(element.hasAttribute('hidden')).to.be.false;

        const renderedImgs = element.shadowRoot.querySelectorAll(
          '[part=lightbox] img'
        );
        expect(renderedImgs).to.have.lengthOf(1);
        expect(renderedImgs[0].tagName).to.equal('IMG');
        expect(renderedImgs[0].srcset).to.equal('img4.jpg 1x');
        const scroller = element.shadowRoot.querySelector('[part=scroller]');
        expect(scroller).not.to.be.null;
      });
    });

    describe('captions', () => {
      it('should render with caption via figure', async () => {
        const img = html` <figure>
          <img lightbox src="img.jpg" />
          <figcaption>figure img</figcaption>
        </figure>`;
        doc.body.appendChild(img);
        await installLightboxGallery(win);

        const api = await element.getApi();
        api.open();
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
        await installLightboxGallery(win);

        const api = await element.getApi();
        api.open();
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
        await installLightboxGallery(win);

        const api = await element.getApi();
        api.open();
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
        await installLightboxGallery(win);

        const api = await element.getApi();
        api.open();
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
        await installLightboxGallery(win);

        const api = await element.getApi();
        api.open();
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
        await installLightboxGallery(win);

        const api = await element.getApi();
        api.open();
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
        await installLightboxGallery(win);

        const api = await element.getApi();
        api.open();
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
        await installLightboxGallery(win);

        const api = await element.getApi();
        api.open();
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
        await installLightboxGallery(win);

        const api = await element.getApi();
        api.open();
        await waitForOpen(element, true);
        expect(element.hasAttribute('hidden')).to.be.false;

        expect(
          element.shadowRoot.querySelector('.amp-lightbox-gallery-caption')
            .textContent
        ).to.equal('alt img');
      });

      // todo(kvchari): debug - do we correctly support overflowing captions on standalone?
      it.skip('should toggle overflowing caption on click', async () => {
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
        await installLightboxGallery(win);

        const api = await element.getApi();
        api.open();
        await waitForOpen(element, true);
        expect(element.hasAttribute('hidden')).to.be.false;

        element.shadowRoot
          .querySelector('.amp-lightbox-gallery-caption')
          .click();
      });
    });
  }
);
