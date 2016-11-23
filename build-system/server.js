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

/**
 * In practice this would be *.ampproject.org and the publishers
 * origin. Please see AMP CORS docs for more details:
 *    https://goo.gl/F6uCAY
 * @type {RegExp}
 */
const ORIGIN_REGEX = new RegExp('^http://localhost:8000|' +
    '^https?://.+\.herokuapp\.com');

/**
 * In practice this would be the publishers origin.
 * Please see AMP CORS docs for more details:
 *    https://goo.gl/F6uCAY
 * @type {RegExp}
 */
const SOURCE_ORIGIN_REGEX = new RegExp('^http://localhost:8000|' +
    '^https?://.+\.herokuapp\.com');

app.use('/form/html/post', function(req, res) {
  assertCors(req, res, ['POST']);

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

function assertCors(req, res, opt_validMethods) {
  const validMethods = opt_validMethods || ['GET', 'POST', 'OPTIONS'];
  const invalidMethod = req.method + ' method is not allowed. Use POST.';
  const invalidOrigin = 'Origin header is invalid.';
  const invalidSourceOrigin = '__amp_source_origin parameter is invalid.';
  const unauthorized = 'Unauthorized Request';
  var origin;

  if (validMethods.indexOf(req.method) == -1) {
    res.statusCode = 405;
    res.end(JSON.stringify({message: invalidMethod}));
    throw invalidMethod;
  }

  if (req.headers.origin) {
    origin = req.headers.origin;
    if (!ORIGIN_REGEX.test(req.headers.origin)) {
      res.statusCode = 500;
      res.end(JSON.stringify({message: invalidOrigin}));
      throw invalidOrigin;
    }

    if (!SOURCE_ORIGIN_REGEX.test(req.query.__amp_source_origin)) {
      res.statusCode = 500;
      res.end(JSON.stringify({message: invalidSourceOrigin}));
      throw invalidSourceOrigin;
    }
  } else if (req.headers['amp-same-origin'] == 'true') {
    origin = getUrlPrefix(req);
  } else {
    res.statusCode = 401;
    res.end(JSON.stringify({message: unauthorized}));
    throw unauthorized;
  }

  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Expose-Headers',
      'AMP-Access-Control-Allow-Source-Origin')
  res.setHeader('AMP-Access-Control-Allow-Source-Origin',
      req.query.__amp_source_origin);
}

app.use('/form/echo-json/post', function(req, res) {
  assertCors(req, res, ['POST']);
  var form = new formidable.IncomingForm();
  form.parse(req, function(err, fields) {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    if (fields['email'] == 'already@subscribed.com') {
      res.statusCode = 500;
    }
    res.end(JSON.stringify(fields));
  });
});

app.use('/form/json/poll1', function(req, res) {
  assertCors(req, res, ['POST']);
  var form = new formidable.IncomingForm();
  form.parse(req, function(err, fields) {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      result: [{
        answer: 'Penguins',
        percentage: new Array(77),
      }, {
        answer: 'Ostriches',
        percentage: new Array(8),
      }, {
        answer: 'Kiwis',
        percentage: new Array(14),
      }, {
        answer: 'Wekas',
        percentage: new Array(1),
      },]
    }));
  });
});

app.use('/form/search-html/get', function(req, res) {
  res.setHeader('Content-Type', 'text/html');
  res.end(`
     <h1>Here's results for your search<h1>
     <ul>
      <li>Result 1</li>
      <li>Result 2</li>
      <li>Result 3</li>
     </ul>
  `);
});


