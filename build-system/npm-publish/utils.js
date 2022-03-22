const {readFile} = require('fs-extra');
const fastGlob = require('fast-glob');
const path = require('path');

/**
 * Get extensions to be published on npm
 * @return {Array<any>}
 */
function getExtensions() {
  const bundles = require('../compile/bundles.config.extensions.json');
  const extensions = bundles
    .filter((bundle) => bundle.options?.npm)
    .map((bundle) => ({
      'extension': bundle.name,
      'version': bundle.version,
    }));
  return extensions;
}

/**
 * Get bento components to be published on npm
 * @return {Array<any>}
 */
function getComponents() {
  const bundles = require('../compile/bundles.config.bento.json');
  const components = bundles.map((bundle) => ({
    'extension': bundle.name,
    'version': bundle.version,
  }));
  return components;
}

/**
 * Sets package config for @bentoproject/core.
 * Follows interface used in bundle configs above
 * @type {{name: string, version: string}}
 */
const coreConfig = {
  name: 'core',
  version: '0.1',
};

/**
 * Get bento components and extensions to be published on npm
 * @return {Array<any>}
 */
function getExtensionsAndComponents() {
  return [...getExtensions(), ...getComponents()];
}

/**
 * Gets the directory of the component or extension.
 * @param {string} extension
 * @param {string} version
 * @return {string}
 */
function getPackageDir(extension, version) {
  return extension.startsWith('bento')
    ? `src/bento/components/${extension}/${version}`
    : `extensions/${extension}/${version}`;
}

/**
 * Get semver from extension version and amp version
 * See build-system/compile/internal-version.js for versioning description
 * @param {string} extensionVersion
 * @param {string} ampVersion
 * @return {string}
 */
function getSemver(extensionVersion, ampVersion) {
  const major = extensionVersion.split('.', 2)[0];
  const minor = ampVersion.slice(0, 10);
  const patch = Number(ampVersion.slice(-3)); // npm trims leading zeroes in patch number, so mimic this in package.json
  return `${major}.${minor}.${patch}`;
}

/**
 * @typedef {{
 *  name: string,
 *  version: string,
 *  author: string,
 *  license: string,
 *  main: string,
 *  module: string,
 *  description: string,
 *  homepage: string,
 *  files: string[],
 *  repostitory: {
 *   type: string,
 *   url: string,
 *   directory: string
 *  },
 *  peerDependencies: Record<string, string>,
 *  dependencies: Record<string, string>,
 * }}
 */
let PackageFileDef;

/**
 * Get the parsed package files
 * @return {Promise<PackageFileDef[]>}
 */
async function getPackageFiles() {
  const [extPackageFiles, componentPackageFiles] = await Promise.all([
    fastGlob(path.join('extensions', '**', 'package.json')),
    fastGlob(path.join('src', 'bento', 'components', '**', 'package.json')),
  ]);

  return await Promise.all(
    [...extPackageFiles, ...componentPackageFiles].map(async (filePath) => {
      const file = await readFile(filePath, 'utf-8');
      return JSON.parse(file);
    })
  );
}

/**
 * Build a graph of package names to packages (including their dependencies)
 * @param {PackageFileDef[]} packageFiles
 * @return {Record<string, PackageFileDef>}
 */
function buildPublishGraph(packageFiles) {
  return packageFiles.reduce((graph, file) => {
    graph[file.name] = file;
    return graph;
  }, {});
}

/**
 *
 * @param {Record<string, PackageFileDef>} graph
 * @return {string[]}
 */
function getPackagesWithoutDepeneceiesInGraph(graph) {
  return Object.keys(graph).filter((name) => {
    const node = graph[name];
    if (!node.dependencies) {
      return true;
    }
    return Object.keys(node?.dependencies).some((dep) => graph[dep]);
  });
}

/**
 * Because our packages rely on specific versions of each other, dependencies need to
 * be published before their dependents. This function solves the dependency graph
 * and returns the order the packages should be published in.
 * @param {Record<string, PackageFileDef>} graph
 * @return {PackageFileDef[]}
 */
function getTopologicalSort(graph) {
  /** @type {PackageFileDef[]} */
  const publishOrder = [];
  let previousPackageCount = Object.keys(graph).length;
  let packageCount = previousPackageCount;
  while (packageCount) {
    const packagesWithoutDependencies =
      getPackagesWithoutDepeneceiesInGraph(graph);
    for (const name of packagesWithoutDependencies) {
      publishOrder.push(graph[name]);
      delete graph[name];
    }
    packageCount = Object.keys(graph).length;
    if (packageCount === previousPackageCount) {
      throw new Error(
        'Could not solve dependency graph. There is likely a loop in the graph.\n' +
          JSON.stringify(graph)
      );
    }
    previousPackageCount = packageCount;
  }
  return publishOrder;
}

/**
 * Get the order the npm packages should be published in.
 * @return {Promise<string[]>}
 */
async function getOptimalPublishOrder() {
  const packageFiles = await getPackageFiles();
  const graph = buildPublishGraph(packageFiles);
  return getTopologicalSort(graph).map((node) => node.name);
}

module.exports = {
  getComponents,
  getExtensions,
  getExtensionsAndComponents,
  getOptimalPublishOrder,
  getPackageDir,
  getSemver,
  coreConfig,
  exportedForTesting: {
    getTopologicalSort,
  },
};
