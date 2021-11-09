import {createElementWithAttributes} from '#core/dom';
import {Layout} from '#core/dom/layout';

import '../amp-story-shopping';

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

    beforeEach(async () => {
      win = env.win;
      storeService = getStoreService(win);
      registerServiceBuilder(win, 'story-store', function () {
        return storeService;
      });

      await createAmpStoryShoppingConfig();
    });

    async function createAmpStoryShoppingConfig() {
      const pageEl = win.document.createElement('amp-story-page');
      pageEl.id = 'page1';
      element = createElementWithAttributes(
        win.document,
        'amp-story-shopping-config',
        {'layout': 'nodisplay'}
      );

      element.innerHTML = `
        <script type="application/json">
          ${JSON.stringify(configData)}
        </script>
      `;

      pageEl.appendChild(element);
      win.document.body.appendChild(pageEl);

      shoppingConfig = await element.getImpl();
    }

    it('should build shopping config component', () => {
      expect(() => shoppingConfig.layoutCallback()).to.not.throw();
    });

    it('throws on no config', async () => {
      expectAsyncConsoleError(async () => {
        expect(async () => {
          await shoppingConfig.buildCallback();
        }).to.throw(
          /The amp-story-auto-ads:config should be inside a <script> tag with type=\"application\/json\"​​​/
        );
      });
    });

    it('does use remote config when src attribute is provided', async () => {
      const exampleURL = 'foo.example';
      element.setAttribute('src', exampleURL);

      const expectedRemoteResult =
        '{"city-pop":{"product-tag-id":"city-pop","brand-label":"...","brand-favicon":"...","product-title":"Plastic Love","product-price":"...","product-images":"...","product-details":"...","reviews-page":"...","reviews-data":"...","cta-text":1,"shipping-text":1},"k-pop":{"product-tag-id":"k-pop","brand-label":"...","brand-favicon":"...","product-title":"Gangnam Style","product-price":"...","product-images":"...","product-details":"...","reviews-page":"...","reviews-data":"...","cta-text":1,"shipping-text":1},"eurodance":{"product-tag-id":"eurodance","brand-label":"...","brand-favicon":"...","product-title":"Crystal King Battle","product-price":"...","product-images":"...","product-details":"...","reviews-page":"...","reviews-data":"...","cta-text":1,"shipping-text":1}}';

      expect(
        JSON.stringify(storeService.get(StateProperty.SHOPPING_STATE))
      ).to.eql(expectedRemoteResult);
    });

    it('does use inline config when remote src is invalid', async () => {
      const exampleURL = 'invalidRemoteURL';
      element.setAttribute('src', exampleURL);

      shoppingConfig.buildCallback().then(() => {
        expect(shoppingConfig.getInlineConfig_).to.be.called();
      });
    });

    it('Test Invalid Remote Config URL', async () => {
      const exampleURL = 'invalidRemoteURL';
      element.setAttribute('src', exampleURL);
      expectAsyncConsoleError(async () => {
        expect(async () => {
          await shoppingConfig.buildCallback();
        }).to.throw(
          /'amp-story-auto-ads:config error determining if remote config is valid json: bad url or bad json'​​​/
        );
      });
    });
  }
);
