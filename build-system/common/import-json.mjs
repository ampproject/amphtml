import {createRequire} from 'module';

/**
 * Temporary workaround since Node ESM doesn't support ImportAssertions.
 * @param {string} path
 * @return {JSON}
 */
export function importJSON(base, path) {
  console.log('importJSON', {base, path});
  const require = createRequire(base);
  return require(path);
}
