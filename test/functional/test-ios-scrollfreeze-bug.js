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

import {AmpDocSingle} from '../../src/service/ampdoc-impl';
import {checkAndFix} from '../../src/service/ios-scrollfreeze-bug';
import * as sinon from 'sinon';


describe('ios-scrollfreeze-bug', () => {
  let sandbox;
  let windowApi;
  let ampdoc;
  let platform;
  let platformMock;
  let vsyncApi;
  let mutateStub;
  let viewerApi;
  let viewerMock;
  let bodyBottom;
  let bodySetSpy;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    platform = {
      isIos: () => true,
      isSafari: () => true,
      getMajorVersion: () => 8,
    };
    platformMock = sandbox.mock(platform);

    windowApi = {
      document: {
        nodeType: /* DOCUMENT */ 9,
        body: {style: {}},
      },
    };
    windowApi.document.defaultView = windowApi;
    ampdoc = new AmpDocSingle(windowApi);
    bodyBottom = '0px';
    bodySetSpy = sandbox.spy();
    Object.defineProperty(windowApi.document.body.style, 'bottom', {
      get() {
        return bodyBottom;
      },
      set(value) {
        bodySetSpy(value);
        bodyBottom = value;
      },
    });

    vsyncApi = {
      mutate: () => {},
    };
    mutateStub = sandbox.stub(vsyncApi, 'mutate', callback => {
      callback();
    });

    viewerApi = {
      getParam: name => {
        if (name == 'b29185497') {
          return '1';
        }
        return null;
      },
    };
    viewerMock = sandbox.mock(viewerApi);
  });

  afterEach(() => {
    viewerMock.verify();
    platformMock.verify();
    sandbox.restore();
  });

  it('should execute body reset', () => {
    const promise = checkAndFix(ampdoc, platform, viewerApi, vsyncApi);
    expect(promise).to.exist;
    return promise.then(() => {
      expect(windowApi.document.body.style.bottom).to.equal('0px');
      expect(mutateStub).to.have.callCount(2);
      expect(bodySetSpy).to.have.callCount(2);
      expect(bodySetSpy.args[0][0]).to.equal('');
      expect(bodySetSpy.args[1][0]).to.equal('0px');
    });
  });

  it('should ignore for non-iOS', () => {
    platformMock.expects('isIos').returns(false).once();
    const promise = checkAndFix(ampdoc, platform, viewerApi, vsyncApi);
    expect(promise).to.not.exist;
  });

  it('should ignore for non-Safari', () => {
    platformMock.expects('isSafari').returns(false).once();
    const promise = checkAndFix(ampdoc, platform, viewerApi, vsyncApi);
    expect(promise).to.not.exist;
  });

  it('should ignore for version > 8', () => {
    platformMock.expects('getMajorVersion').returns(9).once();
    const promise = checkAndFix(ampdoc, platform, viewerApi, vsyncApi);
    expect(promise).to.not.exist;

    platformMock.expects('getMajorVersion').returns(10).once();
    const promise2 = checkAndFix(ampdoc, platform, viewerApi, vsyncApi);
    expect(promise2).to.not.exist;
  });

  it('should ignore when b29185497 is not specified', () => {
    viewerMock.expects('getParam').withExactArgs('b29185497').returns('')
        .once();
    const promise = checkAndFix(ampdoc, platform, viewerApi, vsyncApi);
    expect(promise).to.not.exist;
  });
});
