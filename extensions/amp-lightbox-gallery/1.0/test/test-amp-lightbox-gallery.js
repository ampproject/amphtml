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
import {expect} from 'chai';
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

        const renderedImgs = element.shadowRoot.querySelectorAll('img');
        expect(renderedImgs).to.have.lengthOf(1);
        expect(renderedImgs[0].tagName).to.equal('IMG');
        expect(renderedImgs[0].srcset).to.equal('img.jpg 1x');

        await whenCalled(element.setAsContainerInternal);
        const scroller = element.shadowRoot.querySelector('[part=scroller]');
        expect(scroller).to.exist;
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

        const renderedImgs = element.shadowRoot.querySelectorAll('img');
        expect(renderedImgs).to.have.lengthOf(1);
        expect(renderedImgs[0].tagName).to.equal('IMG');
        expect(renderedImgs[0].srcset).to.equal('img.jpg 1x');

        await whenCalled(element.setAsContainerInternal);
        const scroller = element.shadowRoot.querySelector('[part=scroller]');
        expect(scroller).to.exist;
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

      function invocation(method, args = {}) {
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

      it('should open with default action', async () => {
        env.sandbox.stub(element, 'setAsContainerInternal');
        env.sandbox.stub(element, 'removeAsContainerInternal');

        expect(element.hasAttribute('open')).to.be.false;
        expect(element.hasAttribute('hidden')).to.be.true;

        element.enqueAction(invocation(DEFAULT_ACTION));
        await waitForOpen(element, true);
        expect(element.hasAttribute('hidden')).to.be.false;

        const renderedImgs = element.shadowRoot.querySelectorAll('img');
        expect(renderedImgs).to.have.lengthOf(1);
        expect(renderedImgs[0].tagName).to.equal('IMG');
        expect(renderedImgs[0].srcset).to.equal('img.jpg 1x');

        await whenCalled(element.setAsContainerInternal);
        const scroller = element.shadowRoot.querySelector('[part=scroller]');
        expect(scroller).to.exist;
        expect(element.setAsContainerInternal).to.be.calledWith(scroller);
        expect(element.removeAsContainerInternal).to.not.be.called;
      });

      it('should open with "open" action', async () => {
        env.sandbox.stub(element, 'setAsContainerInternal');
        env.sandbox.stub(element, 'removeAsContainerInternal');

        expect(element.hasAttribute('open')).to.be.false;
        expect(element.hasAttribute('hidden')).to.be.true;

        element.enqueAction(invocation('open'));
        await waitForOpen(element, true);
        expect(element.hasAttribute('hidden')).to.be.false;

        const renderedImgs = element.shadowRoot.querySelectorAll('img');
        expect(renderedImgs).to.have.lengthOf(1);
        expect(renderedImgs[0].tagName).to.equal('IMG');
        expect(renderedImgs[0].srcset).to.equal('img.jpg 1x');

        await whenCalled(element.setAsContainerInternal);
        const scroller = element.shadowRoot.querySelector('[part=scroller]');
        expect(scroller).to.exist;
        expect(element.setAsContainerInternal).to.be.calledWith(scroller);
        expect(element.removeAsContainerInternal).to.not.be.called;
      });
    });
  }
);
