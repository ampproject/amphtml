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
import {checkAndFix} from '../../src/service/ie-media-bug';
import {dev} from '../../src/log';


describe('ie-media-bug', () => {
  let sandbox;
  let clock;
  let windowApi, windowMock;
  let platform;
  let platformMock;
  let devErrorStub;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    clock = sandbox.useFakeTimers();
    platform = {
      isIe: () => false,
    };
    platformMock = sandbox.mock(platform);
    devErrorStub = sandbox.stub(dev(), 'error');

    windowApi = {
      innerWidth: 320,
      setInterval: () => {},
      clearInterval: () => {},
      matchMedia: () => {},
    };
    windowMock = sandbox.mock(windowApi);
  });

  afterEach(() => {
    platformMock.verify();
    windowMock.verify();
    sandbox.restore();
  });

  it('should bypass polling for non-IE browsers', () => {
    platformMock.expects('isIe').returns(false);
    windowMock.expects('matchMedia').never();
    windowMock.expects('setInterval').never();
    const promise = checkAndFix(windowApi, platform);
    expect(promise).to.be.null;
    expect(devErrorStub).to.have.not.been.called;
  });

  it('should bypass polling when matchMedia is not broken', () => {
    platformMock.expects('isIe').returns(true);
    windowMock.expects('matchMedia')
        .withExactArgs('(min-width: 319px) AND (max-width: 321px)')
        .returns({matches: true})
        .once();
    windowMock.expects('setInterval').never();
    const promise = checkAndFix(windowApi, platform);
    expect(promise).to.be.null;
    expect(devErrorStub).to.have.not.been.called;
  });

  it('should poll when matchMedia is wrong, but eventually succeeds', () => {
    platformMock.expects('isIe').returns(true);

    // Scheduling pass.
    windowMock.expects('matchMedia')
        .withExactArgs('(min-width: 319px) AND (max-width: 321px)')
        .returns({matches: false})
        .once();
    const intervalId = 111;
    let intervalCallback;
    windowMock.expects('setInterval')
        .withExactArgs(
            sinon.match(arg => {
              intervalCallback = arg;
              return true;
            }),
            10
        )
        .returns(intervalId)
        .once();

    const promise = checkAndFix(windowApi, platform);
    expect(promise).to.be.not.null;
    expect(devErrorStub).to.have.not.been.called;
    expect(intervalCallback).to.exist;
    windowMock.verify();
    windowMock./*OK*/restore();

    // Second pass.
    clock.tick(10);
    windowMock = sandbox.mock(windowApi);
    windowMock.expects('matchMedia')
        .withExactArgs('(min-width: 319px) AND (max-width: 321px)')
        .returns({matches: false})
        .once();
    windowMock.expects('clearInterval').never();
    intervalCallback();
    expect(devErrorStub).to.have.not.been.called;
    windowMock.verify();
    windowMock./*OK*/restore();

    // Third pass - succeed.
    clock.tick(10);
    windowMock = sandbox.mock(windowApi);
    windowMock.expects('matchMedia')
        .withExactArgs('(min-width: 319px) AND (max-width: 321px)')
        .returns({matches: true})
        .once();
    windowMock.expects('clearInterval').withExactArgs(intervalId).once();
    intervalCallback();
    windowMock.verify();
    windowMock./*OK*/restore();

    return promise.then(() => {
      expect(devErrorStub).to.have.not.been.called;
    });
  });

  it('should poll until times out', () => {
    platformMock.expects('isIe').returns(true);

    // Scheduling pass.
    windowMock.expects('matchMedia')
        .withExactArgs('(min-width: 319px) AND (max-width: 321px)')
        .returns({matches: false})
        .atLeast(2);
    const intervalId = 111;
    let intervalCallback;
    windowMock.expects('setInterval')
        .withExactArgs(
            sinon.match(arg => {
              intervalCallback = arg;
              return true;
            }),
            10
        )
        .returns(intervalId)
        .once();
    windowMock.expects('clearInterval').withExactArgs(intervalId).once();

    const promise = checkAndFix(windowApi, platform);
    expect(promise).to.be.not.null;
    expect(devErrorStub).to.have.not.been.called;
    expect(intervalCallback).to.exist;

    // Second pass.
    clock.tick(10);
    intervalCallback();
    expect(devErrorStub).to.have.not.been.called;

    // Third pass - timeout.
    clock.tick(2000);
    intervalCallback();
    expect(devErrorStub).to.be.calledOnce;

    return promise.then(() => {
      expect(devErrorStub).to.be.calledOnce;
    });
  });

  it('should tolerate matchMedia exceptions', () => {
    platformMock.expects('isIe').returns(true);

    windowMock.expects('matchMedia')
        .withExactArgs('(min-width: 319px) AND (max-width: 321px)')
        .throws(new Error('intentional'))
        .once();
    windowMock.expects('setInterval').never();

    const promise = checkAndFix(windowApi, platform);
    expect(promise).to.be.null;
    expect(devErrorStub).to.be.calledOnce;
  });
});
