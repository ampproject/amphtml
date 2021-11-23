import {expect} from 'chai';

import {createElementWithAttributes} from '#core/dom';
import {Layout_Enum} from '#core/dom/layout';

import {registerServiceBuilder} from '../../../../src/service-helpers';
import * as LocalizationService from '../../../amp-story/1.0/amp-story-localization-service';
import '../amp-story-shopping';
import {
  Action,
  getStoreService,
} from '../../../amp-story/1.0/amp-story-store-service';

describes.realWin(
  'amp-story-shopping-attachment-v0.1',
  {
    amp: {
      runtimeOn: true,
      extensions: ['amp-story-shopping:0.1'],
    },
  },
  (env) => {
    let win;
    let element;
    let shoppingAttachment;
    let storeService;

    beforeEach(async () => {
      win = env.win;
      storeService = getStoreService(win);
      registerServiceBuilder(win, 'story-store', function () {
        return storeService;
      });

      await createAmpStoryShoppingAttachment();
    });

    async function shoppingDataDispatchStoreService() {
      const shoppingData = {
        'hat': {'product-title': 'Hootenanny Hat'},
      };
      storeService.dispatch(Action.ADD_SHOPPING_DATA, shoppingData);
    }

    async function createAmpStoryShoppingAttachment() {
      const pageEl = win.document.createElement('amp-story-page');
      pageEl.id = 'page1';
      element = createElementWithAttributes(
        win.document,
        'amp-story-shopping-attachment',
        {'layout': 'nodisplay'}
      );
      pageEl.appendChild(element);
      win.document.body.appendChild(pageEl);

      shoppingAttachment = await element.getImpl();
    }

    it('should build shopping attachment component', () => {
      expect(() => shoppingAttachment.layoutCallback()).to.not.throw();
      expect(shoppingAttachment.isLayoutSupported(Layout_Enum.NODISPLAY)).to.be
        .true;
    });

    it('should set attribute data-cta-text when ctaButton is null', async () => {
      const i18nString = 'Shop Hootenanny Hat';
      const localizedString = env.sandbox.stub(LocalizationService, 'localize');
      localizedString.returns(i18nString);
      await shoppingAttachment.buildCallback();
      shoppingDataDispatchStoreService();
      env.sandbox.stub(shoppingAttachment, 'mutateElement').callsFake(() => {
        expect(element.getAttribute('data-cta-text')).to.equal(i18nString);
      });
    });
  }
);
