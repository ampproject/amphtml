import {createElementWithAttributes} from '#core/dom';
import {Layout} from '#core/dom/layout';

import '../amp-story-shopping';
import {Services} from '#service';

import * as configData from '../../../../examples/amp-story/shopping/remote.json';
import {registerServiceBuilder} from '../../../../src/service-helpers';
import {
  Action,
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

      const productIDtoProduct = {};

      for (const item of configData['items']) {
        productIDtoProduct[item['product-tag-id']] = item;
      }

      storeService.dispatch(Action.ADD_SHOPPING_STATE, productIDtoProduct);
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
      expect(shoppingConfig.isLayoutSupported(Layout.NODISPLAY)).to.be.true;
    });

    it('throws on no config', async () => {
      expectAsyncConsoleError(async () => {
        expect(async () => {
          await shoppingConfig.getConfig();
        }).to.throw(
          /The amp-story-auto-ads:config should be inside a <script> tag with type=\"application\/json\"​​​/
        );
      });
    });

    it('does use remote config when src attribute is provided', async () => {
      const exampleURL = 'foo.example';
      const xhrService = Services.xhrFor(win);
      const fetchStub = env.sandbox.stub(xhrService, 'fetchJson').resolves({
        json: () => Promise.resolve(configData),
      });
      element.setAttribute('src', exampleURL);

      const result = await shoppingConfig.getConfig();
      expect(fetchStub).to.be.calledWith(exampleURL);
      expect(result).to.eql(configData);
    });

    it('does use inline config when remote src is invalid', async () => {
      const exampleURL = 'invalidRemoteURL';
      element.setAttribute('src', exampleURL);

      shoppingConfig.getConfig().then((storyConfig) => {
        //if remote config is not valid, it will use the inline config
        expect(storyConfig).to.eql(null);
        expect(element.hasAttribute('src')).to.be.true;
        //if the above two conditions are true, then it will call inline in the conditional!
        expect(shoppingConfig.getInlineConfig_).to.be.called();
      });
    });

    it('Test Invalid Remote Config URL', async () => {
      const exampleURL = 'invalidRemoteURL';
      element.setAttribute('src', exampleURL);
      expectAsyncConsoleError(async () => {
        expect(async () => {
          await shoppingConfig.getConfig();
        }).to.throw(
          /'amp-story-auto-ads:config error determining if remote config is valid json: bad url or bad json'​​​/
        );
      });
    });
  }
);
