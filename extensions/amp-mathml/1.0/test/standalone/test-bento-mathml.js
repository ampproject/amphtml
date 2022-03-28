import {CSS} from '#build/bento-mathml-1.0.css';

import {adoptStyles} from '#bento/util/unit-helpers';

import {createElementWithAttributes} from '#core/dom';

import {defineBentoElement} from '#preact/bento-ce';

import {waitFor} from '#testing/helpers/service';
import {doNotLoadExternalResourcesInTest} from '#testing/iframe';

import {BaseElement as BentoMathml} from '../../base-element';
import {QUADRATIC_FORMULA} from '../utils';

describes.realWin(
  'bento-mathml-v1.0',
  {
    amp: false,
  },
  (env) => {
    beforeEach(async () => {
      defineBentoElement('bento-mathml', BentoMathml, env.win);
      adoptStyles(env.win, CSS);
      // Override global window here because Preact uses global `createElement`.
      doNotLoadExternalResourcesInTest(window, env.sandbox);
    });

    it('should render', async () => {
      const mockTitle = 'mock title';
      const mockFormula = QUADRATIC_FORMULA;
      const ampMathmlElement = createAmpMathmlElement(env, {
        title: mockTitle,
        formula: mockFormula,
        style: 'height: 40px;',
      });
      env.win.document.body.appendChild(ampMathmlElement);
      await waitForRender(ampMathmlElement);

      expect(ampMathmlElement.style.height).to.equal('40px');
      expect(ampMathmlElement.shadowRoot.querySelector('iframe').src).to.equal(
        'http://ads.localhost:9876/dist.3p/current/frame.max.html'
      );
    });

    it('should correctly accept (and render) formula and title', async () => {
      const mockTitle = 'mock title';
      const mockFormula = QUADRATIC_FORMULA;
      const ampMathmlElement = createAmpMathmlElement(env, {
        title: mockTitle,
        formula: mockFormula,
        style: 'height: 40px;',
      });
      env.win.document.body.appendChild(ampMathmlElement);
      await waitForRender(ampMathmlElement);

      const iframe = ampMathmlElement.shadowRoot.querySelector('iframe');
      const {formula, title} = JSON.parse(
        iframe.getAttribute('name')
      ).attributes;
      expect(title).to.equal(mockTitle);
      expect(formula).to.equal(mockFormula);
    });

    it('should render nothing without explicit dimension', async () => {
      const mockTitle = 'mock title';
      const mockFormula = QUADRATIC_FORMULA;
      const ampMathmlElement = createAmpMathmlElement(env, {
        title: mockTitle,
        formula: mockFormula,
      });
      env.win.document.body.appendChild(ampMathmlElement);
      await waitForRender(ampMathmlElement);

      expect(ampMathmlElement.style.height).to.be.empty;
    });
  }
);

function createAmpMathmlElement(env, {formula, ...args}) {
  return createElementWithAttributes(env.win.document, 'bento-mathml', {
    'data-formula': formula,
    ...args,
  });
}

/**
 *
 * @param {HTMLElement} element
 */
async function waitForRender(element) {
  await element.getApi();
  await waitFor(
    () => element.shadowRoot.querySelector('iframe'),
    'iframe mounted'
  );
}
