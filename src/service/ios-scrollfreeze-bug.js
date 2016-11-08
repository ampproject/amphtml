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

import {platformFor} from '../platform';
import {viewerForDoc} from '../viewer';
import {vsyncFor} from '../vsync';
import {setStyle} from '../style';


/**
 * An ugly fix for iOS Safari version 7 and 8 problem with the scrolling
 * freezes completely on initialization. Unfortunately there's no a sure
 * way to recognize that the scrolling is frozen, so the fix has to be
 * executed in either case for the applicable situation, which is: iOS Safari
 * and version < 9 and "b29185497" viewer parameter is provided. The fix
 * itself is to force the document-wide relayout. The fix does not introduce
 * FOUC, but does consume resources to perform relayout itself.
 *
 * See #3481 for more details.
 *
 * @param {!./ampdoc-impl.AmpDoc} ampdoc
 * @param {!../service/platform-impl.Platform=} opt_platform
 * @param {!./viewer-impl.Viewer=} opt_viewer
 * @param {!./vsync-impl.Vsync=} opt_vsync
 * @return {?Promise}
 * @package
 */
export function checkAndFix(ampdoc, opt_platform, opt_viewer, opt_vsync) {
  /** @const {!Window} */
  const win = ampdoc.win;
  /** @const {!./platform-impl.Platform} */
  const platform = opt_platform || platformFor(win);
  /** @const {!./viewer-impl.Viewer} */
  const viewer = opt_viewer || viewerForDoc(ampdoc);
  /** @const {!./vsync-impl.Vsync} */
  const vsync = opt_vsync || vsyncFor(win);
  if (!platform.isIos() || !platform.isSafari() ||
          platform.getMajorVersion() > 8 ||
          viewer.getParam('b29185497') != '1') {
    return null;
  }
  return new Promise(resolve => {
    // Reset `bottom` CSS. This will force the major relayout.
    vsync.mutate(() => {
      setStyle(win.document.body, 'bottom', '');
      vsync.mutate(() => {
        setStyle(win.document.body, 'bottom', '0px');
        resolve();
      });
    });
  });
}
