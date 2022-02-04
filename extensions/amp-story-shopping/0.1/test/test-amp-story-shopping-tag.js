import {createElementWithAttributes} from '#core/dom';
import {Layout_Enum} from '#core/dom/layout';

import '../amp-story-shopping';

import {Services} from '#service';
import {AmpDocSingle} from '#service/ampdoc-impl';
import {LocalizationService} from '#service/localization';

import {
  Action,
  StateProperty,
  getStoreService,
} from '../../../amp-story/1.0/amp-story-store-service';
import {AmpStoryShoppingAttachment} from '../amp-story-shopping-attachment';
import '../amp-story-shopping-tag';
import '../../../amp-story-page-attachment/0.1/amp-story-page-attachment';

describes.realWin(
  'amp-story-shopping-tag-v0.1',
  {
    amp: {
      runtimeOn: true,
      extensions: ['amp-story-shopping:0.1', 'amp-story-page-attachment:0.1'],
    },
  },
  (env) => {
    let win;
    let shoppingTagEl;
    let shoppingTag;
    let storeService;
    let localizationService;

    beforeEach(async () => {
      win = env.win;

      // Set up the story.
      const storyEl = win.document.createElement('amp-story');
      const pageEl = win.document.createElement('amp-story-page');
      const ampdoc = new AmpDocSingle(win);
      storyEl.getAmpDoc = () => ampdoc;
      win.document.body.appendChild(storyEl);
      storyEl.appendChild(pageEl);

      storeService = getStoreService(win);
      registerServiceBuilder(win, 'story-store', function () {
        return storeService;
      });

      storeService.dispatch(Action.SET_PAGE_SIZE, {width: 1000, height: 1000});

      localizationService = new LocalizationService(win.document.body);
      env.sandbox
        .stub(Services, 'localizationServiceForOrNull')
        .returns(Promise.resolve(localizationService));

      // Set up shopping tag
      shoppingTagEl = createElementWithAttributes(
        win.document,
        'amp-story-shopping-tag',
        {'layout': 'container'}
      );
      pageEl.appendChild(shoppingTagEl);
      shoppingTag = await shoppingTagEl.getImpl();

      // Set up the shopping attachment.
      const shoppingAttachmentEl = win.document.createElement(
        'amp-story-shopping-attachment'
      );
      shoppingAttachmentEl.getAmpDoc = () => ampdoc;
      pageEl.appendChild(shoppingAttachmentEl);
      const shoppingAttachment = new AmpStoryShoppingAttachment(
        shoppingAttachmentEl
      );
      await shoppingAttachment.buildCallback();
    });

    async function shoppingDataDispatchStoreService() {
      const shoppingData = {
        'sunglasses': {'productTitle': 'Spectacular Spectacles'},
      };
      storeService.dispatch(Action.ADD_SHOPPING_DATA, shoppingData);
    }

    it('should build and layout shopping tag component', () => {
      expect(() => shoppingTag.layoutCallback()).to.not.throw();
    });

    it('should process config data and set text container content if data not null', async () => {
      shoppingTagEl.setAttribute('data-product-id', 'sunglasses');
      await shoppingDataDispatchStoreService();
      env.sandbox.stub(shoppingTag, 'measureMutateElement').callsFake(() => {
        expect(shoppingTagEl.textContent).to.equal('Spectacular Spectacles');
      });
    });

    it('should not process config data and set text container content if id not found', async () => {
      shoppingTagEl.setAttribute('data-product-id', 'hat');
      await shoppingDataDispatchStoreService();
      expect(shoppingTagEl.textContent).to.be.empty;
      expect(shoppingTag.isLayoutSupported(Layout_Enum.CONTAINER)).to.be.true;
    });

    it('should set active product in store service when shopping tag is clicked', async () => {
      const tagData = {
        'productId': 'sunglasses',
        'productTitle': 'Spectacular Spectacles',
        'productPrice': '400',
        'productIcon':
          '/examples/visual-tests/amp-story/img/shopping/nest-audio-icon.png',
      };

      await shoppingTagEl.click();

      env.sandbox.stub(shoppingTag, 'mutateElement').callsFake(() => {
        expect(
          storeService.get(StateProperty.SHOPPING_DATA['activeProductData'])
        ).to.deep.equal(tagData);
      });
    });
  }
);
