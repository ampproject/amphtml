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
var app = require('express')();
var bacon = require('baconipsum');
var bodyParser = require('body-parser');
var morgan = require('morgan');
var fs = BBPromise.promisifyAll(require('fs'));
var formidable = require('formidable');
var jsdom = require('jsdom');
var path = require('path');
var request = require('request');
var url = require('url');

app.use(bodyParser.json());
app.use(morgan('dev'));

app.use('/pwa', function(req, res, next) {
  var file;
  var contentType;
  if (!req.url || req.url == '/') {
    // pwa.html
    contentType = 'text/html';
    file = '/examples/pwa/pwa.html';
  } else if (req.url == '/pwa.js') {
    // pwa.js
    contentType = 'application/javascript';
    file = '/examples/pwa/pwa.js';
  } else if (req.url == '/pwa-sw.js') {
    // pwa.js
    contentType = 'application/javascript';
    file = '/examples/pwa/pwa-sw.js';
  } else {
    // Redirect to the underlying resource.
    // TODO(dvoytenko): would be nicer to do forward instead of redirect.
    res.writeHead(302, {'Location': req.url});
    res.end();
    return;
  }
  res.statusCode = 200;
  res.setHeader('Content-Type', contentType);
  fs.readFileAsync(process.cwd() + file).then((file) => {
    res.end(file);
  });
});

app.use('/examples', function(req, res) {
  res.redirect('/examples.build');
});

app.use('/api/show', function(req, res) {
  res.json({
    showNotification: true
  });
});

app.use('/api/dont-show', function(req, res) {
  res.json({
    showNotification: false
  });
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
    res.setHeader('AMP-Access-Control-Allow-Source-Origin',
        req.protocol + '://' + req.headers.host);
    res.end(JSON.stringify(fields));
  });
});

app.use('/share-tracking/get-outgoing-fragment', function(req, res) {
  res.setHeader('AMP-Access-Control-Allow-Source-Origin',
      req.protocol + '://' + req.headers.host);
  res.json({
    fragment: '54321'
  });
});

// Fetches an AMP document from the AMP proxy and replaces JS
// URLs, so that they point to localhost.
function proxyToAmpProxy(req, res, minify) {
  var url = 'https://cdn.ampproject.org/c' + req.url;
  var localUrlPrefix = getUrlPrefix(req);
  request(url, function (error, response, body) {
    body = body
        // Unversion URLs.
        .replace(/https\:\/\/cdn\.ampproject\.org\/rtv\/\d+\//g,
            'https://cdn.ampproject.org/')
        // <base> href pointing to the proxy, so that images, etc. still work.
        .replace('<head>', '<head><base href="https://cdn.ampproject.org/">')
        .replace(/(https:\/\/cdn.ampproject.org\/.+?).js/g, '$1.max.js')
        .replace('https://cdn.ampproject.org/v0.max.js',
            localUrlPrefix + '/dist/amp.js')
        .replace(/https:\/\/cdn.ampproject.org\/v0\//g,
            localUrlPrefix + '/dist/v0/');
    if (minify) {
      body = body.replace(/\.max\.js/g, '.js')
          .replace('/dist/amp.js', '/dist/v0.js');
    }
    res.status(response.statusCode).send(body);
  });
}

// Match max/min/none (using \*)
app.use('/examples.build/live-list.amp.\*html', function(req, res) {
  res.setHeader('Content-Type', 'text/html');
  res.statusCode = 200;
  fs.readFileAsync(process.cwd() +
      '/examples.build/live-list.amp.max.html').then((file) => {
        res.end(file);
  });
});

var liveListUpdateFile = '/examples.build/live-list-update.amp.max.html';
var liveListCtr = 0;
var itemCtr = 2;
var liveListDoc = null;
var doctype = '<!doctype html>\n';
app.use(liveListUpdateFile, function(req, res) {
  if (!liveListDoc) {
    var liveListUpdateFullPath = `${process.cwd()}${liveListUpdateFile}`;
    var liveListFile = fs.readFileSync(liveListUpdateFullPath);
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

function getLiveBlogItem() {
  var now = Date.now();
  // Value is inclusive of both min and max values.
  function range(min, max) {
    var values = Array.apply(null, Array(max - min + 1)).map((_, i) => min + i);
    return values[Math.round(Math.random() * (max - min))]
  }
  function flip() {
    return !!Math.floor(Math.random() * 2);
  }
  // Generate a 3 to 7 worded headline
  var headline = bacon(range(3, 7));
  var numOfParagraphs = range(1, 2);
  var body = Array.apply(null, Array(numOfParagraphs)).map(x => {
    return `<p>${bacon(range(50, 90))}</p>`;
  }).join('\n');

  var img =  `<amp-img
        src="${flip() ? 'https://placekitten.com/300/350' : 'https://baconmockup.com/300/350'}"
        layout="responsive"
         height="300" width="350">
      </amp-img>`;
  return `<!doctype html>
    <html amp><body>
    <amp-live-list id="live-blog-1">
    <div items>
      <div id="live-blog-item-${now}" data-sort-time="${now}">
        <h3 class="headline">
          <a href="#live-blog-item-${now}">${headline}</a>
        </h3>
        <div class="author">
          <div class="byline">
            <p>
              by <span itemscope itemtype="http://schema.org/Person"
              itemprop="author"><b>Lorem Ipsum</b>
              <a class="mailto" href="mailto:lorem.ipsum@">
              lorem.ipsum@</a></span>
            </p>
            <p class="brand">PublisherName News Reporter<p>
            <p><span itemscope itemtype="http://schema.org/Date"
                itemprop="Date">${Date(now).replace(/ GMT.*$/, '')}<span></p>
          </div>
        </div>
        <div class="article-body">${body}</div>
        ${img}
        <div class="social-box">
          <amp-social-share type="facebook"
              data-param-text="Hello world"
              data-param-href="https://example.com/?ref=URL"
              data-param-app_id="145634995501895"></amp-social-share>
          <amp-social-share type="twitter"></amp-social-share>
        </div>
      </div>
    </div>
    </amp-live-list></body></html>`;
}

// Will match live-blog max/min/none
app.use('/examples.build/live-blog(-non-floating-button)?.amp.(min.|max.)?html',
  function(req, res, next) {
    if ('amp_latest_update_time' in req.query) {
      res.setHeader('Content-Type', 'text/html');
      res.end(getLiveBlogItem());
      return;
    }
    next();
});

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

app.use('/examples.build/analytics.config.json', function (req, res, next) {
  res.setHeader('AMP-Access-Control-Allow-Source-Origin', getUrlPrefix(req));
  next();
});

exports.app = app;

function getUrlPrefix(req) {
  return req.protocol + '://' + req.headers.host;
}
