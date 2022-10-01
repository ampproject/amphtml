import '../amp-video-iframe';
import {dispatchCustomEvent} from '#core/dom';
import {htmlFor} from '#core/dom/static-template';

import {toggleExperiment} from '#experiments';

import {waitFor} from '#testing/helpers/service';

describes.realWin(
  'amp-video-iframe-v1.0',
  {
    amp: {
      extensions: ['amp-video-iframe:1.0'],
      canonicalUrl: 'https://canonicalexample.com/',
    },
  },
  (env) => {
    let html;
    let element;

    const waitForRender = async () => {
      await element.buildInternal();
      const loadPromise = element.layoutCallback();
      const shadow = element.shadowRoot;
      await waitFor(() => shadow.querySelector('iframe'), 'iframe mounted');
      const iframe = shadow.querySelector('iframe');
      dispatchCustomEvent(iframe, 'canplay', null, {bubbles: false});
      await loadPromise;
    };

    beforeEach(() => {
      html = htmlFor(env.win.document);
      toggleExperiment(env.win, 'bento-video-iframe', true, true);
    });

    it('renders iframe', async () => {
      element = html`
        <amp-video-iframe
          layout="responsive"
          width="16"
          height="9"
        ></amp-video-iframe>
      `;

      element.setAttribute(
        'src',
        `http://localhost:${location.port}/test/fixtures/served/blank.html#`
      );

      env.win.document.body.appendChild(element);

      await waitForRender();

      const iframe = element.shadowRoot.querySelector('iframe');
      expect(iframe).to.not.be.null;
    });

    it('should pass the loading attribute to the underlying iframe', async () => {
      element = html`
        <amp-video-iframe
          layout="responsive"
          width="16"
          height="9"
          data-loading="lazy"
        ></amp-video-iframe>
      `;

      env.win.document.body.appendChild(element);

      await waitForRender();

      const iframe = element.shadowRoot.querySelector('iframe');
      expect(iframe.getAttribute('loading')).to.equal('lazy');
    });

    it('should set data-loading="auto" if no value is specified', async () => {
      element = html`
        <amp-video-iframe
          layout="responsive"
          width="16"
          height="9"
        ></amp-video-iframe>
      `;

      env.win.document.body.appendChild(element);

      await waitForRender();

      const iframe = element.shadowRoot.querySelector('iframe');
      expect(iframe.getAttribute('loading')).to.equal('auto');
    });
  }
);
