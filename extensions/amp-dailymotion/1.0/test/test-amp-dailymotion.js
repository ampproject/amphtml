import '../amp-dailymotion';
import {expect} from 'chai';

import {htmlFor} from '#core/dom/static-template';

import {toggleExperiment} from '#experiments';

import {waitFor} from '#testing/helpers/service';

describes.realWin(
  'amp-dailymotion-v1.0',
  {
    amp: {
      extensions: ['amp-dailymotion:1.0'],
    },
  },
  (env) => {
    let win;
    let doc;
    let html;

    const waitForRender = async (element) => {
      await element.buildInternal();
      const loadPromise = element.layoutCallback();
      const shadow = element.shadowRoot;
      await waitFor(() => shadow.querySelector('iframe'), 'iframe mounted');
      await loadPromise;
    };

    beforeEach(async () => {
      win = env.win;
      doc = win.document;
      html = htmlFor(doc);
      toggleExperiment(win, 'bento-dailymotion', true, true);
    });

    it('renders', async () => {
      const element = html`
        <amp-dailymotion
          data-videoid="x3rdtfy"
          width="500"
          height="281"
        ></amp-dailymotion>
      `;
      env.win.document.body.appendChild(element);

      await waitForRender(element);

      const iframe = element.shadowRoot.querySelector('iframe');
      expect(iframe).to.not.be.null;
      expect(iframe.src).to.equal(
        'https://www.dailymotion.com/embed/video/x3rdtfy?api=1&html=1&app=amp'
      );
    });

    it('renders with optional attrs correctly', async () => {
      const element = html`
        <amp-dailymotion
          data-videoid="x3rdtfy"
          width="500"
          height="281"
          data-mute="true"
          data-endscreen-enable="false"
          data-sharing-enable="false"
          data-ui-highlight="444444"
          data-ui-logo="false"
          data-info="false"
        ></amp-dailymotion>
      `;
      env.win.document.body.appendChild(element);

      await waitForRender(element);

      const iframe = element.shadowRoot.querySelector('iframe');
      expect(iframe).to.not.be.null;
      // VideoId attr
      expect(iframe.src).to.contain('x3rdtfy');
      // Mute Attr
      expect(iframe.src).to.contain('mute=1');
      // Enscreen Enable attr
      expect(iframe.src).to.contain('endscreen-enable=false');
      // Sharing Enable attr
      expect(iframe.src).to.contain('sharing-enable=false');
      // UI Highlight attr
      expect(iframe.src).to.contain('ui-highlight=444444');
      // UI Logo attr
      expect(iframe.src).to.contain('ui-logo=false');
      // info attr
      expect(iframe.src).to.contain('info=false');
    });
  }
);
