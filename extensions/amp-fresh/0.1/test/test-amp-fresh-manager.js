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

import * as sinon from 'sinon';
import {AmpFresh} from '../amp-fresh';
import {installAmpFreshManager} from '../amp-fresh-manager';
import {installXhrService} from '../../../../src/service/xhr-impl';
import {resetServiceForTesting} from '../../../../src/service';
import {toggleExperiment} from '../../../../src/experiments';
import {whenDocumentReady} from '../../../../src/document-ready';

describe('amp-fresh-manager', () => {
  let sandbox;
  let requests;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    const mockXhr = sandbox.useFakeXMLHttpRequest().xhr;
    requests = [];
    toggleExperiment(window, 'amp-fresh', true);
    mockXhr.onCreate = function(xhr) {
      requests.push(xhr);
    };
  });

  afterEach(() => {
    toggleExperiment(window, 'amp-fresh', false);
    resetServiceForTesting(window, 'ampFreshManager');
    sandbox.restore();
  });

  it('should fetch document on install', () => {
    expect(requests).to.have.lengthOf(0);
    installAmpFreshManager(window);
    expect(requests).to.have.lengthOf(1);
  });

  it('only update when doc is ready', () => {
    const eventListeners = {};
    const testDoc = {
      readyState: 'loading',
      addEventListener: (eventType, handler) => {
        eventListeners[eventType] = handler;
      },
      removeEventListener: (eventType, handler) => {
        if (eventListeners[eventType] == handler) {
          delete eventListeners[eventType];
        }
      },
    };
    const loc = {href: 'https://www.ampproject.org'};
    const win = {
      document: testDoc,
      location: loc,
      setTimeout: window.setTimeout.bind(window),
    };
    installXhrService(win);
    const service = installAmpFreshManager(win);
    testDoc.readyState = 'complete';
    eventListeners['readystatechange']();
    const updateSpy = sandbox.spy(service, 'update_');
    expect(updateSpy.callCount).to.equal(0);
    requests[0].respond(200, {
      'Content-Type': 'text/xml',
    }, '<html></html>');
    return service.docPromise_.then(() => {
      expect(updateSpy.callCount).to.equal(1);
    });
  });

  it('adds amp-fresh=1 query param to request', () => {
    installAmpFreshManager(window);
    expect(requests[0].url).to.match(/amp-fresh=1/);
  });

  it('calls show on all registered amp-fresh elements on failure', () => {
    const elem = document.createElement('div');
    elem.setAttribute('id', 'amp-fresh-1');
    const elem2 = document.createElement('div');
    elem2.setAttribute('id', 'amp-fresh-2');
    const fresh = new AmpFresh(elem);
    const fresh2 = new AmpFresh(elem2);
    const showSpy = sandbox.spy(fresh, 'show');
    const showSpy2 = sandbox.spy(fresh2, 'show');
    const service = installAmpFreshManager(window);
    requests[0].respond(404, {
      'Content-Type': 'text/xml',
    }, '<html></html>');
    fresh.buildCallback();
    fresh2.buildCallback();
    expect(showSpy.callCount).to.equal(0);
    expect(showSpy2.callCount).to.equal(0);
    return service.docPromise_.catch(() => {
      return whenDocumentReady(window).then(() => {
        expect(showSpy.callCount).to.equal(1);
        expect(showSpy2.callCount).to.equal(1);
      });
    });
  });

  it('throws on duplicate ids', () => {
    const elem = document.createElement('div');
    elem.setAttribute('id', 'amp-fresh-1');
    const elem2 = document.createElement('div');
    elem2.setAttribute('id', 'amp-fresh-1');
    const fresh = new AmpFresh(elem);
    const fresh2 = new AmpFresh(elem2);
    installAmpFreshManager(window);
    fresh.buildCallback();
    expect(function() {
      fresh2.buildCallback();
    }).to.throw(/duplicate/);
  });
});
