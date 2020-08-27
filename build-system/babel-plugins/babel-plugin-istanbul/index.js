const path = require('path');
const schema = require('@istanbuljs/schema');
const TestExclude = require('test-exclude');
const {declare} = require('@babel/helper-plugin-utils');
const {execFileSync} = require('child_process');
const {programVisitor} = require('istanbul-lib-instrument');
const {realpathSync} = require('fs');

function getRealpath(n) {
  try {
    return realpathSync(n) || /* istanbul ignore next */ n;
  } catch (e) {
    /* istanbul ignore next */
    return n;
  }
}

const memoize = new Map();
/* istanbul ignore next */
const memosep = path.sep === '/' ? ':' : ';';

function loadNycConfig(cwd, opts) {
  let memokey = cwd;
  const args = [path.resolve(__dirname, 'load-nyc-config-sync.js'), cwd];

  if ('nycrcPath' in opts) {
    args.push(opts.nycrcPath);

    memokey += memosep + opts.nycrcPath;
  }

  /* execFileSync is expensive, avoid it if possible! */
  if (memoize.has(memokey)) {
    return memoize.get(memokey);
  }

  const result = JSON.parse(execFileSync(process.execPath, args));
  const error = result['load-nyc-config-sync-error'];
  if (error) {
    throw new Error(error);
  }

  const config = {...schema.defaults.babelPluginIstanbul, cwd, ...result};
  memoize.set(memokey, config);
  return config;
}

function findConfig(opts) {
  const cwd = getRealpath(
    opts.cwd || process.env.NYC_CWD || /* istanbul ignore next */ process.cwd()
  );
  const keys = Object.keys(opts);
  const ignored = Object.keys(opts).filter(
    (s) => s === 'nycrcPath' || s === 'cwd'
  );
  if (keys.length > ignored.length) {
    // explicitly configuring options in babel
    // takes precedence.
    return {...schema.defaults.babelPluginIstanbul, cwd, ...opts};
  }

  if (ignored.length === 0 && process.env.NYC_CONFIG) {
    // defaults were already applied by nyc
    return JSON.parse(process.env.NYC_CONFIG);
  }

  return loadNycConfig(cwd, opts);
}

function makeShouldSkip() {
  let exclude;

  return function shouldSkip(file, nycConfig) {
    if (!exclude || exclude.cwd !== nycConfig.cwd) {
      exclude = new TestExclude({
        cwd: nycConfig.cwd,
        include: nycConfig.include,
        exclude: nycConfig.exclude,
        extension: nycConfig.extension,
        // Make sure this is true unless explicitly set to `false`. `undefined`
        // is still `true`.
        excludeNodeModules: nycConfig.excludeNodeModules !== false,
      });
    }

    return !exclude.shouldInstrument(file);
  };
}

module.exports = declare((api) => {
  api.assertVersion(7);

  const shouldSkip = makeShouldSkip();

  const t = api.types;
  return {
    visitor: {
      Program: {
        enter(path) {
          this.__dv__ = null;
          this.nycConfig = findConfig(this.opts);
          const realPath = getRealpath(this.file.opts.filename);
          if (shouldSkip(realPath, this.nycConfig)) {
            return;
          }
          let {inputSourceMap} = this.opts;
          if (this.opts.useInlineSourceMaps !== false) {
            if (!inputSourceMap && this.file.inputMap) {
              inputSourceMap = this.file.inputMap.sourcemap;
            }
          }
          const visitorOptions = {};
          Object.entries(schema.defaults.instrumentVisitor).forEach(
            ([name, defaultValue]) => {
              if (name in this.nycConfig) {
                visitorOptions[name] = this.nycConfig[name];
              } else {
                visitorOptions[name] = schema.defaults.instrumentVisitor[name];
              }
            }
          );
          this.__dv__ = programVisitor(t, realPath, {
            ...visitorOptions,
            inputSourceMap,
          });
          this.__dv__.enter(path);
        },
        exit(path) {
          if (!this.__dv__) {
            return;
          }
          const result = this.__dv__.exit(path);
          if (this.opts.onCover) {
            this.opts.onCover(
              getRealpath(this.file.opts.filename),
              result.fileCoverage
            );
          }
        },
      },
    },
  };
});
