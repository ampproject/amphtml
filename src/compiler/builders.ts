import {buildDom as ampLayoutClassic} from '#builtins/amp-layout/build-dom';

import {applyStaticLayout} from '#core/static-layout';

import type {BuildDom, BuilderMap, Versions} from './types';

import {buildDom as ampFitTextClassic} from '../../extensions/amp-fit-text/0.1/build-dom';

type VersionedBuilderMap = {[version: string]: BuilderMap};
const versionedBuilderMap: VersionedBuilderMap = {
  'v0': {
    'amp-layout': ampLayoutClassic,
  },
  '0.1': {
    'amp-fit-text': ampFitTextClassic,
  },
};

/**
 * Wraps a buildDom function with functionality that every component needs.
 */
function wrap(buildDom: BuildDom): BuildDom {
  return function wrapper(element) {
    applyStaticLayout(element as AmpElement);
    buildDom(element);
    element.setAttribute('i-amphtml-ssr', '');
  };
}

/**
 * Returns the set of component builders needed to server-render an AMP Document.
 */
export function getBuilders(
  versions: Versions,
  builderMap: VersionedBuilderMap = versionedBuilderMap
): BuilderMap {
  const builders: BuilderMap = {};

  for (const {component, version} of versions) {
    const builder = builderMap?.[version]?.[component];
    if (builder) {
      builders[component] = wrap(builder);
    }
  }

  return builders;
}
