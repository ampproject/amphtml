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
import {Services} from '../../../../../src/services';
import {addAttributesToElement} from '../../../../../src/dom';
import {dict} from '../../../../../src/utils/object';
import {htmlFor, htmlRefs} from '../../../../../src/static-template';
import {user} from '../../../../../src/log';
import {userAssertValidProtocol} from '../../utils';

/**
 * @typedef {{
 *   type: string,
 *   category: string,
 *   title: string,
 *   url: string,
 *   domainName: string,
 *   image: string
 * }}
 */
export let LandscapeComponentDef;

/**
 * @struct @typedef {{
 *   category: !Element,
 *   title: !Element,
 *   image: !Element,
 *   meta: !Element,
 * }}
 */
let landscapeElsDef;

/**
 * Builder class for the landscape component.
 * @implements {BookendComponentInterface}
 */
export class LandscapeComponent {

  /** @override */
  assertValidity(landscapeJson, element) {

    const requiredFields = ['title', 'image', 'url'];
    const hasAllRequiredFields =
        !requiredFields.some(field => !(field in landscapeJson));
    user().assert(
        hasAllRequiredFields,
        'Landscape component must contain ' +
        requiredFields.map(field => '`' + field + '`').join(', ') +
        ' fields, skipping invalid.');

    userAssertValidProtocol(element, landscapeJson['url']);
    userAssertValidProtocol(element, landscapeJson['image']);
  }

  /** @override */
  build(landscapeJson, element) {
    const url = landscapeJson['url'];
    const {hostname: domainName} = Services.urlForDoc(element).parse(url);

    return {
      url,
      domainName,
      type: landscapeJson['type'],
      title: landscapeJson['title'],
      category: landscapeJson['category'],
      image: landscapeJson['image'],
    };
  }

  /** @override */
  buildTemplate(landscapeData, doc) {
    const html = htmlFor(doc);
    const el =
        html`
        <a class="i-amphtml-story-bookend-landscape
          i-amphtml-story-bookend-component"
          target="_top">
          <h2 class="i-amphtml-story-bookend-component-category"
            ref="category"></h2>
          <h2 class="i-amphtml-story-bookend-article-heading"
            ref="title"></h2>
          <amp-img class="i-amphtml-story-bookend-landscape-image"
            layout="fixed" width="0" height="0" ref="image"></amp-img>
          <div class="i-amphtml-story-bookend-component-meta"
            ref="meta"></div>
        </a>`;
    addAttributesToElement(el, dict({'href': landscapeData.url}));

    const landscapeEls = htmlRefs(el);
    const {
      category,
      title,
      image,
      meta,
    } = /** @type {!landscapeElsDef} */ (landscapeEls);

    category.textContent = landscapeData.category;
    title.textContent = landscapeData.title;
    addAttributesToElement(image, dict({'src': landscapeData.image}));
    meta.textContent = landscapeData.domainName;

    return el;
  }
}
