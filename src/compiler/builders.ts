import {buildDom as ampLayoutClassic} from '#builtins/amp-layout/build-dom';
import {buildDom as ampFitTextClassic} from '../../extensions/amp-fit-text/0.1/build-dom';

import {BuildDom, Versions} from './types';

const builderMap = {
  'v0': {
    'amp-layout': ampLayoutClassic,
  },
  '0.1': {
    'amp-fit-text': ampFitTextClassic,
  },
};

/*
 * Returns the set of component builders needed to server-render an AMP Document.
 */
export function getBuilders(versions: Versions): {
  [key: string]: BuildDom;
} {
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
