import {isJsonScriptTag} from '#core/dom';
import {Layout} from '#core/dom/layout';
import {parseJson} from '#core/types/object/json';

import {Services} from '#service';

import {devAssert, user, userAssert} from '#utils/log';

import {Action} from '../../amp-story/1.0/amp-story-store-service';

const TAG = 'amp-story-shopping-config';

export class AmpStoryShoppingConfig extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {string} */
    this.element_ = element;

    /** @private @const {!./amp-story-store-service.AmpStoryStoreService} */
    this.storeService_ = null;
  }

  /**
   * Keys product data to product-ids and adds them to the store service.
   * @private
   * @param {!JsonObject} storyConfig
   */
  dispatchConfig_(storyConfig) {
    const productIDtoProduct = {};

    for (const item of storyConfig['items']) {
      productIDtoProduct[item['product-tag-id']] = item;
    }

    this.storeService_.dispatch(Action.ADD_SHOPPING_STATE, productIDtoProduct);

    //TODO: add call to validate config here. See validation I2I #36412 for implementation details
  }

  /** @override */
  buildCallback() {
    super.buildCallback();
    return Services.storyStoreServiceForOrNull(this.win).then(
      (storeService) => {
        devAssert(storeService, 'Could not retrieve AmpStoryStoreService');

        this.storeService_ = storeService;

        this.getConfig().then((storyConfig) => {
          //if remote config is not valid, try using the inline config
          if (storyConfig == null && this.element_.hasAttribute('src')) {
            this.getInlineConfig_(this.element_.firstElementChild).then(
              (storyInlineconfig) => {
                this.dispatchConfig_(storyInlineconfig);
              }
            );
          } else {
            this.dispatchConfig_(storyConfig);
          }
        });
      }
    );
  }

  /** @override */
  isLayoutSupported(layout) {
    return layout === Layout.NODISPLAY;
  }

  /**
   * @return {!JsonObject}
   */
  getConfig() {
    const configData = this.element_.hasAttribute('src')
      ? this.getRemoteConfig_()
      : this.getInlineConfig_(this.element_.firstElementChild);

    return configData;
  }

  /**
   * @param {!Element} child
   * @return {!JsonObject}
   */
  getInlineConfig_(child) {
    userAssert(
      child && isJsonScriptTag(child),
      `The ${TAG} should ` +
        'be inside a <script> tag with type="application/json"'
    );

    const inlineJSONConfig = parseJson(child.textContent);

    return Promise.resolve(inlineJSONConfig);
  }

  /**
   * @return {!JsonObject}
   */
  getRemoteConfig_() {
    return Services.xhrFor(this.win)
      .fetchJson(this.element_.getAttribute('src'))
      .then((response) => response.json())
      .catch((err) => {
        user().error(
          TAG,
          'error determining if remote config is valid json: bad url or bad json',
          err
        );
      });
  }
}
