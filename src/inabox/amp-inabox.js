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
import {TickLabel} from '../enums';
import {adopt} from '../runtime';
import {allowLongTasksInChunking, startupChunk} from '../chunk';
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
import {maybeRenderInaboxAsStoryAd} from './inabox-story-ad';
import {maybeValidate} from '../validator-integration';
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
allowLongTasksInChunking();
startupChunk(self.document, function initial() {
  /** @const {!../service/ampdoc-impl.AmpDoc} */
  const ampdoc = ampdocService.getAmpDoc(self.document);
  installPlatformService(self);
  installPerformanceService(self);
  /** @const {!../service/performance-impl.Performance} */
  const perf = Services.performanceFor(self);
  perf.tick(TickLabel.INSTALL_STYLES);

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
          // eslint-disable-next-line no-undef
          if (STORY_AD_INABOX) {
            maybeRenderInaboxAsStoryAd(ampdoc);
          }
          maybeValidate(self);
          makeBodyVisible(self.document);
        },
        /* makes the body visible */ true
      );
      startupChunk(self.document, function finalTick() {
        perf.tick(TickLabel.END_INSTALL_STYLES);
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
