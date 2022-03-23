import * as Preact from '#core/dom/jsx';

import {Services} from '#service';

import {user} from '#utils/log';

import * as remoteConfigData from '../../../../examples/amp-story/shopping/remote.json';
import {registerServiceBuilder} from '../../../../src/service-helpers';
import * as url from '../../../../src/url';
import {
  Action,
  getStoreService,
} from '../../../amp-story/1.0/amp-story-store-service';
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
    let win;
    let storeService;
    let pageElement;
    let shoppingAttachment;

    const defaultInlineConfig = {
      'items': [
        {
          'productUrl': 'https://www.google.com',
          'productId': 'lamp',
          'productTitle': 'Brass Lamp',
          'productVendor': 'Lamp Co',
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
          'productVendor': 'V. Artsy',
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
      ],
    };

    const keyedDefaultInlineConfig = {
      'lamp': defaultInlineConfig.items[0],
      'art': defaultInlineConfig.items[1],
    };

    beforeEach(async () => {
      win = env.win;
      storeService = getStoreService(win);
      registerServiceBuilder(win, 'story-store', function () {
        return storeService;
      });
      pageElement = <amp-story-page id="page1"></amp-story-page>;
      win.document.body.appendChild(pageElement);

      shoppingAttachment = win.document.createElement(
        'amp-story-shopping-attachment'
      );
      shoppingAttachment.setAttribute('layout', 'nodisplay');
      const story = win.document.createElement('amp-story');
      win.document.body.appendChild(story);
      story.appendChild(pageElement);
      pageElement.appendChild(shoppingAttachment);
    });

    async function createAmpStoryShoppingConfig(
      src = null,
      config = defaultInlineConfig
    ) {
      shoppingAttachment.setAttribute('src', src);
      shoppingAttachment.appendChild(
        <script type="application/json">{JSON.stringify(config)}</script>
      );
      return getShoppingConfig(shoppingAttachment);
    }

    it('should build shopping config component', async () => {
      expect(() => getShoppingConfig(shoppingAttachment)).to.not.throw();
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
            'productVendor': 'V. Artsy',
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
              json: () => remoteConfigData,
            });
          }
        },
      });
      const result = await createAmpStoryShoppingConfig(remoteUrl);
      expect(result).to.deep.eql(expectedRemoteResult);
    });

    it('does use inline config when remote src is invalid', async () => {
      const invalidURL = 'invalidRemoteURL';
      const result = await createAmpStoryShoppingConfig(invalidURL);
      expect(result).to.deep.eql(keyedDefaultInlineConfig);
    });

    it('test invalid remote config url', async () => {
      const invalidURL = 'invalidRemoteURL';
      const keyedShoppingConfig = await createAmpStoryShoppingConfig(
        invalidURL
      );

      // Length is two, as it defaults to inline config.
      expect(Object.keys(keyedShoppingConfig).length).to.eql(2);
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
      const invalidConfig = JSON.parse(JSON.stringify(defaultInlineConfig));
      const requiredKey = 'productId';
      delete invalidConfig['items'][0][requiredKey];
      const errorString = `Error: Field productId is required.`;
      const spy = env.sandbox.spy(user(), 'warn');
      await createAmpStoryShoppingConfig(null, invalidConfig);
      expect(spy).to.have.been.calledWith(
        'AMP-STORY-SHOPPING-CONFIG',
        errorString
      );
    });

    it('should fail config validation because an expected string JSON value is of a non-string type', async () => {
      const invalidConfig = JSON.parse(JSON.stringify(defaultInlineConfig));
      const invalidValue = 50; // This value is not a string
      invalidConfig['items'][0]['productTitle'] = invalidValue;

      const errorString = `Error: productTitle ${invalidValue} is not a string`;
      const spy = env.sandbox.spy(user(), 'warn');
      await createAmpStoryShoppingConfig(null, invalidConfig);
      expect(spy).to.have.been.calledWith(
        'AMP-STORY-SHOPPING-CONFIG',
        errorString
      );
    });

    it('should fail config validation because an expected string JSON value is not a valid HTML id', async () => {
      const invalidConfig = JSON.parse(JSON.stringify(defaultInlineConfig));
      const invalidValue = '1234city-pop'; // productId starts with a number, so it is an invalid HTML Id
      invalidConfig['items'][0]['productId'] = invalidValue;

      const errorString = `Error: productId ${invalidValue} is not a valid HTML Id`;
      const spy = env.sandbox.spy(user(), 'warn');
      await createAmpStoryShoppingConfig(null, invalidConfig);
      expect(spy).to.have.been.calledWith(
        'AMP-STORY-SHOPPING-CONFIG',
        errorString
      );
    });

    it('should fail config validation because an expected number JSON value is not a valid number', async () => {
      const invalidConfig = JSON.parse(JSON.stringify(defaultInlineConfig));
      const invalidValue = 'two dozen watermelons'; // two dozen watermelons is not an actual price.
      invalidConfig['items'][0]['productPrice'] = invalidValue;

      const errorString = `Error: Value ${invalidValue} for field productPrice is not a number`;
      const spy = env.sandbox.spy(user(), 'warn');
      await createAmpStoryShoppingConfig(null, invalidConfig);
      expect(spy).to.have.been.calledWith(
        'AMP-STORY-SHOPPING-CONFIG',
        errorString
      );
    });

    it('should fail config validation because an expected string JSON value is not a valid currency code symbol', async () => {
      const invalidConfig = JSON.parse(JSON.stringify(defaultInlineConfig));
      const invalidValue = 'ZABAN'; // This is not a valid currency symbol code
      invalidConfig['items'][0]['productPriceCurrency'] = invalidValue;

      const errorString = `Error: productPriceCurrency ${invalidValue} is not a valid currency code`;
      const spy = env.sandbox.spy(user(), 'warn');
      await createAmpStoryShoppingConfig(null, invalidConfig);
      expect(spy).to.have.been.calledWith(
        'AMP-STORY-SHOPPING-CONFIG',
        errorString
      );
    });

    it('should fail config validation because an expected string JSON value is not a valid url', async () => {
      const invalidConfig = JSON.parse(JSON.stringify(defaultInlineConfig));
      const invalidValue = 'http://zapp'; // This is not a valid url
      invalidConfig['items'][0]['productUrl'] = invalidValue;
      const spy = env.sandbox.spy(url, 'assertHttpsUrl');
      const keyedShoppingConfig = await createAmpStoryShoppingConfig(
        null,
        invalidConfig
      );
      expect(spy).to.have.been.calledWith(
        `${invalidValue}`,
        'amp-story-shopping-config productUrl'
      );
      expect(Object.keys(keyedShoppingConfig).length).to.eql(1);
      expect(Object.keys(keyedShoppingConfig)[0]).to.eql('art');
    });
  }
);
