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

const hash = require('./create-hash');
const {create} = require('jss');
const {default: preset} = require('jss-preset-default');
const {relative, join} = require('path');
const {spawnSync} = require('child_process');

module.exports = function ({types: t, template}) {
  function isJssFile(filename) {
    return filename.endsWith('.jss.js');
  }

  const seen = new Map();
  function compileJss(JSS, filename) {
    const relativeFilepath = relative(join(__dirname, '../../..'), filename);
    const filehash = hash.createHash(relativeFilepath);
    const jss = create({
      ...preset(),
      createGenerateId: () => {
        return (rule) => {
          const dashCaseKey = rule.key.replace(
            /([A-Z])/g,
            (c) => `-${c.toLowerCase()}`
          );
          const className = `${dashCaseKey}-${filehash}`;
          if (seen.has(className) && seen.get(className) !== filename) {
            throw new Error(
              `Classnames must be unique across all files. Found a duplicate: ${className}`
            );
          }
          seen.set(className, filename);
          return className;
        };
      },
    });
    return jss.createStyleSheet(JSS);
  }

  return {
    visitor: {
      CallExpression(path, state) {
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
          init: template.expression.ast`${
            JSON.stringify({
              ...sheet.classes,
              'CSS': transformCssSync(sheet.toString()),
            })
          }`,
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

// Abuses spawnSync to let us run an async function sync.
function transformCssSync(cssText) {
  const programText = `
    const {transformCss} = require('../../../build-system/tasks/jsify-css');
    transformCss(\`${cssText}\`).then((css) => console./* OK */log(css.toString()));
  `;

  // TODO: migrate to the helpers in build-system exec.js
  // after adding args support.
  const spawnedProcess = spawnSync('node', ['-e', programText], {
    cwd: __dirname,
    env: process.env,
    encoding: 'utf-8',
    stdio: 'pipe',
  });
  if (spawnedProcess.status !== 0) {
    throw new Error(
      `Transforming CSS returned status code: ${spawnedProcess.status}. stderr: "${spawnedProcess.stderr}".`
    );
  }
  return spawnedProcess.stdout;
}
