import {expect} from 'chai';

import {createElementWithAttributes} from '#core/dom';
import '../../../amp-story/1.0/amp-story';
import '../../../amp-story/1.0/amp-story-page';
import '../amp-story-shopping';
import '../../../amp-story-page-attachment/0.1/amp-story-page-attachment';

import {registerServiceBuilder} from '../../../../src/service-helpers';
import {
  Action,
  getStoreService,
} from '../../../amp-story/1.0/amp-story-store-service';

describes.realWin(
  'amp-story-shopping-attachment-v0.1',
  {
    amp: {
      runtimeOn: true,
      extensions: [
        'amp-story:1.0',
        'amp-story-shopping:0.1',
        'amp-story-page-attachment:0.1',
      ],
    },
  },
  (env) => {
    let win;
    let pageEl;
    let shoppingEl;
    let shoppingImpl;
    let storeService;

    beforeEach(async () => {
      win = env.win;
      storeService = getStoreService(win);
      registerServiceBuilder(win, 'performance', function () {
        return {
          isPerformanceTrackingOn: () => false,
        };
      });
      registerServiceBuilder(win, 'story-store', function () {
        return storeService;
      });
      env.sandbox.stub(win.history, 'replaceState');

      const story = win.document.createElement('amp-story');
      win.document.body.appendChild(story);
      pageEl = win.document.createElement('amp-story-page');
      pageEl.id = 'page1';
      story.appendChild(pageEl);

      const tagEl = createElementWithAttributes(
        win.document,
        'amp-story-shopping-tag',
        {
          'layout': 'container',
          'data-product-id': 'lamp',
        }
      );
      pageEl.appendChild(tagEl);

      shoppingEl = win.document.createElement('amp-story-shopping-attachment');
      pageEl.appendChild(shoppingEl);

      shoppingImpl = await shoppingEl.getImpl();
    });

    async function dispatchTestShoppingData() {
      const shoppingData = {
        'lamp': {
          'productId': 'lamp',
          'productTitle': 'Brass Lamp',
          'productBrand': 'Lamp Co',
          'productPrice': 799.0,
          'productPriceCurrency': 'USD',
          'productImages': ['https://source.unsplash.com/Ry9WBo3qmoc/500x500'],
        },
      };
      storeService.dispatch(Action.CHANGE_PAGE, {
        id: 'page1',
        index: 1,
      });
      storeService.dispatch(Action.ADD_SHOPPING_DATA, shoppingData);
      storeService.dispatch(Action.TOGGLE_PAGE_ATTACHMENT_STATE, true);
    }

    it('should build shopping attachment component', () => {
      expect(() => shoppingImpl.layoutCallback()).to.not.throw();
    });

    it('should build CTA with i18n shopping label text', async () => {
      await dispatchTestShoppingData();
      const attachmentChildEl = shoppingEl.querySelector(
        'amp-story-page-attachment'
      );
      expect(attachmentChildEl.getAttribute('cta-text')).to.equal('Shop Now');
    });

    it('should open attachment', async () => {
      await dispatchTestShoppingData();
      const attachmentChildEl = shoppingEl.querySelector(
        'amp-story-page-attachment'
      );
      const attachmentChildImpl = await attachmentChildEl.getImpl();
      env.sandbox.stub(attachmentChildImpl, 'mutateElement').callsFake(() => {
        expect(pageEl.querySelector('.i-amphtml-story-draggable-drawer-open'))
          .to.not.be.null;
      });
    });

    it('should build PLP on CTA click', async () => {
      await dispatchTestShoppingData();
      const attachmentChildEl = shoppingEl.querySelector(
        'amp-story-page-attachment'
      );
      const attachmentChildImpl = await attachmentChildEl.getImpl();
      env.sandbox.stub(attachmentChildImpl, 'mutateElement').callsFake(() => {
        expect(pageEl.querySelector('.amp-story-shopping-plp')).to.not.be.null;
      });
    });

    it('should build PLP with data from tag on page', async () => {
      await dispatchTestShoppingData();
      const attachmentChildEl = shoppingEl.querySelector(
        'amp-story-page-attachment'
      );
      const attachmentChildImpl = await attachmentChildEl.getImpl();
      env.sandbox.stub(attachmentChildImpl, 'mutateElement').callsFake(() => {
        expect(
          pageEl.querySelector(
            '.amp-story-shopping-plp-card .amp-story-shopping-plp-card-title'
          ).textContent
        ).to.equal('Spectacular Spectacles');
      });
    });
  }
);
