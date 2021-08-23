// Babel cannot directly return a valid css file.
// Therefore we provide and export this options object to allow extraction
// of the created css file via side effect from running babel.transfrorm().
export const jssOptions = {css: 'REPLACED_BY_BABEL'};

/**
 * Gets the config for transforming a JSS file to CSS
 * Only used to generate CSS files for Bento components.
 *
 * @return {!Object}
 */
export function getJssConfig() {
  return {
    plugins: [
      ['./build-system/babel-plugins/babel-plugin-transform-jss', jssOptions],
    ],
  };
}
