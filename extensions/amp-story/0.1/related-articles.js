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
import {devAssert, user, userAssert} from '../../../src/log';
import {
  getSourceOrigin,
  isProtocolValid,
  parseUrlDeprecated,
} from '../../../src/url';

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
const NEW_COMPONENTS = [
  'landscape',
  'portrait',
  'cta-link',
  'heading',
  'textbox',
];

/**
 * @param {!JsonObject} articleJson
 * @return {?RelatedArticleDef}
 */
function buildArticleFromJson_(articleJson) {
  if (!articleJson['title'] || !articleJson['url']) {
    user().error(
      TAG,
      'Articles must contain `title` and `url` fields, skipping invalid.'
    );
    return null;
  }

  const articleUrl = devAssert(articleJson['url']);
  userAssert(
    isProtocolValid(articleUrl),
    `Unsupported protocol for article URL ${articleUrl}`
  );

  let domain;
  try {
    domain = parseUrlDeprecated(getSourceOrigin(articleUrl)).hostname;
  } catch (e) {
    // Unknown path prefix in url.
    domain = parseUrlDeprecated(articleUrl).hostname;
  }

  const article = {
    title: devAssert(articleJson['title']),
    url: articleUrl,
    domainName: domain,
  };

  if (articleJson['image']) {
    userAssert(
      isProtocolValid(articleJson['image']),
      `Unsupported protocol for article image URL ${articleJson['image']}`
    );
    article.image = devAssert(articleJson['image']);
  }

  return /** @type {!RelatedArticleDef} */ (article);
}

/**
 * @param {!JsonObject=} opt_articleSetsResponse
 * @return {!Array<!RelatedArticleSetDef>}
 */
export function relatedArticlesFromJson(opt_articleSetsResponse) {
  return /** @type {!Array<!RelatedArticleSetDef>} */ (Object.keys(
    opt_articleSetsResponse || {}
  ).map(headingKey => {
    const articleSet = {
      articles: opt_articleSetsResponse[headingKey]
        .map(buildArticleFromJson_)
        .filter(valid => !!valid),
    };

    if (headingKey.trim().length) {
      articleSet.heading = headingKey;
    }

    return /** @type {!RelatedArticleSetDef} */ (articleSet);
  }));
}

/**
 * @param {!Array<!JsonObject>} bookendComponents
 * @return {!Array<!RelatedArticleSetDef>}
 */
export function parseArticlesToClassicApi(bookendComponents) {
  const articleSet = {};
  articleSet.articles = [];

  bookendComponents.forEach(component => {
    if (component['type'] == 'small') {
      articleSet.articles.push(buildArticleFromJson_(component));
    } else if (NEW_COMPONENTS.includes(component['type'])) {
      user().warn(
        TAG,
        component['type'] +
          ' is not supported in ' +
          'amp-story-0.1, upgrade to v1.0 to use this feature.'
      );
    } else {
      user().warn(TAG, component['type'] + ' is not valid, skipping invalid.');
    }
  });

  const articles = [];
  articles.push(articleSet);
  return articles;
}
