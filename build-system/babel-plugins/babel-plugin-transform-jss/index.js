/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
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

/**
 * Takes the component imports of `useStyles`, and converts them to point to the compiled
 * jss file. Only applies to amp/bento modes.
 *
 * @example
 * In:
 * ```
 * import {useStyles} from './base-carousel.jss';
 * ```
 *
 * Out:
 * ```
 * import {useStyles} from '../../../build/amp-base-carousel-1.0.jss.compiled';
 * ```
 */

const relative = require('path').relative;

module.exports = function ({types: t}) {
  function containsUseStyles(path) {
    const importDeclaration = path.node;
    for (let i = 0; i < importDeclaration.specifiers.length; i++) {
      const spec = importDeclaration.specifiers[i];
      if (spec.imported.name === 'useStyles') {
        return true;
      }
    }
    return false;
  }

  function isImportFromJss(path) {
    return path.node.source.value.endsWith('.jss');
  }

  function extractJssPath(importDeclarationPath) {
    const program = importDeclarationPath.parentPath;
    let val;
    program.traverse({
      VariableDeclarator(path) {
        if (path.node.id.name === 'COMPILED_JSS_PATH') {
          val = path.node.init.value;
          path.remove();
        }
      },
    });
    if (! val) {
      throw new Error('Missing COMPILED_JSS_PATH');
    }
    return val;
  }

  return {
    visitor: {
      ImportDeclaration(path, state) {
        console.log(path);
        if (isImportFromJss(path) && containsUseStyles(path)) {
          const clone = t.cloneNode(path.node);
          clone.source.value = extractJssPath(path);
          path.replaceWith(clone);
        }
      },
    },
  };
};
