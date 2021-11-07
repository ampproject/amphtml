import path from 'path';
import babel from 'rollup-plugin-babel';
import cleanup from 'rollup-plugin-cleanup';

export default {
  input: './amp-iframe-api-export.js',
  output: {
    name: 'AmpAccessIframeApi',
    format: 'umd',
    file: 'build/index.js',
    sourceMap: true,
  },
  plugins: [
    babel({
      babelrc: false,
      presets: [['env', {'modules': false}]],
    }),
    cleanup(),
  ],
  external: [path.resolve('../../../../src/polyfills/index.js')],
};
