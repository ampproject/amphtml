import '../amp-__component_name_hyphenated__';
import {htmlFor} from '#core/dom/static-template';
import {toggleExperiment} from '#experiments';
import {waitFor} from '#testing/test-helper';

describes.realWin(
  'amp-__component_name_hyphenated__-v__component_version__',
  {
    amp: {
      extensions: ['amp-__component_name_hyphenated__:__component_version__'],
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
      toggleExperiment(win, 'bento-__component_name_hyphenated__', true, true);
    });

    // __do_not_submit__: This is example code only.
    it('example test renders', async () => {
      const element = html`
        <amp-__component_name_hyphenated__></amp-__component_name_hyphenated__>
      `;
      doc.body.appendChild(element);
      await waitFor(() => element.isConnected, 'element connected');
      expect(element.parentNode).to.equal(doc.body);
    });
  }
);
