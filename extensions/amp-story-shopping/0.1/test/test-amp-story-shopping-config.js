import * as Preact from '#core/dom/jsx';

import {Services} from '#service';

import * as defaultConfig from '../../../../examples/amp-story/shopping/remote.json';
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

    beforeEach(async () => {
      pageElement = <amp-story-page id="page1"></amp-story-page>;
      env.win.document.body.appendChild(pageElement);
    });

    async function createAmpStoryShoppingConfig(
      src = null,
      config = defaultConfig
    ) {
      pageElement.appendChild(
        <amp-story-shopping-config layout="nodisplay" src={src}>
          <script type="application/json">{JSON.stringify(config)}</script>
        </amp-story-shopping-config>
      );
      return getShoppingConfig(pageElement);
    }

    it('throws on no config', async () => {
      expectAsyncConsoleError(async () => {
        expect(() => {
          pageElement.appendChild(<amp-story-shopping-config />);
          return getShoppingConfig(pageElement);
        }).to.throw(/<script> tag with type=\"application\/json\"​​​/);
      });
    });

    it('does use inline config', async () => {
      const exampleURL = 'foo.example';

      const result = await createAmpStoryShoppingConfig(exampleURL);

      const expectedRemoteResult = JSON.parse(
        '{"art":{"productId": "art","productTitle": "Abstract Art","productBrand": "V. Artsy","productPrice": 1200.0,"productPriceCurrency": "JPY","productImages": ["https://source.unsplash.com/BdVQU-NDtA8/500x500"]}}'
      );

      expect(result).to.deep.eql(expectedRemoteResult);
    });

    it('does use remote config when src attribute is provided', async () => {
      const exampleURL = 'foo.example';

      const result = await createAmpStoryShoppingConfig(exampleURL);

      const expectedRemoteResult = JSON.parse(
        '{"city-pop":{"product-tag-id":"city-pop","product-title":"Plastic Love","product-price": 19, "product-price-currency": "JPY"}}'
      );

      expect(result).to.deep.eql(expectedRemoteResult);
    });

    it('does use inline config when remote src is invalid', async () => {
      const exampleURL = 'invalidRemoteURL';
      const inlineConfig = {items: [{'product-tag-id': 'foo'}]};

      const result = await createAmpStoryShoppingConfig(
        exampleURL,
        inlineConfig
      );

      expect(result).to.deep.eql({foo: {'product-tag-id': 'foo'}});
    });

    it('errors with invalid remote config URL', async () => {
      const exampleURL = 'invalidRemoteURL';
      expectAsyncConsoleError(async () => {
        expect(() => createAmpStoryShoppingConfig(exampleURL)).to.throw(
          /error determining if remote config is valid json: bad url or bad json/
        );
      });
    });

    describe('storeShoppingConfig', () => {
      let storeService;
      let pageElement;

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
  }
);
