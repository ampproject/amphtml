import babel from 'rollup-plugin-babel';
import fs from 'fs';
import minify from 'rollup-plugin-minify';
const packageDetils = require(__dirname + '/package.json');
var babelRc = JSON.parse(fs.readFileSync('.babelrc','utf8')); // eslint-disable-line

export default {
  entry: 'src/index.js',
  format: 'umd',
  sourceMap: true,
  moduleName: packageDetils.name,
  dest: 'dist/index.js',
  plugins: [
    babel({
      babelrc: false,
      presets: [
        ['es2015', {loose: true, modules: false}],
      ].concat(babelRc.presets.slice(1)),
      plugins: babelRc.plugins,
      exclude: 'node_modules/**',
    }),
    minify({umd: 'dist/index.min.js'}),
  ],
};
