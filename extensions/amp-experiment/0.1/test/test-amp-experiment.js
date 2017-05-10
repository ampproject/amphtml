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
import * as variant from '../variant';
import {variantForOrNull} from '../../../../src/services';
import * as sinon from 'sinon';

describe('amp-experiment', () => {

  const config = {
    'experiment-1': {
      variants: {
        'variant-a': 50,
        'variant-b': 50,
      },
    },
    'experiment-2': {
      variants: {
        'variant-c': 50,
        'variant-d': 50,
      },
    },
    'experiment-3': {
      variants: {
        'variant-e': 1,
      },
    },
  };

  let sandbox;
  let win;
  let ampdoc;
  let experiment;

  beforeEach(() => {
    return createIframePromise().then(iframe => {
      sandbox = sinon.sandbox.create();
      win = iframe.win;
      ampdoc = iframe.ampdoc;
      const el = win.document.createElement('amp-experiment');
      el.ampdoc_ = ampdoc;
      experiment = new AmpExperiment(el);
    });
  });

  afterEach(() => {
    sandbox.restore();
  });

  function addConfigElement(opt_elementName, opt_type, opt_textContent) {
    const child = win.document.createElement(opt_elementName || 'script');
    child.setAttribute('type', opt_type || 'application/json');
    child.textContent = opt_textContent || JSON.stringify(config);
    experiment.element.appendChild(child);
  }

  function expectBodyHasAttributes(attributes) {
    for (const attributeName in attributes) {
      if (attributes.hasOwnProperty(attributeName)) {
        expect(win.document.body.getAttribute(attributeName))
            .to.equal(attributes[attributeName]);
      }
    }
  }

  it('should not throw on valid config', () => {
    expect(() => {
      addConfigElement('script');
      experiment.buildCallback();
    }).to.not.throw();
  });

  it('should throw if it has no child element', () => {
    expect(() => {
      experiment.buildCallback();
    }).to.throw(/should contain exactly one/);
  });

  it('should throw if it has multiple child elements', () => {
    expect(() => {
      addConfigElement('script');
      addConfigElement('script');
      experiment.buildCallback();
    }).to.throw(/should contain exactly one/);
  });

  it('should throw if the child element is not a <script> element', () => {
    expect(() => {
      addConfigElement('a');
      experiment.buildCallback();
    }).to.throw(/script/);
  });

  it('should throw if the child script element is not json typed', () => {
    expect(() => {
      addConfigElement('script', 'wrongtype');
      experiment.buildCallback();
    }).to.throw(/application\/json/);
  });

  it('should throw if the child script element has non-JSON content', () => {
    expect(() => {
      addConfigElement('script', 'application/json', '{not json}');
      experiment.buildCallback();
    }).to.throw();
  });

  it('should add attributes to body element for the allocated variants', () => {
    addConfigElement('script');
    const stub = sandbox.stub(variant, 'allocateVariant');
    stub.withArgs(ampdoc, 'experiment-1', config['experiment-1'])
        .returns(Promise.resolve('variant-a'));
    stub.withArgs(ampdoc, 'experiment-2', config['experiment-2'])
        .returns(Promise.resolve('variant-d'));
    stub.withArgs(ampdoc, 'experiment-3', config['experiment-3'])
        .returns(Promise.resolve(null));

    experiment.buildCallback();
    debugger;
    return variantForOrNull(win).then(variants => {
      expect(variants).to.jsonEqual({
        'experiment-1': 'variant-a',
        'experiment-2': 'variant-d',
        'experiment-3': null,
      });
      expectBodyHasAttributes({
        'amp-x-experiment-1': 'variant-a',
        'amp-x-experiment-2': 'variant-d',
      });
      expect(win.document.body.getAttribute('amp-x-experiment-3'))
          .to.equal(null);
    });
  });
});
