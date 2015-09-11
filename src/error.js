/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
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


import {getMode} from './mode';


export function reportErrorToDeveloper(error) {
  if (!window.console) {
    return;
  }
  if (error.reported) {
    return;
  }
  error.reported = true;
  var element = error.associatedElement;
  if (element && getMode().development) {
    element.classList.add('-amp-element-error');
    element.setAttribute('error-message', error.message);
  }
  var log = console.error
      ? console.error.bind(console)
      : console.log.bind(console);
  if (error.messageArray) {
    (console.error || console.log).apply(console,
        error.messageArray);
  } else {
    (console.error || console.log).call(console, error.message);
  }
}
