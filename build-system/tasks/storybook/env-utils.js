/**
 * Change a Webpack config object so that filenames resulting from chunk
 * splitting do not include a tilde (~) character.
 * We do this since serving infrastructure does not play well with tildes.
 * See https://go.amp.dev/issue/30954#issuecomment-868679665
 * @param {Object} config
 * @return {Object}
 */
function webpackConfigNoChunkTilde(config) {
  // Change runtime filenames (like runtime~main.*)
  if (config.optimization.runtimeChunk) {
    config.optimization.runtimeChunk = {
      name: ({name}) => `runtime-${name}`,
    };
  }
  // Change all other chunked filenames (like vendors~main.*)
  if (config.optimization.splitChunks) {
    config.optimization.splitChunks.automaticNameDelimiter = '-';
  }
  return config;
}

module.exports = {
  webpackConfigNoChunkTilde,
};
