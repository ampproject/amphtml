import '../amp-gpt-ad';
import {htmlFor} from '#core/dom/static-template';
import {toggleExperiment} from '#experiments';
import {waitFor} from '#testing/test-helper';

describes.realWin(
  'amp-gpt-ad-v1.0',
  {
    amp: {
      extensions: ['amp-gpt-ad:1.0'],
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
      toggleExperiment(win, 'bento-gpt-ad', true, true);
    });

    // DO NOT SUBMIT: This is example code only.
    it('example test renders', async () => {
      const element = html` <amp-gpt-ad></amp-gpt-ad> `;
      doc.body.appendChild(element);
      await waitFor(() => element.isConnected, 'element connected');
      expect(element.parentNode).to.equal(doc.body);
    });
  }
);
