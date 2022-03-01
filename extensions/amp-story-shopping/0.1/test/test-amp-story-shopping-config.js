import * as Preact from '#core/dom/jsx';

import {Services} from '#service';

import {user} from '#utils/log';

import * as configData from '../../../../examples/amp-story/shopping/remote.json';
import {registerServiceBuilder} from '../../../../src/service-helpers';
import * as url from '../../../../src/url';
import {
  Action,
  getStoreService,
} from '../../../amp-story/1.0/amp-story-store-service';
import {
  getShoppingConfig,
  productValidationConfig,
  storeShoppingConfig,
  validateRequired,
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
    let win;
    let storeService;
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
          'productPriceCurrency': 'INR',
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
      win = env.win;
      storeService = getStoreService(win);
      registerServiceBuilder(win, 'story-store', function () {
        return storeService;
      });
      pageElement = <amp-story-page id="page1"></amp-story-page>;
      env.win.document.body.appendChild(pageElement);
    });

    it('should build shopping config component', async () => {
      await createAmpStoryShoppingConfig();
      expect(() => getShoppingConfig(pageElement)).to.not.throw();
    });

    async function createAmpStoryShoppingConfig(
      src = null,
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
      await createAmpStoryShoppingConfig();
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
          },
        };
      env.sandbox.stub(Services, 'xhrFor').returns({
        fetchJson(url) {
          if (url === remoteUrl) {
            return Promise.resolve({
              ok: true,
              json: () => configData,
            });
          }
        },
      });
      const result = await createAmpStoryShoppingConfig(remoteUrl);
      expect(result).to.deep.eql(expectedRemoteResult);
    });

    it('does use inline config when remote src is invalid', async () => {
      await createAmpStoryShoppingConfig();
      const exampleURL = 'invalidRemoteURL';
      pageElement.setAttribute('src', exampleURL);
      const result = await createAmpStoryShoppingConfig('invalidRemoteUrl');
      expect(result).to.deep.eql(keyedDefaultInlineConfig);
    });

    it('test invalid remote config url', async () => {
      await createAmpStoryShoppingConfig();
      const exampleURL = 'invalidRemoteURL';
      pageElement.setAttribute('src', exampleURL);
      expectAsyncConsoleError(async () => {
        expect(async () => {
          await getShoppingConfig(pageElement);
        }).to.throw(
          /'amp-story-auto-ads:config error determining if remote config is valid json: bad url or bad json'​​​/
        );
      });
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

    it('test validate required fields for config', async () => {
      const invalidConfig = {
        'items': [{}],
      };

      await createAmpStoryShoppingConfig(null, invalidConfig);

      const spy = env.sandbox.spy(user(), 'warn');

      for (const [key, value] of Object.entries(productValidationConfig)) {
        if (value.includes(validateRequired)) {
          const errorString = `Error: Field ${key} is required.`;
          await createAmpStoryShoppingConfig(null, invalidConfig);
          expect(spy).to.have.been.calledWith(
            'AMP-STORY-SHOPPING-CONFIG',
            errorString
          );
        }
      }
    });

    it('test config is a string', async () => {
      const invalidConfig = {
        'items': [
          {
            'productUrl': 'https://www.google.com',
            'productId': 'city-pop',
            'productBrand': 'Vinyl',
            /* Not a string, will fail string type test */
            'productPrice': 19,
            'productPriceCurrency': 'JPY',
            'productImages': [
              {
                url: '/examples/visual-tests/amp-story/img/shopping/nest-mini-icon.png',
                alt: 'nest-mini-icon',
              },
              {
                url: '/examples/visual-tests/amp-story/img/shopping/nest-mini-icon.png',
                alt: 'nest-mini-icon',
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
      const errorString = `Error: productTitle ${invalidConfig['items'][0]['productTitle']} is not a string.`;
      const spy = env.sandbox.spy(user(), 'warn');
      await createAmpStoryShoppingConfig(null, invalidConfig);
      expect(spy).to.have.been.calledWith(
        'AMP-STORY-SHOPPING-CONFIG',
        errorString
      );
    });

    it('test config not a number', async () => {
      const invalidConfig = {
        'items': [
          {
            'productUrl': 'https://www.google.com',
            'productId': 'city-pop',
            'productBrand': 'Vinyl',
            'productTitle': 'Adventure',
            'productPrice': 'two dozen watermelons',
            /* Not an actual price */
            'productPriceCurrency': 'JPY',
            'productImages': [
              {
                url: '/examples/visual-tests/amp-story/img/shopping/nest-mini-icon.png',
                alt: 'nest-mini-icon',
              },
              {
                url: '/examples/visual-tests/amp-story/img/shopping/nest-mini-icon.png',
                alt: 'nest-mini-icon',
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

      const errorString = `Error: Value ${invalidConfig['items'][0]['productPrice']} for field productPrice is not a number`;
      const spy = env.sandbox.spy(user(), 'warn');
      await createAmpStoryShoppingConfig(null, invalidConfig);
      expect(spy).to.have.been.calledWith(
        'AMP-STORY-SHOPPING-CONFIG',
        errorString
      );
    });

    it('test config invalid url array', async () => {
      expectAsyncConsoleError(errorString, 1);
      const invalidConfig = {
        'items': [
          {
            'productUrl': 'http://zapp',
            'productId': 'city-pop',
            'productTitle': 'Adventure',
            'productBrand': 'Vinyl',
            'productPrice': 19,
            'productPriceCurrency': 'JPY',
            'productImages': [{url: 'https://zapp', alt: 'zapp'}],
            'aggregateRating': {
              'ratingValue': 4.4,
              'reviewCount': 89,
              'reviewUrl': 'https://www.google.com',
            },
          },
        ],
      };
      const errorString = `Error: amp-story-shopping-config productImages source must start with "https://" or "//" or be relative and served from either https or from localhost. Invalid value: ${invalidConfig['items'][0]['productImages'][0]}`;
      const spy = env.sandbox.spy(url, 'assertHttpsUrl');
      await createAmpStoryShoppingConfig(null, invalidConfig);
      expect(spy).to.have.been.calledWith(
        `${invalidConfig['items'][0]['productUrl']}`,
        'amp-story-shopping-config productUrl'
      );
    });
  }
);
