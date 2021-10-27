const argv = require('minimist')(process.argv.slice(2));
const debounce = require('../common/debounce');
const fs = require('fs');
const {
  bentoBundles,
  extensionAliasBundles,
  jsBundles,
  verifyBentoBundles,
} = require('../compile/bundles.config');
const {
  INABOX_EXTENSION_SET,
  buildBentoCss,
  buildBinaries,
  buildExtensionJs,
  buildNpmBinaries,
  buildNpmCss,
  declareExtension,
  dedupe,
  getBentoBuildFilename,
  getExtensionsFromArg,
} = require('./extension-helpers');
const {analyticsVendorConfigs} = require('./analytics-vendor-configs');
const {compileJison} = require('./compile-jison');
const {doBuildJs, endBuildStep, watchDebounceDelay} = require('./helpers');
const {existsSync, mkdirSync} = require('fs');
const {getBentoName} = require('./bento-helpers');
const {jsifyCssAsync} = require('./css/jsify-css');
const {log} = require('../common/logging');
const {red} = require('kleur/colors');
const {watch} = require('chokidar');

// All declared components.
const components = {};

// All components to build.
let componentsToBuild = null;

/**
 * Initializes all components from build-system/compile/bundles.config.bento.json
 * if not already done and populates the given components object.
 * @param {?Object} componentsObject
 * @param {boolean=} includeLatest
 */
function maybeInitializeComponents(
  componentsObject = components,
  includeLatest = false
) {
  if (Object.keys(componentsObject).length === 0) {
    verifyBentoBundles();
    bentoBundles.forEach((c) => {
      declareExtension(
        c.name,
        c.version,
        c.latestVersion,
        c.options,
        componentsObject,
        includeLatest
      );
    });
  }
}

/**
 * Process the command line arguments --nocomponents, --components, and
 * --components_from and return a list of the referenced components.
 *
 * @param {boolean=} preBuild
 * @return {!Array<string>}
 */
function getComponentsToBuild(preBuild = false) {
  componentsToBuild = [];
  if (argv.components) {
    if (typeof argv.components !== 'string') {
      log(red('ERROR:'), 'Missing list of components.');
      process.exit(1);
    } else if (argv.components === 'inabox') {
      argv.components = INABOX_EXTENSION_SET.join(',');
    }
    const explicitComponents = argv.components.replace(/\s/g, '').split(',');
    componentsToBuild = dedupe(componentsToBuild.concat(explicitComponents));
  }
  if (argv.components_from) {
    const componentsFrom = getExtensionsFromArg(argv.components_from);
    componentsToBuild = dedupe(componentsToBuild.concat(componentsFrom));
  }
  if (
    !preBuild &&
    !argv.nocomponents &&
    !argv.components &&
    !argv.components_from &&
    !argv.core_runtime_only
  ) {
    const allComponents = [];
    for (const component in components) {
      allComponents.push(components[component].name);
    }
    componentsToBuild = dedupe(componentsToBuild.concat(allComponents));
  }
  return componentsToBuild;
}

/**
 *
 * @param {string} componentsDir
 * @param {string} name
 * @param {string} version
 * @param {!Object} options
 * @return {!Promise<void>}
 */
async function buildComponentCss(componentsDir, name, version, options) {
  /**
   * Writes CSS binaries
   *
   * @param {string} name
   * @param {string} css
   */
  function writeCssBinaries(name, css) {
    const jsCss = 'export const CSS = ' + JSON.stringify(css) + ';\n';
    const jsName = `build/${name}.js`;
    const cssName = `build/css/${name}`;
    fs.writeFileSync(jsName, jsCss, 'utf-8');
    fs.writeFileSync(cssName, css, 'utf-8');
  }

  const aliasBundle = extensionAliasBundles[name];
  const isAliased = aliasBundle && aliasBundle.version == version;

  const mainCssPromise = jsifyCssAsync(`${componentsDir}/${name}.css`);

  const mainCssBinaryPromise = mainCssPromise.then((mainCss) => {
    writeCssBinaries(`${name}-${version}.css`, mainCss);
    if (isAliased) {
      writeCssBinaries(`${name}-${aliasBundle.aliasedVersion}.css`, mainCss);
    }
  });

  const parallel = [mainCssBinaryPromise];

  if (options.bento) {
    const bentoCssPromise = mainCssPromise.then((mainCss) =>
      buildBentoCss(name, version, mainCss)
    );
    parallel.push(bentoCssPromise);
  }

  if (Array.isArray(options.cssBinaries)) {
    parallel.push(
      ...options.cssBinaries.map((name) => {
        return jsifyCssAsync(`${componentsDir}/${name}.css`).then((css) => {
          writeCssBinaries(`${name}-${version}.css`, css);
          if (isAliased) {
            writeCssBinaries(`${name}-${aliasBundle.aliasedVersion}.css`, css);
          }
        });
      })
    );
  }

  await Promise.all(parallel);
}

