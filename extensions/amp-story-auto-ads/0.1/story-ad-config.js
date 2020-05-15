/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {isJsonScriptTag} from '../../../src/dom';
import {isObject} from '../../../src/types';
import {parseJson} from '../../../src/json';
import {startsWith} from '../../../src/string';
import {user, userAssert} from '../../../src/log';

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
};

export class StoryAdConfig {
  /**
   * @param {!Element} element amp-story-auto-ads element.
   */
  constructor(element) {
    /** @private {!Element} amp-story-auto ads element. */
    this.element_ = element;
  }

  /**
   * Validate and sanitize config.
   * @return {!JsonObject}
   */
  getConfig() {
    const child = this.element_.firstElementChild;
    userAssert(
      child && isJsonScriptTag(child),
      `The ${TAG} should ` +
        'be inside a <script> tag with type="application/json"'
    );

    const jsonConfig = parseJson(child.textContent);

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
        id && startsWith(id, 'i-amphtml-demo-'),
        `${TAG} id must start with i-amphtml-demo- to use fake ads`
      );
    }
  }
}
