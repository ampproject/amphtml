import {createElementWithAttributes} from '#core/dom';
import '../amp-story-shopping';

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
    let element;
    let shopping;

    beforeEach(() => {
      win = env.win;
    });

    async function createAmpStoryShopping() {
      const pageEl = win.document.createElement('amp-story-page');
      pageEl.id = 'page1';
      element = createElementWithAttributes(
        win.document,
        'amp-story-shopping',
        {'layout': 'container'}
      );
      pageEl.appendChild(element);
      win.document.body.appendChild(pageEl);

      shopping = await element.getImpl();
    }

    it('should build shopping component', async () => {
      await createAmpStoryShopping();
      expect(() => shopping.layoutCallback()).to.not.throw();
    });
  }
);
