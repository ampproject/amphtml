const {cyan, green, red} = require('ansi-colors');
const log = require('fancy-log');
const {exec} = require('../common/exec');
const {SERVER_TRANSFORM_PATH} = require('../compile/sources');

// Used by new server implementation
const typescriptBinary = './node_modules/typescript/bin/tsc';

/**
 * Builds the new server by converting typescript transforms to JS
 */
function buildNewServer() {
  const buildCmd = `${typescriptBinary} -p ${SERVER_TRANSFORM_PATH}/tsconfig.json`;
  log(
    green('Building'),
    cyan('AMP Dev Server'),
    green('at'),
    cyan(`${SERVER_TRANSFORM_PATH}/dist`) + green('...')
  );
  const result = exec(buildCmd, {'stdio': ['inherit', 'inherit', 'pipe']});
  if (result.status != 0) {
    const err = new Error('Could not build AMP Dev Server');
    err.showStack = false;
    throw err;
  }
}

module.exports = {
  buildNewServer,
};
