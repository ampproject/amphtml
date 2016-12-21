/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
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
import {AmpContext} from './ampcontext.js';
import {initLogConstructor} from '../src/log';
initLogConstructor();


/**
 *  If window.context does not exist, we must instantiate a replacement and
 *  assign it to window.context, to provide the creative with all the required
 *  functionality.
 */
try {
  const windowContextCreated = new Event('amp-windowContextCreated');
  window.context = new AmpContext(window);
  // Allows for pre-existence, consider validating correct window.context lib instance?
  window.dispatchEvent(windowContextCreated);
} catch (err) {
  // do nothing with error
}
