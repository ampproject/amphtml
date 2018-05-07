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

import * as lolex from 'lolex';
import * as service from '../../src/service';
import * as sinon from 'sinon';
import {createIframePromise} from '../../testing/iframe';
import {
  hasRenderDelayingServices,
  waitForServices,
} from '../../src/render-delaying-services';

describe('waitForServices', () => {

  let win;
  let sandbox;
  let clock;
  let dynamicCssResolve;
  let experimentResolve;
  let variantResolve;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    const getService = sandbox.stub(service, 'getServicePromise');
    dynamicCssResolve = waitForService(getService, 'amp-dynamic-css-classes');
    experimentResolve = waitForService(getService, 'amp-experiment');
    variantResolve = waitForService(getService, 'variant');

    return createIframePromise().then(iframe => {
      win = iframe.win;
      clock = lolex.install({target: win});
    });
  });

  afterEach(() => {
    clock.uninstall();
    sandbox.restore();
  });

  it('should resolve if no blocking services is presented', () => {
    // <script custom-element="amp-experiment"> should not block
    addExtensionScript(win, 'amp-experiment');
    expect(hasRenderDelayingServices(win)).to.be.false;
    return expect(waitForServices(win)).to.eventually.have.lengthOf(0);
  });

  it('should timeout if some blocking services are missing', () => {
    addExtensionScript(win, 'amp-dynamic-css-classes');
    win.document.body.appendChild(win.document.createElement('amp-experiment'));
    expect(hasRenderDelayingServices(win)).to.be.true;
    addExtensionScript(win, 'non-blocking-extension');

    const promise = waitForServices(win);
    dynamicCssResolve();
    experimentResolve(); // 'amp-experiment' is actually blocked by 'variant'
    clock.tick(3000);
    return expect(promise).to.eventually.be.rejectedWith('variant');
  });

  it('should resolve when all extensions are ready', () => {
    addExtensionScript(win, 'amp-dynamic-css-classes');
    win.document.body.appendChild(win.document.createElement('amp-experiment'));
    expect(hasRenderDelayingServices(win)).to.be.true;
    addExtensionScript(win, 'non-blocking-extension');

    const promise = waitForServices(win);
    dynamicCssResolve();
    variantResolve(); // this unblocks 'amp-experiment'

    return expect(promise).to.eventually.have.lengthOf(2);
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
