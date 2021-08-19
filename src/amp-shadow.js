/**
 * The entry point for AMP Runtime (v0.js) when AMP Runtime may support
 * multiple AMP Docs in Shadow DOM.
 */

// src/polyfills.js must be the first import.
import './polyfills';

import * as mode from '#core/mode';

import {installDocService} from '#service/ampdoc-impl';
import {
  installBuiltinElements,
  installRuntimeServices,
} from '#service/core-services';

import {deactivateChunking} from './chunk';
import {doNotTrackImpression} from './impression';
import {adoptShadowMode} from './runtime';
import {bodyAlwaysVisible} from './style-installer';

// This feature doesn't make sense in shadow mode as it only applies to
// background rendered iframes;
deactivateChunking();

// Declare that this runtime will support multiple shadow-root docs.
installDocService(self, /* isSingleDoc */ false);

// Core services.
installRuntimeServices(self);

// Impression tracking for PWA is not meaningful, but the dependent code
// has to be unblocked.
doNotTrackImpression();

// PWA shell manages its own visibility and shadow ampdocs their own.
bodyAlwaysVisible(self);

// Builtins.
installBuiltinElements(self);

// Final configuration and stubbing.
adoptShadowMode(self);

// Output a message to the console and add an attribute to the <html>
// tag to give some information that can be used in error reports.
// (At least by sophisticated users).
if (self.console) {
  (console.info || console.log).call(
    console,
    `Powered by AMP ⚡ HTML shadows – Version ${mode.version()}`
  );
}
self.document.documentElement.setAttribute('amp-version', mode.version());
