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

import './polyfills';

import {historyFor} from './history';
import {viewerFor} from './viewer';
import {installPullToRefreshBlocker} from './pull-to-refresh';

import {installAd} from '../builtins/amp-ad';
import {installGlobalClickListener} from './document-click';
import {installImg} from '../builtins/amp-img';
import {installVideo} from '../builtins/amp-video';
import {installPixel} from '../builtins/amp-pixel';
import {installStyles, makeBodyVisible} from './styles';
import {installErrorReporting} from './error';
import {stubElements} from './custom-element';
import {adopt} from './runtime';
import {cssText} from '../build/css.js';
import {action} from './action';
import {maybeValidate} from './validator-integration';

// We must under all circumstances call makeBodyVisible.
// It is much better to have AMP tags not rendered than having
// a completely blank page.
try {
  // Should happen first.
  installErrorReporting(window);  // Also calls makeBodyVisible on errors.
  installStyles(document, cssText, () => {

    try {
      historyFor(window);
      viewerFor(window);

      installImg(window);
      installAd(window);
      installPixel(window);
      installVideo(window);

      adopt(window);
      stubElements(window);
      action.addEvent('tap');

      installPullToRefreshBlocker(window);
      installGlobalClickListener(window);

      maybeValidate(window);
    } finally {
      makeBodyVisible(document);
    }
  }, /* opt_isRuntimeCss */ true);
} catch (e) {
  // In case of an error call this.
  makeBodyVisible(document);
  throw e;
}

// Output a message to the console and add an attribute to the <html>
// tag to give some information that can be used in error reports.
// (At least by sophisticated users).
if (window.console) {
  (console.info || console.log).call(console,
      'Powered by AMP ⚡ HTML – Version $internalRuntimeVersion$');
}
document.documentElement.setAttribute('amp-version',
      '$internalRuntimeVersion$');
