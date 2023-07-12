import {isJsonScriptTag} from '#core/dom';
import {isObject} from '#core/types';
import {parseJson} from '#core/types/object/json';

import {Services} from '#service';

import {user, userAssert} from '#utils/log';

/** @const {string} */
const TAG = 'amp-story-auto-ads:config';

/** @enum {boolean} */
const DisallowedAdAttributes = {
  'height': true,
  'layout': true,
  'width': true,
};

/** @enum {boolean} */
const AllowedAdTypes = {
  'adsense': true,
  'custom': true,
  'doubleclick': true,
  'fake': true,
  'nws': true,
  'mgid': true,
};

export class StoryAdConfig {
  /**
   * @param {!Element} element amp-story-auto-ads element.
   * @param {!Window} win Window element
   */
  constructor(element, win) {
    /** @private {!Element} amp-story-auto ads element. */
    this.element_ = element;
    /** @private {!Window} Window element */
    this.win_ = win;
  }

  /**
   * Validate and sanitize config.
   * @return {!JsonObject}
   */
  getConfig() {
    const configData = this.element_.hasAttribute('src')
      ? this.getRemoteConfig_()
      : this.getInlineConfig_(this.element_.firstElementChild);
    return configData.then((jsonConfig) => this.validateConfig_(jsonConfig));
  }

  /**
   * @param {!Element} jsonConfig
   * @return {!JsonObject}
   */
  validateConfig_(jsonConfig) {
    const requiredAttrs = {
      class: 'i-amphtml-story-ad',
      layout: 'fill',
      'amp-story': '',
    };

    const adAttributes = jsonConfig['ad-attributes'];
    userAssert(
      adAttributes,
      `${TAG} Error reading config. ` +
        'Top level JSON should have an "ad-attributes" key'
    );

    this.validateType_(adAttributes['type']);

    for (const attr in adAttributes) {
      const value = adAttributes[attr];
      if (isObject(value)) {
        adAttributes[attr] = JSON.stringify(value);
      }
      if (DisallowedAdAttributes[attr]) {
        user().warn(TAG, 'ad-attribute "%s" is not allowed', attr);
        delete adAttributes[attr];
      }
    }
    return /** @type {!JsonObject} */ ({...adAttributes, ...requiredAttrs});
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

  /**
   * Logic specific to each ad type.
   * @param {string} type
   */
  validateType_(type) {
    userAssert(
      !!AllowedAdTypes[type],
      `${TAG} "${type}" ad type is missing or not supported`
    );

    if (type === 'fake') {
      const {id} = this.element_;
      userAssert(
        id && id.startsWith('i-amphtml-demo-'),
        `${TAG} id must start with i-amphtml-demo- to use fake ads`
      );
    }
  }
}
