const babelTypes = require('@babel/types');
const {parse} = require('@babel/parser');
const {resolvePath} = require('../babel-config/import-resolver');
const {lstatSync, readFileSync} = require('fs-extra');
const {once} = require('../common/once');
const {bentoBundles} = require('./bundles.config');
const glob = require('globby');
const {getNameWithoutComponentPrefix} = require('../tasks/bento-helpers');
const {posix, sep} = require('path');

const formatPathLikeSource = (path) =>
  path.startsWith('.') ? path : `.${sep}${path}`;

/**
 * @param {string} path
 * @return {?string}
 */
function resolveExactModuleFile(path) {
  let unaliased = path.startsWith('#') ? resolvePath(path) : path;
  try {
    if (lstatSync(unaliased).isDirectory()) {
      unaliased += '/index';
    }
  } catch {
    // lstat fails if not directory
  }
  const result = glob.sync(`${unaliased}.{js,jsx,ts,tsx}`);
  if (result.length !== 1) {
    return null;
  }
  return formatPathLikeSource(posix.join(...result[0].split(sep)));
}

/**
 * @param {string} filename
 * @return {string[]}
 */
function getExportAll(filename) {
  const source = readFileSync(filename, 'utf8');
  const tree = parse(source, {
    sourceType: 'module',
    plugins: ['typescript', 'jsx', 'exportDefaultFrom'],
  });
  const modules = [];
  for (const node of tree.program.body) {
    if (babelTypes.isExportAllDeclaration(node)) {
      modules.push(node.source.value);
    } else if (babelTypes.isExportDefaultDeclaration(node)) {
      throw new Error(`${filename} should not "export default"`);
    } else if (babelTypes.isExportNamedDeclaration(node)) {
      throw new Error(`${filename} should not export named symbol`);
    }
  }
  return modules;
}

/** @typedef {{source: string, cdn?: string, standalone?: string}} */
let MappingEntryDef;

/** @return {MappingEntryDef[]}}} */
const getAllRemappings = once(() => {
  // IMPORTANT: cdn mappings must start with ./dist/

  // Determine modules to import from shared bento.mjs.
  const coreBentoModules = getExportAll('src/bento/bento.js');
  const coreBentoRemappings = coreBentoModules.map((source) => ({
    source,
    cdn: '../bento.mjs',
    standalone: '@bentoproject/core',
    react: '@bentoproject/core/react',
    preact: '@bentoproject/core/preact',
  }));

  // Allow component cross-dependency
  const componentRemappings = bentoBundles.map(({name, version}) => {
    const nameWithoutPrefix = getNameWithoutComponentPrefix(name);
    // Special: NPM builds depend on `mustache` directly
    const standalone =
      nameWithoutPrefix === 'mustache'
        ? 'mustache'
        : `@bentoproject/${nameWithoutPrefix}`;
    const [preact, react] = ['preact', 'react'].map((mode) =>
      standalone.startsWith('@bentoproject')
        ? `${standalone}/${mode}`
        : standalone
    );
    return {
      source: posix.join(
        '.',
        'src',
        'bento',
        'components',
        name,
        version,
        name
      ),
      cdn: posix.join('.', `${name}-${version}.mjs`),
      standalone,
      preact,
      react,
    };
  });

  return /** @type {MappingEntryDef[]} */ (
    [...coreBentoRemappings, ...componentRemappings]
      .map(({cdn, source, ...rest}) => {
        const resolved = resolveExactModuleFile(source);
        if (resolved) {
          return {
            source: resolved,
            cdn: formatPathLikeSource(cdn),
            ...rest,
          };
        }
      })
      .filter(Boolean)
  );
});

/**
 * @param {'standalone'|'cdn'|'react'|'preact'} type
 * @param {?string|undefined} entryPoint
 *   Full path to entrypoint required to prevent it from mapping itself.
 * @return {{[string: string]: string}}
 */
function getRemappings(type, entryPoint) {
  const entryPointFormattedLikeSource = entryPoint
    ? formatPathLikeSource(entryPoint)
    : null;
  return /** @type {{[string: string]: string}} */ (
    Object.fromEntries(
      getAllRemappings()
        .filter(
          (mapping) =>
            mapping.source !== entryPointFormattedLikeSource && mapping[type]
        )
        .map((mapping) => [mapping.source, mapping[type]])
    )
  );
}

/**
 * Remaps imports from source to externals on CDN builds.
 * @param {?string|undefined} entryPoint
 *   Full path to entrypoint required to prevent it from mapping itself.
 * @param {string} isMinified
 * @return {{[string: string]: string}}
 */
function getRemapBentoDependencies(entryPoint, isMinified) {
  const remappings = getRemappings('cdn', entryPoint);
  if (isMinified) {
    return remappings;
  }
  return Object.fromEntries(
    Object.entries(remappings).map(([source, cdn]) => [
      source,
      cdn.replace('.mjs', '.max.mjs'),
    ])
  );
}

/**
 * Remaps imports from source to externals on NPM builds.
 * @param {?string|undefined} entryPoint
 *   Full path to entrypoint required to prevent it from mapping itself.
 * @return {{[string: string]: string}}
 */
function getRemapBentoNpmDependencies(entryPoint) {
  return getRemappings('standalone', entryPoint);
}

/**
 * Remaps imports from source to externals on NPM builds.
 * @param {?string|undefined} entryPoint
 *   Full path to entrypoint required to prevent it from mapping itself.
 * @return {{[string: string]: string}}
 */
function getRemapBentoNpmPreactDependencies(entryPoint) {
  return getRemappings('preact', entryPoint);
}

/**
 * Remaps imports from source to externals on NPM builds.
 * @param {?string|undefined} entryPoint
 *   Full path to entrypoint required to prevent it from mapping itself.
 * @return {{[string: string]: string}}
 */
function getRemapBentoNpmReactDependencies(entryPoint) {
  return getRemappings('react', entryPoint);
}

module.exports = {
  getRemapBentoDependencies,
  getRemapBentoNpmDependencies,
  getRemapBentoNpmPreactDependencies,
  getRemapBentoNpmReactDependencies,
};
