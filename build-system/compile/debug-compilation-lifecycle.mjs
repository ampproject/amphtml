import fs from 'fs';
import minimist from 'minimist';
import path from 'path';
import tempy from 'tempy';
import {cyan, red} from 'kleur/colors';
import {log} from '../common/logging.mjs';

const argv = minimist(process.argv.slice(2));
const logFile = path.resolve(process.cwd(), 'dist', 'debug-compilation.log');

const pad = (value, length) =>
  (value.length > length ? value.slice(value.length - length) : value).padEnd(
    length
  );

export const CompilationLifecycles = {
  'pre-babel': 'pre-babel',
  'post-babel': 'post-babel',
  'pre-closure': 'pre-closure',
  'closured-pre-babel': 'closured-pre-babel',
  'closured-pre-terser': 'closured-pre-terser',
  'complete': 'complete',
};

/**
 * Output debugging information when developing changes in this functionality.
 *
 * @param {string} lifecycle
 * @param {string} fullpath
 * @param {?string=} content
 * @param {Object=} sourcemap
 */
export function debug(lifecycle, fullpath, content, sourcemap) {
  if (argv.debug && Object.keys(CompilationLifecycles).includes(lifecycle)) {
    if (!content) {
      content = fs.readFileSync(fullpath, 'utf-8');
    }
    const sourcemapPath = `${fullpath}.map`;
    if (!sourcemap && fs.existsSync(sourcemapPath)) {
      sourcemap = fs.readFileSync(sourcemapPath, 'utf-8');
    }
    const contentsPath = tempy.writeSync(content);
    if (sourcemap) {
      fs.writeFileSync(
        `${contentsPath}.map`,
        JSON.stringify(sourcemap, null, 4)
      );
    }
    fs.appendFileSync(
      logFile,
      `${pad(lifecycle, 20)}: ${pad(fullpath, 100)} ${contentsPath}\n`
    );
  }
}

/**
 * Logs debug information.
 */
export function displayLifecycleDebugging() {
  if (argv.debug) {
    log(cyan('Debug Lifecycles: ') + red(logFile));
  }
}
