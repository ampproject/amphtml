/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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

import {Deferred} from '../../../src/utils/promise';
import {Services} from '../../../src/services';
import {registerIniLoadListener} from '../../../src/inabox/utils';

describes.fakeWin('inabox-utils', {}, env => {
  let getResourcesInRectStub;
  let dispatchEventStub;
  let parentPostMessageStub;
  let initCustomEventStub;
  let ampdoc;

  beforeEach(() => {
    ampdoc = {win: env.win, getRootNode: () => ({})};
    getResourcesInRectStub = sandbox.stub();
    sandbox.stub(Services, 'resourcesForDoc').withArgs(ampdoc).returns(
        {getResourcesInRect: getResourcesInRectStub});
    sandbox.stub(Services, 'viewportForDoc').withArgs(ampdoc).returns(
        {getLayoutRect: () => ({})});
    parentPostMessageStub = sandbox.stub();
    dispatchEventStub = sandbox.stub();
    initCustomEventStub = sandbox.stub();
    env.win.parent = {postMessage: parentPostMessageStub};
    env.win.document =
      {createEvent: () => ({initCustomEvent: initCustomEventStub})};
    env.win.dispatchEvent = dispatchEventStub;
  });

  it('should fire custom event and postMessage', () => {
    const iniLoadDeferred = new Deferred();
    getResourcesInRectStub.returns(iniLoadDeferred.promise);
    registerIniLoadListener(ampdoc);
    expect(dispatchEventStub).to.not.be.called;
    expect(parentPostMessageStub).to.not.be.called;
    iniLoadDeferred.resolve([]);
    const timeDeferred = new Deferred();
    setTimeout(() => timeDeferred.resolve(), 10);
    return timeDeferred.promise.then(() => {
      expect(dispatchEventStub).to.be.calledOnce;
      expect(initCustomEventStub.withArgs('amp-ini-load', true, false, null))
          .to.be.calledOnce;
      expect(parentPostMessageStub.withArgs('amp-ini-load', '*'))
          .to.be.calledOnce;
    });
  });
});
