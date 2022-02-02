import {createElementWithAttributes} from '#core/dom';
import {Layout_Enum} from '#core/dom/layout';
import '../amp-story-shopping';

import {user} from '#utils/log';

import * as configData from '../../../../examples/amp-story/shopping/remote.json';
import {registerServiceBuilder} from '../../../../src/service-helpers';
import {
  StateProperty,
  getStoreService,
} from '../../../amp-story/1.0/amp-story-store-service';

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

    it('throws on no config', async () => {
      await createAmpStoryShoppingConfig();
      expectAsyncConsoleError(async () => {
        expect(async () => {
          await shoppingConfig.buildCallback();
        }).to.throw(
          /The amp-story-auto-ads:config should be inside a <script> tag with type=\"application\/json\"​​​/
        );
      });
    });

    it('does use remote config when src attribute is provided', async () => {
      await createAmpStoryShoppingConfig();
      const exampleURL = 'foo.example';
      element.setAttribute('src', exampleURL);

      const expectedRemoteResult = JSON.parse(
        '{"art":{"productId": "art","productTitle": "Abstract Art","productBrand": "V. Artsy","productPrice": 1200.0,"productPriceCurrency": "JPY","productImages": ["https://source.unsplash.com/BdVQU-NDtA8/500x500"]}}'
      );

      expect(storeService.get(StateProperty.SHOPPING_DATA)).to.deep.eql(
        expectedRemoteResult
      );
    });

    it('does use inline config when remote src is invalid', async () => {
      await createAmpStoryShoppingConfig();
      const exampleURL = 'invalidRemoteURL';
      element.setAttribute('src', exampleURL);

      shoppingConfig.buildCallback().then(async () => {
        expect(await shoppingConfig.getInlineConfig_).to.be.called();
      });
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
      });
      expect(shoppingConfig.isLayoutSupported(Layout_Enum.NODISPLAY)).to.be
        .true;
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
