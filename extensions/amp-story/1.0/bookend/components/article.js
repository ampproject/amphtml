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
import {isProtocolValid, parseUrl} from '../../../../../src/url';
import {user} from '../../../../../src/log';

/**
 * @typedef {{
 *   type: string,
 *   title: string,
 *   url: string,
 *   image: (string|undefined)
 * }}
 */
export let BookendArticleComponentDef;

const TAG = 'amp-story-bookend';

/**
 * Builder class for the small article component.
 * @implements {BookendComponentInterface}
 */
export class ArticleComponent {
  /** @override */
  assertValidity(articleJson) {
    if (!articleJson['title'] || !articleJson['url']) {
      user().error(TAG, 'Articles must contain `title` and `url` ' +
        'fields, skipping invalid.');
    }

    if (!isProtocolValid(articleJson['url'])) {
      user().error(TAG, 'Unsupported protocol for article URL ' +
        `${articleJson['url']}`);
    }

    if (!isProtocolValid(articleJson['image'])) {
      user().error(TAG, 'Unsupported protocol for article image URL' +
      ` ${articleJson['image']}`);
    }
  }

  /**
   * @override
   * @return {!BookendArticleComponentDef}
   * */
  build(articleJson) {
    const article = {
      type: 'small',
      title: articleJson['title'],
      url: articleJson['url'],
      domainName: parseUrl(articleJson['url']).hostname,
    };

    if (articleJson['image']) {
      article.image = articleJson['image'];
    }

    return /** @type {!BookendArticleComponentDef} */ (article);
  }

  /** @override */
  buildTemplate(articleData, doc) {

    const html = htmlFor(doc);
    //TODO(#14657, #14658): Binaries resulting from htmlFor are bloated.
    const template =
        html`
        <a class="i-amphtml-story-bookend-article"
          target="_top">
          <div class="i-amphtml-story-bookend-article-meta">
          </div>
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
      html`<div class="i-amphtml-story-bookend-article-meta"></div>`;
    articleMeta.textContent = articleData.domainName;
    template.appendChild(articleMeta);

    return template;
  }
}

/**
 * @typedef {{
 *   type: string,
 *   heading: string
 * }}
 */
export let BookendArticleTitleComponentDef;

/**
 * Builder class for the article titles used to separate article sets.
 * @implements {BookendComponentInterface}
 */
export class ArticleTitleComponent {

  /** @override */
  assertValidity(titleJson) {
    if (!titleJson['title']) {
      user().error(TAG, 'Titles must contain `title` field, skipping' +
      ' invalid.');
    }
  }

  /** @override */
  build(titleJson) {
    const title = {
      type: 'article-set-title',
      heading: titleJson.title,
    };
    return title;
  }

  /** @override */
  buildTemplate(titleData, doc) {
    const html = htmlFor(doc);
    const template = html`<h3 class="i-amphtml-story-bookend-heading"></h3>`;

    template.textContent = titleData.heading;

    return template;
  }
}
