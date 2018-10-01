const fs = require('fs');
const mime = require('mime-types');
const path = require('path');
const walk = require('walk');

const MAX_FILE_SIZE_BYTES = 15728640;

/*
 * Loader for assets that read from multiple directories in the file system.
 */
class PercyAssetsLoader {
  /**
   * Construct a new PercyAssetsLoader.
   *
   * This is a modified version of the @percy/puppeteer#FileSystemAssetLoader
   * class, rewritten with our style guide in mind and without the skipped
   * assets feature, which we do not use.
   *
   * @param {Array<string>} assetDirs array of directories to load assets from.
   * @param {string} rootDir the root of the web server.
   */
  constructor(assetDirs, rootDir) {
    this.assetDirs = assetDirs;
    this.rootDir = rootDir;
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
}

exports.PercyAssetsLoader = PercyAssetsLoader;
