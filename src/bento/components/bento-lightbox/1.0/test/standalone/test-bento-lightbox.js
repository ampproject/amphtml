import {CSS} from '#build/bento-lightbox-1.0.css';

import {BaseElement as BentoLightbox} from '#bento/components/bento-lightbox/1.0/base-element';
import {adoptStyles} from '#bento/util/unit-helpers';

import {htmlFor} from '#core/dom/static-template';

import {defineBentoElement} from '#preact/bento-ce';

describes.realWin(
  'bento-lightbox:1.0',
  {
    amp: false,
  },
  (env) => {
    let win;
    let html;
    let element;

    function getContent() {
      expect(element.shadowRoot).not.to.be.undefined;
      // Get slot if it exists, or <c> element otherwise.
      return element.shadowRoot.querySelector('c slot, c:empty');
    }

    beforeEach(async () => {
      win = env.win;
      html = htmlFor(win.document);
      defineBentoElement('bento-lightbox', BentoLightbox, win);
      adoptStyles(win, CSS);

      element = html`
        <bento-lightbox>
          <p>Hello World</p>
        </bento-lightbox>
      `;
      win.document.body.appendChild(element);
      await element.getApi();
    });

    afterEach(() => {
      win.document.body.removeChild(element);
    });

    it('should render open', async () => {
      expect(element.hasAttribute('open')).to.be.false;

      const content = getContent();
      expect(content.tagName).to.equal('C');
      expect(content.children).to.have.lengthOf(0);

      const api = await element.getApi();

      api.open();
      expect(element.hasAttribute('open')).to.be.true;
      expect(element.hasAttribute('hidden')).to.be.false;

      // todo(kvchari): debug why this isn't working
      // api.close();
      // expect(element.hasAttribute('open')).to.be.false;
      // expect(element.hasAttribute('hidden')).to.be.true;
    });
  }
);
