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

import {installVisibilityService} from '../../src/service/visibility-impl';
import {installResourcesService} from '../../src/service/resources-impl';
import {visibilityFor} from '../../src/visibility';
import * as sinon from 'sinon';


// The tests have amp-analytics tag because they should be run whenever
// amp-analytics is changed.
describe('Visibility (tag: amp-analytics)', () => {

  let sandbox;
  let visibility;
  let calls;
  let getIntersectionStub;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    sandbox.useFakeTimers();
    calls = 0;

    installResourcesService(window);
    installVisibilityService(window);

    const getIdStub = sandbox.stub();
    getIdStub.returns('0');
    getIntersectionStub = sandbox.stub();

    return visibilityFor(window).then(v => {
      visibility = v;
      const getResourceStub = sandbox.stub(visibility.resourcesService_,
        'getResourceForElement');
      getResourceStub.returns({
        element: {getIntersectionChangeEntry: getIntersectionStub},
        getId: getIdStub,
      });
    });
  });

  afterEach(() => {
    visibility = null;
    getIntersectionStub = null;
    sandbox.restore();
  });

  function callback() {
    calls++;
  }

  function listen(intersectionChange, config, expectedCalls) {
    getIntersectionStub.returns(intersectionChange);
    visibility.listenOnce(config, callback);
    sandbox.clock.tick(200);

    expect(calls).to.equal(expectedCalls);
  }

  function verifyChange(intersectionChange, expectedCalls) {
    getIntersectionStub.returns(intersectionChange);
    visibility.scrollListener_();
    expect(calls).to.equal(expectedCalls);
  }

  it('should fire (trivial config)', () => {
    listen({
      intersectionRect: {width: 50, height: 50},
      boundingClientRect: {height: 100, width: 100},
    }, {
      selector: '#abc', visiblePercentageMin: 0, visiblePercentageMax: 100,
    }, 1);
  });

  it('should fire (non-trivial config)', () => {
    listen({
      intersectionRect: {height: 100, width: 19},
      boundingClientRect: {height: 100, width: 100},
    }, {
      selector: '#abc', visiblePercentageMin: 20, visiblePercentageMax: 80,
    }, 0);

    verifyChange({
      intersectionRect: {height: 100, width: 20},
      boundingClientRect: {height: 100, width: 100},
    }, 1);
  });

  it('should fire only once', () => {
    listen({
      intersectionRect: {width: 20, height: 100},
      boundingClientRect: {height: 100, width: 100},
    }, {
      selector: '#abc', visiblePercentageMin: 20, visiblePercentageMax: 80,
    }, 1);

    verifyChange({
      intersectionRect: {height: 100, width: 100},
      boundingClientRect: {height: 100, width: 100},
    }, 1);

    verifyChange({
      intersectionRect: {height: 20, width: 100},
      boundingClientRect: {height: 100, width: 100},
    }, 1);
  });

  it('does not fire if max condition fails', () => {
    listen({
      intersectionRect: {width: 100, height: 100},
      boundingClientRect: {height: 100, width: 100},
    }, {
      selector: '#abc', visiblePercentageMin: 20, visiblePercentageMax: 80,
    }, 0);

    verifyChange({
      intersectionRect: {height: 40, width: 100},
      boundingClientRect: {height: 100, width: 100},
    }, 0);
  });
});
