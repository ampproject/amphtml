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
 * The entry point for AMP Runtime (v0.js) when AMP Runtime may support
 * multiple AMP Docs in Shadow DOM.
 */

import './polyfills';

import {installDocService} from './service/ampdoc-impl';
import {
  adoptShadowMode,
  installBuiltins,
  installRuntimeServices,
} from './runtime';
import {bodyAlwaysVisible} from './style-installer';
import {deactivateChunking} from './chunk';
import {doNotTrackImpression} from './impression';
import {stubElements} from './custom-element';


// PWA shell manages its own visibility and shadow ampdocs their own.
bodyAlwaysVisible(self);

// This feature doesn't make sense in shadow mode as it only applies to
// background rendered iframes;
deactivateChunking();

// Declare that this runtime will support multiple shadow-root docs.
installDocService(self, /* isSingleDoc */ false);

// Core services.
installRuntimeServices(self);

// Impression tracking for PWA is not meaningful, but the dependent code
// has to be unblocked.
doNotTrackImpression(self);

// Builtins.
installBuiltins(self);

// Final configuration and stubbing.
adoptShadowMode(self);
stubElements(self);

// Output a message to the console and add an attribute to the <html>
// tag to give some information that can be used in error reports.
// (At least by sophisticated users).
if (self.console) {
  (console.info || console.log).call(console,
      'Powered by AMP ⚡ HTML shadows – Version $internalRuntimeVersion$');
}
self.document.documentElement.setAttribute('amp-version',
      '$internalRuntimeVersion$');
