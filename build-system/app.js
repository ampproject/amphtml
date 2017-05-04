/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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
var fs = BBPromise.promisifyAll(require('fs'));
var formidable = require('formidable');
var jsdom = require('jsdom');
var path = require('path');
var request = require('request');
var url = require('url');

app.use(bodyParser.json());
app.use('/request-bank', require('./request-bank'));

// Append ?csp=1 to the URL to turn on the CSP header.
// TODO: shall we turn on CSP all the time?
app.use(function(req, res, next) {
  if (req.query.csp) {
    res.set({
      'content-security-policy': "default-src * blob: data:; script-src https://cdn.ampproject.org/rtv/ https://cdn.ampproject.org/v0.js https://cdn.ampproject.org/v0/ https://cdn.ampproject.org/viewer/ http://localhost:8000 https://localhost:8000; object-src 'none'; style-src 'unsafe-inline' https://cloud.typography.com https://fast.fonts.net https://fonts.googleapis.com https://maxcdn.bootstrapcdn.com; report-uri https://csp-collector.appspot.com/csp/amp",
    });
  }
  next();
});

app.get('/serve_mode=:mode', function (req, res, next) {
  const newMode = req.params.mode;
  var info;
  if (newMode == 'default' || newMode == 'compiled' || newMode == 'cdn') {
    process.env.SERVE_MODE = newMode;
    info = '<h2>Serve mode changed to ' + newMode + '</h2>';
    res.send(info);
  } else {
    info = '<h2>Serve mode ' + newMode + ' is not supported. </h2>';
    res.status(400).send(info);
  }
});

// Deprecate usage of .min.html/.max.html
app.get(['/examples/*.(min|max).html', '/test/manual/*.(min|max).html',
    '/dist/cache-sw.(min|max).html'],
    function (req, res, next) {
      var filePath = req.url;
      res.send(generateInfo(filePath));
      return;
    });

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


app.use('/form/redirect-to/post', function(req, res) {
  assertCors(req, res, ['POST'], ['AMP-Redirect-To']);
  res.setHeader('AMP-Redirect-To', 'https://google.com');
  res.end('{}');
});


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
function proxyToAmpProxy(req, res, mode) {
  var url = 'https://cdn.ampproject.org/'
      + (req.query['amp_js_v'] ? 'v' : 'c')
      + req.url;
  console.log('Fetching URL: ' + url);
  request(url, function(error, response, body) {
    body = body
        // Unversion URLs.
        .replace(/https\:\/\/cdn\.ampproject\.org\/rtv\/\d+\//g,
            'https://cdn.ampproject.org/')
        // <base> href pointing to the proxy, so that images, etc. still work.
        .replace('<head>', '<head><base href="https://cdn.ampproject.org/">');
    const inabox = req.query['inabox'] == '1';
    const urlPrefix = getUrlPrefix(req);
    body = replaceUrls(mode, body, urlPrefix, inabox);
    if (inabox) {
      // Allow CORS requests for A4A.
      const origin = req.headers.origin || urlPrefix;
      enableCors(req, res, origin);
    }
    res.status(response.statusCode).send(body);
  });
}


var liveListUpdateFile = '/examples/live-list-update.amp.html';
var liveListCtr = 0;
var itemCtr = 2;
var liveListDoc = null;
var doctype = '<!doctype html>\n';
app.use('/examples/live-list-update.amp.html', function(req, res, next) {
  var mode = process.env.SERVE_MODE;
  if (mode != 'compiled' && mode != 'default') {
    // Only handle compile(prev min)/default (prev max) mode
    next();
    return;
  }
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
    var item = liveList./*OK*/querySelector(`#list-item-${tombstoneId}`);
    if (item) {
      item.setAttribute('data-tombstone', '');
    }
  }
}


// Generate a random number between min and max
// Value is inclusive of both min and max values.
function range(min, max) {
  var values = Array.apply(null, Array(max - min + 1)).map((_, i) => min + i);
  return values[Math.round(Math.random() * (max - min))]
}

// Returns the result of a coin flip, true or false
function flip() {
  return !!Math.floor(Math.random() * 2);
}

