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
import {RE_NONALPHA, RE_WHITESPACE} from '../constants';
import {getDetailsForMeta} from './meta';
import {rot13Array} from './rot13';

const MAX_KEYWORD_LENGTH = 200;
const PORN_BIT = 0x1;
const REFERRER_BITS = {
  DIRECT: 0x0, // default: a direct view
  SEARCH: 0x1, // referrer was guessed to be from a search engine
  ON_DOMAIN: 0x2,
  OFF_DOMAIN: 0x4,
};
// eslint-disable-next-line max-len
const RE_SEARCH_TERMS = /^(?:q|search|bs|wd|p|kw|keyword|query|qry|querytext|text|searchcriteria|searchstring|searchtext|sp_q)=(.*)/i;
const RE_SEARCH_REFERRER = /ws\/results\/(web|images|video|news)/;
const RE_SEARCH_GOOGLE = /google.*\/(search|url|aclk|m\?)/;
const RE_SEARCH_AOL = /aol.*\/aol/;
const com = '.com/';
const org = '.org/';

// porn keywords, rot1313'd
const pornHash = rot13Array([
  'cbea',
  'cbeab',
  'kkk',
  'zvys',
  'gvgf',
  'shpxf',
  'chfflyvcf',
  'pernzcvr',
  'svfgvat',
  'wvmm',
  'fcybbtr',
  'flovna',
]);

// porn keywords that require delimiters (e.g., that can be substrings of
// benign, non-porn words)
const strictPornHash = rot13Array(['phz']);

/**
 * Classifies a string based on keywords. Currently only looks at porn.
 * @param {string} keywordString string of keywords (seperated by non alpha characters)
 * @param {boolean} nonStrictMatch true iff we can't use the list of strict keywords
 * @private
 */
const classifyString = (keywordString = '', nonStrictMatch = false) => {
  let classification = 0;
  const keywords = keywordString.toLowerCase().split(RE_NONALPHA);

  for (let i = 0; i < keywords.length; i++) {
    const keyword = keywords[i];
    if (pornHash[keyword] || (!nonStrictMatch && strictPornHash[keyword])) {
      classification |= PORN_BIT;
      break;
    }
  }

  return classification;
};

/**
 * Classify a meta RATING keyword.
 * @param {string} rating
 * @private
 */
const classifyRating = (rating = '') => {
  let classification = 0;

  rating = rating.toLowerCase().replace(RE_WHITESPACE, '');

  // Check if the rating is adult content
  if (rating === 'mature' ||
      rating === 'adult' ||
      rating === 'rta-5042-1996-1400-1577-rta') {
    classification |= PORN_BIT;
  }

  return classification;
};

/**
 * Add keywords to the page based on the content.
 * @param {string} content
 * @private
 */
const extractKeywordsFromContent = content => {
  const keywords = [];
  const contentSplit = content.split(',');
  let keywordsSize = 0;

  for (let i = 0; i < contentSplit.length; i++) {
    const keyword = (contentSplit[i] || '').trim();

    if (!keyword) {
      continue;
    }

    if (keyword.length + keywordsSize + 1 >= MAX_KEYWORD_LENGTH) {
      break;
    }

    keywords.push(keyword);
    keywordsSize += keyword.length + 1;
  }

  return keywords;
};

/**
 * Guesses the search value from an url using a list of known search keys
 * @param {string} url
 * @returns {string|undefined}
 */
const getSearchString = url => {
  const terms = url.split('?').pop().toLowerCase().split('&');
  let matches;

  for (let i = 0; i < terms.length; i++) {
    // the simple parameters we know about a priori
    matches = RE_SEARCH_TERMS.exec(terms[i]);
    if (matches) {
      return matches[1];
    }
  }

  return undefined;
};

/**
 * Return true if the url appears to be a search URL; false otherwise.
 * @param {string} url
 */
