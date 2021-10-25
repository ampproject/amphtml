import {createElementWithAttributes} from '#core/dom';
import '../amp-story-shopping';

describes.realWin(
  'amp-story-shopping-tag-v0.1',
  {
    amp: {
      runtimeOn: true,
      extensions: ['amp-story-shopping:0.1'],
    },
  },
  (env) => {
    let win;
    let element;
    let shoppingTag;

    beforeEach(() => {
      win = env.win;
    });

    async function createAmpStoryShoppingTag() {
      const pageEl = win.document.createElement('amp-story-page');
      pageEl.id = 'page1';
      element = createElementWithAttributes(
        win.document,
        'amp-story-shopping-tag',
        {'layout': 'fixed-height', 'width': 'auto', 'height': '50px'}
      );
      pageEl.appendChild(element);
      win.document.body.appendChild(pageEl);

      shoppingTag = await element.getImpl();
    }

    it('should build shopping tag component', async () => {
      await createAmpStoryShoppingTag();
      expect(shoppingTag.isLayoutSupported('fixed-height')).to.be.true;
      expect(() => shoppingTag.layoutCallback()).to.not.throw();
    });
  }
);
