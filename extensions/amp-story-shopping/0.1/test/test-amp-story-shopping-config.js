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
          'productId': 'lamp',
          'productTitle': 'Brass Lamp',
          'productBrand': 'Lamp Co',
          'productPrice': 799.0,
          'productPriceCurrency': 'USD',
          'productImages': ['https://source.unsplash.com/Ry9WBo3qmoc/500x500'],
        },
        {
          'productId': 'art',
          'productTitle': 'Abstract Art',
          'productBrand': 'V. Artsy',
          'productPrice': 1200.0,
          'productPriceCurrency': 'INR',
          'productImages': ['https://source.unsplash.com/BdVQU-NDtA8/500x500'],
        },
        {
          'productId': 'chair',
          'productTitle': 'Yellow chair',
          'productBrand': 'Chair Co.',
          'productPrice': 1000.0,
          'productPriceCurrency': 'BRL',
          'productTagText': 'The perfectly imperfect yellow chair',
          'productImages': ['https://source.unsplash.com/DgQGKKLaVhY/500x500'],
        },
        {
          'productId': 'flowers',
          'productTitle': 'Flowers',
          'productBrand': 'Very Long Flower Company Name',
          'productPrice': 10.0,
          'productPriceCurrency': 'USD',
          'productIcon':
            '/examples/visual-tests/amp-story/img/shopping/icon.png',
          'productImages': ['https://source.unsplash.com/SavQfLRm4Do/500x500'],
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
      pageElement = <amp-story-page id="page1"></amp-story-page>;
      env.win.document.body.appendChild(pageElement);
    });

    async function createAmpStoryShoppingConfig(
      src = null,
      config = defaultInlineConfig
    ) {
      const shoppingAttachment = (
        <amp-story-shopping-attachment layout="nodisplay" src={src}>
          <script type="application/json">{JSON.stringify(config)}</script>
        </amp-story-shopping-attachment>
      );
      pageElement.appendChild(shoppingAttachment);

      return getShoppingConfig(shoppingAttachment);
    }

    it('throws on no config', async () => {
      expectAsyncConsoleError(async () => {
        expect(() => {
          pageElement.appendChild(<amp-story-shopping-attachment />);
          return getShoppingConfig(pageElement);
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
              '/examples/visual-tests/amp-story/img/shopping/shopping-product.jpg',
            ],
            'aggregateRating': {
              'ratingValue': '4.4',
              'reviewCount': '89',
              'reviewUrl': 'https://www.google.com',
            },
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
        env.sandbox
          .stub(Services, 'storyStoreServiceForOrNull')
          .resolves(storeService);
      });

      it('dispatches ADD_SHOPPING_DATA', async () => {
        const config = {foo: {bar: true}};

        await storeShoppingConfig(pageElement, config);
        const pageIdToConfig = {[pageElement.id]: config};
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
