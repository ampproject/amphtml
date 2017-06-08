/**
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
=======
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
>>>>>>> fix: add Apache License comment to src/amp-events.js
=======
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
>>>>>>> refactor: create separate Bind Events enum file
=======
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
>>>>>>> 8bc197821b7802c0b7796cf9fee34dbf9c658706
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
* Enum used to specify custom Amp Events
*
* @enum {string}
*/
export const AmpEvents = {
  VISIBILITY_CHANGE: 'amp:visibilitychange',
  TEMPLATE_RENDERED: 'amp:template-rendered',
  DOM_UPDATE: 'amp:dom-update',
  BUILT: 'amp:built',
  ATTACHED: 'amp:attached',
  STUBBED: 'amp:stubbed',
  LOAD_START: 'amp:load:start',
  LOAD_END: 'amp:load:end',
  ERROR: 'amp:error',
};
