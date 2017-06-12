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
import {getUrl,
  whichGladeExperimentBranch,
  doubleClickWithGpt} from '../doubleclick';
import * as sinon from 'sinon';

describe('test the getUrl method', () => {

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

describe('test the whichGladeExperimentBranch function', () => {

  it('should use GPT and opt out of the GladeExperiment when' +
  'useSameDomainRenderingUntilDeprecated is not undefined', () => {
    const data = {useSameDomainRenderingUntilDeprecated: true};
    const url = '';
    const experimentFraction = 0.1;
    const mockDoubleClickWithGpt = sinon.mock('doubleClickWithGpt');
    const doubleClickWithGptExpectation = mockDoubleClickWithGpt.expects()
    .once();

    whichGladeExperimentBranch(data, url, experimentFraction);

    mockDoubleClickWithGpt.verify();
  });
});
