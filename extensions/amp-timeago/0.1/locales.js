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

import * as timeago from 'timeago.js/lib/full.patched.js';
import cs from 'timeago.js/lib/lang/cs';
import da from 'timeago.js/lib/lang/da';
import ka from 'timeago.js/lib/lang/ka';
import oc from 'timeago.js/lib/lang/oc';

const {format, register} = timeago;
export {format};

/**
 * full.js only contains the following 41 locales:
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
