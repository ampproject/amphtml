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

import {installStylesForDoc} from '../../style-installer';
// Source for this constant is css/video-autoplay.css
import {cssText} from '../../../build/video-autoplay.css';

/**
 * @param  {!../ampdoc-impl.AmpDoc} ampdoc
 */
export function installAutoplayStylesForDoc(ampdoc) {
  installStylesForDoc(
    ampdoc,
    cssText,
    /* callback */ null,
    /* opt_isRuntimeCss */ false,
    /* opt_ext */ 'amp-video-autoplay'
  );
}
