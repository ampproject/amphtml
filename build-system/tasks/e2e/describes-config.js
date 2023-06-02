/**
 * @typedef {{
 *  browsers: string,
 *  headless: boolean,
 * }}
 */
let DescribesConfigDef;

/** @const {?DescribesConfigDef} */
let describesConfig = null;

/**
 * Configure all tests. This may only be called once, since it is only read once
 * and writes after reading will not have any effect.
 * @param {!DescribesConfigDef} config
 */
function configure(config) {
  if (describesConfig) {
    throw new Error('describes.configure should only be called once');
  }

  describesConfig = {...config};
}

/**
 * Retrieve the describes config if set.
 * If not set, it sets the config to an empty object and returns it.
 * After getting the config the first time, the config may not be changed.
 * @return {!DescribesConfigDef}
 */
function getConfig() {
  if (!describesConfig) {
    describesConfig = {};
  }

  return describesConfig;
}

module.exports = {
  DescribesConfigDef,
  configure,
  getConfig,
};
