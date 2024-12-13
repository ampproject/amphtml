import * as Preact from '#core/dom/jsx';
import {Layout_Enum} from '#core/dom/layout';

import '../amp-story-shopping';
import {Services} from '#service';
import {LocalizationService} from '#service/localization';

import '../../../amp-story-page-attachment/0.1/amp-story-page-attachment';

import * as history from 'extensions/amp-story/1.0/history';
import {HistoryState} from 'extensions/amp-story/1.0/history';

import {registerServiceBuilder} from '../../../../src/service-helpers';
import {
  Action,
  StateProperty,
  getStoreService,
} from '../../../amp-story/1.0/amp-story-store-service';
import {
  StoryAnalyticsEvent,
  StoryAnalyticsService,
} from '../../../amp-story/1.0/story-analytics';
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
    let tagEl;
    let shoppingTag;
    let storeService;
    let localizationService;
    let analytics;

    beforeEach(async () => {
      win = env.win;
      storeService = getStoreService(win);
      registerServiceBuilder(win, 'story-store', function () {
        return storeService;
      });

      analytics = new StoryAnalyticsService(win, win.document.body);
      registerServiceBuilder(win, 'story-analytics', function () {
        return analytics;
      });

      storeService.dispatch(Action.SET_PAGE_SIZE, {width: 1000, height: 1000});

      localizationService = new LocalizationService(win.document.body);
      env.sandbox
        .stub(Services, 'localizationForDoc')
        .returns(localizationService);

      await setUpStoryWithShoppingTag();
    });

    async function setUpStoryWithShoppingTag() {
      tagEl = (
        <amp-story-shopping-tag layout="container"></amp-story-shopping-tag>
      );
      env.win.document.body.appendChild(
        <amp-story-page id="page1">
          {tagEl}
          <amp-story-shopping-attachment></amp-story-shopping-attachment>
        </amp-story-page>
      );
      shoppingTag = await tagEl.getImpl();
    }

    async function setUpShoppingData() {
      const shoppingData = {
        'page1': {'sunglasses': {'productTitle': 'Spectacular Spectacles'}},
      };
      storeService.dispatch(Action.ADD_SHOPPING_DATA, shoppingData);
    }

    async function setupShoppingTagAndData() {
      shoppingTag.element.setAttribute('data-product-id', 'sunglasses');
      await setUpShoppingData();
      expect(() => shoppingTag.buildCallback()).to.not.throw();
      expect(() => shoppingTag.layoutCallback()).to.not.throw();
    }

    it('should build and layout shopping tag component', async () => {
      await setupShoppingTagAndData();
      expect(shoppingTag.shoppingTagEl_).to.be.not.null;
    });

    it('should not build shopping tag if page attachment is missing', async () => {
      env.win.document.querySelector('amp-story-shopping-attachment').remove();
      await setupShoppingTagAndData();
      expect(shoppingTag.shoppingTagEl_).to.be.null;
    });

    it('should process config data and set text container content if data not null', async () => {
      shoppingTag.element.setAttribute('data-product-id', 'sunglasses');
      await setUpShoppingData();
      env.sandbox.stub(shoppingTag, 'measureMutateElement').callsFake(() => {
        expect(shoppingTag.element.textContent).to.equal(
          'Spectacular Spectacles'
        );
      });
    });

    it('should not process config data and set text container content if id not found', async () => {
      shoppingTag.element.setAttribute('data-product-id', 'hat');
      await setUpShoppingData();
      expect(shoppingTag.element.textContent).to.be.empty;
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

      await shoppingTag.element.click();

      env.sandbox.stub(shoppingTag, 'mutateElement').callsFake(() => {
        expect(
          storeService.get(StateProperty.SHOPPING_DATA['activeProductData'])
        ).to.deep.equal(tagData);
      });
    });

    it('should call analytics service on tag click', async () => {
      const trigger = env.sandbox.stub(analytics, 'triggerEvent');
      env.sandbox.stub(history, 'setHistoryState');
      await setupShoppingTagAndData();
      await shoppingTag.shoppingTagEl_.click();
      expect(trigger).to.have.been.calledWith(
        StoryAnalyticsEvent.SHOPPING_TAG_CLICK
      );
    });

    it('should call history service on tag click', async () => {
      const tagData = {
        'productTitle': 'Spectacular Spectacles',
      };

      const historyStub = env.sandbox.stub(history, 'setHistoryState');
      await setupShoppingTagAndData();
      await shoppingTag.shoppingTagEl_.click();
      expect(historyStub).to.have.been.called.calledWith(
        win,
        HistoryState.SHOPPING_DATA,
        tagData
      );
    });
  }
);
