import '../amp-access-fewcents';
import {htmlFor} from '#core/dom/static-template';

describes.realWin(
  'amp-access-fewcents-v0.1',
  {
    amp: {
      runtimeOn: true,
      extensions: ['amp-access-fewcents:0.1'],
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

    it('should contain "hello world" when built', async () => {
      const element = html`
        <amp-access-fewcents width="100" height="10" layout="responsive">
        </amp-access-fewcents>
      `;
      doc.body.appendChild(element);
      await element.whenBuilt();
      expect(element.querySelector('div').textContent).to.equal('hello world');
    });
  }
);
