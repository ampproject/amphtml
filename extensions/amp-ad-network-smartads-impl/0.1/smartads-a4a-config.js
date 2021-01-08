/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
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

/** @const @private {string} */
const SRC_PREFIX_ = 'https://smart-ads.biz/_amp';

/** @const @private {string} */
const SRC_A4A_PREFIX_ = 'https://smart-ads.biz/_a4a';

/**
 * @param {!Window} win
 * @param {!Element} element
 * @param {boolean} useRemoteHtml
 * @return {boolean}
 */
export function smartAdsIsA4AEnabled(win, element, useRemoteHtml) {
  const src = element.getAttribute('src');
  return (
    !useRemoteHtml &&
    !!src &&
    !!element.getAttribute('data-use-a4a') &&
    (src.startsWith(SRC_PREFIX_) || src.startsWith(SRC_A4A_PREFIX_))
  );
}
