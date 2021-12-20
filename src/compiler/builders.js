import {buildDom as ampLayoutClassic} from '#builtins/amp-layout/build-dom';

import {applyStaticLayout} from '#core/static-layout';

import {buildDom as ampFitTextClassic} from '../../extensions/amp-fit-text/0.1/build-dom';

const versionedBuilderMap = {
  'v0': {
    'amp-layout': ampLayoutClassic,
  },
  '0.1': {
    'amp-fit-text': ampFitTextClassic,
  },
};

/**
 * Wraps a buildDom function with functionality that every component needs.
 *
 * @param {import('./types').BuildDom} buildDom
 * @return {import('./types').BuildDom}
 */
function wrap(buildDom) {
  return function wrapper(element) {
    applyStaticLayout(/** @type {AmpElement} */ (element));
    buildDom(element);
    element.setAttribute('i-amphtml-ssr', '');
  };
}

/**
 * Returns the set of component builders needed to server-render an AMP Document.
 * @param {import('./types').Versions} versions
 * @param {{[version: string]: import('./types').BuilderMap}} builderMap
 * @return {import('./types').BuilderMap}
 */
export function getBuilders(versions, builderMap = versionedBuilderMap) {
  /** @type {import('./types').BuilderMap} */
  const builders = {};

  for (const {component, version} of versions) {
    const builder = builderMap?.[version]?.[component];
    if (builder) {
      builders[component] = wrap(builder);
    }
  }

  return builders;
}
