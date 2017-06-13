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
import {getUrl, whichGladeExperimentBranch} from '../doubleclick';

describe('getUrl', () => {

  it('should use the correct URL given the experimental condition', () => {
    const controlData = {experimentId: '21060540'};
    const experimentData = {experimentId: '21060541'};
    const notInEitherData = {};
    expect(getUrl(controlData)).to
    .equal('https://www.googletagservices.com/tag/js/gpt_sf_a.js');
    expect(getUrl(experimentData)).to
    .equal('https://www.googletagservices.com/tag/js/gpt_sf_b.js');
    expect(getUrl(notInEitherData)).to
    .equal('https://www.googletagservices.com/tag/js/gpt.js');
  });
});

describe('whichGladeExperimentBranch', () => {

  it('should use GPT and opt out of the GladeExperiment when' +
  'useSameDomainRenderingUntilDeprecated is not undefined', () => {
    const data = {useSameDomainRenderingUntilDeprecated: true};
    const url = 'https://www.googletagservices.com/tag/js/gpt.js';
    const experimentFraction = 0.1;

    whichGladeExperimentBranch(data, url, experimentFraction);

    expect(document.querySelector('script[src="https://www.googletagservices.com/tag/js/gpt.js"]')).to.be.ok;
  });

  it('should use GPT and opt out of the GladeExperiment when multiSize is not' +
  'null', () => {
    const data = {multiSize: 'hey!'};
    const url = 'https://www.googletagservices.com/tag/js/gpt.js';
    const experimentFraction = 0.1;

    whichGladeExperimentBranch(data, url, experimentFraction);

    expect(document.querySelector('script[src="https://www.googletagservices.com/tag/js/gpt.js"]')).to.be.ok;
  });

  it('should use GPT and opt out of the GladeExperiment when in the control' +
  'branch of the SingleFileGPT experiment', () => {
    const data = {};
    const url = 'https://www.googletagservices.com/tag/js/gpt_sf_a.js';
    const experimentFraction = 0.1;

    whichGladeExperimentBranch(data, url, experimentFraction);

    expect(document.querySelector('script[src="https://www.googletagservices.com/tag/js/gpt_sf_a.js"]')).to.be.ok;
  });

  it('should use GPT and opt out of the GladeExperiment when in the' +
  'experiment branch of the SingleFileGPT experiment', () => {
    const data = {};
    const url = 'https://www.googletagservices.com/tag/js/gpt_sf_b.js';
    const experimentFraction = 0.1;

    whichGladeExperimentBranch(data, url, experimentFraction);

    expect(document.querySelector('script[src="https://www.googletagservices.com/tag/js/gpt_sf_b.js"]')).to.be.ok;
  });
});
