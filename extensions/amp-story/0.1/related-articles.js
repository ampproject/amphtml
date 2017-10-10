/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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
import {parseUrl} from '../../../src/url';
import {user} from '../../../src/log';


/**
 * @typedef {{
 *   title: string,
 *   url: string,
 *   domainName: string,
 *   image: (string|undefined),
 * }}
 */
export let RelatedArticleDef;


/**
 * @typedef {{
 *   heading: (string|undefined),
 *   articles: !Array<!RelatedArticleDef>,
 * }}
 */
export let RelatedArticleSetDef;


/**
 * @param {!JsonObject} articleJson
 * @return {!RelatedArticleDef}
 */
function buildArticleFromJson_(articleJson) {
  // TODO(alanorozco): Graceful errors.
  const article = {
    title: user().assert(articleJson['title']),
    url: user().assert(articleJson['url']),
    domainName: parseUrl(user().assert(articleJson['url'])).hostname,
  };

  if (articleJson['image']) {
    article.image = articleJson['image'];
  }

  return /** @type {!RelatedArticleDef} */ (article);
}


/**
 * @param {!JsonObject} articleSetsResponse
 * @return {!Array<!RelatedArticleSetDef>}
 */
// TODO(alanorozco): domain name
// TODO(alanorozco): Graceful errors.
export function relatedArticlesFromJson(articleSetsResponse) {
  return /** @type {!Array<!RelatedArticleSetDef>} */ (
      Object.keys(articleSetsResponse).map(headingKey => {
        const articleSet = {
          articles: articleSetsResponse[headingKey].map(buildArticleFromJson_),
        };

        if (headingKey.trim().length) {
          articleSet.heading = headingKey;
        }

        return /** @type {!RelatedArticleSetDef} */ (articleSet);
      }));
}
