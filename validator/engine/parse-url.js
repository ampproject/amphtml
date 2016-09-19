/**
 * @license
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
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
 * limitations under the license.
 */

goog.provide('parse_url.URL');
goog.require('goog.string');

/**
 * @param {number} code
 * @return {boolean}
 */
function alphaNum(code) {
  return ((code >= /* '0' */ 0x30 && code <= /* '9' */ 0x39) ||
          (code >= /* 'a' */ 0x61 && code <= /* 'z' */ 0x7a) ||
          (code >= /* 'A' */ 0x41 && code <= /* 'Z' */ 0x5a));
}

parse_url.URL = class {
  /**
   * @param {string} url
   */
  constructor(url) {
    /** @type {boolean} */
    this.hasProtocol = false;
    /** @type {string} */
    this.protocol = '';
    /** @type {string} */
    this.defaultProtocol = 'https';
    /** @type {string} */
    this.schemeSpecificPart = '';

    this.parseUrl_(url);
  }

  /**
   * @param {string} url
   * @private
   */
  parseUrl_(url) {
    // Strip whitespace from both sides of the URL.
    url = url.trim();

    // Browsers remove Tab/CR/LF from the entire URL, so we do too.
    url = url.replace(/[\t\r\n]/g, '');

    url = this.parseProtocol_(url);
  }

  /**
   * @param {string} url
   * @return {string} Returns the suffix of URL not including the protocol or
   *                  separating ':' character. ex: '//example.com/'.
   * @private
   */
  parseProtocol_(url) {
    // Fast paths for the most common cases
    if (goog.string./*OK*/ startsWith(url, 'https:')) {
      this.hasProtocol = true;
      this.protocol = 'https';
      return url.substr(6);  // skip over 'https:' prefix
    }
    if (goog.string./*OK*/ startsWith(url, 'http:')) {
      this.hasProtocol = true;
      this.protocol = 'http';
      return url.substr(5);  // skip over 'http:' prefix
    }

    const colon = url.indexOf(':');
    if (colon === -1) {
      this.hasProtocol = false;
      this.protocol = this.defaultProtocol;
      return url;
    }

    for (let ii = 0; ii < colon; ++ii) {
      const charCode = url.charCodeAt(ii);
      if (!alphaNum(charCode)) {
        this.hasProtocol = false;
        this.protocol = this.defaultProtocol;
        return url;
      }
    }
    // ex: split 'foo:bar' into 'foo' and 'bar'.
    this.hasProtocol = true;
    this.protocol = url.substr(0, colon);
    url = url.substr(colon + 1);

    if (this.protocol != "http" && this.protocol != "https" &&
        this.protocol != "ftp" && this.protocol != "sftp") {
      // For protocols like "foo:bar", we don't parse up the part after the
      // protocol, we just record it, eg "bar".
      this.schemeSpecificPart = url;
      url = '';
    }

    return url;
  }
};
