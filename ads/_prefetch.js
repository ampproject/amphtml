/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
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

/**
 * URLs to prefetch for a given ad type.
 *
 * This MUST be kept in sync with actual implementation.
 *
 * @const {!Object<string, (string|!Array<string>)>}
 */
export const adPrefetch = {
  doubleclick: 'https://www.googletagservices.com/tag/js/gpt.js',
  a9: 'https://c.amazon-adsystem.com/aax2/assoc.js',
  adsense: 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js',
};

/**
 * URLs to connect to for a given ad type.
 *
 * This MUST be kept in sync with actual implementation.
 *
 * @const {!Object<string, (string|!Array<string>)>}
 */
export const adPreconnect = {
  adreactor: 'https://adserver.adreactor.com',
  adsense: 'https://googleads.g.doubleclick.net',
  doubleclick: [
    'https://partner.googleadservices.com',
    'https://securepubads.g.doubleclick.net',
    'https://tpc.googlesyndication.com',
  ],
};
