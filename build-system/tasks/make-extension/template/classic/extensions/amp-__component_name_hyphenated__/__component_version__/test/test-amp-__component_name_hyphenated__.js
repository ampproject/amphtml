import '../amp-__component_name_hyphenated__';
import {htmlFor} from '#core/dom/static-template';

describes.realWin(
  'amp-__component_name_hyphenated__-v__component_version__',
  {
    amp: {
      runtimeOn: true,
      extensions: ['amp-__component_name_hyphenated__:__component_version__'],
    },
  },
  (env) => {
    let win;
    let doc;
    let html;

    beforeEach(() => {
      win = env.win;
      doc = win.document;
      html = htmlFor(doc);
    });
    
    // __do_not_submit__: This is example code only.
    it('should contain "hello world" when built', async () => {
      const element = html`
        <amp-__component_name_hyphenated__
          width="100"
          height="10"
          layout="responsive"
        >
        </amp-__component_name_hyphenated__>
      `;
      doc.body.appendChild(element);
      await element.whenBuilt();
      expect(element.querySelector('div').textContent).to.equal('hello world');
    });
  }
);
