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

// src/polyfills.js must be the first import.
import './polyfills'; // eslint-disable-line sort-imports-es6-autofix/sort-imports-es6

import {Services} from './services';
import {
  adopt,
  installAmpdocServices,
  installBuiltins,
  installRuntimeServices,
} from './runtime';
import {cssText as ampDocCss} from '../build/ampdoc.css';
import {cssText as ampElementCss} from '../build/ampshared.css';
import {fontStylesheetTimeout} from './font-stylesheet-timeout';
import {installAutoLightboxExtension} from './auto-lightbox';
import {installDocService} from './service/ampdoc-impl';
import {installErrorReporting} from './error';
import {installPerformanceService} from './service/performance-impl';
import {installPlatformService} from './service/platform-impl';
import {installPullToRefreshBlocker} from './pull-to-refresh';
import {
  installStylesForDoc,
  makeBodyVisible,
  makeBodyVisibleRecovery,
} from './style-installer';
import {internalRuntimeVersion} from './internal-version';
import {maybeTrackImpression} from './impression';
import {maybeValidate} from './validator-integration';
import {startupChunk} from './chunk';
import {stubElementsForDoc} from './service/custom-element-registry';

/**
 * self.IS_AMP_ALT (is AMP alternative binary) is undefined by default in the
 * main v0.js since it is the "main" js.
 * This global boolean is set by alternative binaries like amp-inabox and
 * amp-shadow which has their own bootstrapping sequence.
 * With how single pass works these alternative binaries cannot be generated
 * easily because we can only do a "single pass" so we treat these alternative
 * main binaries as "extensions" and we concatenate their code with the main
 * v0.js code.
 * @type {boolean|undefined}
 */
const shouldMainBootstrapRun = !self.IS_AMP_ALT;

if (shouldMainBootstrapRun) {
  // Store the originalHash as early as possible. Trying to debug:
  // https://github.com/ampproject/amphtml/issues/6070
  if (self.location) {
    self.location.originalHash = self.location.hash;
  }

  /** @type {!./service/ampdoc-impl.AmpDocService} */
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
    /** @const {!./service/ampdoc-impl.AmpDoc} */
    const ampdoc = ampdocService.getAmpDoc(self.document);
    installPerformanceService(self);
    /** @const {!./service/performance-impl.Performance} */
    const perf = Services.performanceFor(self);
    if (
      self.document.documentElement.hasAttribute('i-amphtml-no-boilerplate')
    ) {
      perf.addEnabledExperiment('no-boilerplate');
    }
    installPlatformService(self);
    fontStylesheetTimeout(self);
    perf.tick('is');
    installStylesForDoc(
      ampdoc,
      ampDocCss + ampElementCss,
      () => {
        startupChunk(self.document, function services() {
          // Core services.
          installRuntimeServices(self);
          installAmpdocServices(ampdoc);
          // We need the core services (viewer/resources) to start instrumenting
          perf.coreServicesAvailable();
          maybeTrackImpression(self);
        });
        startupChunk(self.document, function adoptWindow() {
          adopt(self);
        });
        startupChunk(self.document, function builtins() {
          // Builtins.
          installBuiltins(self);
        });
        startupChunk(self.document, function stub() {
          // Pre-stub already known elements.
          stubElementsForDoc(ampdoc);
        });
        startupChunk(self.document, function final() {
          installPullToRefreshBlocker(self);
          installAutoLightboxExtension(ampdoc);

          maybeValidate(self);
          makeBodyVisible(self.document);
        });
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
}
