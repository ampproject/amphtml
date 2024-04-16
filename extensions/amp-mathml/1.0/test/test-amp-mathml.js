import '../amp-mathml';

import {expect} from 'chai';

import {createElementWithAttributes} from '#core/dom';

import {toggleExperiment} from '#experiments';

import {waitFor} from '#testing/helpers/service';
import {doNotLoadExternalResourcesInTest} from '#testing/iframe';

import {QUADRATIC_FORMULA} from './utils';

describes.realWin(
  'amp-mathml-v1.0',
  {
    amp: {
      extensions: ['amp-mathml:1.0'],
    },
  },
  (env) => {
    beforeEach(async () => {
      toggleExperiment(env.win, 'bento-mathml', true, true);
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
  return createElementWithAttributes(env.win.document, 'amp-mathml', {
    'data-formula': formula,
    ...args,
  });
}

/**
 *
 * @param {HTMLElement} element
 */
async function waitForRender(element) {
  await element.buildInternal();
  const loadPromise = element.layoutCallback();
  await waitFor(
    () => element.shadowRoot.querySelector('iframe'),
    'iframe mounted'
  );
  await loadPromise;
}
