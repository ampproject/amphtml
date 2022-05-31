import {createElementWithAttributes} from '#core/dom';

import {toggleExperiment} from '#experiments';

import {
  assertMutationRecordFormat,
  getElementsFromMutationRecordSelector,
} from '../mutation-record';

const TEST_ELEMENT_CLASS = 'experiment-test-element';

describes.realWin(
  'amp-experiment mutation-record',
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

    function setupMutationSelector() {
      const targetElement = createElementWithAttributes(doc, 'div', {
        'class': TEST_ELEMENT_CLASS,
      });

      doc.body.appendChild(targetElement);

      return `.${TEST_ELEMENT_CLASS}`;
    }

    function getAttributeMutation(opt_attributeName, opt_value) {
      const selector = setupMutationSelector();

      return {
        type: 'attributes',
        target: selector,
        attributeName: opt_attributeName || 'style',
        value: opt_value || 'color: #FF0000',
      };
    }

    it('should allow a valid mutation', () => {
      const mutation = getAttributeMutation();
      expect(() => {
        assertMutationRecordFormat(mutation, doc);
      }).to.not.throw();
    });

    it('should error when no mutation', () => {
      allowConsoleError(() => {
        expect(() => {
          assertMutationRecordFormat(null, doc);
        }).to.throw(/object/);
      });
    });

    it('should error when no type', () => {
      const mutation = getAttributeMutation();
      delete mutation['type'];
      allowConsoleError(() => {
        expect(() => {
          assertMutationRecordFormat(mutation, doc);
        }).to.throw(/type/);
      });
    });

    it('should error when invalid type', () => {
      const mutation = getAttributeMutation();
      mutation['type'] = 'test';
      allowConsoleError(() => {
        expect(() => {
          assertMutationRecordFormat(mutation, doc);
        }).to.throw(/type/);
      });
    });

    it('should error when no target', () => {
      const mutation = getAttributeMutation();
      delete mutation['target'];
      allowConsoleError(() => {
        expect(() => {
          assertMutationRecordFormat(mutation, doc);
        }).to.throw(/type/);
      });
    });

    it('should error when no target element', () => {
      const mutation = getAttributeMutation();
      doc.body.querySelector(mutation['target']).remove();
      allowConsoleError(() => {
        expect(() => {
          getElementsFromMutationRecordSelector(doc, mutation);
        }).to.throw(/selector/);
      });
    });

    it('should error when selecting internal element', () => {
      const mutation = getAttributeMutation();
      mutation['target'] = 'i-amphtml-foo';
      allowConsoleError(() => {
        expect(() => {
          getElementsFromMutationRecordSelector(doc, mutation);
        }).to.throw(/i-amphtml/);
      });
    });
  }
);
