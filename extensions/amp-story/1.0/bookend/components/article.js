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
import {htmlFor} from '../../../../../src/static-template';
import {user} from '../../../../../src/log';
import {userAssertValidProtocol} from '../../utils';

/**
 * @typedef {{
 *   type: string,
 *   title: string,
 *   url: string,
 *   image: (string|undefined)
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
    const hasAllRequiredFields =
        !requiredFields.some(field => !(field in articleJson));
    user().assert(
        hasAllRequiredFields,
        'Small article component must contain ' +
            requiredFields.map(field => '`' + field + '`').join(', ') +
            ' fields, skipping invalid.');

    userAssertValidProtocol(element, articleJson['url']);

    const image = articleJson['image'];
    if (image) {
      userAssertValidProtocol(element, image);
    }
  }

  /** @override */
  build(articleJson, element) {
    const url = articleJson['url'];
    const {hostname: domainName} = Services.urlForDoc(element).parse(url);

    const article = {
      url,
      domainName,
      type: articleJson['type'],
      title: articleJson['title'],
    };

    if (articleJson['image']) {
      article.image = articleJson['image'];
    }

    return /** @type {!ArticleComponentDef} */ (article);
  }

  /** @override */
  buildTemplate(articleData, doc) {
    const html = htmlFor(doc);
    //TODO(#14657, #14658): Binaries resulting from htmlFor are bloated.
    const template =
        html`
        <a class="i-amphtml-story-bookend-article
          i-amphtml-story-bookend-component"
          target="_top">
        </a>`;
    addAttributesToElement(template, dict({'href': articleData.url}));

    if (articleData.image) {
      const ampImg =
          html`
          <amp-img class="i-amphtml-story-bookend-article-image"
                  width="100"
                  height="100">
          </amp-img>`;

      addAttributesToElement(ampImg, dict({'src': articleData.image}));
      template.appendChild(ampImg);
    }

    const heading =
      html`<h2 class="i-amphtml-story-bookend-article-heading"></h2>`;
    heading.textContent = articleData.title;
    template.appendChild(heading);

    const articleMeta =
      html`<div class="i-amphtml-story-bookend-component-meta"></div>`;
    articleMeta.textContent = articleData.domainName;
    template.appendChild(articleMeta);

    return template;
  }
}
