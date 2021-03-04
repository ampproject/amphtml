/**
 * Copyright __current_year__ The AMP HTML Authors. All Rights Reserved.
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

import {CSS as COMPONENT_CSS} from './component.jss';
import {__component_name_pascalcase__} from './component';
import {PreactBaseElement} from '../../../src/preact/base-element';

export class BaseElement extends PreactBaseElement {}

/** @override */
BaseElement['Component'] = __component_name_pascalcase__;

/** @override */
BaseElement['props'] = {
  'children': {passthrough: true},
  // 'children': {passthroughNonEmpty: true},
  // 'children': {selector: '...'},
};

/** @override */
BaseElement['layoutSizeDefined'] = true;

/** @override */
BaseElement['usesShadowDom'] = true;

/** @override */
BaseElement['shadowCss'] = COMPONENT_CSS;
