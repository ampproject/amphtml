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

import '../../third_party/babel/custom-babel-helpers';
import '../polyfills';
import {chunk} from '../chunk';
import {fontStylesheetTimeout} from '../font-stylesheet-timeout';
import {installStyles, makeBodyVisible} from '../style-installer';
import {installErrorReporting} from '../error';
import {installDocService} from '../service/ampdoc-impl';
import {stubElements} from '../custom-element';
import {
    installAmpdocServices,
    installBuiltins,
    installRuntimeServices,
    adopt,
} from '../runtime';
import {installViewerServiceForDoc} from '../service/viewer-impl';
import {installViewportServiceForDoc} from '../service/viewport-impl';
import {cssText} from '../../build/css';
import {maybeValidate} from '../validator-integration';
import {Inabox} from './inabox';
import {isExperimentOn} from '../experiments';

if (isExperimentOn(self, 'amp-inabox')) {
  new Inabox(self).init();
}

// TODO(lannka): only install the necessary services.

/** @type {!../service/ampdoc-impl.AmpDocService} */
let ampdocService;
// We must under all circumstances call makeBodyVisible.
// It is much better to have AMP tags not rendered than having
// a completely blank page.
try {
  // Should happen first.
  installErrorReporting(self);  // Also calls makeBodyVisible on errors.

  // Declare that this runtime will support a single root doc. Should happen
  // as early as possible.
  ampdocService = installDocService(self, /* isSingleDoc */ true);
} catch (e) {
  // In case of an error call this.
  makeBodyVisible(self.document);
  throw e;
}
chunk(self.document, function initial() {
  /** @const {!../service/ampdoc-impl.AmpDoc} */
  const ampdoc = ampdocService.getAmpDoc(self.document);

  installStyles(self.document, cssText, () => {
    chunk(self.document, function services() {
      // Core services.
      installRuntimeServices(self);
      fontStylesheetTimeout(self);

      // TODO: replace viewer impl and viewport impl.
      installViewerServiceForDoc(ampdoc);
      installViewportServiceForDoc(ampdoc);
      installAmpdocServices(ampdoc);
    });
    chunk(self.document, function builtins() {
      // Builtins.
      installBuiltins(self);
    });
    chunk(self.document, function adoptWindow() {
      adopt(self);
    });
    chunk(self.document, function stub() {
      stubElements(self);
    });
    chunk(self.document, function final() {
      maybeValidate(self);
      makeBodyVisible(self.document, /* waitForServices */ true);
    });
  }, /* opt_isRuntimeCss */ true, /* opt_ext */ 'amp-runtime');
});

// Output a message to the console and add an attribute to the <html>
// tag to give some information that can be used in error reports.
// (At least by sophisticated users).
if (self.console) {
  (console.info || console.log).call(console,
      'Powered by AMP ⚡4ads HTML – Version $internalRuntimeVersion$',
      self.location.href);
}
self.document.documentElement.setAttribute('amp-version',
    '$internalRuntimeVersion$');
