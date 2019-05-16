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

export const GOOGLEADWORDS_CONFIG = /** @type {!JsonObject} */ ({
  // https://developers.google.com/adwords/amp/landing-pages
  'requests': {
    'conversion_prefix': 'https://www.googleadservices.com/pagead/conversion/',
    'remarketing_prefix':
      'https://googleads.g.doubleclick.net/pagead/viewthroughconversion/',
    'common_params':
      '${googleConversionId}/?' +
      'cv=amp2&' + // Increment when making changes.
      'label=${googleConversionLabel}&' +
      'random=${random}&' +
      'url=${sourceUrl}&' +
      'ref=${documentReferrer}&' +
      'fst=${pageViewId}&' +
      'num=${counter(googleadwords)}&' +
      'fmt=3&' +
      'async=1&' +
      'u_h=${screenHeight}&u_w=${screenWidth}&' +
      'u_ah=${availableScreenHeight}&u_aw=${availableScreenWidth}&' +
      'u_cd=${screenColorDepth}&' +
      'u_tz=${timezone}&' +
      'tiba=${title}&' +
      'guid=ON&script=0',
    'conversion_params':
      'value=${googleConversionValue}&' +
      'currency_code=${googleConversionCurrency}&' +
      'bg=${googleConversionColor}&' +
      'hl=${googleConversionLanguage}',
    'conversion': '${conversion_prefix}${common_params}&${conversion_params}',
    'remarketing': '${remarketing_prefix}${common_params}',
  },
  'transport': {
    'beacon': false,
    'xhrpost': false,
    'image': true,
  },
});
