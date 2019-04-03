/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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

import * as variant from '../variant';
import {AmpExperiment} from '../amp-experiment';
import {Services} from '../../../../src/services';
import {toggleExperiment} from '../../../../src/experiments';

describes.realWin('amp-experiment', {
  amp: {
    extensions: ['amp-experiment:1.0'],
  },
}, env => {

  const config = {
    'experiment-1': {
      variants: {
        'variant-a': {
          weight: 50,
          mutations: [{}],
        },
        'variant-b': {
          weight: 50,
          mutations: [{}],
        },
      },
    },
    'experiment-2': {
      variants: {
        'variant-c': {
          weight: 50,
          mutations: [{}],
        },
        'variant-d': {
          weight: 50,
          mutations: [{}],
        },
      },
    },
    'experiment-3': {
      variants: {
        'variant-e': {
          weight: 1,
          mutations: [{}],
        },
      },
    },
  };

  let win, doc;
  let ampdoc;
  let experiment;
  let el;

  beforeEach(() => {
    win = env.win;
    doc = win.document;
    ampdoc = env.ampdoc;

    toggleExperiment(win, 'amp-experiment-1.0', true);

    el = doc.createElement('amp-experiment');
    el.ampdoc_ = ampdoc;
    experiment = new AmpExperiment(el);
  });

  function addConfigElement(opt_elementName, opt_type, opt_textContent) {
    const child = doc.createElement(opt_elementName || 'script');
    child.setAttribute('type', opt_type || 'application/json');
    child.textContent = opt_textContent || JSON.stringify(config);
    experiment.element.appendChild(child);
  }

  it('Rejects because experiment is not enabled', () => {
    toggleExperiment(win, 'amp-experiment-1.0', false);

    expectAsyncConsoleError(/Experiment/);
    addConfigElement('script');
    doc.body.appendChild(el);
    return experiment.buildCallback()
        .should.eventually.be.rejectedWith(
            /Experiment/
        );
  });

  it('should not throw on valid config', () => {
    expect(() => {
      addConfigElement('script');
      experiment.buildCallback();
    }).to.not.throw();
  });

  it('should throw if it has no child element', () => {
    expectAsyncConsoleError(/should contain exactly one/);
    return expect(experiment.buildCallback()).to.eventually
        .be.rejectedWith(/should contain exactly one/);
  });

  it('should throw if it has multiple child elements', () => {
    addConfigElement('script');
    addConfigElement('script');
    expectAsyncConsoleError(/should contain exactly one/);
    return expect(experiment.buildCallback()).to.eventually
        .be.rejectedWith(/should contain exactly one/);
  });

  it('should throw if the child element is not a <script> element', () => {
    addConfigElement('a');
    expectAsyncConsoleError(/script/);
    return expect(experiment.buildCallback()).to.eventually
        .be.rejectedWith(/script/);
  });

  it('should throw if the child script element is not json typed', () => {
    addConfigElement('script', 'wrongtype');
    expectAsyncConsoleError(/application\/json/);
    return expect(experiment.buildCallback()).to.eventually
        .be.rejectedWith(/application\/json/);
  });

  it('should throw if the child script element has non-JSON content', () => {
    addConfigElement('script', 'application/json', '{not json}');
    expectAsyncConsoleError();
    return experiment.buildCallback().then(() => {
      throw new Error('must have failed');
    }, () => {
      return Services.variantsForDocOrNull(ampdoc.getHeadNode())
          .then(service => service.getVariants())
          .then(variants => {
            expect(variants).to.deep.equal({});
          });
    });
  });

  it('should apply the mutations from the variant', () => {
    addConfigElement('script');
    const stub = sandbox.stub(variant, 'allocateVariant');
    stub.withArgs(ampdoc, 'experiment-1', config['experiment-1'])
        .returns(Promise.resolve('variant-a'));
    stub.withArgs(ampdoc, 'experiment-2', config['experiment-2'])
        .returns(Promise.resolve('variant-d'));
    stub.withArgs(ampdoc, 'experiment-3', config['experiment-3'])
        .returns(Promise.resolve(null));

    const applySpy = sandbox.spy(experiment, 'applyMutations_');

    experiment.buildCallback();
    return Services.variantsForDocOrNull(ampdoc.getHeadNode())
        .then(variantsService => variantsService.getVariants())
        .then(variants => {
          expect(variants).to.jsonEqual({
            'experiment-1': 'variant-a',
            'experiment-2': 'variant-d',
            'experiment-3': null,
          });

          expect(applySpy).to.be.calledTwice;
        });
  });
});
