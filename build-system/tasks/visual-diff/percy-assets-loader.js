const fs = require('fs');
const glob = require('glob');
const mime = require('mime-types');
const path = require('path');

// Based on recommended limitations from the original Percy loader.
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
   * @param {Array<string>} assetGlobs array of glob strings to load assets
   *     from.
   * @param {string} rootDir the root of the web server.
   */
  constructor(assetGlobs, rootDir) {
    this.assetGlobs = assetGlobs;
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

    for (const assetGlob of this.assetGlobs) {
      for (let assetFile of glob.sync(assetGlob, {nodir: true})) {
        if (fs.statSync(assetFile).size > MAX_FILE_SIZE_BYTES) {
          continue;
        }

        if (path.sep === '\\') {
          // Windows: transform filesystem backslashes into forward-slashes
          // for the URL.
          assetFile = assetFile.replace(/\\/g, '/');
        }


        const content = fs.readFileSync(assetFile);
        resources.push(
            percyClient.makeResource({
              resourceUrl: encodeURI(`/${assetFile}`),
              content,
              mimetype: mime.lookup(assetFile),
            }),
        );
      }
    }

    return resources;
  }
}

exports.PercyAssetsLoader = PercyAssetsLoader;
