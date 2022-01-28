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
        '{"city-pop":{"productTagId":"city-pop","productTitle":"Plastic Love","productPrice": 19, "productPriceCurrency": "JPY", "productImages": ["/examples/visual-tests/amp-story/img/shopping/nest-mini-icon.png","/examples/visual-tests/amp-story/img/shopping/nest-mini-icon.png"], "reviewsPage": "https://store.google.com/jp/?hl=ja", "brandLabel": "Google", "productDetails": "Vinyl for the hit J-Pop song Plastic Love."}}'
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
            'productTagId': 'city-pop',
            'productTitle':
              'Mariya Takeuchi (竹内 まりや, Takeuchi Mariya, born 20 March 1955) is a Japanese singer and songwriter. Regarded as an influential figure in the city pop genre, she is one of the best-selling music artists in Japan, having sold over 16 million records, and has received several accolades. Takeuchi was born in Taisha, Hikawa district, now the city of Izumo, Shimane, and attended Keio University. She made her singing debut after signing with the RCA record label in 1978, with whom she released her debut album Beginning, which peaked at No. 17 on Oricon Charts. She then released four albums between 1979 and 1981, all of which obtained commercial success, including the 1980 album Love Songs, which became her first work to peak at No. 1 on Oricon Charts. Takeuchi then announced she would go on a temporary hiatus in 1981, terminating her contract with RCA records. Three years later, Takeuchi and her husband Tatsuro Yamashita signed with Moon Records, and she made her comeback with her sixth studio album Variety in 1984, which was released internationally and shot her to mainstream success, and peaked at No. 1 on Oricon Charts. The track "Plastic Love", which was released in 1985 as a single, became a surprise hit outside of Japan in 2017 after a YouTube upload of the song went viral. The song has since attained a cult following and is seen as the staple in a revival of interest in city pop in the late 2010s.',
            /* Very, Very, Very long string value - will not pass string length test */
            'productPrice': 19,
            'productPriceCurrency': 'JPY',
            'productImages': [
              '/examples/visual-tests/amp-story/img/shopping/nest-mini-icon.png',
              '/examples/visual-tests/amp-story/img/shopping/nest-mini-icon.png',
            ],
            'reviewsPage': 'https://store.google.com/jp/?hl=ja',
            'brandLabel': 'Google',
            'productDetails': 'Vinyl for the hit J-Pop song Plastic Love.',
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
            'productTagId': 'city-pop',
            'productTitle': 'Plastic Love',
            'productPrice': 'two dozen watermelons',
            /* Not an actual price */
            'productPriceCurrency': 'JPY',
            'productImages': [
              '/examples/visual-tests/amp-story/img/shopping/nest-mini-icon.png',
              '/examples/visual-tests/amp-story/img/shopping/nest-mini-icon.png',
            ],
            'reviewsPage': 'https://store.google.com/jp/?hl=ja',
            'brandLabel': 'Google',
            'productDetails': 'Vinyl for the hit J-Pop song Plastic Love.',
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
            'productTagId': 'city-pop',
            'productTitle': 'Plastic Love',
            'productPrice': 19,
            'productPriceCurrency': 'JPY',
            'productImages': ['http://pizazz', 'http://zapp'],
            'reviewsPage': 'http://zeppelinzero.com',
            'brandLabel': 'Google',
            'productDetails': 'Vinyl for the hit J-Pop song Plastic Love.',
          },
        ],
      };

      await createAmpStoryShoppingConfig(invalidConfig);
    });
  }
);
