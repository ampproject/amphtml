/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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

import {
  ADSENSE_AMP_AUTO_ADS_HOLDOUT_EXPERIMENT_NAME,
  AdSenseAmpAutoAdsHoldoutBranches,
  getAdSenseAmpAutoAdsExpBranch,
} from '../adsense-amp-auto-ads';
import {
  RANDOM_NUMBER_GENERATORS,
  toggleExperiment,
} from '../../../src/experiments';

describes.realWin('adsense-amp-auto-ads', {}, env => {
  let win;
  let sandbox;
  let accurateRandomStub;
  let cachedAccuratePrng;

  beforeEach(() => {
    win = env.win;
    sandbox = env.sandbox;

    accurateRandomStub = sandbox.stub().returns(-1);
    cachedAccuratePrng = RANDOM_NUMBER_GENERATORS.accuratePrng;
    RANDOM_NUMBER_GENERATORS.accuratePrng = accurateRandomStub;
  });

  afterEach(() => {
    sandbox.restore();
    RANDOM_NUMBER_GENERATORS.accuratePrng = cachedAccuratePrng;
  });

  it('should pick the control branch when experiment on and amp-auto-ads ' +
      'tag present.', () => {
    const ampAutoAdsEl = win.document.createElement('amp-auto-ads');
    win.document.body.appendChild(ampAutoAdsEl);
    toggleExperiment(win, ADSENSE_AMP_AUTO_ADS_HOLDOUT_EXPERIMENT_NAME, true);
    RANDOM_NUMBER_GENERATORS.accuratePrng.onFirstCall().returns(0.4);
    expect(getAdSenseAmpAutoAdsExpBranch(win))
        .to.equal(AdSenseAmpAutoAdsHoldoutBranches.CONTROL);
  });

  it('should pick the experiment branch when experiment on and amp-auto-ads ' +
      'tag present.', () => {
    const ampAutoAdsEl = win.document.createElement('amp-auto-ads');
    win.document.body.appendChild(ampAutoAdsEl);
    toggleExperiment(win, ADSENSE_AMP_AUTO_ADS_HOLDOUT_EXPERIMENT_NAME, true);
    RANDOM_NUMBER_GENERATORS.accuratePrng.onFirstCall().returns(0.6);
    expect(getAdSenseAmpAutoAdsExpBranch(win))
        .to.equal(AdSenseAmpAutoAdsHoldoutBranches.EXPERIMENT);
  });

  it('should pick the control branch when experiment on and amp-auto-ads ' +
      'setup element present.', () => {
    const ampAutoAdsSetupNode = win.document.createElement('meta');
    ampAutoAdsSetupNode.setAttribute('name', 'amp-auto-ads-setup');
    win.document.head.appendChild(ampAutoAdsSetupNode);
    toggleExperiment(win, ADSENSE_AMP_AUTO_ADS_HOLDOUT_EXPERIMENT_NAME, true);
    RANDOM_NUMBER_GENERATORS.accuratePrng.onFirstCall().returns(0.4);
    expect(getAdSenseAmpAutoAdsExpBranch(win))
        .to.equal(AdSenseAmpAutoAdsHoldoutBranches.CONTROL);
  });

  it('should pick the experiment branch when experiment on and amp-auto-ads ' +
      'setup element present.', () => {
    const ampAutoAdsSetupNode = win.document.createElement('meta');
    ampAutoAdsSetupNode.setAttribute('name', 'amp-auto-ads-setup');
    win.document.head.appendChild(ampAutoAdsSetupNode);
    toggleExperiment(win, ADSENSE_AMP_AUTO_ADS_HOLDOUT_EXPERIMENT_NAME, true);
    RANDOM_NUMBER_GENERATORS.accuratePrng.onFirstCall().returns(0.6);
    expect(getAdSenseAmpAutoAdsExpBranch(win))
        .to.equal(AdSenseAmpAutoAdsHoldoutBranches.EXPERIMENT);
  });

  it('should not pick a branch when experiment off.', () => {
    const ampAutoAdsEl = win.document.createElement('amp-auto-ads');
    win.document.body.appendChild(ampAutoAdsEl);
    toggleExperiment(win, ADSENSE_AMP_AUTO_ADS_HOLDOUT_EXPERIMENT_NAME, false);
    RANDOM_NUMBER_GENERATORS.accuratePrng.onFirstCall().returns(0.4);
    expect(getAdSenseAmpAutoAdsExpBranch(win)).to.be.null;
  });

  it('should not pick a branch when experiment on but no and amp-auto-ads ' +
      'tag present.', () => {
    toggleExperiment(win, ADSENSE_AMP_AUTO_ADS_HOLDOUT_EXPERIMENT_NAME, true);
    RANDOM_NUMBER_GENERATORS.accuratePrng.onFirstCall().returns(0.4);
    expect(getAdSenseAmpAutoAdsExpBranch(win)).to.be.null;
  });
});


