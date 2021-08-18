const argv = require('minimist')(process.argv.slice(2));
const esbuild = require('esbuild');
const terser = require('terser');
const {BUILD_CONSTANTS} = require('../../compile/build-constants');
const {getEsbuildBabelPlugin} = require('../../common/esbuild-babel');
const {getStdout} = require('../../common/process');
const {readFile, writeFile} = require('fs').promises;

const cwd = process.cwd();
const injectedSrcDir = `${__dirname}/src/`;

const entryPoints = ['extensions/amp-analytics/0.1/amp-analytics.js'];
const outfile = 'dist/universal-analytics.js';

const inject = [
  // Equivalent implementation of the AMP global, including BaseElement.
  `${injectedSrcDir}/amp.js`,

  // Bundle amp-crypto-polyfill instead of expecting a separate script.
  'extensions/amp-crypto-polyfill/0.1/amp-crypto-polyfill.js',
];

const aliasPatterns = [
  // Inject our own implementation of service-helpers to scope them to a global
  // window, and collapse the concept of extension services (they're all global).
  ['.+/service-helpers', `${injectedSrcDir}/service-helpers.js`],

  // Inject our own empty implementation of LinkerManager.
  // The Linker is only useful when the cache and the publisher's origin are
  // different, which is to say only relevant to AMP documents.
  ['.+/linker-manager', `${injectedSrcDir}/linker-manager.js`],

  // #service(/index.js) is special in that we inject our own service getters.
  // Anything else under `#service/` is handled by a standard alias below.
  ['#service', `${injectedSrcDir}/service.js`],

  // Standard aliases:
  ...Object.entries(require(`${cwd}/tsconfig.json`).compilerOptions.paths).map(
    ([pattern, paths]) => [
      pattern.replace(/\/\*$/, '(/.+)?'),
      // Our aliases only define one path, using that ([0] index)
      paths[0].replace(/^\.\//, `${cwd}/`).replace(/\/\*$/, '$1'),
    ]
  ),
];

const alias = {
  name: 'alias',
  setup(build) {
    build.onResolve({filter: /.+/}, (args) => {
      for (const [pattern, replacement] of aliasPatterns) {
        const regex = new RegExp(`^${pattern}$`);
        if (args.path.match(regex)) {
          const aliased = args.path.replace(regex, replacement);
          return {path: require.resolve(aliased)};
        }
      }
      if (args.path.startsWith('#')) {
        throw new Error(JSON.stringify(args, null, 2));
      }
    });
  },
};

/**
 * @param {string} file
 * @return {string}
 */
function getBrotliSize(file) {
  return getStdout(`cat ${file} | brotli -c | wc -c`).trim();
}

(async () => {
  await esbuild.build({
    entryPoints,
    bundle: true,
    inject,
    outfile,
    define: Object.fromEntries(
      Object.entries(BUILD_CONSTANTS).map(([k, v]) => [k, v.toString()])
    ),
    plugins: [
      alias,
      getEsbuildBabelPlugin('build-universal-analytics', /* cache */ false),
    ],
  });
  console.log('Unminified Size:\n', getBrotliSize(outfile));
  // Not a full-fledged minification config, but good enough to keep track of
  // how the bundle grows.
  if (argv.minified) {
    const result = await terser.minify(await readFile(outfile, 'utf8'), {
      mangle: {properties: {regex: /_$/}},
    });
    await writeFile(outfile, result.code);
    console.log('Minified Size:\n', getBrotliSize(outfile));
  }
  console.log('==========\n' + new Date().toLocaleTimeString());
})();
