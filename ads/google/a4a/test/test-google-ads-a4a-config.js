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

import {ampdocServiceFor} from '../../../../src/ampdoc';
import {installDocService} from '../../../../src/service/ampdoc-impl';
import {
    googleAdsIsA4AEnabled,
    isInExperiment,
    isInManualExperiment,
    isExternallyTriggeredExperiment,
    isInternallyTriggeredExperiment,
} from '../traffic-experiments';
import {isExperimentOn, toggleExperiment, resetExperimentTogglesForTesting} from '../../../../src/experiments';
import {installPlatformService} from '../../../../src/service/platform-impl';
import {installViewerServiceForDoc} from '../../../../src/service/viewer-impl';
import {resetServiceForTesting} from '../../../../src/service';
import {
  installDocumentStateService,
} from '../../../../src/service/document-state';
import * as sinon from 'sinon';
import {
  DOUBLECLICK_A4A_EXTERNAL_EXPERIMENT_BRANCHES_PRE_LAUNCH,
  DOUBLECLICK_A4A_INTERNAL_EXPERIMENT_BRANCHES_PRE_LAUNCH,
  DOUBLECLICK_A4A_EXTERNAL_EXPERIMENT_BRANCHES_POST_LAUNCH,
  DOUBLECLICK_A4A_INTERNAL_EXPERIMENT_BRANCHES_POST_LAUNCH,
} from '../../../../extensions/amp-ad-network-doubleclick-impl/0.1/doubleclick-a4a-config.js'; // eslint-disable-line

const EXP_ID = 'EXP_ID';

// Note: All branch IDs must be string formatted numbers so that they pass
// validateExperimentIds and are preserved by addExperimentIdToElement.
/** @type {!Branches} */
const EXTERNAL_BRANCHES = {
  control: '1',
  experiment: '2',
};
/** @type {!Branches} */
const INTERNAL_BRANCHES = {
  control: '3',
  experiment: '4',
};

/**
 * Checks that element's data-experiment-id tag contains the specified id and
 * that it does not contain any of the {EXTERNAL,INTERNAL} branches other than
 * id.
 *
 * @param {!Element} element
 * @param {string} id
 */
function expectThereCanBeOnlyOne(element, id) {
  const notHave = [
    EXTERNAL_BRANCHES.control,
    EXTERNAL_BRANCHES.experiment,
    INTERNAL_BRANCHES.control,
    INTERNAL_BRANCHES.experiment,
  ].filter(x => {
    return x != id;
  });
  notHave.forEach(eid => {
    expect(isInExperiment(element, eid),
        `expected ${eid} not to be in ${element.getAttribute(
            'data-experiment-id')}`).to.be.false;
  });
  expect(isInExperiment(element, id),
      `expected ${id} to be in ${element.getAttribute(
          'data-experiment-id')}`).to.be.true;
}

/**
 * Checks that element's data-element-id contains the "is internally triggered"
 * experiment ID and that it does not contain the "is externally triggered"
 * eid.
 *
 * @param {!Element} element
 */
function expectInternallyTriggered(element) {
  expect(isInternallyTriggeredExperiment(element)).to.be.true;
  expect(isExternallyTriggeredExperiment(element)).to.be.false;
}

/**
 * Checks that element's data-element-id contains the "is externally triggered"
 * experiment ID and that it does not contain the "is internally triggered"
 * eid.
 *
 * @param {!Element} element
 */
