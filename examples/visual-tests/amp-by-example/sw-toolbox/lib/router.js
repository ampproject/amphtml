/*
  Copyright 2014 Google Inc. All Rights Reserved.

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
*/
'use strict';

var Route = require('./route');
var helpers = require('./helpers');

function regexEscape(s) {
  return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}

var keyMatch = function(map, string) {
  // This would be better written as a for..of loop, but that would break the
  // minifyify process in the build.
  var entriesIterator = map.entries();
  var item = entriesIterator.next();
  var matches = [];
  while (!item.done) {
    var pattern = new RegExp(item.value[0]);
    if (pattern.test(string)) {
      matches.push(item.value[1]);
    }
    item = entriesIterator.next();
  }
  return matches;
};

var Router = function() {
  this.routes = new Map();
  // Create the dummy origin for RegExp-based routes
  this.routes.set(RegExp, new Map());
  this.default = null;
};

['get', 'post', 'put', 'delete', 'head', 'any'].forEach(function(method) {
  Router.prototype[method] = function(path, handler, options) {
    return this.add(method, path, handler, options);
  };
});

Router.prototype.add = function(method, path, handler, options) {
  options = options || {};
  var origin;

  if (path instanceof RegExp) {
    // We need a unique key to use in the Map to distinguish RegExp paths
    // from Express-style paths + origins. Since we can use any object as the
    // key in a Map, let's use the RegExp constructor!
    origin = RegExp;
  } else {
    origin = options.origin || self.location.origin;
    if (origin instanceof RegExp) {
      origin = origin.source;
    } else {
      origin = regexEscape(origin);
    }
  }

  method = method.toLowerCase();

  var route = new Route(method, path, handler, options);

  if (!this.routes.has(origin)) {
    this.routes.set(origin, new Map());
  }

  var methodMap = this.routes.get(origin);
  if (!methodMap.has(method)) {
    methodMap.set(method, new Map());
  }

  var routeMap = methodMap.get(method);
  var regExp = route.regexp || route.fullUrlRegExp;

  if (routeMap.has(regExp.source)) {
    helpers.debug('"' + path + '" resolves to same regex as existing route.');
  }

  routeMap.set(regExp.source, route);
};

Router.prototype.matchMethod = function(method, url) {
  var urlObject = new URL(url);
  var origin = urlObject.origin;
  var path = urlObject.pathname;

  // We want to first check to see if there's a match against any
  // "Express-style" routes (string for the path, RegExp for the origin).
  // Checking for Express-style matches first maintains the legacy behavior.
  // If there's no match, we next check for a match against any RegExp routes,
  // where the RegExp in question matches the full URL (both origin and path).
  return this._match(method, keyMatch(this.routes, origin), path) ||
    this._match(method, [this.routes.get(RegExp)], url);
};

Router.prototype._match = function(method, methodMaps, pathOrUrl) {
  if (methodMaps.length === 0) {
    return null;
  }

  for (var i = 0; i < methodMaps.length; i++) {
    var methodMap = methodMaps[i];
    var routeMap = methodMap && methodMap.get(method.toLowerCase());
    if (routeMap) {
      var routes = keyMatch(routeMap, pathOrUrl);
      if (routes.length > 0) {
        return routes[0].makeHandler(pathOrUrl);
      }
    }
  }

  return null;
};

Router.prototype.match = function(request) {
  return this.matchMethod(request.method, request.url) ||
      this.matchMethod('any', request.url);
};

module.exports = new Router();
