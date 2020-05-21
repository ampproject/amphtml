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

import {PreactBaseElement} from '../../../src/preact/base-element';
import {Services} from '../../../src/services';
import {SocialShare} from './social-share';
import {dict} from '../../../src/utils/object';
import {getDataParamsFromAttributes} from '../../../src/dom';

/** @const {string} */
const TAG = 'amp-social-share';
const DEFAULT_BINDINGS = ['TITLE', 'CANONICAL_URL'];

class AmpSocialShare extends PreactBaseElement {
  /** @override */
  init() {
    const urlParams = getDataParamsFromAttributes(this.element);
    const urlReplacements = Services.urlReplacementsForDoc(this.element);
    urlReplacements.expandBindingsAsync(DEFAULT_BINDINGS).then((bindings) => {
      this.mutateProps(dict({'bindings': bindings}));
    });
    return {...urlParams};
  }
}

/** @override */
AmpSocialShare['Component'] = SocialShare;

/** @override */
AmpSocialShare['props'] = {
  'tabIndex': {attr: 'tabindex'},
  'type': {attr: 'type'},
};

AMP.extension(TAG, '1.0', (AMP) => {
  AMP.registerElement(TAG, AmpSocialShare);
});
