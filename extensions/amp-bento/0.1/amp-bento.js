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
import {Layout} from '../../../src/layout';
import {PreactBaseElement} from '../../../src/preact/base-element';
import {Services} from '../../../src/services';
import {BentoComponent, CustomContext} from './component';
import {dict} from '../../../src/utils/object';
import {toggle} from '../../../src/style';
import {user, userAssert} from '../../../src/log';

/** @const {string} */
const TAG = 'amp-bento';

class AmpBento extends PreactBaseElement {
  /** @override */
  init() {
    return dict({});
  }

  /** @override */
  isLayoutSupported() {
    return true;
  }
}

/** @override */
AmpBento['Component'] = BentoComponent;

/** @override */
AmpBento['props'] = {
  'type': {attr: 'type'},
  'id': {attr: 'id'},
  'renderable': {attr: 'renderable', type: 'boolean'},
  'playable': {attr: 'playable', type: 'boolean'},
};

AmpBento['passthrough'] = true;

AmpBento['exportContexts'] = [CustomContext];
AmpBento['useContexts'] = [CustomContext];

AMP.extension(TAG, '0.2', (AMP) => {
  AMP.registerElement(TAG, AmpBento);
});
