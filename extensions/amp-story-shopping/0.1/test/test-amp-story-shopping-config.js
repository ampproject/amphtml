import * as Preact from '#core/dom/jsx';

import {user} from '#utils/log';

import * as configData from '../../../../examples/amp-story/shopping/remote.json';
import {registerServiceBuilder} from '../../../../src/service-helpers';
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
    let win;
    let element;
    let shoppingConfig;
    let storeService;
    let userWarnStub;

    beforeEach(async () => {
      win = env.win;
      storeService = getStoreService(win);
      userWarnStub = env.sandbox.stub(user(), 'warn');
      registerServiceBuilder(win, 'story-store', function () {
        return storeService;
      });
    });

    async function createAmpStoryShoppingConfig(optConfigData = configData) {
      const pageEl = win.document.createElement('amp-story-page');
      pageEl.id = 'page1';
      element = createElementWithAttributes(
        win.document,
        'amp-story-shopping-config',
        {'layout': 'nodisplay'}
      );

      element.innerHTML = `
        <script type="application/json">
          ${JSON.stringify(optConfigData)}
        </script>
      `;

      pageEl.appendChild(element);
      win.document.body.appendChild(pageEl);

      shoppingConfig = await element.getImpl();
    }

    it('should build shopping config component', async () => {
      await createAmpStoryShoppingConfig();
      expect(() => shoppingConfig.layoutCallback()).to.not.throw();
    });

    let pageElement;

    const defaultInlineConfig = {
      items: [
        {
          'productId': 'city-pop',
          'productTitle': 'Plastic Love',
          'productPrice': 19,
          'productPriceCurrency': 'JPY',
        },
      ],
    };

    const keyedDefaultInlineConfig = {
      'city-pop': defaultInlineConfig.items[0],
    };

    beforeEach(async () => {
      pageElement = <amp-story-page id="page1"></amp-story-page>;
      env.win.document.body.appendChild(pageElement);
    });

    async function createAmpStoryShoppingConfig(
      src = null,
      config = defaultInlineConfig
    ) {
      pageElement.appendChild(
        <amp-story-shopping-config layout="nodisplay" src={src}>
          <script type="application/json">{JSON.stringify(config)}</script>
        </amp-story-shopping-config>
      );
      return getShoppingConfig(pageElement);
    }

    it('throws on no config', async () => {
      await createAmpStoryShoppingConfig();
      expectAsyncConsoleError(async () => {
        expect(() => {
          pageElement.appendChild(<amp-story-shopping-config />);
          return getShoppingConfig(pageElement);
        }).to.throw(/<script> tag with type=\"application\/json\"​​​/);
      });
    });

    it('does use remote config when src attribute is provided', async () => {
      await createAmpStoryShoppingConfig();
      const exampleURL = 'foo.example';
      element.setAttribute('src', exampleURL);

      const expectedRemoteResult = JSON.parse(
        '{"art":{"productId": "art","productTitle": "Abstract Art","productBrand": "V. Artsy","productPrice": 1200.0,"productPriceCurrency": "JPY","productImages": ["https://source.unsplash.com/BdVQU-NDtA8/500x500"]}}'
      );
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
            'productId': 'art',
            'productTitle': 'Abstract Art',
            'productBrand': 'V. Artsy',
            'productPrice': 1200.0,
            'productPriceCurrency': 'JPY',
            'productImages': [
              'https://source.unsplash.com/BdVQU-NDtA8/500x500',
            ],
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
      await createAmpStoryShoppingConfig();
      const exampleURL = 'invalidRemoteURL';
      element.setAttribute('src', exampleURL);

      shoppingConfig.buildCallback().then(async () => {
        expect(await shoppingConfig.getInlineConfig_).to.be.called();
      env.sandbox.stub(Services, 'xhrFor').returns({
        fetchJson() {
          throw new Error();
        },
      });
      const result = await createAmpStoryShoppingConfig('invalidRemoteUrl');
      expect(result).to.deep.eql(keyedDefaultInlineConfig);
    });

    it('test invalid remote config url', async () => {
      await createAmpStoryShoppingConfig();
      const exampleURL = 'invalidRemoteURL';
      element.setAttribute('src', exampleURL);
      expectAsyncConsoleError(async () => {
        expect(async () => {
          await shoppingConfig.buildCallback();
        }).to.throw(
          /'amp-story-auto-ads:config error determining if remote config is valid json: bad url or bad json'​​​/
        );
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

        expect(storeService.dispatch.withArgs(Action.ADD_SHOPPING_DATA, config))
          .to.have.been.calledOnce;
      });
    });

    it('test config string too long', async () => {
      expectAsyncConsoleError(userWarnStub, 1);
      const invalidConfig = {
        'items': [
          {
            'productId': 'city-pop',
            'productTitle':
              'Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, Very, long string',
            /* Very, Very, Very long string value - will not pass string length test */
            'productPrice': 19,
            'productPriceCurrency': 'JPY',
            'productImages': [
              '/examples/visual-tests/amp-story/img/shopping/nest-mini-icon.png',
              '/examples/visual-tests/amp-story/img/shopping/nest-mini-icon.png',
            ],
          },
        ],
      };

      await createAmpStoryShoppingConfig(invalidConfig);
    });

    it('test config not a number', async () => {
      expectAsyncConsoleError(userWarnStub, 1);
      const invalidConfig = {
        'items': [
          {
            'productId': 'city-pop',
            'productTitle': 'Plastic Love',
            'productPrice': 'two dozen watermelons',
            /* Not an actual price */
            'productPriceCurrency': 'JPY',
            'productImages': [
              '/examples/visual-tests/amp-story/img/shopping/nest-mini-icon.png',
              '/examples/visual-tests/amp-story/img/shopping/nest-mini-icon.png',
            ],
          },
        ],
      };

      await createAmpStoryShoppingConfig(invalidConfig);
    });

    it('test config invalid url array', async () => {
      expectAsyncConsoleError(userWarnStub, 1);
      const invalidConfig = {
        'items': [
          {
            'productId': 'city-pop',
            'productTitle': 'Plastic Love',
            'productPrice': 19,
            'productPriceCurrency': 'JPY',
            'productImages': ['http://pizazz', 'http://zapp'],
          },
        ],
      };

      await createAmpStoryShoppingConfig(invalidConfig);
    });
  }
);
