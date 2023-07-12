import {basename, format, parse} from 'path';
import {URL} from 'url';

// eslint-disable-next-line local/no-forbidden-terms
export const VALID_CDN_ORIGIN = 'https://cdn.ampproject.org';

export const AMP_MAIN_BINARIES_RENAMES = new Map([
  ['v0', 'amp'],
  ['f', 'integration'],
  ['shadow-v0', 'amp-shadow'],
  ['ampcontext-v0', 'ampcontext-lib'],
  ['amp4ads-v0', 'amp-inabox'],
  ['amp4ads-host-v0', 'amp-inabox-host'],
  ['iframe-transport-client-v0', 'iframe-transform-client-lib'],
  ['video-iframe-integration-v0', 'video-iframe-integration'],
  ['amp-story-entry-point-v0', 'amp-story-entry-point'],
  ['amp-story-player-v0', 'amp-story-player'],
]);

/**
 * @param {string} minifiedBasename should be without extension
 * @return {string}
 */
function getMinifiedName(minifiedBasename: string): string {
  const renamedBasename = AMP_MAIN_BINARIES_RENAMES.get(minifiedBasename);
  if (renamedBasename) {
    return renamedBasename;
  }

  return `${minifiedBasename}.max`;
}

/**
 * Convert an existing URL to one from the local `serve` command.
 */
export function CDNURLToLocalDistURL(
  url: URL,
  pathnames: [string | null, string | null] = [null, null],
  extension: string = '.js',
  port: number = 8000,
  useMaxNames = false
): URL {
  url.protocol = 'http';
  url.hostname = 'localhost';
  url.port = String(port);
  return replaceCDNURLPath(url, pathnames, extension, useMaxNames);
}

export function replaceCDNURLPath(
  url: URL,
  pathnames: [string | null, string | null] = [null, null],
  extension: string = '.js',
  useMaxNames = false
): URL {
  const [overwriteablePathname, newPathname] = pathnames;
  if (url.pathname === overwriteablePathname && newPathname !== null) {
    url.pathname = newPathname;
  }

  const parsedPath = parse('/dist' + url.pathname);
  let curBasename = basename(parsedPath.base, parsedPath.ext);
  if (useMaxNames) {
    curBasename = getMinifiedName(curBasename);
  }
  if (parsedPath.ext !== extension) {
    parsedPath.ext = extension;
  }
  parsedPath.base = `${curBasename}${parsedPath.ext}`;
  url.pathname = format(parsedPath);

  return url;
}

export function CDNURLToLocalHostRelativeAbsoluteDist(
  url: URL,
  pathnames: [string | null, string | null] = [null, null],
  extension: string = '.js',
  port: number = 8000,
  useMaxNames = false
): string {
  const newUrl = CDNURLToLocalDistURL(
    url,
    pathnames,
    extension,
    port,
    useMaxNames
  );
  return `${newUrl.pathname}${newUrl.search}${newUrl.hash}`;
}

/**
 * Convert an existing URL to one from a specific RTV.
 * @param url
 * @param mode
 * @param pathnames
 * @param extension
 */
export function CDNURLToRTVURL(
  url: URL,
  mode: string,
  pathnames: [string | null, string | null] = [null, null],
  extension: string = '.js'
): URL {
  const [overwriteablePathname, newPathname] = pathnames;
  if (url.pathname === overwriteablePathname && newPathname !== null) {
    url.pathname = newPathname;
  }

  const parsedPath = parse(`/rtv/${mode}${url.pathname}`);
  if (parsedPath.ext !== extension) {
    parsedPath.base = parsedPath.base.replace(parsedPath.ext, extension);
    parsedPath.ext = extension;
  }
  url.pathname = format(parsedPath);
  return url;
}
