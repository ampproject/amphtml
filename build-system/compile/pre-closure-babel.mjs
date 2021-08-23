import babel from '@babel/core';
import fs from 'fs-extra';
import globby from 'globby';
import path from 'path';
import tempy from 'tempy';
import {CompilationLifecycles, debug} from './debug-compilation-lifecycle.mjs';
import {TransformCache, batchedRead, md5} from '../common/transform-cache.mjs';
import {BABEL_SRC_GLOBS} from './sources.mjs';
import {cyan, red} from 'kleur/colors';
import {log} from '../common/logging.mjs';

/**
 * Files on which to run pre-closure babel transforms.
 *
 * @private @const {!Array<string>}
 */
let filesToTransform;

/**
 * Directory used to output babel transformed files for closure compilation.
 *
 * @private @const {string}
 */
let outputDir;

/**
 * Used to cache pre-closure babel transforms.
 *
 * @const {TransformCache}
 */
let transformCache;

/**
 * Returns the name of the babel output directory if it has been created.
 *
 * @return {string}
 */
export function getBabelOutputDir() {
  return outputDir || '';
}

/**
 * Computes the set of files on which to run pre-closure babel transforms.
 *
 * @return {!Array<string>}
 */
function getFilesToTransform() {
  return globby.sync([...BABEL_SRC_GLOBS, '!node_modules/', '!third_party/']);
}

/**
 * Apply babel transforms prior to closure compiler pass, store the transformed
 * file in an output directory (used by closure compiler), and return the path
 * of the transformed file.
 *
 * When a source file is transformed for the first time, it is written to a
 * persistent transform cache from where it is retrieved every subsequent time
 * without invoking babel. A change to the file contents or to the invocation
 * arguments will invalidate the cached result and re-transform the file.
 *
 * @param {string} file
 * @param {string} outputFilename
 * @param {!Object} options
 * @return {Promise<string>}
 */
export async function preClosureBabel(file, outputFilename, options) {
  if (!outputDir) {
    outputDir = tempy.directory();
  }
  if (!transformCache) {
    transformCache = new TransformCache('.pre-closure-cache', '.js');
  }
  if (!filesToTransform) {
    filesToTransform = getFilesToTransform();
  }
  const transformedFile = path.join(outputDir, file);
  if (!filesToTransform.includes(file)) {
    if (!(await fs.exists(transformedFile))) {
      await fs.copy(file, transformedFile);
    }
    return transformedFile;
  }
  try {
    debug(CompilationLifecycles['pre-babel'], file);
    
    console.log('?>?', {babel});
    console.trace();
    const babelOptions = await babel.loadOptionsAsync({caller: {name: 'pre-closure'}}) || {};
    console.log('?>?>');
    
    const optionsHash = md5(
      JSON.stringify({babelOptions, argv: process.argv.slice(2)})
    );
    const {contents, hash} = await batchedRead(file, optionsHash);
    const cachedPromise = transformCache.get(hash);
    console.log('??');
    if (cachedPromise) {
      if (!(await fs.exists(transformedFile))) {
        await fs.outputFile(transformedFile, await cachedPromise);
      }
    } else {
      console.log('preClosureBabel create transformPromise');
      const transformPromise = babel
        .transformAsync(contents, {
          ...babelOptions,
          filename: file,
          filenameRelative: path.basename(file),
          sourceFileName: path.relative(process.cwd(), file),
        })
        .then((result) => result?.code);
      transformCache.set(hash, transformPromise);
      await fs.outputFile(transformedFile, await transformPromise);
      debug(CompilationLifecycles['pre-closure'], transformedFile);
    }
  } catch (err) {
    throw err;
    // const reason = handlePreClosureError(err, outputFilename, options);
    // if (reason) {
    //   throw reason;
    // }
  }
  return transformedFile;
}

/**
 * Handles a pre-closure babel error. Returns an error when transformation fails
 * except except in watch mode, where we want to print a message and continue.
 *
 * @param {Error} err
 * @param {string} outputFilename
 * @param {?Object=} options
 * @return {Error|undefined}
 */
function handlePreClosureError(err, outputFilename, options) {
  log(red('ERROR:'), err.message, '\n');
  const reasonMessage = `Could not transform ${cyan(outputFilename)}`;
  if (options && options.continueOnError) {
    log(red('ERROR:'), reasonMessage);
    options.errored = true;
    return;
  }
  return new Error(reasonMessage);
}
