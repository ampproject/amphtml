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

import {AmpEvents} from '../../../src/amp-events';
import {createCustomEvent} from '../../../src/event-helper';
import {dev, devAssert} from '../../../src/log';
import {removeChildren} from '../../../src/dom';
import {useResourcesNotify} from '../../../src/preact/utils';

/**
 * Clears the host element and appends the DOM tree into it.
 *
 * @param {!DateDisplayDef.RenderDomTreeProps} props
 * @return {?PreactDef.Renderable}
 */
export function RenderDomTree({dom, host}) {
  useResourcesNotify();

  removeChildren(dev().assertElement(host));
  if (dom) {
    host.appendChild(dom);
  }

  const event = createCustomEvent(
    devAssert(host.ownerDocument.defaultView),
    AmpEvents.DOM_UPDATE,
    /* detail */ null,
    {bubbles: true}
  );
  host.dispatchEvent(event);

  return null;
}
