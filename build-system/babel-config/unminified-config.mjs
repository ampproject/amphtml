import minimist from 'minimist';
import {getImportResolverPlugin} from './import-resolver.mjs';
import {getReplacePlugin} from './helpers.mjs';

const argv = minimist(process.argv.slice(2));

/**
 * Gets the config for babel transforms run during `amp build`.
 *
 * @return {!Object}
 */
export function getUnminifiedConfig() {
  const reactJsxPlugin = [
    '@babel/plugin-transform-react-jsx',
    {
      pragma: 'Preact.createElement',
      pragmaFrag: 'Preact.Fragment',
      useSpread: true,
    },
  ];

  const targets =
    argv.esm || argv.sxg ? {esmodules: true} : {browsers: ['Last 2 versions']};
  const presetEnv = [
    '@babel/preset-env',
    {
      bugfixes: true,
      modules: false,
      loose: true,
      targets,
    },
  ];
  const replacePlugin = getReplacePlugin();
  const unminifiedPlugins = [
    getImportResolverPlugin(),
    argv.coverage ? 'babel-plugin-istanbul' : null,
    replacePlugin,
    './build-system/babel-plugins/babel-plugin-transform-json-import',
    './build-system/babel-plugins/babel-plugin-transform-json-configuration',
    './build-system/babel-plugins/babel-plugin-transform-jss',
    './build-system/babel-plugins/babel-plugin-transform-fix-leading-comments',
    './build-system/babel-plugins/babel-plugin-transform-promise-resolve',
    './build-system/babel-plugins/babel-plugin-transform-amp-extension-call',
    '@babel/plugin-transform-react-constant-elements',
    '@babel/plugin-transform-classes',
    reactJsxPlugin,
  ].filter(Boolean);
  const unminifiedPresets = [presetEnv];
  return {
    compact: false,
    plugins: unminifiedPlugins,
    presets: unminifiedPresets,
    sourceMaps: 'inline',
  };
}
