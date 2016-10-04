/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
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

import {maybeTrackImpression} from '../../src/impression';
import {toggleExperiment} from '../../src/experiments';
import {viewerForDoc} from '../../src/viewer';
import {xhrFor} from '../../src/xhr';
import * as sinon from 'sinon';

describe('impression', () => {

  let sandbox;
  let viewer;
  let xhr;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    viewer = viewerForDoc(window.document);
    sandbox.stub(viewer, 'getParam');
    xhr = xhrFor(window);
    expect(xhr.fetchJson).to.be.defined;
    xhr.fetchJson = () => {
      return Promise.resolve(null);
    };
    sandbox.spy(xhr, 'fetchJson');
    sandbox.stub(viewer, 'whenFirstVisible').returns(Promise.resolve());
  });

  afterEach(() => {
    toggleExperiment(window, 'alp', false);
    sandbox.restore();
  });


  it('should do nothing if the experiment is off', () => {
    viewer.getParam.throws(new Error('Should not be called'));
    maybeTrackImpression(window);
  });

  it('should do nothing if there is no click arg', () => {
    toggleExperiment(window, 'alp', true);
    viewer.getParam.withArgs('click').returns('');
    maybeTrackImpression(window);
    expect(xhr.fetchJson.callCount).to.equal(0);
  });

  it('should do nothing if there is the click arg is http', () => {
    toggleExperiment(window, 'alp', true);
    viewer.getParam.withArgs('click').returns('http://www.example.com');
    maybeTrackImpression(window);
    expect(xhr.fetchJson.callCount).to.equal(0);
  });

  it('should invoke URL', () => {
    toggleExperiment(window, 'alp', true);
    viewer.getParam.withArgs('click').returns('https://www.example.com');
    maybeTrackImpression(window);
    expect(xhr.fetchJson.callCount).to.equal(0);
    return Promise.resolve().then(() => {
      expect(xhr.fetchJson.callCount).to.equal(1);
      const url = xhr.fetchJson.lastCall.args[0];
      const params = xhr.fetchJson.lastCall.args[1];
      expect(url).to.equal('https://www.example.com');
      expect(params).to.jsonEqual({
        credentials: 'include',
        requireAmpResponseSourceOrigin: true,
      });
    });
  });
});