function expectExternallyTriggered(element) {
  expect(isInternallyTriggeredExperiment(element)).to.be.false;
  expect(isExternallyTriggeredExperiment(element)).to.be.true;
}

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
        hostname: 'cdn.ampproject.org',
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
      pageExperimentBranches: {},
    };
    win.document.defaultView = win;
    installDocService(win, /* isSingleDoc */ true);
    const ampdoc = ampdocServiceFor(win).getAmpDoc();
    events = {};
    installDocumentStateService(win);
    installPlatformService(win);
    installViewerServiceForDoc(ampdoc);
    element = document.createElement('div');
    document.body.appendChild(element);
    toggleExperiment(win, EXP_ID, true, true);
  });

  afterEach(() => {
    resetServiceForTesting(win, 'viewer');
    sandbox.restore();
    document.body.removeChild(element);
  });

  it('should attach expt ID and return true when expt is on', () => {
    rand.returns(0.75);  // Random value to select the 2nd branch
    expect(googleAdsIsA4AEnabled(win, element, EXP_ID,
        EXTERNAL_BRANCHES, INTERNAL_BRANCHES),
           'googleAdsIsA4AEnabled').to.be.true;
    expect(win.document.cookie).to.be.null;
    expectThereCanBeOnlyOne(element, INTERNAL_BRANCHES.experiment);
    expectInternallyTriggered(element);
  });

  it('should attach control ID and return false when control is on', () => {
    rand.returns(0.25);  // Random value to select the 1st branch
    expect(googleAdsIsA4AEnabled(win, element, EXP_ID, EXTERNAL_BRANCHES,
        INTERNAL_BRANCHES),
           'googleAdsIsA4AEnabled').to.be.false;
    expect(win.document.cookie).to.be.null;
    expectThereCanBeOnlyOne(element, INTERNAL_BRANCHES.control);
    expectInternallyTriggered(element);
  });

  it('should not attach ID and return false when selected out', () => {
    toggleExperiment(win, EXP_ID, false, true);
    expect(googleAdsIsA4AEnabled(win, element, EXP_ID, EXTERNAL_BRANCHES,
        INTERNAL_BRANCHES), 'googleAdsIsA4AEnabled').to.be.false;
    expect(win.document.cookie).to.be.null;
    expect(element.getAttribute('data-experiment-id')).to.not.be.ok;
  });

  it('should return false when not on CDN or local dev', () => {
    toggleExperiment(win, EXP_ID, false, true);
    win.AMP_MODE.localDev = false;
    win.location.href = 'http://somewhere.over.the.rainbow.org/';
    expect(googleAdsIsA4AEnabled(win, element, EXP_ID, EXTERNAL_BRANCHES,
        INTERNAL_BRANCHES), 'googleAdsIsA4AEnabled').to.be.false;
    expect(win.document.cookie).to.be.null;
    expect(element.getAttribute('data-experiment-id')).to.not.be.ok;
  });

  it('should return false if no crypto is available', () => {
    win.crypto = null;
    rand.returns(0.75);  // Random value to select the 2nd branch
    expect(googleAdsIsA4AEnabled(win, element, EXP_ID, EXTERNAL_BRANCHES,
        INTERNAL_BRANCHES), 'googleAdsIsA4AEnabled').to.be.false;
    expect(win.document.cookie).to.be.null;
    expect(element.getAttribute('data-experiment-id')).to.not.be.ok;
  });

  it('should return true if only crypto.webkitSubtle is available', () => {
    win.crypto.subtle = null;
    rand.returns(0.75);  // Random value to select the 2nd branch
    expect(googleAdsIsA4AEnabled(win, element, EXP_ID, EXTERNAL_BRANCHES,
        INTERNAL_BRANCHES), 'googleAdsIsA4AEnabled').to.be.true;
    expectThereCanBeOnlyOne(element, INTERNAL_BRANCHES.experiment);
  });

  it('should return true if only crypto.subtle is available', () => {
    win.crypto.webkitSubtle = null;
    rand.returns(0.75);  // Random value to select the 2nd branch
    expect(googleAdsIsA4AEnabled(win, element, EXP_ID, EXTERNAL_BRANCHES,
        INTERNAL_BRANCHES), 'googleAdsIsA4AEnabled').to.be.true;
    expectThereCanBeOnlyOne(element, INTERNAL_BRANCHES.experiment);
  });

  const urlBaseConditions = ['?exp=PARAM',
    '?p=blarg&exp=PARAM',
    '?p=blarg&exp=PARAM&s=987',
    '?p=blarg&exp=zort:123,PARAM,spaz:987&s=987'];
  urlBaseConditions.forEach(urlBase => {

    it('should skip url-triggered eid when param is bad', () => {
      win.location.search = urlBase.replace('PARAM', 'a4a:spaz');
      toggleExperiment(win, EXP_ID, false, true);
      expect(googleAdsIsA4AEnabled(win, element, EXP_ID, EXTERNAL_BRANCHES,
          INTERNAL_BRANCHES), 'googleAdsIsA4AEnabled').to.be.false;
      expect(win.document.cookie).to.be.null;
      expect(element.getAttribute('data-experiment-id')).to.not.be.ok;
    });

    it('should skip url-triggered eid when param is empty', () => {
      win.location.search = urlBase.replace('PARAM', 'a4a:');
      // Force random client-side selection off.
      toggleExperiment(win, EXP_ID, false, true);
      expect(googleAdsIsA4AEnabled(win, element, EXP_ID, EXTERNAL_BRANCHES,
          INTERNAL_BRANCHES), 'googleAdsIsA4AEnabled').to.be.false;
      expect(win.document.cookie).to.be.null;
      expect(element.getAttribute('data-experiment-id')).to.not.be.ok;
    });

    it('should fall back to client-side eid when param is bad', () => {
      win.location.search = urlBase.replace('PARAM', 'a4a:spaz');
      rand.returns(0.75);  // Random value to select the 2nd branch
      expect(googleAdsIsA4AEnabled(win, element, EXP_ID, EXTERNAL_BRANCHES,
          INTERNAL_BRANCHES), 'googleAdsIsA4AEnabled').to.be.true;
      expect(win.document.cookie).to.be.null;
      expectThereCanBeOnlyOne(element, INTERNAL_BRANCHES.experiment);
      expectInternallyTriggered(element);
    });

    it('should fall back to client-side eid when param is empty', () => {
      win.location.search = urlBase.replace('PARAM', 'a4a:');
      rand.returns(0.75);  // Random value to select the 2nd branch
      expect(googleAdsIsA4AEnabled(win, element, EXP_ID, EXTERNAL_BRANCHES,
          INTERNAL_BRANCHES), 'googleAdsIsA4AEnabled').to.be.true;
      expect(win.document.cookie).to.be.null;
      expectThereCanBeOnlyOne(element, INTERNAL_BRANCHES.experiment);
      expectInternallyTriggered(element);
    });

    it(`should force experiment param from URL when pattern=${urlBase}`,
        () => {
          win.location.search = urlBase.replace('PARAM', 'a4a:2');
          expect(googleAdsIsA4AEnabled(win, element, EXP_ID, EXTERNAL_BRANCHES,
              INTERNAL_BRANCHES), 'googleAdsIsA4AEnabled').to.be.true;
          expect(win.document.cookie).to.be.null;
          expectThereCanBeOnlyOne(element, EXTERNAL_BRANCHES.experiment);
          expectExternallyTriggered(element);
        });

    it(`should force control param from URL when pattern=${urlBase}`, () => {
      win.location.search = urlBase.replace('PARAM', 'a4a:1');
      // Should not register as 'A4A enabled', but should still attach the
      // control experiment ID.
      expect(googleAdsIsA4AEnabled(win, element, EXP_ID, EXTERNAL_BRANCHES,
          INTERNAL_BRANCHES), 'googleAdsIsA4AEnabled').to.be.false;
      expect(win.document.cookie).to.be.null;
      expectThereCanBeOnlyOne(element, EXTERNAL_BRANCHES.control);
      expectExternallyTriggered(element);
    });

    it(`should exclude all experiment IDs when pattern=${urlBase}`, () => {
      win.location.search = urlBase.replace('PARAM', 'a4a:0');
      // Should not register as 'A4A enabled', but should still attach the
      // control experiment ID.
      expect(googleAdsIsA4AEnabled(win, element, EXP_ID, EXTERNAL_BRANCHES,
          INTERNAL_BRANCHES), 'googleAdsIsA4AEnabled').to.be.false;
      expect(win.document.cookie).to.be.null;
      expect(element.getAttribute('data-experiment-id')).to.not.be.ok;
    });

    it(`should attach manual experiment ID when pattern = ${urlBase}`, () => {
      win.location.search = urlBase.replace('PARAM', 'a4a:-1');
      // Should not register as 'A4A enabled', but should still attach the
      // control experiment ID.
      expect(googleAdsIsA4AEnabled(win, element, EXP_ID, EXTERNAL_BRANCHES,
          INTERNAL_BRANCHES), 'googleAdsIsA4AEnabled').to.be.true;
      expect(win.document.cookie).to.be.null;
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
  it('should serve Delayed Fetch to unlaunched DoubleClick filler',
    () => {
    toggleExperiment(win, 'a4aFastFetchDoubleclickLaunched', false, true);
    element.setAttribute('type', 'doubleclick');
    expect(googleAdsIsA4AEnabled(win, element, 'expDoubleclickA4A',
      DOUBLECLICK_A4A_EXTERNAL_EXPERIMENT_BRANCHES_PRE_LAUNCH,
      DOUBLECLICK_A4A_INTERNAL_EXPERIMENT_BRANCHES_PRE_LAUNCH)).to.be.false;
    });
  it('should serve Delayed Fetch to unlaunched DoubleClick control',
    () => {
      toggleExperiment(win, 'a4aFastFetchDoubleclickLaunched', false, true);
      toggleExperiment(win, 'expDoubleclickA4A', true, true);
      element.setAttribute('type', 'doubleclick');
      win.pageExperimentBranches['expDoubleclickA4A'] =
        DOUBLECLICK_A4A_EXTERNAL_EXPERIMENT_BRANCHES_PRE_LAUNCH.control;
      expect(googleAdsIsA4AEnabled(win, element, 'expDoubleclickA4A',
        DOUBLECLICK_A4A_EXTERNAL_EXPERIMENT_BRANCHES_PRE_LAUNCH,
        DOUBLECLICK_A4A_INTERNAL_EXPERIMENT_BRANCHES_PRE_LAUNCH)).to.be.false;
    });
  it('should serve Fast Fetch to unlaunched DoubleClick experiment',
    () => {
      toggleExperiment(win, 'a4aFastFetchDoubleclickLaunched', false, true);
      toggleExperiment(win, 'expDoubleclickA4A', true, true);
      element.setAttribute('type', 'doubleclick');
      win.pageExperimentBranches['expDoubleclickA4A'] =
        DOUBLECLICK_A4A_EXTERNAL_EXPERIMENT_BRANCHES_PRE_LAUNCH.experiment;
      expect(googleAdsIsA4AEnabled(win, element, 'expDoubleclickA4A',
        DOUBLECLICK_A4A_EXTERNAL_EXPERIMENT_BRANCHES_PRE_LAUNCH,
        DOUBLECLICK_A4A_INTERNAL_EXPERIMENT_BRANCHES_PRE_LAUNCH)).to.be.true;
    });
  it('should serve Fast Fetch to launched DoubleClick filler',
    () => {
      toggleExperiment(win, 'a4aFastFetchDoubleclickLaunched', true, true);
      element.setAttribute('type', 'doubleclick');
      expect(googleAdsIsA4AEnabled(win, element, 'expDoubleclickA4A',
        DOUBLECLICK_A4A_EXTERNAL_EXPERIMENT_BRANCHES_POST_LAUNCH,
        DOUBLECLICK_A4A_INTERNAL_EXPERIMENT_BRANCHES_POST_LAUNCH)).to.be.true;
    });
  it('should serve Fast Fetch to launched DoubleClick control',
    () => {
      toggleExperiment(win, 'a4aFastFetchDoubleclickLaunched', true, true);
      toggleExperiment(win, 'expDoubleclickA4A', true, true);
      element.setAttribute('type', 'doubleclick');
      win.pageExperimentBranches['expDoubleclickA4A'] =
        DOUBLECLICK_A4A_EXTERNAL_EXPERIMENT_BRANCHES_POST_LAUNCH.control;
      expect(googleAdsIsA4AEnabled(win, element, 'expDoubleclickA4A',
        DOUBLECLICK_A4A_EXTERNAL_EXPERIMENT_BRANCHES_POST_LAUNCH,
        DOUBLECLICK_A4A_INTERNAL_EXPERIMENT_BRANCHES_POST_LAUNCH)).to.be.true;
    });
  it('should serve Delayed Fetch to launched DoubleClick experiment (holdback)',
    () => {
      toggleExperiment(win, 'a4aFastFetchDoubleclickLaunched', true, true);
      toggleExperiment(win, 'expDoubleclickA4A', true, true);
      element.setAttribute('type', 'doubleclick');
      win.pageExperimentBranches['expDoubleclickA4A'] =
        DOUBLECLICK_A4A_EXTERNAL_EXPERIMENT_BRANCHES_POST_LAUNCH.experiment;
      expect(googleAdsIsA4AEnabled(win, element, 'expDoubleclickA4A',
        DOUBLECLICK_A4A_EXTERNAL_EXPERIMENT_BRANCHES_POST_LAUNCH,
        DOUBLECLICK_A4A_INTERNAL_EXPERIMENT_BRANCHES_POST_LAUNCH)).to.be.false;
    });
  it('should serve Delayed Fetch to unlaunched DoubleClick filler (URL)',
    () => {
      win.location.search = '?exp=a4a:0';
      toggleExperiment(win, 'a4aFastFetchDoubleclickLaunched', false, true);
      element.setAttribute('type', 'doubleclick');
      expect(googleAdsIsA4AEnabled(win, element, EXP_ID,
        DOUBLECLICK_A4A_EXTERNAL_EXPERIMENT_BRANCHES_PRE_LAUNCH,
        DOUBLECLICK_A4A_INTERNAL_EXPERIMENT_BRANCHES_PRE_LAUNCH)).to.be.false;
      expect(win.document.cookie).to.be.null;
    });
  it('should serve Delayed Fetch to unlaunched DoubleClick control (URL)',
    () => {
      win.location.search = '?exp=a4a:1';
      toggleExperiment(win, 'a4aFastFetchDoubleclickLaunched', false, true);
      element.setAttribute('type', 'doubleclick');
      expect(googleAdsIsA4AEnabled(win, element, EXP_ID,
        DOUBLECLICK_A4A_EXTERNAL_EXPERIMENT_BRANCHES_PRE_LAUNCH,
        DOUBLECLICK_A4A_INTERNAL_EXPERIMENT_BRANCHES_PRE_LAUNCH)).to.be.false;
      expect(win.document.cookie).to.be.null;
    });
  it('should serve Fast Fetch to unlaunched DoubleClick experiment (URL)',
    () => {
      win.location.search = '?exp=a4a:2';
      toggleExperiment(win, 'a4aFastFetchDoubleclickLaunched', false, true);
      element.setAttribute('type', 'doubleclick');
      expect(googleAdsIsA4AEnabled(win, element, EXP_ID,
        DOUBLECLICK_A4A_EXTERNAL_EXPERIMENT_BRANCHES_PRE_LAUNCH,
        DOUBLECLICK_A4A_INTERNAL_EXPERIMENT_BRANCHES_PRE_LAUNCH)).to.be.true;
      expect(win.document.cookie).to.be.null;
    });
  it('should serve Fast Fetch to launched DoubleClick filler (URL)',
    () => {
      win.location.search = '?exp=a4a:0';
      toggleExperiment(win, 'a4aFastFetchDoubleclickLaunched', true, true);
      element.setAttribute('type', 'doubleclick');
      expect(googleAdsIsA4AEnabled(win, element, EXP_ID,
        DOUBLECLICK_A4A_EXTERNAL_EXPERIMENT_BRANCHES_POST_LAUNCH,
        DOUBLECLICK_A4A_INTERNAL_EXPERIMENT_BRANCHES_POST_LAUNCH)).to.be.true;
      expect(win.document.cookie).to.be.null;
    });
  it('should serve Fast Fetch to launched DoubleClick control (URL)',
    () => {
      win.location.search = '?exp=a4a:1';
      toggleExperiment(win, 'a4aFastFetchDoubleclickLaunched', true, true);
      element.setAttribute('type', 'doubleclick');
      expect(googleAdsIsA4AEnabled(win, element, EXP_ID,
        DOUBLECLICK_A4A_EXTERNAL_EXPERIMENT_BRANCHES_POST_LAUNCH,
        DOUBLECLICK_A4A_INTERNAL_EXPERIMENT_BRANCHES_POST_LAUNCH)).to.be.true;
      expect(win.document.cookie).to.be.null;
    });
  it('should serve Delayed Fetch to launched DoubleClick experiment (URL)',
    () => {
      win.location.search = '?exp=a4a:2';
      toggleExperiment(win, 'a4aFastFetchDoubleclickLaunched', true, true);
      element.setAttribute('type', 'doubleclick');
      expect(googleAdsIsA4AEnabled(win, element, EXP_ID,
        DOUBLECLICK_A4A_EXTERNAL_EXPERIMENT_BRANCHES_POST_LAUNCH,
        DOUBLECLICK_A4A_INTERNAL_EXPERIMENT_BRANCHES_POST_LAUNCH)).to.be.false;
      expect(win.document.cookie).to.be.null;
    });
  // TODO(jonkeller): AdSense tests also
});

// These tests are separated because they need to invoke
// installViewerServiceForDoc within the test, rather than in the beforeEach().
describe('a4a_config hash param parsing', () => {
  let sandbox;
  let win;
  let ampdoc;
  let events;
  let element;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
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
    installDocService(win, /* isSingleDoc */ true);
    ampdoc = ampdocServiceFor(win).getAmpDoc();
    events = {};
    installPlatformService(win);
    installDocumentStateService(win);
    const attrs = {};
    element = {
      nodeType: /* ELEMENT */ 1,
      ownerDocument: {defaultView: win},
      getAttribute: name => attrs[name],
      setAttribute: (name, value) => attrs[name] = value,
    };
    toggleExperiment(win, EXP_ID, true, true);
  });

  afterEach(() => {
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
      // Should not register as 'A4A enabled', but should still attach the
      // control experiment ID.
      expect(googleAdsIsA4AEnabled(win, element, EXP_ID, EXTERNAL_BRANCHES,
          INTERNAL_BRANCHES), 'googleAdsIsA4AEnabled').to.be.true;
      expect(win.document.cookie).to.be.null;
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
      expect(googleAdsIsA4AEnabled(win, element, EXP_ID, EXTERNAL_BRANCHES,
          INTERNAL_BRANCHES), 'googleAdsIsA4AEnabled').to.be.true;
      expect(win.document.cookie).to.be.null;
      expectThereCanBeOnlyOne(element, EXTERNAL_BRANCHES.experiment);
      expectExternallyTriggered(element);
    });
  });
});
