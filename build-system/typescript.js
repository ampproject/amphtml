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

const colors = require('ansi-colors');
const fs = require('fs-extra');
const log = require('fancy-log');
const path = require('path');
const ts = require('typescript');
const tsickle = require('tsickle');

/**
 * Given a file path `foo/bar.js`, transpiles the TypeScript entry point of
 * the same name `foo/bar.ts` and all direct and indirect TypeScript imports.
 *
 * @param {string} srcDir
 * @param {string} srcFilename
 */
exports.transpileTs = function(srcDir, srcFilename) {
  const tsEntry = path.join(srcDir, srcFilename).replace('.js', '.ts');
  const tsConfig = ts.convertCompilerOptionsFromJson({
    'module': 'ES6',
    'target': 'ES6',
  }, srcDir);
  const tsOptions = tsConfig.options;
  if (tsConfig.errors.length) {
    log(colors.red('TSickle:'), tsickle.formatDiagnostics(tsConfig.errors));
  }

  const compilerHost = ts.createCompilerHost(tsOptions);
  const program = ts.createProgram([tsEntry], tsOptions, compilerHost);

  const transformerHost = {
    shouldSkipTsickleProcessing: () => false,
    transformTypesToClosure: true,
    options: tsOptions,
    host: compilerHost,
  };
  const emitResult = tsickle.emitWithTsickle(program, transformerHost,
      compilerHost, tsOptions, undefined, (filePath, contents) => {
        fs.writeFileSync(filePath, contents, {encoding: 'utf-8'});
      });

  const diagnostics =
      ts.getPreEmitDiagnostics(program).concat(emitResult.diagnostics);
  if (diagnostics.length) {
    log(colors.red('TSickle:'), tsickle.formatDiagnostics(diagnostics));
  }
};

/**
 * Removes all JS files in given directory and its subdirectories.
 *
 * @param {string} dir
 */
exports.removeJsFilesInDirectory = function removeJsFilesInDirectory(dir) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filename = path.join(dir, file);
    const stat = fs.lstatSync(filename);
    if (stat.isDirectory()) {
      removeJsFilesInDirectory(filename);
    } else if (filename.endsWith('.js')) {
      fs.remove(filename);
    }
  });
};
