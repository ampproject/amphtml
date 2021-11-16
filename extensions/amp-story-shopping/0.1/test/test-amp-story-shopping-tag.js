import {createElementWithAttributes} from '#core/dom';
import {Layout_Enum} from '#core/dom/layout';
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

    beforeEach(async () => {
      win = env.win;
      await createAmpStoryShoppingTag();
    });

    async function createAmpStoryShoppingTag() {
      const pageEl = win.document.createElement('amp-story-page');
      pageEl.id = 'page1';
      element = createElementWithAttributes(
        win.document,
        'amp-story-shopping-tag',
        {'layout': 'container'}
      );
      pageEl.appendChild(element);
      win.document.body.appendChild(pageEl);

      shoppingTag = await element.getImpl();
    }

    it('should build shopping tag component', () => {
      expect(() => shoppingTag.layoutCallback()).to.not.throw();
      expect(shoppingTag.isLayoutSupported(Layout_Enum.CONTAINER)).to.be.true;
    });
  }
);
