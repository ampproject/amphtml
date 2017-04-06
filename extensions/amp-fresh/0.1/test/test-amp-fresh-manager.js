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
import {
  ampFreshManagerForDoc,
  installAmpFreshManagerForDoc,
} from '../amp-fresh-manager';
import {installXhrService} from '../../../../src/service/xhr-impl';
import {resetServiceForTesting} from '../../../../src/service';
import {toggleExperiment} from '../../../../src/experiments';
import {AmpDoc} from '../../../../src/service/ampdoc-impl';

describe('amp-fresh-manager', () => {
  let sandbox;
  let requests;
  let container;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    const mockXhr = sandbox.useFakeXMLHttpRequest().xhr;
    requests = [];
    toggleExperiment(window, 'amp-fresh', true);
    installXhrService(window);
    installAmpFreshManagerForDoc(window.document);
    mockXhr.onCreate = function(xhr) {
      requests.push(xhr);
    };
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    toggleExperiment(window, 'amp-fresh', false);
    resetServiceForTesting(window, 'ampFreshManager');
    resetServiceForTesting(window, 'xhr');
    sandbox.restore();
    if (container.parentNode) {
      container.parentNode.removeChild(container);
    }
  });

  it('should fetch document on instantiation', () => {
    expect(requests).to.have.lengthOf(0);
    // Force instantiation
    ampFreshManagerForDoc(window.document);
    expect(requests).to.have.lengthOf(1);
  });

  it('only update when doc is ready', () => {
    sandbox.stub(AmpDoc.prototype, 'whenReady')
        .returns(Promise.resolve());
    const service = ampFreshManagerForDoc(window.document);
    const updateSpy = sandbox.spy(service, 'update_');
    expect(updateSpy).to.have.not.been.called;
    requests[0].respond(200, {
      'Content-Type': 'text/xml',
    }, '<html></html>');
    return service.docPromise_.then(() => {
      expect(updateSpy).to.be.calledOnce;
    });
  });

  it('adds amp-fresh=1 query param to request', () => {
    // Force instantiation
    ampFreshManagerForDoc(window.document);
    expect(requests[0].url).to.match(/amp-fresh=1/);
  });

  it('calls setFreshReady on all registered amp-fresh elements ' +
     'on failure', () => {
    const elem = document.createElement('div');
    elem.setAttribute('id', 'amp-fresh-1');
    container.appendChild(elem);
    const elem2 = document.createElement('div');
    elem2.setAttribute('id', 'amp-fresh-2');
    container.appendChild(elem2);
    const fresh = new AmpFresh(elem);
    const fresh2 = new AmpFresh(elem2);
    const setFreshReadySpy = sandbox.spy(fresh, 'setFreshReady');
    const setFreshReadySpy2 = sandbox.spy(fresh2, 'setFreshReady');
    const service = ampFreshManagerForDoc(window.document);
    requests[0].respond(404, {
      'Content-Type': 'text/xml',
    }, '<html></html>');
    fresh.buildCallback();
    fresh2.buildCallback();
    expect(setFreshReadySpy).to.have.not.been.called;
    expect(setFreshReadySpy2).to.have.not.been.called;
    return service.docPromise_.then(() => {
      expect(setFreshReadySpy).to.be.calledOnce;
      expect(setFreshReadySpy2).to.be.calledOnce;
    });
  });

  it('throws on duplicate ids', () => {
    const elem = document.createElement('div');
    elem.setAttribute('id', 'amp-fresh-1');
    container.appendChild(elem);
    const elem2 = document.createElement('div');
    elem2.setAttribute('id', 'amp-fresh-1');
    container.appendChild(elem2);
    const fresh = new AmpFresh(elem);
    const fresh2 = new AmpFresh(elem2);
    fresh.buildCallback();
    expect(function() {
      fresh2.buildCallback();
    }).to.throw(/duplicate/);
  });
});
