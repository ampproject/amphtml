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
 * Takes a .jss.js file and transforms the `useStyles` export to remove side effects
 * and directly return the classes map. Also includes special key 'CSS' in the classes
 * object with the entire CSS string.
 *
 * @example
 * In:
 * ```
 * import {createUseStyles} from 'react-jss'
 *
 * const jss = { button: { fontSize: 12 }}
 * export const useStyles = createUseStyles(jss);
 * ```
 *
 * Out:
 * ```
 * const jss = { button: { fontSize: 12 }}
 * const _classes = {button: 'button-1', CSS: 'button-1 { font-size: 12 }'}
 * export const useStyles = () => _classes;
 * ```
 */

const crypto = require('crypto');
const {create} = require('jss');
const {default: preset} = require('jss-preset-default');

module.exports = function ({types: t, template}) {
  function isJssFile(filename) {
    return filename.endsWith('.jss.js');
  }

  const seen = new Set();
  function compileJss(JSS, filename) {
    const filehash = crypto
      .createHash('sha256')
      .update(filename)
      .digest('base64')
      .slice(0, 7);
    const jss = create({
      ...preset(),
      createGenerateId: () => {
        return (rule) => {
          const className = `${rule.key}-${filehash}`;
          if (seen.has(className)) {
            throw new Error(
              `Classnames must be unique across all files. Found a duplicate: ${className}`
            );
          }
          seen.add(className);
          return className;
        };
      },
    });
    return jss.createStyleSheet(JSS);
  }

  return {
    visitor: {
      CallExpression(path, state) {
        // TODO: Can I skip the whole file if not jss?
        const {filename} = state.file.opts;
        if (!isJssFile(filename)) {
          return;
        }

        const callee = path.get('callee');
        if (!callee.isIdentifier({name: 'createUseStyles'})) {
          return;
        }

        const {confident, value: JSS} = path.get('arguments.0').evaluate();
        if (!confident) {
          throw path.buildCodeFrameError(
            `First argument to createUseStyles must be statically evaluatable.`
          );
        }
        const sheet = compileJss(JSS, filename);
        if ('CSS' in sheet.classes) {
          throw path.buildCodeFrameError(
            'Cannot have class named CSS in your JSS object.'
          );
        }

        const id = path.scope.generateUidIdentifier('classes');
        path.scope.push({
          id,
          init: template.expression.ast`JSON.parse(${t.stringLiteral(
            JSON.stringify({
              ...sheet.classes,
              'CSS': sheet.toString(),
            })
          )})`,
        });

        path.replaceWith(template.expression.ast`(() => ${id})`);
      },

      // Remove the import for react-jss
      ImportDeclaration(path, state) {
        const {filename} = state.file.opts;
        if (!isJssFile(filename)) {
          return;
        }

        if (path.node.source.value === 'react-jss') {
          path.remove();
        }
      },
    },
  };
};
