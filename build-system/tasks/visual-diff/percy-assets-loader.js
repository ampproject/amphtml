const fs = require('fs');
const mime = require('mime-types');
const path = require('path');
const walk = require('walk');

const MAX_FILE_SIZE_BYTES = 15728640;

/*
 * Loader for assets that read from multiple directories in the file system.
 *
 * This is a modified version of the @percy/puppeteer#FileSystemAssetLoader
 * class, rewritten with our style guide in mind and without the skipped assets
 * feature, which we do not use.
 */
class PercyAssetsLoader {
  /**
   * Construct a new PercyAssetsLoader.
   *
   * @param {Array<string>} assetDirs array of directories to load assets from.
   * @param {string} rootDir the root of the web server.
   */
  constructor(assetDirs, rootDir) {
    this.rootDir = rootDir;
    this.assetDirs = this.dedupAssetDirs_(assetDirs);
  }

  /**
   * Find all resources for a build.
   *
   * @param {!PercyClient} percyClient to use to add resources.
   * @return {!Promise<!Array<!PercyResource>>} a promise resolving to an
   *     array of Percy resources.
   */
  async findBuildResources(percyClient) {
    const resources = [];
    let errors;

    for (const assetDir of this.assetDirs) {
      if (!fs.statSync(assetDir).isDirectory()) {
        throw new Error(`${assetDir} is not a directory`);
      }

      walk.walkSync(assetDir, {
        followLinks: true,
        listeners: {
          file: (root, fileStats, next) => {
            const absolutePath = path.join(root, fileStats.name);
            let resourceUrl = absolutePath;
            if (path.sep === '\\') {
              // Windows: transform filesystem backslashes into forward-slashes
              // for the URL.
              resourceUrl = resourceUrl.replace(/\\/g, '/');
            }

            resourceUrl = resourceUrl.substr(this.rootDir.length);

            if (fs.statSync(absolutePath).size > MAX_FILE_SIZE_BYTES) {
              return;
            }

            const content = fs.readFileSync(absolutePath);
            resources.push(
                percyClient.makeResource({
                  resourceUrl: encodeURI(resourceUrl),
                  content,
                  mimetype: mime.lookup(resourceUrl),
                }),
            );
            next();
          },

          errors: (root, fileStats, next) => {
            errors = fileStats;
            next();
          },
        },
      });
    }

    if (resources.length === 0 && errors) {
      throw errors;
    }

    return resources;
  }

  /**
   * Deduplicate all asset directories and remove child directories.
   *
   * e.g., if the input has these directory paths:
   * ['a/b', 'a/b', 'a/c', 'd/e', 'd/f', 'd']
   * And the root path is /root, then the resulting array will be:
   * ['/root/a/b', '/root/a/c', '/root/d']
   *
   * @param {!Array<string>} rawAssetDirs an array of all asset directories
   *     that we want to include.
   * @return {!Array<string>} an array of unique asset directory paths, with
   *     child directories removed.
   */
  dedupAssetDirs_(rawAssetDirs) {
    const {rootDir} = this;

    // Collect all unique asset directories.
    const uniqueAssetDirs = new Set(rawAssetDirs);

    // Reformat the list of directories into a tree such that any path that we
    // want included (e.g., 'a/b') will have pathsTree['a']['b']['.'] === true.
    const pathsTree = {};
    for (const uniqueAssetDir of uniqueAssetDirs) {
      let subPathsTree = pathsTree;
      const dirParts = uniqueAssetDir.split('/');
      dirParts.push('.');
      for (const dirPart of dirParts) {
        if (dirPart == '.') {
          subPathsTree[dirPart] = true;
          break;
        } else if (!subPathsTree.hasOwnProperty(dirPart)) {
          subPathsTree[dirPart] = {};
        }
        subPathsTree = subPathsTree[dirPart];
      }
    }

    // Recursively iterate the tree to find all the nodes with key '.' having
    // its value === true, and return as an array.
    function* iterateTree_(tree, pathSoFar = '') {
      if (tree['.'] === true) {
        yield path.resolve(rootDir, pathSoFar);
      } else {
        for (const subPath in tree) {
          yield* iterateTree_(tree[subPath], path.join(pathSoFar, subPath));
        }
      }
    }
    return Array.from(iterateTree_(pathsTree));
  }
}

exports.PercyAssetsLoader = PercyAssetsLoader;
