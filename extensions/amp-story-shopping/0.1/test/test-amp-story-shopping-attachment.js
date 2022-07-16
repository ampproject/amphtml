import * as Preact from '#core/dom/jsx';

import {Services} from '#service';

import {getLocalizationService} from 'extensions/amp-story/1.0/amp-story-localization-service';
import {HistoryState} from 'extensions/amp-story/1.0/history';
import * as history from 'extensions/amp-story/1.0/history';

import '../../../amp-story/1.0/amp-story';
import '../../../amp-story/1.0/amp-story-page';
import '../amp-story-shopping';
import '../../../amp-story-page-attachment/0.1/amp-story-page-attachment';
import {registerServiceBuilder} from '../../../../src/service-helpers';
import LocalizedStringsEn from '../../../amp-story/1.0/_locales/en.json' assert {type: 'json'}; // lgtm[js/syntax-error]
import {
  Action,
  StateProperty,
  getStoreService,
} from '../../../amp-story/1.0/amp-story-store-service';
import {
  StoryAnalyticsEvent,
  getAnalyticsService,
} from '../../../amp-story/1.0/story-analytics';
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
    let shoppingEl;
    let shoppingImpl;
    let storeService;
    let attachmentChildEl;
    let attachmentChildImpl;
    let analytics;

    const shoppingData = {
      items: [
        {
          productUrl: 'https://www.google.com',
          productId: 'lamp',
          productTitle: 'Brass Lamp',
          productBrand: 'Lamp Co',
          productPrice: 799.0,
          productPriceCurrency: 'USD',
          productImages: [
            {
              url: 'https://source.unsplash.com/Ry9WBo3qmoc/500x500',
              alt: 'lamp 1',
            },
            {url: 'https://source.unsplash.com/KP7p0-DRGbg', alt: 'lamp 2'},
            {url: 'https://source.unsplash.com/mFnbFaCIu1I', alt: 'lamp 3'},
          ],
          aggregateRating: {
            ratingValue: 4.4,
            reviewCount: 89,
            reviewUrl: 'https://www.google.com',
          },
          productDetails:
            'Lorem ipsum dolor sit amet consectetur adipisicing elit. Facere error deserunt dignissimos in laborum ea molestias veritatis sint laudantium iusto expedita atque provident doloremque, ad voluptatem culpa adipisci.',
        },
        {
          productUrl: 'https://www.google.com',
          productId: 'art',
          productTitle: 'Abstract Art',
          productBrand: 'V. Artsy',
          productPrice: 1200.0,
          productPriceCurrency: 'INR',
          productImages: [
            {
              url: 'https://source.unsplash.com/BdVQU-NDtA8/500x500',
              alt: 'art',
            },
          ],
          aggregateRating: {
            ratingValue: 4.4,
            reviewCount: 89,
            reviewUrl: 'https://www.google.com',
          },
          productDetails:
            'Lorem ipsum dolor sit amet consectetur adipisicing elit. Facere error deserunt dignissimos in laborum ea molestias veritatis sint laudantium iusto expedita atque provident doloremque, ad voluptatem culpa adipisci. Lorem ipsum dolor sit amet consectetur adipisicing elit. Facere error deserunt dignissimos in laborum ea molestias veritatis sint laudantium iusto expedita atque provident doloremque, ad voluptatem culpa adipisci.',
        },
      ],
    };

    beforeEach(async () => {
      win = env.win;
      // Services and stubs.
      registerServiceBuilder(win, 'performance', function () {
        return {
          isPerformanceTrackingOn: () => false,
        };
      });
      storeService = getStoreService(win);
      registerServiceBuilder(win, 'story-store', function () {
        return storeService;
      });
      getLocalizationService(win.document.body).registerLocalizedStringBundles({
        en: LocalizedStringsEn,
      });
      env.sandbox.stub(win.history, 'replaceState');
      analytics = getAnalyticsService(win, win.document.body);
      registerServiceBuilder(win, 'story-analytics', function () {
        return analytics;
      });
      const ownersMock = {
        scheduleLayout: () => {},
        scheduleResume: () => {},
      };
      env.sandbox.stub(Services, 'ownersForDoc').returns(ownersMock);

      // Set up template.
      const story = (
        <amp-story>
          <amp-story-page id="page1">
            <amp-story-shopping-tag data-product-id="lamp"></amp-story-shopping-tag>
            <amp-story-shopping-tag data-product-id="art"></amp-story-shopping-tag>
            <amp-story-shopping-attachment cta-text="Shop Now!">
              <script type="application/json">
                {JSON.stringify(shoppingData)}
              </script>
            </amp-story-shopping-attachment>
          </amp-story-page>
        </amp-story>
      );
      win.document.body.appendChild(story);
      shoppingEl = story.querySelector('amp-story-shopping-attachment');
      shoppingImpl = await shoppingEl.getImpl();

      // shoppingImpl stubs.
      env.sandbox
        .stub(shoppingImpl, 'mutateElement')
        .callsFake((fn) => Promise.resolve(fn()));

      // Attachment child stubs.
      attachmentChildEl = shoppingEl.querySelector('amp-story-page-attachment');
      attachmentChildImpl = await attachmentChildEl.getImpl();
      env.sandbox.stub(attachmentChildImpl.historyService_, 'push').resolves();
      env.sandbox
        .stub(attachmentChildImpl, 'mutateElement')
        .callsFake((fn) => Promise.resolve(fn()));

      // Set page to active.
      storeService.dispatch(Action.CHANGE_PAGE, {id: 'page1', index: 1});
    });

    function dispatchActiveProductData() {
      storeService.dispatch(Action.ADD_SHOPPING_DATA, {
        activeProductData: shoppingData.items[0],
      });
    }

    async function layoutShoppingImplAndAttachmentChildImpl() {
      await shoppingImpl.layoutCallback();
      await attachmentChildImpl.layoutCallback();
    }

    it('should build shopping attachment component', () => {
      expect(() => shoppingImpl.layoutCallback()).to.not.throw();
    });

    it('should build CTA with custom i18n shopping label text', () => {
      expect(attachmentChildEl.getAttribute('cta-text')).to.equal('Shop Now!');
    });

    it('should build PLP on attachment state open if no active product data', async () => {
      await layoutShoppingImplAndAttachmentChildImpl();
      storeService.dispatch(Action.TOGGLE_PAGE_ATTACHMENT_STATE, true);
      expect(
        attachmentChildEl.querySelector('.i-amphtml-amp-story-shopping-plp')
      ).to.exist;
    });

    it('should open attachment when active product data is set', async () => {
      await layoutShoppingImplAndAttachmentChildImpl();
      dispatchActiveProductData();
      // Simulating the getImpl in amp-story-shopping-attachment's
      // onShoppingDataUpdate_ method
      await attachmentChildEl.getImpl();
      const drawerState = storeService.get(StateProperty.PAGE_ATTACHMENT_STATE);
      expect(drawerState).to.be.true;
    });

    it('should build PDP if active product data', async () => {
      await layoutShoppingImplAndAttachmentChildImpl();
      dispatchActiveProductData();
      // Simulating the getImpl in amp-story-shopping-attachment's
      // onShoppingDataUpdate_ method
      await attachmentChildEl.getImpl();
      expect(
        attachmentChildEl.querySelector('.i-amphtml-amp-story-shopping-pdp')
      ).to.exist;
    });

    it('should build PDP on PLP card click', async () => {
      await layoutShoppingImplAndAttachmentChildImpl();
      storeService.dispatch(Action.TOGGLE_PAGE_ATTACHMENT_STATE, true);
      const plpCard = attachmentChildEl.querySelector(
        '.i-amphtml-amp-story-shopping-plp-card'
      );
      plpCard.dispatchEvent(new Event('click'));
      expect(
        attachmentChildEl.querySelector('.i-amphtml-amp-story-shopping-pdp')
      ).to.exist;
    });

    it('should default to PDP on open if only one product for the page', async () => {
      await layoutShoppingImplAndAttachmentChildImpl();
      // Override to simulate data for one product on the page.
      storeService.dispatch(Action.ADD_SHOPPING_DATA, {
        page1: {
          [shoppingData.productId]: shoppingData.items[0],
        },
      });
      storeService.dispatch(Action.TOGGLE_PAGE_ATTACHMENT_STATE, true);
      expect(
        attachmentChildEl.querySelector('.i-amphtml-amp-story-shopping-pdp')
      ).to.exist;
    });

    it('should clear active product data on drawer transition end', async () => {
      await layoutShoppingImplAndAttachmentChildImpl();
      dispatchActiveProductData();
      attachmentChildEl.dispatchEvent(new Event('transitionend'));
      const {activeProductData} = storeService.get(StateProperty.SHOPPING_DATA);
      expect(activeProductData).to.be.null;
    });

    async function setupPDP() {
      await layoutShoppingImplAndAttachmentChildImpl();
      // Override to simulate data for one product on the page.
      storeService.dispatch(Action.ADD_SHOPPING_DATA, {
        page1: {
          [shoppingData.productId]: shoppingData.items[0],
        },
      });
      storeService.dispatch(Action.TOGGLE_PAGE_ATTACHMENT_STATE, true);
    }

    it('should call PDP view analytics event on PLP card click', async () => {
      const trigger = env.sandbox.stub(analytics, 'triggerEvent');

      await layoutShoppingImplAndAttachmentChildImpl();
      storeService.dispatch(Action.TOGGLE_PAGE_ATTACHMENT_STATE, true);
      const plpCard = attachmentChildEl.querySelector(
        '.i-amphtml-amp-story-shopping-plp-card'
      );
      plpCard.dispatchEvent(new Event('click'));

      expect(trigger).to.have.been.calledWith(
        StoryAnalyticsEvent.SHOPPING_PDP_VIEW
      );
    });

    it('should call analytics service on buy now button click', async () => {
      const trigger = env.sandbox.stub(analytics, 'triggerEvent');

      await setupPDP();

      attachmentChildEl
        .querySelector('.i-amphtml-amp-story-shopping-pdp-cta')
        .dispatchEvent(new Event('click'));

      expect(trigger).to.have.been.calledWith(
        StoryAnalyticsEvent.SHOPPING_BUY_NOW_CLICK
      );
    });

    it('should call analytics service on attachment state update', async () => {
      const trigger = env.sandbox.stub(analytics, 'triggerEvent');

      await setupPDP();

      expect(trigger).to.have.been.calledWith(
        StoryAnalyticsEvent.SHOPPING_PDP_VIEW
      );
    });

    it('should call history service on Product Listing Page card click', async () => {
      const historyStub = env.sandbox.stub(history, 'setHistoryState');

      await layoutShoppingImplAndAttachmentChildImpl();
      storeService.dispatch(Action.TOGGLE_PAGE_ATTACHMENT_STATE, true);
      const plpCard = attachmentChildEl.querySelector(
        '.i-amphtml-amp-story-shopping-plp-card'
      );
      plpCard.dispatchEvent(new Event('click'));
      expect(historyStub).to.have.been.called.calledWith(
        win,
        HistoryState.SHOPPING_DATA,
        shoppingData.items[0]
      );
    });
  }
);
