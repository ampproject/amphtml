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

import {installDocService} from '../../../../src/service/ampdoc-impl';
import {
    googleAdsIsA4AEnabled,
    isInExperiment,
    isInManualExperiment,
} from '../traffic-experiments';
import {resetExperimentToggles_} from '../../../../src/experiments';
import {installPlatformService} from '../../../../src/service/platform-impl';
import {installViewerServiceForDoc} from '../../../../src/service/viewer-impl';
import {resetServiceForTesting} from '../../../../src/service';
import {documentStateFor} from '../../../../src/service/document-state';
import * as sinon from 'sinon';

const EXP_ID = 'EXP_ID';
/** @type {!Branches} */
const EXTERNAL_BRANCHES = {
  control: 'EXT_CONTROL',
  experiment: 'EXT_EXPERIMENT',
};
/** @type {!Branches} */
const INTERNAL_BRANCHES = {
  control: 'INT_CONTROL',
  experiment: 'INT_EXPERIMENT',
};

describe('a4a_config', () => {
  let sandbox;
  let win;
  let rand;
  let events;
  let element;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    rand = sandbox.stub(Math, 'random');
    win = {
      AMP_MODE: {
        localDev: true,
      },
      location: {
        href: 'https://cdn.ampproject.org/fnord',
        pathname: '/fnord',
        origin: 'https://cdn.ampproject.org',
        hash: '',
      },
      document: {
        nodeType: /* DOCUMENT */ 9,
        hidden: false,
        cookie: null,
        visibilityState: 'visible',
        addEventListener: function(type, listener) {
          events[type] = listener;
        },
      },
      crypto: {
        subtle: true,
        webkitSubtle: true,
      },
      navigator: window.navigator,
    };
    win.document.defaultView = win;
    const ampdocService = installDocService(win, /* isSingleDoc */ true);
    const ampdoc = ampdocService.getAmpDoc();
    events = {};
    documentStateFor(win);
    installPlatformService(win);
    installViewerServiceForDoc(ampdoc);
    element = document.createElement('div');
    document.body.appendChild(element);
  });

  afterEach(() => {
    resetExperimentToggles_();  // Clear saved, page-level experiment state.
    resetServiceForTesting(win, 'viewer');
    sandbox.restore();
    document.body.removeChild(element);
  });

  it('should attach expt ID and return true when expt is on', () => {
    rand.onFirstCall().returns(-1);  // Force experiment on.
    rand.onSecondCall().returns(0.75);  // Select second branch.
    expect(googleAdsIsA4AEnabled(win, element, EXP_ID,
        EXTERNAL_BRANCHES, INTERNAL_BRANCHES),
           'googleAdsIsA4AEnabled').to.be.true;
    expect(win.document.cookie).to.be.null;
    expect(rand.calledTwice, 'rand called twice').to.be.true;
    expect(element.getAttribute('data-experiment-id')).to.equal(
        INTERNAL_BRANCHES.experiment);
  });

  it('should attach control ID and return false when control is on', () => {
    rand.onFirstCall().returns(-1);  // Force experiment on.
    rand.onSecondCall().returns(0.25);  // Select first branch.
    expect(googleAdsIsA4AEnabled(win, element, EXP_ID, EXTERNAL_BRANCHES,
        INTERNAL_BRANCHES),
           'googleAdsIsA4AEnabled').to.be.false;
    expect(win.document.cookie).to.be.null;
    expect(rand.calledTwice, 'rand called twice').to.be.true;
    expect(element.getAttribute('data-experiment-id')).to.equal(
        INTERNAL_BRANCHES.control);
  });

  it('should not attach ID and return false when selected out', () => {
    rand.onFirstCall().returns(2);  // Force experiment off.
    expect(googleAdsIsA4AEnabled(win, element, EXP_ID, EXTERNAL_BRANCHES,
        INTERNAL_BRANCHES), 'googleAdsIsA4AEnabled').to.be.false;
    expect(win.document.cookie).to.be.null;
    expect(rand.calledOnce, 'rand called once').to.be.true;
    expect(element.getAttribute('data-experiment-id')).to.not.be.ok;
  });

  it('should return false when not on CDN or local dev', () => {
    win.AMP_MODE.localDev = false;
    win.location.href = 'http://somewhere.over.the.rainbow.org/';
    expect(googleAdsIsA4AEnabled(win, element, EXP_ID, EXTERNAL_BRANCHES,
        INTERNAL_BRANCHES), 'googleAdsIsA4AEnabled').to.be.false;
    expect(win.document.cookie).to.be.null;
    expect(rand).to.not.be.called;
    expect(element.getAttribute('data-experiment-id')).to.not.be.ok;
  });

  it('should return false if no crypto is available', () => {
    win.crypto = null;
    rand.onFirstCall().returns(-1);  // Force experiment on.
    rand.onSecondCall().returns(0.75);  // Select second branch.
    expect(googleAdsIsA4AEnabled(win, element, EXP_ID, EXTERNAL_BRANCHES,
        INTERNAL_BRANCHES), 'googleAdsIsA4AEnabled').to.be.false;
    expect(win.document.cookie).to.be.null;
    expect(rand).to.not.be.called;
    expect(element.getAttribute('data-experiment-id')).to.not.be.ok;
  });

  it('should return true if only crypto.webkitSubtle is available', () => {
    win.crypto.subtle = null;
    rand.onFirstCall().returns(-1);  // Force experiment on.
    rand.onSecondCall().returns(0.75);  // Select second branch.
    expect(googleAdsIsA4AEnabled(win, element, EXP_ID, EXTERNAL_BRANCHES,
        INTERNAL_BRANCHES), 'googleAdsIsA4AEnabled').to.be.true;
  });

  it('should return true if only crypto.subtle is available', () => {
    win.crypto.webkitSubtle = null;
    rand.onFirstCall().returns(-1);  // Force experiment on.
    rand.onSecondCall().returns(0.75);  // Select second branch.
    expect(googleAdsIsA4AEnabled(win, element, EXP_ID, EXTERNAL_BRANCHES,
        INTERNAL_BRANCHES), 'googleAdsIsA4AEnabled').to.be.true;
  });

  const urlBaseConditions = ['?exp=PARAM',
    '?p=blarg&exp=PARAM',
    '?p=blarg&exp=PARAM&s=987',
    '?p=blarg&exp=zort:123,PARAM,spaz:987&s=987'];
  urlBaseConditions.forEach(urlBase => {

    it('should skip url-triggered eid when param is bad', () => {
      win.location.search = urlBase.replace('PARAM', 'a4a:spaz');
      // Force random client-side selection off.
      rand.onFirstCall().returns(2);
      expect(googleAdsIsA4AEnabled(win, element, EXP_ID, EXTERNAL_BRANCHES,
          INTERNAL_BRANCHES), 'googleAdsIsA4AEnabled').to.be.false;
      expect(win.document.cookie).to.be.null;
      expect(rand, 'rand called at least once').to.be.called;
      expect(element.getAttribute('data-experiment-id')).to.not.be.ok;
    });

    it('should skip url-triggered eid when param is empty', () => {
      win.location.search = urlBase.replace('PARAM', 'a4a:');
      // Force random client-side selection off.
      rand.onFirstCall().returns(2);
      expect(googleAdsIsA4AEnabled(win, element, EXP_ID, EXTERNAL_BRANCHES,
          INTERNAL_BRANCHES), 'googleAdsIsA4AEnabled').to.be.false;
      expect(win.document.cookie).to.be.null;
      expect(rand, 'rand called at least once').to.be.called;
      expect(element.getAttribute('data-experiment-id')).to.not.be.ok;
    });

    it('should fall back to client-side eid when param is bad', () => {
      win.location.search = urlBase.replace('PARAM', 'a4a:spaz');
      // Force random client-side selection on.
      rand.onFirstCall().returns(-1);
      // Force experiment branch.
      rand.onSecondCall().returns(0.75);
      expect(googleAdsIsA4AEnabled(win, element, EXP_ID, EXTERNAL_BRANCHES,
          INTERNAL_BRANCHES), 'googleAdsIsA4AEnabled').to.be.true;
      expect(win.document.cookie).to.be.null;
      expect(rand, 'rand called at least once').to.be.called;
      expect(element.getAttribute('data-experiment-id')).to.equal(
          INTERNAL_BRANCHES.experiment);
    });

    it('should fall back to client-side eid when param is empty', () => {
      win.location.search = urlBase.replace('PARAM', 'a4a:');
      // Force random client-side selection on.
      rand.onFirstCall().returns(-1);
      // Force experiment branch.
      rand.onSecondCall().returns(0.75);
      expect(googleAdsIsA4AEnabled(win, element, EXP_ID, EXTERNAL_BRANCHES,
          INTERNAL_BRANCHES), 'googleAdsIsA4AEnabled').to.be.true;
      expect(win.document.cookie).to.be.null;
      expect(rand, 'rand called at least once').to.be.called;
      expect(element.getAttribute('data-experiment-id')).to.equal(
          INTERNAL_BRANCHES.experiment);
    });

    it(`should force experiment param from URL when pattern=${urlBase}`,
        () => {
          win.location.search = urlBase.replace('PARAM', 'a4a:2');
          // Ensure that internal branches aren't attached, even if the PRNG
          // would normally trigger them.
          rand.onFirstCall().returns(-1);
          expect(googleAdsIsA4AEnabled(win, element, EXP_ID, EXTERNAL_BRANCHES,
              INTERNAL_BRANCHES), 'googleAdsIsA4AEnabled').to.be.true;
          expect(win.document.cookie).to.be.null;
          expect(rand).to.not.be.called;
          expect(element.getAttribute('data-experiment-id')).to.equal(
              EXTERNAL_BRANCHES.experiment);
        });

    it(`should force control param from URL when pattern=${urlBase}`, () => {
      win.location.search = urlBase.replace('PARAM', 'a4a:1');
      // Ensure that internal branches aren't attached, even if the PRNG
      // would normally trigger them.
      rand.onFirstCall().returns(-1);
      // Should not register as 'A4A enabled', but should still attach the
      // control experiment ID.
      expect(googleAdsIsA4AEnabled(win, element, EXP_ID, EXTERNAL_BRANCHES,
          INTERNAL_BRANCHES), 'googleAdsIsA4AEnabled').to.be.false;
      expect(win.document.cookie).to.be.null;
      expect(rand).to.not.be.called;
      expect(element.getAttribute('data-experiment-id')).to.equal(
          EXTERNAL_BRANCHES.control);
    });

    it(`should exclude all experiment IDs when pattern=${urlBase}`, () => {
      win.location.search = urlBase.replace('PARAM', 'a4a:0');
      // Ensure that internal branches aren't attached, even if the PRNG
      // would normally trigger them.
      rand.onFirstCall().returns(-1);
      // Should not register as 'A4A enabled', but should still attach the
      // control experiment ID.
      expect(googleAdsIsA4AEnabled(win, element, EXP_ID, EXTERNAL_BRANCHES,
          INTERNAL_BRANCHES), 'googleAdsIsA4AEnabled').to.be.false;
      expect(win.document.cookie).to.be.null;
      expect(rand).to.not.be.called;
      expect(element.getAttribute('data-experiment-id')).to.not.be.ok;
    });

    it(`should attach manual experiment ID when pattern = ${urlBase}`, () => {
      win.location.search = urlBase.replace('PARAM', 'a4a:-1');
      // Ensure that internal branches aren't attached, even if the PRNG
      // would normally trigger them.
      rand.onFirstCall().returns(-1);
      // Should not register as 'A4A enabled', but should still attach the
      // control experiment ID.
      expect(googleAdsIsA4AEnabled(win, element, EXP_ID, EXTERNAL_BRANCHES,
          INTERNAL_BRANCHES), 'googleAdsIsA4AEnabled').to.be.true;
      expect(win.document.cookie).to.be.null;
      expect(rand).to.not.be.called;
      expect(isInManualExperiment(element), 'element in manual experiment')
          .to.be.true;
      // And it shouldn't be in any *other* experiments.
      for (const branch in EXTERNAL_BRANCHES) {
        expect(isInExperiment(element, EXTERNAL_BRANCHES[branch]),
            'element in ', EXTERNAL_BRANCHES[branch]).to.be.false;
      }
      for (const branch in EXTERNAL_BRANCHES) {
        expect(isInExperiment(element, INTERNAL_BRANCHES[branch]),
            'element in ', EXTERNAL_BRANCHES[branch]).to.be.false;
      }
    });
  });
});