/**
 * Watches for non-JS changes within an extensions directory to trigger
 * recompilation.
 *
 * @param {string} compoentsDir
 * @param {string} name
 * @param {string} version
 * @param {string} latestVersion
 * @param {boolean} hasCss
 * @param {?Object} options
 * @return {Promise<void>}
 */
async function watchComponent(
  compoentsDir,
  name,
  version,
  latestVersion,
  hasCss,
  options
) {
  /**
   * Steps to run when a watched file is modified.
   */
  function watchFunc() {
    buildComponent(name, version, latestVersion, hasCss, {
      ...options,
      continueOnError: true,
      isRebuild: true,
      watch: false,
    });
  }

  const cssDeps = `${compoentsDir}/**/*.css`;
  const jisonDeps = `${compoentsDir}/**/*.jison`;
  const ignored = /dist/; //should not watch npm dist folders.
  watch([cssDeps, jisonDeps], {ignored}).on(
    'change',
    debounce(watchFunc, watchDebounceDelay)
  );
}

/**
 * Copies components from
 * bento/components/$name/$name.js
 * to
 * dist/v0/$name-$version.js
 *
 * Optionally copies the CSS at components/$name/$version/$name.css into
 * a generated JS file that can be required from the components as
 * `import {CSS} from '../../../build/$name-0.1.css';`
 *
 * @param {string} name Name of the extension. Must be the sub directory in
 *     the components directory and the name of the JS and optional CSS file.
 * @param {string} version Version of the extension. Must be identical to
 *     the sub directory inside the extension directory
 * @param {string} latestVersion Latest version of the extension.
 * @param {boolean} hasCss Whether there is a CSS file for this extension.
 * @param {?Object} options
 * @param {!Array=} extraGlobs
 * @return {!Promise<void>}
 */
async function buildComponent(
  name,
  version,
  latestVersion,
  hasCss,
  options,
  extraGlobs
) {
  options = options || {};
  options.extraGlobs = extraGlobs;
  if (options.compileOnlyCss && !hasCss) {
    return;
  }
  const componentsDir = `bento/components/${name}`;
  if (options.watch) {
    await watchComponent(
      componentsDir,
      name,
      version,
      latestVersion,
      hasCss,
      options
    );
  }

  if (hasCss) {
    if (!existsSync('build')) {
      mkdirSync('build');
    }
    if (!existsSync('build/css')) {
      mkdirSync('build/css');
    }
    await buildComponentCss(componentsDir, name, version, options);
    if (options.compileOnlyCss) {
      return;
    }
  }
  await compileJison(`${componentsDir}/**/*.jison`);
  if (name === 'amp-bind') {
    await doBuildJs(jsBundles, 'ww.max.js', options);
  }
  if (options.npm) {
    await buildNpmBinaries(componentsDir, name, options);
    await buildNpmCss(componentsDir, options);
  }
  if (options.binaries) {
    await buildBinaries(componentsDir, options.binaries, options);
  }
  if (name === 'amp-analytics') {
    await analyticsVendorConfigs(options);
  }

  if (options.isRebuild) {
    return;
  }

  const bentoName = getBentoName(name);
  await buildExtensionJs(componentsDir, bentoName, {
    ...options,
    wrapper: 'none',
    filename: await getBentoBuildFilename(
      componentsDir,
      bentoName,
      'standalone',
      options
    ),
    // Include extension directory since our entrypoint may be elsewhere.
    extraGlobs: [...(options.extraGlobs || []), `${componentsDir}/**/*.js`],
  });
}

/**
 * Builds a single component after extracting its settings.
 * @param {!Object} components
 * @param {string} component
 * @param {!Object} options
 * @return {!Promise<void>}
 */
async function doBuildComponent(components, component, options) {
  const e = components[component];
  let o = {...options};
  o = Object.assign(o, e);
  await buildComponent(
    e.name,
    e.version,
    e.latestVersion,
    e.hasCss,
    o,
    e.extraGlobs
  );
}

/**
 * Build all the AMP extensions
 *
 * @param {!Object} options
 * @return {!Promise<void>}
 */
async function buildComponents(options) {
  const startTime = Date.now();
  maybeInitializeComponents();
  const componentsToBuild = getComponentsToBuild();
  let totalComponentsBuilt = 0;
  for (const component in components) {
    if (
      options.compileOnlyCss ||
      componentsToBuild.includes(components[component].name)
    ) {
      await doBuildComponent(components, component, options);
      totalComponentsBuilt++;
    }
  }

  if (!options.compileOnlyCss && totalComponentsBuilt > 0) {
    endBuildStep(
      options.minify ? 'Minified all' : 'Compiled all',
      'extensions',
      startTime
    );
  }
}

module.exports = {buildComponents};
