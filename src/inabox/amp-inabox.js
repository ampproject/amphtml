/**
 * The entry point for AMP inabox runtime (inabox-v0.js).
 */

import '#polyfills';

import {TickLabel_Enum} from '#core/constants/enums';
import * as mode from '#core/mode';

import {Services} from '#service';
import {installDocService} from '#service/ampdoc-impl';
import {
  installBuiltinElements,
  installRuntimeServices,
} from '#service/core-services';
import {stubElementsForDoc} from '#service/custom-element-registry';
import {Navigation} from '#service/navigation';
import {installPerformanceService} from '#service/performance-impl';
import {installPlatformService} from '#service/platform-impl';

import {installAmpdocServicesForInabox} from './inabox-services';
import {maybeRenderInaboxAsStoryAd} from './inabox-story-ad';
import {getA4AId, registerIniLoadListener} from './utils';

import {cssText as ampSharedCss} from '../../build/ampshared.css';
import {allowLongTasksInChunking, startupChunk} from '../chunk';
import {installErrorReporting} from '../error-reporting';
import {fontStylesheetTimeout} from '../font-stylesheet-timeout';
import {doNotTrackImpression} from '../impression';
import {getMode} from '../mode';
import {adopt} from '../runtime';
import {
  installStylesForDoc,
  makeBodyVisible,
  makeBodyVisibleRecovery,
} from '../style-installer';
import {maybeValidate} from '../validator-integration';

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
  perf.tick(TickLabel_Enum.INSTALL_STYLES);

  self.document.documentElement.classList.add('i-amphtml-inabox');
  installStylesForDoc(
    ampdoc,
    // TODO: Can this be eliminated in ESM mode?
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
          maybeRenderInaboxAsStoryAd(ampdoc);
          maybeValidate(self);
          makeBodyVisible(self.document);
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
    `Powered by AMP ⚡ HTML – Version ${mode.version()}`,
    self.location.href
  );
}
self.document.documentElement.setAttribute('amp-version', mode.version());
