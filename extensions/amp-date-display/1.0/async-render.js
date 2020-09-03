/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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

import {useResourcesNotify} from '../../../src/preact/utils';
import {useState} from '../../../src/preact';

/**
 * Renders the children prop, waiting for it to resolve if it is a promise.
 *
 * @param {!DateDisplayDef.AsyncRenderProps} props
 * @return {PreactDef.Renderable}
 */
export function AsyncRender({children}) {
  const [state, set] = useState(children);
  useResourcesNotify();

  if (state && state.then) {
    Promise.resolve(children).then(set);
    return null;
  }

  return state;
}
