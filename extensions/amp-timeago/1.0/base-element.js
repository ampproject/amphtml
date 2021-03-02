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
import {Timeago} from './component';
import {parseDateAttrs as parseDateAttrsBase} from '../../../src/utils/date';

export class BaseElement extends PreactBaseElement {
  /** @override */
  updatePropsForRendering(props) {
    props['placeholder'] = props['children'];
  }
}

/** @override */
BaseElement['Component'] = Timeago;

/** @override */
BaseElement['layoutSizeDefined'] = true;

/** @override */
BaseElement['props'] = {
  'children': {passthroughNonEmpty: true},
  'cutoff': {attr: 'cutoff', type: 'number'},
  'datetime': {
    attrs: ['datetime', 'timestamp-ms', 'timestamp-seconds', 'offset-seconds'],
    parseAttrs: parseDateAttrs,
  },
  'locale': {attr: 'locale'},
};

/** @override */
BaseElement['usesShadowDom'] = true;

/**
 * @param {!Element} element
 * @return {?number}
 * @throws {UserError} when attribute values are missing or invalid.
 * @visibleForTesting
 */
export function parseDateAttrs(element) {
  return parseDateAttrsBase(element, [
    'datetime',
    'timestamp-ms',
    'timestamp-seconds',
  ]);
}