app.use('/form/search-json/get', function(req, res) {
  assertCors(req, res, ['GET']);
  res.json({
    results: [{title: 'Result 1'}, {title: 'Result 2'}, {title: 'Result 3'}]
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

var liveListUpdateFile = '/examples/live-list-update.amp.html';
var liveListCtr = 0;
var itemCtr = 2;
var liveListDoc = null;
var doctype = '<!doctype html>\n';
// Only handle min/max
app.use('/examples/live-list-update.amp.(min|max).html', function(req, res) {
  var filePath = req.baseUrl;
  var mode = getPathMode(filePath);
  // When we already have state in memory and user refreshes page, we flush
  // the dom we maintain on the server.
  if (!('amp_latest_update_time' in req.query) && liveListDoc) {
    var outerHTML = liveListDoc.documentElement./*OK*/outerHTML;
    outerHTML = replaceUrls(mode, outerHTML);
    res.send(`${doctype}${outerHTML}`);
    return;
  }
  if (!liveListDoc) {
    var liveListUpdateFullPath = `${process.cwd()}${liveListUpdateFile}`;
    var liveListFile = fs.readFileSync(liveListUpdateFullPath);
    liveListDoc = jsdom.jsdom(liveListFile);
  }
  var action = Math.floor(Math.random() * 3);
  var liveList = liveListDoc.querySelector('#my-live-list');
  var perPage = Number(liveList.getAttribute('data-max-items-per-page'));
  var items = liveList.querySelector('[items]');
  var pagination = liveListDoc.querySelector('#my-live-list [pagination]');
  var item1 = liveList.querySelector('#list-item-1');
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
      pagination.textContent = '';
      var liveChildren = [].slice.call(items.children)
          .filter(x => !x.hasAttribute('data-tombstone'));

      var pageCount = Math.ceil(liveChildren.length / perPage);
      var pageListItems = Array.apply(null, Array(pageCount))
          .map((_, i) => `<li>${i + 1}</li>`).join('');
      var newPagination = '<nav aria-label="amp live list pagination">' +
          `<ul class="pagination">${pageListItems}</ul>` +
          '</nav>';
      pagination./*OK*/innerHTML = newPagination;
    } else {
      // Sometimes we want an empty response to simulate no changes.
      res.send(`${doctype}<html></html>`);
      return;
    }
  }
  var outerHTML = liveListDoc.documentElement./*OK*/outerHTML;
  outerHTML = replaceUrls(mode, outerHTML);
  liveListCtr++;
  res.send(`${doctype}${outerHTML}`);
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

app.use('/examples/live-blog(-non-floating-button)?.amp.(min.|max.)?html',
  function(req, res, next) {
    if ('amp_latest_update_time' in req.query) {
      res.setHeader('Content-Type', 'text/html');
      res.end(getLiveBlogItem());
      return;
    }
    next();
});

app.use('/examples/amp-fresh.amp.(min.|max.)?html', function(req, res, next) {
    if ('amp-fresh' in req.query && req.query['amp-fresh']) {
      res.setHeader('Content-Type', 'text/html');
      res.end(`<!doctype html>
          <html ⚡>
            <body>
              <amp-fresh id="amp-fresh-1"><span>hello</span> world!</amp-fresh>
              <amp-fresh id="amp-fresh-2">foo bar</amp-fresh>
            </body>
          </html>`);
      return;
    }
    next();
});


app.use('/impression-proxy/', function(req, res) {
  assertCors(req, res, ['GET']);
  // Fake response with the following optional fields:
  // location: The Url the that server would have sent redirect to w/o ALP
  // tracking_url: URL that should be requested to track click
  // gclid: The conversion tracking value
  const body = {
    'location': 'localhost:8000/examples/?gclid=1234&foo=bar&example=123',
    'tracking_url': 'tracking_url',
    'gclid': '1234',
  };
  res.send(body);
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

app.use('/examples/analytics.config.json', function(req, res, next) {
  res.setHeader('AMP-Access-Control-Allow-Source-Origin', getUrlPrefix(req));
  next();
});

app.use(['/examples/*', '/extensions/*'], function (req, res, next) {
  var sourceOrigin = req.query['__amp_source_origin'];
  if (sourceOrigin) {
    res.setHeader('AMP-Access-Control-Allow-Source-Origin', sourceOrigin);
  }
  next();
});

app.get(['/examples/*', '/test/manual/*'], function(req, res, next) {
  var filePath = req.path;
  var mode = getPathMode(filePath);
  if (!mode) {
    return next();
  }
  filePath = filePath.substr(0, filePath.length - 9) + '.html';
  fs.readFileAsync(process.cwd() + filePath, 'utf8').then(file => {
    file = replaceUrls(mode, file);

    // Extract amp-ad for the given 'type' specified in URL query.
    if (req.path.indexOf('/examples/ads.amp') == 0 && req.query.type) {
      var ads = file.match(new RegExp('<amp-ad [^>]*'
          + req.query.type + '[^>]*>([\\s\\S]+?)<\/amp-ad>', 'gm'));
      file = file.replace(
          /<body>[\s\S]+<\/body>/m, '<body>' + ads.join('') + '</body>');
    }

    res.send(file);
  }).catch(() => {
    next();
  });
});

// "fake" a4a creative.
app.get('/extensions/amp-ad-network-fake-impl/0.1/data/fake_amp.json.html', function(req, res) {
  var filePath = '/extensions/amp-ad-network-fake-impl/0.1/data/fake_amp.json';
  fs.readFileAsync(process.cwd() + filePath).then(file => {
    const metadata = JSON.parse(file);
    res.setHeader('Content-Type', 'text/html');
    res.end(metadata.creative);
  });
});

/**
 * @param {string} mode
 * @param {string} file
 */
function replaceUrls(mode, file) {
  if (mode) {
    file = file.replace('https://cdn.ampproject.org/viewer/google/v5.js', 'https://cdn1.ampproject.org/viewer/google/v5.js');
    file = file.replace(/(https:\/\/cdn.ampproject.org\/.+?).js/g, '$1.max.js');
    file = file.replace('https://cdn.ampproject.org/v0.max.js', '/dist/amp.js');
    file = file.replace('https://cdn.ampproject.org/amp4ads-v0.max.js', '/dist/amp-inabox.js');
    file = file.replace(/https:\/\/cdn.ampproject.org\/v0\//g, '/dist/v0/');
    file = file.replace('https://cdn1.ampproject.org/viewer/google/v5.js', 'https://cdn.ampproject.org/viewer/google/v5.js');
  }
  if (mode == 'min') {
    file = file.replace(/\.max\.js/g, '.js');
    file = file.replace('/dist/amp.js', '/dist/v0.js');
    file = file.replace('/dist/amp-inabox.js', '/dist/amp4ads-v0.js');
  }
  return file;
}

/**
 * @param {string} path
 * @return {string}
 */
function extractFilePathSuffix(path) {
  return path.substr(-9);
}

/**
 * @param {string} path
 * @return {?string}
 */
function getPathMode(path) {
  var suffix = extractFilePathSuffix(path);
  if (suffix == '.max.html') {
    return 'max';
  } else if (suffix == '.min.html') {
    return 'min';
  } else {
    return null;
  }
}

exports.app = app;

function getUrlPrefix(req) {
  return req.protocol + '://' + req.headers.host;
}
