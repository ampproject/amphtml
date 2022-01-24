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

    it('should contain amp-subscriptions attributes', async () => {
      const element = html`
        <amp-story-subscription layout="container"> </amp-story-subscription>
      `;
      doc.body.appendChild(element);
      await element.whenBuilt();
      expect(
        element.querySelector('div').hasAttribute('subscriptions-dialog')
      ).to.equal(true);
      expect(
        element.querySelector('div').getAttribute('subscriptions-display')
      ).to.equal('NOT granted');
    });
  }
);
