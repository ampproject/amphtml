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

import {FakeCustomElements, FakeWindow} from './fake-dom';
import {doNotLoadExternalResourcesInTest} from './iframe';
import {
  adopt,
  installAmpdocServices,
  installRuntimeServices,
  registerForUnitTest,
} from '../src/runtime';
import {installDocService} from '../src/service/ampdoc-impl';
import {installExtensionsService} from '../src/service/extensions-impl';
import {resetScheduledElementForTesting} from '../src/custom-element';
import * as sinon from 'sinon';

/** Should have something in the name, otherwise nothing is shown. */
const SUB = ' ';


/** @type {number} */
let iframeCount = 0;


/**
 * - ampdoc: "single", "shadow", "multi", "none".
 *
 * @typedef {{
 *   runtimeOn: (boolean|undefined),
 *   ampdoc: (string),
 * }}
 */
export let AmpTestSpec;


/**
 * A test with a sandbox.
 * @param {string} name
 * @param {{
 *   fakeClock: (boolean|undefined),
 * }} spec
 * @param {function({
 *   sandbox: !Sandbox,
 *   clock: (!FakeClock|undefined),
 * })} fn
 */
export function sandboxed(name, spec, fn) {
  return describe(name, function() {

    const env = Object.create(null);

    beforeEach(() => {
      global.sandbox = env.sandbox = sinon.sandbox.create();
      if (spec.fakeClock) {
        global.clock = env.clock = env.sandbox.useFakeTimers();
      }
    });

    afterEach(() => {
      env.sandbox.restore();
      delete env.sandbox;
      delete global.sandbox;
      if (env.clock) {
        delete env.clock;
        delete global.clock;
      }
    });

    describe(SUB, function() {
      fn.call(this, env);
    });
  });
}


/**
 * A test with a fake window.
 * @param {string} name
 * @param {{win: !FakeWindowSpec}} spec
 * @param {function({
 *   win: !FakeWindow,
 * })} fn
 */
export function fakeWin(name, spec, fn) {
  return describe(name, function() {

    const env = Object.create(null);

    beforeEach(() => {
      env.win = new FakeWindow(spec);
    });

    afterEach(() => {
      // TODO(dvoytenko): test that window is returned in a good condition.
      delete env.win;
    });

    describe(SUB, function() {
      fn.call(this, env);
    });
  });
}


/**
 * A test with a real (iframed) window.
 * @param {string} name
 * @param {{
 *   fakeRegisterElement: (boolean|undefined),
 *   amp: (!AmpTestSpec|undefined),
 * }} spec
 * @param {function({
 *   sandbox: !Sandbox,
 *   clock: (!FakeClock|undefined),
 * })} fn
 */
export function realWin(name, spec, fn) {
  return describe(name, function() {

    const env = Object.create(null);

    beforeEach(() => {
      return new Promise(function(resolve, reject) {
        const iframe = document.createElement('iframe');
        iframe.name = 'test_' + iframeCount++;
        iframe.srcdoc = '<!doctype><html><head>' +
            '<style>.-amp-element {display: block;}</style>' +
            '<body style="margin:0"><div id=parent></div>';
        iframe.onload = function() {
          const win = iframe.contentWindow;
          env.iframe = iframe;
          env.win = win;

          // Flag as being a test window.
          win.AMP_TEST_IFRAME = true;

          doNotLoadExternalResourcesInTest(win);

          if (spec.fakeRegisterElement) {
            win.customElements = new FakeCustomElements(win);
          }

          if (spec.amp) {
            ampSetup(env, win, spec.amp);
          }
          resolve();
        };
        iframe.onerror = reject;
        document.body.appendChild(iframe);
      });
    });

    afterEach(() => {
      ampDestroy(env);
      // TODO(dvoytenko): test that window is returned in a good condition.
      if (env.iframe.parentNode) {
        env.iframe.parentNode.removeChild(env.iframe);
      }
      delete env.iframe;
      delete env.win;
    });

    describe(SUB, function() {
      fn.call(this, env);
    });
  });
}


/**
 * @param {!Object} env
 * @param {!Window} win
 * @param {!AmpTestSpec} spec
 */
function ampSetup(env, win, spec) {
  win.ampExtendedElements = {};
  if (!spec.runtimeOn) {
    win.name = '__AMP__off=1';
  }
  const ampdocType = spec.ampdoc || 'single';
  const singleDoc = ampdocType == 'single';
  const ampdocService = installDocService(win, singleDoc);
  env.ampdocService = ampdocService;
  env.extensions = installExtensionsService(win);
  installRuntimeServices(win);
  env.flushVsync = function() {
    win.services.vsync.obj.runScheduledTasks_();
  };
  if (singleDoc) {
    const ampdoc = ampdocService.getAmpDoc(win.document);
    env.ampdoc = ampdoc;
    installAmpdocServices(ampdoc);
    adopt(win);
  }
}


/**
 * @param {!Object} env
 */
function ampDestroy(env) {
  if (env.win.customElements && env.win.customElements.elements) {
    for (const k in env.win.customElements.elements) {
      resetScheduledElementForTesting(env.win, k);
    }
  }
  delete env.flushVsync;
  delete env.ampdocService;
  delete env.extensions;
  if (env.ampdoc) {
    delete env.ampdoc;
  }
}
