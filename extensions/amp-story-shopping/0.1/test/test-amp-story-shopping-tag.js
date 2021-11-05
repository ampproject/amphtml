import {createElementWithAttributes} from '#core/dom';
import {Layout} from '#core/dom/layout';
import '../amp-story-shopping';

import {getStoreService} from '../../../amp-story/1.0/amp-story-store-service';

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

      getStoreService(win);

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
      expect(shoppingTag.isLayoutSupported(Layout.CONTAINER)).to.be.true;
    });

    it('should process config data and set text container content if data not null', () => {
      shoppingTag.element.setAttribute('data-tag-id', 'sunglasses');
      const shoppingState = {
        'sunglasses': {'product-title': 'Spectacular Spectacles'},
      };
      shoppingTag.updateShoppingTag_(shoppingState);
      expect(shoppingTag.element.textContent).to.equal(
        'Spectacular Spectacles'
      );
    });

    it('should not process config data and set text container content if id not found is null', () => {
      shoppingTag.element.setAttribute('data-tag-id', 'hat');
      const shoppingState = {
        'sunglasses': {'product-title': 'Spectacular Spectacles'},
      };
      shoppingTag.updateShoppingTag_(shoppingState);
      expect(shoppingTag.element.textContent).to.not.equal(
        'Spectacular Spectacles'
      );
    });
  }
);
