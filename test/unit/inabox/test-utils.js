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
import {createElementWithAttributes} from '../../../src/dom.js';
import {getA4AId, registerIniLoadListener} from '../../../src/inabox/utils';

describes.realWin('inabox-utils', {}, env => {
  let getResourcesInRectStub;
  let dispatchEventStub;
  let parentPostMessageStub;
  let initCustomEventStub;
  let ampdoc;
  let a4aIdMetaElement;

  function addA4AMetaTagToDocument() {
    a4aIdMetaElement = createElementWithAttributes(
        env.win.document,
        'meta',
        {
          name: 'amp4ads-id',
          content: 'vendor=doubleclick,type=impression-id,value=12345',
        }
    );
    env.win.document.head.appendChild(a4aIdMetaElement);
  }

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
    env.win.CustomEvent = (type, eventInit) => {
      initCustomEventStub(type, eventInit);
    };
    env.win.document.createEvent =
       () => ({initCustomEvent: initCustomEventStub});
    env.win.dispatchEvent = dispatchEventStub;
    env.win.sf_ = {
      cfg: {uid: 12},
    };
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
      expect(initCustomEventStub)
          .to.be.calledWith('amp-ini-load');
      expect(parentPostMessageStub.firstCall)
          .to.be.calledWith('amp-ini-load', '*');
      const sfMessage = JSON.parse(parentPostMessageStub.secondCall.args[0]);
      expect(sfMessage['c']).to.equal('sfchannel12');
      expect(sfMessage['s']).to.equal('creative_geometry_update');
      expect(JSON.parse(sfMessage['p'])['uid']).to.equal(12);
    });
  });

  it('Should not return an a4aId if no a4a meta tag in head', () => {
    expect(getA4AId(env.win)).to.be.not.ok;
  });


  it('Should be able to get the a4aId if on the document', () => {
    addA4AMetaTagToDocument();
    expect(getA4AId(env.win)).to.be.ok;
  });
});
