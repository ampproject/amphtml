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
import {getSourceOriginForElement, userAssertValidProtocol} from '../../utils';
import {htmlFor, htmlRefs} from '../../../../../src/static-template';
import {userAssert} from '../../../../../src/log';

/**
 * @typedef {{
 *   type: string,
 *   title: string,
 *   url: string,
 *   image: (string|undefined),
 *   domainName: string,
 * }}
 */
export let ArticleComponentDef;

/**
 * Builder class for the small article component.
 * @implements {BookendComponentInterface}
 */
export class ArticleComponent {
  /** @override */
  assertValidity(articleJson, element) {
    const requiredFields = ['title', 'url'];
    const hasAllRequiredFields = !requiredFields.some(
      field => !(field in articleJson)
    );
    userAssert(
      hasAllRequiredFields,
      'Small article component must contain ' +
        requiredFields.map(field => '`' + field + '`').join(', ') +
        ' fields, skipping invalid.'
    );

    userAssertValidProtocol(element, articleJson['url']);

    const image = articleJson['image'];
    if (image) {
      userAssertValidProtocol(element, image);
    }
  }

  /** @override */
  build(articleJson, element) {
    const url = articleJson['url'];
    const domainName = getSourceOriginForElement(element, url);

    const article = {
      url,
      domainName,
      type: articleJson['type'],
      title: articleJson['title'],
    };

    if (articleJson['image']) {
      article.image = articleJson['image'];
    }

    if (articleJson['amphtml']) {
      article.amphtml = articleJson['amphtml'];
    }

    return /** @type {!ArticleComponentDef} */ (article);
  }

  /** @override */
  buildElement(articleData, doc) {
    const html = htmlFor(doc);
    //TODO(#14657, #14658): Binaries resulting from htmlFor are bloated.
    const el = html`
      <a
        class="i-amphtml-story-bookend-article
          i-amphtml-story-bookend-component"
        target="_top"
      >
        <div class="i-amphtml-story-bookend-article-text-content">
          <h2
            class="i-amphtml-story-bookend-article-heading"
            ref="heading"
          ></h2>
          <div class="i-amphtml-story-bookend-component-meta" ref="meta"></div>
        </div>
      </a>
    `;
    addAttributesToElement(el, dict({'href': articleData.url}));

    if (articleData['amphtml'] === true) {
      addAttributesToElement(el, dict({'rel': 'amphtml'}));
    }

    if (articleData.image) {
      const imgEl = html`
          <div class="i-amphtml-story-bookend-article-image">
            <img ref="image">
            </img>
          </div>`;

      const {image} = htmlRefs(imgEl);
      addAttributesToElement(image, dict({'src': articleData.image}));
      el.appendChild(imgEl);
    }

    const articleElements = htmlRefs(el);
    const {heading, meta} = articleElements;

    heading.textContent = articleData.title;
    meta.textContent = articleData.domainName;

    return el;
  }
}
