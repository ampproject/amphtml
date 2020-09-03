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
import {parse, format} from 'path';
import minimist from 'minimist';

export const VALID_CDN_ORIGIN = 'https://cdn.ampproject.org';
const argv = minimist(process.argv.slice(2));

/**
 * Convert an existing URL to one from the local `serve` command.
 */
export function CDNURLToLocalDistURL(
  url: URL,
  pathnames: [string | null, string | null] = [null, null],
  extension: string = '.js'
): URL {
  url.protocol = 'http';
  url.hostname = 'localhost';
  url.port = '8000';

  const [overwriteablePathname, newPathname] = pathnames;
  const outputDir = argv.sxg ? 'sxg' : 'dist'
  if (url.pathname === overwriteablePathname && newPathname !== null) {
    url.pathname = newPathname;
  }

  const parsedPath = parse(`/${outputDir}${url.pathname}`);
  if (parsedPath.ext !== extension) {
    parsedPath.base = parsedPath.base.replace(parsedPath.ext, extension);
    parsedPath.ext = extension;
  }
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
