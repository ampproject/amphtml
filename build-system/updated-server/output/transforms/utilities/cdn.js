"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
exports.VALID_CDN_ORIGIN = 'https://cdn.ampproject.org';
/**
 * Convert an existing URL to one from the local `serve` command.
 * @param url
 */
function CDNURLToLocalDistURL(url, pathnames = [null, null], extension = '.js') {
    url.protocol = 'http';
    url.hostname = 'localhost';
    url.port = '8000';
    const [overwriteablePathname, newPathname] = pathnames;
    if (url.pathname === overwriteablePathname && newPathname !== null) {
        url.pathname = newPathname;
    }
    const parsedPath = path_1.parse('/dist' + url.pathname);
    if (parsedPath.ext !== extension) {
        parsedPath.base = parsedPath.base.replace(parsedPath.ext, extension);
        parsedPath.ext = extension;
    }
    url.pathname = path_1.format(parsedPath);
    return url;
}
exports.CDNURLToLocalDistURL = CDNURLToLocalDistURL;
/**
 * Convert an existing URL to one from a specific RTV.
 * @param url
 */
function CDNURLToRTVURL(url, mode, pathnames = [null, null], extension = '.js') {
    const [overwriteablePathname, newPathname] = pathnames;
    if (url.pathname === overwriteablePathname && newPathname !== null) {
        url.pathname = newPathname;
    }
    const parsedPath = path_1.parse(`/rtv/${mode}/${url.pathname}`);
    if (parsedPath.ext !== extension) {
        parsedPath.base = parsedPath.base.replace(parsedPath.ext, extension);
        parsedPath.ext = extension;
    }
    url.pathname = path_1.format(parsedPath);
    return url;
}
exports.CDNURLToRTVURL = CDNURLToRTVURL;
//# sourceMappingURL=cdn.js.map