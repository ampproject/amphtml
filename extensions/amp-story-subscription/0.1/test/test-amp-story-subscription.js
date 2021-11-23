import '../amp-story-subscription';
import {htmlFor} from '#core/dom/static-template';

describes.realWin(
  'amp-story-subscription-v0.1',
  {
    amp: {
      runtimeOn: true,
      extensions: ['amp-story-subscription:0.1'],
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
        <amp-story-subscription width="100" height="10" layout="responsive">
        </amp-story-subscription>
      `;
      doc.body.appendChild(element);
      await element.whenBuilt();
      expect(element.querySelector('div').textContent).to.equal('hello world');
    });
  }
);
