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

import * as applyExperiment from '../apply-experiment';
import * as variant from '../variant';
import {AmpExperiment} from '../amp-experiment';
import {Services} from '../../../../src/services';
import {toggleExperiment} from '../../../../src/experiments';

describes.realWin(
  'amp-experiment',
  {
    amp: {
      extensions: ['amp-experiment:1.0'],
    },
  },
  (env) => {
    // Config has empty mutations
    // As mutation parser tests will handle this
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

    function stubAllocateVariant(sandbox, config) {
      const viewer = Services.viewerForDoc(ampdoc);
      const stub = env.sandbox.stub(variant, 'allocateVariant');
      stub
        .withArgs(ampdoc, viewer, 'experiment-1', config['experiment-1'])
        .returns(Promise.resolve('variant-a'));
      stub
        .withArgs(ampdoc, viewer, 'experiment-2', config['experiment-2'])
        .returns(Promise.resolve('variant-d'));
      stub
        .withArgs(ampdoc, viewer, 'experiment-3', config['experiment-3'])
        .returns(Promise.resolve(null));
      return stub;
    }

    it('should not throw on valid config', () => {
      expect(() => {
        addConfigElement('script');
        experiment.buildCallback();
      }).to.not.throw();
    });

    it('should throw if it has no child element', () => {
      expectAsyncConsoleError(/should contain exactly one/);
      return expect(experiment.buildCallback()).to.eventually.be.rejectedWith(
        /should contain exactly one/
      );
    });

    it('should throw if it has multiple child elements', () => {
      addConfigElement('script');
      addConfigElement('script');
      expectAsyncConsoleError(/should contain exactly one/);
      return expect(experiment.buildCallback()).to.eventually.be.rejectedWith(
        /should contain exactly one/
      );
    });

    it('should throw if the child element is not a <script> element', () => {
      addConfigElement('a');
      expectAsyncConsoleError(/script/);
      return expect(experiment.buildCallback()).to.eventually.be.rejectedWith(
        /script/
      );
    });

    it('should throw if the child script element is not json typed', () => {
      addConfigElement('script', 'wrongtype');
      expectAsyncConsoleError(/application\/json/);
      return expect(experiment.buildCallback()).to.eventually.be.rejectedWith(
        /application\/json/
      );
    });

    it('should throw if the child script element has non-JSON content', () => {
      addConfigElement('script', 'application/json', '{not json}');
      expectAsyncConsoleError();
      return experiment.buildCallback().then(
        () => {
          throw new Error('must have failed');
        },
        () => {
          return Services.variantsForDocOrNull(ampdoc.getHeadNode())
            .then((service) => service.getVariants())
            .then((variants) => {
              expect(variants).to.deep.equal({});
            });
        }
      );
    });

    it('should match the variant to the experiment', () => {
      addConfigElement('script');

      stubAllocateVariant(env.sandbox, config);
      const applyStub = env.sandbox
        .stub(applyExperiment, 'applyExperimentToVariant')
        .returns(Promise.resolve());

      experiment.buildCallback();
      return Services.variantsForDocOrNull(ampdoc.getHeadNode())
        .then((variantsService) => variantsService.getVariants())
        .then((variants) => {
          expect(applyStub).to.be.calledOnce;
          expect(variants).to.jsonEqual({
            'experiment-1': 'variant-a',
            'experiment-2': 'variant-d',
            'experiment-3': null,
          });
        });
    });

    it(
      'should not apply any experiments when ' +
        '_disable_all_experiments_ is enabled',
      () => {
        addConfigElement('script');

        stubAllocateVariant(env.sandbox, config);
        const applyStub = env.sandbox
          .stub(applyExperiment, 'applyExperimentToVariant')
          .returns(Promise.resolve());

        env.sandbox.stub(ampdoc, 'getParam').returns('true');

        experiment.buildCallback();
        return Services.variantsForDocOrNull(ampdoc.getHeadNode())
          .then((variantsService) => variantsService.getVariants())
          .then((variants) => {
            expect(variants).to.jsonEqual({
              'experiment-1': null,
              'experiment-2': null,
              'experiment-3': null,
            });

            expect(applyStub).to.not.be.called;
          });
      }
    );
  }
);
