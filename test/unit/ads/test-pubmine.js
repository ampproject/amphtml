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

describes.fakeWin('pubmine', {}, env => {
  let win;
  const mockData = {
    siteid: 'amp-test',
    section: 1,
    pt: 2,
    ht: 2,
  };

  function getPubmineScriptElement() {
    return win.document.querySelector(
      'script[src="https://s.pubmine.com/head.js"]'
    );
  }

  function getSlotElement() {
    return win.document.querySelector('#atatags-amp-test1');
  }

  beforeEach(() => {
    win = env.win;
    win.document.body.innerHTML = '<div id="c"></div>';
  });

  it('should set pubmine publisher config on global if loader in a master frame', () => {
    win.context = {
      isMaster: true,
    };
    const expectedConfig = {
      pt: 2,
      ht: 2,
      tn: 'amp',
      amp: true,
    };
    pubmine(win, mockData);
    expect(win.__ATA_PP).to.deep.equal(expectedConfig);
    expect(win.__ATA.cmd).to.be.an('array');
    expect(win.__ATA.cmd).to.have.length(1);
    expect(getPubmineScriptElement()).to.be.ok;
    expect(getSlotElement()).to.be.ok;
  });

  it('should add a command and not to load the script if loaded in a slave frame', () => {
    win.__ATA = {
      cmd: [],
    };
    win.context = {
      isMaster: false,
      master: win,
    };
    pubmine(win, mockData);
    expect(win.context.master.__ATA.cmd).to.have.length(1);
    expect(getPubmineScriptElement()).to.be.null;
    expect(getSlotElement()).to.be.ok;
  });
});
