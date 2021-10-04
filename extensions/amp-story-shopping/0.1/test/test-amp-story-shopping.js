import '../amp-story-shopping';
import {htmlFor} from '#core/dom/static-template';

describes.realWin(
  'amp-story-shopping-v0.1',
  {
    amp: {
      runtimeOn: true,
      extensions: ['amp-story-shopping:0.1'],
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

    // DO NOT SUBMIT: This is example code only.
    it('should contain "hello world" when built', async () => {
      const element = html`
        <amp-story-shopping width="100" height="10" layout="responsive">
        </amp-story-shopping>
      `;
      doc.body.appendChild(element);
      await element.whenBuilt();
      expect(element.querySelector('div').textContent).to.equal('hello world');
    });
  }
);
