/**
 * The entry point for AMP Runtime (v0.js) when AMP Runtime = AMP Doc.
 */

// src/polyfills.js must be the first import.
import './polyfills';

import {TickLabel_Enum} from '#core/constants/enums';
import {whenDocumentComplete} from '#core/document/ready';
import * as mode from '#core/mode';

import {Services} from '#service';
import {installDocService} from '#service/ampdoc-impl';
import {
  installAmpdocServices,
  installBuiltinElements,
  installRuntimeServices,
} from '#service/core-services';
import {stubElementsForDoc} from '#service/custom-element-registry';
import {installPerformanceService} from '#service/performance-impl';
import {installPlatformService} from '#service/platform-impl';

import {installAutoLightboxExtension} from './auto-lightbox';
import {startupChunk} from './chunk';
import {markUnresolvedElements} from './custom-element';
import {installErrorReporting} from './error-reporting';
import {fontStylesheetTimeout} from './font-stylesheet-timeout';
import {maybeTrackImpression} from './impression';
import {getMode} from './mode';
import {preconnectToOrigin} from './preconnect';
import {installPullToRefreshBlocker} from './pull-to-refresh';
import {adoptWithMultidocDeps} from './runtime';
import {installStandaloneExtension} from './standalone';
import {
  installStylesForDoc,
  makeBodyVisible,
  makeBodyVisibleRecovery,
} from './style-installer';
import {maybeValidate} from './validator-integration';

import {cssText as ampDocCss} from '../build/ampdoc.css';
import {cssText as ampSharedCss} from '../build/ampshared.css';

/**
 * Execute the bootstrap
 * @param {!./service/ampdoc-impl.AmpDoc} ampdoc
 * @param {!./service/performance-impl.Performance} perf
 */
function bootstrap(ampdoc, perf) {
  startupChunk(self.document, function services() {
    // Core services.
    installRuntimeServices(self);
    installAmpdocServices(ampdoc);
    // We need the core services (viewer/resources) to start instrumenting
    perf.coreServicesAvailable();
    maybeTrackImpression(self);
  });
  startupChunk(self.document, function adoptWindow() {
    adoptWithMultidocDeps(self);
  });
  startupChunk(self.document, function builtins() {
    // Builtins.
    installBuiltinElements(self);
  });
  startupChunk(self.document, function stub() {
    // Pre-stub already known elements.
    stubElementsForDoc(ampdoc);
    whenDocumentComplete(self.document).then(() => markUnresolvedElements());
  });
  startupChunk(
    self.document,
    function final() {
      if (!IS_SXG) {
        installPullToRefreshBlocker(self);
      }
      installAutoLightboxExtension(ampdoc);
      installStandaloneExtension(ampdoc);
      maybeValidate(self);
      makeBodyVisible(self.document);
      preconnectToOrigin(self.document);
    },
    /* makes the body visible */ true
  );
  startupChunk(self.document, function finalTick() {
    perf.tick(TickLabel_Enum.END_INSTALL_STYLES);
    Services.resourcesForDoc(ampdoc).ampInitComplete();
    // TODO(erwinm): move invocation of the `flush` method when we have the
    // new ticks in place to batch the ticks properly.
    perf.flush();
  });
}

// Store the originalHash as early as possible. Trying to debug:
// https://github.com/ampproject/amphtml/issues/6070
if (self.location) {
  self.location['originalHash'] = self.location.hash;
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
  installPlatformService(self);
  installPerformanceService(self);
  /** @const {!./service/performance-impl.Performance} */
  const perf = Services.performanceFor(self);
  if (mode.isEsm()) {
    perf.addEnabledExperiment('esm');
  }
  fontStylesheetTimeout(self);
  perf.tick(TickLabel_Enum.INSTALL_STYLES);
  if (mode.isEsm()) {
    bootstrap(ampdoc, perf);
    return;
  }

  installStylesForDoc(
    ampdoc,
    ampDocCss + ampSharedCss,
    () => bootstrap(ampdoc, perf),
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
    `Powered by AMP ⚡ HTML – Version ${mode.version()}`,
    self.location.href
  );
}
// This code is eleminated in prod build through a babel transformer.
if (getMode().localDev) {
  self.document.documentElement.setAttribute('esm', mode.isEsm() ? 1 : 0);
}
self.document.documentElement.setAttribute('amp-version', mode.version());
