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

/**
 * @param {number} code
 * @return {boolean}
 */
function protocolCharIsValid(code) {
  return (alphaNum(code) ||
          code === /* '+' */ 0x2B ||
          code === /* '-' */ 0x2D);
}

/**
 * @param {string} maybeInt
 * @return {boolean}
 */
function isPositiveInteger(maybeInt) {
  const re = /^[0-9]*$/g;
  return re.test(maybeInt);
}

/**
 * @param {number} code
 * @return {boolean}
 */
function hostCharIsEnd(code) {
  return (code === /* '#' */ 0x23 ||
          code === /* '/' */ 0x2F ||
          code === /* '?' */ 0x3F ||
          isNaN(code));
}

/**
 * Determines if a character code is valid when found in a hostname.
 * Note that the hostname should first be percent-unescaped to get
 * correct results.
 * @param {number} code
 * @return {boolean}
 */
function hostCharIsValid(code) {
  return (!isNaN(code) &&
          code > /* unprintable */ 0x1F &&
          code !== /* ' ' */ 0x20  &&
          code !== /* '!' */ 0x21  &&
          code !== /* '"' */ 0x22  &&
          code !== /* '#' */ 0x23  &&
          code !== /* '$' */ 0x24  &&
          code !== /* '%' */ 0x25  &&
          code !== /* '&' */ 0x26  &&
          code !== /* ''' */ 0x27  &&
          code !== /* '(' */ 0x28  &&
          code !== /* ')' */ 0x29  &&
          code !== /* '*' */ 0x2A  &&
          code !== /* '+' */ 0x2B  &&
          code !== /* ',' */ 0x2C  &&
          code !== /* '/' */ 0x2F  &&
          code !== /* ':' */ 0x3A  &&
          code !== /* ';' */ 0x3B  &&
          code !== /* '<' */ 0x3C  &&
          code !== /* '=' */ 0x3D  &&
          code !== /* '>' */ 0x3E  &&
          code !== /* '?' */ 0x3F  &&
          code !== /* '@' */ 0x3A  &&
          code !== /* '[' */ 0x5B  &&
          code !== /* '\' */ 0x5C  &&
          code !== /* ']' */ 0x5D  &&
          code !== /* '^' */ 0x5E  &&
          code !== /* '`' */ 0x60  &&
          code !== /* '{' */ 0x7B  &&
          code !== /* '|' */ 0x7C  &&
          code !== /* '}' */ 0x7D  &&
          code !== /* '~' */ 0x7E  &&
          code !== /*     */ 0x7B);
}

/**
 * Check if a host might be an IPv6 literal. See man page for INET_PTON(3)
 * @param {string} host
 * @return {boolean}
 */
function hostIsIPv6Literal(host) {
  // 16-bit hexadecimal number, where leading zeroes can be discarded.
  const hexRe = /^[0-9A-Fa-f]{1,4}$/;
  // IPv4 address
  const ipv4Re = /^([0-9]{1,3}\.){3}[0-9]{1,3}$/;
  var hasEmpty = false;
  const parts = host.split(':');
  var numParts = parts.length;
  for (var i = 0; i < parts.length; ++i) {
    const part = parts[i];

    // Look for empty parts, caused abbreviating contiguous zero values with
    // '::' syntax.
    if (part === '') {
      // There can be exactly one empty 'part'
      if (hasEmpty)
        return false;
      hasEmpty = true;
      // Leading and trailing empty parts are written as '::' resulting in
      // host.split returning two empty parts. We skip these in this case.
      // We must use two conditions to cover the case of host being exactly
      // '::'.
      if (i === 0) {
        ++i;
        --numParts;
      }
      if (i === parts.length - 2) {
        ++i;
        --numParts;
      }
    }
    // Typically we expect a 16-bit hexadecimal number for each part.
    else if (hexRe.test(part)) {}
    // Or, if the last 'part', we can allow a IPv4 address:
    else if (i === parts.length - 1 && ipv4Re.test(part)) {
      // An IPv4 address counts for 2 parts.
      ++numParts;
    }
    else {
      return false;
    }
  }

  // There should be 8 parts, with an empty part possibly counting as more than
  // one.
  if (numParts > 8)
    return false;
  if (numParts < 8 && !hasEmpty)
    return false;
  return true;
}

