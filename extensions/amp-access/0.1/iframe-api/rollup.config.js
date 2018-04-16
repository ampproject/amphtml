import babel from 'rollup-plugin-babel';
import minify from 'rollup-plugin-minify';

export default {
  entry: './amp-iframe-api-export.js',
  format: 'umd',
  sourceMap: true,
  moduleName: 'amp-access-iframe-api',
  dest: 'dist/index.js',
  plugins: [
    babel({
      plugins: ['external-helpers'],
      externalHelpers: true,
    }),
    minify({umd: 'dist/index.min.js'}),
  ],
};
