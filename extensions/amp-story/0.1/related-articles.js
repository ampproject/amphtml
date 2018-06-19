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
import {Services} from '../../../src/services';
import {dev, user} from '../../../src/log';
import {isProtocolValid} from '../../../src/url';


const TAG = 'amp-story';


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

/** New bookend components only supported in amp-story 1.0. */
const NEW_COMPONENTS =
['landscape', 'portrait', 'cta-link', 'heading', 'textbox'];

/**
 * @param {!JsonObject} articleJson
 * @param {!Element} element
 * @param {!Location} location
 * @return {?RelatedArticleDef}
 */
function buildArticleFromJson_(articleJson, element, location) {
  if (!articleJson['title'] || !articleJson['url']) {
    user().error(TAG,
        'Articles must contain `title` and `url` fields, skipping invalid.');
    return null;
  }

  user().assert(isProtocolValid(articleJson['url']),
      `Unsupported protocol for article URL ${articleJson['url']}`);
  dev().assert(articleJson['url']);

  const url = Services.urlForDoc(element);
  const {host} = url.parse(url.getSourceOrigin(location));
  const article = {
    title: dev().assert(articleJson['title']),
    url: articleJson['url'],
    domainName: host,
  };

  if (articleJson['image']) {
    user().assert(isProtocolValid(articleJson['image']),
        `Unsupported protocol for article image URL ${articleJson['image']}`);
    article.image = dev().assert(articleJson['image']);
  }

  return /** @type {!RelatedArticleDef} */ (article);
}


/**
 * @param {!Element} element
 * @param {!Location} location
 * @param {!JsonObject=} opt_articleSetsResponse
 * @return {!Array<!RelatedArticleSetDef>}
 */
export function relatedArticlesFromJson(element, location,
  opt_articleSetsResponse) {
  return /** @type {!Array<!RelatedArticleSetDef>} */ (
    Object.keys(opt_articleSetsResponse || {}).map(headingKey => {
      const articleSet = {
        articles:
              opt_articleSetsResponse[headingKey].map(
                  function(article) {
                    return buildArticleFromJson_(article, element, location);
                  }
              ).filter(valid => !!valid),
      };

      if (headingKey.trim().length) {
        articleSet.heading = headingKey;
      }

      return /** @type {!RelatedArticleSetDef} */ (articleSet);
    }));
}

/**
 * @param {!Array<!JsonObject>} bookendComponents
 * @param {!Element} element
 * @param {!Location} location
 * @return {!Array<!RelatedArticleSetDef>}
 */
export function parseArticlesToClassicApi(bookendComponents, element,
  location) {
  const articleSet = {};
  articleSet.articles = [];

  bookendComponents.forEach(component => {
    if (component['type'] == 'small') {
      articleSet.articles.push(buildArticleFromJson_(component, element,
          location));
    } else if (NEW_COMPONENTS.includes(component['type'])) {
      user().warn(TAG, component['type'] + ' is not supported in ' +
      'amp-story-0.1, upgrade to v1.0 to use this feature.');
    } else {
      user().warn(TAG, component['type'] + ' is not valid, ' +
      'skipping invalid.');
    }
  });

  const articles = [];
  articles.push(articleSet);
  return articles;
}
