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

import {waitForExtensions} from '../../src/render-delaying-extensions';
import {createIframePromise} from '../../testing/iframe';
import * as service from '../../src/service';
import * as sinon from 'sinon';

describe('waitForExtensions', () => {

  let win;
  let sandbox;
  let accordionResolve;
  let dynamicCssResolve;
  let experimentResolve;
  let variantResolve;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    const getService = sandbox.stub(service, 'getServicePromise');
    accordionResolve = waitForService(getService, 'amp-accordion');
    dynamicCssResolve = waitForService(getService, 'amp-dynamic-css-classes');
    experimentResolve = waitForService(getService, 'amp-experiment');
    variantResolve = waitForService(getService, 'variant');

    return createIframePromise().then(iframe => {
      win = iframe.win;
    });
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should return undefined if no extension is presented', () => {
    expect(waitForExtensions(win)).to.equal(undefined);
  });

  it('should keep waiting when some extensions are not ready yet', () => {
    addExtensionScript(win, 'amp-accordion');
    addExtensionScript(win, 'amp-dynamic-css-classes');
    addExtensionScript(win, 'amp-experiment');
    addExtensionScript(win, 'non-blocking-extension');

    const promise = waitForExtensions(win);
    accordionResolve();
    dynamicCssResolve();
    experimentResolve(); // 'amp-experiment' is actually blocked by 'variant'

    return expect(promise).to.eventually.be.reject;
  });

  it('should resolve when all extensions are ready', () => {
    addExtensionScript(win, 'amp-accordion');
    addExtensionScript(win, 'amp-dynamic-css-classes');
    addExtensionScript(win, 'amp-experiment');
    addExtensionScript(win, 'non-blocking-extension');

    const promise = waitForExtensions(win);
    accordionResolve();
    dynamicCssResolve();
    variantResolve(); // this unblocks 'amp-experiment'

    return expect(promise).to.eventually.be.fulfilled;
  });
});

function waitForService(getService, serviceId) {
  let resolve = null;
  getService.withArgs(sinon.match.any, serviceId).returns(new Promise(r => {
    resolve = r;
  }));
  return resolve;
}

function addExtensionScript(win, extensionName) {
  const scriptElement = win.document.createElement('script');
  scriptElement.setAttribute('async', '');
  scriptElement.setAttribute('custom-element', extensionName);
  win.document.head.appendChild(scriptElement);
}
