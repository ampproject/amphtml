import {createElementWithAttributes} from '#core/dom';
import {expect} from 'chai';

import '../../../amp-story/1.0/amp-story';
import '../amp-story-shopping';
import '../../../amp-story-page-attachment/0.1/amp-story-page-attachment';

import {registerServiceBuilder} from '../../../../src/service-helpers';
import {
  Action,
  StateProperty,
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
      const tagEl = createElementWithAttributes(
        win.document,
        'amp-story-shopping-tag',
        {
          'layout': 'container',
          'data-tag-id': 'sunglasses',
        }
      );
      pageEl.appendChild(tagEl);
      pageEl.id = 'page1';
      shoppingEl = win.document.createElement('amp-story-shopping-attachment');
      pageEl.appendChild(shoppingEl);
      story.appendChild(pageEl);
      shoppingImpl = await shoppingEl.getImpl();
    });

    async function shoppingDataDispatchStoreService() {
      const shoppingData = {
        'sunglasses': {
          'product-tag-id': 'sunglasses',
          'product-title': 'Spectacular Spectacles',
          'product-brand': 'Nest',
          'product-price': '400.00',
          'product-price-currency': 'INR',
          'product-icon':
            '/examples/visual-tests/amp-story/img/shopping/nest-audio-icon.png',
          'product-images': [
            '/examples/visual-tests/amp-story/img/shopping/product-2.png',
          ],
        },
      };
      storeService.dispatch(Action.ADD_SHOPPING_DATA, shoppingData);
    }

    it('should build shopping attachment component', () => {
      expect(() => shoppingImpl.layoutCallback()).to.not.throw();
    });

    it('should open attachment', async () => {
      await shoppingDataDispatchStoreService();
      const attachmentChildEl = shoppingEl.querySelector(
        'amp-story-page-attachment'
      );
      const attachmentChildImpl = await attachmentChildEl.getImpl();
      env.sandbox.stub(attachmentChildImpl, 'open');
      await shoppingImpl.open(true);
      expect(attachmentChildImpl.open).to.be.calledOnce;
    });

    it('should build PLP on CTA click', async () => {
      await shoppingDataDispatchStoreService();
      const attachmentChildEl = shoppingEl.querySelector(
        'amp-story-page-attachment'
      );
      const attachmentChildImpl = await attachmentChildEl.getImpl();
      env.sandbox.stub(attachmentChildImpl, 'open');
      await shoppingImpl.open(true);
      expect(pageEl.querySelector('.amp-story-shopping-plp')).to.not.be.null;
    });
  }
);
