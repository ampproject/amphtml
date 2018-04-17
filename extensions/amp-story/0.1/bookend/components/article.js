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

import {AbstractBookendComponent} from './abstract';
import {dev, user} from '../../../../../src/log';
import {dict} from '../../../../../src/utils/object';
import {isProtocolValid, parseUrl} from '../../../../../src/url';

const TAG = 'amp-story';

/**
 * @typedef {{
 *   type: string,
 *   title: string,
 *   url: string,
 *   image: (string|undefined)
 * }}
 */
export let BookendArticleComponentDef;

/**
 * Builder class for the small article component.
 */
export class ArticleComponent extends AbstractBookendComponent {

  /** @override */
  static build(articleJson) {
    if (!articleJson['title'] || !articleJson['url']) {
      user().error(TAG,
          'Articles must contain `title` and `url` fields, skipping invalid.');
      return null;
    }

    user().assert(isProtocolValid(articleJson['url']),
        `Unsupported protocol for article URL ${articleJson['url']}`);

    const article = {
      type: 'small',
      title: dev().assert(articleJson['title']),
      url: dev().assert(articleJson['url']),
      domainName: parseUrl(dev().assert(articleJson['url'])).hostname,
    };

    if (articleJson['image']) {
      user().assert(isProtocolValid(articleJson['image']),
          `Unsupported protocol for article image URL ${articleJson['image']}`);
      article.image = dev().assert(articleJson['image']);
    }

    return /** @type {!RelatedArticleDef} */ (article);
  }

  /** @override */
  static buildTemplate(articleData) {
    const template = /** @type {!./simple-template.ElementDef} */ ({
      tag: 'a',
      attrs: dict({
        'class': 'i-amphtml-story-bookend-article',
        'href': articleData.url,
        'target': '_top',
      }),
      children: [
        {
          tag: 'h2',
          attrs: dict({'class': 'i-amphtml-story-bookend-article-heading'}),
          unlocalizedString: articleData.title,
        },
        {
          tag: 'div',
          attrs: dict({'class': 'i-amphtml-story-bookend-article-meta'}),
          unlocalizedString: articleData.domainName,
        },
      ],
    });

    if (articleData.image) {
      template.children.unshift(/** @type {!./simple-template.ElementDef} */ ({
        tag: 'amp-img',
        attrs: dict({
          'class': 'i-amphtml-story-bookend-article-image',
          'src': articleData.image,
          'width': 100,
          'height': 100,
        }),
      }));
    }

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
 */
export class ArticleTitle extends AbstractBookendComponent {

  /** @override */
  static build(titleJson) {
    const title = {
      type: 'article-set-title',
      heading: titleJson.title,
    };
    return title;
  }

  /** @override */
  static buildTemplate(titleData) {
    const template = /** @type {!./simple-template.ElementDef} */ ({
      tag: 'h3',
      attrs: dict({'class': 'i-amphtml-story-bookend-heading'}),
      unlocalizedString: titleData.heading,
    });
    return template;
  }
}
