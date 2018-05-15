/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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

import {BookendComponentInterface} from './bookend-component-interface';
import {addAttributesToElement} from '../../../../../src/dom';
import {dict} from '../../../../../src/utils/object';
import {htmlFor, htmlRefs} from '../../../../../src/static-template';
import {isProtocolValid, parseUrl} from '../../../../../src/url';
import {user} from '../../../../../src/log';

/**
 * @typedef {{
 *   type: string,
 *   category: string,
 *   url: string,
 *   image: string
 * }}
 */
export let PortraitComponentDef;

/** @type {string} */
export const TAG = 'amp-story-bookend';

/**
 * Builder class for the portrait component.
 * @implements {BookendComponentInterface}
 */
export class PortraitComponent {
  /** @override */
  assertValidity(articleJson) {
    user().assert('category' in articleJson && 'image' in articleJson &&
      'url' in articleJson, 'Portrait component must contain `category`, ' +
      '`image`, and `url` fields, skipping invalid.');

    user().assert(isProtocolValid(articleJson['url']), 'Unsupported protocol ' +
    `for article URL ${articleJson['url']}`);

    user().assert(isProtocolValid(articleJson['image']), 'Unsupported' +
    `  protocol for article image URL ${articleJson['image']}`);
  }

  /**
   * @override
   * @return {!PortraitComponentDef}
   * */
  build(portraitJson) {
    return {
      type: portraitJson['type'],
      category: portraitJson['category'],
      url: portraitJson['url'],
      domainName: parseUrl(portraitJson['url']).hostname,
      image: portraitJson['image'],
    };
  }

  /** @override */
  buildTemplate(portraitData, doc) {
    const html = htmlFor(doc);
    const template =
        html`
        <a class="i-amphtml-story-bookend-portrait"
          target="_top" ref="portraitComponent">
          <h2 class="i-amphtml-story-bookend-portrait-category"
            ref="portraitCategory"></h2>
          <amp-img class="i-amphtml-story-bookend-portrait-image"
            layout="fixed" width="0" height="0" ref="portraitImage"></amp-img>
          <div class="i-amphtml-story-bookend-portrait-meta"
            ref="portraitMeta"></div>
        </a>`;
    addAttributesToElement(template, dict({'href': portraitData.url}));

    const portraitElements = htmlRefs(template);
    const {
      portraitCategory,
      portraitImage,
      portraitMeta,
    } = portraitElements;

    portraitCategory.textContent = portraitData.category;
    addAttributesToElement(portraitImage, dict({'src': portraitData.image}));
    portraitMeta.textContent = portraitData.domainName;

    return template;
  }
}
