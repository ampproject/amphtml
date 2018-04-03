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

import {DocImpl} from '../doc-impl';


describes.realWin('DocImpl', {amp: true}, env => {
  let ampdoc;
  let configDoc;

  beforeEach(() => {
    ampdoc = env.ampdoc;
    configDoc = new DocImpl(ampdoc);
  });

  it('should proxy inteface to ampdoc', () => {
    expect(configDoc.getWin()).to.equal(ampdoc.win);
    expect(configDoc.getRootNode()).to.equal(ampdoc.getRootNode());
    expect(configDoc.getRootElement())
        .to.equal(ampdoc.getRootNode().documentElement);
    expect(configDoc.getHead()).to.equal(ampdoc.getHeadNode());
  });

  it('should resolve body correctly', () => {
    const body = {};
    let bodyAvailable = false;
    const bodyStub = sandbox.stub(ampdoc, 'getBody').callsFake(() => body);
    sandbox.stub(ampdoc, 'isBodyAvailable').callsFake(() => bodyAvailable);

    // Body not available yet.
    expect(configDoc.getBody()).to.be.null;
    expect(bodyStub).to.not.be.called;

    // Body is now available.
    bodyAvailable = true;
    expect(configDoc.getBody()).to.equal(body);
    expect(bodyStub).to.be.calledOnce;
  });

  it('should delegate ready signals to ampdoc', () => {
    const readyStub = sandbox.stub(ampdoc, 'isReady');
    const whenReadyStub = sandbox.stub(ampdoc, 'whenReady');

    configDoc.isReady();
    expect(readyStub).to.be.calledOnce;

    configDoc.whenReady();
    expect(whenReadyStub).to.be.calledOnce;
  });
});
