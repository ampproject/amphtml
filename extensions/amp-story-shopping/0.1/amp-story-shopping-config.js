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

    for (const item of storyConfig['products']) {
      productIDtoProduct[item['name']] = item;
    }

    this.storeService_.dispatch(Action.ADD_SHOPPING_STATE, productIDtoProduct);

    //TODO(#36412): Add call to validate config here.
  }

  /** @override */
  buildCallback() {
    super.buildCallback();
    return Services.storyStoreServiceForOrNull(this.win).then(
      (storeService) => {
        devAssert(storeService, 'Could not retrieve AmpStoryStoreService');
        this.storeService_ = storeService;

        // If remote config fails, falls back to inline config.
        this.getRemoteConfig_()
          .then((storyConfig) => this.dispatchConfig_(storyConfig))
          .catch(() => this.dispatchConfig_(this.getInlineConfig_()));
      }
    );
  }

  /** @override */
  isLayoutSupported(layout) {
    return layout === Layout.NODISPLAY;
  }

  /** @return {Promise<JsonObject>} */
  getInlineConfig_() {
    userAssert(
      this.element_.firstElementChild &&
        isJsonScriptTag(this.element_.firstElementChild),
      `${TAG}: The config should be inside a <script> tag with type="application/json"`
    );

    return parseJson(this.element_.firstElementChild.textContent);
  }

  /** @return {Promise<JsonObject>} */
  getRemoteConfig_() {
    const src = this.element.getAttribute('src');
    if (!src) {
      return Promise.reject();
    }
    return Services.xhrFor(this.win)
      .fetchJson(src)
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
