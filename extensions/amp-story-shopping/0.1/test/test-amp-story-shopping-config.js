import {createElementWithAttributes} from '#core/dom';
import {Layout} from '#core/dom/layout';
import '../amp-story-shopping';

describes.realWin(
  'amp-story-shopping-config-v0.1',
  {
    amp: {
      runtimeOn: true,
      extensions: ['amp-story-shopping:0.1'],
    },
  },
  (env) => {
    let win;
    let element;
    let shoppingConfig;

    beforeEach(async () => {
      win = env.win;
      await createAmpStoryShoppingConfig();
    });

    async function createAmpStoryShoppingConfig() {
      const pageEl = win.document.createElement('amp-story-page');
      pageEl.id = 'page1';
      element = createElementWithAttributes(
        win.document,
        'amp-story-shopping-config',
        {'layout': 'nodisplay'}
      );
      pageEl.appendChild(element);
      win.document.body.appendChild(pageEl);

      shoppingConfig = await element.getImpl();
    }

    it('should build shopping config component', () => {
      expect(() => shoppingConfig.layoutCallback()).to.not.throw();
      expect(shoppingConfig.isLayoutSupported(Layout.NODISPLAY)).to.be.true;
    });
  }
);
