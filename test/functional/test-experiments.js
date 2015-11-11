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

import {isExperimentOn} from '../../src/experiments';


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
    expectExperiment('amp-exp', 'e1').to.be.false;
    expectExperiment('amp-exp=', 'e1').to.be.false;
  });

  it('should return "off" when value is not in the list', () => {
    expectExperiment('amp-exp=e1a,e2', 'e1').to.be.false;
  });

  it('should return "on" when value is in the list', () => {
    expectExperiment('amp-exp=e1', 'e1').to.be.true;
    expectExperiment('amp-exp=e1,e2', 'e1').to.be.true;
    expectExperiment('amp-exp=e2,e1', 'e1').to.be.true;
    expectExperiment('amp-exp=e2 , e1', 'e1').to.be.true;
  });
});
