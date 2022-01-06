const babel = require('@babel/core');
const path = require('path');
const Remapping = require('@ampproject/remapping');
const {debug} = require('../compile/debug-compilation-lifecycle');
const {TransformCache, batchedRead, md5} = require('./transform-cache');

/** @type {Remapping.default} */
const remapping = /** @type {*} */ (Remapping);

const argv = require('minimist')(process.argv.slice(2));
const te = new TextEncoder();

/**
 * @typedef {{
 *   filename: string,
 *   code: string,
 *   map: *,
 * }}
 */
let CacheMessageDef;

/**
 * Used to cache babel transforms done by esbuild.
 * @type {TransformCache<!CacheMessageDef>}
 */
let transformCache;

/**
 * @param {string} filename
 * @param {string} contents
 * @param {Object} babelOptions
 * @return {!Promise<!CacheMessageDef>}
 */
async function transformInternal(filename, contents, babelOptions) {
  debug('pre-babel', filename, contents);
  const p = babel.transformAsync(contents, babelOptions);
  const {code, map} = /** @type {!babel.BabelFileResult} */ (await p);
  debug('post-babel', filename, code, map);
  return {filename, code: code || '', map};
}

/**
 * @param {string} filename
 * @param {string} contents
 * @param {string} hash
 * @param {{callerName: string, enableCache: boolean, babelOptions: Object}} opts
 * @return {!Promise<!CacheMessageDef>}
 */
function transform(filename, contents, hash, opts) {
  const {babelOptions, callerName, enableCache} = opts;
  if (enableCache) {
    if (!transformCache) {
      transformCache = new TransformCache('.babel-cache');
    }
    hash = md5(
      JSON.stringify({
        callerName,
        filename,
        hash,
        babelOptions,
        argv,
      })
    );
    const cached = transformCache.get(hash);
    if (cached) {
      return cached;
    }
  }

  const promise = transformInternal(filename, contents, babelOptions);
  if (enableCache) {
    transformCache.set(hash, promise);
  }

  return promise;
}

/**
 * Creates a babel plugin for esbuild for the given caller. Optionally enables
 * caching to speed up transforms.
 * @param {string} callerName
 * @param {boolean} enableCache
 * @param {{
 *   preSetup?: function():void,
 *   postLoad?: function():void,
 *   babelMaps?: Map<string, *>,
 *   postCompileCaller?: string,
 * }} callbacks
 * @return {!Object}
 */
function getEsbuildBabelPlugin(
  callerName,
  enableCache,
  {postCompileCaller, postLoad, preSetup} = {}
) {
  const babelMaps = new Map();
  // eslint-disable-next-line local/no-forbidden-terms

  return {
    name: 'babel',

    async setup(build) {
      preSetup?.();

      const babelOptionsLoad =
        babel.loadOptions({caller: {name: callerName}}) || {};
      let babelOptionsEnd;

      build.onLoad({filter: /\.[cm]?js$/, namespace: ''}, async (file) => {
        const filename = file.path;
        const {contents, hash} = await batchedRead(filename);
        const transformed = await transform(filename, contents, hash, {
          callerName,
          enableCache,
          babelOptions: getFileBabelOptions(babelOptionsLoad, filename),
        });
        babelMaps.set(filename, transformed.map);
        postLoad?.();
        return {contents: transformed.code};
      });

      build.onEnd(async (result) => {
        const {outputFiles} = result;
        const code = outputFiles.find(({path}) => !path.endsWith('.map'));
        const map = outputFiles.find(({path}) => path.endsWith('.map'));

        const maps = [map.text];
        if (postCompileCaller) {
          babelOptionsEnd ||=
            babel.loadOptions({caller: {name: postCompileCaller}}) || {};

          const {code: transformed, map: transformedMap} = await transform(
            code.path,
            code.text,
            md5(code.text),
            {
              babelOptions: getFileBabelOptions(babelOptionsEnd, code.path),
              callerName: postCompileCaller,
              enableCache,
            }
          );

          replaceOutputFile(outputFiles, code, transformed);
          maps.unshift(transformedMap);
        }

        const root = process.cwd();
        const remapped = remapping(
          maps,
          (f) => {
            // The Babel tranformed file and the original file have the same path,
            // which makes it difficult to distinguish during remapping's load phase.
            // We perform some manual path mangling to destingish the babel files
            // (which have a sourcemap) from the actual source file by pretending the
            // source file exists in the '__SOURCE__' root directory.
            if (f.includes('__SOURCE__')) {
              return null;
            }
            const file = path.join(root, f);
            const map = babelMaps.get(file);
            if (!map) {
              throw new Error(`failed to find sourcemap for babel file "${f}"`);
            }
            return {
              ...map,
              file: f,
              sourceRoot: path.join('/__SOURCE__/', path.dirname(f)),
            };
          },
          !argv.full_sourcemaps
        );
        remapped.sources = remapped.sources.map((source) => {
          if (source.startsWith('/__SOURCE__/')) {
            return source.slice('/__SOURCE__/'.length);
          }
          return source;
        });

        replaceOutputFile(outputFiles, map, remapped.toString());
      });
    },
  };
}

const CJS_TRANSFORMS = new Set([
  'transform-modules-commonjs',
  'proposal-dynamic-import',
  'syntax-dynamic-import',
  'proposal-export-namespace-from',
  'syntax-export-namespace-from',
]);

/**
 * @param {!Object} babelOptions
 * @param {string} filename
 * @return {!Object}
 */
function getFileBabelOptions(babelOptions, filename) {
  // Patch for leaving files within node_modules as esm, since esbuild will break when trying
  // to process a module file that contains CJS exports. This function is called after
  // babel.loadOptions, therefore all of the plugins from preset-env have already been applied.
  // and must be disabled individually.
  if (filename.includes('node_modules')) {
    const plugins = babelOptions.plugins.filter(
      ({key}) => !CJS_TRANSFORMS.has(key)
    );
    babelOptions = {...babelOptions, plugins};
  }

  // The amp runner automatically sets cwd to the `amphtml` directory.
  const root = process.cwd();
  const filenameRelative = path.relative(root, filename);

  return {
    ...babelOptions,
    filename,
    filenameRelative,
  };
}

/**
 * @param {Array<import('esbuild').OutputFile>} outputFiles
 * @param {import('esbuild').OutputFile} original
 * @param {string} text
 */
function replaceOutputFile(outputFiles, original, text) {
  const index = outputFiles.indexOf(original);
  if (index === -1) {
    throw new Error(`couldn't find outputFile ${original.path}`);
  }

  let contents;
  const file = {
    path: original.path,
    text,
    get contents() {
      return (contents ||= te.encode(text));
    },
  };
  outputFiles[index] = file;
}

module.exports = {
  getEsbuildBabelPlugin,
};
