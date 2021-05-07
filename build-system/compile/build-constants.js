const argv = require('minimist')(process.argv.slice(2));
const experimentDefines = require('../global-configs/experiments-const.json');

function getBuildTimeConstants(options) {
  return {
    ...experimentDefines,
    IS_FORTESTING: !!options.fortesting,
    IS_MINIFIED: !!options.minify,

    // We build on the idea that SxG is an upgrade to the ESM build.
    // Therefore, all conditions set by ESM will also hold for SxG.
    // However, we will also need to introduce a separate IS_SxG flag
    // for conditions only true for SxG.
    IS_ESM: argv.esm || argv.sxg,
    IS_SXG: !!argv.sxg,
  };
}

module.exports = {
  getBuildTimeConstants,
};
