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

import {xhrServiceForTesting} from '../src/service/xhr-impl';
import {getService, getServiceForDoc} from '../src/service';

export function stubService(sandbox, win, serviceId, method) {
  const stub = sandbox.stub();
  getService(win, serviceId, () => {
    const service = {};
    service[method] = stub;
    return service;
  });
  return stub;
}

export function stubServiceForDoc(sandbox, ampdoc, serviceId, method) {
  const stub = sandbox.stub();
  getServiceForDoc(ampdoc, serviceId, () => {
    const service = {};
    service[method] = stub;
    return service;
  });
  return stub;
}

/**
 * Asserts that the given element is only visible to screen readers.
 * @param {!Element} node
 */
export function assertScreenReaderElement(element) {
  expect(element).to.exist;
  expect(element.classList.contains('i-amphtml-screen-reader')).to.be.true;
  const win = element.ownerDocument.defaultView;
  const computedStyle = win.getComputedStyle(element);
  expect(computedStyle.getPropertyValue('position')).to.equal('fixed');
  expect(computedStyle.getPropertyValue('top')).to.equal('0px');
  expect(computedStyle.getPropertyValue('left')).to.equal('0px');
  expect(computedStyle.getPropertyValue('width')).to.equal('2px');
  expect(computedStyle.getPropertyValue('height')).to.equal('2px');
  expect(computedStyle.getPropertyValue('opacity')).to.equal('0');
  expect(computedStyle.getPropertyValue('overflow')).to.equal('hidden');
  expect(computedStyle.getPropertyValue('border')).to.contain('none');
  expect(computedStyle.getPropertyValue('margin')).to.equal('0px');
  expect(computedStyle.getPropertyValue('padding')).to.equal('0px');
  expect(computedStyle.getPropertyValue('display')).to.equal('block');
  expect(computedStyle.getPropertyValue('visibility')).to.equal('visible');
}

/////////////////
// Request Bank
// A server side temporary request storage which is useful for testing
// browser sent HTTP requests.
/////////////////
const REQUEST_URL = '//localhost:9876/request-bank/';

export function depositRequestUrl(id) {
  return REQUEST_URL + 'deposit/' + id;
}

export function withdrawRequest(win, id) {
  const url = REQUEST_URL + 'withdraw/' + id;
  return xhrServiceForTesting(win).fetchJson(url, {
    method: 'GET',
    ampCors: false,
    credentials: 'omit',
  });
}
