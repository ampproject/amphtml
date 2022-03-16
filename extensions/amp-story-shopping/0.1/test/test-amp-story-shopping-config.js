import * as Preact from '#core/dom/jsx';

import {Services} from '#service';

import * as remoteConfig from '../../../../examples/amp-story/shopping/remote.json';
import {Action} from '../../../amp-story/1.0/amp-story-store-service';
import {
  getShoppingConfig,
  storeShoppingConfig,
} from '../amp-story-shopping-config';

describes.realWin(
  'amp-story-shopping-config-v0.1',
  {
    amp: {
      runtimeOn: true,
      extensions: ['amp-story-shopping:0.1'],
    },
  },
  (env) => {
    let pageElement;

    const defaultInlineConfig = {
      'items': [
        {
          'productUrl': 'https://www.google.com',
          'productId': 'lamp',
          'productTitle': 'Brass Lamp',
          'productBrand': 'Lamp Co',
          'productPrice': 799.0,
          'productPriceCurrency': 'USD',
          'productImages': [
            {
              'url': 'https://source.unsplash.com/Ry9WBo3qmoc/500x500',
              'alt': 'lamp 1',
            },
            {'url': 'https://source.unsplash.com/KP7p0-DRGbg', 'alt': 'lamp 2'},
            {'url': 'https://source.unsplash.com/mFnbFaCIu1I', 'alt': 'lamp 3'},
            {'url': 'https://source.unsplash.com/py9sH2rThWs', 'alt': 'lamp 4'},
            {'url': 'https://source.unsplash.com/VDPauwJ_sHo', 'alt': 'lamp 5'},
            {'url': 'https://source.unsplash.com/3LTht2nxd34', 'alt': 'lamp 6'},
          ],
          'aggregateRating': {
            'ratingValue': 4.4,
            'reviewCount': 89,
            'reviewUrl': 'https://www.google.com',
          },
        },
        {
          'productUrl': 'https://www.google.com',
          'productId': 'art',
          'productTitle': 'Abstract Art',
          'productBrand': 'V. Artsy',
          'productPrice': 1200.0,
          'productPriceCurrency': 'JPY',
          'productImages': [
            {
              'url': 'https://source.unsplash.com/BdVQU-NDtA8/500x500',
              'alt': 'art',
            },
          ],
          'aggregateRating': {
            'ratingValue': 4.4,
            'reviewCount': 89,
            'reviewUrl': 'https://www.google.com',
          },
          'productDetails':
            'Lorem ipsum dolor sit amet consectetur adipisicing elit. Facere error deserunt dignissimos in laborum ea molestias veritatis sint laudantium iusto expedita atque provident doloremque, ad voluptatem culpa adipisci.',
        },
        {
          'productUrl': 'https://www.google.com',
          'productId': 'chair',
          'productTitle': 'Yellow chair',
          'productBrand': 'Chair Co.',
          'productPrice': 1000.0,
          'productPriceCurrency': 'BRL',
          'productTagText': 'The perfectly imperfect yellow chair',
          'productImages': [
            {
              'url': 'https://source.unsplash.com/DgQGKKLaVhY/500x500',
              'alt': 'chair',
            },
          ],
          'aggregateRating': {
            'ratingValue': 4.4,
            'reviewCount': 89,
            'reviewUrl': 'https://www.google.com',
          },
        },
        {
          'productUrl': 'https://www.google.com',
          'productId': 'flowers',
          'productTitle': 'Flowers',
          'productBrand': 'Very Long Flower Company Name',
          'productPrice': 10.0,
          'productPriceCurrency': 'USD',
          'productIcon':
            '/examples/visual-tests/amp-story/img/shopping/icon.png',
          'productImages': [
            {
              'url': 'https://source.unsplash.com/SavQfLRm4Do/500x500',
              'alt': 'flowers',
            },
          ],
          'aggregateRating': {
            'ratingValue': 4.4,
            'reviewCount': 89,
            'reviewUrl': 'https://www.google.com',
          },
        },
      ],
    };

    const keyedDefaultInlineConfig = {
      'lamp': defaultInlineConfig.items[0],
      'art': defaultInlineConfig.items[1],
      'chair': defaultInlineConfig.items[2],
      'flowers': defaultInlineConfig.items[3],
    };

    beforeEach(async () => {
      pageElement = env.win.document.createElement('amp-story-page');
      pageElement.id = 'page1';
    });

    async function createAmpStoryShoppingConfig(
      src = undefined,
      config = defaultInlineConfig
    ) {
      const shoppingAttachment = env.win.document.createElement(
        'amp-story-shopping-attachment'
      );
      shoppingAttachment.setAttribute('layout', 'nodisplay');
      shoppingAttachment.setAttribute('src', src);
      shoppingAttachment.appendChild(
        <script type="application/json">{JSON.stringify(config)}</script>
      );
      const story = env.win.document.createElement('amp-story');
      env.win.document.body.appendChild(story);
      story.appendChild(pageElement);

      pageElement.appendChild(shoppingAttachment);
      return getShoppingConfig(shoppingAttachment);
    }

    it('throws on no config', async () => {
      expectAsyncConsoleError(async () => {
        expect(() => {
          const shoppingAttachment = <amp-story-shopping-attachment />;
          pageElement.appendChild(shoppingAttachment);
          return getShoppingConfig(shoppingAttachment);
        }).to.throw(/<script> tag with type=\"application\/json\"​​​/);
      });
    });

    it('does use inline config', async () => {
      const result = await createAmpStoryShoppingConfig();
      expect(result).to.deep.eql(keyedDefaultInlineConfig);
    });

    it('does use remote config when src attribute is provided', async () => {
      const remoteUrl = 'https://foo.example';
      const expectedRemoteResult =
        // matches remote.json
        {
          'art': {
            'productUrl': 'https://www.google.com',
            'productId': 'art',
            'productTitle': 'Abstract Art',
            'productBrand': 'V. Artsy',
            'productPrice': 1200.0,
            'productPriceCurrency': 'JPY',
            'productImages': [
              {
                'url': 'https://source.unsplash.com/BdVQU-NDtA8/500x500',
                'alt': 'art',
              },
            ],
            'aggregateRating': {
              'ratingValue': 4.4,
              'reviewCount': 89,
              'reviewUrl': 'https://www.google.com',
            },
            'productDetails':
              'Lorem ipsum dolor sit amet consectetur adipisicing elit. Facere error deserunt dignissimos in laborum ea molestias veritatis sint laudantium iusto expedita atque provident doloremque, ad voluptatem culpa adipisci.',
          },
        };
      env.sandbox.stub(Services, 'xhrFor').returns({
        fetchJson(url) {
          if (url === remoteUrl) {
            return Promise.resolve({
              ok: true,
              json: () => remoteConfig,
            });
          }
        },
      });
      const result = await createAmpStoryShoppingConfig(remoteUrl);
      expect(result).to.deep.eql(expectedRemoteResult);
    });

    it('does use inline config when remote src is invalid', async () => {
      env.sandbox.stub(Services, 'xhrFor').returns({
        fetchJson() {
          throw new Error();
        },
      });
      const result = await createAmpStoryShoppingConfig('invalidRemoteUrl');
      expect(result).to.deep.eql(keyedDefaultInlineConfig);
    });

    describe('storeShoppingConfig', () => {
      let storeService;

      beforeEach(async () => {
        storeService = {dispatch: env.sandbox.spy()};
        env.sandbox.stub(Services, 'storyStoreService').returns(storeService);
      });

      it('dispatches ADD_SHOPPING_DATA', async () => {
        const dummyConfig = {foo: {bar: true}};

        storeShoppingConfig(pageElement, dummyConfig);

        const pageIdToConfig = {[pageElement.id]: dummyConfig};
        expect(
          storeService.dispatch.withArgs(
            Action.ADD_SHOPPING_DATA,
            pageIdToConfig
          )
        ).to.have.been.calledOnce;
      });
    });
  }
);
