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

import {Observable} from '../../../src/observable';

/**
 * @typedef {{
 *   form: !HTMLFormElement,
 *   actionXhrMutator: function(string)
 * }}
 */
export let FormSubmitEventDef;

export class FormSubmitService {
  /**
   * Global service used to register callbacks we wish to execute when an
   * amp-form is submitted.
   */
  constructor() {
    this.observable_ = new Observable();
  }

  /**
   * Used to register callbacks.
   * @param {function(!FormSubmitEventDef)} cb
   * @return {!UnlistenDef}
   */
  beforeSubmit(cb) {
    return this.observable_.add(cb);
  }

  /**
   * Fired when form is submitted.
   * @param {!FormSubmitEventDef} event
   */
  fire(event) {
    this.observable_.fire(event);
  }
}
