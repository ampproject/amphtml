/** @return {{[string: string]: any}} */
function getAmdConfig() {
  return {
    plugins: [
      '@babel/plugin-transform-modules-amd',
      './build-system/babel-plugins/babel-plugin-amd-custom-define',
    ],
  };
}

module.exports = {
  getAmdConfig,
};
