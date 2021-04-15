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

import {
  AMP_STORY_BOOKEND_COMPONENT_DATA,
  BOOKEND_COMPONENT_TYPES,
  BookendComponentInterface,
} from './bookend-component-interface';
import {addAttributesToElement} from '../../../../../src/dom';
import {dict} from '../../../../../src/core/types/object';
import {
  getSourceOriginForElement,
  resolveImgSrc,
  userAssertValidProtocol,
} from '../../utils';
import {getSourceUrl, resolveRelativeUrl} from '../../../../../src/url';
import {htmlFor, htmlRefs} from '../../../../../src/static-template';
import {userAssert} from '../../../../../src/log';

/**
 * @typedef {{
 *   type: string,
 *   category: string,
 *   title: string,
 *   url: string,
 *   domainName: string,
 *   image: string,
 *   alt: string,
 * }}
 */
export let LandscapeComponentDef;

/**
 * @struct @typedef {{
 *   category: !Element,
 *   title: !Element,
 *   image: !Element,
 *   meta: !Element,
 *   domainName: string,
 * }}
 */
let landscapeElementsDef;

/**
 * Builder class for the landscape component.
 * @implements {BookendComponentInterface}
 */
export class LandscapeComponent {
  /** @override */
  assertValidity(landscapeJson, element) {
    const requiredFields = ['title', 'image', 'url'];
    const hasAllRequiredFields = !requiredFields.some(
      (field) => !(field in landscapeJson)
    );
    userAssert(
      hasAllRequiredFields,
      'Landscape component must contain ' +
        requiredFields.map((field) => '`' + field + '`').join(', ') +
        ' fields, skipping invalid.'
    );

    userAssertValidProtocol(element, landscapeJson['url']);
    userAssertValidProtocol(element, landscapeJson['image']);
  }

  /** @override */
  build(landscapeJson, element) {
    const url = landscapeJson['url'];
    const domainName = getSourceOriginForElement(element, url);

    const landscape = {
      url,
      domainName,
      type: landscapeJson['type'],
      title: landscapeJson['title'],
      category: landscapeJson['category'],
      image: landscapeJson['image'],
      alt: landscapeJson['alt'],
    };

    if (landscapeJson['amphtml']) {
      landscape.amphtml = landscapeJson['amphtml'];
    }

    return landscape;
  }

  /** @override */
  buildElement(landscapeData, win, data) {
    landscapeData = /** @type {LandscapeComponentDef} */ (landscapeData);
    const html = htmlFor(win.document);
    const el = html`
        <a class="i-amphtml-story-bookend-landscape
            i-amphtml-story-bookend-component" target="_top">
          <h2 class="i-amphtml-story-bookend-component-category"
            ref="category"></h2>
          <h2 class="i-amphtml-story-bookend-article-heading"
            ref="title"></h2>
          <div class="i-amphtml-story-bookend-landscape-image">
            <img ref="image"></img>
          </div>
          <div class="i-amphtml-story-bookend-component-meta"
            ref="meta"></div>
        </a>`;
    addAttributesToElement(
      el,
      dict({
        'href': resolveRelativeUrl(
          landscapeData.url,
          getSourceUrl(win.location)
        ),
      })
    );

    el[AMP_STORY_BOOKEND_COMPONENT_DATA] = {
      position: data.position,
      type: BOOKEND_COMPONENT_TYPES.LANDSCAPE,
    };

    if (landscapeData['amphtml'] === true) {
      addAttributesToElement(el, dict({'rel': 'amphtml'}));
    }

    const landscapeEls = htmlRefs(el);
    const {
      category,
      title,
      image,
      meta,
    } = /** @type {!landscapeElementsDef} */ (landscapeEls);

    category.textContent = landscapeData.category;
    title.textContent = landscapeData.title;

    addAttributesToElement(
      image,
      dict({'src': resolveImgSrc(win, landscapeData.image)})
    );

    addAttributesToElement(image, {
      'alt': landscapeData.alt ? landscapeData.alt : '',
    });

    meta.textContent = landscapeData.domainName;

    return el;
  }
}
