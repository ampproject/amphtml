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
import {timeago} from '../../../third_party/timeagojs/timeago';
import { createElement } from 'preact';

/**
 * @param {!JsonObject} props
 * @return {Preact.Renderable}
 */
export function Timeago(props) {
  let content;
  if (props['cutoff']) {
    const cutoff = parseInt(props['cutoff'], 10);
    const elDate = new Date(props['datetime']);
    const secondsAgo = Math.floor((Date.now() - elDate.getTime()) / 1000);

    if (secondsAgo > cutoff) {
      content = props['init'];
    } else {
      content = timeago(props['datetime'], props['locale']);
    }
  } else {
    content = timeago(props['datetime'], props['locale']);
  }
  
  useResourcesNotify();
  return createElement('time', {datetime: props['datetime']}, content);
}
