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

import {Iframe} from './component';
import {PreactBaseElement} from '#preact/base-element';

export class BaseElement extends PreactBaseElement {}

/** @override */
BaseElement['Component'] = Iframe;

/** @override */
BaseElement['props'] = {
  'src': {attr: 'src'},
  'srcdoc': {attr: 'srcdoc'},
  'sandbox': {attr: 'sandbox'},
  'allowFullScreen': {attr: 'allowfullscreen'},
  'allowPaymentRequest': {attr: 'allowpaymentrequest'},
  'allowTransparency': {attr: 'allowtransparency'},
  'referrerPolicy': {attr: 'referrerpolicy'},
};

/** @override */
BaseElement['layoutSizeDefined'] = true;
