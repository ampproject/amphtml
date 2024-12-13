const babel = require('@babel/core');
const {createHash} = require('crypto');
const path = require('path');
const {debug} = require('../compile/debug-compilation-lifecycle');
const {includeSourcesContent} = require('../tasks/sourcemaps');
const {TransformCache, batchedRead, md5} = require('./transform-cache');
const Remapping = require('@ampproject/remapping');

/** @type {Remapping.default} */
const remapping = /** @type {*} */ (Remapping);

/**
 * @typedef {{
 *   filename: string,
 *   code: string,
 *   map: Object,
 * }}
 */
let CacheMessageDef;

/**
 * Used to cache babel transforms done by esbuild.
 * @type {TransformCache<!CacheMessageDef>}
 */
let transformCache;

/**
 * Creates a babel plugin for esbuild for the given caller. Optionally enables
 * caching to speed up transforms.
 * @param {string} callerName
 * @param {boolean} enableCache
 * @param {{
 *   preSetup?: () => void,
 *   postLoad?: () => void,
 *   plugins?: null | import('@babel/core').PluginItem[],
 * }} callbacks
 * @return {!Object}
 */
function getEsbuildBabelPlugin(
  callerName,
  enableCache,
  {plugins, postLoad = () => {}, preSetup = () => {}} = {}
) {
  const babelMaps = new Map();

  /**
   * @param {string} filename
   * @param {string} contents
   * @param {string} hash
   * @param {object} babelOptions
   * @return {!Promise<!CacheMessageDef>}
   */
  async function transformContents(filename, contents, hash, babelOptions) {
    if (enableCache) {
      if (!transformCache) {
        transformCache = new TransformCache('.babel-cache');
      }
      const cached = transformCache.get(hash);
      if (cached) {
        return cached;
      }
    }

    const promise = babel
      .transformAsync(contents, babelOptions)
      .then((result) => {
        const {code, map} = /** @type {!babel.BabelFileResult} */ (result);
        return {filename, code: code || '', map};
      });

    if (enableCache) {
      transformCache.set(hash, promise);
    }

    return promise;
  }

  return {
    name: 'babel',

    async setup(build) {
      preSetup();

      const {initialOptions} = build;
      const {sourcemap} = initialOptions;
      const inlineSourcemap = sourcemap === 'inline' || sourcemap === 'both';
      if (inlineSourcemap) {
        initialOptions.sorucemap = true;
      }

      build.onLoad(
        {filter: /\.(cjs|mjs|js|jsx|ts|tsx)$/, namespace: ''},
        async (file) => {
          const filename = file.path;
          const babelOptions = /** @type {*} */ (
            babel.loadOptions({caller: {name: callerName}, filename}) || {}
          );
          babelOptions.sourceMaps = true;
          if (plugins) {
            babelOptions.plugins = [...babelOptions.plugins, ...plugins];
          }

          const {contents, hash} = await batchedRead(filename);
          const rehash = md5(
            JSON.stringify({
              callerName,
              filename,
              hash,
              babelOptions,
              argv: process.argv.slice(2),
            })
          );

          debug('pre-babel', filename, contents);
          const {code, map} = await transformContents(
            filename,
            contents,
            rehash,
            getFileBabelOptions(babelOptions, filename)
          );

          debug('post-babel', filename, code, map);
          babelMaps.set(filename, map);
          postLoad?.();
          return {contents: code};
        }
      );

      build.onEnd(async (result) => {
        const {outputFiles} = result;
        const code = outputFiles.find(({path}) => !path.endsWith('.map'));
        const map = outputFiles.find(({path}) => path.endsWith('.map'));

        if (!map) {
          debug('post-esbuild', code?.path, code?.text);
          return;
        }

        const root = path.dirname(map.path);
        const nodeMods = path.normalize('/node_modules/');
        const remapped = remapping(
          map.text,
          (f, ctx) => {
            // The Babel tranformed file and the original file have the same
            // path, which makes it difficult to distinguish during remapping's
            // load phase. To prevent an infinite recursion, we check if the
            // importer is ourselves (which is nonsensical) and early exit.
            if (f === ctx.importer) {
              return null;
            }

            const file = path.join(root, f);
            const map = babelMaps.get(file);
            if (!map) {
              if (file.includes(nodeMods) || file.endsWith('.json')) {
                // Excuse node_modules and JSON files since they may have been
                // marked external (and so not processed by babel).
                return null;
              }
              throw new Error(`failed to find sourcemap for babel file "${f}"`);
            }
            return map;
          },
          !includeSourcesContent()
        );

        debug('post-esbuild', code.path, code.text, remapped);

        const sourcemapJson = remapped.toString();
        replaceOutputFile(outputFiles, map, sourcemapJson);
        if (inlineSourcemap) {
          const base64 = Buffer.from(sourcemapJson).toString('base64');
          replaceOutputFile(
            outputFiles,
            code,
            code.text.replace(
              /sourceMappingURL=.*/,
              `sourceMappingURL=data:application/json;charset=utf-8;base64,${base64}`
            )
          );
        }
      });
    },
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
  const generateContents = () =>
    // eslint-disable-next-line local/no-forbidden-terms
    (contents ||= new TextEncoder().encode(text));

  let hash;
  const generateHash = () =>
    (hash ||= createHash('sha1').update(text).digest('hex'));

  const file = {
    path: original.path,
    text,
    get contents() {
      return generateContents();
    },
    get hash() {
      return generateHash();
    },
  };
  outputFiles[index] = file;
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

module.exports = {
  getEsbuildBabelPlugin,
};