// These tests are separated because they need to invoke
// installViewerServiceForDoc within the test, rather than in the beforeEach().
describe('a4a_config hash param parsing', () => {
  let sandbox;
  let win;
  let ampdoc;
  let rand;
  let events;
  let element;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    rand = sandbox.stub(Math, 'random');
    win = {
      AMP_MODE: {
        localDev: true,
      },
      location: {
        href: 'https://cdn.ampproject.org/fnord',
        pathname: '/fnord',
        origin: 'https://cdn.ampproject.org',
        hash: '',
        search: 'somewhere=over&the=rainbow',
      },
      document: {
        nodeType: /* DOCUMENT */ 9,
        hidden: false,
        cookie: null,
        visibilityState: 'visible',
        addEventListener: function(type, listener) {
          events[type] = listener;
        },
      },
      crypto: {
        subtle: true,
        webkitSubtle: true,
      },
      navigator: window.navigator,
    };
    win.document.defaultView = win;
    const ampdocService = installDocService(win, /* isSingleDoc */ true);
    ampdoc = ampdocService.getAmpDoc();
    events = {};
    installPlatformService(win);
    documentStateFor(win);
    const attrs = {};
    element = {
      nodeType: /* ELEMENT */ 1,
      ownerDocument: {defaultView: win},
      getAttribute: name => attrs[name],
      setAttribute: (name, value) => attrs[name] = value,
    };
  });

  afterEach(() => {
    resetExperimentToggles_();  // Clear saved, page-level experiment state.
    resetServiceForTesting(win, 'viewer');
    sandbox.restore();
  });

  const hashBaseConditions = ['#exp=PARAM',
    '#p=blarg&exp=PARAM',
    '#p=blarg&exp=PARAM&s=987',
    '#p=blarg&exp=zort:123,PARAM,spaz:987&s=987'];

  hashBaseConditions.forEach(hashBase => {
    it(`should find viewer param when pattern is ${hashBase}`, () => {
      win.location.hash = hashBase.replace('PARAM', 'a4a:-1');
      installViewerServiceForDoc(ampdoc);
      // Ensure that internal branches aren't attached, even if the PRNG
      // would normally trigger them.
      rand.onFirstCall().returns(-1);
      // Should not register as 'A4A enabled', but should still attach the
      // control experiment ID.
      expect(googleAdsIsA4AEnabled(win, element, EXP_ID, EXTERNAL_BRANCHES,
          INTERNAL_BRANCHES), 'googleAdsIsA4AEnabled').to.be.true;
      expect(win.document.cookie).to.be.null;
      expect(rand).to.not.be.called;
      expect(isInManualExperiment(element), 'element in manual experiment')
          .to.be.true;
      // And it shouldn't be in any *other* experiments.
      for (const branch in EXTERNAL_BRANCHES) {
        expect(isInExperiment(element, EXTERNAL_BRANCHES[branch]),
            'element in ', EXTERNAL_BRANCHES[branch]).to.be.false;
      }
      for (const branch in EXTERNAL_BRANCHES) {
        expect(isInExperiment(element, INTERNAL_BRANCHES[branch]),
            'element in ', EXTERNAL_BRANCHES[branch]).to.be.false;
      }
    });

    it(`hash should trump search; pattern=${hashBase}`, () => {
      win.location.search = hashBase.replace('PARAM', 'a4a:-1');
      win.location.hash = hashBase.replace('PARAM', 'a4a:2');
      installViewerServiceForDoc(ampdoc);
      // Ensure that internal branches aren't attached, even if the PRNG
      // would normally trigger them.
      rand.onFirstCall().returns(-1);
      expect(googleAdsIsA4AEnabled(win, element, EXP_ID, EXTERNAL_BRANCHES,
          INTERNAL_BRANCHES), 'googleAdsIsA4AEnabled').to.be.true;
      expect(win.document.cookie).to.be.null;
      expect(rand).to.not.be.called;
      expect(element.getAttribute('data-experiment-id')).to.equal(
          EXTERNAL_BRANCHES.experiment);
    });
  });
});
