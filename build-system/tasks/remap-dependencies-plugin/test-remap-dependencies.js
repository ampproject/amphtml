'use strict';

const test = require('ava');
const sinon = require('sinon');
const path = require('path');
const {remapDependenciesPlugin} = require('./remap-dependencies');

/**
 * slightly complex but mocks ampResolve() which is itself complex
 * handles resolving node modules by returning input
 * handles resolving local paths by
 *  ensuring it's prefixed with './'
 *  ensuring it resolves barrel files (ie. directory imports) by
 *    suffixing filepath with '/index' and appropriate file extension
 */
const resolveMock = sinon.fake((s, resolveDir, unusedAbsRootDir) => {
  if (s.startsWith('#')) {
    // do nothing
    // technically ampResolve handles aliased paths, but I'm not mocking it since this functionality isn't actually used in the remap-dependencies plugin
    // esbuild should have already resolved path aliases because it adheres to tsconfig.compilerOptions.paths config (https://esbuild.github.io/content-types/#tsconfig-json)
  } else if (s.startsWith('node-mod-')) {
    // return input if it's a node module (use special "node-mod-" prefix in tests to indicate node module)
    // later we will assert that we resolved to the node-mod-
    return s;
  } else {
    // handle directory imports with barrel file and appropriate file extension to emulate behavior of resolvePath
    s = path.posix.join(resolveDir, s);
    if (s.match(/((js|jsx|ts|tsx)-)?dir\d?\/?(index)?$/)) {
      // return barrel file if importing a directory (use special "dir" in tests to indicate path to directory)
      const [, , fileType, indexStr] = s.match(
        /((js|jsx|ts|tsx)-)?dir\d?\/?(index)?$/
      );
      if (!indexStr) {
        s = path.posix.join(s, '/index');
      }
      s += `.${fileType || 'js'}`;
    }
    // handle file imports with appropriate file extension to emulate behavior of resolvePath
    if (s.match(/\/((js|jsx|ts|tsx)-)?mod\d?$/)) {
      const fileType = s.match(/\/((js|jsx|ts|tsx)-)?mod\d?$/)[2];
      s += `.${fileType || 'js'}`;
    }
    return s;
  }
});

/**
 * @param {Array<string>} externals
 * @param {object} remaps
 * @return {*}
 */
function setup(externals, remaps) {
  // indicates that a particular path was resolved relative to the root of the directory
  const plugin = remapDependenciesPlugin({
    externals,
    remaps,
    resolve: resolveMock,
  });
  const onResolveSpy = sinon.spy();
  plugin.setup({onResolve: onResolveSpy});
  const onResolve = onResolveSpy.getCall(0).args[1];
  return onResolve;
}

test.afterEach(() => {
  // Restore the default sandbox here
  sinon.restore();
});

const rootDir = path.join(__dirname, '../../..');

test('remap node modules to other node modules', (t) => {
  const onResolve = setup(['node-mod-A', 'node-mod-C'], {
    // multiple mods to same external mod
    'node-mod-1': 'node-mod-A',
    'node-mod-2': 'node-mod-A',

    // multiple mods to same bundled mod
    'node-mod-3': 'node-mod-B',
    'node-mod-4': 'node-mod-B',

    // single mod to external mod
    'node-mod-5': 'node-mod-C',

    // single mod to bundled mod
    'node-mod-6': 'node-mod-D',
  });

  const res1 = onResolve({path: 'node-mod-1'});
  t.is(res1?.path, 'node-mod-A');
  t.is(res1?.external, true);

  const res2 = onResolve({path: 'node-mod-2'});
  t.is(res2?.path, 'node-mod-A');
  t.is(res2?.external, true);

  const res3 = onResolve({path: 'node-mod-3'});
  t.is(res3?.path, 'node-mod-B');
  t.is(res3?.external, false);

  const res4 = onResolve({path: 'node-mod-4'});
  t.is(res4?.path, 'node-mod-B');
  t.is(res4?.external, false);

  const res5 = onResolve({path: 'node-mod-5'});
  t.is(res5?.path, 'node-mod-C');
  t.is(res5?.external, true);

  const res6 = onResolve({path: 'node-mod-6'});
  t.is(res6?.path, 'node-mod-D');
  t.is(res6?.external, false);

  // remapping module with no remaps should return undefined
  t.is(onResolve({path: 'node-mod-0'}), undefined);
});

