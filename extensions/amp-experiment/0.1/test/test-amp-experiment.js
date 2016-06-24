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

import {createIframePromise} from '../../../../testing/iframe';
import {AmpExperiment} from '../amp-experiment';

describe('amp-experiment', () => {

  let win;
  let experiment;
  let configScript;

  beforeEach(() => {
    return createIframePromise().then(iframe => {
      iframe.doc.title = 'Test Title';
      // markElementScheduledForTesting(iframe.win, 'amp-analytics');
      // const link = document.createElement('link');
      // link.setAttribute('rel', 'canonical');
      // link.setAttribute('href', './test-canonical.html');
      // iframe.win.document.head.appendChild(link);
      win = iframe.win;

      const el = win.document.createElement('amp-experiment');
      configScript = win.document.createElement('script');
      configScript.setAttribute('type', 'application/json');
      el.appendChild(configScript);
      experiment = new AmpExperiment(el);
    });
  });

  function setExperimentConfig(config) {
    config = JSON.stringify(config);
    configScript.textContent = config;
  }

  function expectBodyAttributes(attributes) {
    for (const attributeName in attributes) {
      if (attributes.hasOwnProperty(attributeName)) {
        expect(win.document.body.getAttribute(attributeName))
            .to.equal(attributes[attributeName]);
      }
    }
  }

  it('', () => {
    setExperimentConfig({
      'experiment-1': {
        'variant-a': 10.1,
        'variant-b': 10.2,
      },
    });

    experiment.buildCallback();
    expectBodyAttributes({
      'experiment-1': 'variant-a',
    });
  });
});
