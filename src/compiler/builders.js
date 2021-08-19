import {buildDom as ampLayoutClassic} from '#builtins/amp-layout/amp-layout';

import {buildDom as ampFitTextClassic} from '../../extensions/amp-fit-text/0.1/amp-fit-text';

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
 * @param {!./types.VersionsDef} versions
 * @return {Object<string, !./types.BuildDomDef>} builders
 */
export function getBuilders(versions) {
  const builders = {};

  for (const tag of Object.keys(versions)) {
    const version = versions[tag];
    const builder = builderMap?.[version]?.[tag];
    if (builder) {
      builders[tag] = builder;
    }
  }

  return builders;
}
