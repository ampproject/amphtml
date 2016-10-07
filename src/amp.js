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

/**
 * The entry point for AMP Runtime (v0.js) when AMP Runtime = AMP Doc.
 */

import './polyfills';
import {installPerformanceService} from './service/performance-impl';
import {installPullToRefreshBlocker} from './pull-to-refresh';
import {installGlobalClickListenerForDoc} from './document-click';
import {installStyles, makeBodyVisible} from './style-installer';
import {installErrorReporting} from './error';
import {installDocService} from './service/ampdoc-impl';
import {installCacheServiceWorker} from './service-worker/install';
import {stubElements} from './custom-element';
import {
  installAmpdocServices,
  installBuiltins,
  installRuntimeServices,
  adopt,
} from './runtime';
import {cssText} from '../build/css';
import {maybeValidate} from './validator-integration';
import {maybeTrackImpression} from './impression';

// We must under all circumstances call makeBodyVisible.
// It is much better to have AMP tags not rendered than having
// a completely blank page.
try {
  // Should happen first.
  installErrorReporting(self);  // Also calls makeBodyVisible on errors.

  // Declare that this runtime will support a single root doc. Should happen
  // as early as possible.
  /** @const {!./service/ampdoc-impl.AmpDocService} */
  const ampdocService = installDocService(self, /* isSingleDoc */ true);
  /** @const {!./service/ampdoc-impl.AmpDoc} */
  const ampdoc = ampdocService.getAmpDoc(self.document);
  /** @const {!./service/performance-impl.Performance} */
  const perf = installPerformanceService(self);
  perf.tick('is');
  installStyles(self.document, cssText, () => {
    try {
      // Core services.
      installRuntimeServices(self);
      installAmpdocServices(ampdoc);
      // We need the core services (viewer/resources) to start instrumenting
      perf.coreServicesAvailable();
      maybeTrackImpression(self);

      // Builtins.
      installBuiltins(self);

      // Final configuration and stubbing.
      adopt(self);
      stubElements(self);

      installPullToRefreshBlocker(self);
      installGlobalClickListenerForDoc(ampdoc);

      maybeValidate(self);
      makeBodyVisible(self.document, /* waitForServices */ true);
      installCacheServiceWorker(self);
    } catch (e) {
      makeBodyVisible(self.document);
      throw e;
    } finally {
      perf.tick('e_is');
      // TODO(erwinm): move invocation of the `flush` method when we have the
      // new ticks in place to batch the ticks properly.
      perf.flush();
    }
  }, /* opt_isRuntimeCss */ true, /* opt_ext */ 'amp-runtime');
} catch (e) {
  // In case of an error call this.
  makeBodyVisible(self.document);
  throw e;
}

// Output a message to the console and add an attribute to the <html>
// tag to give some information that can be used in error reports.
// (At least by sophisticated users).
if (self.console) {
  (console.info || console.log).call(console,
      'Powered by AMP ⚡ HTML – Version $internalRuntimeVersion$');
}
self.document.documentElement.setAttribute('amp-version',
      '$internalRuntimeVersion$');
