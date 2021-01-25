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
import {dict} from '../../../../../src/utils/object';
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
 * }}
 */
export let PortraitComponentDef;

/**
 * @struct @typedef {{
 *   category: !Element,
 *   title: !Element,
 *   image: !Element,
 *   meta: !Element,
 *   domainName: string
 * }}
 */
let portraitElementsDef;

/**
 * Builder class for the portrait component.
 * @implements {BookendComponentInterface}
 */
export class PortraitComponent {
  /** @override */
  assertValidity(portraitJson, element) {
    const requiredFields = ['title', 'image', 'url'];
    const hasAllRequiredFields = !requiredFields.some(
      (field) => !(field in portraitJson)
    );
    userAssert(
      hasAllRequiredFields,
      'Portrait component must contain ' +
        requiredFields.map((field) => '`' + field + '`').join(', ') +
        ' fields, skipping invalid.'
    );

    userAssertValidProtocol(element, portraitJson['url']);
    userAssertValidProtocol(element, portraitJson['image']);
  }

  /** @override */
  build(portraitJson, element) {
    const url = portraitJson['url'];
    const domainName = getSourceOriginForElement(element, url);

    const portrait = {
      url,
      domainName,
      type: portraitJson['type'],
      category: portraitJson['category'],
      title: portraitJson['title'],
      image: portraitJson['image'],
    };

    if (portraitJson['amphtml']) {
      portrait.amphtml = portraitJson['amphtml'];
    }

    return portrait;
  }

  /** @override */
  buildElement(portraitData, win, data) {
    portraitData = /** @type {PortraitComponentDef} */ (portraitData);
    const html = htmlFor(win.document);
    const el = html`
        <a class="i-amphtml-story-bookend-portrait i-amphtml-story-bookend-component" target="_top">
          <h2 class="i-amphtml-story-bookend-component-category"
            ref="category"></h2>
          <h2 class="i-amphtml-story-bookend-article-heading"
            ref="title"></h2>
          <div class="i-amphtml-story-bookend-portrait-image">
            <img ref="image"></img>
          </div>
          <div class="i-amphtml-story-bookend-component-meta"
            ref="meta"></div>
        </a>`;
    addAttributesToElement(
      el,
      dict({
        'href': resolveRelativeUrl(
          portraitData.url,
          getSourceUrl(win.location)
        ),
      })
    );

    el[AMP_STORY_BOOKEND_COMPONENT_DATA] = {
      position: data.position,
      type: BOOKEND_COMPONENT_TYPES.PORTRAIT,
    };

    if (portraitData['amphtml'] === true) {
      addAttributesToElement(el, dict({'rel': 'amphtml'}));
    }

    const {
      category,
      title,
      image,
      meta,
    } = /** @type {!portraitElementsDef} */ (htmlRefs(el));

    category.textContent = portraitData.category;
    title.textContent = portraitData.title;

    addAttributesToElement(
      image,
      dict({'src': resolveImgSrc(win, portraitData.image)})
    );

    meta.textContent = portraitData.domainName;

    return el;
  }
}
