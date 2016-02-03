/**
 * Takes any url string and returns a relative path.
 *
 * If the original url was FQ, strips out the domain portion and hash portions
 * http://cbc.ca/url?query#hash -> /url
 * path -> /path
 * /root#hash -> /root
 * this function is repeatable, parsePath(parsePath(/url)) -> /url
 *
 * @param  {String} href
 * @return {String} relative URI or undefined if href was falsy
 */
parseUri = function(str) {
  var options = {
    strictMode: false,
    key: [
      "source", "protocol", "authority", "userInfo", "user",
      "password", "host", "port", "relative", "path", "directory",
      "file", "query", "anchor"
    ],
    q: {
      name: "queryKey",
      parser: /(?:^|&)([^&=]*)=?([^&]*)/g
    },
    parser: {
      strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
      loose: /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/
    }
  };

  var o = options,
    m = o.parser[o.strictMode ? "strict" : "loose"].exec(str),
    uri = {},
    i = 14;

  while (i--) {
    uri[o.key[i]] = m[i] || "";
  }

  uri[o.q.name] = {};
  uri[o.key[12]].replace(o.q.parser, function($0, $1, $2) {
    if ($1) {
      uri[o.q.name][$1] = $2;
    }
  });

  return uri;
}

/**
 * Generates a url from the given object
 *
 * @param {Object} obj {
 *     path: '/something',
 *     anchor: 'hash',
 *     query: '?asdf=foo',
 *     queryKey: {
 *        asdf: 'foo'
 *     },
 *     relative: '',
 *     source: ''
 * }
 *
 * @return String /something?asdf=foo#hash
 */
stringifyUriPath = function(obj) {
  var uri = obj.path;

  var keys = Object.keys(obj.queryKey);

  if (keys.length > 0) {
    var params = [];
    uri += '?';
    keys.forEach((key) => {
      if (obj.queryKey[key]) {
        params.push(key + '=' + obj.queryKey[key]);
      }
    });
    uri += params.join('&');
  }

  if (obj.anchor) {
    uri += '#' + obj.anchor;
  }

  return uri;
}

/**
 * Takes any url string and returns a relative path.
 *
 * If the original url was FQ, strips out the domain portion and hash portions
 *     http://cbc.ca/url?query#hash -> /url
 *     path -> /path
 *     /root#hash -> /root
 *
 * this function is repeatable, parsePath(parsePath(/url)) -> /url
 *
 * @param {String} href
 *
 * @return {String} relative URI or undefined if href was falsy
 */
parsePath = function(href) {

  var url;

  href = decodeURIComponent(href);
  url = href.match(/^([a-z]+):\/\/\/?([^\/]+)(\/[^#]*)?/i);

  if (url && url.length == 4) {
    return url[3] || '/';
  }

  url = (href[0] === '/' ? href : '/' + href).match(/^([^#]+)/);

  return url[1];
}

/**
 * Searches for the meta tag with the attribute that matches the value provided and returns its content
 *
 * @param  {Array} attributes  Array of html elements
 * @param  {String} value      meta tag property to get content for
 * @param  {String} attribute  optional. Specify the attribute to find the tag by. Find element where "attribute" === "value" instead of "property" or "name" === "value"
 * @param  {String} content    optional. Specify the attribute of the element to be returned instead of content
 * @return {String}            contents of the meta tag
 */
getAttributeContents = function(attributes, value, attribute, content) {
  for (var i = 0; i < attributes.length; i++) {
    if (attributes[i].getAttribute(attribute) === value ||
      attributes[i].getAttribute("name") === value ||
      attributes[i].getAttribute("property") === value) {
      return attributes[i].getAttribute(content || "content");
    }
  }
}

/**
 * Returns the path for the page
 *
 * @param  {[Array]} meta Array of meta tags. Used to search for an og:url meta tag
 * @return {String}       Returns the og:url if there is one present and the url path otherwise
 */
fetchPath = function(meta) {
  var path;
  var url = parsePath(location.href);

  var ogUrl = getAttributeContents(meta, "og:url"),
    ogPath;

  if (ogUrl) {
    // strip out domain and hash
    ogPath = ogUrl.match(/^([a-z]+):\/\/([^\/]+)([^#]+)/i);

    if (ogPath && ogPath.length >= 4) {
      ogPath = ogPath[3];
    } else {
      ogPath = null;
    }
  }

  path = url || location.pathname;

  var uri = parseUri(path);

  if (uri.queryKey && uri.queryKey.__vfz) {
    delete uri.queryKey.__vfz;
  }

  path = decodeURIComponent(stringifyUriPath(uri)) || '/';

  return path;
}

/**
 * Looks for a page title in the meta tags
 *
 * @param  {[Array]} meta Array of meta tags. Used to search for title tags
 * @return {String}       Returns the title if there is one present and the url otherwise
 */
fetchTitle = function(meta) {
  return (getAttributeContents(meta, "vf:title") ||
    getAttributeContents(meta, "og:title") ||
    getAttributeContents(meta, "twitter:title") ||
    (document.getElementsByTagName("title")[0] && document.getElementsByTagName("title")[0].innerHTML) || location.href).substring(0, 500); // Discuss whether we want the title to be url by default
}

/**
 * Looks for a page image in the meta tags
 *
 * @param  {[Array]} meta Array of meta tags. Used to search for image tags
 * @return {String}       Returns the image if there is one present and an empty string otherwise
 */
fetchImage = function(meta) {
  return getAttributeContents(meta, "vf:image") ||
    getAttributeContents(meta, "og:image") ||
    getAttributeContents(meta, "twitter:image") ||
    getAttributeContents(document.getElementsByTagName("link"), "rel", "image_src") ||
    "";
}

/**
 * Looks for a page description in the meta tags
 *
 * @param  {[Array]} meta Array of meta tags. Used to search for description tags
 * @return {String}       Returns the description if there is one present and an empty string otherwise
 */
fetchDescription = function(meta) {
  return (getAttributeContents(meta, "vf:description") ||
    getAttributeContents(meta, "og:description") ||
    getAttributeContents(meta, "description") ||
    getAttributeContents(meta, "twitter:description") || "").substring(0, 500);
}

export function locations() {
  var meta = document.getElementsByTagName("meta");
  var url = parseUri(location.href);
  var response = [];
  response.push(["domain", url.host || location.hostname || ""]);
  response.push(["path", fetchPath(meta) || ""]);
  response.push(["title", fetchTitle(meta) || ""]);
  response.push(["image", fetchImage(meta) || ""]);
  response.push(["description", fetchDescription(meta) || ""]);
  response.push(["unique_id", getAttributeContents(meta, "vf:unique_id") || ""]);
  response.push(["lang", getAttributeContents(meta, "vf:lang") || ""]);
  response.push(["section", getAttributeContents(meta, "vf:section") || ""]);
  return response;
}
