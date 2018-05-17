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
import {htmlFor} from '../../../../../src/static-template';
import {isProtocolValid, parseUrlDeprecated} from '../../../../../src/url';
import {user} from '../../../../../src/log';

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
  /**
   * @param {!../bookend-component.BookendComponentDef} articleJson
   * @override
   * */
  assertValidity(articleJson) {
    user().assert('title' in articleJson && 'url' in articleJson,
        'Articles must contain `title` and `url` fields, skipping invalid.');

    user().assert(isProtocolValid(articleJson['url']), 'Unsupported protocol' +
        ` for article URL ${articleJson['url']}`);

    if (articleJson['image']) {
      user().assert(isProtocolValid(articleJson['image']), 'Unsupported ' +
        `protocol for article image URL ${articleJson['image']}`);
    }
  }

  /**
   * @param {!../bookend-component.BookendComponentDef} articleJson
   * @return {!ArticleComponentDef}
   * @override
   * */
  build(articleJson) {
    const article = {
      type: articleJson['type'],
      title: articleJson['title'],
      url: articleJson['url'],
      domainName: parseUrlDeprecated(articleJson['url']).hostname,
    };

    if (articleJson['image']) {
      article.image = articleJson['image'];
    }

    return /** @type {!ArticleComponentDef} */ (article);
  }

  /**
   * @param {!../bookend-component.BookendComponentDef} articleData
   * @param {!Document} doc
   * @return {!Element}
   * @override
   * */
  buildTemplate(articleData, doc) {
    const html = htmlFor(doc);
    //TODO(#14657, #14658): Binaries resulting from htmlFor are bloated.
    const template =
        html`
        <a class="i-amphtml-story-bookend-article"
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
