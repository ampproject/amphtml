import babel from 'rollup-plugin-babel';
import minify from 'rollup-plugin-minify';
import path from 'path';

export default {
  entry: './amp-iframe-api-export.js',
  format: 'umd',
  sourceMap: true,
  moduleName: 'amp-access-iframe-api',
  dest: 'build/index.js',
  plugins: [
    babel({
      babelrc: false,
      presets: [['env', {'modules': false}]],
    }),
    minify({umd: 'build/index.min.js'}),
  ],
  external: [
    path.resolve('../../../../src/polyfills.js'),
  ],
};
