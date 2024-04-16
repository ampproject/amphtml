import {whenUpgradedToCustomElement} from '#core/dom/amp-element-helpers';

import {BaseElement} from '../../src/base-element';
import {createAmpElementForTesting} from '../../src/custom-element';

describes.realWin(
  'AMPElement helpers',
  {
    amp: {
      /* amp spec */
      ampdoc: 'single',
    },
  },
  (env) => {
    let doc;
    class TestElement extends BaseElement {}
    describe('whenUpgradeToCustomElement function', () => {
      beforeEach(() => {
        doc = env.win.document;
      });

      it('should not continue if element is not AMP element', () => {
        const element = doc.createElement('div');
        allowConsoleError(() => {
          expect(() => whenUpgradedToCustomElement(element)).to.throw(
            'element is not AmpElement'
          );
        });
      });

      it('should resolve if element has already upgrade', () => {
        const element = doc.createElement('amp-img');
        element.setAttribute('layout', 'nodisplay');
        doc.body.appendChild(element);
        return whenUpgradedToCustomElement(element).then((element) => {
          expect(element.whenBuilt).to.exist;
        });
      });

      it('should resolve when element upgrade', () => {
        const element = doc.createElement('amp-test');
        element.setAttribute('layout', 'nodisplay');
        doc.body.appendChild(element);
        env.win.setTimeout(() => {
          env.win.customElements.define(
            'amp-test',
            createAmpElementForTesting(env.win, TestElement)
          );
        }, 100);
        return whenUpgradedToCustomElement(element).then((element) => {
          expect(element.whenBuilt).to.exist;
        });
      });
    });
  }
);
