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

import {
  adopt,
  adoptShadowMode,
  attachShadowDocForTesting,
  installAmpdocServices,
  installBuiltins,
  installRuntimeServices,
} from '../src/runtime';
import {installDocService} from '../src/service/ampdoc-impl';
import {installPerformanceService} from '../src/service/performance-impl';
import {installExtension} from '../test/_init_tests';

import * as sinon from 'sinon';


let iframeCount = 0;


/**
 * @extends {!Widnow}
 */
export class FakeWinow {
  constructor() {
    /** @const {!HTMLDocument} */
    this.document = self.document.implementation.createHTMLDocument('');
    Object.defineProperty(
        this.document,
        'defaultView',
        {get: () => this});
  }
}


export function describeFakeWindow(name, func) {
  var desc = describe(name, function() {
    const test = {};

    let testInstance;

    beforeEach(() => {
      testInstance = {
        sandbox: sinon.sandbox.create(),
        win: new FakeWinow(),
      };
      Object.assign(test, testInstance);
    });

    afterEach(() => {
      testInstance.sandbox.restore();
      for (const k in testInstance) {
        delete test[k];
      }
    });

    describe('', function() {
      func.call(this, test);
    });
  });
  return desc;
}


/**
 * @typedef {{
 *   runtimeOn: (boolean|undefined),
 *   extensions: (!Array<string>|undefined),
 * }}
 */
export let TestEnvSpec;


function installExtensionsFromSpec(win, spec) {
  if (!spec.extensions) {
    return;
  }
  spec.extensions.forEach(ext => {
    installExtension(win.AMP, ext);
  });
}


/**
 * TODO: all environments:
 * - Standalone, direct origin
 * - Standalone, CDN
 * - IFrame, direct origin
 * - IFrame, CDN
 * - Webview, direct origin
 * - Webview, CDN
 * - Shadow DOM, direct origin
 *
 * @param {string} name
 * @param {!TestEnvSpec} spec
 * @param {function(!TestEnv)} func
 */
export function describeEnv(name, spec, func) {
  var desc = describe(name, function() {
    const test = {};

    let testInstance;

    beforeEach(() => {
      testInstance = {
        sandbox: sinon.sandbox.create(),
      };
      Object.assign(test, testInstance);
    });

    afterEach(() => {
      testInstance.sandbox.restore();
      for (const k in testInstance) {
        delete test[k];
      }
    });

    describe('env:standalone', function() {
      beforeEach(() => {
        return new Promise(function(resolve, reject) {
          const iframe = document.createElement('iframe');
          iframe.name = 'test_' + iframeCount++;
          iframe.srcdoc = '<!doctype><html><head>' +
              '<style>.-amp-element {display: block;}</style>' +
              '<body style="margin:0"><div id=parent></div>';
          iframe.onload = function() {
            const win = iframe.contentWindow;
            // Flag as being a test window.
            win.AMP_TEST_IFRAME = true;
            win.AMP_TEST_EMBEDDED = false;
            if (!spec.runtimeOn) {
              win.name = '__AMP__off=1';
            }
            const ampdocService = installDocService(win, /* isSingleDoc */ true);
            const ampdoc = ampdocService.getAmpDoc(win.document);
            installPerformanceService(win);
            installRuntimeServices(win);
            installAmpdocServices(ampdoc);
            installBuiltins(win);
            adopt(win);
            installExtensionsFromSpec(win, spec);

            test.win = win;
            test.ampdoc = ampdoc;
            test.AMP = win.AMP;

            expect(win.AMP.viewer.isEmbedded()).to.be.false;
            resolve();
          };
          iframe.onerror = reject;
          document.body.appendChild(iframe);
        });
      });

      afterEach(() => {
      });

      func.call(this, test);
    });


    describe('env:iframed', function() {
      beforeEach(() => {
        return new Promise(function(resolve, reject) {
          const iframe = document.createElement('iframe');
          iframe.name = 'test_' + iframeCount++;
          iframe.srcdoc = '<!doctype><html><head>' +
              '<style>.-amp-element {display: block;}</style>' +
              '<body style="margin:0"><div id=parent></div>';
          iframe.onload = function() {
            const win = iframe.contentWindow;
            // Flag as being a test window.
            win.AMP_TEST_IFRAME = true;
            win.AMP_TEST_EMBEDDED = true;
            if (!spec.runtimeOn) {
              win.name = '__AMP__off=1';
            }
            const ampdocService = installDocService(win, /* isSingleDoc */ true);
            const ampdoc = ampdocService.getAmpDoc(win.document);
            installPerformanceService(win);
            installRuntimeServices(win);
            installAmpdocServices(ampdoc);
            installBuiltins(win);
            adopt(win);
            installExtensionsFromSpec(win, spec);

            test.win = win;
            test.ampdoc = ampdoc;
            test.AMP = win.AMP;

            expect(win.AMP.viewer.isEmbedded()).to.be.true;
            resolve();
          };
          iframe.onerror = reject;
          document.body.appendChild(iframe);
        });
      });

      afterEach(() => {
      });

      func.call(this, test);
    });

    describe('env:shadowdoc', function() {
      beforeEach(() => {
        return new Promise(function(resolve, reject) {
          const iframe = document.createElement('iframe');
          iframe.name = 'test_' + iframeCount++;
          iframe.srcdoc = '<!doctype><html><head>' +
              '<style>.-amp-element {display: block;}</style>' +
              '<body style="margin:0"><div id=parent></div>';
          iframe.onload = function() {
            const win = iframe.contentWindow;
            // Flag as being a test window.
            win.AMP_TEST_IFRAME = true;
            win.AMP_TEST_EMBEDDED = false;
            if (!spec.runtimeOn) {
              win.name = '__AMP__off=1';
            }
            const ampdocService = installDocService(win, /* isSingleDoc */ false);
            installPerformanceService(win);
            installRuntimeServices(win);
            installBuiltins(win);
            adoptShadowMode(win);
            installExtensionsFromSpec(win, spec);

            test.win = win;
            test.AMP = win.AMP;

            const hostElement = win.document.createElement('div');
            win.document.body.appendChild(hostElement);
            const doc = document.implementation.createHTMLDocument('');
            const ampdoc = attachShadowDocForTesting(win, hostElement, doc,
                'https://acme.org/doc1');
            test.ampdoc = ampdoc;

            resolve();
          };
          iframe.onerror = reject;
          document.body.appendChild(iframe);
        });
      });

      afterEach(() => {
      });

      func.call(this, test);
    });
  });
  return desc;
}