const isSearchUrl = (url = '') => {
  const lowerUrl = url.toLowerCase();

  // See if the referrer matches one of our simple heuristics
  if (lowerUrl.match(RE_SEARCH_REFERRER)) {
    return true;
  }

  if (getSearchString(url) === undefined) {
    return false;
  }

  return lowerUrl.indexOf('addthis') === -1 && (
    lowerUrl.match(RE_SEARCH_GOOGLE)
      || lowerUrl.match(RE_SEARCH_AOL) /* search.aol.* /aol/search?q=*/
      || lowerUrl.indexOf('/pagead/aclk?') > -1 /*googleadservices*/
      || lowerUrl.indexOf(com + 'url') > -1 /*bing*/
      || lowerUrl.indexOf(com + 'l.php') > -1 /*facebook graph search*/
      || lowerUrl.indexOf('/search?') > -1 /* many */
      || lowerUrl.indexOf('/search/?') > -1 /* a few */
      || lowerUrl.indexOf('search?') > -1 /*yandex.ru, and presumably others*/
      || lowerUrl.indexOf('yandex.ru/clck/jsredir?') > -1 /*yandex, no one else */
      || lowerUrl.indexOf(com + 'search') > -1 /* yahoo (including yahoo int'l), many others */
      || lowerUrl.indexOf(org + 'search') > -1 /*many .org searches*/
      || lowerUrl.indexOf('/search.html?') > -1 /* a few */
      || lowerUrl.indexOf('search/results.') > -1 /*cars.com, gmc.com*/
      || lowerUrl.indexOf(com + 's?bs') > -1 /*baidu*/
      || lowerUrl.indexOf(com + 's?wd') > -1 /*baidu*/
      || lowerUrl.indexOf(com + 'mb?search') > -1 /*manta*/
      || lowerUrl.indexOf(com + 'mvc/search') > -1 /*eonline*/
      || lowerUrl.indexOf(com + 'web') > -1 /*ask.com (same in .ca), altavista*/
      || lowerUrl.indexOf('hotbot' + com) > -1 /*hotbot*/
  );
};

/**
 * Classifies the present page based on title, hostname, meta keywords and meta description.
 * @param {*} pageInfo
 * @param {Array} metaElements
 * @returns {number} classification bitmask (currently only setting a porn bit)
 */
export const classifyPage = (pageInfo, metaElements) => {
  let bitmask = classifyString(pageInfo.title) |
      classifyString(pageInfo.hostname, true);

  metaElements.forEach(metaElement => {
    const {name, content} = getDetailsForMeta(metaElement);

    if (name === 'description' || name === 'keywords') {
      bitmask |= classifyString(content);
    }

    if (name === 'rating') {
      bitmask |= classifyRating(content);
    }
  });

  return bitmask;
};


/**
 * Returns bitmask based on detected classification
 * @param {string} referrerString
 * @param {*} parsedReferrer
 * @param {*} parsedHref
 * @returns {number}
 */
export const classifyReferrer = (
  referrerString,
  parsedReferrer,
  parsedHref
) => {
  // The default is a direct view.
  let bitmask = REFERRER_BITS.DIRECT;

  // If there was a referrer, try to categorize it
  if (referrerString && parsedReferrer) {
    // Compare domain only (SLD + TLD)
    if (parsedReferrer.host === parsedHref.host) {
      bitmask |= REFERRER_BITS.ON_DOMAIN;
    } else {
      bitmask |= REFERRER_BITS.OFF_DOMAIN;
    }

    // Run some naive checks to see if visitor came from a search.
    if (isSearchUrl(referrerString)) {
      bitmask |= REFERRER_BITS.SEARCH;
    }
  }

  return bitmask;
};

/**
 * Return true if the url appears to be a product page; false otherwise.
 * @param {Document} doc
 * @param {Array} metaElements
 * @returns {boolean}
 */
export const isProductPage = (doc, metaElements) => {
  if (doc.getElementById('product') ||
      (doc.getElementsByClassName('product') || []).length > 0 ||
      doc.getElementById('productDescription') ||
      doc.getElementById('page-product') ||
      doc.getElementById('vm_cart_products') ||
      window['Virtuemart']) {
    return true;
  }

  const ogTags = metaElements.reduce((tags, metaElement) => {
    const {name, content} = getDetailsForMeta(metaElement);

    if (name.startsWith('og:')) {
      const ogProperty = name.split(':').pop();
      tags[ogProperty] = content;
    }

    return tags;
  }, {});

  return ogTags.type === 'product';
};

/**
 * Gather the keywords gathered while classifying the page.
 * @param {Array} metaElements
 * @returns {string} csv containing keywords
 */
export const getKeywordsString = metaElements => {
  const keywords = metaElements
      .filter(meta => getDetailsForMeta(meta).name === 'keywords')
      .map(meta => extractKeywordsFromContent(getDetailsForMeta(meta).content))
      .reduce((kws, subKeywords) => kws.concat(subKeywords), []);

  return keywords.join(',');
};
