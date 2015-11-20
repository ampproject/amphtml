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

import {isExperimentOn, toggleExperiment} from '../../src/experiments';
import * as sinon from 'sinon';


describe('isExperimentOn', () => {

  function expectExperiment(cookiesString, experimentId) {
    return expect(isExperimentOn({
      document: {
        cookie: cookiesString
      }
    }, experimentId));
  }

  it('should return "off" with no cookies, malformed or empty', () => {
    expectExperiment(null, 'e1').to.be.false;
    expectExperiment(undefined, 'e1').to.be.false;
    expectExperiment('', 'e1').to.be.false;
    expectExperiment('AMP_EXP', 'e1').to.be.false;
    expectExperiment('AMP_EXP=', 'e1').to.be.false;
  });

  it('should return "off" when value is not in the list', () => {
    expectExperiment('AMP_EXP=e1a,e2', 'e1').to.be.false;
  });

  it('should return "on" when value is in the list', () => {
    expectExperiment('AMP_EXP=e1', 'e1').to.be.true;
    expectExperiment('AMP_EXP=e1,e2', 'e1').to.be.true;
    expectExperiment('AMP_EXP=e2,e1', 'e1').to.be.true;
    expectExperiment('AMP_EXP=e2 , e1', 'e1').to.be.true;
  });
});


describe('toggleExperiment', () => {

  let sandbox;
  let clock;
  let expTime;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    clock = sandbox.useFakeTimers();
    clock.tick(1);
    expTime = new Date(1 + 180 * 24 * 60 * 60 * 1000).toUTCString();
  });

  afterEach(() => {
    clock.restore();
    clock = null;
    sandbox.restore();
    sandbox = null;
  });

  function expectToggle(cookiesString, experimentId, opt_on) {
    const doc = {
      cookie: cookiesString
    };
    const on = toggleExperiment({document: doc}, experimentId, opt_on);
    const parts = doc.cookie.split(/\s*;\s*/g);
    if (parts.length > 1) {
      expect(parts[1]).to.equal('path=/');
      expect(parts[2]).to.equal('expires=' + expTime);
    }
    return expect(`${on}; ${decodeURIComponent(parts[0])}`);
  }

  it('should toggle to "on" with no cookies, malformed or empty', () => {
    expectToggle(null, 'e1').to.equal('true; AMP_EXP=e1');
    expectToggle(undefined, 'e1').to.equal('true; AMP_EXP=e1');
    expectToggle('', 'e1').to.equal('true; AMP_EXP=e1');
    expectToggle('AMP_EXP', 'e1').to.equal('true; AMP_EXP=e1');
    expectToggle('AMP_EXP=', 'e1').to.equal('true; AMP_EXP=e1');
  });

  it('should toggle "on" when value is not in the list', () => {
    expectToggle('AMP_EXP=e1a,e2', 'e1').to.equal('true; AMP_EXP=e1a,e2,e1');
  });

  it('should toggle "off" when value is in the list', () => {
    expectToggle('AMP_EXP=e1', 'e1').to.equal('false; AMP_EXP=');
    expectToggle('AMP_EXP=e1,e2', 'e1').to.equal('false; AMP_EXP=e2');
    expectToggle('AMP_EXP=e2,e1', 'e1').to.equal('false; AMP_EXP=e2');
  });

  it('should set "on" when requested', () => {
    expectToggle('AMP_EXP=e2', 'e1', true).to.equal('true; AMP_EXP=e2,e1');
    expectToggle('AMP_EXP=e1', 'e1', true).to.equal('true; AMP_EXP=e1');
  });

  it('should set "off" when requested', () => {
    expectToggle('AMP_EXP=e2,e1', 'e1', false).to.equal('false; AMP_EXP=e2');
    expectToggle('AMP_EXP=e1', 'e1', false).to.equal('false; AMP_EXP=');
  });
});
