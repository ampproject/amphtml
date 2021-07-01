/**
 * Copyright 2021 The AMP HTML Authors. All Rights Reserved.
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

import '../amp-lightbox-gallery';
import {ActionInvocation} from '#service/action-impl';
import {ActionTrust, DEFAULT_ACTION} from '#core/constants/action-constants';
import {htmlFor} from '#core/dom/static-template';
import {installLightboxGallery} from '../amp-lightbox-gallery';
import {poll} from '#testing/iframe';
import {toggleExperiment} from '#experiments';
import {waitFor, whenCalled} from '#testing/test-helper';

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

    async function waitForOpen(el, open) {
      const isOpenOrNot = () => el.hasAttribute('open') === open;
      // Extend timeout due to animation delay.
      await poll('element open updated', isOpenOrNot, undefined, 500);
    }

    function invocation(element, method, args = {}) {
      const source = null;
      const caller = null;
      const event = null;
      const trust = ActionTrust.HIGH;
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
      doc = win.document;
      html = htmlFor(doc);
      toggleExperiment(win, 'bento-lightbox-gallery', true, true);
    });

    it('should render', async () => {
      await installLightboxGallery(env.ampdoc);
      const element = doc.getElementById(TAG);
      await element.buildInternal();
      expect(element.hasAttribute('open')).to.be.false;
      expect(element.hasAttribute('hidden')).to.be.true;
    });

    describe('mutability', () => {
      let element, img;

      beforeEach(async () => {
        img = html` <img lightbox src="img.jpg" /> `;
        doc.body.appendChild(img);
        await installLightboxGallery(env.ampdoc);
        element = doc.getElementById(TAG);
        await element.buildInternal();
      });

      it('should open when writing "open" attribute', async () => {
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
      });
    });

    describe('imperative api', () => {
      let element, img;

      beforeEach(async () => {
        img = html` <img lightbox src="img.jpg" /> `;
        doc.body.appendChild(img);
        await installLightboxGallery(env.ampdoc);
        element = doc.getElementById(TAG);
        await element.buildInternal();
      });

      it('should open with default action', async () => {
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
        const scroller = element.shadowRoot.querySelector('[part=scroller]');
        expect(scroller).not.to.be.null;
        expect(element.setAsContainerInternal).to.be.calledWith(scroller);
        expect(element.removeAsContainerInternal).to.not.be.called;
      });

      it('should open with "open" action', async () => {
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
        const scroller = element.shadowRoot.querySelector('[part=scroller]');
        expect(scroller).not.to.be.null;
        expect(element.setAsContainerInternal).to.be.calledWith(scroller);
        expect(element.removeAsContainerInternal).to.not.be.called;
      });
    });

    describe('grouping', () => {
      let element, lightboxElements;

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
        const scroller = element.shadowRoot.querySelector('[part=scroller]');
        expect(scroller).not.to.be.null;
        expect(element.setAsContainerInternal).to.be.calledWith(scroller);
        expect(element.removeAsContainerInternal).to.not.be.called;
      });
    });
  }
);
