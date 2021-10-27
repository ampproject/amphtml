import {buildDom as ampLayoutClassic} from '#builtins/amp-layout/build-dom';

import {buildDom as ampFitTextClassic} from '../../extensions/amp-fit-text/0.1/build-dom';

const builderMap = {
  'v0': {
    'amp-layout': ampLayoutClassic,
  },
  '0.1': {
    'amp-fit-text': ampFitTextClassic,
  },
};

/**
 * Returns the set of component builders needed to server-render an AMP Document.
 * @param {import('./types').Versions} versions
 * @return {import('./types').BuilderMap}
 */
export function getBuilders(versions) {
  /** @type {import('./types').BuilderMap} */
  const builders = {};

  for (const {component, version} of versions) {
    const builder = builderMap?.[version]?.[component];
    if (builder) {
      builders[component] = builder;
    }
  }

  return builders;
}
