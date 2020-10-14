/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {URL} from 'url';
import {parse, format, basename} from 'path';

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
 * @param minifiedBasename should be without extension
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
  useMaxNames = false,
): URL {
  url.protocol = 'http';
  url.hostname = 'localhost';
  url.port = String(port);

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

/**
 * Convert an existing URL to one from a specific RTV.
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

  const parsedPath = parse(`/rtv/${mode}/${url.pathname}`);
  if (parsedPath.ext !== extension) {
    parsedPath.base = parsedPath.base.replace(parsedPath.ext, extension);
    parsedPath.ext = extension;
  }
  url.pathname = format(parsedPath);

  return url;
}

