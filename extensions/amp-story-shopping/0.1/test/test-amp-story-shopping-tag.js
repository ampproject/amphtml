import {createElementWithAttributes} from '#core/dom';
import '../amp-story-shopping';

describes.realWin(
  'amp-story-shopping-tagv0.1',
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

    async function createAmpStoryShoppingTag() {
      const pageEl = win.document.createElement('amp-story-page');
      pageEl.id = 'page1';
      element = createElementWithAttributes(
        win.document,
        'amp-story-shopping-tag',
        {'layout': 'fixed-height', 'width': '100px', 'height': '100px'}
      );
      pageEl.appendChild(element);
      win.document.body.appendChild(pageEl);

      shopping = await element.getImpl();
    }

    it('should build shopping tag component', async () => {
      await createAmpStoryShoppingTag();
      expect(() => shopping.layoutCallback()).to.not.throw();
    });
  }
);