test('remap local modules to node modules', (t) => {
  const onResolve = setup(['node-mod-A', 'node-mod-C'], {
    // multiple mods => same external mod
    './mod1': 'node-mod-A',
    './mod2.js': 'node-mod-A',

    // multiple mods => same bundled mod
    './mod3.js': 'node-mod-B',
    './mod4.js': 'node-mod-B',

    // single mod => external mod
    './mod5.js': 'node-mod-C',

    // single mod => bundled mod
    './mod6.js': 'node-mod-D',

    // handle directory imports (with various types of barrel files) => external mod
    './src/1/dir/index.js': 'node-mod-A',
    './src/1/js-dir/index.js': 'node-mod-A',
    './src/1/jsx-dir/index.jsx': 'node-mod-A',
    './src/1/ts-dir/index.ts': 'node-mod-A',
    './src/1/tsx-dir/index.tsx': 'node-mod-A',

    // handle directory imports (with various types of barrel files) => bundled mod
    './src/2/dir/index.js': 'node-mod-B',
    './src/2/js-dir/index.js': 'node-mod-B',
    './src/2/jsx-dir/index.jsx': 'node-mod-B',
    './src/2/ts-dir/index.ts': 'node-mod-B',
    './src/2/tsx-dir/index.tsx': 'node-mod-B',

    './src/3/dir/index': 'node-mod-A',
    './src/4/dir/index': 'node-mod-B',
  });

  // test various types of file imports
  const res1 = onResolve({resolveDir: rootDir, path: './mod1'});
  t.is(res1.path, 'node-mod-A');
  t.is(res1.external, true);
  const res2 = onResolve({resolveDir: rootDir, path: './mod2'});
  t.is(res2.path, 'node-mod-A');
  t.is(res2.external, true);
  const res3 = onResolve({resolveDir: rootDir, path: './mod3'});
  t.is(res3.path, 'node-mod-B');
  t.is(res3.external, false);
  const res4 = onResolve({resolveDir: rootDir, path: './mod4'});
  t.is(res4.path, 'node-mod-B');
  t.is(res4.external, false);
  const res5 = onResolve({resolveDir: rootDir, path: './mod5'});
  t.is(res5.path, 'node-mod-C');
  t.is(res5.external, true);
  const res6 = onResolve({resolveDir: rootDir, path: './mod6'});
  t.is(res6.path, 'node-mod-D');
  t.is(res6.external, false);
  t.is(onResolve({resolveDir: rootDir, path: './mod0'}), undefined);

  t.is(
    onResolve({resolveDir: path.join(rootDir, './src/1/dir'), path: './'}).path,
    'node-mod-A'
  );

  // test import local directory => external module
  const dirRes1a = onResolve({resolveDir: rootDir, path: './src/1/dir/'});
  t.is(dirRes1a.path, 'node-mod-A');
  t.is(dirRes1a.external, true);
  const dirRes1b = onResolve({resolveDir: rootDir, path: './src/1/js-dir/'});
  t.is(dirRes1b.path, 'node-mod-A');
  t.is(dirRes1b.external, true);
  const dirRes1c = onResolve({resolveDir: rootDir, path: './src/1/jsx-dir/'});
  t.is(dirRes1c.path, 'node-mod-A');
  t.is(dirRes1c.external, true);
  const dirRes1d = onResolve({resolveDir: rootDir, path: './src/1/ts-dir/'});
  t.is(dirRes1d.path, 'node-mod-A');
  t.is(dirRes1d.external, true);
  const dirRes1e = onResolve({resolveDir: rootDir, path: './src/1/tsx-dir/'});
  t.is(dirRes1e.path, 'node-mod-A');
  t.is(dirRes1e.external, true);

  const dirRes2a = onResolve({resolveDir: rootDir, path: './src/2/dir/'});
  t.is(dirRes2a.path, 'node-mod-B');
  t.is(dirRes2a.external, false);
  const dirRes2b = onResolve({resolveDir: rootDir, path: './src/2/js-dir/'});
  t.is(dirRes2b.path, 'node-mod-B');
  t.is(dirRes2b.external, false);
  const dirRes2c = onResolve({resolveDir: rootDir, path: './src/2/jsx-dir/'});
  t.is(dirRes2c.path, 'node-mod-B');
  t.is(dirRes2c.external, false);
  const dirRes2d = onResolve({resolveDir: rootDir, path: './src/2/ts-dir/'});
  t.is(dirRes2d.path, 'node-mod-B');
  t.is(dirRes2d.external, false);
  const dirRes2e = onResolve({resolveDir: rootDir, path: './src/2/tsx-dir/'});
  t.is(dirRes2e.path, 'node-mod-B');
  t.is(dirRes2e.external, false);

  // test remaps with no file extensions
  const resNoExtensionExternal = onResolve({
    resolveDir: rootDir,
    path: './src/3/dir/',
  });
  t.is(resNoExtensionExternal.path, 'node-mod-A');
  t.is(resNoExtensionExternal.external, true);

  const resNoExtensionBundled = onResolve({
    resolveDir: rootDir,
    path: './src/4/dir/',
  });
  t.is(resNoExtensionBundled.path, 'node-mod-B');
  t.is(resNoExtensionBundled.external, false);
});

test('remap local modules to local modules', (t) => {
  const onResolve = setup([], {
    // multiple mods => same external mod
    './mod1': './mod2',
    './js-dir/mod1.js': './mod2.js',
    './jsx-dir/mod1.jsx': './mod2.jsx',
    './ts-dir/mod1.ts': './mod2.ts',
    './tsx-dir/mod1.tsx': './mod2.tsx',
  });

  const expectations = {
    'mod1': 'mod2.js',
    'js-dir/mod1.js': 'mod2.js',
    'jsx-dir/mod1.jsx': 'mod2.jsx',
    'ts-dir/mod1.ts': 'mod2.ts',
    'tsx-dir/mod1.tsx': 'mod2.tsx',
  };

  for (const imp in expectations) {
    const val = expectations[imp];
    t.is(
      `.${path.posix.sep}${path.posix.relative(
        rootDir,
        onResolve({path: `.${path.posix.sep}${imp}`, resolveDir: rootDir}).path
      )}`,
      `.${path.posix.sep}${val}`
    );
  }
});
