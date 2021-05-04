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
const argv = require('minimist')(process.argv);
const globby = require('globby');
const path = require('path');
const prettier = require('prettier');
const ts = require('typescript');
const tsickle = require('tsickle');
const {writeDiffOrFail} = require('../../common/diff');

const tsOptions = {
  'include': ['./*.d.ts'],
  'exclude': ['**/node_modules'],
};

const defaultPaths = ['extensions/*/1.0/*.d.ts'];

const fileNameToModuleId = (fileName) =>
  `-${path.basename(fileName, '.d.ts')}-def`.replace(/-([a-z])/g, (_, c) =>
    c.toUpperCase()
  );

/**
 * @param {string} filename
 * @param {string} output
 * @return {Promise<string>}
 */
async function prettierFormatJs(filename, output) {
  return prettier.format(output, {
    ...(await prettier.resolveConfig(filename)),
    parser: 'babel',
  });
}

async function tsickleTask() {
  const paths = (
    await globby(argv.files ? argv.files.split(',') : defaultPaths)
  ).map((relative) => path.resolve(relative));

  const compilerHost = ts.createCompilerHost(tsOptions);

  const program = ts.createProgram(paths, tsOptions, compilerHost);

  const transformerHost = {
    shouldSkipTsickleProcessing: (fileName) =>
      path.resolve(fileName).includes('/node_modules/'),
    shouldIgnoreWarningsForPath: (unusedFileName) => false,
    fileNameToModuleId,
    es5Mode: true,
    googmodule: false,
    transformDecorators: false,
    transformTypesToClosure: true,
    unknownTypesPaths: new Set(['node_modules']),
    pathToModuleName: (unusedContext, fileName) =>
      `-${path.basename(fileName, '.d.ts')}-def`.replace(/-([a-z])/g, (_, c) =>
        c.toUpperCase()
      ),
    untyped: false,
    logWarning: (warning) =>
      console.error(ts.formatDiagnostics([warning], compilerHost)),
    options: tsOptions,
    moduleResolutionHost: compilerHost,
  };

  const result = {};
  const {externs} = tsickle.emit(program, transformerHost);
  for (const filename in externs) {
    const writeToFilename = filename.replace(/\.d\.ts$/, 'type.js');
    result[writeToFilename] = await prettierFormatJs(
      writeToFilename,
      [
        `/** This file was automatically generated from ${path.basename(
          filename
        )} **/`,
        `/** @externs */`,
        externs[filename],
      ].join('\n\n')
    );
  }

  // return result;

  for (const filename in result) {
    await writeDiffOrFail('tsickle', filename, result[filename]);
  }
}

tsickleTask.flags = {
  fix: 'Update Closure type definitions',
};

module.exports = {
  tsickleTask,
};