function getLiveBlogItem() {
  var now = Date.now();
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

function getLiveBlogItemWithBindAttributes() {
  var now = Date.now();
  // Generate a 3 to 7 worded headline
  var headline = bacon(range(3, 7));
  var numOfParagraphs = range(1, 2);
  var body = Array.apply(null, Array(numOfParagraphs)).map(x => {
    return `<p>${bacon(range(50, 90))}</p>`;
  }).join('\n');

  return `<!doctype html>
    <html amp><body>
    <amp-live-list id="live-blog-1">
    <div items>
      <div id="live-blog-item-${now}" data-sort-time="${now}">
        <div class="article-body">
          ${body}
          <p> As you can see, bacon is far superior to <b><span [text]='favoriteFood'>everything!</span></b>!</p>
        </div>
      </div>
    </div>
    </amp-live-list></body></html>`;
}

app.use('/examples/live-blog(-non-floating-button)?.amp.html',
  function(req, res, next) {
    if ('amp_latest_update_time' in req.query) {
      res.setHeader('Content-Type', 'text/html');
      res.end(getLiveBlogItem());
      return;
    }
    next();
});

app.use('/examples/bind/live-list.amp.html',
  function(req, res, next) {
    if ('amp_latest_update_time' in req.query) {
      res.setHeader('Content-Type', 'text/html');
      res.end(getLiveBlogItemWithBindAttributes());
      return;
    }
    next();
});

app.use('/examples/amp-fresh.amp.html', function(req, res, next) {
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

// Proxy with local JS.
// Example:
// http://localhost:8000/proxy/s/www.washingtonpost.com/amphtml/news/post-politics/wp/2016/02/21/bernie-sanders-says-lower-turnout-contributed-to-his-nevada-loss-to-hillary-clinton/
app.use('/proxy/', function(req, res) {
  var mode = process.env.SERVE_MODE;
  proxyToAmpProxy(req, res, mode);
});

// Nest the response in an iframe.
// Example:
// http://localhost:8000/iframe/examples/ads.amp.html
app.get('/iframe/*', function(req, res) {
  // Returns an html blob with an iframe pointing to the url after /iframe/.
  res.send(`<!doctype html>
          <html style="width:100%; height:100%;">
            <body style="width:98%; height:98%;">
              <iframe src="${req.url.substr(7)}" style="width:100%; height:100%;">
              </iframe>
            </body>
          </html>`);
});

// Returns a document that echoes any post messages received from parent.
// An optional `message` query param can be appended for an initial post
// message sent on document load.
// Example:
// http://localhost:8000/iframe-echo-message?message=${payload}
app.get('/iframe-echo-message', function(req, res) {
  const message = req.query.message;
  res.send(
      `<!doctype html>
        <body style="background-color: yellow">
        <script>
        if (${message}) {
          echoMessage(${message});
        }
        window.addEventListener('message', function(event) {
          echoMessage(event.data);
        });
        function echoMessage(message) {
          parent.postMessage(message, '*');
        }
        </script>
        </body>
      </html>`);
});

// A4A envelope.
// Examples:
// http://localhost:8000/a4a[-3p]/examples/animations.amp.html
// http://localhost:8000/a4a[-3p]/proxy/s/www.washingtonpost.com/amphtml/news/post-politics/wp/2016/02/21/bernie-sanders-says-lower-turnout-contributed-to-his-nevada-loss-to-hillary-clinton/
app.use('/a4a(|-3p)/', function(req, res) {
  var force3p = req.baseUrl.indexOf('/a4a-3p') == 0;
  var adUrl = req.url;
  var templatePath = '/build-system/server-a4a-template.html';
  var urlPrefix = getUrlPrefix(req);
  if (!adUrl.startsWith('/proxy') &&
      urlPrefix.indexOf('//localhost') != -1) {
    // This is a special case for testing. `localhost` URLs are transformed to
    // `ads.localhost` to ensure that the iframe is fully x-origin.
    adUrl = urlPrefix.replace('localhost', 'ads.localhost') + adUrl;
  }
  adUrl = addQueryParam(adUrl, 'inabox', 1);
  fs.readFileAsync(process.cwd() + templatePath, 'utf8').then(template => {
    var result = template
        .replace(/FORCE3P/g, force3p)
        .replace(/DISABLE3PFALLBACK/g, !force3p)
        .replace(/OFFSET/g, req.query.offset || '0px')
        .replace(/AD_URL/g, adUrl)
        .replace(/AD_WIDTH/g, req.query.width || '300')
        .replace(/AD_HEIGHT/g, req.query.height || '250');
    res.end(result);
  });
});

// In-a-box envelope.
// Examples:
// http://localhost:8000/inabox/examples/animations.amp.html
// http://localhost:8000/inabox/proxy/s/www.washingtonpost.com/amphtml/news/post-politics/wp/2016/02/21/bernie-sanders-says-lower-turnout-contributed-to-his-nevada-loss-to-hillary-clinton/
app.use('/inabox/', function(req, res) {
  var adUrl = req.url;
  var templatePath = '/build-system/server-inabox-template.html';
  var urlPrefix = getUrlPrefix(req);
  if (!adUrl.startsWith('/proxy') &&  // Ignore /proxy
      urlPrefix.indexOf('//localhost') != -1) {
    // This is a special case for testing. `localhost` URLs are transformed to
    // `ads.localhost` to ensure that the iframe is fully x-origin.
    adUrl = urlPrefix.replace('localhost', 'ads.localhost') + adUrl;
  }
  adUrl = addQueryParam(adUrl, 'inabox', 1);
  fs.readFileAsync(process.cwd() + templatePath, 'utf8').then(template => {
    var result = template
        .replace(/AD_URL/g, adUrl)
        .replace(/OFFSET/g, req.query.offset || '0px')
        .replace(/AD_WIDTH/g, req.query.width || '300')
        .replace(/AD_HEIGHT/g, req.query.height || '250');
    res.end(result);
  });
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

/**
 * Append ?sleep=5 to any included JS file in examples to emulate delay in loading that
 * file. This allows you to test issues with your extension being late to load
 * and testing user interaction with your element before your code loads.
 *
 * Example delay loading amp-form script by 5 seconds:
 * <script async custom-element="amp-form"
 *    src="https://cdn.ampproject.org/v0/amp-form-0.1.js?sleep=5"></script>
 */
app.use(['/dist/v0/amp-*.js'], function(req, res, next) {
  var sleep = parseInt(req.query.sleep || 0) * 1000;
  setTimeout(next, sleep);
});

app.get(['/examples/*.html', '/test/manual/*.html'], function(req, res, next) {
  var filePath = req.path;
  var mode = process.env.SERVE_MODE;
  const inabox = req.query['inabox'] == '1';
  fs.readFileAsync(process.cwd() + filePath, 'utf8').then(file => {
    if (req.query['amp_js_v']) {
      file = addViewerIntegrationScript(req.query['amp_js_v'], file);
    }

    file = replaceUrls(mode, file, '', inabox);

    if (inabox && req.headers.origin && req.query.__amp_source_origin) {
      // Allow CORS requests for A4A.
      enableCors(req, res, req.headers.origin);
    }

    // Extract amp-ad for the given 'type' specified in URL query.
    if (req.path.indexOf('/examples/ads.amp') == 0 && req.query.type) {
      var ads = file.match(new RegExp('<(amp-ad|amp-embed) [^>]*[\'"]'
          + req.query.type + '[\'"][^>]*>([\\s\\S]+?)<\/(amp-ad|amp-embed)>', 'gm'));
      file = file.replace(
          /<body>[\s\S]+<\/body>/m, '<body>' + ads.join('') + '</body>');
    }

    res.send(file);
  }).catch(() => {
    next();
  });
});

// Data for example: http://localhost:8000/examples/bind/xhr.amp.max.html
app.use('/bind/form/get', function(req, res, next) {
  assertCors(req, res, ['GET']);
  res.json({
    bindXhrResult: 'I was fetched from the server!'
  });
});

// Data for example: http://localhost:8000/examples/bind/ecommerce.amp.max.html
app.use('/bind/ecommerce/sizes', function(req, res, next) {
  assertCors(req, res, ['GET']);
  setTimeout(() => {
    var prices = {
      "0": {
        "sizes": {
          "XS": 8.99,
          "S": 9.99,
        },
      },
      "1": {
        "sizes": {
          "S": 10.99,
          "M": 12.99,
          "L": 14.99,
        },
      },
      "2": {
        "sizes": {
          "L": 11.99,
          "XL": 13.99,
        },
      },
      "3": {
        "sizes": {
          "M": 7.99,
          "L": 9.99,
          "XL": 11.99,
        },
      },
      "4": {
        "sizes": {
          "XS": 8.99,
          "S": 10.99,
          "L": 15.99,
        },
      },
      "5": {
        "sizes": {
          "S": 8.99,
          "L": 14.99,
          "XL": 11.99,
        },
      },
      "6": {
        "sizes": {
          "XS": 8.99,
          "S": 9.99,
          "M": 12.99,
        },
      },
      "7": {
        "sizes": {
          "M": 10.99,
          "L": 11.99,
        },
      },
    };
    const object = {};
    object[req.query.shirt] = prices[req.query.shirt];
    res.json(object);
  }, 1000); // Simulate network delay.
});

app.use('/list/fruit-data/get', function(req, res, next) {
  assertCors(req, res, ['GET']);
  res.json({
    items: [
      {name: 'apple', quantity: 47, unitPrice: '0.33'},
      {name: 'pear', quantity: 538, unitPrice: '0.54'},
      {name: 'tomato', quantity: 0, unitPrice: '0.23'},
    ],
  });
});

app.use('/list/vegetable-data/get', function(req, res, next) {
  assertCors(req, res, ['GET']);
  res.json({
    items: [
      {name: 'cabbage', quantity: 5, unitPrice: '1.05'},
      {name: 'carrot', quantity: 10, unitPrice: '0.01'},
      {name: 'brocoli', quantity: 7, unitPrice: '0.02'},
    ],
  });
});

// Simulated Cloudflare signed Ad server

const cloudflareDataDir = '/extensions/amp-ad-network-cloudflare-impl/0.1/data';
const fakeAdNetworkDataDir = '/extensions/amp-ad-network-fake-impl/0.1/data'

/**
 * Handle CORS headers
 */
app.use([cloudflareDataDir], function fakeCors(req, res, next) {
  assertCors(req, res, ['GET', 'OPTIONS'], ['X-AmpAdSignature']);

  if (req.method=='OPTIONS') {
    res.status(204).end();
  } else {
    next();
  }
});

/**
 * Handle fake a4a data
 */
app.get([ fakeAdNetworkDataDir + '/*', cloudflareDataDir + '/*'], function(req, res) {
  var filePath = req.path;
  var unwrap = false;
  if (req.path.endsWith('.html')) {
    filePath = req.path.slice(0,-5)
    unwrap = true
  }
  filePath = process.cwd() + filePath
  fs.readFileAsync(filePath).then(file => {
    if (!unwrap) {
      res.end(file)
      return
    }
    const metadata = JSON.parse(file);
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('X-AmpAdSignature', metadata.signature);
    res.end(metadata.creative);
  }).error( () => {
    res.status(404);
    res.end("Not found: " + filePath);
  });
});

/*
 * Serve extension script url
 */
app.get('/dist/rtv/*/v0/*.js', function(req, res, next) {
  var mode = process.env.SERVE_MODE;
  var fileName = path.basename(req.path);
  var filePath = 'https://cdn.ampproject.org/v0/' + fileName;
  if (mode == 'cdn') {
    // This will not be useful until extension-location.js change in prod
    // Require url from cdn
    request(filePath, function (error, response) {
      if (error) {
        res.status(404);
        res.end();
      } else {
        res.send(response);
      }
    });
    return;
  }
  filePath = replaceUrls(mode, filePath);
  req.url = filePath;
  next();
});

/**
 * Serve entry point script url
 */
app.get(['/dist/sw.js', '/dist/sw-kill.js', '/dist/ww.js'],
    function(req, res, next) {
      // Speical case for entry point script url. Use compiled for testing
      var mode = process.env.SERVE_MODE;
      var fileName = path.basename(req.path);
      if (mode == 'cdn') {
        // This will not be useful until extension-location.js change in prod
        // Require url from cdn
        var filePath = 'https://cdn.ampproject.org/' + fileName;
        request(filePath, function(error, response) {
          if (error) {
            res.status(404);
            res.end();
          } else {
            res.send(response);
          }
        });
        return;
      }
      if (mode == 'default') {
        var fileUrl = req.url;
        req.url = req.url.replace(/\.js$/, '.max.js');
      }
      next();
    });

/*
 * Start Cache SW LOCALDEV section
 */
app.get('/dist/sw(.max)?.js', function(req, res, next) {
  var filePath = req.path;
  fs.readFileAsync(process.cwd() + filePath, 'utf8').then(file => {
    var n = new Date();
    // Round down to the nearest 5 minutes.
    n -= ((n.getMinutes() % 5) * 1000 * 60) + (n.getSeconds() * 1000) + n.getMilliseconds();
    file = 'self.AMP_CONFIG = {v: "99' + n + '",' +
        'cdnUrl: "http://localhost:8000/dist"};'
        + file;
    res.setHeader('Content-Type', 'application/javascript');
    res.setHeader('Date', new Date().toUTCString());
    res.setHeader('Cache-Control', 'no-cache;max-age=150');
    res.end(file);
  }).catch(next);
});

app.get('/dist/rtv/9[89]*/*.js', function(req, res, next) {
  res.setHeader('Content-Type', 'application/javascript');
  res.setHeader('Date', new Date().toUTCString());
  res.setHeader('Cache-Control', 'no-cache;max-age=31536000');

  setTimeout(() => {
    // Cause a delay, to show the "stale-while-revalidate"
    if (req.path.includes('v0.js')) {
      var path = req.path.replace(/rtv\/\d+/, '');
      return fs.readFileAsync(process.cwd() + path, 'utf8')
        .then(file => {
          res.end(file);
        }).catch(next);
    }

    res.end(`
      var li = document.createElement('li');
      li.textContent = '${req.path}';
      loaded.appendChild(li);
    `);
  }, 2000);
});

app.get(['/dist/cache-sw.html'], function(req, res, next) {
  var filePath = '/test/manual/cache-sw.html';
  fs.readFileAsync(process.cwd() + filePath, 'utf8').then(file => {
    var n = new Date();
    // Round down to the nearest 5 minutes.
    n -= ((n.getMinutes() % 5) * 1000 * 60) + (n.getSeconds() * 1000) + n.getMilliseconds();
    var percent = parseFloat(req.query.canary) || 0.01;
    var env = '99';
    if (Math.random() < percent) {
      env = '98';
      n += 5 * 1000 * 60;
    }
    file = file.replace(/dist\/v0/g, `dist/rtv/${env}${n}/v0`);
    file = file.replace(/CURRENT_RTV/, env + n);

    res.setHeader('Content-Type', 'text/html');
    res.end(file);
  }).catch(next);
});

app.get('/dist/diversions', function(req, res, next) {
  var n = new Date();
  // Round down to the nearest 5 minutes.
  n -= ((n.getMinutes() % 5) * 1000 * 60) + (n.getSeconds() * 1000) + n.getMilliseconds();
  n += 5 * 1000 * 60;
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Date', new Date().toUTCString());
  res.setHeader('Cache-Control', 'no-cache;max-age=150');
  res.end(JSON.stringify(["98" + n]));
});
/*
 * End Cache SW LOCALDEV section
 */

/**
 * Web worker binary.
 */
app.get('/dist/ww(.max)?.js', function(req, res) {
  fs.readFileAsync(process.cwd() + req.path).then(file => {
    res.setHeader('Content-Type', 'text/javascript');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.end(file);
  });
});

/**
 * @param {string} mode
 * @param {string} file
 * @param {string=} hostName
 * @param {boolean=} inabox
 */
function replaceUrls(mode, file, hostName, inabox) {
  hostName = hostName || '';
  if (mode == 'default') {
    file = file.replace('https://cdn.ampproject.org/v0.js', hostName + '/dist/amp.js');
    file = file.replace('https://cdn.ampproject.org/amp4ads-v0.js', hostName + '/dist/amp-inabox.js');
    file = file.replace(/https:\/\/cdn.ampproject.org\/v0\/(.+?).js/g, hostName + '/dist/v0/$1.max.js');
    if (inabox) {
      file = file.replace('/dist/amp.js', '/dist/amp-inabox.js');
    }
  } else if (mode == 'compiled') {
    file = file.replace('https://cdn.ampproject.org/v0.js', hostName + '/dist/v0.js');
    file = file.replace('https://cdn.ampproject.org/amp4ads-v0.js', hostName + '/dist/amp4ads-v0.js');
    file = file.replace(/https:\/\/cdn.ampproject.org\/v0\/(.+?).js/g, hostName + '/dist/v0/$1.js');
    file = file.replace(/\/dist.3p\/current\/(.*)\.max.html/, hostName + '/dist.3p/current-min/$1.html');
    if (inabox) {
      file = file.replace('/dist/v0.js', '/dist/amp4ads-v0.js');
    }
  }
  return file;
}

/**
 * @param {string} ampJsVersion
 * @param {string} file
 */
function addViewerIntegrationScript(ampJsVersion, file) {
  ampJsVersion = parseFloat(ampJsVersion);
  if (!ampJsVersion) {
    return file;
  }
  var viewerScript;
  if (Number.isInteger(ampJsVersion)) {
    // Viewer integration script from gws, such as
    // https://cdn.ampproject.org/viewer/google/v7.js
    viewerScript = '<script async src="https://cdn.ampproject.org/viewer/google/v' +
        ampJsVersion + '.js"></script>';
  } else {
    // Viewer integration script from runtime, such as
    // https://cdn.ampproject.org/v0/amp-viewer-integration-0.1.js
    viewerScript = '<script async src="https://cdn.ampproject.org/v0/amp-viewer-integration-' +
        ampJsVersion + '.js" data-amp-report-test="viewer-integr.js"></script>';
  }
  file = file.replace('</head>', viewerScript + '</head>');
  return file;
}

function getUrlPrefix(req) {
  return req.protocol + '://' + req.headers.host;
}

/**
 * @param {string} url
 * @param {string} param
 * @param {*} value
 * @return {string}
 */
function addQueryParam(url, param, value) {
  const paramValue =
      encodeURIComponent(param) + '=' + encodeURIComponent(value);
  if (!url.includes('?')) {
    url += '?' + paramValue;
  } else {
    url += '&' + paramValue;
  }
  return url;
}

function enableCors(req, res, origin, opt_exposeHeaders) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Expose-Headers',
      ['AMP-Access-Control-Allow-Source-Origin']
          .concat(opt_exposeHeaders || []).join(', '));
  res.setHeader('AMP-Access-Control-Allow-Source-Origin',
      req.query.__amp_source_origin);
}

function assertCors(req, res, opt_validMethods, opt_exposeHeaders) {
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

  enableCors(req, res, origin, opt_exposeHeaders);
}

function generateInfo(filePath) {
  var mode = process.env.SERVE_MODE;
  filePath = filePath.substr(0, filePath.length - 9) + '.html';

  var info = '<h2>Please note that .min/.max is no longer supported</h2>' +
      '<h3>Current serving mode is ' + mode + '</h3>' +
      '<h3>Please go to <a href= ' + filePath +
      '>Unversioned Link</a> to view the page<h3>' +
      '<h3></h3>' +
      '<h3><a href = /serve_mode=default>Change to DEFAULT mode (unminified JS)</a></h3>' +
      '<h3><a href = /serve_mode=compiled>Change to COMPILED mode (minified JS)</a></h3>' +
      '<h3><a href = /serve_mode=cdn>Change to CDN mode (prod JS)</a></h3>';
  return info;
}

module.exports = app;
