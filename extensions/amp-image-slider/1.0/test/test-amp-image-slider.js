import '../amp-image-slider';
import {htmlFor} from '#core/dom/static-template';

import {toggleExperiment} from '#experiments';

import {waitFor} from '#testing/test-helper';

describes.realWin(
  'amp-image-slider-v1.0',
  {
    amp: {
      extensions: ['amp-image-slider:1.0'],
    },
  },
  (env) => {
    let win;
    let doc;
    let html;

    beforeEach(async () => {
      win = env.win;
      doc = win.document;
      html = htmlFor(doc);
      toggleExperiment(win, 'bento-image-slider', true, true);
    });

    // DO NOT SUBMIT: This is example code only.
    it('example test renders', async () => {
      const element = html` <amp-image-slider></amp-image-slider> `;
      doc.body.appendChild(element);
      await waitFor(() => element.isConnected, 'element connected');
      expect(element.parentNode).to.equal(doc.body);
    });
  }
);
