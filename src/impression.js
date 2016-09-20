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

import {user} from './log';
import {isExperimentOn} from './experiments';
import {viewerFor} from './viewer';
import {xhrFor} from './xhr';


/**
 * Emit a HTTP request to a destination defined on the incoming URL.
 * Protected by experiment.
 * @param {!Window} win
 */
export function maybeTrackImpression(win) {
  if (!isExperimentOn(win, 'alp')) {
    return;
  }
  const viewer = viewerFor(win);
  const clickUrl = viewer.getParam('click');
  if (!clickUrl) {
    return;
  }
  if (clickUrl.indexOf('https://') != 0) {
    user().warn('Impression',
        'click fragment param should start with https://. Found ',
        clickUrl);
    return;
  }
  if (win.location.hash) {
    // This is typically done using replaceState inside the viewer.
    // If for some reason it failed, get rid of the fragment here to
    // avoid duplicate tracking.
    win.location.hash = '';
  }
  viewer.whenFirstVisible().then(() => {
    invoke(win, clickUrl);
  });
}

function invoke(win, clickUrl) {
  xhrFor(win).fetchJson(clickUrl, {
    credentials: 'include',
    requireAmpResponseSourceOrigin: true,
  });
  // TODO(@cramforce): Do something with the result.
}
