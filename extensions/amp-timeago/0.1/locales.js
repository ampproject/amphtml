/**
 * Copyright 2021 The AMP HTML Authors. All Rights Reserved.
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
 * This file registers all necessary locales supported by amp-timeago.
 */

import * as timeago from 'timeago.js/dist/timeago.full.min.js';
import cs from 'timeago.js/esm/lang/cs.js';
import da from 'timeago.js/esm/lang/da.js';
import ka from 'timeago.js/esm/lang/ka.js';
import oc from 'timeago.js/esm/lang/oc.js';

const {format, register} = timeago.default || timeago;
export {format};

/**
 * timeago.full.min.js only contains the following 41 locales:
 * ar, be, bg, bn_IN, ca, de, el, en_short, en_US, es, eu, fa, fi, fr, gl, he,
 * hi_IN, hu, id_ID, it, ja, ko, ml, my, nb_NO, nl, nn_NO, pl, pt_BR, ro, ru,
 * sq, sr, sv, ta, th, tr, uk, vi, zh_CN, zh_TW
 *
 * Register the rest to create full support for the 46 languages
 * provided by the timeago.js library.
 *
 * TODO(wg-components): These can be removed once all the languages are
 * exported in timeago.js. See https://github.com/hustcc/timeago.js/issues/238.
 */
register('cs', cs);
register('da', da);
register('ka', ka);
register('oc', oc);

/**
 * timeago.full.min.js registers some locales in a different format than what
 * is currently supported by amp-timeago. For backwards compatibility, the
 * following additional locale formats are converted to their registered type.
 * @param {string} locale
 * @return {string}
 */
export function getLocale(locale) {
  switch (locale) {
    case 'en':
      return 'en_US';
    case 'enShort':
      return 'en_short';
    case 'inBG':
      return 'bn_IN';
    case 'inID':
      return 'id_ID';
    case 'inHI':
      return 'hi_IN';
    case 'nbNO':
      return 'nb_NO';
    case 'nnNO':
      return 'nn_NO';
    case 'ptBR':
      return 'pt_BR';
    case 'zhCN':
      return 'zh_CN';
    case 'zhTW':
      return 'zh_TW';
    default:
      // Note: This line both supports en_Short -> en_short, and consequently
      // invalidates default formatting provided by timeago.js. i.e. "zh_CN"
      // locale value will not work as it becomes "zh_cn", and the
      // registration is case sensitive. If we want to expand the set of
      // supported formats to those that are already supported by the
      // timeago.js library, we should remove `toLocaleLowerCase`.
      return locale.toLocaleLowerCase();
  }
}
