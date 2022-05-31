import {createElementWithAttributes} from '#core/dom';

import {toggleExperiment} from '#experiments';

import * as applyExperiment from '../apply-experiment';

const TEST_ELEMENT_CLASS = 'experiment-test-element';

describes.realWin(
  'amp-experiment apply-experiment',
  {
    amp: {
      extensions: ['amp-experiment:1.0'],
    },
  },
  (env) => {
    let win, doc;
    let ampdoc;

    beforeEach(() => {
      win = env.win;
      doc = win.document;
      ampdoc = env.ampdoc;

      toggleExperiment(win, 'amp-experiment-1.0', true);
    });

    function addTestElementsToDocument(numberOfElements) {
      for (let i = 0; i < numberOfElements; i++) {
        const element = createElementWithAttributes(doc, 'div', {
          'class': TEST_ELEMENT_CLASS,
        });
        doc.body.appendChild(element);
      }
    }

    function getApplyExperimentToVariantParams(mutations) {
      // Create a config for the mutations
      const config = {
        'experiment-1': {
          variants: {
            'variant-a': {
              weight: 50,
              mutations,
            },
          },
        },
      };

      // Create an experimentToVariant selecting
      // the variant with our mutations
      const experimentToVariant = {
        'experiment-1': 'variant-a',
      };

      // Return our params
      return [ampdoc, config, experimentToVariant];
    }

    it(
      'should get all/correct number of ' +
        'mutation records from our experimentToVariant',
      () => {
        // Create a mutation record
        const mutations = [];
        mutations.push({
          'type': 'attributes',
          'target': `.${TEST_ELEMENT_CLASS}`,
          'attributeName': 'style',
          'value': 'background-color: red; width: 100px;',
        });

        const config = {
          'experiment-1': {
            variants: {
              'variant-a': {
                weight: 50,
                mutations,
              },
              'variant-b': {
                weight: 50,
                mutations,
              },
            },
          },
          'experiment-2': {
            variants: {
              'variant-a': {
                weight: 50,
                mutations,
              },
              'variant-b': {
                weight: 50,
                mutations,
              },
            },
          },
          'experiment-3': {
            variants: {
              'variant-a': {
                weight: 50,
                mutations,
              },
              'variant-b': {
                weight: 50,
                mutations,
              },
            },
          },
        };

        // Create an experimentToVariant selecting
        // the variant with our mutations
        const experimentToVariant = {
          'experiment-1': 'variant-b',
          'experiment-2': 'variant-a',
          'experiment-3': 'variant-b',
        };

        expect(
          applyExperiment.getMutationRecordsFromExperimentToVariant(
            config,
            experimentToVariant
          ).length
        ).to.be.equal(3);
      }
    );

    it(
      'Does not allow more than the max number of mutations, ' +
        'by number of mutation objects',
      () => {
        addTestElementsToDocument(1);
        const mutations = [];
        for (let i = 0; i < 100; i++) {
          mutations.push({
            'type': 'attributes',
            'target': `.${TEST_ELEMENT_CLASS}`,
            'attributeName': 'style',
            'value': 'background-color: red; width: 100px;',
          });
        }
        const params = getApplyExperimentToVariantParams(mutations);

        return applyExperiment.applyExperimentToVariant
          .apply(null, params)
          .catch((err) => {
            expect(err).to.match(/Max number of mutations/);
          });
      }
    );

    it(
      'Does not allow more than the max number of mutations, ' +
        'by number of elements selected',
      () => {
        addTestElementsToDocument(100);
        const mutations = [];
        for (let i = 0; i < 1; i++) {
          mutations.push({
            'type': 'attributes',
            'target': `.${TEST_ELEMENT_CLASS}`,
            'attributeName': 'style',
            'value': 'background-color: red; width: 100px;',
          });
        }
        const params = getApplyExperimentToVariantParams(mutations);

        return applyExperiment.applyExperimentToVariant
          .apply(null, params)
          .catch((err) => {
            expect(err).to.match(/Max number of mutations/);
          });
      }
    );

    it('Does not create unsupported attribute mutations', () => {
      const mutationRecordAndElements = [
        {
          mutationRecord: {
            'type': 'attributes',
            'target': `.${TEST_ELEMENT_CLASS}`,
            'attributeName': 'async',
            'value': 'true',
          },
          elements: [doc.createElement('script')],
        },
      ];

      expect(() => {
        applyExperiment.createMutationsFromMutationRecordsAndElements(
          mutationRecordAndElements
        );
      }).to.throw(/unsupported attributeName/);
    });
  }
);
