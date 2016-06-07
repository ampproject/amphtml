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
var BBPromise = require('bluebird');
var app = require('connect')();
var bodyParser = require('body-parser');
var finalhandler = require('finalhandler');
var fs = BBPromise.promisifyAll(require('fs'));
var formidable = require('formidable');
var jsdom = require('jsdom');
var path = require('path');
var request = require('request');
var serveIndex = require('serve-index');
var serveStatic = require('serve-static');
var url = require('url');

var args = Array.prototype.slice.call(process.argv, 2, 4);
var paths = args[0];
var port = args[1];

app.use(bodyParser.json());

app.use('/examples', function(req, res, next) {
  // Redirect physical dir to build dir that has versions belonging to
  // local AMP.
  if (req.url == '/' || req.url == '') {
    res.writeHead(302, {
      'Location': '../examples.build/'
    });
    res.end();
    return;
  }
  next();
});

app.use('/api/show', function(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({
    showNotification: true
  }));
});

app.use('/api/dont-show', function(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({
    showNotification: false
  }));
});

app.use('/api/echo/post', function(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(req.body, null, 2));
});

app.use('/form/html/post', function(req, res) {
  var form = new formidable.IncomingForm();
  form.parse(req, function(err, fields) {
    res.setHeader('Content-Type', 'text/html');
    if (fields['email'] == 'already@subscribed.com') {
      res.statusCode = 500;
      res.end(`
        <h1 style="color:red;">Sorry ${fields['name']}!</h1>
        <p>The email ${fields['email']} is already subscribed!</p>
      `);
    } else {
      res.end(`
      <h1>Thanks ${fields['name']}!</h1>
        <p>Please make sure to confirm your email ${fields['email']}</p>
      `);
    }
  });
});

app.use('/form/echo-json/post', function(req, res) {
  var form = new formidable.IncomingForm();
  form.parse(req, function(err, fields) {
    res.setHeader('Content-Type', 'application/json');
    if (fields['email'] == 'already@subscribed.com') {
      res.statusCode = 500;
    }
    res.end(JSON.stringify(fields));
  });
});

// Fetches an AMP document from the AMP proxy and replaces JS
// URLs, so that they point to localhost.
function proxyToAmpProxy(req, res, minify) {
  res.setHeader('Content-Type', 'text/html');
  var url = 'https://cdn.ampproject.org/c' + req.url;
  request(url, function (error, response, body) {
    body = body
        // Unversion URLs.
        .replace(/https\:\/\/cdn\.ampproject\.org\/rtv\/\d+\//g,
            'https://cdn.ampproject.org/')
        // <base> href pointing to the proxy, so that images, etc. still work.
        .replace('<head>', '<head><base href="https://cdn.ampproject.org/">')
        .replace(/(https:\/\/cdn.ampproject.org\/.+?).js/g, '$1.max.js')
        .replace('https://cdn.ampproject.org/v0.max.js',
            'http://localhost:8000/dist/amp.js')
        .replace(/https:\/\/cdn.ampproject.org\/v0\//g,
            'http://localhost:8000/dist/v0/');
    if (minify) {
      body = body.replace(/\.max\.js/g, '.js')
          .replace('/dist/amp.js', '/dist/v0.js');
    }
    res.statusCode = response.statusCode;
    res.end(body);
  });
}

app.use('/examples.build/live-list.amp.max.html', function(req, res) {
  res.setHeader('Content-Type', 'text/html');
  res.statusCode = 200;
  fs.readFileAsync(process.cwd() +
      '/examples.build/live-list.amp.max.html').then((file) => {
        res.end(file);
  });
});

var liveListUpdateFile = '/examples.build/live-list-update.amp.max.html';
var liveListUpdateFullPath = `${process.cwd()}${liveListUpdateFile}`;
var liveListFile = fs.readFileSync(liveListUpdateFullPath);
var liveListCtr = 0;
var itemCtr = 2;
var liveListDoc = null;
var doctype = '<!doctype html>\n';
app.use(liveListUpdateFile, function(req, res) {
  if (!liveListDoc) {
    liveListDoc = jsdom.jsdom(liveListFile);
  }
  var action = Math.floor(Math.random() * 3);
  var liveList = liveListDoc.querySelector('#my-live-list');
  var item1 = liveList.querySelector('#list-item-1');
  res.setHeader('Content-Type', 'text/html');
  res.statusCode = 200;
  if (liveListCtr != 0) {
    if (Math.random() < .8) {
      // Always run a replace on the first item
      liveListReplace(item1);

      if (Math.random() < .5) {
        liveListTombstone(liveList);
      }

      if (Math.random() < .8) {
        liveListInsert(liveList, item1);
      }
    } else {
      // Sometimes we want an empty response to simulate no changes.
      res.end(`${doctype}<html></html>`);
      return;
    }
  }
  var outerHTML = liveListDoc.documentElement./*OK*/outerHTML;
  res.end(`${doctype}${outerHTML}`);
  liveListCtr++;
});

function liveListReplace(item) {
  item.setAttribute('data-update-time', Date.now());
  var itemContents = item.querySelectorAll('.content');
  itemContents[0].textContent = Math.floor(Math.random() * 10);
  itemContents[1].textContent = Math.floor(Math.random() * 10);
}

function liveListInsert(liveList, node) {
  var iterCount = Math.floor(Math.random() * 2) + 1;
  console.log(`inserting ${iterCount} item(s)`);
  for (var i = 0; i < iterCount; i++) {
    var child = node.cloneNode(true);
    child.setAttribute('id', `list-item-${itemCtr++}`);
    child.setAttribute('data-sort-time', Date.now());
    liveList.querySelector('[items]').appendChild(child);
  }
}

function liveListTombstone(liveList) {
  var tombstoneId = Math.floor(Math.random() * itemCtr);
  console.log(`trying to tombstone #list-item-${tombstoneId}`);
  // We can tombstone any list item except item-1 since we always do a
  // replace example on item-1.
  if (tombstoneId != 1) {
    var item = liveList.querySelector(`#list-item-${tombstoneId}`);
    if (item) {
      item.setAttribute('data-tombstone', '');
    }
  }
}

// Proxy with unminified JS.
// Example:
// http://localhost:8000/max/s/www.washingtonpost.com/amphtml/news/post-politics/wp/2016/02/21/bernie-sanders-says-lower-turnout-contributed-to-his-nevada-loss-to-hillary-clinton/
app.use('/max/', function(req, res) {
  proxyToAmpProxy(req, res, /* minify */ false);
});

// Proxy with minified JS.
// Example:
// http://localhost:8000/min/s/www.washingtonpost.com/amphtml/news/post-politics/wp/2016/02/21/bernie-sanders-says-lower-turnout-contributed-to-his-nevada-loss-to-hillary-clinton/
app.use('/min/', function(req, res) {
  proxyToAmpProxy(req, res, /* minify */ true);
});

function setAMPAccessControlHeader(res, path) {
  var curUrl = url.parse(path, true);
  if (curUrl.pathname.indexOf('/examples.build/analytics.config.json') > 0) {
    res.setHeader('AMP-Access-Control-Allow-Source-Origin',
        'http://localhost:' + port);
  }
}

paths.split(',').forEach(function(pth) {
  // Serve static files that exist
  app.use(serveStatic(path.join(process.cwd(), pth),
        {setHeaders: setAMPAccessControlHeader}));
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

app.listen(port, function() {
  console./*OK*/log('serving %s at http://localhost:%s', paths, port);
});

