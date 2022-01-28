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
      items: [
        {
          'product-tag-id': 'city-pop',
          'product-title': 'Plastic Love',
          'product-price': 19,
          'product-price-currency': 'JPY',
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
      expectAsyncConsoleError(async () => {
        expect(() => {
          pageElement.appendChild(<amp-story-shopping-config />);
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
            'product-tag-id': 'art',
            'product-title': 'Abstract Art',
            'product-brand': 'V. Artsy',
            'product-price': 1200.0,
            'product-price-currency': 'JPY',
            'product-images': [
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

        expect(storeService.dispatch.withArgs(Action.ADD_SHOPPING_DATA, config))
          .to.have.been.calledOnce;
      });
    });
  }
);