parse_url.URL = class {
  /**
   * @param {string} url
   */
  constructor(url) {
    // If isValid === false, no guarantees are made regarding the other
    // fields in this URL object. Some may be 'correct', depending on the
    // point in the parsing that a validity issue was discovered.
    /** @type {boolean} */
    this.isValid = true;
    /** @type {boolean} */
    this.hasProtocol = false;
    /** @type {string} */
    this.protocol = '';  // Guaranteed to be lower case.
    /** @type {string} */
    this.defaultProtocol = 'https';  // Must be set to a lower case value.
    /** @type {string} */
    this.schemeSpecificPart = '';
    /** @type {boolean} */
    this./*OK*/ startsWithDoubleSlash = false;
    // The hostname will be hex-unescaped and isValid will be set to false if
    // the resulting string is not UTF-8 valid, but the hostname will not be
    // encoded to punycode for non-ascii hostnames. Browsers can do this for
    // us and implementing the encoding in javascript would be slow. Similarly,
    // we do not normalize unusual (hex, octal, etc) IPv4 address formats,
    // though we do accept them.
    /** @type {string} */
    this.host = '';
    /** @type {number} */
    this.port = -1;

    // This parser doesn't bother with parsing anything after the authority
    // section of the URL string. IE, it doesn't parse path, query, or fragment.
    // This is because the AMP validator has no need for parsing these and they
    // cannot make an URL invalid in any way.
    this.unparsed_url = '';

    // Note that we don't parse out username/password from this string, nor
    // are we bothering with correctly unescaping everything we find in here.
    // If examining the login string more closely becomes an issue, more
    // parsing is necessary.
    /** @type {string} */
    this.login = '';

    this.parseUrl_(url);
  }

  /**
   * @param {string} unparsed
   * @private
   */
  parseUrl_(unparsed) {
    // Strip whitespace from both sides of the URL.
    unparsed = unparsed.trim();

    // Browsers remove Tab/CR/LF from the entire URL, so we do too.
    unparsed = unparsed.replace(/[\t\r\n]/g, '');

    unparsed = this.parseProtocol_(unparsed);

    // If '//' is present as a prefix (after parsing protocol if any), then
    // we need to parse the authority section (username:password@hostname:port)
    if (goog.string./*OK*/ startsWith(unparsed, '//')) {
      if (this.protocol === '') {
        this./*OK*/ startsWithDoubleSlash = true;
      }
      unparsed = unparsed.substr(2);
      unparsed = this.parseAuthority_(unparsed);
    }

    this.unparsed_url = unparsed;
  }

  /**
   * @param {string} unparsed
   * @return {string} Returns the suffix of URL not including the protocol or
   *                  separating ':' character. ex: '//example.com/'.
   * @private
   */
  parseProtocol_(unparsed) {
    // Fast paths for the most common cases
    if (goog.string./*OK*/ startsWith(unparsed, 'https:')) {
      this.hasProtocol = true;
      this.protocol = 'https';
      return unparsed.substr(6);  // skip over 'https:' prefix
    }
    if (goog.string./*OK*/ startsWith(unparsed, 'http:')) {
      this.hasProtocol = true;
      this.protocol = 'http';
      return unparsed.substr(5);  // skip over 'http:' prefix
    }

    const colon = unparsed.indexOf(':');
    if (colon === -1) {
      this.hasProtocol = false;
      this.protocol = this.defaultProtocol;
      return unparsed;
    }

    for (let ii = 0; ii < colon; ++ii) {
      const charCode = unparsed.charCodeAt(ii);
      if (!protocolCharIsValid(charCode)) {
        this.hasProtocol = false;
        this.protocol = this.defaultProtocol;
        return unparsed;
      }
    }
    // ex: split 'foo:bar' into 'foo' and 'bar'.
    this.hasProtocol = true;
    this.protocol = unparsed.substr(0, colon).toLowerCase();
    unparsed = unparsed.substr(colon + 1);

    if (this.protocol != "http" && this.protocol != "https" &&
        this.protocol != "ftp" && this.protocol != "sftp") {
      // For protocols like "foo:bar", we don't parse up the part after the
      // protocol, we just record it, eg "bar".
      this.schemeSpecificPart = unparsed;
      unparsed = '';
    }
    return unparsed;
  }

  /**
   * @param {string} host
   * @return {string}
   * @private
   */
  unescapeAndCheckHost_(host) {
    let unescapedHost = '';
    try {
      unescapedHost = decodeURIComponent(host);
    } catch (e) {
      // Indicates that host had escaped multibyte characters which
      // when unescaped were not UTF-8 valid.
      this.isValid = false;
      return host;
    }

    for (let ii = 0; ii < unescapedHost.length; ++ii) {
      const charCode = unescapedHost.charCodeAt(ii);
      if (!hostCharIsValid(charCode)) {
        this.isValid = false;
      }
    }
    return unescapedHost;
  }

  /**
   * @param {string} host
   * @return {string}
   * @private
   */
  processHostDots_(host) {
    if (goog.string./*OK*/ startsWith(host, '.') ||
        host.indexOf('..') !== -1) {
      this.isValid = false;
    } else if (host.substr(-1) === '.') {  // strip trailing '.'.
      host = host.substr(0, host.length - 1);
    }
    return host;
  }

  /**
   * @param {string} unparsed
   * @return {string} Returns the suffix of the URL not including the authority
   *                  section (host, port, user, password).
   * @private
   */
  parseAuthority_(unparsed) {
    let idx = 0;

    // See if this could be an IPv6 address literal. If so, we skip colons
    // until we see a matching ']'.
    let skipColons = false;
    if (unparsed !== '' && unparsed.charCodeAt(0) === /* '[' */ 0x5B) {
      skipColons = true;
      idx++;  // skip over the '['
    }

    // look for '@' and ':', e.g. user:password@example.com:1234
    // and for '[' and ']', e.g. [2001:0db8:85a3]
    let atIdx = -1;
    let portIdx = -1;
    let passwordIdx = -1;
    let charCode = unparsed.charCodeAt(idx);
    for (; !hostCharIsEnd(charCode); charCode = unparsed.charCodeAt(++idx)) {
      switch (charCode) {
        case /* '@' */ 0x40:
          atIdx = idx;  // save the last occurrence of '@'
          passwordIdx = portIdx;
          portIdx = -1;  // we have a login, so reset the port

          // Any [ before here must have been junk, or part of the password
          // so we reset.
          if (unparsed.charCodeAt(idx + 1) === /* '[' */ 0x5B) {
            skipColons = true;
            idx++;
          } else {
            skipColons = false;
          }
          break;
        case /* ':' */ 0x3A:
          if ((portIdx === -1) && !skipColons) {
            portIdx = idx + 1;  // might be password; save as port anyway
          }
          break;
        case /* '[' */ 0x5B:
          // Start brackets can only either come at the start of where we
          // expect a host name (right after the protocol://, or right after @),
          // so this is either junk or part of the password.
          // In any case, this is not an IPv6 literal.
          skipColons = false;
          break;
        case /* ']' */ 0x5D:
          // End bracket; stop skipping colons. Note that this allows multiple
          // [] groups, but the URL is broken anyway, so it doesn't matter much
          // if we split it "wrong".
          skipColons = false;
          break;
      }
    }

    // Extract the login string if one was found.
    if (atIdx !== -1) {
      let loginLength = atIdx;
      if (passwordIdx !== -1 && passwordIdx === atIdx) {
        loginLength--;
      }
      this.login = unparsed.substr(0, loginLength);
    }

    // Extract the hostname.
    let hostBeginIdx = (atIdx !== -1 ? atIdx + 1 : 0);
    let hostEndIdx = (portIdx !== -1 ? portIdx - 1 : idx);

    // Special case: If the host is something that looks like a valid IPv6
    // address, with a [] at both ends, remove the [].
    let isIPv6Literal = false;
    if (unparsed.charCodeAt(hostBeginIdx) === /* '[' */ 0x5B &&
        unparsed.charCodeAt(hostEndIdx - 1) === /* ']' */ 0x5D &&
        hostBeginIdx != hostEndIdx) {
      isIPv6Literal = hostIsIPv6Literal(unparsed.substr(hostBeginIdx + 1,
                                        hostEndIdx - hostBeginIdx - 2));
      if (isIPv6Literal) {
        ++hostBeginIdx;
        --hostEndIdx;
      } else {
        this.isValid = false;
        return '';
      }
    }
    let host = unparsed.substr(hostBeginIdx, hostEndIdx - hostBeginIdx);
    if (!isIPv6Literal) {
      host = this.unescapeAndCheckHost_(host);
    }
    this.host = this.processHostDots_(host);
    if (this.host === '')
      this.isValid = false;

    // Extract the port, if present.
    if (portIdx !== -1) {
      const portStr = unparsed.substr(portIdx, idx - portIdx);
      if (portStr === '') {
        this.port = 0;
      } else if (isPositiveInteger(portStr)) {
        this.port = parseInt(portStr, 10);
      } else {
        this.isValid = false;
        return '';
      }

      if (this.port > 65535) {
        this.isValid = false;
        return '';
      }

      // 0 indicates a default port.
      if (this.port === 0) {
        this.port = {
          "http": 80,
          "https": 443,
          "ftp": 21,
          "sftp": 22}[this.protocol];
      }
    }

    unparsed = unparsed.substr(idx + 1);
    return unparsed;
  }
};
