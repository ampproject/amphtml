import '../amp-vimeo';
import {htmlFor} from '#core/dom/static-template';

import {toggleExperiment} from '#experiments';

import {waitFor} from '#testing/helpers/service';

describes.realWin(
  'amp-vimeo-v1.0',
  {
    amp: {
      extensions: ['amp-vimeo:1.0'],
    },
  },
  (env) => {
    let html;

    const waitForRender = async (element) => {
      await element.buildInternal();
      const loadPromise = element.layoutCallback();
      const {shadowRoot} = element;
      await waitFor(() => shadowRoot.querySelector('iframe'), 'iframe mounted');
      await loadPromise;
    };

    beforeEach(async () => {
      html = htmlFor(env.win.document);
      toggleExperiment(env.win, 'bento-vimeo', true, true);
    });

    it('renders', async () => {
      const element = html`
        <amp-vimeo layout="responsive" width="16" height="9"></amp-vimeo>
      `;
      env.win.document.body.appendChild(element);

      await waitForRender(element);

      const iframe = element.shadowRoot.querySelector('iframe');
      expect(iframe).to.not.be.null;
    });

    it('should pass the data-loading attribute to the underlying iframe', async () => {
      const element = html`
        <amp-vimeo
          data-loading="lazy"
          layout="responsive"
          width="16"
          height="9"
        ></amp-vimeo>
      `;
      env.win.document.body.appendChild(element);
      await waitForRender(element);

      const iframe = element.shadowRoot.querySelector('iframe');
      expect(iframe.getAttribute('loading')).to.equal('lazy');
    });

    it('should set data-loading="auto" if no value is specified', async () => {
      const element = html`
        <amp-vimeo layout="responsive" width="16" height="9"></amp-vimeo>
      `;
      env.win.document.body.appendChild(element);
      await waitForRender(element);

      const iframe = element.shadowRoot.querySelector('iframe');
      expect(iframe.getAttribute('loading')).to.equal('auto');
    });
  }
);
