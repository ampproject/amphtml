/**
 * Copyright 2021 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
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
