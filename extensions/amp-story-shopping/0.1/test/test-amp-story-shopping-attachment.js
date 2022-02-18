import * as Preact from '#core/dom/jsx';
// import {expect} from 'chai';
import {Services} from '#service';
import {StoryAnalyticsService} from '../../../amp-story/1.0/story-analytics';

import {createElementWithAttributes} from '#core/dom';
import '../../../amp-story/1.0/amp-story';
import '../../../amp-story/1.0/amp-story-page';
import '../amp-story-shopping';
import '../../../amp-story-page-attachment/0.1/amp-story-page-attachment';

import {
  measureElementStub,
  measureMutateElementStub,
  mutateElementStub,
} from '#testing/helpers/service';

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
    let attachmentChildEl;
    let attachmentChildImpl;

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
            {url: 'https://source.unsplash.com/py9sH2rThWs', alt: 'lamp 4'},
            {url: 'https://source.unsplash.com/VDPauwJ_sHo', alt: 'lamp 5'},
            {url: 'https://source.unsplash.com/3LTht2nxd34', alt: 'lamp 6'},
          ],
          aggregateRating: {
            ratingValue: '4.4',
            reviewCount: '89',
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
            ratingValue: '4.4',
            reviewCount: '89',
            reviewUrl: 'https://www.google.com',
          },
          productDetails:
            'Lorem ipsum dolor sit amet consectetur adipisicing elit. Facere error deserunt dignissimos in laborum ea molestias veritatis sint laudantium iusto expedita atque provident doloremque, ad voluptatem culpa adipisci. Lorem ipsum dolor sit amet consectetur adipisicing elit. Facere error deserunt dignissimos in laborum ea molestias veritatis sint laudantium iusto expedita atque provident doloremque, ad voluptatem culpa adipisci.',
        },
      ],
    };

    beforeEach(async () => {
      win = env.win;
      storeService = getStoreService(win);
      registerServiceBuilder(win, 'performance', () => ({
        isPerformanceTrackingOn: () => false,
      }));
      registerServiceBuilder(win, 'story-store', () => storeService);
      env.sandbox.stub(win.history, 'replaceState');

      const analytics = new StoryAnalyticsService(win, win.document.body);
      registerServiceBuilder(win, 'story-analytics', () => analytics);

      const ownersMock = {
        scheduleLayout: () => {},
        scheduleResume: () => {},
      };
      env.sandbox.stub(Services, 'ownersForDoc').returns(ownersMock);

      // Set up story.
      const story = <amp-story></amp-story>;
      win.document.body.appendChild(story);
      pageEl = <amp-story-page id="page1"></amp-story-page>;
      story.appendChild(pageEl);

      // Set up shopping tags.
      const tagEl = (
        <amp-story-shopping-tag data-product-id="lamp"></amp-story-shopping-tag>
      );
      pageEl.appendChild(tagEl);
      const tagEl2 = (
        <amp-story-shopping-tag data-product-id="art"></amp-story-shopping-tag>
      );
      pageEl.appendChild(tagEl2);

      // Set up shopping attachment.
      shoppingEl = (
        <amp-story-shopping-attachment>
          <script type="application/json">
            {JSON.stringify(shoppingData)}
          </script>
        </amp-story-shopping-attachment>
      );
      pageEl.appendChild(shoppingEl);

      shoppingImpl = await shoppingEl.getImpl();

      env.sandbox
        .stub(shoppingImpl, 'mutateElement')
        .callsFake((fn) => Promise.resolve(fn()));

      // Attachment child stubs.
      attachmentChildEl = shoppingEl.querySelector('amp-story-page-attachment');
      attachmentChildImpl = await attachmentChildEl.getImpl();
      env.sandbox
        .stub(attachmentChildImpl.historyService_, 'push')
        .callsFake(() => Promise.resolve());

      // Set page to active.
      storeService.dispatch(Action.CHANGE_PAGE, {id: 'page1', index: 1});
    });

    it('should build shopping attachment component', () => {
      expect(() => shoppingImpl.layoutCallback()).to.not.throw();
    });

    it('should build CTA with i18n shopping label text', () => {
      expect(attachmentChildEl.getAttribute('cta-text')).to.equal('Shop Now');
    });

    it('should open attachment', async () => {
      env.sandbox.stub(attachmentChildImpl, 'mutateElement').callsFake(() => {
        expect(pageEl.querySelector('.i-amphtml-story-draggable-drawer-open'))
          .to.not.be.null;
      });
    });

    // it('should build PLP on CTA click', async () => {
    //   // await dispatchTestShoppingData();
    //   attachmentChildImpl.open();

    //   // await attachmentChildImpl.buildCallback();
    //   // await attachmentChildImpl.layoutCallback();
    //   // debugger;

    //   expect(pageEl.querySelector('.amp-story-shopping-plp')).to.not.be.null;
    // });

    // it('should build PLP with data from tag on page', async () => {
    //   // await dispatchTestShoppingData();
    //   const attachmentChildEl = shoppingEl.querySelector(
    //     'amp-story-page-attachment'
    //   );
    //   const attachmentChildImpl = await attachmentChildEl.getImpl();
    //     const cardTitl =
    //   expect(
    //     pageEl.querySelector(
    //       '.amp-story-shopping-plp-card .amp-story-shopping-plp-card-title'
    //     ).textContent
    //   ).to.equal('Spectacular Spectacles');
    // });

    // it('should build PDP with productDetails if productDetails are defined', async () => {
    //   await shoppingImpl.layoutCallback();
    //   const detailsEl = shoppingEl.querySelector(
    //     '.i-amphtml-amp-story-shopping-pdp-details'
    //   );
    //   expect(detailsEl).to.exist;
    // });

    // it('should not build productDetails in pdp if productDetails are defined', async () => {
    //   await shoppingImpl.layoutCallback();
    //   const detailsEl = shoppingEl.querySelector(
    //     '.i-amphtml-amp-story-shopping-pdp-details'
    //   );
    //   expect(detailsEl).to.not.exist;
    // });
  }
);
