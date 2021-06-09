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

import {PreactBaseElement} from '../../../src/preact/base-element';
import {Services} from '../../../src/services';
import {Soundcloud} from './component';

export class BaseElement extends PreactBaseElement {
  /** @override @nocollapse */
  static R1() {
    // Required to execute 'preconnectCallback'
    return false;
  }

  /**
   * @param {boolean=} opt_onLayout
   * @override
   */
  preconnectCallback(opt_onLayout) {
    Services.preconnectFor(this.win).url(
      this.getAmpDoc(),
      'https://api.soundcloud.com/',
      opt_onLayout
    );
  }
}

/** @override */
BaseElement['Component'] = Soundcloud;

/** @override */
BaseElement['props'] = {
  'children': {passthrough: true},
  'color': {attr: 'data-color'},
  'height': {attr: 'height'},
  'heights': {attr: 'heights'},
  'media': {attr: 'media'},
  'playlistId': {attr: 'data-playlistid'},
  'secretToken': {attr: 'data-secret-token'},
  'sizes': {attr: 'sizes'},
  'trackId': {attr: 'data-trackid'},
  'visual': {attr: 'data-visual'},
  'width': {attr: 'width'},
};

/** @override */
BaseElement['layoutSizeDefined'] = true;

/** @override */
BaseElement['usesShadowDom'] = true;
