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
import {isProtocolValid, parseUrlDeprecated} from '../../../../../src/url';
import {user} from '../../../../../src/log';

/**
 * @typedef {{
 *   type: string,
 *   category: string,
 *   url: string,
 *   domainName: string,
 *   image: string
 * }}
 */
export let PortraitComponentDef;

/**
 * @struct @typedef {{
 *   category: !Element,
 *   image: !Element,
 *   meta: !Element,
 * }}
 */
let portraitElsDef;

/**
 * Builder class for the portrait component.
 * @implements {BookendComponentInterface}
 */
export class PortraitComponent {
  /**
   * @param {!../bookend-component.BookendComponentDef} portraitJson
   * @override
   * */
  assertValidity(portraitJson) {
    user().assert('category' in portraitJson && 'image' in portraitJson &&
      'url' in portraitJson, 'Portrait component must contain `category`, ' +
      '`image`, and `url` fields, skipping invalid.');

    user().assert(isProtocolValid(portraitJson['url']), 'Unsupported protocol' +
    ` for article URL ${portraitJson['url']}`);

    user().assert(isProtocolValid(portraitJson['image']), 'Unsupported' +
    `  protocol for article image URL ${portraitJson['image']}`);
  }

  /**
   * @param {!../bookend-component.BookendComponentDef} portraitJson
   * @return {!PortraitComponentDef}
   * @override
   * */
  build(portraitJson) {
    return {
      type: portraitJson['type'],
      category: portraitJson['category'],
      url: portraitJson['url'],
      domainName: parseUrlDeprecated(portraitJson['url']).hostname,
      image: portraitJson['image'],
    };
  }

  /**
   * @param {!../bookend-component.BookendComponentDef} portraitData
   * @param {!Document} doc
   * @return {!Element}
   * @override
   * */
  buildTemplate(portraitData, doc) {
    const html = htmlFor(doc);
    const template =
        html`
        <a class="i-amphtml-story-bookend-portrait"
          target="_top">
          <h2 class="i-amphtml-story-bookend-component-category"
            ref="category"></h2>
          <amp-img class="i-amphtml-story-bookend-portrait-image"
            layout="fixed" width="0" height="0" ref="image"></amp-img>
          <div class="i-amphtml-story-bookend-component-meta"
            ref="meta"></div>
        </a>`;
    addAttributesToElement(template, dict({'href': portraitData.url}));

    const portraitElements = htmlRefs(template);
    const {
      category,
      image,
      meta,
    } = /** @type {!portraitElsDef} */ (portraitElements);

    category.textContent = portraitData.category;
    addAttributesToElement(image, dict({'src': portraitData.image}));
    meta.textContent = portraitData.domainName;

    return template;
  }
}
