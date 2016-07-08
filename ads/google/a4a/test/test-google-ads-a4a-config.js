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

import {googleAdsIsA4AEnabled} from '../traffic-experiments';
import {resetExperimentToggles_} from '../../../../src/experiments';
import {setModeForTesting} from '../../../../src/mode';
import * as sinon from 'sinon';

describe('a4a_config', () => {
  let sandbox;
  let win;
  let rand;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    rand = sandbox.stub(Math, 'random');
    setModeForTesting({localDev: true});
    win = {
      location: {
        href: 'https://cdn.ampproject.org/fnord',
        pathname: '/fnord',
        origin: 'https://cdn.ampproject.org',
      },
      document: {
        cookie: null,
      },
      crypto: {
        subtle: true,
        webkitSubtle: true,
      },
    };
  });

  afterEach(() => {
    resetExperimentToggles_();  // Clear saved, page-level experiment state.
    setModeForTesting(null);
    sandbox.restore();
  });

  const EXP_ID = 'EXP_ID';
  const BRANCHES = {control: 'CONTROL', experiment: 'EXPERIMENT'};

  it('should attach expt ID and return true when expt is on', () => {
    rand.onFirstCall().returns(-1);  // Force experiment on.
    rand.onSecondCall().returns(0.75);  // Select second branch.
    const element = document.createElement('div');
    expect(googleAdsIsA4AEnabled(win, element, EXP_ID, BRANCHES),
           'googleAdsIsA4AEnabled').to.be.true;
    expect(win.document.cookie).to.be.null;
    expect(rand.calledTwice, 'rand called twice').to.be.true;
    expect(element.getAttribute('data-experiment-id')).to.equal(
        BRANCHES.experiment);
  });

  it('should attach control ID and return false when control is on', () => {
    rand.onFirstCall().returns(-1);  // Force experiment on.
    rand.onSecondCall().returns(0.25);  // Select first branch.
    const element = document.createElement('div');
    expect(googleAdsIsA4AEnabled(win, element, EXP_ID, BRANCHES),
           'googleAdsIsA4AEnabled').to.be.false;
    expect(win.document.cookie).to.be.null;
    expect(rand.calledTwice, 'rand called twice').to.be.true;
    expect(element.getAttribute('data-experiment-id')).to.equal(
        BRANCHES.control);
  });

  it('should not attach ID and return false when selected out', () => {
    rand.onFirstCall().returns(2);  // Force experiment off.
    const element = document.createElement('div');
    expect(googleAdsIsA4AEnabled(win, element, EXP_ID, BRANCHES),
        'googleAdsIsA4AEnabled').to.be.false;
    expect(win.document.cookie).to.be.null;
    expect(rand.calledOnce, 'rand called once').to.be.true;
    expect(element.getAttribute('data-experiment-id')).to.not.be.ok;
  });

  it('should return false when not on CDN or local dev', () => {
    setModeForTesting({localDev: false});
    win.location.href = 'http://somewhere.over.the.rainbow.org/';
    const element = document.createElement('div');
    expect(googleAdsIsA4AEnabled(win, element, EXP_ID, BRANCHES),
           'googleAdsIsA4AEnabled').to.be.false;
    expect(win.document.cookie).to.be.null;
    expect(rand.called, 'rand called ever').to.be.false;
    expect(element.getAttribute('data-experiment-id')).to.not.be.ok;
  });

  it('should return false if no crypto is available', () => {
    win.crypto = null;
    rand.onFirstCall().returns(-1);  // Force experiment on.
    rand.onSecondCall().returns(0.75);  // Select second branch.
    const element = document.createElement('div');
    expect(googleAdsIsA4AEnabled(win, element, EXP_ID, BRANCHES),
           'googleAdsIsA4AEnabled').to.be.false;
    expect(win.document.cookie).to.be.null;
    expect(rand.called, 'rand called ever').to.be.false;
    expect(element.getAttribute('data-experiment-id')).to.not.be.ok;
  });

  it('should return true if only crypto.webkitSubtle is available', () => {
    win.crypto.subtle = null;
    rand.onFirstCall().returns(-1);  // Force experiment on.
    rand.onSecondCall().returns(0.75);  // Select second branch.
    const element = document.createElement('div');
    expect(googleAdsIsA4AEnabled(win, element, EXP_ID, BRANCHES),
           'googleAdsIsA4AEnabled').to.be.true;
  });

  it('should return true if only crypto.subtle is available', () => {
    win.crypto.webkitSubtle = null;
    rand.onFirstCall().returns(-1);  // Force experiment on.
    rand.onSecondCall().returns(0.75);  // Select second branch.
    const element = document.createElement('div');
    expect(googleAdsIsA4AEnabled(win, element, EXP_ID, BRANCHES),
           'googleAdsIsA4AEnabled').to.be.true;
  });

  ['?PARAM', '?p=blarg&PARAM', '?p=blarg&PARAM&s=987'].forEach(urlBase => {

    it(`should force experiment param from URL when pattern=${urlBase}`, () => {
      win.location.search = urlBase.replace('PARAM', 'a4a=2');
      rand.onFirstCall().returns(2);  // Force experiment off.
      const element = document.createElement('div');
      expect(googleAdsIsA4AEnabled(win, element, EXP_ID, BRANCHES),
             'googleAdsIsA4AEnabled').to.be.true;
      expect(win.document.cookie).to.be.null;
      expect(rand.called, 'rand called at least once').to.be.false;
      expect(element.getAttribute('data-experiment-id')).to.equal(
          BRANCHES.experiment);
    });

    it(`should force control param from URL when pattern=${urlBase}`, () => {
      win.location.search = urlBase.replace('PARAM', 'a4a=1');
      rand.onFirstCall().returns(2);  // Force experiment off.
      const element = document.createElement('div');
      // Should not register as 'A4A enabled', but should still attach the
      // control experiment ID.
      expect(googleAdsIsA4AEnabled(win, element, EXP_ID, BRANCHES),
             'googleAdsIsA4AEnabled').to.be.false;
      expect(win.document.cookie).to.be.null;
      expect(rand.called, 'rand called at least once').to.be.false;
      expect(element.getAttribute('data-experiment-id')).to.equal(
          BRANCHES.control);
    });

    it(`should exclude all experiment IDs when pattern=${urlBase}`, () => {
      win.location.search = urlBase.replace('PARAM', 'a4a=0');
      rand.onFirstCall().returns(2);  // Force experiment off.
      const element = document.createElement('div');
      // Should not register as 'A4A enabled', but should still attach the
      // control experiment ID.
      expect(googleAdsIsA4AEnabled(win, element, EXP_ID, BRANCHES),
             'googleAdsIsA4AEnabled').to.be.false;
      expect(win.document.cookie).to.be.null;
      expect(rand.called, 'rand called at least once').to.be.false;
      expect(element.getAttribute('data-experiment-id')).to.not.be.ok;
    });

  });

});
