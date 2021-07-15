import {buildDom as ampFitTextClassic} from '../../extensions/amp-fit-text/0.1/amp-fit-text';
import {buildDom as ampLayoutClassic} from '../../builtins/amp-layout/amp-layout';

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
 *
 * @param {string} runtimeVersion
 * @param {Array<{name: string, version: string}>} extensionList
 * @returns {Object<string, Builder>} builders
 */
export function getBuilders(runtimeVersion, extensionList) {
  const builders = {...builderMap[runtimeVersion]};

  for (let {version, name} of extensionList) {
    const builder = builderMap?.[version]?.[name];
    if (builder) {
      builders[name] = builder;
    }
  }

  return builders;
}
