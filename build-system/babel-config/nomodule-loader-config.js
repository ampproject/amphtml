/** @return {{[string: string]: any}} */
function getNoModuleLoaderConfig() {
  return {
    plugins: ['./build-system/babel-plugins/babel-plugin-nomodule-loader'],
  };
}

module.exports = {
  getNoModuleLoaderConfig,
};
