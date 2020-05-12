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

import '../polyfills.js';
import {Navigation} from '../service/navigation.js';
import {Services} from '../services.js';
import {adopt} from '../runtime.js';
import {allowLongTasksInChunking, startupChunk} from '../chunk.js';
import {cssText as ampSharedCss} from '../../build/ampshared.css.js';
import {doNotTrackImpression} from '../impression.js';
import {fontStylesheetTimeout} from '../font-stylesheet-timeout.js';
import {getA4AId, registerIniLoadListener} from './utils.js';
import {getMode} from '../mode.js';
import {installAmpdocServicesForInabox} from './inabox-services.js';
import {
  installBuiltinElements,
  installRuntimeServices,
} from '../service/core-services.js';
import {installDocService} from '../service/ampdoc-impl.js';
import {installErrorReporting} from '../error.js';
import {installPerformanceService} from '../service/performance-impl.js';
import {installPlatformService} from '../service/platform-impl.js';
import {
  installStylesForDoc,
  makeBodyVisible,
  makeBodyVisibleRecovery,
} from '../style-installer.js';
import {internalRuntimeVersion} from '../internal-version.js';
import {maybeValidate} from '../validator-integration.js';
import {stubElementsForDoc} from '../service/custom-element-registry.js';

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
allowLongTasksInChunking();
startupChunk(self.document, function initial() {
  /** @const {!../service/ampdoc-impl.AmpDoc} */
  const ampdoc = ampdocService.getAmpDoc(self.document);
  installPlatformService(self);
  installPerformanceService(self);
  /** @const {!../service/performance-impl.Performance} */
  const perf = Services.performanceFor(self);
  perf.tick('is');

  self.document.documentElement.classList.add('i-amphtml-inabox');
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
