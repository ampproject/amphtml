/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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

import {pubmine} from '../../../ads/pubmine';

describe('pubmine', () => {
  it('should set pubmine publisher config on global if loader in a master frame', () => {
    const mockGlobal = {
      context: {
        isMaster: true,
      },
    };
    const mockData = {
      siteid: 'amp-test',
      section: 1,
      pt: 2,
      ht: 2,
    };
    const expectedConfig = {
      pt: 2,
      ht: 2,
      tn: 'amp',
      amp: true,
    };
    const mockScriptLoader = sandbox.spy();
    const mockSlotCreator = () => {};
    pubmine(mockGlobal, mockData, mockSlotCreator, mockScriptLoader);
    expect(mockGlobal.__ATA_PP).to.deep.equal(expectedConfig);
    expect(mockGlobal.__ATA.cmd).to.be.an('array');
    expect(mockGlobal.__ATA.cmd).to.have.length(1);
    expect(mockScriptLoader).to.be.calledOnce;
    expect(mockScriptLoader.args[0][1]).to.equal(
      'https://s.pubmine.com/head.js'
    );
  });
  it('should set pubmine publisher config on global if loaded in a slave frame', () => {
    const mockGlobal = {
      context: {
        isMaster: false,
        master: {
          __ATA: {
            cmd: [],
          },
        },
      },
    };
    const mockData = {
      siteid: 'amp-test',
      section: 1,
      pt: 2,
      ht: 2,
    };
    const mockScriptLoader = sandbox.spy();
    const mockSlotCreator = () => {};
    pubmine(mockGlobal, mockData, mockSlotCreator, mockScriptLoader);
    expect(mockGlobal.context.master.__ATA.cmd).to.be.an('array');
    expect(mockGlobal.context.master.__ATA.cmd).to.have.length(1);
    expect(mockScriptLoader).not.to.be.called;
  });
});
