import '../amp-beopinion';
import {htmlFor} from '#core/dom/static-template';
import {toggleExperiment} from '#experiments';
import {waitFor} from '#testing/helpers/service';

describes.realWin(
  'amp-beopinion-v1.0',
  {
    amp: {
      extensions: ['amp-beopinion:1.0'],
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
      toggleExperiment(win, 'bento-beopinion', true, true);
    });

    // DO NOT SUBMIT: This is example code only.
    it('example test renders', async () => {
      const element = html` <amp-beopinion></amp-beopinion> `;
      doc.body.appendChild(element);
      await waitFor(() => element.isConnected, 'element connected');
      expect(element.parentNode).to.equal(doc.body);
    });
  }
);
