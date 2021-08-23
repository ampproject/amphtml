import babel from '@babel/core';
import fs from 'fs-extra';
import minimist from 'minimist';
import path from 'path';
import Remapping from '@ampproject/remapping';
import {minify as terserMinifier} from 'terser';
import {CompilationLifecycles, debug} from './debug-compilation-lifecycle.mjs';
import {jsBundles} from './bundles.config.mjs';

/** @type {Remapping.default} */
const remapping = /** @type {*} */ (Remapping);
const argv = minimist(process.argv.slice(2));

let mainBundles;

/**
 * Minify passed string.
 *
 * @param {string} code
 * @param {string} filename
 * @return {Promise<Object<string, terser.SourceMapOptions['content']>>}
 */
async function terserMinify(code, filename) {
  const options = {
    mangle: false,
    compress: {
      defaults: false,
      unused: true,
    },
    output: {
      beautify: !!argv.pretty_print,
      comments: /\/*/,
      // eslint-disable-next-line google-camelcase/google-camelcase
      keep_quoted_props: true,
    },
    sourceMap: true,
  };
  const basename = path.basename(filename, argv.esm ? '.mjs' : '.js');
  if (!mainBundles) {
    mainBundles = Object.keys(jsBundles).map((key) => {
      const bundle = jsBundles[key];
      if (bundle.options && bundle.options.minifiedName) {
        return path.basename(bundle.options.minifiedName, '.js');
      }
      return path.basename(key, '.js');
    });
  }
  if (mainBundles.includes(basename)) {
    options.output.preamble = ';';
  }
  const minified = await terserMinifier(code, options);

  return {
    compressed: minified.code,
    terserMap: minified.map,
  };
}

/**
 * Apply Babel Transforms on output from Closure Compuler, then cleanup added
 * space with Terser.
 * @param {string} file
 * @return {Promise<void>}
 */
export async function postClosureBabel(file) {
  if (path.extname(file) === '.map') {
    debug(CompilationLifecycles['complete'], file);
    return;
  }

  debug(CompilationLifecycles['closured-pre-babel'], file);
  /** @type {?babel.TransformOptions} */
  const babelOptions = babel.loadOptions({caller: {name: 'post-closure'}});
  const {code, map: babelMap} =
    (await babel.transformFileAsync(file, babelOptions ?? undefined)) || {};
  if (!code || !babelMap) {
    throw new Error(`Error transforming contents of ${file}`);
  }

  debug(CompilationLifecycles['closured-pre-terser'], file, code, babelMap);
  const {compressed, terserMap} = await terserMinify(code, path.basename(file));
  await fs.outputFile(file, compressed);

  const closureMap = await fs.readJson(`${file}.map`, 'utf-8');
  const sourceMap = remapping(
    [terserMap, babelMap, closureMap],
    () => null,
    !argv.full_sourcemaps
  );
  debug(
    CompilationLifecycles['complete'],
    file,
    compressed?.toString(),
    sourceMap
  );
  await fs.writeJson(`${file}.map`, sourceMap);
}
