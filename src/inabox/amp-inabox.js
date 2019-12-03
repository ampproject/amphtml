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

/**
 * The entry point for AMP inabox runtime (inabox-v0.js).
 */

import '../polyfills';
import {Navigation} from '../service/navigation';
import {Services} from '../services';
import {adopt} from '../runtime';
import {cssText as ampSharedCss} from '../../build/ampshared.css';
import {doNotTrackImpression} from '../impression';
import {fontStylesheetTimeout} from '../font-stylesheet-timeout';
import {getA4AId, registerIniLoadListener} from './utils';
import {getMode} from '../mode';
import {installAmpdocServicesForInabox} from './inabox-services';
import {
  installBuiltinElements,
  installRuntimeServices,
} from '../service/core-services';
import {installDocService} from '../service/ampdoc-impl';
import {installErrorReporting} from '../error';
import {installPerformanceService} from '../service/performance-impl';
import {installPlatformService} from '../service/platform-impl';
import {
  installStylesForDoc,
  makeBodyVisible,
  makeBodyVisibleRecovery,
} from '../style-installer';
import {internalRuntimeVersion} from '../internal-version';
import {maybeValidate} from '../validator-integration';
import {startupChunk} from '../chunk';
import {stubElementsForDoc} from '../service/custom-element-registry';

getMode(self).runtime = 'inabox';
getMode(self).a4aId = getA4AId(self);

// TODO(lannka): only install the necessary services.

/** @type {!../service/ampdoc-impl.AmpDocService} */
let ampdocService;
// We must under all circumstances call makeBodyVisible.
// It is much better to have AMP tags not rendered than having
// a completely blank page.
try {
  // Should happen first.
  installErrorReporting(self); // Also calls makeBodyVisibleRecovery on errors.

  // Declare that this runtime will support a single root doc. Should happen
  // as early as possible.
  installDocService(self, /* isSingleDoc */ true);
  ampdocService = Services.ampdocServiceFor(self);
} catch (e) {
  // In case of an error call this.
  makeBodyVisibleRecovery(self.document);
  throw e;
}
startupChunk(self.document, function initial() {
  /** @const {!../service/ampdoc-impl.AmpDoc} */
  const ampdoc = ampdocService.getAmpDoc(self.document);
  installPlatformService(self);
  installPerformanceService(self);
  /** @const {!../service/performance-impl.Performance} */
  const perf = Services.performanceFor(self);
  perf.tick('is');

  self.document.documentElement.classList.add(
    'i-amphtml-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'
  );
  installStylesForDoc(
    ampdoc,
    ampSharedCss +
      'html.i-amphtml-inabox{width:100%!important;height:100%!important}',
    () => {
      startupChunk(self.document, function services() {
        // Core services.
        installRuntimeServices(self);
        fontStylesheetTimeout(self);
        installAmpdocServicesForInabox(ampdoc);
        // We need the core services (viewer/resources) to start instrumenting
        perf.coreServicesAvailable();
        doNotTrackImpression();
        registerIniLoadListener(ampdoc);
      });
      startupChunk(self.document, function builtins() {
        // Builtins.
        installBuiltinElements(self);
      });
      startupChunk(self.document, function adoptWindow() {
        adopt(self);
      });
      startupChunk(self.document, function stub() {
        // Pre-stub already known elements.
        stubElementsForDoc(ampdoc);
      });
      startupChunk(
        self.document,
        function final() {
          Navigation.installAnchorClickInterceptor(ampdoc, self);
          maybeValidate(self);
          makeBodyVisible(self.document);
        },
        /* makes the body visible */ true
      );
      startupChunk(self.document, function finalTick() {
        perf.tick('e_is');
        Services.resourcesForDoc(ampdoc).ampInitComplete();
        // TODO(erwinm): move invocation of the `flush` method when we have the
        // new ticks in place to batch the ticks properly.
        perf.flush();
      });
    },
    /* opt_isRuntimeCss */ true,
    /* opt_ext */ 'amp-runtime'
  );
});

// Output a message to the console and add an attribute to the <html>
// tag to give some information that can be used in error reports.
// (At least by sophisticated users).
if (self.console) {
  (console.info || console.log).call(
    console,
    `Powered by AMP ⚡ HTML – Version ${internalRuntimeVersion()}`,
    self.location.href
  );
}
self.document.documentElement.setAttribute(
  'amp-version',
  internalRuntimeVersion()
);
