import {toggleExperiment} from '#experiments';

import {CharacterDataMutation} from '../mutation/character-data-mutation';

const TEST_VALUE = 'TEST_VALUE';

describes.realWin(
  'amp-experiment character-data-mutation',
  {
    amp: {
      extensions: ['amp-experiment:1.0'],
    },
  },
  (env) => {
    let win, doc;

    beforeEach(() => {
      win = env.win;
      doc = win.document;

      toggleExperiment(win, 'amp-experiment-1.0', true);

      doc.body.innerHTML = '';
    });

    function getCharacterDataMutation() {
      return new CharacterDataMutation(
        {
          'type': 'characterData',
          'target': '.my-test-element-with-this-class',
          'value': TEST_VALUE,
        },
        [doc.createElement('div'), doc.createElement('div')]
      );
    }

    describe('mutate', () => {
      it('should mutate elements', () => {
        const mutation = getCharacterDataMutation();

        mutation.mutate();

        mutation.elements_.forEach((element) => {
          expect(element.textContent).to.be.equal(TEST_VALUE);
        });
      });
    });
  }
);
