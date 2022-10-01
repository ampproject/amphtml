const argv = require('minimist')(process.argv.slice(2));
const {buildRuntime} = require('../../common/utils');
const {EXPERIMENT, urlToCachePath} = require('./helpers');
const {setExtensionsToBuildFromDocuments} = require('../extension-helpers');

/**
 * Compiles and minifies AMP runtime and components required by the urls
 * argument, unless the --nobuild flag is passed.
 * @param {Array<string>} urls
 * @return {Promise<void>}
 */
async function compileScripts(urls) {
  if (!argv.nobuild) {
    const examples = urls.map((url) => urlToCachePath(url, EXPERIMENT));
    setExtensionsToBuildFromDocuments(examples);
    await buildRuntime(/* opt_compiled */ true);
  }
}

module.exports = compileScripts;
