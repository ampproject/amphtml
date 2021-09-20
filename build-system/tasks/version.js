const {VERSION} = require('../compile/internal-version');

/** Prints the current AMP version to stdout. */
function version() {
  console /*OK*/
    .log(VERSION);
}

module.exports = {
  version,
};

version.description = 'Prints the AMP version of the current commit/branch';
