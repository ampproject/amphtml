/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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
'use strict';

const fs = require('fs-extra');
const path = require('path');
const ts = require('typescript');
/** @type {*} */
const tsickle = require('tsickle');
const {log} = require('../common/logging');
const {red} = require('kleur/colors');

/**
 * Given a file path `foo/bar.js`, transpiles the TypeScript entry point of
 * the same name `foo/bar.ts` and all direct and indirect TypeScript imports.
 *
 * @param {string} srcDir
 * @param {string} srcFilename
 * @return {!Promise}
 */
exports.transpileTs = async function (srcDir, srcFilename) {
  const tsEntry = path.join(srcDir, srcFilename).replace(/\.js$/, '.ts');
  const tsConfig = ts.convertCompilerOptionsFromJson(
    {
      'module': 'esnext',
      'target': 'esnext',
    },
    srcDir
  );
  const tsOptions = tsConfig.options;
  if (tsConfig.errors.length) {
    log(red('TSickle:'), tsickle.formatDiagnostics(tsConfig.errors));
  }

  const compilerHost = ts.createCompilerHost(tsOptions);
  const program = ts.createProgram([tsEntry], tsOptions, compilerHost);

  // TODO(choumx): This was partially copy-pasta'd from tsickle. Add a default
  // to tsickle so this can be an optional param.
  const pathToModuleName = (context, fileName) => {
    fileName = fileName.replace(/\.js$/, '');
    if (fileName[0] === '.') {
      // './foo' or '../foo'.
      // Resolve the path against the dirname of the current module.
      fileName = path.join(path.dirname(context), fileName);
    }
    return fileName;
  };
  // TODO(#28387) fix this typing.
  /** @type {Object} */
  const transformerHost = {
    host: compilerHost,
    options: tsOptions,
    pathToModuleName,
    shouldSkipTsickleProcessing: () => false,
    transformTypesToClosure: true,
  };

  const emitResult = await tsickle.emitWithTsickle(
    program,
    transformerHost,
    compilerHost,
    tsOptions,
    undefined,
    (filePath, contents) => {
      fs.writeFileSync(filePath, contents, {encoding: 'utf-8'});
    }
  );

  const diagnostics = ts
    .getPreEmitDiagnostics(program)
    .concat(emitResult.diagnostics);
  if (diagnostics.length) {
    log(red('TSickle:'), tsickle.formatDiagnostics(diagnostics));
  }
};
