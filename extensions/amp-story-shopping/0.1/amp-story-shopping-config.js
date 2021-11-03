import {CommonSignals} from '#core/constants/common-signals';
import {isJsonScriptTag} from '#core/dom';
import {Layout, applyFillContent} from '#core/dom/layout';
import {parseJson} from '#core/types/object/json';

import {Services} from '#service';

import {devAssert, user, userAssert} from '#utils/log';

import {Action} from '../../amp-story/1.0/amp-story-store-service';

const TAG = 'amp-story-shopping-config';

export class AmpStoryShoppingConfig extends AMP.BaseElement {
  /**
   * @param {!Element} element amp-story-shoppin-config element
   */
  constructor(element) {
    super(element);

    /** @private {string} */
    this.element_ = element;

    /** @private {string} */
    this.myText_ = TAG;

    /** @private {?Element} */
    this.container_ = null;

    /** @private {?../../amp-story/1.0/amp-story.AmpStory} */
    this.ampStory_ = null;

    /** @private {!Window} Window element */
    this.win_ = this.win;

    /** @private @const {!./amp-story-store-service.AmpStoryStoreService} */
    this.storeService_ = null;
  }

  /** @override */
  buildCallback() {
    super.buildCallback();
    this.container_ = this.element.ownerDocument.createElement('div');
    this.container_.textContent = this.myText_;
    this.element.appendChild(this.container_);
    applyFillContent(this.container_, /* replacedContent */ true);
    return Services.storyStoreServiceForOrNull(this.win).then(
      (storeService) => {
        devAssert(storeService, 'Could not retrieve AmpStoryStoreService');
        this.storeService_ = storeService;

        const ampStoryElement = this.element.parentElement.parentElement;
        userAssert(
          ampStoryElement.tagName === 'AMP-STORY',
          `<${TAG}> should be a grandchild of <amp-story>`
        );

        return ampStoryElement.getImpl().then((impl) => {
          this.ampStory_ = impl;
          return this.ampStory_
            .signals()
            .whenSignal(CommonSignals.INI_LOAD)
            .then(() =>
              this.getConfig().then((storyConfig) => {
                //Set Shopping Story config to storeService here
                const productIDtoProduct = {};

                for (const item of storyConfig['items']) {
                  productIDtoProduct[item['product-tag-id']] = item;
                }

                this.storeService_.dispatch(
                  Action.ADD_SHOPPING_STATE,
                  productIDtoProduct
                );
              })
            );
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
    return Services.xhrFor(this.win_)
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
