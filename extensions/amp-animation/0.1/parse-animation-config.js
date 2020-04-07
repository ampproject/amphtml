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
import {childElementByTag} from '../../../src/dom';
import {tryParseJson} from '../../../src/json';
import {user, userAssert} from '../../../src/log';

/**
 * @param {!Element} element
 * @return {?JsonObject}
 */
export function parseAmpAnimationConfig(element) {
  const {textContent} = userAssert(
    childElementByTag(element, 'script'),
    '"<script type=application/json>" must be present'
  );
  return tryParseJson(textContent, (error) => {
    throw user().createError('failed to parse animation script', error);
  });
}
