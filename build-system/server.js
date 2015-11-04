/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
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

/**
 * @fileoverview Creates an http server to handle static
 * files and list directories for use with the gulp live server
 */
var app = require('connect')();
var clr = require('connect-livereload');
var finalhandler = require('finalhandler');
var path = require('path');
var serveIndex = require('serve-index');
var serveStatic = require('serve-static');

var args = Array.prototype.slice.call(process.argv, 2, 4);
var paths = args[0];
var port = args[1];

app.use(clr());

paths.split(",").forEach(function(pth){
  // Serve static files that exist
  app.use(serveStatic(path.join(process.cwd(), pth)));
  // Serve directory listings
  app.use(serveIndex(path.join(process.cwd(), pth),
    {'icons':true,'view':'details'}));
});

// 404 everything else
app.use(function notFound(req, res) {
  var done = finalhandler(req,res);
  var err = new Error('File Not Found');
  err.status = 404;
  done(err);
});

// Start up the server
app.listen(port, function () {
  console./*OK*/log('serving %s at http://localhost:%s', paths, port);
});
