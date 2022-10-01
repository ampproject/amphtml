import {toggleExperiment} from '#experiments';

import {
  assertAttributeMutationFormat,
  assertCharacterDataMutationFormat,
} from '../mutation/mutation';

describes.realWin(
  'amp-experiment mutation',
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

    function getCharacterDataMutationRecord() {
      return {
        'type': 'characterData',
        'target': '.my-test-element-with-this-class',
        'value': 'coffee',
      };
    }

    function getAttributeMutationRecord() {
      return {
        'type': 'attributes',
        'target': '.my-other-element-with-this-class',
        'attributeName': 'style',
        'value': 'background-color: red; width: 100px;',
      };
    }

    describe('characterData', () => {
      it('should allow a valid characterData mutation record', () => {
        const mutationRecord = getCharacterDataMutationRecord();
        expect(() => {
          assertCharacterDataMutationFormat(mutationRecord);
        }).to.not.throw();
      });

      it('should error when no mutation', () => {
        allowConsoleError(() => {
          expect(() => {
            assertCharacterDataMutationFormat(null);
          }).to.throw(/null/);
        });
      });

      it('should error when no value', () => {
        const mutationRecord = getCharacterDataMutationRecord();
        delete mutationRecord['value'];
        allowConsoleError(() => {
          expect(() => {
            assertCharacterDataMutationFormat(mutationRecord);
          }).to.throw(/value/);
        });
      });
    });

    describe('attributes', () => {
      it('should allow a valid attribute mutation record', () => {
        const mutationRecord = getAttributeMutationRecord();
        expect(() => {
          assertAttributeMutationFormat(mutationRecord);
        }).to.not.throw();
      });

      it('should error when no mutation', () => {
        allowConsoleError(() => {
          expect(() => {
            assertAttributeMutationFormat(null);
          }).to.throw(/null/);
        });
      });

      it('should error when no value', () => {
        const mutationRecord = getAttributeMutationRecord();
        delete mutationRecord['value'];
        allowConsoleError(() => {
          expect(() => {
            assertAttributeMutationFormat(mutationRecord);
          }).to.throw(/value/);
        });
      });

      it('should error when no attributeName', () => {
        const mutationRecord = getAttributeMutationRecord();
        delete mutationRecord['attributeName'];
        allowConsoleError(() => {
          expect(() => {
            assertAttributeMutationFormat(mutationRecord);
          }).to.throw(/attributeName/);
        });
      });
    });
  }
);
