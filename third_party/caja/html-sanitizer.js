/* Generated from CAJA Sanitizer library commit 5d856e4eaf1c12c8bda004aa55e12ed0c9cf9349 */

// Copyright (C) 2010 Google Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview
 * Implements RFC 3986 for parsing/formatting URIs.
 *
 * @author mikesamuel@gmail.com
 * \@provides URI
 * \@overrides window
 */

var URI = (function () {

/**
 * creates a uri from the string form.  The parser is relaxed, so special
 * characters that aren't escaped but don't cause ambiguities will not cause
 * parse failures.
 *
 * @return {URI|null}
 */
function parse(uriStr) {
  var m = ('' + uriStr).match(URI_RE_);
  if (!m) { return null; }
  return new URI(
      nullIfAbsent(m[1]),
      nullIfAbsent(m[2]),
      nullIfAbsent(m[3]),
      nullIfAbsent(m[4]),
      nullIfAbsent(m[5]),
      nullIfAbsent(m[6]),
      nullIfAbsent(m[7]));
}


/**
 * creates a uri from the given parts.
 *
 * @param scheme {string} an unencoded scheme such as "http" or null
 * @param credentials {string} unencoded user credentials or null
 * @param domain {string} an unencoded domain name or null
 * @param port {number} a port number in [1, 32768].
 *    -1 indicates no port, as does null.
 * @param path {string} an unencoded path
 * @param query {Array.<string>|string|null} a list of unencoded cgi
 *   parameters where even values are keys and odds the corresponding values
 *   or an unencoded query.
 * @param fragment {string} an unencoded fragment without the "#" or null.
 * @return {URI}
 */
function create(scheme, credentials, domain, port, path, query, fragment) {
  var uri = new URI(
      encodeIfExists2(scheme, URI_DISALLOWED_IN_SCHEME_OR_CREDENTIALS_),
      encodeIfExists2(
          credentials, URI_DISALLOWED_IN_SCHEME_OR_CREDENTIALS_),
      encodeIfExists(domain),
      port > 0 ? port.toString() : null,
      encodeIfExists2(path, URI_DISALLOWED_IN_PATH_),
      null,
      encodeIfExists(fragment));
  if (query) {
    if ('string' === typeof query) {
      uri.setRawQuery(query.replace(/[^?&=0-9A-Za-z_\-~.%]/g, encodeOne));
    } else {
      uri.setAllParameters(query);
    }
  }
  return uri;
}
function encodeIfExists(unescapedPart) {
  if ('string' == typeof unescapedPart) {
    return encodeURIComponent(unescapedPart);
  }
  return null;
};
/**
 * if unescapedPart is non null, then escapes any characters in it that aren't
 * valid characters in a url and also escapes any special characters that
 * appear in extra.
 *
 * @param unescapedPart {string}
 * @param extra {RegExp} a character set of characters in [\01-\177].
 * @return {string|null} null iff unescapedPart == null.
 */
function encodeIfExists2(unescapedPart, extra) {
  if ('string' == typeof unescapedPart) {
    return encodeURI(unescapedPart).replace(extra, encodeOne);
  }
  return null;
};
/** converts a character in [\01-\177] to its url encoded equivalent. */
function encodeOne(ch) {
  var n = ch.charCodeAt(0);
  return '%' + '0123456789ABCDEF'.charAt((n >> 4) & 0xf) +
      '0123456789ABCDEF'.charAt(n & 0xf);
}

/**
 * {@updoc
 *  $ normPath('foo/./bar')
 *  # 'foo/bar'
 *  $ normPath('./foo')
 *  # 'foo'
 *  $ normPath('foo/.')
 *  # 'foo'
 *  $ normPath('foo//bar')
 *  # 'foo/bar'
 * }
 */
function normPath(path) {
  return path.replace(/(^|\/)\.(?:\/|$)/g, '$1').replace(/\/{2,}/g, '/');
}

var PARENT_DIRECTORY_HANDLER = new RegExp(
    ''
    // A path break
    + '(/|^)'
    // followed by a non .. path element
    // (cannot be . because normPath is used prior to this RegExp)
    + '(?:[^./][^/]*|\\.{2,}(?:[^./][^/]*)|\\.{3,}[^/]*)'
    // followed by .. followed by a path break.
    + '/\\.\\.(?:/|$)');

var PARENT_DIRECTORY_HANDLER_RE = new RegExp(PARENT_DIRECTORY_HANDLER);

var EXTRA_PARENT_PATHS_RE = /^(?:\.\.\/)*(?:\.\.$)?/;

/**
 * Normalizes its input path and collapses all . and .. sequences except for
 * .. sequences that would take it above the root of the current parent
 * directory.
 * {@updoc
 *  $ collapse_dots('foo/../bar')
 *  # 'bar'
 *  $ collapse_dots('foo/./bar')
 *  # 'foo/bar'
 *  $ collapse_dots('foo/../bar/./../../baz')
 *  # 'baz'
 *  $ collapse_dots('../foo')
 *  # '../foo'
 *  $ collapse_dots('../foo').replace(EXTRA_PARENT_PATHS_RE, '')
 *  # 'foo'
 * }
 */
function collapse_dots(path) {
  if (path === null) { return null; }
  var p = normPath(path);
  // Only /../ left to flatten
  var r = PARENT_DIRECTORY_HANDLER_RE;
  // We replace with $1 which matches a / before the .. because this
  // guarantees that:
  // (1) we have at most 1 / between the adjacent place,
  // (2) always have a slash if there is a preceding path section, and
  // (3) we never turn a relative path into an absolute path.
  for (var q; (q = p.replace(r, '$1')) != p; p = q) {};
  return p;
}

/**
 * resolves a relative url string to a base uri.
 * @return {URI}
 */
function resolve(baseUri, relativeUri) {
  // there are several kinds of relative urls:
  // 1. //foo - replaces everything from the domain on.  foo is a domain name
  // 2. foo - replaces the last part of the path, the whole query and fragment
  // 3. /foo - replaces the the path, the query and fragment
  // 4. ?foo - replace the query and fragment
  // 5. #foo - replace the fragment only

  var absoluteUri = baseUri.clone();
  // we satisfy these conditions by looking for the first part of relativeUri
  // that is not blank and applying defaults to the rest

  var overridden = relativeUri.hasScheme();

  if (overridden) {
    absoluteUri.setRawScheme(relativeUri.getRawScheme());
  } else {
    overridden = relativeUri.hasCredentials();
  }

  if (overridden) {
    absoluteUri.setRawCredentials(relativeUri.getRawCredentials());
  } else {
    overridden = relativeUri.hasDomain();
  }

  if (overridden) {
    absoluteUri.setRawDomain(relativeUri.getRawDomain());
  } else {
    overridden = relativeUri.hasPort();
  }

  var rawPath = relativeUri.getRawPath();
  var simplifiedPath = collapse_dots(rawPath);
  if (overridden) {
    absoluteUri.setPort(relativeUri.getPort());
    simplifiedPath = simplifiedPath
        && simplifiedPath.replace(EXTRA_PARENT_PATHS_RE, '');
  } else {
    overridden = !!rawPath;
    if (overridden) {
      // resolve path properly
      if (simplifiedPath.charCodeAt(0) !== 0x2f /* / */) {  // path is relative
        var absRawPath = collapse_dots(absoluteUri.getRawPath() || '')
            .replace(EXTRA_PARENT_PATHS_RE, '');
        var slash = absRawPath.lastIndexOf('/') + 1;
        simplifiedPath = collapse_dots(
            (slash ? absRawPath.substring(0, slash) : '')
            + collapse_dots(rawPath))
            .replace(EXTRA_PARENT_PATHS_RE, '');
      }
    } else {
      simplifiedPath = simplifiedPath
          && simplifiedPath.replace(EXTRA_PARENT_PATHS_RE, '');
      if (simplifiedPath !== rawPath) {
        absoluteUri.setRawPath(simplifiedPath);
      }
    }
  }

  if (overridden) {
    absoluteUri.setRawPath(simplifiedPath);
  } else {
    overridden = relativeUri.hasQuery();
  }

  if (overridden) {
    absoluteUri.setRawQuery(relativeUri.getRawQuery());
  } else {
    overridden = relativeUri.hasFragment();
  }

  if (overridden) {
    absoluteUri.setRawFragment(relativeUri.getRawFragment());
  }

  return absoluteUri;
}

/**
 * a mutable URI.
 *
 * This class contains setters and getters for the parts of the URI.
 * The <tt>getXYZ</tt>/<tt>setXYZ</tt> methods return the decoded part -- so
 * <code>uri.parse('/foo%20bar').getPath()</code> will return the decoded path,
 * <tt>/foo bar</tt>.
 *
 * <p>The raw versions of fields are available too.
 * <code>uri.parse('/foo%20bar').getRawPath()</code> will return the raw path,
 * <tt>/foo%20bar</tt>.  Use the raw setters with care, since
 * <code>URI::toString</code> is not guaranteed to return a valid url if a
 * raw setter was used.
 *
 * <p>All setters return <tt>this</tt> and so may be chained, a la
 * <code>uri.parse('/foo').setFragment('part').toString()</code>.
 *
 * <p>You should not use this constructor directly -- please prefer the factory
 * functions {@link uri.parse}, {@link uri.create}, {@link uri.resolve}
 * instead.</p>
 *
 * <p>The parameters are all raw (assumed to be properly escaped) parts, and
 * any (but not all) may be null.  Undefined is not allowed.</p>
 *
 * @constructor
 */
function URI(
    rawScheme,
    rawCredentials, rawDomain, port,
    rawPath, rawQuery, rawFragment) {
  this.scheme_ = rawScheme;
  this.credentials_ = rawCredentials;
  this.domain_ = rawDomain;
  this.port_ = port;
  this.path_ = rawPath;
  this.query_ = rawQuery;
  this.fragment_ = rawFragment;
  /**
   * @type {Array|null}
   */
  this.paramCache_ = null;
}

/** returns the string form of the url. */
URI.prototype.toString = function () {
  var out = [];
  if (null !== this.scheme_) { out.push(this.scheme_, ':'); }
  if (null !== this.domain_) {
    out.push('//');
    if (null !== this.credentials_) { out.push(this.credentials_, '@'); }
    out.push(this.domain_);
    if (null !== this.port_) { out.push(':', this.port_.toString()); }
  }
  if (null !== this.path_) { out.push(this.path_); }
  if (null !== this.query_) { out.push('?', this.query_); }
  if (null !== this.fragment_) { out.push('#', this.fragment_); }
  return out.join('');
};

URI.prototype.clone = function () {
  return new URI(this.scheme_, this.credentials_, this.domain_, this.port_,
                 this.path_, this.query_, this.fragment_);
};

URI.prototype.getScheme = function () {
  // HTML5 spec does not require the scheme to be lowercased but
  // all common browsers except Safari lowercase the scheme.
  return this.scheme_ && decodeURIComponent(this.scheme_).toLowerCase();
};
URI.prototype.getRawScheme = function () {
  return this.scheme_;
};
URI.prototype.setScheme = function (newScheme) {
  this.scheme_ = encodeIfExists2(
      newScheme, URI_DISALLOWED_IN_SCHEME_OR_CREDENTIALS_);
  return this;
};
URI.prototype.setRawScheme = function (newScheme) {
  this.scheme_ = newScheme ? newScheme : null;
  return this;
};
URI.prototype.hasScheme = function () {
  return null !== this.scheme_;
};


URI.prototype.getCredentials = function () {
  return this.credentials_ && decodeURIComponent(this.credentials_);
};
URI.prototype.getRawCredentials = function () {
  return this.credentials_;
};
URI.prototype.setCredentials = function (newCredentials) {
  this.credentials_ = encodeIfExists2(
      newCredentials, URI_DISALLOWED_IN_SCHEME_OR_CREDENTIALS_);

  return this;
};
URI.prototype.setRawCredentials = function (newCredentials) {
  this.credentials_ = newCredentials ? newCredentials : null;
  return this;
};
URI.prototype.hasCredentials = function () {
  return null !== this.credentials_;
};


URI.prototype.getDomain = function () {
  return this.domain_ && decodeURIComponent(this.domain_);
};
URI.prototype.getRawDomain = function () {
  return this.domain_;
};
URI.prototype.setDomain = function (newDomain) {
  return this.setRawDomain(newDomain && encodeURIComponent(newDomain));
};
URI.prototype.setRawDomain = function (newDomain) {
  this.domain_ = newDomain ? newDomain : null;
  // Maintain the invariant that paths must start with a slash when the URI
  // is not path-relative.
  return this.setRawPath(this.path_);
};
URI.prototype.hasDomain = function () {
  return null !== this.domain_;
};


URI.prototype.getPort = function () {
  return this.port_ && decodeURIComponent(this.port_);
};
URI.prototype.setPort = function (newPort) {
  if (newPort) {
    newPort = Number(newPort);
    if (newPort !== (newPort & 0xffff)) {
      throw new Error('Bad port number ' + newPort);
    }
    this.port_ = '' + newPort;
  } else {
    this.port_ = null;
  }
  return this;
};
URI.prototype.hasPort = function () {
  return null !== this.port_;
};


URI.prototype.getPath = function () {
  return this.path_ && decodeURIComponent(this.path_);
};
URI.prototype.getRawPath = function () {
  return this.path_;
};
URI.prototype.setPath = function (newPath) {
  return this.setRawPath(encodeIfExists2(newPath, URI_DISALLOWED_IN_PATH_));
};
URI.prototype.setRawPath = function (newPath) {
  if (newPath) {
    newPath = String(newPath);
    this.path_ =
      // Paths must start with '/' unless this is a path-relative URL.
      (!this.domain_ || /^\//.test(newPath)) ? newPath : '/' + newPath;
  } else {
    this.path_ = null;
  }
  return this;
};
URI.prototype.hasPath = function () {
  return null !== this.path_;
};


URI.prototype.getQuery = function () {
  // From http://www.w3.org/Addressing/URL/4_URI_Recommentations.html
  // Within the query string, the plus sign is reserved as shorthand notation
  // for a space.
  return this.query_ && decodeURIComponent(this.query_).replace(/\+/g, ' ');
};
URI.prototype.getRawQuery = function () {
  return this.query_;
};
URI.prototype.setQuery = function (newQuery) {
  this.paramCache_ = null;
  this.query_ = encodeIfExists(newQuery);
  return this;
};
URI.prototype.setRawQuery = function (newQuery) {
  this.paramCache_ = null;
  this.query_ = newQuery ? newQuery : null;
  return this;
};
URI.prototype.hasQuery = function () {
  return null !== this.query_;
};

/**
 * sets the query given a list of strings of the form
 * [ key0, value0, key1, value1, ... ].
 *
 * <p><code>uri.setAllParameters(['a', 'b', 'c', 'd']).getQuery()</code>
 * will yield <code>'a=b&c=d'</code>.
 */
URI.prototype.setAllParameters = function (params) {
  if (typeof params === 'object') {
    if (!(params instanceof Array)
        && (params instanceof Object
            || Object.prototype.toString.call(params) !== '[object Array]')) {
      var newParams = [];
      var i = -1;
      for (var k in params) {
        var v = params[k];
        if ('string' === typeof v) {
          newParams[++i] = k;
          newParams[++i] = v;
        }
      }
      params = newParams;
    }
  }
  this.paramCache_ = null;
  var queryBuf = [];
  var separator = '';
  for (var j = 0; j < params.length;) {
    var k = params[j++];
    var v = params[j++];
    queryBuf.push(separator, encodeURIComponent(k.toString()));
    separator = '&';
    if (v) {
      queryBuf.push('=', encodeURIComponent(v.toString()));
    }
  }
  this.query_ = queryBuf.join('');
  return this;
};
URI.prototype.checkParameterCache_ = function () {
  if (!this.paramCache_) {
    var q = this.query_;
    if (!q) {
      this.paramCache_ = [];
    } else {
      var cgiParams = q.split(/[&\?]/);
      var out = [];
      var k = -1;
      for (var i = 0; i < cgiParams.length; ++i) {
        var m = cgiParams[i].match(/^([^=]*)(?:=(.*))?$/);
        // From http://www.w3.org/Addressing/URL/4_URI_Recommentations.html
        // Within the query string, the plus sign is reserved as shorthand
        // notation for a space.
        out[++k] = decodeURIComponent(m[1]).replace(/\+/g, ' ');
        out[++k] = decodeURIComponent(m[2] || '').replace(/\+/g, ' ');
      }
      this.paramCache_ = out;
    }
  }
};
/**
 * sets the values of the named cgi parameters.
 *
 * <p>So, <code>uri.parse('foo?a=b&c=d&e=f').setParameterValues('c', ['new'])
 * </code> yields <tt>foo?a=b&c=new&e=f</tt>.</p>
 *
 * @param key {string}
 * @param values {Array.<string>} the new values.  If values is a single string
 *   then it will be treated as the sole value.
 */
URI.prototype.setParameterValues = function (key, values) {
  // be nice and avoid subtle bugs where [] operator on string performs charAt
  // on some browsers and crashes on IE
  if (typeof values === 'string') {
    values = [ values ];
  }

  this.checkParameterCache_();
  var newValueIndex = 0;
  var pc = this.paramCache_;
  var params = [];
  for (var i = 0, k = 0; i < pc.length; i += 2) {
    if (key === pc[i]) {
      if (newValueIndex < values.length) {
        params.push(key, values[newValueIndex++]);
      }
    } else {
      params.push(pc[i], pc[i + 1]);
    }
  }
  while (newValueIndex < values.length) {
    params.push(key, values[newValueIndex++]);
  }
  this.setAllParameters(params);
  return this;
};
URI.prototype.removeParameter = function (key) {
  return this.setParameterValues(key, []);
};
/**
 * returns the parameters specified in the query part of the uri as a list of
 * keys and values like [ key0, value0, key1, value1, ... ].
 *
 * @return {Array.<string>}
 */
URI.prototype.getAllParameters = function () {
  this.checkParameterCache_();
  return this.paramCache_.slice(0, this.paramCache_.length);
};
/**
 * returns the value<b>s</b> for a given cgi parameter as a list of decoded
 * query parameter values.
 * @return {Array.<string>}
 */
URI.prototype.getParameterValues = function (paramNameUnescaped) {
  this.checkParameterCache_();
  var values = [];
  for (var i = 0; i < this.paramCache_.length; i += 2) {
    if (paramNameUnescaped === this.paramCache_[i]) {
      values.push(this.paramCache_[i + 1]);
    }
  }
  return values;
};
/**
 * returns a map of cgi parameter names to (non-empty) lists of values.
 * @return {Object.<string,Array.<string>>}
 */
URI.prototype.getParameterMap = function (paramNameUnescaped) {
  this.checkParameterCache_();
  var paramMap = {};
  for (var i = 0; i < this.paramCache_.length; i += 2) {
    var key = this.paramCache_[i++],
      value = this.paramCache_[i++];
    if (!(key in paramMap)) {
      paramMap[key] = [value];
    } else {
      paramMap[key].push(value);
    }
  }
  return paramMap;
};
/**
 * returns the first value for a given cgi parameter or null if the given
 * parameter name does not appear in the query string.
 * If the given parameter name does appear, but has no '<tt>=</tt>' following
 * it, then the empty string will be returned.
 * @return {string|null}
 */
URI.prototype.getParameterValue = function (paramNameUnescaped) {
  this.checkParameterCache_();
  for (var i = 0; i < this.paramCache_.length; i += 2) {
    if (paramNameUnescaped === this.paramCache_[i]) {
      return this.paramCache_[i + 1];
    }
  }
  return null;
};

URI.prototype.getFragment = function () {
  return this.fragment_ && decodeURIComponent(this.fragment_);
};
URI.prototype.getRawFragment = function () {
  return this.fragment_;
};
URI.prototype.setFragment = function (newFragment) {
  this.fragment_ = newFragment ? encodeURIComponent(newFragment) : null;
  return this;
};
URI.prototype.setRawFragment = function (newFragment) {
  this.fragment_ = newFragment ? newFragment : null;
  return this;
};
URI.prototype.hasFragment = function () {
  return null !== this.fragment_;
};

function nullIfAbsent(matchPart) {
  return ('string' == typeof matchPart) && (matchPart.length > 0)
         ? matchPart
         : null;
}




/**
 * a regular expression for breaking a URI into its component parts.
 *
 * <p>http://www.gbiv.com/protocols/uri/rfc/rfc3986.html#RFC2234 says
 * As the "first-match-wins" algorithm is identical to the "greedy"
 * disambiguation method used by POSIX regular expressions, it is natural and
 * commonplace to use a regular expression for parsing the potential five
 * components of a URI reference.
 *
 * <p>The following line is the regular expression for breaking-down a
 * well-formed URI reference into its components.
 *
 * <pre>
 * ^(([^:/?#]+):)?(//([^/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?
 *  12            3  4          5       6  7        8 9
 * </pre>
 *
 * <p>The numbers in the second line above are only to assist readability; they
 * indicate the reference points for each subexpression (i.e., each paired
 * parenthesis). We refer to the value matched for subexpression <n> as $<n>.
 * For example, matching the above expression to
 * <pre>
 *     http://www.ics.uci.edu/pub/ietf/uri/#Related
 * </pre>
 * results in the following subexpression matches:
 * <pre>
 *    $1 = http:
 *    $2 = http
 *    $3 = //www.ics.uci.edu
 *    $4 = www.ics.uci.edu
 *    $5 = /pub/ietf/uri/
 *    $6 = <undefined>
 *    $7 = <undefined>
 *    $8 = #Related
 *    $9 = Related
 * </pre>
 * where <undefined> indicates that the component is not present, as is the
 * case for the query component in the above example. Therefore, we can
 * determine the value of the five components as
 * <pre>
 *    scheme    = $2
 *    authority = $4
 *    path      = $5
 *    query     = $7
 *    fragment  = $9
 * </pre>
 *
 * <p>msamuel: I have modified the regular expression slightly to expose the
 * credentials, domain, and port separately from the authority.
 * The modified version yields
 * <pre>
 *    $1 = http              scheme
 *    $2 = <undefined>       credentials -\
 *    $3 = www.ics.uci.edu   domain       | authority
 *    $4 = <undefined>       port        -/
 *    $5 = /pub/ietf/uri/    path
 *    $6 = <undefined>       query without ?
 *    $7 = Related           fragment without #
 * </pre>
 */
var URI_RE_ = new RegExp(
      "^" +
      "(?:" +
        "([^:/?#]+)" +         // scheme
      ":)?" +
      "(?://" +
        "(?:([^/?#]*)@)?" +    // credentials
        "([^/?#:@]*)" +        // domain
        "(?::([0-9]+))?" +     // port
      ")?" +
      "([^?#]+)?" +            // path
      "(?:\\?([^#]*))?" +      // query
      "(?:#(.*))?" +           // fragment
      "$"
      );

var URI_DISALLOWED_IN_SCHEME_OR_CREDENTIALS_ = /[#\/\?@]/g;
var URI_DISALLOWED_IN_PATH_ = /[\#\?]/g;

URI.parse = parse;
URI.create = create;
URI.resolve = resolve;
URI.collapse_dots = collapse_dots;  // Visible for testing.

// lightweight string-based api for loadModuleMaker
URI.utils = {
  mimeTypeOf: function (uri) {
    var uriObj = parse(uri);
    if (/\.html$/.test(uriObj.getPath())) {
      return 'text/html';
    } else {
      return 'application/javascript';
    }
  },
  resolve: function (base, uri) {
    if (base) {
      return resolve(parse(base), parse(uri)).toString();
    } else {
      return '' + uri;
    }
  }
};


return URI;
})();

// Exports for closure compiler.
if (typeof window !== 'undefined') {
}
;
// Copyright Google Inc.
// Licensed under the Apache Licence Version 2.0
// Autogenerated at Fri Jan 12 11:48:14 PST 2018
// @overrides window
// @provides html4
var html4 = {};
html4.atype = {
  'NONE': 0,
  'URI': 1,
  'URI_FRAGMENT': 11,
  'SCRIPT': 2,
  'STYLE': 3,
  'HTML': 12,
  'ID': 4,
  'IDREF': 5,
  'IDREFS': 6,
  'GLOBAL_NAME': 7,
  'LOCAL_NAME': 8,
  'CLASSES': 9,
  'FRAME_TARGET': 10,
  'MEDIA_QUERY': 13
};
html4[ 'atype' ] = html4.atype;
html4.ATTRIBS = {
  '*::class': 9,
  '*::dir': 0,
  '*::draggable': 0,
  '*::hidden': 0,
  '*::id': 4,
  '*::inert': 0,
  '*::itemprop': 0,
  '*::itemref': 6,
  '*::itemscope': 0,
  '*::lang': 0,
  '*::onblur': 2,
  '*::onchange': 2,
  '*::onclick': 2,
  '*::ondblclick': 2,
  '*::onerror': 2,
  '*::onfocus': 2,
  '*::onkeydown': 2,
  '*::onkeypress': 2,
  '*::onkeyup': 2,
  '*::onload': 2,
  '*::onmousedown': 2,
  '*::onmousemove': 2,
  '*::onmouseout': 2,
  '*::onmouseover': 2,
  '*::onmouseup': 2,
  '*::onreset': 2,
  '*::onscroll': 2,
  '*::onselect': 2,
  '*::onsubmit': 2,
  '*::ontouchcancel': 2,
  '*::ontouchend': 2,
  '*::ontouchenter': 2,
  '*::ontouchleave': 2,
  '*::ontouchmove': 2,
  '*::ontouchstart': 2,
  '*::onunload': 2,
  '*::spellcheck': 0,
  '*::style': 3,
  '*::tabindex': 0,
  '*::title': 0,
  '*::translate': 0,
  'a::accesskey': 0,
  'a::coords': 0,
  'a::href': 1,
  'a::hreflang': 0,
  'a::name': 7,
  'a::onblur': 2,
  'a::onfocus': 2,
  'a::shape': 0,
  'a::target': 10,
  'a::type': 0,
  'area::accesskey': 0,
  'area::alt': 0,
  'area::coords': 0,
  'area::href': 1,
  'area::nohref': 0,
  'area::onblur': 2,
  'area::onfocus': 2,
  'area::shape': 0,
  'area::target': 10,
  'audio::controls': 0,
  'audio::loop': 0,
  'audio::mediagroup': 5,
  'audio::muted': 0,
  'audio::preload': 0,
  'audio::src': 1,
  'bdo::dir': 0,
  'blockquote::cite': 1,
  'br::clear': 0,
  'button::accesskey': 0,
  'button::disabled': 0,
  'button::name': 8,
  'button::onblur': 2,
  'button::onfocus': 2,
  'button::type': 0,
  'button::value': 0,
  'canvas::height': 0,
  'canvas::width': 0,
  'caption::align': 0,
  'col::align': 0,
  'col::char': 0,
  'col::charoff': 0,
  'col::span': 0,
  'col::valign': 0,
  'col::width': 0,
  'colgroup::align': 0,
  'colgroup::char': 0,
  'colgroup::charoff': 0,
  'colgroup::span': 0,
  'colgroup::valign': 0,
  'colgroup::width': 0,
  'command::checked': 0,
  'command::command': 5,
  'command::disabled': 0,
  'command::icon': 1,
  'command::label': 0,
  'command::radiogroup': 0,
  'command::type': 0,
  'data::value': 0,
  'del::cite': 1,
  'del::datetime': 0,
  'details::open': 0,
  'dir::compact': 0,
  'div::align': 0,
  'dl::compact': 0,
  'fieldset::disabled': 0,
  'font::color': 0,
  'font::face': 0,
  'font::size': 0,
  'form::accept': 0,
  'form::action': 1,
  'form::autocomplete': 0,
  'form::enctype': 0,
  'form::method': 0,
  'form::name': 7,
  'form::novalidate': 0,
  'form::onreset': 2,
  'form::onsubmit': 2,
  'form::target': 10,
  'h1::align': 0,
  'h2::align': 0,
  'h3::align': 0,
  'h4::align': 0,
  'h5::align': 0,
  'h6::align': 0,
  'hr::align': 0,
  'hr::noshade': 0,
  'hr::size': 0,
  'hr::width': 0,
  'iframe::align': 0,
  'iframe::frameborder': 0,
  'iframe::height': 0,
  'iframe::marginheight': 0,
  'iframe::marginwidth': 0,
  'iframe::width': 0,
  'img::align': 0,
  'img::alt': 0,
  'img::border': 0,
  'img::height': 0,
  'img::hspace': 0,
  'img::ismap': 0,
  'img::name': 7,
  'img::src': 1,
  'img::usemap': 11,
  'img::vspace': 0,
  'img::width': 0,
  'input::accept': 0,
  'input::accesskey': 0,
  'input::align': 0,
  'input::alt': 0,
  'input::autocomplete': 0,
  'input::checked': 0,
  'input::disabled': 0,
  'input::inputmode': 0,
  'input::ismap': 0,
  'input::list': 5,
  'input::max': 0,
  'input::maxlength': 0,
  'input::min': 0,
  'input::multiple': 0,
  'input::name': 8,
  'input::onblur': 2,
  'input::onchange': 2,
  'input::onfocus': 2,
  'input::onselect': 2,
  'input::pattern': 0,
  'input::placeholder': 0,
  'input::readonly': 0,
  'input::required': 0,
  'input::size': 0,
  'input::src': 1,
  'input::step': 0,
  'input::type': 0,
  'input::usemap': 11,
  'input::value': 0,
  'ins::cite': 1,
  'ins::datetime': 0,
  'label::accesskey': 0,
  'label::for': 5,
  'label::onblur': 2,
  'label::onfocus': 2,
  'legend::accesskey': 0,
  'legend::align': 0,
  'li::type': 0,
  'li::value': 0,
  'map::name': 7,
  'menu::compact': 0,
  'menu::label': 0,
  'menu::type': 0,
  'meter::high': 0,
  'meter::low': 0,
  'meter::max': 0,
  'meter::min': 0,
  'meter::optimum': 0,
  'meter::value': 0,
  'ol::compact': 0,
  'ol::reversed': 0,
  'ol::start': 0,
  'ol::type': 0,
  'optgroup::disabled': 0,
  'optgroup::label': 0,
  'option::disabled': 0,
  'option::label': 0,
  'option::selected': 0,
  'option::value': 0,
  'output::for': 6,
  'output::name': 8,
  'p::align': 0,
  'pre::width': 0,
  'progress::max': 0,
  'progress::min': 0,
  'progress::value': 0,
  'q::cite': 1,
  'select::autocomplete': 0,
  'select::disabled': 0,
  'select::multiple': 0,
  'select::name': 8,
  'select::onblur': 2,
  'select::onchange': 2,
  'select::onfocus': 2,
  'select::required': 0,
  'select::size': 0,
  'source::type': 0,
  'table::align': 0,
  'table::bgcolor': 0,
  'table::border': 0,
  'table::cellpadding': 0,
  'table::cellspacing': 0,
  'table::frame': 0,
  'table::rules': 0,
  'table::summary': 0,
  'table::width': 0,
  'tbody::align': 0,
  'tbody::char': 0,
  'tbody::charoff': 0,
  'tbody::valign': 0,
  'td::abbr': 0,
  'td::align': 0,
  'td::axis': 0,
  'td::bgcolor': 0,
  'td::char': 0,
  'td::charoff': 0,
  'td::colspan': 0,
  'td::headers': 6,
  'td::height': 0,
  'td::nowrap': 0,
  'td::rowspan': 0,
  'td::scope': 0,
  'td::valign': 0,
  'td::width': 0,
  'template::type': 0,
  'textarea::accesskey': 0,
  'textarea::autocomplete': 0,
  'textarea::cols': 0,
  'textarea::disabled': 0,
  'textarea::inputmode': 0,
  'textarea::name': 8,
  'textarea::onblur': 2,
  'textarea::onchange': 2,
  'textarea::onfocus': 2,
  'textarea::onselect': 2,
  'textarea::placeholder': 0,
  'textarea::readonly': 0,
  'textarea::required': 0,
  'textarea::rows': 0,
  'textarea::wrap': 0,
  'tfoot::align': 0,
  'tfoot::char': 0,
  'tfoot::charoff': 0,
  'tfoot::valign': 0,
  'th::abbr': 0,
  'th::align': 0,
  'th::axis': 0,
  'th::bgcolor': 0,
  'th::char': 0,
  'th::charoff': 0,
  'th::colspan': 0,
  'th::headers': 6,
  'th::height': 0,
  'th::nowrap': 0,
  'th::rowspan': 0,
  'th::scope': 0,
  'th::valign': 0,
  'th::width': 0,
  'thead::align': 0,
  'thead::char': 0,
  'thead::charoff': 0,
  'thead::valign': 0,
  'tr::align': 0,
  'tr::bgcolor': 0,
  'tr::char': 0,
  'tr::charoff': 0,
  'tr::valign': 0,
  'track::default': 0,
  'track::kind': 0,
  'track::label': 0,
  'track::srclang': 0,
  'ul::compact': 0,
  'ul::type': 0,
  'video::controls': 0,
  'video::height': 0,
  'video::loop': 0,
  'video::mediagroup': 5,
  'video::muted': 0,
  'video::poster': 1,
  'video::preload': 0,
  'video::src': 1,
  'video::width': 0
};
html4[ 'ATTRIBS' ] = html4.ATTRIBS;
html4.eflags = {
  'OPTIONAL_ENDTAG': 1,
  'EMPTY': 2,
  'CDATA': 4,
  'RCDATA': 8,
  'UNSAFE': 16,
  'FOLDABLE': 32,
  'SCRIPT': 64,
  'STYLE': 128,
  'VIRTUALIZED': 256
};
html4[ 'eflags' ] = html4.eflags;
html4.ELEMENTS = {
  'a': 0,
  'abbr': 0,
  'acronym': 0,
  'address': 0,
  'applet': 272,
  'area': 2,
  'article': 0,
  'aside': 0,
  'audio': 0,
  'b': 0,
  'base': 274,
  'basefont': 274,
  'bdi': 0,
  'bdo': 0,
  'big': 0,
  'blockquote': 0,
  'body': 305,
  'br': 2,
  'button': 0,
  'canvas': 0,
  'caption': 0,
  'center': 0,
  'cite': 0,
  'code': 0,
  'col': 2,
  'colgroup': 1,
  'command': 2,
  'data': 0,
  'datalist': 0,
  'dd': 1,
  'del': 0,
  'details': 0,
  'dfn': 0,
  'dialog': 272,
  'dir': 0,
  'div': 0,
  'dl': 0,
  'dt': 1,
  'em': 0,
  'fieldset': 0,
  'figcaption': 0,
  'figure': 0,
  'font': 0,
  'footer': 0,
  'form': 0,
  'frame': 274,
  'frameset': 272,
  'h1': 0,
  'h2': 0,
  'h3': 0,
  'h4': 0,
  'h5': 0,
  'h6': 0,
  'head': 305,
  'header': 0,
  'hgroup': 0,
  'hr': 2,
  'html': 305,
  'i': 0,
  'iframe': 4,
  'img': 2,
  'input': 2,
  'ins': 0,
  'isindex': 274,
  'kbd': 0,
  'keygen': 274,
  'label': 0,
  'legend': 0,
  'li': 1,
  'link': 274,
  'map': 0,
  'mark': 0,
  'menu': 0,
  'meta': 274,
  'meter': 0,
  'nav': 0,
  'nobr': 0,
  'noembed': 276,
  'noframes': 276,
  'noscript': 276,
  'object': 272,
  'ol': 0,
  'optgroup': 0,
  'option': 1,
  'output': 0,
  'p': 1,
  'param': 274,
  'pre': 0,
  'progress': 0,
  'q': 0,
  's': 0,
  'samp': 0,
  'script': 84,
  'section': 0,
  'select': 0,
  'small': 0,
  'source': 2,
  'span': 0,
  'strike': 0,
  'strong': 0,
  'style': 148,
  'sub': 0,
  'summary': 0,
  'sup': 0,
  'table': 0,
  'tbody': 1,
  'td': 1,
  'template': 4,
  'textarea': 8,
  'tfoot': 1,
  'th': 1,
  'thead': 1,
  'time': 0,
  'title': 280,
  'tr': 1,
  'track': 2,
  'tt': 0,
  'u': 0,
  'ul': 0,
  'var': 0,
  'video': 0,
  'wbr': 2
};
html4[ 'ELEMENTS' ] = html4.ELEMENTS;
html4.ELEMENT_DOM_INTERFACES = {
  'a': 'HTMLAnchorElement',
  'abbr': 'HTMLElement',
  'acronym': 'HTMLElement',
  'address': 'HTMLElement',
  'applet': 'HTMLAppletElement',
  'area': 'HTMLAreaElement',
  'article': 'HTMLElement',
  'aside': 'HTMLElement',
  'audio': 'HTMLAudioElement',
  'b': 'HTMLElement',
  'base': 'HTMLBaseElement',
  'basefont': 'HTMLBaseFontElement',
  'bdi': 'HTMLElement',
  'bdo': 'HTMLElement',
  'big': 'HTMLElement',
  'blockquote': 'HTMLQuoteElement',
  'body': 'HTMLBodyElement',
  'br': 'HTMLBRElement',
  'button': 'HTMLButtonElement',
  'canvas': 'HTMLCanvasElement',
  'caption': 'HTMLTableCaptionElement',
  'center': 'HTMLElement',
  'cite': 'HTMLElement',
  'code': 'HTMLElement',
  'col': 'HTMLTableColElement',
  'colgroup': 'HTMLTableColElement',
  'command': 'HTMLCommandElement',
  'data': 'HTMLElement',
  'datalist': 'HTMLDataListElement',
  'dd': 'HTMLElement',
  'del': 'HTMLModElement',
  'details': 'HTMLDetailsElement',
  'dfn': 'HTMLElement',
  'dialog': 'HTMLDialogElement',
  'dir': 'HTMLDirectoryElement',
  'div': 'HTMLDivElement',
  'dl': 'HTMLDListElement',
  'dt': 'HTMLElement',
  'em': 'HTMLElement',
  'fieldset': 'HTMLFieldSetElement',
  'figcaption': 'HTMLElement',
  'figure': 'HTMLElement',
  'font': 'HTMLFontElement',
  'footer': 'HTMLElement',
  'form': 'HTMLFormElement',
  'frame': 'HTMLFrameElement',
  'frameset': 'HTMLFrameSetElement',
  'h1': 'HTMLHeadingElement',
  'h2': 'HTMLHeadingElement',
  'h3': 'HTMLHeadingElement',
  'h4': 'HTMLHeadingElement',
  'h5': 'HTMLHeadingElement',
  'h6': 'HTMLHeadingElement',
  'head': 'HTMLHeadElement',
  'header': 'HTMLElement',
  'hgroup': 'HTMLElement',
  'hr': 'HTMLHRElement',
  'html': 'HTMLHtmlElement',
  'i': 'HTMLElement',
  'iframe': 'HTMLIFrameElement',
  'img': 'HTMLImageElement',
  'input': 'HTMLInputElement',
  'ins': 'HTMLModElement',
  'isindex': 'HTMLUnknownElement',
  'kbd': 'HTMLElement',
  'keygen': 'HTMLKeygenElement',
  'label': 'HTMLLabelElement',
  'legend': 'HTMLLegendElement',
  'li': 'HTMLLIElement',
  'link': 'HTMLLinkElement',
  'map': 'HTMLMapElement',
  'mark': 'HTMLElement',
  'menu': 'HTMLMenuElement',
  'meta': 'HTMLMetaElement',
  'meter': 'HTMLMeterElement',
  'nav': 'HTMLElement',
  'nobr': 'HTMLElement',
  'noembed': 'HTMLElement',
  'noframes': 'HTMLElement',
  'noscript': 'HTMLElement',
  'object': 'HTMLObjectElement',
  'ol': 'HTMLOListElement',
  'optgroup': 'HTMLOptGroupElement',
  'option': 'HTMLOptionElement',
  'output': 'HTMLOutputElement',
  'p': 'HTMLParagraphElement',
  'param': 'HTMLParamElement',
  'pre': 'HTMLPreElement',
  'progress': 'HTMLProgressElement',
  'q': 'HTMLQuoteElement',
  's': 'HTMLElement',
  'samp': 'HTMLElement',
  'script': 'HTMLScriptElement',
  'section': 'HTMLElement',
  'select': 'HTMLSelectElement',
  'small': 'HTMLElement',
  'source': 'HTMLSourceElement',
  'span': 'HTMLSpanElement',
  'strike': 'HTMLElement',
  'strong': 'HTMLElement',
  'style': 'HTMLStyleElement',
  'sub': 'HTMLElement',
  'summary': 'HTMLElement',
  'sup': 'HTMLElement',
  'table': 'HTMLTableElement',
  'tbody': 'HTMLTableSectionElement',
  'td': 'HTMLTableDataCellElement',
  'template': 'HTMLTemplateElement',
  'textarea': 'HTMLTextAreaElement',
  'tfoot': 'HTMLTableSectionElement',
  'th': 'HTMLTableHeaderCellElement',
  'thead': 'HTMLTableSectionElement',
  'time': 'HTMLTimeElement',
  'title': 'HTMLTitleElement',
  'tr': 'HTMLTableRowElement',
  'track': 'HTMLTrackElement',
  'tt': 'HTMLElement',
  'u': 'HTMLElement',
  'ul': 'HTMLUListElement',
  'var': 'HTMLElement',
  'video': 'HTMLVideoElement',
  'wbr': 'HTMLElement'
};
html4[ 'ELEMENT_DOM_INTERFACES' ] = html4.ELEMENT_DOM_INTERFACES;
html4.ueffects = {
  'NOT_LOADED': 0,
  'SAME_DOCUMENT': 1,
  'NEW_DOCUMENT': 2
};
html4[ 'ueffects' ] = html4.ueffects;
html4.URIEFFECTS = {
  'a::href': 2,
  'area::href': 2,
  'audio::src': 1,
  'blockquote::cite': 0,
  'command::icon': 1,
  'del::cite': 0,
  'form::action': 2,
  'img::src': 1,
  'input::src': 1,
  'ins::cite': 0,
  'q::cite': 0,
  'video::poster': 1,
  'video::src': 1
};
html4[ 'URIEFFECTS' ] = html4.URIEFFECTS;
html4.ltypes = {
  'UNSANDBOXED': 2,
  'SANDBOXED': 1,
  'DATA': 0
};
html4[ 'ltypes' ] = html4.ltypes;
html4.LOADERTYPES = {
  'a::href': 2,
  'area::href': 2,
  'audio::src': 2,
  'blockquote::cite': 2,
  'command::icon': 1,
  'del::cite': 2,
  'form::action': 2,
  'img::src': 1,
  'input::src': 1,
  'ins::cite': 2,
  'q::cite': 2,
  'video::poster': 1,
  'video::src': 2
};
html4[ 'LOADERTYPES' ] = html4.LOADERTYPES;

/** Initialize lexCss for use in parseCssDeclarations. */
(function () {

  /**
   * Decodes an escape sequence as specified in CSS3 section 4.1.
   * http://www.w3.org/TR/css3-syntax/#characters
   * @private
   */
  function decodeCssEscape(s) {
    var i = parseInt(s.substring(1), 16);
    // If parseInt didn't find a hex diigt, it returns NaN so return the
    // escaped character.
    // Otherwise, parseInt will stop at the first non-hex digit so there's no
    // need to worry about trailing whitespace.
    if (i > 0xffff) {
      // A supplemental codepoint.
      return i -= 0x10000,
        String.fromCharCode(
            0xd800 + (i >> 10),
            0xdc00 + (i & 0x3FF));
    } else if (i == i) {
      return String.fromCharCode(i);
    } else if (s[1] < ' ') {
      // "a backslash followed by a newline is ignored".
      return '';
    } else {
      return s[1];
    }
  }

  /**
   * Returns an equivalent CSS string literal given plain text: foo -> "foo".
   * @private
   */
  function escapeCssString(s, replacer) {
    return '"' + s.replace(/[\u0000-\u001f\\\"<>]/g, replacer) + '"';
  }

  /**
   * Maps chars to CSS escaped equivalents: "\n" -> "\\a ".
   * @private
   */
  function escapeCssStrChar(ch) {
    return cssStrChars[ch]
        || (cssStrChars[ch] = '\\' + ch.charCodeAt(0).toString(16) + ' ');
  }

  /**
   * Maps chars to URI escaped equivalents: "\n" -> "%0a".
   * @private
   */
  function escapeCssUrlChar(ch) {
    return cssUrlChars[ch]
        || (cssUrlChars[ch] = (ch < '\x10' ? '%0' : '%')
            + ch.charCodeAt(0).toString(16));
  }

  /**
   * Mapping of CSS special characters to escaped equivalents.
   * @private
   */
  var cssStrChars = {
    '\\': '\\\\'
  };

  /**
   * Mapping of CSS special characters to URL-escaped equivalents.
   * @private
   */
  var cssUrlChars = {
    '\\': '%5c'
  };

  // The comments below are copied from the CSS3 module syntax at
  // http://www.w3.org/TR/css3-syntax .
  // These string constants minify out when this is run-through closure
  // compiler.
  // Rules that have been adapted have comments prefixed with "Diff:", and
  // where rules have been combined to avoid back-tracking in the regex engine
  // or to work around limitations, there is a comment prefixed with
  // "NewRule:".

  // In the below, we assume CRLF and CR have been normalize to CR.

  // wc  ::=  #x9 | #xA | #xC | #xD | #x20
  var WC = '[\\t\\n\\f ]';
  // w  ::=  wc*
  var W = WC + '*';
  // nl  ::=  #xA | #xD #xA | #xD | #xC
  var NL = '[\\n\\f]';
  // nonascii  ::=  [#x80-#xD7FF#xE000-#xFFFD#x10000-#x10FFFF]
  // NewRule: Supplemental codepoints are represented as surrogate pairs in JS.
  var SURROGATE_PAIR = '[\\ud800-\\udbff][\\udc00-\\udfff]';
  var NONASCII = '[\\u0080-\\ud7ff\\ue000-\\ufffd]|' + SURROGATE_PAIR;
  // unicode  ::=  '\' [0-9a-fA-F]{1,6} wc?
  // NewRule: No point in having ESCAPE do (\\x|\\y)
  var UNICODE_TAIL = '[0-9a-fA-F]{1,6}' + WC + '?';
  var UNICODE = '\\\\' + UNICODE_TAIL;
  // escape  ::=  unicode
  //           | '\' [#x20-#x7E#x80-#xD7FF#xE000-#xFFFD#x10000-#x10FFFF]
  // NewRule: Below we use escape tail to efficiently match an escape or a
  // line continuation so we can decode string content.
  var ESCAPE_TAIL = '(?:' + UNICODE_TAIL
      + '|[\\u0020-\\u007e\\u0080-\\ud7ff\\ue000\\ufffd]|'
      + SURROGATE_PAIR + ')';
  var ESCAPE = '\\\\' + ESCAPE_TAIL;
  // urlchar  ::=  [#x9#x21#x23-#x26#x28-#x7E] | nonascii | escape
  var URLCHAR = '(?:[\\t\\x21\\x23-\\x26\\x28-\\x5b\\x5d-\\x7e]|'
      + NONASCII + '|' + ESCAPE + ')';
  // stringchar  ::= urlchar | #x20 | '\' nl
  // We ignore mismatched surrogate pairs inside strings, so stringchar
  // simplifies to a non-(quote|newline|backslash) or backslash any.
  // Since we normalize CRLF to a single code-unit, there is no special
  // handling needed for '\\' + CRLF.
  var STRINGCHAR = '[^\'"\\n\\f\\\\]|\\\\[\\s\\S]';
  // string  ::=  '"' (stringchar | "'")* '"' | "'" (stringchar | '"')* "'"
  var STRING = '"(?:\'|' + STRINGCHAR + ')*"'
      + '|\'(?:\"|' + STRINGCHAR + ')*\'';
  // num  ::=  [0-9]+ | [0-9]* '.' [0-9]+
  // Diff: We attach signs to num tokens.
  var NUM = '[-+]?(?:[0-9]+(?:[.][0-9]+)?|[.][0-9]+)';
  // nmstart  ::=  [a-zA-Z] | '_' | nonascii | escape
  var NMSTART = '(?:[a-zA-Z_]|' + NONASCII + '|' + ESCAPE + ')';
  // nmchar  ::=  [a-zA-Z0-9] | '-' | '_' | nonascii | escape
  var NMCHAR = '(?:[a-zA-Z0-9_-]|' + NONASCII + '|' + ESCAPE + ')';
  // name  ::=  nmchar+
  var NAME = NMCHAR + '+';
  // ident  ::=  '-'? nmstart nmchar*
  var IDENT = '-?' + NMSTART + NMCHAR + '*';

  // ATKEYWORD  ::=  '@' ident
  var ATKEYWORD = '@' + IDENT;
  // HASH  ::=  '#' name
  var HASH = '#' + NAME;
  // NUMBER  ::=  num
  var NUMBER = NUM;

  // NewRule: union of IDENT, ATKEYWORD, HASH, but excluding #[0-9].
  var WORD_TERM = '(?:@?-?' + NMSTART + '|#)' + NMCHAR + '*';

  // PERCENTAGE  ::=  num '%'
  var PERCENTAGE = NUM + '%';
  // DIMENSION  ::=  num ident
  var DIMENSION = NUM + IDENT;
  var NUMERIC_VALUE = NUM + '(?:%|' + IDENT + ')?';
  // URI  ::=  "url(" w (string | urlchar* ) w ")"
  var URI = 'url[(]' + W + '(?:' + STRING + '|' + URLCHAR + '*)' + W + '[)]';
  // UNICODE-RANGE  ::=  "U+" [0-9A-F?]{1,6} ('-' [0-9A-F]{1,6})?
  var UNICODE_RANGE = 'U[+][0-9A-F?]{1,6}(?:-[0-9A-F]{1,6})?';
  // CDO  ::=  "<\!--"
  var CDO = '<\!--';
  // CDC  ::=  "-->"
  var CDC = '-->';
  // S  ::=  wc+
  var S = WC + '+';
  // COMMENT  ::=  "/*" [^*]* '*'+ ([^/] [^*]* '*'+)* "/"
  // Diff: recognizes // comments.
  var COMMENT = '/(?:[*][^*]*[*]+(?:[^/][^*]*[*]+)*/|/[^\\n\\f]*)';
  // FUNCTION  ::=  ident '('
  // Diff: We exclude url explicitly.
  // TODO: should we be tolerant of "fn ("?
  var FUNCTION = '(?!url[(])' + IDENT + '[(]';
  // INCLUDES  ::=  "~="
  var INCLUDES = '~=';
  // DASHMATCH  ::=  "|="
  var DASHMATCH = '[|]=';
  // PREFIXMATCH  ::=  "^="
  var PREFIXMATCH = '[^]=';
  // SUFFIXMATCH  ::=  "$="
  var SUFFIXMATCH = '[$]=';
  // SUBSTRINGMATCH  ::=  "*="
  var SUBSTRINGMATCH = '[*]=';
  // NewRule: one rule for all the comparison operators.
  var CMP_OPS = '[~|^$*]=';
  // CHAR  ::=  any character not matched by the above rules, except for " or '
  // Diff: We exclude / and \ since they are handled above to prevent
  // /* without a following */ from combining when comments are concatenated.
  var CHAR = '[^"\'\\\\/]|/(?![/*])';
  // BOM  ::=  #xFEFF
  var BOM = '\\uFEFF';

  var CSS_TOKEN = new RegExp([
      BOM, UNICODE_RANGE, URI, FUNCTION, WORD_TERM, STRING, NUMERIC_VALUE,
      CDO, CDC, S, COMMENT, CMP_OPS, CHAR].join("|"), 'gi');

  var CSS_DECODER = new RegExp('\\\\(?:' + ESCAPE_TAIL + '|' + NL + ')', 'g');
  var URL_RE = new RegExp('^url\\(' + W + '["\']?|["\']?' + W + '\\)$', 'gi');
  /**
   * Decodes CSS escape sequences in a CSS string body.
   */
   decodeCss = function (css) {
     return css.replace(CSS_DECODER, decodeCssEscape);
   };

  /**
   * Given CSS Text, returns an array of normalized tokens.
   * @param {string} cssText
   * @return {Array.<string>} tokens where all ignorable token sequences have
   *    been reduced to a single {@code " "} and all strings and
   *    {@code url(...)} tokens have been normalized to use double quotes as
   *    delimiters and to not otherwise contain double quotes.
   */
  lexCss = function (cssText) {
    // Stringify input. Additionally, insert and remove a non-latin1 character
    // to force Firefox 33 to switch to a wide string representation, avoiding
    // a performance bug. This workaround should become unnecessary after
    // Firefox 34. https://bugzilla.mozilla.org/show_bug.cgi?id=1081175
    // https://code.google.com/p/google-caja/issues/detail?id=1941
    cssText = ('\uffff' + cssText).replace(/^\uffff/, '');

    // // Normalize CRLF & CR to LF.
    cssText = cssText.replace(/\r\n?/g, '\n');

    // Tokenize.
    var tokens = cssText.match(CSS_TOKEN) || [];
    var j = 0;
    var last = ' ';
    for (var i = 0, n = tokens.length; i < n; ++i) {
      // Normalize all escape sequences.  We will have to re-escape some
      // codepoints in string and url(...) bodies but we already know the
      // boundaries.
      // We might mistakenly treat a malformed identifier like \22\20\22 as a
      // string, but that will not break any valid stylesheets since we requote
      // and re-escape in string below.
      var tok = decodeCss(tokens[i]);
      var len = tok.length;
      var cc = tok.charCodeAt(0);
      tok =
          // All strings should be double quoted, and the body should never
          // contain a double quote.
          (cc == '"'.charCodeAt(0) || cc == '\''.charCodeAt(0))
          ? escapeCssString(tok.substring(1, len - 1), escapeCssStrChar)
          // A breaking ignorable token should is replaced with a single space.
          : (cc == '/'.charCodeAt(0) && len > 1  // Comment.
             || tok == '\\' || tok == CDC || tok == CDO || tok == '\ufeff'
             // Characters in W.
             || cc <= ' '.charCodeAt(0))
          ? ' '
          // Make sure that all url(...)s are double quoted.
          : /url\(/i.test(tok)
          ? 'url(' + escapeCssString(
            tok.replace(URL_RE, ''),
            escapeCssUrlChar)
            + ')'
          // Escapes in identifier like tokens will have been normalized above.
          : tok;
      // Merge adjacent space tokens.
      if (last != tok || tok != ' ') {
        tokens[j++] = last = tok;
      }
    }
    tokens.length = j;
    return tokens;
  };
})();

/** Initialize style related parsing for parseCssDeclarations. */
(function () {
  var NOEFFECT_URL = 'url("about:blank")';
  /**
   * The set of characters that need to be normalized inside url("...").
   * We normalize newlines because they are not allowed inside quoted strings,
   * normalize quote characters, angle-brackets, and asterisks because they
   * could be used to break out of the URL or introduce targets for CSS
   * error recovery.  We normalize parentheses since they delimit unquoted
   * URLs and calls and could be a target for error recovery.
   */
  var NORM_URL_REGEXP = /[\n\f\r\"\'()*<>]/g;
  /** The replacements for NORM_URL_REGEXP. */
  var NORM_URL_REPLACEMENTS = {
    '\n': '%0a',
    '\f': '%0c',
    '\r': '%0d',
    '"':  '%22',
    '\'': '%27',
    '(':  '%28',
    ')':  '%29',
    '*':  '%2a',
    '<':  '%3c',
    '>':  '%3e'
  };

  function normalizeUrl(s) {
    if ('string' === typeof s) {
      return 'url("' + s.replace(NORM_URL_REGEXP, normalizeUrlChar) + '")';
    } else {
      return NOEFFECT_URL;
    }
  }
  function normalizeUrlChar(ch) {
    return NORM_URL_REPLACEMENTS[ch];
  }

  // From RFC3986
  var URI_SCHEME_RE = new RegExp(
      '^' +
      '(?:' +
        '([^:\/?# ]+)' +         // scheme
      ':)?'
  );

  var ALLOWED_URI_SCHEMES = /^(?:https?|geo|mailto|sms|tel)$/i;

  function resolveUri(baseUri, uri) {
    if (baseUri) {
      return URI.utils.resolve(baseUri, uri);
    }
    return uri;
  }

  function safeUri(uri, prop, naiveUriRewriter) {
    if (!naiveUriRewriter) { return null; }
    var parsed = ('' + uri).match(URI_SCHEME_RE);
    if (parsed && (!parsed[1] || ALLOWED_URI_SCHEMES.test(parsed[1]))) {
      return naiveUriRewriter(uri, prop);
    } else {
      return null;
    }
  }

  function withoutVendorPrefix(ident) {
    // http://stackoverflow.com/a/5411098/20394 has a fairly extensive list
    // of vendor prefices.
    // Blink has not declared a vendor prefix distinct from -webkit-
    // and http://css-tricks.com/tldr-on-vendor-prefix-drama/ discusses
    // how Mozilla recognizes some -webkit-
    // http://wiki.csswg.org/spec/vendor-prefixes talks more about
    // cross-implementation, and lists other prefixes.
    // Note: info is duplicated in CssValidator.java
    return ident.replace(
        /^-(?:apple|css|epub|khtml|moz|mso?|o|rim|wap|webkit|xv)-(?=[a-z])/, '');
  }

  /**
   * Given a series of normalized CSS tokens, applies a property schema, as
   * defined in CssPropertyPatterns.java, and sanitizes the tokens in place.
   * @param property a property name.
   * @param tokens as parsed by lexCss.  Modified in place.
   * @param opt_naiveUriRewriter a URI rewriter; an object with a "rewrite"
   *     function that takes a URL and returns a safe URL.
   * @param opt_baseURI a URI against which all relative URLs in tokens will
   *     be resolved.
   * @param opt_idSuffix {string} appended to all IDs to scope them.
   */
  sanitizeCssProperty = (function () {

    function unionArrays(arrs) {
      var map = {};
      for (var i = arrs.length; --i >= 0;) {
        var arr = arrs[i];
        for (var j = arr.length; --j >= 0;) {
          map[arr[j]] = ALLOWED_LITERAL;
        }
      }
      return map;
    }

    // Used as map value to avoid hasOwnProperty checks.
    var ALLOWED_LITERAL = {};

    return function sanitize(
        property, tokens, opt_naiveUriRewriter, opt_baseUri, opt_idSuffix) {

      var propertyKey = withoutVendorPrefix(property);
      var propertySchema = cssSchema[propertyKey];

      // If the property isn't recognized, elide all tokens.
      if (!propertySchema || 'object' !== typeof propertySchema) {
        tokens.length = 0;
        return;
      }

      var propBits = propertySchema['cssPropBits'];

      /**
       * Recurse to apply the appropriate function schema to the function call
       * that starts at {@code tokens[start]}.
       * @param {Array.<string>} tokens an array of CSS token that is modified
       *   in place so that all tokens involved in the function call
       *   (from {@code tokens[start]} to a close parenthesis) are folded to
       *   one token.
       * @param {number} start an index into tokens of a function token like
       *   {@code 'name('}.
       * @return the replacement function or the empty string if the function
       *   call is not both well-formed and allowed.
       */
      function sanitizeFunctionCall(tokens, start) {
        var parenDepth = 1, end = start + 1, n = tokens.length;
        while (end < n && parenDepth) {
          var token = tokens[end++];
          // Decrement if we see a close parenthesis, and increment if we
          // see a function.  Since url(...) are whole tokens, they will not
          // affect the token scanning.
          parenDepth += (token === ')' ? -1 : /^[^"']*\($/.test(token));
        }
        // Allow error-recovery from unclosed functions by ignoring the call and
        // so allowing resumption at the next ';'.
        if (!parenDepth) {
          var fnToken = tokens[start].toLowerCase();
          var bareFnToken = withoutVendorPrefix(fnToken);
          // Cut out the originals, so the caller can step by one token.
          var fnTokens = tokens.splice(start, end - start, '');
          var fns = propertySchema['cssFns'];
          // Look for a function that matches the name.
          for (var i = 0, nFns = fns.length; i < nFns; ++i) {
            if (fns[i].substring(0, bareFnToken.length) == bareFnToken) {
              fnTokens[0] = fnTokens[fnTokens.length - 1] = '';
              // Recurse and sanitize the function parameters.
              sanitize(
                fns[i],
                // The actual parameters to the function.
                fnTokens,
                opt_naiveUriRewriter, opt_baseUri);
              // Reconstitute the function from its parameter tokens.
              return fnToken + fnTokens.join(' ') + ')';
            }
          }
        }
        return '';
      }

      // Used to determine whether to treat quoted strings as URLs or
      // plain text content, and whether unrecognized keywords can be quoted
      // to treat ['Arial', 'Black'] equivalently to ['"Arial Black"'].
      var stringDisposition =
        propBits & (CSS_PROP_BIT_URL | CSS_PROP_BIT_UNRESERVED_WORD);
      // Used to determine what to do with unreserved words.
      var identDisposition =
        propBits & (CSS_PROP_BIT_GLOBAL_NAME | CSS_PROP_BIT_PROPERTY_NAME);

      // Used to join unquoted keywords into a single quoted string.
      var lastQuoted = NaN;
      var i = 0, k = 0;
      for (;i < tokens.length; ++i) {
        // Has the effect of normalizing hex digits, keywords,
        // and function names.
        var token = tokens[i].toLowerCase();
        var cc = token.charCodeAt(0), cc1, cc2, isnum1, isnum2, end;
        var litGroup, litMap;
        token = (

          // Strip out spaces.  Normally cssparser.js dumps these, but we
          // strip them out in case the content doesn't come via cssparser.js.
          (cc === ' '.charCodeAt(0)) ? ''
          : (cc === '"'.charCodeAt(0)) ? (  // Quoted string.
            (stringDisposition === CSS_PROP_BIT_URL)
            ? (opt_naiveUriRewriter
               // Sanitize and convert to url("...") syntax.
               // Treat url content as case-sensitive.
               ? (normalizeUrl(
                   // Rewrite to a safe URI.
                   safeUri(
                     // Convert to absolute URL
                     resolveUri(
                       opt_baseUri,
                       // Strip off quotes
                       decodeCss(tokens[i].substring(1, token.length - 1))),
                     propertyKey,
                     opt_naiveUriRewriter)))
              : '')
            : ((propBits & CSS_PROP_BIT_QSTRING)
               // Ambiguous when more than one bit set in disposition.
               && !(stringDisposition & (stringDisposition - 1)))
            ? token
            // Drop if quoted strings not allowed.
            : ''
          )

          // inherit is always allowed.
          : token === 'inherit'
          ? token

          : (
            litGroup = propertySchema['cssLitGroup'],
            litMap = (litGroup
                      ? (propertySchema['cssLitMap']
                         // Lazily compute the union from litGroup.
                         || (propertySchema['cssLitMap'] =
                             unionArrays(litGroup)))
                      : ALLOWED_LITERAL),  // A convenient empty object.
            (litMap[withoutVendorPrefix(token)] === ALLOWED_LITERAL)
          )
          // Token is in the literal map or matches extra.
          ? token

          // Preserve hash color literals if allowed.
          : (cc === '#'.charCodeAt(0) && /^#(?:[0-9a-f]{3,4}){1,2}$/.test(token))
          ? (propBits & CSS_PROP_BIT_HASH_VALUE ? token : '')

          : ('0'.charCodeAt(0) <= cc && cc <= '9'.charCodeAt(0))
          // A number starting with a digit.
          ? ((propBits & CSS_PROP_BIT_QUANTITY) ? token : '')

          // Normalize quantities so they don't start with a '.' or '+' sign and
          // make sure they all have an integer component so can't be confused
          // with a dotted identifier.
          // This can't be done in the lexer since ".4" is a valid rule part.
          : (cc1 = token.charCodeAt(1),
             cc2 = token.charCodeAt(2),
             isnum1 = '0'.charCodeAt(0) <= cc1 && cc1 <= '9'.charCodeAt(0),
             isnum2 = '0'.charCodeAt(0) <= cc2 && cc2 <= '9'.charCodeAt(0),
             // +.5 -> 0.5 if allowed.
             (cc === '+'.charCodeAt(0)
              && (isnum1 || (cc1 === '.'.charCodeAt(0) && isnum2))))
          ? ((propBits & CSS_PROP_BIT_QUANTITY)
            ? ((isnum1 ? '' : '0') + token.substring(1))
            : '')

          // -.5 -> -0.5 if allowed otherwise -> 0 if quantities allowed.
          : (cc === '-'.charCodeAt(0)
             && (isnum1 || (cc1 === '.'.charCodeAt(0) && isnum2)))
            ? ((propBits & CSS_PROP_BIT_NEGATIVE_QUANTITY)
               ? ((isnum1 ? '-' : '-0') + token.substring(1))
               : ((propBits & CSS_PROP_BIT_QUANTITY) ? '0' : ''))

          // .5 -> 0.5 if allowed.
          : (cc === '.'.charCodeAt(0) && isnum1)
          ? ((propBits & CSS_PROP_BIT_QUANTITY) ? '0' + token : '')

          // Handle url("...") by rewriting the body.
          : ('url("' === token.substring(0, 5))
          ? ((opt_naiveUriRewriter && (propBits & CSS_PROP_BIT_URL))
             ? normalizeUrl(safeUri(resolveUri(opt_baseUri,
                  tokens[i].substring(5, token.length - 2)),
                  propertyKey,
                  opt_naiveUriRewriter))
             : '')

          // Handle func(...) by recursing.
          // Functions start at a token like "name(" and end with a ")" taking
          // into account nesting.
          : (token.charAt(token.length-1) === '(')
          ? sanitizeFunctionCall(tokens, i)

          : (identDisposition
             && /^-?[a-z_][\w\-]*$/.test(token) && !/__$/.test(token))
          ? (opt_idSuffix && identDisposition === CSS_PROP_BIT_GLOBAL_NAME
             ? tokens[i] + opt_idSuffix  // use original token, not lowercased
             : (identDisposition === CSS_PROP_BIT_PROPERTY_NAME
                && cssSchema[token]
                && 'number' === typeof cssSchema[token].cssPropBits)
             ? token
             : '')

          : (/^\w+$/.test(token)
             && stringDisposition === CSS_PROP_BIT_UNRESERVED_WORD
             && (propBits & CSS_PROP_BIT_QSTRING))
          // Quote unrecognized keywords so font names like
          //    Arial Bold
          // ->
          //    "Arial Bold"
          ? (lastQuoted+1 === k
             // If the last token was also a keyword that was quoted, then
             // combine this token into that.
             ? (tokens[lastQuoted] = (
                  tokens[lastQuoted].substring(0, tokens[lastQuoted].length-1)
                  + ' ' + token + '"'),
                token = '')
             : (lastQuoted = k, '"' + token + '"'))

          // Disallowed.
          : '');
        if (token) {
          tokens[k++] = token;
        }
      }
      // For single URL properties, if the URL failed to pass the sanitizer,
      // then just drop it.
      if (k === 1 && tokens[0] === NOEFFECT_URL) { k = 0; }
      tokens.length = k;
    };
  })();

  // Note, duplicated in CssRewriter.java
  // Constructed from
  //    https://developer.mozilla.org/en-US/docs/Web/CSS/Reference
  //    https://developer.mozilla.org/en-US/docs/Web/CSS/Pseudo-classes
  //    http://dev.w3.org/csswg/selectors4/
  var PSEUDO_SELECTOR_WHITELIST =
    new RegExp(
        '^(active|after|before|blank|checked|default|disabled'
        + '|drop|empty|enabled|first|first-child|first-letter'
        + '|first-line|first-of-type|fullscreen|focus|hover'
        + '|in-range|indeterminate|invalid|last-child|last-of-type'
        + '|left|link|only-child|only-of-type|optional|out-of-range'
        + '|placeholder-shown|read-only|read-write|required|right'
        + '|root|scope|user-error|valid|visited'
        + ')$');

  // Set of punctuation tokens that are child/sibling selectors.
  var COMBINATOR = {};
  COMBINATOR['>'] = COMBINATOR['+'] = COMBINATOR['~'] = COMBINATOR;

  /**
   * Given a series of tokens, returns a list of sanitized selectors.
   * @param {Array.<string>} selectors In the form produced by csslexer.js.
   * @param {{
   *     containerClass: ?string,
   *     idSuffix: string,
   *     tagPolicy: defs.TagPolicy,
   *     virtualizeAttrName: ?function(string, string): ?string
   *   }} virtualization An object like <pre<{
   *   containerClass: class name prepended to all selectors to scope them (if
   *       not null)
   *   idSuffix: appended to all IDs to scope them
   *   tagPolicy: As in html-sanitizer, used for rewriting element names.
   *   virtualizeAttrName: Rewrite a single attribute name for attribute
   *       selectors, or return null if not possible. Should be consistent
   *       with tagPolicy if possible.
   * }</pre>
   *    If containerClass is {@code "sfx"} and idSuffix is {@code "-sfx"}, the
   *    selector
   *    {@code ["a", "#foo", " ", "b", ".bar"]} will be namespaced to
   *    {@code [".sfx", " ", "a", "#foo-sfx", " ", "b", ".bar"]}.
   * @param {function(Array.<string>): boolean} opt_onUntranslatableSelector
   *     When a selector cannot be translated, this function is called with the
   *     non-whitespace/comment tokens comprising the selector and returns a
   *     value indicating whether to continue processing the selector list.
   *     If it returns falsey, then processing is aborted and null is returned.
   *     If not present or it returns truthy, then the complex selector is
   *     dropped from the selector list.
   * @return {Array.<string>}? an array of sanitized selectors.
   *    Null when the untraslatable compound selector handler aborts processing.
   */
  sanitizeCssSelectorList = function(
      selectors, virtualization, opt_onUntranslatableSelector) {
    var containerClass = virtualization.containerClass;
    var idSuffix = virtualization.idSuffix;
    var tagPolicy = virtualization.tagPolicy;
    var sanitized = [];

    // Remove any spaces that are not operators.
    var k = 0, i, inBrackets = 0, tok;
    for (i = 0; i < selectors.length; ++i) {
      tok = selectors[i];

      if (
            (tok == '(' || tok == '[') ? (++inBrackets, true)
          : (tok == ')' || tok == ']') ? (inBrackets && --inBrackets, true)
          : !(selectors[i] == ' '
              && (inBrackets || COMBINATOR[selectors[i-1]] === COMBINATOR
                  || COMBINATOR[selectors[i+1]] === COMBINATOR))
        ) {
        selectors[k++] = selectors[i];
      }
    }
    selectors.length = k;

    // Split around commas.  If there is an error in one of the comma separated
    // bits, we throw the whole away, but the failure of one selector does not
    // affect others except that opt_onUntranslatableSelector allows one to
    // treat the entire output as unusable.
    var n = selectors.length, start = 0;
    for (i = 0; i < n; ++i) {
      if (selectors[i] === ',') {  // TODO: ignore ',' inside brackets.
        if (!processComplexSelector(start, i)) { return null; }
        start = i+1;
      }
    }
    if (!processComplexSelector(start, n)) { return null; }


    function processComplexSelector(start, end) {
      // Space around commas is not an operator.
      if (selectors[start] === ' ') { ++start; }
      if (end-1 !== start && selectors[end] === ' ') { --end; }

      // Split the selector into element selectors, content around
      // space (ancestor operator) and '>' (descendant operator).
      var out = [];
      var lastOperator = start;
      var valid = true;  // True iff out contains a valid complex selector.
      for (var i = start; valid && i < end; ++i) {
        var tok = selectors[i];
        if (COMBINATOR[tok] === COMBINATOR || tok === ' ') {
          // We've found the end of a single link in the selector chain.
          if (!processCompoundSelector(lastOperator, i, tok)) {
            valid = false;
          } else {
            lastOperator = i+1;
          }
        }
      }
      if (!processCompoundSelector(lastOperator, end, '')) {
        valid = false;
      }

      function processCompoundSelector(start, end, combinator) {
        // Split the element selector into four parts.
        // DIV.foo#bar[href]:hover
        //    ^       ^     ^
        // el classes attrs pseudo
        var element, classId, attrs, pseudoSelector,
            tok,  // The current token
            // valid implies the parts above comprise a sanitized selector.
            valid = true;
        element = '';
        if (start < end) {
          tok = selectors[start];
          if (tok === '*') {
            ++start;
            element = tok;
          } else if (/^[a-zA-Z]/.test(tok)) {  // is an element selector
            var decision = tagPolicy(tok.toLowerCase(), []);
            if (decision) {
              if ('tagName' in decision) {
                tok = decision['tagName'];
              }
              ++start;
              element = tok;
            }
          }
        }
        classId = '';
        attrs = '';
        pseudoSelector = '';
        for (;valid && start < end; ++start) {
          tok = selectors[start];
          if (tok.charAt(0) === '#') {
            if (/^#_|__$|[^\w#:\-]/.test(tok)) {
              valid = false;
            } else {
              // Rewrite ID elements to include the suffix.
              classId += tok + idSuffix;
            }
          } else if (tok === '.') {
            if (++start < end
                && /^[0-9A-Za-z:_\-]+$/.test(tok = selectors[start])
                && !/^_|__$/.test(tok)) {
              classId += '.' + tok;
            } else {
              valid = false;
            }
          } else if (start + 1 < end && selectors[start] === '[') {
            ++start;
            var vAttr = selectors[start++].toLowerCase();
            // Schema lookup for type information
            var atype = html4.ATTRIBS[element + '::' + vAttr];
            if (atype !== +atype) { atype = html4.ATTRIBS['*::' + vAttr]; }

            var rAttr;
            // Consult policy
            // TODO(kpreid): Making this optional is a kludge to avoid changing
            // the public interface until we have a more well-structured design.
            if (virtualization.virtualizeAttrName) {
              rAttr = virtualization.virtualizeAttrName(element, vAttr);
              if (typeof rAttr !== 'string') {
                // rejected
                valid = false;
                rAttr = vAttr;
              }
              // don't reject even if not in schema
              if (valid && atype !== +atype) {
                atype = html4.atype['NONE'];
              }
            } else {
              rAttr = vAttr;
              if (atype !== +atype) {  // not permitted according to schema
                valid = false;
              }
            }

            var op = '', value = '', ignoreCase = false;
            if (/^[~^$*|]?=$/.test(selectors[start])) {
              op = selectors[start++];
              value = selectors[start++];
              // Quote identifier values.
              if (/^[0-9A-Za-z:_\-]+$/.test(value)) {
                value = '"' + value + '"';
              } else if (value === ']') {
                value = '""';
                --start;
              }
              // Reject unquoted values.
              if (!/^"([^\"\\]|\\.)*"$/.test(value)) {
                valid = false;
              }
              ignoreCase = selectors[start] === "i";
              if (ignoreCase) { ++start; }
            }
            if (selectors[start] !== ']') {
              ++start;
              valid = false;
            }
            // TODO: replace this with a lookup table that also provides a
            // function from operator and value to testable value.
            switch (atype) {
            case html4.atype['CLASSES']:
            case html4.atype['LOCAL_NAME']:
            case html4.atype['NONE']:
              break;
            case html4.atype['GLOBAL_NAME']:
            case html4.atype['ID']:
            case html4.atype['IDREF']:
              if ((op === '=' || op === '~=' || op === '$=')
                  && value != '""' && !ignoreCase) {
                // The suffix is case-sensitive, so we can't translate case
                // ignoring matches.
                value = '"'
                  + value.substring(1, value.length-1) + idSuffix
                  + '"';
              } else if (op === '|=' || op === '') {
                // Ok.  a|=b -> a == b || a.startsWith(b + "-") and since we
                // use "-" to separate the suffix from the identifier, we can
                // allow this through unmodified.
                // Existence checks are also ok.
              } else {
                // Can't correctly handle prefix and substring operators
                // without leaking information about the suffix.
                valid = false;
              }
              break;
            case html4.atype['URI']:
            case html4.atype['URI_FRAGMENT']:
              // URIs are rewritten, so we can't meanginfully translate URI
              // selectors besides the common a[href] one that is used to
              // distinguish links from naming anchors.
              if (op !== '') { valid = false; }
              break;
            // TODO: IDREFS
            default:
              valid = false;
            }
            if (valid) {
              attrs += '[' + rAttr.replace(/[^\w-]/g, '\\$&') + op + value +
                  (ignoreCase ? ' i]' : ']');
            }
          } else if (start < end && selectors[start] === ':') {
            tok = selectors[++start];
            if (PSEUDO_SELECTOR_WHITELIST.test(tok)) {
              pseudoSelector += ':' + tok;
            } else {
              break;
            }
          } else {
            break;  // Unrecognized token.
          }
        }
        if (start !== end) {  // Tokens not consumed.
          valid = false;
        }
        if (valid) {
          // ':' is allowed in identifiers, but is also the
          // pseudo-selector separator, so ':' in preceding parts needs to
          // be escaped.
          var selector = (element + classId).replace(/[^ .*#\w-]/g, '\\$&')
              + attrs + pseudoSelector + combinator;
          if (selector) { out.push(selector); }
        }
        return valid;
      }

      if (valid) {
        if (out.length) {
          var safeSelector = out.join('');

          // Namespace the selector so that it only matches under
          // a node with suffix in its CLASS attribute.
          if (containerClass !== null) {
            safeSelector = '.' + containerClass + ' ' + safeSelector;
          }

          sanitized.push(safeSelector);
        }  // else nothing there.
        return true;
      } else {
        return !opt_onUntranslatableSelector
          || opt_onUntranslatableSelector(selectors.slice(start, end));
      }
    }
    return sanitized;
  };

  (function () {
    var MEDIA_TYPE =
       '(?:'
       + 'all|aural|braille|embossed|handheld|print'
       + '|projection|screen|speech|tty|tv'
       + ')';

    // A white-list of media features extracted from the "Pseudo-BNF" in
    // http://dev.w3.org/csswg/mediaqueries4/#media1 and
    // https://developer.mozilla.org/en-US/docs/Web/Guide/CSS/Media_queries
    var MEDIA_FEATURE =
       '(?:'
       + '(?:min-|max-)?'
       + '(?:' + (
           '(?:device-)?'
         + '(?:aspect-ratio|height|width)'
         + '|color(?:-index)?'
         + '|monochrome'
         + '|orientation'
         + '|resolution'
       )
       + ')'
       + '|grid'
       + '|hover'
       + '|luminosity'
       + '|pointer'
       + '|scan'
       + '|script'
       + ')';

    var LENGTH_UNIT = '(?:p[cxt]|[cem]m|in|dpi|dppx|dpcm|%)';

    var CSS_VALUE =
       '-?(?:'
       + '[a-z]\\w+(?:-\\w+)*'  // An identifier
       // A length or scalar quantity, or a rational number.
       // dev.w3.org/csswg/mediaqueries4/#values introduces a ratio value-type
       // to allow matching aspect ratios like "4 / 3".
       + '|\\d+(?: / \\d+|(?:\\.\\d+)?' + LENGTH_UNIT + '?)'
       + ')';

    var MEDIA_EXPR =
       '\\( ' + MEDIA_FEATURE + ' (?:' + ': ' + CSS_VALUE + ' )?\\)';

    var MEDIA_QUERY =
       '(?:'
       + '(?:(?:(?:only|not) )?' + MEDIA_TYPE + '|' + MEDIA_EXPR + ')'
       // We use 'and ?' since 'and(' is a single CSS function token while
       // 'and (' parses to two separate tokens -- IDENT "and", DELIM "(".
       + '(?: and ?' + MEDIA_EXPR + ')*'
       + ')';

    var STARTS_WITH_KEYWORD_REGEXP = /^\w/;

    var MEDIA_QUERY_LIST_REGEXP = new RegExp(
      '^' + MEDIA_QUERY + '(?: , ' + MEDIA_QUERY + ')*' + '$',
      'i'
    );

    /**
     * Sanitizes a media query as defined in
     * http://dev.w3.org/csswg/mediaqueries4/#syntax
     * <blockquote>
     * Media Queries allow authors to adapt the style applied to a document
     * based on the environment the document is being rendered in.
     * </blockquote>
     *
     * @param {Array.<string>} cssTokens an array of tokens of the kind produced
     *   by cssLexers.
     * @return {string} a CSS media query.  This may be the empty string, or if
     *   the input is invalid, then a query that is always false.
     */
    sanitizeMediaQuery = function (cssTokens) {
      cssTokens = cssTokens.slice();
      // Strip out space tokens.
      var nTokens = cssTokens.length, k = 0;
      for (var i = 0; i < nTokens; ++i) {
        var tok = cssTokens[i];
        if (tok != ' ') { cssTokens[k++] = tok; }
      }
      cssTokens.length = k;
      var css = cssTokens.join(' ');
      css = (
        !css.length ? ''  // Always true per the spec.
        : !(MEDIA_QUERY_LIST_REGEXP.test(css)) ? 'not all'  // Always false.
        // Emit as-is if it starts with 'only', 'not' or a media type.
        : STARTS_WITH_KEYWORD_REGEXP.test(css) ? css
        : 'not all , ' + css  // Not ambiguous with a URL.
      );
      return css;
    };
  }());

  (function () {

    /**
     * Extracts a url out of an at-import rule of the form:
     *   \@import "mystyle.css";
     *   \@import url("mystyle.css");
     *
     * Returns null if no valid url was found.
     */
    function cssParseUri(candidate) {
      var string1 = /^\s*["]([^"]*)["]\s*$/;
      var string2 = /^\s*[']([^']*)[']\s*$/;
      var url1 = /^\s*url\s*[(]["]([^"]*)["][)]\s*$/;
      var url2 = /^\s*url\s*[(][']([^']*)['][)]\s*$/;
      // Not officially part of the CSS2.1 grammar
      // but supported by Chrome
      var url3 = /^\s*url\s*[(]([^)]*)[)]\s*$/;
      var match;
      if ((match = string1.exec(candidate))) {
        return match[1];
      } else if ((match = string2.exec(candidate))) {
        return match[1];
      } else if ((match = url1.exec(candidate))) {
        return match[1];
      } else if ((match = url2.exec(candidate))) {
        return match[1];
      } else if ((match = url3.exec(candidate))) {
        return match[1];
      }
      return null;
    }

    /**
     * @param {string} baseUri a string against which relative urls are
     *    resolved.
     * @param {string} cssText a string containing a CSS stylesheet.
     * @param {{
     *     containerClass: ?string,
     *     idSuffix: string,
     *     tagPolicy: defs.TagPolicy,
     *     virtualizeAttrName: ?function(string, string): ?string
     *   }} virtualization An object like <pre<{
     *   containerClass: class name prepended to all selectors to scope them (if
     *       not null)
     *   idSuffix: appended to all IDs to scope them
     *   tagPolicy: As in html-sanitizer, used for rewriting element names.
     *   virtualizeAttrName: Rewrite a single attribute name for attribute
     *       selectors, or return null if not possible. Should be consistent
     *       with tagPolicy if possible. Optional.
     * }</pre>
     *    If containerClass is {@code "sfx"} and idSuffix is {@code "-sfx"}, the
     *    selector
     *    {@code ["a", "#foo", " ", "b", ".bar"]} will be namespaced to
     *    {@code [".sfx", " ", "a", "#foo-sfx", " ", "b", ".bar"]}.
     * @param {function(string, string)} naiveUriRewriter maps URLs of media
     *    (images, sounds) that appear as CSS property values to sanitized
     *    URLs or null if the URL should not be allowed as an external media
     *    file in sanitized CSS.
     * @param {undefined|function({toString: function ():string}, boolean)}
     *     continuation
     *     callback that receives the result of loading imported CSS.
     *     The callback is called with
     *     (cssContent : function ():string, moreToCome : boolean)
     *     where cssContent is the CSS at the imported URL, and moreToCome is
     *     true when the external URL itself loaded other external URLs.
     *     If the output of the original call is stringified when moreToCome is
     *     false, then it will be complete.
     * @param {Array.<number>} opt_importCount the number of imports that need
     *     to be satisfied before there is no more pending content.
     * @return {{result:{toString:function ():string},moreToCome:boolean}}
     *     the CSS text, and a flag that indicates whether there are pending
     *     imports that will be passed to continuation.
     */
    function sanitizeStylesheetInternal(
        baseUri, cssText, virtualization, naiveUriRewriter, naiveUriFetcher,
        continuation, opt_importCount) {
      var safeCss = void 0;
      // Return a result with moreToCome===true when the last import has been
      // sanitized.
      var importCount = opt_importCount || [0];
      // A stack describing the { ... } regions.
      // Null elements indicate blocks that should not be emitted.
      var blockStack = [];
      // True when the content of the current block should be left off safeCss.
      var elide = false;
      parseCssStylesheet(
          cssText,
          {
            'startStylesheet': function () {
              safeCss = [];
            },
            'endStylesheet': function () {
            },
            'startAtrule': function (atIdent, headerArray) {
              if (elide) {
                atIdent = null;
              } else if (atIdent === '@media') {
                safeCss.push('@media', ' ', sanitizeMediaQuery(headerArray));
              } else if (atIdent === '@keyframes'
                         || atIdent === '@-webkit-keyframes') {
                var animationId = headerArray[0];
                if (headerArray.length === 1
                    && !/__$|[^\w\-]/.test(animationId)) {
                  safeCss.push(
                      atIdent, ' ', animationId + virtualization.idSuffix);
                  atIdent = '@keyframes';
                } else {
                  atIdent = null;
                }
              } else {
                if (atIdent === '@import' && headerArray.length > 0) {
                  atIdent = null;
                  if ('function' === typeof continuation) {
                    var mediaQuery = sanitizeMediaQuery(headerArray.slice(1));
                    if (mediaQuery !== 'not all') {
                      ++importCount[0];
                      var placeholder = [];
                      safeCss.push(placeholder);
                      var cssUrl = safeUri(
                          resolveUri(baseUri, cssParseUri(headerArray[0])),
                          function(result) {
                            var sanitized = sanitizeStylesheetInternal(
                                cssUrl, result.html, virtualization,
                                naiveUriRewriter, naiveUriFetcher,
                                continuation, importCount);
                            --importCount[0];
                            var safeImportedCss = mediaQuery
                              ? {
                                toString: function () {
                                  return (
                                    '@media ' + mediaQuery + ' {'
                                    + sanitized.result + '}'
                                  );
                                }
                              }
                              : sanitized.result;
                            placeholder[0] = safeImportedCss;
                            continuation(safeImportedCss, !!importCount[0]);
                          },
                          naiveUriFetcher);
                    }
                  } else {
                    // TODO: Use a logger instead.
                    if (window.console) {
                      window.console.log(
                          '@import ' + headerArray.join(' ') + ' elided');
                    }
                  }
                }
              }
              elide = !atIdent;
              blockStack.push(atIdent);
            },
            'endAtrule': function () {
              blockStack.pop();
              if (!elide) {
                safeCss.push(';');
              }
              checkElide();
            },
            'startBlock': function () {
              // There are no bare blocks in CSS, so we do not change the
              // block stack here, but instead in the events that bracket
              // blocks.
              if (!elide) {
                safeCss.push('{');
              }
            },
            'endBlock': function () {
              if (!elide) {
                safeCss.push('}');
                elide = true;  // skip any semicolon from endAtRule.
              }
            },
            'startRuleset': function (selectorArray) {
              if (!elide) {
                var selector = void 0;
                if (blockStack[blockStack.length - 1] === '@keyframes') {
                  // Allow [from | to | <percentage>]
                  selector = selectorArray.join(' ')
                    .match(/^ *(?:from|to|\d+(?:\.\d+)?%) *(?:, *(?:from|to|\d+(?:\.\d+)?%) *)*$/i);
                  elide = !selector;
                  if (selector) { selector = selector[0].replace(/ +/g, ''); }
                } else {
                  var selectors = sanitizeCssSelectorList(
                      selectorArray, virtualization);
                  if (!selectors || !selectors.length) {
                    elide = true;
                  } else {
                    selector = selectors.join(', ');
                  }
                }
                if (!elide) {
                  safeCss.push(selector, '{');
                }
              }
              blockStack.push(null);
            },
            'endRuleset': function () {
              blockStack.pop();
              if (!elide) {
                safeCss.push('}');
              }
              checkElide();
            },
            'declaration': function (property, valueArray) {
              if (!elide) {
                var isImportant = false;
                var nValues = valueArray.length;
                if (nValues >= 2
                    && valueArray[nValues - 2] === '!'
                    && valueArray[nValues - 1].toLowerCase() === 'important') {
                  isImportant = true;
                  valueArray.length -= 2;
                }
                sanitizeCssProperty(
                    property, valueArray, naiveUriRewriter, baseUri,
                    virtualization.idSuffix);
                if (valueArray.length) {
                  safeCss.push(
                      property, ':', valueArray.join(' '),
                      isImportant ? ' !important;' : ';');
                }
              }
            }
          });
      function checkElide() {
        elide = blockStack.length && blockStack[blockStack.length-1] === null;
      }
      return {
        result : { toString: function () { return safeCss.join(''); } },
        moreToCome : !!importCount[0]
      };
    }

    sanitizeStylesheet = function (
        baseUri, cssText, virtualization, naiveUriRewriter) {
      return sanitizeStylesheetInternal(
          baseUri, cssText, virtualization,
          naiveUriRewriter, undefined, undefined).result.toString();
    };

    sanitizeStylesheetWithExternals = function (
        baseUri, cssText, virtualization, naiveUriRewriter, naiveUriFetcher,
        continuation) {
      return sanitizeStylesheetInternal(
          baseUri, cssText, virtualization,
          naiveUriRewriter, naiveUriFetcher, continuation);
    };
  })();
})();

/** Initialize CSS schema for parseCssDeclarations. */
/* Copyright Google Inc.
 * Licensed under the Apache Licence Version 2.0
 * Autogenerated at Mon Oct 23 15:31:24 PDT 2017
 * \@overrides window
 * \@provides cssSchema, CSS_PROP_BIT_QUANTITY, CSS_PROP_BIT_HASH_VALUE, CSS_PROP_BIT_NEGATIVE_QUANTITY, CSS_PROP_BIT_QSTRING, CSS_PROP_BIT_URL, CSS_PROP_BIT_UNRESERVED_WORD, CSS_PROP_BIT_UNICODE_RANGE, CSS_PROP_BIT_GLOBAL_NAME, CSS_PROP_BIT_PROPERTY_NAME */
/**
 * @const
 * @type {number}
 */
var CSS_PROP_BIT_QUANTITY = 1;
/**
 * @const
 * @type {number}
 */
var CSS_PROP_BIT_HASH_VALUE = 2;
/**
 * @const
 * @type {number}
 */
var CSS_PROP_BIT_NEGATIVE_QUANTITY = 4;
/**
 * @const
 * @type {number}
 */
var CSS_PROP_BIT_QSTRING = 8;
/**
 * @const
 * @type {number}
 */
var CSS_PROP_BIT_URL = 16;
/**
 * @const
 * @type {number}
 */
var CSS_PROP_BIT_UNRESERVED_WORD = 64;
/**
 * @const
 * @type {number}
 */
var CSS_PROP_BIT_UNICODE_RANGE = 128;
/**
 * @const
 * @type {number}
 */
var CSS_PROP_BIT_GLOBAL_NAME = 512;
/**
 * @const
 * @type {number}
 */
var CSS_PROP_BIT_PROPERTY_NAME = 1024;
var cssSchema = (function () {
    var L = [ [ 'aliceblue', 'antiquewhite', 'aqua', 'aquamarine', 'azure',
        'beige', 'bisque', 'black', 'blanchedalmond', 'blue', 'blueviolet',
        'brown', 'burlywood', 'cadetblue', 'chartreuse', 'chocolate', 'coral',
        'cornflowerblue', 'cornsilk', 'crimson', 'currentcolor', 'cyan',
        'darkblue', 'darkcyan', 'darkgoldenrod', 'darkgray', 'darkgreen',
        'darkgrey', 'darkkhaki', 'darkmagenta', 'darkolivegreen', 'darkorange',
        'darkorchid', 'darkred', 'darksalmon', 'darkseagreen', 'darkslateblue',
        'darkslategray', 'darkslategrey', 'darkturquoise', 'darkviolet',
        'deeppink', 'deepskyblue', 'dimgray', 'dimgrey', 'dodgerblue',
        'firebrick', 'floralwhite', 'forestgreen', 'fuchsia', 'gainsboro',
        'ghostwhite', 'gold', 'goldenrod', 'gray', 'green', 'greenyellow',
        'grey', 'honeydew', 'hotpink', 'indianred', 'indigo', 'ivory', 'khaki',
        'lavender', 'lavenderblush', 'lawngreen', 'lemonchiffon', 'lightblue',
        'lightcoral', 'lightcyan', 'lightgoldenrodyellow', 'lightgray',
        'lightgreen', 'lightgrey', 'lightpink', 'lightsalmon', 'lightseagreen',
        'lightskyblue', 'lightslategray', 'lightslategrey', 'lightsteelblue',
        'lightyellow', 'lime', 'limegreen', 'linen', 'magenta', 'maroon',
        'mediumaquamarine', 'mediumblue', 'mediumorchid', 'mediumpurple',
        'mediumseagreen', 'mediumslateblue', 'mediumspringgreen',
        'mediumturquoise', 'mediumvioletred', 'midnightblue', 'mintcream',
        'mistyrose', 'moccasin', 'navajowhite', 'navy', 'oldlace', 'olive',
        'olivedrab', 'orange', 'orangered', 'orchid', 'palegoldenrod',
        'palegreen', 'paleturquoise', 'palevioletred', 'papayawhip',
        'peachpuff', 'peru', 'pink', 'plum', 'powderblue', 'purple',
        'rebeccapurple', 'red', 'rosybrown', 'royalblue', 'saddlebrown',
        'salmon', 'sandybrown', 'seagreen', 'seashell', 'sienna', 'silver',
        'skyblue', 'slateblue', 'slategray', 'slategrey', 'snow',
        'springgreen', 'steelblue', 'tan', 'teal', 'thistle', 'tomato',
        'transparent', 'turquoise', 'violet', 'wheat', 'white', 'whitesmoke',
        'yellow', 'yellowgreen' ], [ 'all-scroll', 'col-resize', 'crosshair',
        'default', 'e-resize', 'hand', 'help', 'move', 'n-resize', 'ne-resize',
        'no-drop', 'not-allowed', 'nw-resize', 'pointer', 'progress',
        'row-resize', 's-resize', 'se-resize', 'sw-resize', 'text',
        'vertical-text', 'w-resize', 'wait' ], [ 'color', 'color-burn',
        'color-dodge', 'darken', 'difference', 'exclusion', 'hard-light',
        'hue', 'lighten', 'luminosity', 'multiply', 'overlay', 'saturation',
        'screen', 'soft-light' ], [ 'armenian', 'decimal',
        'decimal-leading-zero', 'disc', 'georgian', 'lower-alpha',
        'lower-greek', 'lower-latin', 'lower-roman', 'square', 'upper-alpha',
        'upper-latin', 'upper-roman' ], [ '100', '200', '300', '400', '500',
        '600', '700', '800', '900', 'bold', 'bolder', 'lighter' ], [
        'block-level', 'inline-level', 'table-caption', 'table-cell',
        'table-column', 'table-column-group', 'table-footer-group',
        'table-header-group', 'table-row', 'table-row-group' ], [ 'condensed',
        'expanded', 'extra-condensed', 'extra-expanded', 'narrower',
        'semi-condensed', 'semi-expanded', 'ultra-condensed', 'ultra-expanded',
        'wider' ], [ 'inherit', 'inline', 'inline-block', 'inline-box',
        'inline-flex', 'inline-grid', 'inline-list-item', 'inline-stack',
        'inline-table', 'run-in' ], [ 'behind', 'center-left', 'center-right',
        'far-left', 'far-right', 'left-side', 'leftwards', 'right-side',
        'rightwards' ], [ 'large', 'larger', 'small', 'smaller', 'x-large',
        'x-small', 'xx-large', 'xx-small' ], [ 'dashed', 'dotted', 'double',
        'groove', 'outset', 'ridge', 'solid' ], [ 'ease', 'ease-in',
        'ease-in-out', 'ease-out', 'linear', 'step-end', 'step-start' ], [
        'at', 'closest-corner', 'closest-side', 'ellipse', 'farthest-corner',
        'farthest-side' ], [ 'baseline', 'middle', 'sub', 'super',
        'text-bottom', 'text-top' ], [ 'caption', 'icon', 'menu',
        'message-box', 'small-caption', 'status-bar' ], [ 'fast', 'faster',
        'slow', 'slower', 'x-fast', 'x-slow' ], [ 'above', 'below', 'higher',
        'level', 'lower' ], [ 'cursive', 'fantasy', 'monospace', 'sans-serif',
        'serif' ], [ 'loud', 'silent', 'soft', 'x-loud', 'x-soft' ], [
        'no-repeat', 'repeat-x', 'repeat-y', 'round', 'space' ], [ 'blink',
        'line-through', 'overline', 'underline' ], [ 'block', 'flex', 'grid',
        'table' ], [ 'high', 'low', 'x-high', 'x-low' ], [ 'nowrap', 'pre',
        'pre-line', 'pre-wrap' ], [ 'absolute', 'relative', 'static' ], [
        'alternate', 'alternate-reverse', 'reverse' ], [ 'border-box',
        'content-box', 'padding-box' ], [ 'capitalize', 'lowercase',
        'uppercase' ], [ 'child', 'female', 'male' ], [ '=', 'opacity' ], [
        'backwards', 'forwards' ], [ 'bidi-override', 'embed' ], [ 'bottom',
        'top' ], [ 'break-all', 'keep-all' ], [ 'clip', 'ellipsis' ], [
        'contain', 'cover' ], [ 'continuous', 'digits' ], [ 'end', 'start' ], [
        'flat', 'preserve-3d' ], [ 'hide', 'show' ], [ 'horizontal', 'vertical'
      ], [ 'inside', 'outside' ], [ 'italic', 'oblique' ], [ 'left', 'right' ],
      [ 'ltr', 'rtl' ], [ 'no-content', 'no-display' ], [ 'paused', 'running' ]
      , [ 'suppress', 'unrestricted' ], [ 'thick', 'thin' ], [ ',' ], [ '/' ],
      [ 'all' ], [ 'always' ], [ 'auto' ], [ 'avoid' ], [ 'both' ], [
        'break-word' ], [ 'center' ], [ 'circle' ], [ 'code' ], [ 'collapse' ],
      [ 'contents' ], [ 'fixed' ], [ 'hidden' ], [ 'infinite' ], [ 'inset' ], [
        'invert' ], [ 'justify' ], [ 'list-item' ], [ 'local' ], [ 'medium' ],
      [ 'mix' ], [ 'none' ], [ 'normal' ], [ 'once' ], [ 'repeat' ], [ 'scroll'
      ], [ 'separate' ], [ 'small-caps' ], [ 'spell-out' ], [ 'to' ], [
        'visible' ] ];
    var schema = {
      'animation': {
        'cssPropBits': 517,
        'cssLitGroup': [ L[ 11 ], L[ 25 ], L[ 30 ], L[ 46 ], L[ 49 ], L[ 55 ],
          L[ 64 ], L[ 72 ], L[ 73 ] ],
        'cssFns': [ 'cubic-bezier()', 'steps()' ]
      },
      'animation-delay': {
        'cssPropBits': 5,
        'cssLitGroup': [ L[ 49 ] ],
        'cssFns': [ ]
      },
      'animation-direction': {
        'cssPropBits': 0,
        'cssLitGroup': [ L[ 25 ], L[ 49 ], L[ 73 ] ],
        'cssFns': [ ]
      },
      'animation-duration': 'animation-delay',
      'animation-fill-mode': {
        'cssPropBits': 0,
        'cssLitGroup': [ L[ 30 ], L[ 49 ], L[ 55 ], L[ 72 ] ],
        'cssFns': [ ]
      },
      'animation-iteration-count': {
        'cssPropBits': 5,
        'cssLitGroup': [ L[ 49 ], L[ 64 ] ],
        'cssFns': [ ]
      },
      'animation-name': {
        'cssPropBits': 512,
        'cssLitGroup': [ L[ 49 ], L[ 72 ] ],
        'cssFns': [ ]
      },
      'animation-play-state': {
        'cssPropBits': 0,
        'cssLitGroup': [ L[ 46 ], L[ 49 ] ],
        'cssFns': [ ]
      },
      'animation-timing-function': {
        'cssPropBits': 0,
        'cssLitGroup': [ L[ 11 ], L[ 49 ] ],
        'cssFns': [ 'cubic-bezier()', 'steps()' ]
      },
      'appearance': {
        'cssPropBits': 0,
        'cssLitGroup': [ L[ 72 ] ],
        'cssFns': [ ]
      },
      'azimuth': {
        'cssPropBits': 5,
        'cssLitGroup': [ L[ 8 ], L[ 43 ], L[ 57 ] ],
        'cssFns': [ ]
      },
      'backface-visibility': {
        'cssPropBits': 0,
        'cssLitGroup': [ L[ 60 ], L[ 63 ], L[ 81 ] ],
        'cssFns': [ ]
      },
      'background': {
        'cssPropBits': 23,
        'cssLitGroup': [ L[ 0 ], L[ 19 ], L[ 26 ], L[ 32 ], L[ 35 ], L[ 43 ],
          L[ 49 ], L[ 50 ], L[ 53 ], L[ 57 ], L[ 62 ], L[ 69 ], L[ 72 ], L[ 75
          ], L[ 76 ] ],
        'cssFns': [ 'hsl()', 'hsla()', 'image()', 'linear-gradient()',
          'radial-gradient()', 'repeating-linear-gradient()',
          'repeating-radial-gradient()', 'rgb()', 'rgba()' ]
      },
      'background-attachment': {
        'cssPropBits': 0,
        'cssLitGroup': [ L[ 49 ], L[ 62 ], L[ 69 ], L[ 76 ] ],
        'cssFns': [ ]
      },
      'background-color': {
        'cssPropBits': 2,
        'cssLitGroup': [ L[ 0 ] ],
        'cssFns': [ 'hsl()', 'hsla()', 'rgb()', 'rgba()' ]
      },
      'background-image': {
        'cssPropBits': 16,
        'cssLitGroup': [ L[ 49 ], L[ 72 ] ],
        'cssFns': [ 'image()', 'linear-gradient()', 'radial-gradient()',
          'repeating-linear-gradient()', 'repeating-radial-gradient()' ]
      },
      'background-position': {
        'cssPropBits': 5,
        'cssLitGroup': [ L[ 32 ], L[ 43 ], L[ 49 ], L[ 57 ] ],
        'cssFns': [ ]
      },
      'background-repeat': {
        'cssPropBits': 0,
        'cssLitGroup': [ L[ 19 ], L[ 49 ], L[ 75 ] ],
        'cssFns': [ ]
      },
      'background-size': {
        'cssPropBits': 5,
        'cssLitGroup': [ L[ 35 ], L[ 49 ], L[ 53 ] ],
        'cssFns': [ ]
      },
      'border': {
        'cssPropBits': 7,
        'cssLitGroup': [ L[ 0 ], L[ 10 ], L[ 48 ], L[ 63 ], L[ 65 ], L[ 70 ],
          L[ 72 ] ],
        'cssFns': [ 'hsl()', 'hsla()', 'rgb()', 'rgba()' ]
      },
      'border-bottom': 'border',
      'border-bottom-color': 'background-color',
      'border-bottom-left-radius': {
        'cssPropBits': 5,
        'cssFns': [ ]
      },
      'border-bottom-right-radius': 'border-bottom-left-radius',
      'border-bottom-style': {
        'cssPropBits': 0,
        'cssLitGroup': [ L[ 10 ], L[ 63 ], L[ 65 ], L[ 72 ] ],
        'cssFns': [ ]
      },
      'border-bottom-width': {
        'cssPropBits': 5,
        'cssLitGroup': [ L[ 48 ], L[ 70 ] ],
        'cssFns': [ ]
      },
      'border-collapse': {
        'cssPropBits': 0,
        'cssLitGroup': [ L[ 60 ], L[ 77 ] ],
        'cssFns': [ ]
      },
      'border-color': 'background-color',
      'border-left': 'border',
      'border-left-color': 'background-color',
      'border-left-style': 'border-bottom-style',
      'border-left-width': 'border-bottom-width',
      'border-radius': {
        'cssPropBits': 5,
        'cssLitGroup': [ L[ 50 ] ],
        'cssFns': [ ]
      },
      'border-right': 'border',
      'border-right-color': 'background-color',
      'border-right-style': 'border-bottom-style',
      'border-right-width': 'border-bottom-width',
      'border-spacing': 'border-bottom-left-radius',
      'border-style': 'border-bottom-style',
      'border-top': 'border',
      'border-top-color': 'background-color',
      'border-top-left-radius': 'border-bottom-left-radius',
      'border-top-right-radius': 'border-bottom-left-radius',
      'border-top-style': 'border-bottom-style',
      'border-top-width': 'border-bottom-width',
      'border-width': 'border-bottom-width',
      'bottom': {
        'cssPropBits': 5,
        'cssLitGroup': [ L[ 53 ] ],
        'cssFns': [ ]
      },
      'box': {
        'cssPropBits': 0,
        'cssLitGroup': [ L[ 61 ], L[ 72 ], L[ 73 ] ],
        'cssFns': [ ]
      },
      'box-shadow': {
        'cssPropBits': 7,
        'cssLitGroup': [ L[ 0 ], L[ 49 ], L[ 65 ], L[ 72 ] ],
        'cssFns': [ 'hsl()', 'hsla()', 'rgb()', 'rgba()' ]
      },
      'box-sizing': {
        'cssPropBits': 0,
        'cssLitGroup': [ L[ 26 ] ],
        'cssFns': [ ]
      },
      'caption-side': {
        'cssPropBits': 0,
        'cssLitGroup': [ L[ 32 ] ],
        'cssFns': [ ]
      },
      'clear': {
        'cssPropBits': 0,
        'cssLitGroup': [ L[ 43 ], L[ 55 ], L[ 72 ] ],
        'cssFns': [ ]
      },
      'clip': {
        'cssPropBits': 0,
        'cssLitGroup': [ L[ 53 ] ],
        'cssFns': [ 'rect()' ]
      },
      'color': 'background-color',
      'content': {
        'cssPropBits': 8,
        'cssLitGroup': [ L[ 72 ], L[ 73 ] ],
        'cssFns': [ ]
      },
      'cue': {
        'cssPropBits': 16,
        'cssLitGroup': [ L[ 72 ] ],
        'cssFns': [ ]
      },
      'cue-after': 'cue',
      'cue-before': 'cue',
      'cursor': {
        'cssPropBits': 16,
        'cssLitGroup': [ L[ 1 ], L[ 49 ], L[ 53 ] ],
        'cssFns': [ ]
      },
      'direction': {
        'cssPropBits': 0,
        'cssLitGroup': [ L[ 44 ] ],
        'cssFns': [ ]
      },
      'display': {
        'cssPropBits': 0,
        'cssLitGroup': [ L[ 5 ], L[ 7 ], L[ 21 ], L[ 53 ], L[ 68 ], L[ 72 ] ],
        'cssFns': [ ]
      },
      'display-extras': {
        'cssPropBits': 0,
        'cssLitGroup': [ L[ 68 ], L[ 72 ] ],
        'cssFns': [ ]
      },
      'display-inside': {
        'cssPropBits': 0,
        'cssLitGroup': [ L[ 21 ], L[ 53 ] ],
        'cssFns': [ ]
      },
      'display-outside': {
        'cssPropBits': 0,
        'cssLitGroup': [ L[ 5 ], L[ 72 ] ],
        'cssFns': [ ]
      },
      'elevation': {
        'cssPropBits': 5,
        'cssLitGroup': [ L[ 16 ] ],
        'cssFns': [ ]
      },
      'empty-cells': {
        'cssPropBits': 0,
        'cssLitGroup': [ L[ 39 ] ],
        'cssFns': [ ]
      },
      'filter': {
        'cssPropBits': 0,
        'cssFns': [ 'alpha()' ]
      },
      'float': {
        'cssPropBits': 0,
        'cssLitGroup': [ L[ 43 ], L[ 72 ] ],
        'cssFns': [ ]
      },
      'font': {
        'cssPropBits': 73,
        'cssLitGroup': [ L[ 4 ], L[ 9 ], L[ 14 ], L[ 17 ], L[ 42 ], L[ 49 ], L[
            50 ], L[ 70 ], L[ 73 ], L[ 78 ] ],
        'cssFns': [ ]
      },
      'font-family': {
        'cssPropBits': 72,
        'cssLitGroup': [ L[ 17 ], L[ 49 ] ],
        'cssFns': [ ]
      },
      'font-size': {
        'cssPropBits': 1,
        'cssLitGroup': [ L[ 9 ], L[ 70 ] ],
        'cssFns': [ ]
      },
      'font-stretch': {
        'cssPropBits': 0,
        'cssLitGroup': [ L[ 6 ], L[ 73 ] ],
        'cssFns': [ ]
      },
      'font-style': {
        'cssPropBits': 0,
        'cssLitGroup': [ L[ 42 ], L[ 73 ] ],
        'cssFns': [ ]
      },
      'font-variant': {
        'cssPropBits': 0,
        'cssLitGroup': [ L[ 73 ], L[ 78 ] ],
        'cssFns': [ ]
      },
      'font-weight': {
        'cssPropBits': 0,
        'cssLitGroup': [ L[ 4 ], L[ 73 ] ],
        'cssFns': [ ]
      },
      'height': 'bottom',
      'left': 'bottom',
      'letter-spacing': {
        'cssPropBits': 5,
        'cssLitGroup': [ L[ 73 ] ],
        'cssFns': [ ]
      },
      'line-height': {
        'cssPropBits': 1,
        'cssLitGroup': [ L[ 73 ] ],
        'cssFns': [ ]
      },
      'list-style': {
        'cssPropBits': 16,
        'cssLitGroup': [ L[ 3 ], L[ 41 ], L[ 58 ], L[ 72 ] ],
        'cssFns': [ 'image()', 'linear-gradient()', 'radial-gradient()',
          'repeating-linear-gradient()', 'repeating-radial-gradient()' ]
      },
      'list-style-image': {
        'cssPropBits': 16,
        'cssLitGroup': [ L[ 72 ] ],
        'cssFns': [ 'image()', 'linear-gradient()', 'radial-gradient()',
          'repeating-linear-gradient()', 'repeating-radial-gradient()' ]
      },
      'list-style-position': {
        'cssPropBits': 0,
        'cssLitGroup': [ L[ 41 ] ],
        'cssFns': [ ]
      },
      'list-style-type': {
        'cssPropBits': 0,
        'cssLitGroup': [ L[ 3 ], L[ 58 ], L[ 72 ] ],
        'cssFns': [ ]
      },
      'margin': 'bottom',
      'margin-bottom': 'bottom',
      'margin-left': 'bottom',
      'margin-right': 'bottom',
      'margin-top': 'bottom',
      'max-height': {
        'cssPropBits': 1,
        'cssLitGroup': [ L[ 53 ], L[ 72 ] ],
        'cssFns': [ ]
      },
      'max-width': 'max-height',
      'min-height': {
        'cssPropBits': 1,
        'cssLitGroup': [ L[ 53 ] ],
        'cssFns': [ ]
      },
      'min-width': 'min-height',
      'mix-blend-mode': {
        'cssPropBits': 0,
        'cssLitGroup': [ L[ 2 ], L[ 73 ] ],
        'cssFns': [ ]
      },
      'opacity': {
        'cssPropBits': 1,
        'cssFns': [ ]
      },
      'outline': {
        'cssPropBits': 7,
        'cssLitGroup': [ L[ 0 ], L[ 10 ], L[ 48 ], L[ 63 ], L[ 65 ], L[ 66 ],
          L[ 70 ], L[ 72 ] ],
        'cssFns': [ 'hsl()', 'hsla()', 'rgb()', 'rgba()' ]
      },
      'outline-color': {
        'cssPropBits': 2,
        'cssLitGroup': [ L[ 0 ], L[ 66 ] ],
        'cssFns': [ 'hsl()', 'hsla()', 'rgb()', 'rgba()' ]
      },
      'outline-style': 'border-bottom-style',
      'outline-width': 'border-bottom-width',
      'overflow': {
        'cssPropBits': 0,
        'cssLitGroup': [ L[ 53 ], L[ 63 ], L[ 76 ], L[ 81 ] ],
        'cssFns': [ ]
      },
      'overflow-wrap': {
        'cssPropBits': 0,
        'cssLitGroup': [ L[ 56 ], L[ 73 ] ],
        'cssFns': [ ]
      },
      'overflow-x': {
        'cssPropBits': 0,
        'cssLitGroup': [ L[ 45 ], L[ 53 ], L[ 63 ], L[ 76 ], L[ 81 ] ],
        'cssFns': [ ]
      },
      'overflow-y': 'overflow-x',
      'padding': 'opacity',
      'padding-bottom': 'opacity',
      'padding-left': 'opacity',
      'padding-right': 'opacity',
      'padding-top': 'opacity',
      'page-break-after': {
        'cssPropBits': 0,
        'cssLitGroup': [ L[ 43 ], L[ 52 ], L[ 53 ], L[ 54 ] ],
        'cssFns': [ ]
      },
      'page-break-before': 'page-break-after',
      'page-break-inside': {
        'cssPropBits': 0,
        'cssLitGroup': [ L[ 53 ], L[ 54 ] ],
        'cssFns': [ ]
      },
      'pause': 'border-bottom-left-radius',
      'pause-after': 'border-bottom-left-radius',
      'pause-before': 'border-bottom-left-radius',
      'perspective': {
        'cssPropBits': 5,
        'cssLitGroup': [ L[ 72 ] ],
        'cssFns': [ ]
      },
      'perspective-origin': {
        'cssPropBits': 5,
        'cssLitGroup': [ L[ 32 ], L[ 43 ], L[ 57 ] ],
        'cssFns': [ ]
      },
      'pitch': {
        'cssPropBits': 5,
        'cssLitGroup': [ L[ 22 ], L[ 70 ] ],
        'cssFns': [ ]
      },
      'pitch-range': 'border-bottom-left-radius',
      'play-during': {
        'cssPropBits': 16,
        'cssLitGroup': [ L[ 53 ], L[ 71 ], L[ 72 ], L[ 75 ] ],
        'cssFns': [ ]
      },
      'position': {
        'cssPropBits': 0,
        'cssLitGroup': [ L[ 24 ] ],
        'cssFns': [ ]
      },
      'quotes': {
        'cssPropBits': 8,
        'cssLitGroup': [ L[ 72 ] ],
        'cssFns': [ ]
      },
      'resize': {
        'cssPropBits': 0,
        'cssLitGroup': [ L[ 40 ], L[ 55 ], L[ 72 ] ],
        'cssFns': [ ]
      },
      'richness': 'border-bottom-left-radius',
      'right': 'bottom',
      'speak': {
        'cssPropBits': 0,
        'cssLitGroup': [ L[ 72 ], L[ 73 ], L[ 79 ] ],
        'cssFns': [ ]
      },
      'speak-header': {
        'cssPropBits': 0,
        'cssLitGroup': [ L[ 52 ], L[ 74 ] ],
        'cssFns': [ ]
      },
      'speak-numeral': {
        'cssPropBits': 0,
        'cssLitGroup': [ L[ 36 ] ],
        'cssFns': [ ]
      },
      'speak-punctuation': {
        'cssPropBits': 0,
        'cssLitGroup': [ L[ 59 ], L[ 72 ] ],
        'cssFns': [ ]
      },
      'speech-rate': {
        'cssPropBits': 5,
        'cssLitGroup': [ L[ 15 ], L[ 70 ] ],
        'cssFns': [ ]
      },
      'stress': 'border-bottom-left-radius',
      'table-layout': {
        'cssPropBits': 0,
        'cssLitGroup': [ L[ 53 ], L[ 62 ] ],
        'cssFns': [ ]
      },
      'text-align': {
        'cssPropBits': 0,
        'cssLitGroup': [ L[ 43 ], L[ 57 ], L[ 67 ] ],
        'cssFns': [ ]
      },
      'text-decoration': {
        'cssPropBits': 0,
        'cssLitGroup': [ L[ 20 ], L[ 72 ] ],
        'cssFns': [ ]
      },
      'text-indent': 'border-bottom-left-radius',
      'text-overflow': {
        'cssPropBits': 8,
        'cssLitGroup': [ L[ 34 ] ],
        'cssFns': [ ]
      },
      'text-shadow': 'box-shadow',
      'text-transform': {
        'cssPropBits': 0,
        'cssLitGroup': [ L[ 27 ], L[ 72 ] ],
        'cssFns': [ ]
      },
      'text-wrap': {
        'cssPropBits': 0,
        'cssLitGroup': [ L[ 47 ], L[ 72 ], L[ 73 ] ],
        'cssFns': [ ]
      },
      'top': 'bottom',
      'transform': {
        'cssPropBits': 0,
        'cssLitGroup': [ L[ 72 ] ],
        'cssFns': [ 'matrix()', 'perspective()', 'rotate()', 'rotate3d()',
          'rotatex()', 'rotatey()', 'rotatez()', 'scale()', 'scale3d()',
          'scalex()', 'scaley()', 'scalez()', 'skew()', 'skewx()', 'skewy()',
          'translate()', 'translate3d()', 'translatex()', 'translatey()',
          'translatez()' ]
      },
      'transform-origin': 'perspective-origin',
      'transform-style': {
        'cssPropBits': 0,
        'cssLitGroup': [ L[ 38 ] ],
        'cssFns': [ ]
      },
      'transition': {
        'cssPropBits': 1029,
        'cssLitGroup': [ L[ 11 ], L[ 49 ], L[ 51 ], L[ 72 ] ],
        'cssFns': [ 'cubic-bezier()', 'steps()' ]
      },
      'transition-delay': 'animation-delay',
      'transition-duration': 'animation-delay',
      'transition-property': {
        'cssPropBits': 1024,
        'cssLitGroup': [ L[ 49 ], L[ 51 ] ],
        'cssFns': [ ]
      },
      'transition-timing-function': 'animation-timing-function',
      'unicode-bidi': {
        'cssPropBits': 0,
        'cssLitGroup': [ L[ 31 ], L[ 73 ] ],
        'cssFns': [ ]
      },
      'vertical-align': {
        'cssPropBits': 5,
        'cssLitGroup': [ L[ 13 ], L[ 32 ] ],
        'cssFns': [ ]
      },
      'visibility': 'backface-visibility',
      'voice-family': {
        'cssPropBits': 8,
        'cssLitGroup': [ L[ 28 ], L[ 49 ] ],
        'cssFns': [ ]
      },
      'volume': {
        'cssPropBits': 1,
        'cssLitGroup': [ L[ 18 ], L[ 70 ] ],
        'cssFns': [ ]
      },
      'white-space': {
        'cssPropBits': 0,
        'cssLitGroup': [ L[ 23 ], L[ 73 ] ],
        'cssFns': [ ]
      },
      'width': 'min-height',
      'word-break': {
        'cssPropBits': 0,
        'cssLitGroup': [ L[ 33 ], L[ 73 ] ],
        'cssFns': [ ]
      },
      'word-spacing': 'letter-spacing',
      'word-wrap': 'overflow-wrap',
      'z-index': 'bottom',
      'zoom': 'line-height',
      'cubic-bezier()': 'animation-delay',
      'steps()': {
        'cssPropBits': 5,
        'cssLitGroup': [ L[ 37 ], L[ 49 ] ],
        'cssFns': [ ]
      },
      'hsl()': 'animation-delay',
      'hsla()': 'animation-delay',
      'image()': {
        'cssPropBits': 18,
        'cssLitGroup': [ L[ 0 ], L[ 49 ] ],
        'cssFns': [ 'hsl()', 'hsla()', 'rgb()', 'rgba()' ]
      },
      'linear-gradient()': {
        'cssPropBits': 7,
        'cssLitGroup': [ L[ 0 ], L[ 32 ], L[ 43 ], L[ 49 ], L[ 80 ] ],
        'cssFns': [ 'hsl()', 'hsla()', 'rgb()', 'rgba()' ]
      },
      'radial-gradient()': {
        'cssPropBits': 7,
        'cssLitGroup': [ L[ 0 ], L[ 12 ], L[ 32 ], L[ 43 ], L[ 49 ], L[ 57 ],
          L[ 58 ] ],
        'cssFns': [ 'hsl()', 'hsla()', 'rgb()', 'rgba()' ]
      },
      'repeating-linear-gradient()': 'linear-gradient()',
      'repeating-radial-gradient()': 'radial-gradient()',
      'rgb()': {
        'cssPropBits': 1,
        'cssLitGroup': [ L[ 49 ] ],
        'cssFns': [ ]
      },
      'rgba()': 'rgb()',
      'rect()': {
        'cssPropBits': 5,
        'cssLitGroup': [ L[ 49 ], L[ 53 ] ],
        'cssFns': [ ]
      },
      'alpha()': {
        'cssPropBits': 1,
        'cssLitGroup': [ L[ 29 ] ],
        'cssFns': [ ]
      },
      'matrix()': 'animation-delay',
      'perspective()': 'border-bottom-left-radius',
      'rotate()': 'border-bottom-left-radius',
      'rotate3d()': 'animation-delay',
      'rotatex()': 'border-bottom-left-radius',
      'rotatey()': 'border-bottom-left-radius',
      'rotatez()': 'border-bottom-left-radius',
      'scale()': 'animation-delay',
      'scale3d()': 'animation-delay',
      'scalex()': 'border-bottom-left-radius',
      'scaley()': 'border-bottom-left-radius',
      'scalez()': 'border-bottom-left-radius',
      'skew()': 'animation-delay',
      'skewx()': 'border-bottom-left-radius',
      'skewy()': 'border-bottom-left-radius',
      'translate()': 'animation-delay',
      'translate3d()': 'animation-delay',
      'translatex()': 'border-bottom-left-radius',
      'translatey()': 'border-bottom-left-radius',
      'translatez()': 'border-bottom-left-radius'
    };
    if (true) {
      for (var key in schema) {
        if ('string' === typeof schema[ key ] &&
          Object.hasOwnProperty.call(schema, key)) {
          schema[ key ] = schema[ schema[ key ] ];
        }
      }
    }
    return schema;
  })();

/** Initialize parseCssDeclarations for parsing inline styles. */
(function () {
  // stylesheet  : [ CDO | CDC | S | statement ]*;
  parseCssStylesheet = function(cssText, handler) {
    var toks = lexCss(cssText);
    if (handler['startStylesheet']) { handler['startStylesheet'](); }
    for (var i = 0, n = toks.length; i < n;) {
      // CDO and CDC ("<!--" and "-->") are converted to space by the lexer.
      i = toks[i] === ' ' ? i+1 : statement(toks, i, n, handler);
    }
    if (handler['endStylesheet']) { handler['endStylesheet'](); }
  };

  // statement   : ruleset | at-rule;
  function statement(toks, i, n, handler) {
    if (i < n) {
      var tok = toks[i];
      if (tok.charAt(0) === '@') {
        return atrule(toks, i, n, handler, true);
      } else {
        return ruleset(toks, i, n, handler);
      }
    } else {
      return i;
    }
  }

  // at-rule     : ATKEYWORD S* any* [ block | ';' S* ];
  function atrule(toks, i, n, handler, blockok) {
    var start = i++;
    while (i < n && toks[i] !== '{' && toks[i] !== ';') {
      ++i;
    }
    if (i < n && (blockok || toks[i] === ';')) {
      var s = start+1, e = i;
      if (s < n && toks[s] === ' ') { ++s; }
      if (e > s && toks[e-1] === ' ') { --e; }
      if (handler['startAtrule']) {
        handler['startAtrule'](toks[start].toLowerCase(), toks.slice(s, e));
      }
      i = (toks[i] === '{')
          ? block(toks, i, n, handler)
          : i+1;  // Skip over ';'
      if (handler['endAtrule']) {
        handler['endAtrule']();
      }
    }
    // Else we reached end of input or are missing a semicolon.
    // Drop the rule on the floor.
    return i;
  }

  // block       : '{' S* [ any | block | ATKEYWORD S* | ';' S* ]* '}' S*;
   // Assumes the leading '{' has been verified by callers.
  function block(toks, i, n, handler) {
    ++i; //  skip over '{'
    if (handler['startBlock']) { handler['startBlock'](); }
    while (i < n) {
      var ch = toks[i].charAt(0);
      if (ch == '}') {
        ++i;
        break;
      }
      if (ch === ' ' || ch === ';') {
        i = i+1;
      } else if (ch === '@') {
        i = atrule(toks, i, n, handler, false);
      } else if (ch === '{') {
        i = block(toks, i, n, handler);
      } else {
        // Instead of using (any* block) to subsume ruleset we allow either
        // blocks or rulesets with a non-blank selector.
        // This is more restrictive but does not require atrule specific
        // parse tree fixup to realize that the contents of the block in
        //    @media print { ... }
        // is a ruleset.  We just don't care about any block carrying at-rules
        // whose body content is not ruleset content.
        i = ruleset(toks, i, n, handler);
      }
    }
    if (handler['endBlock']) { handler['endBlock'](); }
    return i;
  }

  // ruleset    : selector? '{' S* declaration? [ ';' S* declaration? ]* '}' S*;
  function ruleset(toks, i, n, handler) {
    // toks[s:e] are the selector tokens including internal whitespace.
    var s = i, e = selector(toks, i, n, true);
    if (e < 0) {
      // Skip malformed content per selector calling convention.
      e = ~e;
      // Make sure we skip at least one token.
      return e === s ? e+1 : e;
    }
    var tok = toks[e];
    if (tok !== '{') {
      // Make sure we skip at least one token.
      return e === s ? e+1 : e;
    }
    i = e+1;  // Skip over '{'
    // Don't include any trailing space in the selector slice.
    if (e > s && toks[e-1] === ' ') { --e; }
    if (handler['startRuleset']) {
      handler['startRuleset'](toks.slice(s, e));
    }
    while (i < n) {
      tok = toks[i];
      if (tok === '}') {
        ++i;
        break;
      }
      if (tok === ' ') {
        i = i+1;
      } else {
        i = declaration(toks, i, n, handler);
      }
    }
    if (handler['endRuleset']) {
      handler['endRuleset']();
    }
    return i;
  }

  // selector    : any+;
  // any         : [ IDENT | NUMBER | PERCENTAGE | DIMENSION | STRING
  //               | DELIM | URI | HASH | UNICODE-RANGE | INCLUDES
  //               | FUNCTION S* any* ')' | DASHMATCH | '(' S* any* ')'
  //               | '[' S* any* ']' ] S*;
  // A negative return value, rv, indicates the selector was malformed and
  // the index at which we stopped is ~rv.
  function selector(toks, i, n, allowSemi) {
    var s = i;
    // The definition of any above can be summed up as
    //   "any run of token except ('[', ']', '(', ')', ':', ';', '{', '}')
    //    or nested runs of parenthesized tokens or square bracketed tokens".
    // Spaces are significant in the selector.
    // Selector is used as (selector?) so the below looks for (any*) for
    // simplicity.
    var tok;
    // Keeping a stack pointer actually causes this to minify better since
    // ".length" and ".push" are a lo of chars.
    var brackets = [], stackLast = -1;
    for (;i < n; ++i) {
      tok = toks[i].charAt(0);
      if (tok === '[' || tok === '(') {
        brackets[++stackLast] = tok;
      } else if ((tok === ']' && brackets[stackLast] === '[') ||
                 (tok === ')' && brackets[stackLast] === '(')) {
        --stackLast;
      } else if (tok === '{' || tok === '}' || tok === ';' || tok === '@'
                 || (tok === ':' && !allowSemi)) {
        break;
      }
    }
    if (stackLast >= 0) {
      // Returns the bitwise inverse of i+1 to indicate an error in the
      // token stream so that clients can ignore it.
      i = ~(i+1);
    }
    return i;
  }

  var ident = /^-?[a-z]/i;

  function skipDeclaration(toks, i, n) {
    // TODO(felix8a): maybe skip balanced pairs of {}
    while (i < n && toks[i] !== ';' && toks[i] !== '}') { ++i; }
    return i < n && toks[i] === ';' ? i+1 : i;
  }

  // declaration : property ':' S* value;
  // property    : IDENT S*;
  // value       : [ any | block | ATKEYWORD S* ]+;
  function declaration(toks, i, n, handler) {
    var property = toks[i++];
    if (!ident.test(property)) {
      return skipDeclaration(toks, i, n);
    }
    var tok;
    if (i < n && toks[i] === ' ') { ++i; }
    if (i == n || toks[i] !== ':') {
      return skipDeclaration(toks, i, n);
    }
    ++i;
    if (i < n && toks[i] === ' ') { ++i; }

    // None of the rules we care about want atrules or blocks in value, so
    // we look for any+ but that is the same as selector but not zero-length.
    // This gets us the benefit of not emitting any value with mismatched
    // brackets.
    var s = i, e = selector(toks, i, n, false);
    if (e < 0) {
      // Skip malformed content per selector calling convention.
      e = ~e;
    } else {
      var value = [], valuelen = 0;
      for (var j = s; j < e; ++j) {
        tok = toks[j];
        if (tok !== ' ') {
          value[valuelen++] = tok;
        }
      }
      // One of the following is now true:
      // (1) e is flush with the end of the tokens as in <... style="x:y">.
      // (2) tok[e] points to a ';' in which case we need to consume the semi.
      // (3) tok[e] points to a '}' in which case we don't consume it.
      // (4) else there is bogus unparsed value content at toks[e:].
      // Allow declaration flush with end for style attr body.
      if (e < n) {  // 2, 3, or 4
        do {
          tok = toks[e];
          if (tok === ';' || tok === '}') { break; }
          // Don't emit the property if there is questionable trailing content.
          valuelen = 0;
        } while (++e < n);
        if (tok === ';') {
          ++e;
        }
      }
      if (valuelen && handler['declaration']) {
        // TODO: coerce non-keyword ident tokens to quoted strings.
        handler['declaration'](property.toLowerCase(), value);
      }
    }
    return e;
  }

  parseCssDeclarations = function(cssText, handler) {
    var toks = lexCss(cssText);
    for (var i = 0, n = toks.length; i < n;) {
      i = toks[i] !== ' ' ? declaration(toks, i, n, handler) : i+1;
    }
  };
})();



// export for Closure Compiler
if (typeof window !== 'undefined') {
}
;
// Copyright (C) 2006 Google Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview
 * An HTML sanitizer that can satisfy a variety of security policies.
 *
 * <p>
 * The HTML sanitizer is built around a SAX parser and HTML element and
 * attributes schemas.
 *
 * If the cssparser is loaded, inline styles are sanitized using the
 * css property and value schemas.  Else they are remove during
 * sanitization.
 *
 * If it exists, uses parseCssDeclarations, sanitizeCssProperty,  cssSchema
 *
 * @author mikesamuel@gmail.com
 * @author jasvir@gmail.com
 * \@requires html4, URI
 * \@overrides window
 * \@provides html, html_sanitize, defs
 */

// The Turkish i seems to be a non-issue, but abort in case it is.
if ('I'.toLowerCase() !== 'i') { throw 'I/i problem'; }

// TODO(kpreid): Refactor so there is no global introduced by these type
// definitions.

/**
 * Contains types related to sanitizer policies.
 * \@namespace
 */
var defs = {};

/**
 * A decision about what to do with a tag.
 * @typedef {{ 'attribs': ?Array.<string>, 'tagName': ?string }}
 */
defs.TagPolicyDecision;

/**
 * A function that takes a tag name (canonical) and an array of attributes
 * and decides what to do, returning null to indicate the tag should be dropped
 * entirely from the output.
 *
 * @typedef {function(string, Array.<string>): ?defs.TagPolicyDecision}
 */
defs.TagPolicy;


/**
 * \@namespace
 */
var html = (function(html4) {

  // For closure compiler
  let parseCssDeclarations, sanitizeCssProperty, cssSchema;
  if ('undefined' !== typeof window) {
    parseCssDeclarations = window['parseCssDeclarations'];
    sanitizeCssProperty = window['sanitizeCssProperty'];
    cssSchema = window['cssSchema'];
  }

  // The keys of this object must be 'quoted' or JSCompiler will mangle them!
  // This is a partial list -- lookupEntity() uses the host browser's parser
  // (when available) to implement full entity lookup.
  // Note that entities are in general case-sensitive; the uppercase ones are
  // explicitly defined by HTML5 (presumably as compatibility).
  var ENTITIES = {
    'lt': '<',
    'LT': '<',
    'gt': '>',
    'GT': '>',
    'amp': '&',
    'AMP': '&',
    'quot': '"',
    'apos': '\'',
    'nbsp': '\u00A0'
  };

  // Patterns for types of entity/character reference names.
  var decimalEscapeRe = /^#(\d+)$/;
  var hexEscapeRe = /^#x([0-9A-Fa-f]+)$/;
  // contains every entity per http://www.w3.org/TR/2011/WD-html5-20110113/named-character-references.html
  var safeEntityNameRe = /^[A-Za-z][A-Za-z0-9]+$/;
  // Used as a hook to invoke the browser's entity parsing. <textarea> is used
  // because its content is parsed for entities but not tags.
  // TODO(kpreid): This retrieval is a kludge and leads to silent loss of
  // functionality if the document isn't available.
  var entityLookupElement =
      ('undefined' !== typeof window && window['document'])
          ? window['document'].createElement('textarea') : null;
  /**
   * Decodes an HTML entity.
   *
   * {\@updoc
   * $ lookupEntity('lt')
   * # '<'
   * $ lookupEntity('GT')
   * # '>'
   * $ lookupEntity('amp')
   * # '&'
   * $ lookupEntity('nbsp')
   * # '\xA0'
   * $ lookupEntity('apos')
   * # "'"
   * $ lookupEntity('quot')
   * # '"'
   * $ lookupEntity('#xa')
   * # '\n'
   * $ lookupEntity('#10')
   * # '\n'
   * $ lookupEntity('#x0a')
   * # '\n'
   * $ lookupEntity('#010')
   * # '\n'
   * $ lookupEntity('#x00A')
   * # '\n'
   * $ lookupEntity('Pi')      // Known failure
   * # '\u03A0'
   * $ lookupEntity('pi')      // Known failure
   * # '\u03C0'
   * }
   *
   * @param {string} name the content between the '&' and the ';'.
   * @return {string} a single unicode code-point as a string.
   */
  function lookupEntity(name) {
    // TODO: entity lookup as specified by HTML5 actually depends on the
    // presence of the ";".
    if (ENTITIES.hasOwnProperty(name)) { return ENTITIES[name]; }
    var m = name.match(decimalEscapeRe);
    if (m) {
      return String.fromCharCode(parseInt(m[1], 10));
    } else if (!!(m = name.match(hexEscapeRe))) {
      return String.fromCharCode(parseInt(m[1], 16));
    } else if (entityLookupElement && safeEntityNameRe.test(name)) {
      entityLookupElement.innerHTML = '&' + name + ';';
      var text = entityLookupElement.textContent;
      ENTITIES[name] = text;
      return text;
    } else {
      return '&' + name + ';';
    }
  }

  function decodeOneEntity(_, name) {
    return lookupEntity(name);
  }

  var nulRe = /\0/g;
  function stripNULs(s) {
    return s.replace(nulRe, '');
  }

  var ENTITY_RE_1 = /&(#[0-9]+|#[xX][0-9A-Fa-f]+|\w+);/g;
  var ENTITY_RE_2 = /^(#[0-9]+|#[xX][0-9A-Fa-f]+|\w+);/;
  /**
   * The plain text of a chunk of HTML CDATA which possibly containing.
   *
   * {\@updoc
   * $ unescapeEntities('')
   * # ''
   * $ unescapeEntities('hello World!')
   * # 'hello World!'
   * $ unescapeEntities('1 &lt; 2 &amp;&AMP; 4 &gt; 3&#10;')
   * # '1 < 2 && 4 > 3\n'
   * $ unescapeEntities('&lt;&lt <- unfinished entity&gt;')
   * # '<&lt <- unfinished entity>'
   * $ unescapeEntities('/foo?bar=baz&copy=true')  // & often unescaped in URLS
   * # '/foo?bar=baz&copy=true'
   * $ unescapeEntities('pi=&pi;&#x3c0;, Pi=&Pi;\u03A0') // FIXME: known failure
   * # 'pi=\u03C0\u03c0, Pi=\u03A0\u03A0'
   * }
   *
   * @param {string} s a chunk of HTML CDATA.  It must not start or end inside
   *     an HTML entity.
   */
  function unescapeEntities(s) {
    return s.replace(ENTITY_RE_1, decodeOneEntity);
  }

  var ampRe = /&/g;
  var looseAmpRe = /&([^a-z#]|#(?:[^0-9x]|x(?:[^0-9a-f]|$)|$)|$)/gi;
  var ltRe = /[<]/g;
  var gtRe = />/g;
  var quotRe = /\"/g;

  /**
   * Escapes HTML special characters in attribute values.
   *
   * {\@updoc
   * $ escapeAttrib('')
   * # ''
   * $ escapeAttrib('"<<&==&>>"')  // Do not just escape the first occurrence.
   * # '&#34;&lt;&lt;&amp;&#61;&#61;&amp;&gt;&gt;&#34;'
   * $ escapeAttrib('Hello <World>!')
   * # 'Hello &lt;World&gt;!'
   * }
   */
  function escapeAttrib(s) {
    return ('' + s).replace(ampRe, '&amp;').replace(ltRe, '&lt;')
        .replace(gtRe, '&gt;').replace(quotRe, '&#34;');
  }

  /**
   * Escape entities in RCDATA that can be escaped without changing the meaning.
   * {\@updoc
   * $ normalizeRCData('1 < 2 &&amp; 3 > 4 &amp;& 5 &lt; 7&8')
   * # '1 &lt; 2 &amp;&amp; 3 &gt; 4 &amp;&amp; 5 &lt; 7&amp;8'
   * }
   */
  function normalizeRCData(rcdata) {
    return rcdata
        .replace(looseAmpRe, '&amp;$1')
        .replace(ltRe, '&lt;')
        .replace(gtRe, '&gt;');
  }

  // TODO(felix8a): validate sanitizer regexs against the HTML5 grammar at
  // http://www.whatwg.org/specs/web-apps/current-work/multipage/syntax.html
  // http://www.whatwg.org/specs/web-apps/current-work/multipage/parsing.html
  // http://www.whatwg.org/specs/web-apps/current-work/multipage/tokenization.html
  // http://www.whatwg.org/specs/web-apps/current-work/multipage/tree-construction.html

  // We initially split input so that potentially meaningful characters
  // like '<' and '>' are separate tokens, using a fast dumb process that
  // ignores quoting.  Then we walk that token stream, and when we see a
  // '<' that's the start of a tag, we use ATTR_RE to extract tag
  // attributes from the next token.  That token will never have a '>'
  // character.  However, it might have an unbalanced quote character, and
  // when we see that, we combine additional tokens to balance the quote.

  var ATTR_RE = new RegExp(
    '^\\s*' +
    '(\\[[-.:\\w]+\\]|[-.:\\w]+)' +             // 1 = Attribute name
    '(?:' + (
      '\\s*(=)\\s*' +           // 2 = Is there a value?
      '(' + (                   // 3 = Attribute value
        // TODO(felix8a): maybe use backref to match quotes
        '(\")[^\"]*(\"|$)' +    // 4, 5 = Double-quoted string
        '|' +
        '(\')[^\']*(\'|$)' +    // 6, 7 = Single-quoted string
        '|' +
        // Positive lookahead to prevent interpretation of
        // <foo a= b=c> as <foo a='b=c'>
        // TODO(felix8a): might be able to drop this case
        '(?=[a-z][-\\w]*\\s*=)' +
        '|' +
        // Unquoted value that isn't an attribute name
        // (since we didn't match the positive lookahead above)
        '[^\"\'\\s]*' ) +
      ')' ) +
    ')?',
    'i');

  // false on IE<=8, true on most other browsers
  var splitWillCapture = ('a,b'.split(/(,)/).length === 3);

  // bitmask for tags with special parsing, like <script> and <textarea>
  var EFLAGS_TEXT = html4.eflags['CDATA'] | html4.eflags['RCDATA'];

  /**
   * Given a SAX-like event handler, produce a function that feeds those
   * events and a parameter to the event handler.
   *
   * The event handler has the form:{@code
   * {
   *   // Name is an upper-case HTML tag name.  Attribs is an array of
   *   // alternating upper-case attribute names, and attribute values.  The
   *   // attribs array is reused by the parser.  Param is the value passed to
   *   // the saxParser.
   *   startTag: function (name, attribs, param) { ... },
   *   endTag:   function (name, param) { ... },
   *   pcdata:   function (text, param) { ... },
   *   rcdata:   function (text, param) { ... },
   *   cdata:    function (text, param) { ... },
   *   startDoc: function (param) { ... },
   *   endDoc:   function (param) { ... }
   * }}
   *
   * @param {Object} handler a record containing event handlers.
   * @return {function(string, Object)} A function that takes a chunk of HTML
   *     and a parameter.  The parameter is passed on to the handler methods.
   */
  function makeSaxParser(handler) {
    // Accept quoted or unquoted keys (Closure compat)
    var hcopy = {
      cdata: handler.cdata || handler['cdata'],
      comment: handler.comment || handler['comment'],
      endDoc: handler.endDoc || handler['endDoc'],
      endTag: handler.endTag || handler['endTag'],
      pcdata: handler.pcdata || handler['pcdata'],
      rcdata: handler.rcdata || handler['rcdata'],
      startDoc: handler.startDoc || handler['startDoc'],
      startTag: handler.startTag || handler['startTag']
    };
    return function(htmlText, param) {
      return parse(htmlText, hcopy, param);
    };
  }

  // Parsing strategy is to split input into parts that might be lexically
  // meaningful (every ">" becomes a separate part), and then recombine
  // parts if we discover they're in a different context.

  // TODO(felix8a): Significant performance regressions from -legacy,
  // tested on
  //    Chrome 18.0
  //    Firefox 11.0
  //    IE 6, 7, 8, 9
  //    Opera 11.61
  //    Safari 5.1.3
  // Many of these are unusual patterns that are linearly slower and still
  // pretty fast (eg 1ms to 5ms), so not necessarily worth fixing.

  // TODO(felix8a): "<script> && && && ... <\/script>" is slower on all
  // browsers.  The hotspot is htmlSplit.

  // TODO(felix8a): "<p title='>>>>...'><\/p>" is slower on all browsers.
  // This is partly htmlSplit, but the hotspot is parseTagAndAttrs.

  // TODO(felix8a): "<a><\/a><a><\/a>..." is slower on IE9.
  // "<a>1<\/a><a>1<\/a>..." is faster, "<a><\/a>2<a><\/a>2..." is faster.

  // TODO(felix8a): "<p<p<p..." is slower on IE[6-8]

  var continuationMarker = {};
  function parse(htmlText, handler, param) {
    var m, p, tagName;
    var parts = htmlSplit(htmlText);
    var state = {
      noMoreGT: false,
      noMoreEndComments: false
    };
    parseCPS(handler, parts, 0, state, param);
  }

  function continuationMaker(h, parts, initial, state, param) {
    return function () {
      parseCPS(h, parts, initial, state, param);
    };
  }

  function parseCPS(h, parts, initial, state, param) {
    try {
      if (h.startDoc && initial == 0) { h.startDoc(param); }
      var m, p, tagName;
      for (var pos = initial, end = parts.length; pos < end;) {
        var current = parts[pos++];
        var next = parts[pos];
        switch (current) {
        case '&':
          if (ENTITY_RE_2.test(next)) {
            if (h.pcdata) {
              h.pcdata('&' + next, param, continuationMarker,
                continuationMaker(h, parts, pos, state, param));
            }
            pos++;
          } else {
            if (h.pcdata) { h.pcdata("&amp;", param, continuationMarker,
                continuationMaker(h, parts, pos, state, param));
            }
          }
          break;
        case '<\/':
          if ((m = /^([-\w:]+)[^\'\"]*/.exec(next))) {
            if (m[0].length === next.length && parts[pos + 1] === '>') {
              // fast case, no attribute parsing needed
              pos += 2;
              tagName = m[1].toLowerCase();
              if (h.endTag) {
                h.endTag(tagName, param, continuationMarker,
                  continuationMaker(h, parts, pos, state, param));
              }
            } else {
              // slow case, need to parse attributes
              // TODO(felix8a): do we really care about misparsing this?
              pos = parseEndTag(
                parts, pos, h, param, continuationMarker, state);
            }
          } else {
            if (h.pcdata) {
              h.pcdata('&lt;/', param, continuationMarker,
                continuationMaker(h, parts, pos, state, param));
            }
          }
          break;
        case '<':
          if (m = /^([-\w:]+)\s*\/?/.exec(next)) {
            if (m[0].length === next.length && parts[pos + 1] === '>') {
              // fast case, no attribute parsing needed
              pos += 2;
              tagName = m[1].toLowerCase();
              if (h.startTag) {
                h.startTag(tagName, [], param, continuationMarker,
                  continuationMaker(h, parts, pos, state, param));
              }
              // tags like <script> and <textarea> have special parsing
              var eflags = html4.ELEMENTS[tagName];
              if (eflags & EFLAGS_TEXT) {
                var tag = { name: tagName, next: pos, eflags: eflags };
                pos = parseText(
                  parts, tag, h, param, continuationMarker, state);
              }
            } else {
              // slow case, need to parse attributes
              pos = parseStartTag(
                parts, pos, h, param, continuationMarker, state);
            }
          } else {
            if (h.pcdata) {
              h.pcdata('&lt;', param, continuationMarker,
                continuationMaker(h, parts, pos, state, param));
            }
          }
          break;
        case '<\!--':
          // The pathological case is n copies of '<\!--' without '-->', and
          // repeated failure to find '-->' is quadratic.  We avoid that by
          // remembering when search for '-->' fails.
          if (!state.noMoreEndComments) {
            // A comment <\!--x--> is split into three tokens:
            //   '<\!--', 'x--', '>'
            // We want to find the next '>' token that has a preceding '--'.
            // pos is at the 'x--'.
            for (p = pos + 1; p < end; p++) {
              if (parts[p] === '>' && /--$/.test(parts[p - 1])) { break; }
            }
            if (p < end) {
              if (h.comment) {
                var comment = parts.slice(pos, p).join('');
                h.comment(
                  comment.substr(0, comment.length - 2), param,
                  continuationMarker,
                  continuationMaker(h, parts, p + 1, state, param));
              }
              pos = p + 1;
            } else {
              state.noMoreEndComments = true;
            }
          }
          if (state.noMoreEndComments) {
            if (h.pcdata) {
              h.pcdata('&lt;!--', param, continuationMarker,
                continuationMaker(h, parts, pos, state, param));
            }
          }
          break;
        case '<\!':
          if (!/^\w/.test(next)) {
            if (h.pcdata) {
              h.pcdata('&lt;!', param, continuationMarker,
                continuationMaker(h, parts, pos, state, param));
            }
          } else {
            // similar to noMoreEndComment logic
            if (!state.noMoreGT) {
              for (p = pos + 1; p < end; p++) {
                if (parts[p] === '>') { break; }
              }
              if (p < end) {
                pos = p + 1;
              } else {
                state.noMoreGT = true;
              }
            }
            if (state.noMoreGT) {
              if (h.pcdata) {
                h.pcdata('&lt;!', param, continuationMarker,
                  continuationMaker(h, parts, pos, state, param));
              }
            }
          }
          break;
        case '<?':
          // similar to noMoreEndComment logic
          if (!state.noMoreGT) {
            for (p = pos + 1; p < end; p++) {
              if (parts[p] === '>') { break; }
            }
            if (p < end) {
              pos = p + 1;
            } else {
              state.noMoreGT = true;
            }
          }
          if (state.noMoreGT) {
            if (h.pcdata) {
              h.pcdata('&lt;?', param, continuationMarker,
                continuationMaker(h, parts, pos, state, param));
            }
          }
          break;
        case '>':
          if (h.pcdata) {
            h.pcdata("&gt;", param, continuationMarker,
              continuationMaker(h, parts, pos, state, param));
          }
          break;
        case '':
          break;
        default:
          if (h.pcdata) {
            h.pcdata(current, param, continuationMarker,
              continuationMaker(h, parts, pos, state, param));
          }
          break;
        }
      }
      if (h.endDoc) { h.endDoc(param); }
    } catch (e) {
      if (e !== continuationMarker) { throw e; }
    }
  }

  // Split str into parts for the html parser.
  function htmlSplit(str) {
    // can't hoist this out of the function because of the re.exec loop.
    var re = /(<\/|<\!--|<[!?]|[&<>])/g;
    str += '';
    if (splitWillCapture) {
      return str.split(re);
    } else {
      var parts = [];
      var lastPos = 0;
      var m;
      while ((m = re.exec(str)) !== null) {
        parts.push(str.substring(lastPos, m.index));
        parts.push(m[0]);
        lastPos = m.index + m[0].length;
      }
      parts.push(str.substring(lastPos));
      return parts;
    }
  }

  function parseEndTag(parts, pos, h, param, continuationMarker, state) {
    var tag = parseTagAndAttrs(parts, pos);
    // drop unclosed tags
    if (!tag) { return parts.length; }
    if (h.endTag) {
      h.endTag(tag.name, param, continuationMarker,
        continuationMaker(h, parts, pos, state, param));
    }
    return tag.next;
  }

  function parseStartTag(parts, pos, h, param, continuationMarker, state) {
    var tag = parseTagAndAttrs(parts, pos);
    // drop unclosed tags
    if (!tag) { return parts.length; }
    if (h.startTag) {
      h.startTag(tag.name, tag.attrs, param, continuationMarker,
        continuationMaker(h, parts, tag.next, state, param));
    }
    // tags like <script> and <textarea> have special parsing
    if (tag.eflags & EFLAGS_TEXT) {
      return parseText(parts, tag, h, param, continuationMarker, state);
    } else {
      return tag.next;
    }
  }

  var endTagRe = {};

  // Tags like <script> and <textarea> are flagged as CDATA or RCDATA,
  // which means everything is text until we see the correct closing tag.
  function parseText(parts, tag, h, param, continuationMarker, state) {
    var end = parts.length;
    if (!endTagRe.hasOwnProperty(tag.name)) {
      endTagRe[tag.name] = new RegExp('^' + tag.name + '(?:[\\s\\/]|$)', 'i');
    }
    var re = endTagRe[tag.name];
    var first = tag.next;
    var p = tag.next + 1;
    for (; p < end; p++) {
      if (parts[p - 1] === '<\/' && re.test(parts[p])) { break; }
    }
    if (p < end) { p -= 1; }
    var buf = parts.slice(first, p).join('');
    if (tag.eflags & html4.eflags['CDATA']) {
      if (h.cdata) {
        h.cdata(buf, param, continuationMarker,
          continuationMaker(h, parts, p, state, param));
      }
    } else if (tag.eflags & html4.eflags['RCDATA']) {
      if (h.rcdata) {
        h.rcdata(normalizeRCData(buf), param, continuationMarker,
          continuationMaker(h, parts, p, state, param));
      }
    } else {
      throw new Error('bug');
    }
    return p;
  }

  // at this point, parts[pos-1] is either "<" or "<\/".
  function parseTagAndAttrs(parts, pos) {
    var m = /^([-\w:]+)/.exec(parts[pos]);
    var tag = {};
    tag.name = m[1].toLowerCase();
    tag.eflags = html4.ELEMENTS[tag.name];
    var buf = parts[pos].substr(m[0].length);
    // Find the next '>'.  We optimistically assume this '>' is not in a
    // quoted context, and further down we fix things up if it turns out to
    // be quoted.
    var p = pos + 1;
    var end = parts.length;
    for (; p < end; p++) {
      if (parts[p] === '>') { break; }
      buf += parts[p];
    }
    if (end <= p) { return void 0; }
    var attrs = [];
    while (buf !== '') {
      m = ATTR_RE.exec(buf);
      if (!m) {
        // No attribute found: skip garbage
        buf = buf.replace(/^[\s\S][^a-z\s]*/, '');

      } else if ((m[4] && !m[5]) || (m[6] && !m[7])) {
        // Unterminated quote: slurp to the next unquoted '>'
        var quote = m[4] || m[6];
        var sawQuote = false;
        var abuf = [buf, parts[p++]];
        for (; p < end; p++) {
          if (sawQuote) {
            if (parts[p] === '>') { break; }
          } else if (0 <= parts[p].indexOf(quote)) {
            sawQuote = true;
          }
          abuf.push(parts[p]);
        }
        // Slurp failed: lose the garbage
        if (end <= p) { break; }
        // Otherwise retry attribute parsing
        buf = abuf.join('');
        continue;

      } else {
        // We have an attribute
        var aName = m[1].toLowerCase();
        var aValue = m[2] ? decodeValue(m[3]) : '';
        attrs.push(aName, aValue);
        buf = buf.substr(m[0].length);
      }
    }
    tag.attrs = attrs;
    tag.next = p + 1;
    return tag;
  }

  function decodeValue(v) {
    var q = v.charCodeAt(0);
    if (q === 0x22 || q === 0x27) { // " or '
      v = v.substr(1, v.length - 2);
    }
    return unescapeEntities(stripNULs(v));
  }

  /**
   * Returns a function that strips unsafe tags and attributes from html.
   * @param {defs.TagPolicy} tagPolicy
   *     A function that takes (tagName, attribs[]), where tagName is a key in
   *     html4.ELEMENTS and attribs is an array of alternating attribute names
   *     and values.  It should return a record (as follows), or null to delete
   *     the element.  It's okay for tagPolicy to modify the attribs array,
   *     but the same array is reused, so it should not be held between calls.
   *     Record keys:
   *        attribs: (required) Sanitized attributes array.
   *        tagName: Replacement tag name.
   * @return {function(string, Array)} A function that sanitizes a string of
   *     HTML and appends result strings to the second argument, an array.
   */
  function makeHtmlSanitizer(tagPolicy) {
    var stack;
    var ignoring;
    var emit = function (text, out) {
      if (!ignoring) { out.push(text); }
    };
    return makeSaxParser({
      'startDoc': function(_) {
        stack = [];
        ignoring = false;
      },
      'startTag': function(tagNameOrig, attribs, out) {
        if (ignoring) { return; }
        if (!html4.ELEMENTS.hasOwnProperty(tagNameOrig)) { return; }
        var eflagsOrig = html4.ELEMENTS[tagNameOrig];
        if (eflagsOrig & html4.eflags['FOLDABLE']) {
          return;
        }

        var decision = tagPolicy(tagNameOrig, attribs);
        if (!decision) {
          ignoring = !(eflagsOrig & html4.eflags['EMPTY']);
          return;
        } else if (typeof decision !== 'object') {
          throw new Error('tagPolicy did not return object (old API?)');
        }
        if ('attribs' in decision) {
          attribs = decision['attribs'];
        } else {
          throw new Error('tagPolicy gave no attribs');
        }
        var eflagsRep;
        var tagNameRep;
        if ('tagName' in decision) {
          tagNameRep = decision['tagName'];
          eflagsRep = html4.ELEMENTS[tagNameRep];
        } else {
          tagNameRep = tagNameOrig;
          eflagsRep = eflagsOrig;
        }
        // TODO(mikesamuel): relying on tagPolicy not to insert unsafe
        // attribute names.

        // If this is an optional-end-tag element and either this element or its
        // previous like sibling was rewritten, then insert a close tag to
        // preserve structure.
        if (eflagsOrig & html4.eflags['OPTIONAL_ENDTAG']) {
          var onStack = stack[stack.length - 1];
          if (onStack && onStack.orig === tagNameOrig &&
              (onStack.rep !== tagNameRep || tagNameOrig !== tagNameRep)) {
                out.push('<\/', onStack.rep, '>');
          }
        }

        if (!(eflagsOrig & html4.eflags['EMPTY'])) {
          stack.push({orig: tagNameOrig, rep: tagNameRep});
        }

        out.push('<', tagNameRep);
        for (var i = 0, n = attribs.length; i < n; i += 2) {
          var attribName = attribs[i],
              value = attribs[i + 1];
          if (value !== null && value !== void 0) {
            out.push(' ', attribName, '="', escapeAttrib(value), '"');
          }
        }
        out.push('>');

        if ((eflagsOrig & html4.eflags['EMPTY'])
            && !(eflagsRep & html4.eflags['EMPTY'])) {
          // replacement is non-empty, synthesize end tag
          out.push('<\/', tagNameRep, '>');
        }
      },
      'endTag': function(tagName, out) {
        if (ignoring) {
          ignoring = false;
          return;
        }
        if (!html4.ELEMENTS.hasOwnProperty(tagName)) { return; }
        var eflags = html4.ELEMENTS[tagName];
        if (!(eflags & (html4.eflags['EMPTY'] | html4.eflags['FOLDABLE']))) {
          var index;
          if (eflags & html4.eflags['OPTIONAL_ENDTAG']) {
            for (index = stack.length; --index >= 0;) {
              var stackElOrigTag = stack[index].orig;
              if (stackElOrigTag === tagName) { break; }
              if (!(html4.ELEMENTS[stackElOrigTag] &
                    html4.eflags['OPTIONAL_ENDTAG'])) {
                // Don't pop non optional end tags looking for a match.
                return;
              }
            }
          } else {
            for (index = stack.length; --index >= 0;) {
              if (stack[index].orig === tagName) { break; }
            }
          }
          if (index < 0) { return; }  // Not opened.
          for (var i = stack.length; --i > index;) {
            var stackElRepTag = stack[i].rep;
            if (!(html4.ELEMENTS[stackElRepTag] &
                  html4.eflags['OPTIONAL_ENDTAG'])) {
              out.push('<\/', stackElRepTag, '>');
            }
          }
          if (index < stack.length) {
            tagName = stack[index].rep;
          }
          stack.length = index;
          out.push('<\/', tagName, '>');
        }
      },
      'pcdata': emit,
      'rcdata': emit,
      'cdata': emit,
      'endDoc': function(out) {
        for (; stack.length; stack.length--) {
          out.push('<\/', stack[stack.length - 1].rep, '>');
        }
      }
    });
  }

  var ALLOWED_URI_SCHEMES = /^(?:https?|geo|mailto|sms|tel)$/i;

  function safeUri(uri, effect, ltype, hints, naiveUriRewriter) {
    if (!naiveUriRewriter) { return null; }
    try {
      var parsed = URI.parse('' + uri);
      if (parsed) {
        if (!parsed.hasScheme() ||
            ALLOWED_URI_SCHEMES.test(parsed.getScheme())) {
          var safe = naiveUriRewriter(parsed, effect, ltype, hints);
          return safe ? safe.toString() : null;
        }
      }
    } catch (e) {
      return null;
    }
    return null;
  }

  function log(logger, tagName, attribName, oldValue, newValue) {
    if (!attribName) {
      logger(tagName + " removed", {
        change: "removed",
        tagName: tagName
      });
    }
    if (oldValue !== newValue) {
      var changed = "changed";
      if (oldValue && !newValue) {
        changed = "removed";
      } else if (!oldValue && newValue)  {
        changed = "added";
      }
      logger(tagName + "." + attribName + " " + changed, {
        change: changed,
        tagName: tagName,
        attribName: attribName,
        oldValue: oldValue,
        newValue: newValue
      });
    }
  }

  function lookupAttribute(map, tagName, attribName) {
    var attribKey;
    attribKey = tagName + '::' + attribName;
    if (map.hasOwnProperty(attribKey)) {
      return map[attribKey];
    }
    attribKey = '*::' + attribName;
    if (map.hasOwnProperty(attribKey)) {
      return map[attribKey];
    }
    return void 0;
  }
  function getAttributeType(tagName, attribName) {
    return lookupAttribute(html4.ATTRIBS, tagName, attribName);
  }
  function getLoaderType(tagName, attribName) {
    return lookupAttribute(html4.LOADERTYPES, tagName, attribName);
  }
  function getUriEffect(tagName, attribName) {
    return lookupAttribute(html4.URIEFFECTS, tagName, attribName);
  }

  /**
   * Sanitizes attributes on an HTML tag.
   * @param {string} tagName An HTML tag name in lowercase.
   * @param {Array.<?string>} attribs An array of alternating names and values.
   * @param {?function(?string): ?string} opt_naiveUriRewriter A transform to
   *     apply to URI attributes; it can return a new string value, or null to
   *     delete the attribute.  If unspecified, URI attributes are deleted.
   * @param {function(?string): ?string} opt_nmTokenPolicy A transform to apply
   *     to attributes containing HTML names, element IDs, and space-separated
   *     lists of classes; it can return a new string value, or null to delete
   *     the attribute.  If unspecified, these attributes are kept unchanged.
   * @return {Array.<?string>} The sanitized attributes as a list of alternating
   *     names and values, where a null value means to omit the attribute.
   */
  function sanitizeAttribs(tagName, attribs,
    opt_naiveUriRewriter, opt_nmTokenPolicy, opt_logger) {
    // TODO(felix8a): it's obnoxious that domado duplicates much of this
    // TODO(felix8a): maybe consistently enforce constraints like target=
    for (var i = 0; i < attribs.length; i += 2) {
      var attribName = attribs[i];
      var value = attribs[i + 1];
      var oldValue = value;
      var atype = null, attribKey;
      if ((attribKey = tagName + '::' + attribName,
           html4.ATTRIBS.hasOwnProperty(attribKey)) ||
          (attribKey = '*::' + attribName,
           html4.ATTRIBS.hasOwnProperty(attribKey))) {
        atype = html4.ATTRIBS[attribKey];
      }
      if (atype !== null) {
        switch (atype) {
          case html4.atype['NONE']: break;
          case html4.atype['SCRIPT']:
            value = null;
            if (opt_logger) {
              log(opt_logger, tagName, attribName, oldValue, value);
            }
            break;
          case html4.atype['STYLE']:
            if ('undefined' === typeof parseCssDeclarations) {
              value = null;
              if (opt_logger) {
                log(opt_logger, tagName, attribName, oldValue, value);
	      }
              break;
            }
            var sanitizedDeclarations = [];
            parseCssDeclarations(
                value,
                {
                  'declaration': function (property, tokens) {
                    var normProp = property.toLowerCase();
                    sanitizeCssProperty(
                        normProp, tokens,
                        opt_naiveUriRewriter
                        ? function (url) {
                            return safeUri(
                                url, html4.ueffects.SAME_DOCUMENT,
                                html4.ltypes.SANDBOXED,
                                {
                                  "TYPE": "CSS",
                                  "CSS_PROP": normProp
                                }, opt_naiveUriRewriter);
                          }
                        : null);
                    if (tokens.length) {
                      sanitizedDeclarations.push(
                          normProp + ': ' + tokens.join(' '));
                    }
                  }
                });
            value = sanitizedDeclarations.length > 0 ?
              sanitizedDeclarations.join(' ; ') : null;
            if (opt_logger) {
              log(opt_logger, tagName, attribName, oldValue, value);
            }
            break;
          case html4.atype['ID']:
          case html4.atype['IDREF']:
          case html4.atype['IDREFS']:
          case html4.atype['GLOBAL_NAME']:
          case html4.atype['LOCAL_NAME']:
          case html4.atype['CLASSES']:
            value = opt_nmTokenPolicy ? opt_nmTokenPolicy(value) : value;
            if (opt_logger) {
              log(opt_logger, tagName, attribName, oldValue, value);
            }
            break;
          case html4.atype['URI']:
            value = safeUri(value,
              getUriEffect(tagName, attribName),
              getLoaderType(tagName, attribName),
              {
                "TYPE": "MARKUP",
                "XML_ATTR": attribName,
                "XML_TAG": tagName
              }, opt_naiveUriRewriter);
              if (opt_logger) {
              log(opt_logger, tagName, attribName, oldValue, value);
            }
            break;
          case html4.atype['URI_FRAGMENT']:
            if (value && '#' === value.charAt(0)) {
              value = value.substring(1);  // remove the leading '#'
              value = opt_nmTokenPolicy ? opt_nmTokenPolicy(value) : value;
              if (value !== null && value !== void 0) {
                value = '#' + value;  // restore the leading '#'
              }
            } else {
              value = null;
            }
            if (opt_logger) {
              log(opt_logger, tagName, attribName, oldValue, value);
            }
            break;
          default:
            value = null;
            if (opt_logger) {
              log(opt_logger, tagName, attribName, oldValue, value);
            }
            break;
        }
      } else {
        value = null;
        if (opt_logger) {
          log(opt_logger, tagName, attribName, oldValue, value);
        }
      }
      attribs[i + 1] = value;
    }
    return attribs;
  }

  /**
   * Creates a tag policy that omits all tags marked UNSAFE in html4-defs.js
   * and applies the default attribute sanitizer with the supplied policy for
   * URI attributes and NMTOKEN attributes.
   * @param {?function(?string): ?string} opt_naiveUriRewriter A transform to
   *     apply to URI attributes.  If not given, URI attributes are deleted.
   * @param {function(?string): ?string} opt_nmTokenPolicy A transform to apply
   *     to attributes containing HTML names, element IDs, and space-separated
   *     lists of classes.  If not given, such attributes are left unchanged.
   * @return {defs.TagPolicy} A tagPolicy suitable for
   *     passing to html.sanitize.
   */
  function makeTagPolicy(
    opt_naiveUriRewriter, opt_nmTokenPolicy, opt_logger) {
    return function(tagName, attribs) {
      if (!(html4.ELEMENTS[tagName] & html4.eflags['UNSAFE'])) {
        return {
          'attribs': sanitizeAttribs(tagName, attribs,
            opt_naiveUriRewriter, opt_nmTokenPolicy, opt_logger)
        };
      } else {
        if (opt_logger) {
          log(opt_logger, tagName, undefined, undefined, undefined);
        }
      }
    };
  }

  /**
   * Sanitizes HTML tags and attributes according to a given policy.
   * @param {string} inputHtml The HTML to sanitize.
   * @param {function(string, Array.<?string>)} tagPolicy A function that
   *     decides which tags to accept and sanitizes their attributes (see
   *     makeHtmlSanitizer above for details).
   * @return {string} The sanitized HTML.
   */
  function sanitizeWithPolicy(inputHtml, tagPolicy) {
    var outputArray = [];
    makeHtmlSanitizer(tagPolicy)(inputHtml, outputArray);
    return outputArray.join('');
  }

  /**
   * Strips unsafe tags and attributes from HTML.
   * @param {string} inputHtml The HTML to sanitize.
   * @param {?function(?string): ?string} opt_naiveUriRewriter A transform to
   *     apply to URI attributes.  If not given, URI attributes are deleted.
   * @param {function(?string): ?string} opt_nmTokenPolicy A transform to apply
   *     to attributes containing HTML names, element IDs, and space-separated
   *     lists of classes.  If not given, such attributes are left unchanged.
   */
  function sanitize(inputHtml,
    opt_naiveUriRewriter, opt_nmTokenPolicy, opt_logger) {
    var tagPolicy = makeTagPolicy(
      opt_naiveUriRewriter, opt_nmTokenPolicy, opt_logger);
    return sanitizeWithPolicy(inputHtml, tagPolicy);
  }

  // Export both quoted and unquoted names for Closure linkage.
  var html = {};
  html.escapeAttrib = html['escapeAttrib'] = escapeAttrib;
  html.makeHtmlSanitizer = html['makeHtmlSanitizer'] = makeHtmlSanitizer;
  html.makeSaxParser = html['makeSaxParser'] = makeSaxParser;
  html.makeTagPolicy = html['makeTagPolicy'] = makeTagPolicy;
  html.normalizeRCData = html['normalizeRCData'] = normalizeRCData;
  html.sanitize = html['sanitize'] = sanitize;
  html.sanitizeAttribs = html['sanitizeAttribs'] = sanitizeAttribs;
  html.sanitizeWithPolicy = html['sanitizeWithPolicy'] = sanitizeWithPolicy;
  html.unescapeEntities = html['unescapeEntities'] = unescapeEntities;
  return html;
})(html4);

var html_sanitize = html['sanitize'];

// Exports for Closure compiler.  Note this file is also cajoled
// for domado and run in an environment without 'window'
if (typeof window !== 'undefined') {
}

export var htmlSanitizer = html;
