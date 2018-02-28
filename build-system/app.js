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
'use strict';

/**
 * @fileoverview Creates an http server to handle static
 * files and list directories for use with the gulp live server
 */
const app = require('express')();
const bacon = require('baconipsum');
const BBPromise = require('bluebird');
const bodyParser = require('body-parser');
const formidable = require('formidable');
const fs = BBPromise.promisifyAll(require('fs'));
const jsdom = require('jsdom');
const path = require('path');
const request = require('request');
const pc = process;

app.use(bodyParser.json());
app.use('/amp4test', require('./amp4test'));

// Append ?csp=1 to the URL to turn on the CSP header.
// TODO: shall we turn on CSP all the time?
app.use((req, res, next) => {
  if (req.query.csp) {
    res.set({
      'content-security-policy': "default-src * blob: data:; script-src https://cdn.ampproject.org/rtv/ https://cdn.ampproject.org/v0.js https://cdn.ampproject.org/v0/ https://cdn.ampproject.org/viewer/ http://localhost:8000 https://localhost:8000; object-src 'none'; style-src 'unsafe-inline' https://cdn.ampproject.org/rtv/ https://cdn.materialdesignicons.com https://cloud.typography.com https://fast.fonts.net https://fonts.googleapis.com https://maxcdn.bootstrapcdn.com https://p.typekit.net https://use.typekit.net; report-uri https://csp-collector.appspot.com/csp/amp",
    });
  }
  next();
});

app.get('/serve_mode=:mode', (req, res) => {
  const newMode = req.params.mode;
  let info;
  if (newMode == 'default' || newMode == 'compiled' || newMode == 'cdn') {
    pc.env.SERVE_MODE = newMode;
    info = '<h2>Serve mode changed to ' + newMode + '</h2>';
    res.send(info);
  } else {
    info = '<h2>Serve mode ' + newMode + ' is not supported. </h2>';
    res.status(400).send(info);
  }
});

// Deprecate usage of .min.html/.max.html
app.get([
  '/examples/*.(min|max).html',
  '/test/manual/*.(min|max).html',
  '/dist/cache-sw.(min|max).html',
], (req, res) => {
  const filePath = req.url;
  res.send(generateInfo(filePath));
});

app.use('/pwa', (req, res) => {
  let file;
  let contentType;
  if (!req.url || req.path == '/') {
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
  } else if (req.url == '/ampdoc-shell') {
    // pwa-ampdoc-shell.html
    contentType = 'text/html';
    file = '/examples/pwa/pwa-ampdoc-shell.html';
  } else {
    // Redirect to the underlying resource.
    // TODO(dvoytenko): would be nicer to do forward instead of redirect.
    res.writeHead(302, {'Location': req.url});
    res.end();
    return;
  }
  res.statusCode = 200;
  res.setHeader('Content-Type', contentType);
  fs.readFileAsync(pc.cwd() + file).then(file => {
    res.end(file);
  });
});

app.use('/api/show', (req, res) => {
  res.json({
    showNotification: true,
  });
});

app.use('/api/dont-show', (req, res) => {
  res.json({
    showNotification: false,
  });
});

app.use('/api/echo/post', (req, res) => {
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

app.use('/form/html/post', (req, res) => {
  assertCors(req, res, ['POST']);

  const form = new formidable.IncomingForm();
  form.parse(req, (err, fields) => {
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


app.use('/form/redirect-to/post', (req, res) => {
  assertCors(req, res, ['POST'], ['AMP-Redirect-To']);
  res.setHeader('AMP-Redirect-To', 'https://google.com');
  res.end('{}');
});


app.use('/form/echo-json/post', (req, res) => {
  assertCors(req, res, ['POST']);
  const form = new formidable.IncomingForm();
  form.parse(req, (err, fields) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    if (fields['email'] == 'already@subscribed.com') {
      res.statusCode = 500;
    }
    res.end(JSON.stringify(fields));
  });
});

app.use('/form/json/poll1', (req, res) => {
  assertCors(req, res, ['POST']);
  const form = new formidable.IncomingForm();
  form.parse(req, () => {
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
      }],
    }));
  });
});

app.use('/form/search-html/get', (req, res) => {
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


app.use('/form/search-json/get', (req, res) => {
  assertCors(req, res, ['GET']);
  res.json({
    term: req.query.term,
    results: [{title: 'Result 1'}, {title: 'Result 2'}, {title: 'Result 3'}],
  });
});

const autosuggestLanguages = ['ActionScript', 'AppleScript', 'Asp', 'BASIC',
  'C', 'C++', 'Clojure', 'COBOL', 'ColdFusion', 'Erlang', 'Fortran', 'Go',
  'Groovy', 'Haskell', 'Java', 'JavaScript', 'Lisp', 'Perl', 'PHP', 'Python',
  'Ruby', 'Scala', 'Scheme'];

app.use('/form/autosuggest/query', (req, res) => {
  assertCors(req, res, ['GET']);
  const MAX_RESULTS = 4;
  const query = req.query.q;
  if (!query) {
    res.json({items: [{
      results: autosuggestLanguages.slice(0, MAX_RESULTS),
    }]});
  } else {
    const lowerCaseQuery = query.toLowerCase();
    const filtered = autosuggestLanguages.filter(
        l => l.toLowerCase().includes(lowerCaseQuery));
    res.json({items: [{
      results: filtered.slice(0, MAX_RESULTS)},
    ]});
  }
});

app.use('/form/autosuggest/search', (req, res) => {
  assertCors(req, res, ['POST']);
  const form = new formidable.IncomingForm();
  form.parse(req, function(err, fields) {
    res.json({
      query: fields.query,
      results: [{title: 'Result 1'}, {title: 'Result 2'}, {title: 'Result 3'}],
    });
  });
});

app.use('/form/verify-search-json/post', (req, res) => {
  assertCors(req, res, ['POST']);
  const form = new formidable.IncomingForm();
  form.parse(req, (err, fields) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');

    const errors = [];
    if (!fields.phone.match(/^650/)) {
      errors.push({name: 'phone', message: 'Phone must start with 650'});
    }
    if (fields.name !== 'Frank') {
      errors.push({name: 'name', message: 'Please set your name to be Frank'});
    }
    if (fields.error === 'true') {
      errors.push({message: 'You asked for an error, you get an error.'});
    }
    if (fields.city !== 'Mountain View' || fields.zip !== '94043') {
      errors.push({
        name: 'city',
        message: 'City doesn\'t match zip (Mountain View and 94043)',
      });
    }

    if (errors.length === 0) {
      res.end(JSON.stringify({
        results: [
          {title: 'Result 1'},
          {title: 'Result 2'},
          {title: 'Result 3'},
        ],
        committed: true,
      }));
    } else {
      res.statusCode = 400;
      res.end(JSON.stringify({verifyErrors: errors}));
    }
  });
});

app.use('/share-tracking/get-outgoing-fragment', (req, res) => {
  res.setHeader('AMP-Access-Control-Allow-Source-Origin',
      req.protocol + '://' + req.headers.host);
  res.json({
    fragment: '54321',
  });
});

// Fetches an AMP document from the AMP proxy and replaces JS
// URLs, so that they point to localhost.
function proxyToAmpProxy(req, res, mode) {
  const url = 'https://cdn.ampproject.org/'
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


const liveListUpdateFile = '/examples/live-list-update.amp.html';
let liveListCtr = 0;
let itemCtr = 2;
let liveListDoc = null;
const doctype = '<!doctype html>\n';
app.use('/examples/live-list-update.amp.html', (req, res, next) => {
  const mode = pc.env.SERVE_MODE;
  if (mode != 'compiled' && mode != 'default') {
    // Only handle compile(prev min)/default (prev max) mode
    next();
    return;
  }
  // When we already have state in memory and user refreshes page, we flush
  // the dom we maintain on the server.
  if (!('amp_latest_update_time' in req.query) && liveListDoc) {
    let outerHTML = liveListDoc.documentElement./*OK*/outerHTML;
    outerHTML = replaceUrls(mode, outerHTML);
    res.send(`${doctype}${outerHTML}`);
    return;
  }
  if (!liveListDoc) {
    const liveListUpdateFullPath = `${pc.cwd()}${liveListUpdateFile}`;
    const liveListFile = fs.readFileSync(liveListUpdateFullPath);
    liveListDoc = jsdom.jsdom(liveListFile);
  }
  const liveList = liveListDoc.querySelector('#my-live-list');
  const perPage = Number(liveList.getAttribute('data-max-items-per-page'));
  const items = liveList.querySelector('[items]');
  const pagination = liveListDoc.querySelector('#my-live-list [pagination]');
  const item1 = liveList.querySelector('#list-item-1');
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
      const liveChildren = [].slice.call(items.children)
          .filter(x => !x.hasAttribute('data-tombstone'));

      const pageCount = Math.ceil(liveChildren.length / perPage);
      const pageListItems = Array.apply(null, Array(pageCount))
          .map((_, i) => `<li>${i + 1}</li>`).join('');
      const newPagination = '<nav aria-label="amp live list pagination">' +
          `<ul class="pagination">${pageListItems}</ul>` +
          '</nav>';
      pagination./*OK*/innerHTML = newPagination;
    } else {
      // Sometimes we want an empty response to simulate no changes.
      res.send(`${doctype}<html></html>`);
      return;
    }
  }
  let outerHTML = liveListDoc.documentElement./*OK*/outerHTML;
  outerHTML = replaceUrls(mode, outerHTML);
  liveListCtr++;
  res.send(`${doctype}${outerHTML}`);
});

function liveListReplace(item) {
  item.setAttribute('data-update-time', Date.now());
  const itemContents = item.querySelectorAll('.content');
  itemContents[0].textContent = Math.floor(Math.random() * 10);
  itemContents[1].textContent = Math.floor(Math.random() * 10);
}

function liveListInsert(liveList, node) {
  const iterCount = Math.floor(Math.random() * 2) + 1;
  console.log(`inserting ${iterCount} item(s)`);
  for (let i = 0; i < iterCount; i++) {
    const child = node.cloneNode(true);
    child.setAttribute('id', `list-item-${itemCtr++}`);
    child.setAttribute('data-sort-time', Date.now());
    liveList.querySelector('[items]').appendChild(child);
  }
}

function liveListTombstone(liveList) {
  const tombstoneId = Math.floor(Math.random() * itemCtr);
  console.log(`trying to tombstone #list-item-${tombstoneId}`);
  // We can tombstone any list item except item-1 since we always do a
  // replace example on item-1.
  if (tombstoneId != 1) {
    const item = liveList./*OK*/querySelector(`#list-item-${tombstoneId}`);
    if (item) {
      item.setAttribute('data-tombstone', '');
    }
  }
}


// Generate a random number between min and max
// Value is inclusive of both min and max values.
function range(min, max) {
  const values =
      Array.apply(null, new Array(max - min + 1)).map((_, i) => min + i);
  return values[Math.round(Math.random() * (max - min))];
}

// Returns the result of a coin flip, true or false
function flip() {
  return !!Math.floor(Math.random() * 2);
}

function getLiveBlogItem() {
  const now = Date.now();
  // Generate a 3 to 7 worded headline
  const headline = bacon(range(3, 7));
  const numOfParagraphs = range(1, 2);
  const body = Array.apply(null, new Array(numOfParagraphs)).map(() => {
    return `<p>${bacon(range(50, 90))}</p>`;
  }).join('\n');

  const img = `<amp-img
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
  const now = Date.now();
  // Generate a 3 to 7 worded headline
  const numOfParagraphs = range(1, 2);
  const body = Array.apply(null, new Array(numOfParagraphs)).map(() => {
    return `<p>${bacon(range(50, 90))}</p>`;
  }).join('\n');

  return `<!doctype html>
    <html amp><body>
    <amp-live-list id="live-blog-1">
    <div items>
      <div id="live-blog-item-${now}" data-sort-time="${now}">
        <div class="article-body">
          ${body}
          <p> As you can see, bacon is far superior to
          <b><span [text]='favoriteFood'>everything!</span></b>!</p>
        </div>
      </div>
    </div>
    </amp-live-list></body></html>`;
}

app.use('/examples/live-blog(-non-floating-button)?.amp.html',
    (req, res, next) => {
      if ('amp_latest_update_time' in req.query) {
        res.setHeader('Content-Type', 'text/html');
        res.end(getLiveBlogItem());
        return;
      }
      next();
    });

app.use('/examples/bind/live-list.amp.html',
    (req, res, next) => {
      if ('amp_latest_update_time' in req.query) {
        res.setHeader('Content-Type', 'text/html');
        res.end(getLiveBlogItemWithBindAttributes());
        return;
      }
      next();
    });

app.use('/impression-proxy/', (req, res) => {
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

  // Or fake response with status 204 if viewer replaceUrl is provided
});

// Proxy with local JS.
// Example:
// http://localhost:8000/proxy/s/www.washingtonpost.com/amphtml/news/post-politics/wp/2016/02/21/bernie-sanders-says-lower-turnout-contributed-to-his-nevada-loss-to-hillary-clinton/
app.use('/proxy/', (req, res) => {
  const mode = pc.env.SERVE_MODE;
  proxyToAmpProxy(req, res, mode);
});

// Nest the response in an iframe.
// Example:
// http://localhost:8000/iframe/examples/ads.amp.html
app.get('/iframe/*', (req, res) => {
  // Returns an html blob with an iframe pointing to the url after /iframe/.
  res.send(`<!doctype html>
          <html style="width:100%; height:100%;">
            <body style="width:98%; height:98%;">
              <iframe src="${req.url.substr(7)}"
                  style="width:100%; height:100%;">
              </iframe>
            </body>
          </html>`);
});

app.get('/a4a_template/*', (req, res) => {
  assertCors(req, res, ['GET'], undefined, true);
  const match = /^\/a4a_template\/([a-z-]+)\/(\d+)$/.exec(req.path);
  if (!match) {
    res.status(404);
    res.end('Invalid path: ' + req.path);
    return;
  }
  const filePath = `${pc.cwd()}/extensions/amp-ad-network-${match[1]}-impl/` +
      `0.1/data/${match[2]}.template`;
  fs.readFileAsync(filePath).then(file => {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('AMP-template-amp-creative', 'amp-mustache');
    res.end(file);
  }).error(() => {
    res.status(404);
    res.end('Not found: ' + filePath);
  });
});

// Returns a document that echoes any post messages received from parent.
// An optional `message` query param can be appended for an initial post
// message sent on document load.
// Example:
// http://localhost:8000/iframe-echo-message?message=${payload}
app.get('/iframe-echo-message', (req, res) => {
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
app.use('/a4a(|-3p)/', (req, res) => {
  const force3p = req.baseUrl.indexOf('/a4a-3p') == 0;
  let adUrl = req.url;
  const templatePath = '/build-system/server-a4a-template.html';
  const urlPrefix = getUrlPrefix(req);
  if (!adUrl.startsWith('/proxy') &&
      urlPrefix.indexOf('//localhost') != -1) {
    // This is a special case for testing. `localhost` URLs are transformed to
    // `ads.localhost` to ensure that the iframe is fully x-origin.
    adUrl = urlPrefix.replace('localhost', 'ads.localhost') + adUrl;
  }
  adUrl = addQueryParam(adUrl, 'inabox', 1);
  fs.readFileAsync(pc.cwd() + templatePath, 'utf8').then(template => {
    const result = template
        .replace(/CHECKSIG/g, force3p || '')
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
app.use('/inabox/', (req, res) => {
  let adUrl = req.url;
  const templatePath = '/build-system/server-inabox-template.html';
  const urlPrefix = getUrlPrefix(req);
  if (!adUrl.startsWith('/proxy') && // Ignore /proxy
      urlPrefix.indexOf('//localhost') != -1) {
    // This is a special case for testing. `localhost` URLs are transformed to
    // `ads.localhost` to ensure that the iframe is fully x-origin.
    adUrl = urlPrefix.replace('localhost', 'ads.localhost') + adUrl;
  }
  adUrl = addQueryParam(adUrl, 'inabox', 1);
  fs.readFileAsync(pc.cwd() + templatePath, 'utf8').then(template => {
    const result = template
        .replace(/AD_URL/g, adUrl)
        .replace(/OFFSET/g, req.query.offset || '0px')
        .replace(/AD_WIDTH/g, req.query.width || '300')
        .replace(/AD_HEIGHT/g, req.query.height || '250');
    res.end(result);
  });
});

app.use('/examples/analytics.config.json', (req, res, next) => {
  res.setHeader('AMP-Access-Control-Allow-Source-Origin', getUrlPrefix(req));
  next();
});

app.use(['/examples/*', '/extensions/*'], (req, res, next) => {
  const sourceOrigin = req.query['__amp_source_origin'];
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
app.use(['/dist/v0/amp-*.js'], (req, res, next) => {
  const sleep = parseInt(req.query.sleep || 0, 10) * 1000;
  setTimeout(next, sleep);
});

app.get(['/examples/*.html', '/test/manual/*.html'], (req, res, next) => {
  const filePath = req.path;
  const mode = pc.env.SERVE_MODE;
  const inabox = req.query['inabox'] == '1';
  const stream = Number(req.query['stream']);
  fs.readFileAsync(pc.cwd() + filePath, 'utf8').then(file => {
    if (req.query['amp_js_v']) {
      file = addViewerIntegrationScript(req.query['amp_js_v'], file);
    }


    if (inabox && req.headers.origin && req.query.__amp_source_origin) {
      // Allow CORS requests for A4A.
      enableCors(req, res, req.headers.origin);
    } else {
      file = replaceUrls(mode, file, '', inabox);
    }

    // Extract amp-ad for the given 'type' specified in URL query.
    if (req.path.indexOf('/examples/ads.amp.html') == 0 && req.query.type) {
      const ads = file.match(
          elementExtractor('(amp-ad|amp-embed)', req.query.type));
      file = file.replace(
          /<body>[\s\S]+<\/body>/m, '<body>' + ads.join('') + '</body>');
    }

    // Extract amp-analytics for the given 'type' specified in URL query.
    if (req.path.indexOf(
        '/examples/analytics-vendors.amp.html') == 0 && req.query.type) {
      const analytics = file.match(
          elementExtractor('amp-analytics', req.query.type));
      file = file.replace(
          /<div id="container">[\s\S]+<\/div>/m,
          '<div id="container">' + analytics.join('') + '</div>');
    }

    if (stream > 0) {
      res.writeHead(200, {'Content-Type': 'text/html'});
      let pos = 0;
      const writeChunk = function() {
        const chunk = file.substring(pos, Math.min(pos + stream, file.length));
        res.write(chunk);
        pos += stream;
        if (pos < file.length) {
          setTimeout(writeChunk, 500);
        } else {
          res.end();
        }
      };
      writeChunk();
    } else {
      res.send(file);
    }
  }).catch(() => {
    next();
  });
});

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function elementExtractor(tagName, type) {
  type = escapeRegExp(type);
  return new RegExp(
      `<${tagName} [^>]*['"]${type}['"][^>]*>([\\s\\S]+?)</${tagName}>`,
      'gm');
}

// Data for example: http://localhost:8000/examples/bind/xhr.amp.html
app.use('/bind/form/get', (req, res) => {
  assertCors(req, res, ['GET']);
  res.json({
    bindXhrResult: 'I was fetched from the server!',
  });
});

const photo_data = {
  "photos": [
      {
        "albumId": 1,
        "id": 1,
        "title": "accusamus beatae ad facilis cum similique qui sunt",
        "url": "http://placehold.it/600/92c952",
        "thumbnailUrl": "http://placehold.it/150/92c952"
      },
      {
        "albumId": 1,
        "id": 2,
        "title": "reprehenderit est deserunt velit ipsam",
        "url": "http://placehold.it/600/771796",
        "thumbnailUrl": "http://placehold.it/150/771796"
      },
      {
        "albumId": 1,
        "id": 3,
        "title": "officia porro iure quia iusto qui ipsa ut modi",
        "url": "http://placehold.it/600/24f355",
        "thumbnailUrl": "http://placehold.it/150/24f355"
      },
      {
        "albumId": 1,
        "id": 4,
        "title": "culpa odio esse rerum omnis laboriosam voluptate repudiandae",
        "url": "http://placehold.it/600/d32776",
        "thumbnailUrl": "http://placehold.it/150/d32776"
      },
      {
        "albumId": 1,
        "id": 5,
        "title": "natus nisi omnis corporis facere molestiae rerum in",
        "url": "http://placehold.it/600/f66b97",
        "thumbnailUrl": "http://placehold.it/150/f66b97"
      },
      {
        "albumId": 1,
        "id": 6,
        "title": "accusamus ea aliquid et amet sequi nemo",
        "url": "http://placehold.it/600/56a8c2",
        "thumbnailUrl": "http://placehold.it/150/56a8c2"
      },
      {
        "albumId": 1,
        "id": 7,
        "title": "officia delectus consequatur vero aut veniam explicabo molestias",
        "url": "http://placehold.it/600/b0f7cc",
        "thumbnailUrl": "http://placehold.it/150/b0f7cc"
      },
      {
        "albumId": 1,
        "id": 8,
        "title": "aut porro officiis laborum odit ea laudantium corporis",
        "url": "http://placehold.it/600/54176f",
        "thumbnailUrl": "http://placehold.it/150/54176f"
      },
      {
        "albumId": 1,
        "id": 9,
        "title": "qui eius qui autem sed",
        "url": "http://placehold.it/600/51aa97",
        "thumbnailUrl": "http://placehold.it/150/51aa97"
      },
      {
        "albumId": 1,
        "id": 10,
        "title": "beatae et provident et ut vel",
        "url": "http://placehold.it/600/810b14",
        "thumbnailUrl": "http://placehold.it/150/810b14"
      },
      {
        "albumId": 1,
        "id": 11,
        "title": "nihil at amet non hic quia qui",
        "url": "http://placehold.it/600/1ee8a4",
        "thumbnailUrl": "http://placehold.it/150/1ee8a4"
      },
      {
        "albumId": 1,
        "id": 12,
        "title": "mollitia soluta ut rerum eos aliquam consequatur perspiciatis maiores",
        "url": "http://placehold.it/600/66b7d2",
        "thumbnailUrl": "http://placehold.it/150/66b7d2"
      },
      {
        "albumId": 1,
        "id": 13,
        "title": "repudiandae iusto deleniti rerum",
        "url": "http://placehold.it/600/197d29",
        "thumbnailUrl": "http://placehold.it/150/197d29"
      },
      {
        "albumId": 1,
        "id": 14,
        "title": "est necessitatibus architecto ut laborum",
        "url": "http://placehold.it/600/61a65",
        "thumbnailUrl": "http://placehold.it/150/61a65"
      },
      {
        "albumId": 1,
        "id": 15,
        "title": "harum dicta similique quis dolore earum ex qui",
        "url": "http://placehold.it/600/f9cee5",
        "thumbnailUrl": "http://placehold.it/150/f9cee5"
      },
      {
        "albumId": 1,
        "id": 16,
        "title": "iusto sunt nobis quasi veritatis quas expedita voluptatum deserunt",
        "url": "http://placehold.it/600/fdf73e",
        "thumbnailUrl": "http://placehold.it/150/fdf73e"
      },
      {
        "albumId": 1,
        "id": 17,
        "title": "natus doloribus necessitatibus ipsa",
        "url": "http://placehold.it/600/9c184f",
        "thumbnailUrl": "http://placehold.it/150/9c184f"
      },
      {
        "albumId": 1,
        "id": 18,
        "title": "laboriosam odit nam necessitatibus et illum dolores reiciendis",
        "url": "http://placehold.it/600/1fe46f",
        "thumbnailUrl": "http://placehold.it/150/1fe46f"
      },
      {
        "albumId": 1,
        "id": 19,
        "title": "perferendis nesciunt eveniet et optio a",
        "url": "http://placehold.it/600/56acb2",
        "thumbnailUrl": "http://placehold.it/150/56acb2"
      },
      {
        "albumId": 1,
        "id": 20,
        "title": "assumenda voluptatem laboriosam enim consequatur veniam placeat reiciendis error",
        "url": "http://placehold.it/600/8985dc",
        "thumbnailUrl": "http://placehold.it/150/8985dc"
      },
      {
        "albumId": 1,
        "id": 21,
        "title": "ad et natus qui",
        "url": "http://placehold.it/600/5e12c6",
        "thumbnailUrl": "http://placehold.it/150/5e12c6"
      },
      {
        "albumId": 1,
        "id": 22,
        "title": "et ea illo et sit voluptas animi blanditiis porro",
        "url": "http://placehold.it/600/45601a",
        "thumbnailUrl": "http://placehold.it/150/45601a"
      },
      {
        "albumId": 1,
        "id": 23,
        "title": "harum velit vero totam",
        "url": "http://placehold.it/600/e924e6",
        "thumbnailUrl": "http://placehold.it/150/e924e6"
      },
      {
        "albumId": 1,
        "id": 24,
        "title": "beatae officiis ut aut",
        "url": "http://placehold.it/600/8f209a",
        "thumbnailUrl": "http://placehold.it/150/8f209a"
      },
      {
        "albumId": 1,
        "id": 25,
        "title": "facere non quis fuga fugit vitae",
        "url": "http://placehold.it/600/5e3a73",
        "thumbnailUrl": "http://placehold.it/150/5e3a73"
      },
      {
        "albumId": 1,
        "id": 26,
        "title": "asperiores nobis voluptate qui",
        "url": "http://placehold.it/600/474645",
        "thumbnailUrl": "http://placehold.it/150/474645"
      },
      {
        "albumId": 1,
        "id": 27,
        "title": "sit asperiores est quos quis nisi veniam error",
        "url": "http://placehold.it/600/c984bf",
        "thumbnailUrl": "http://placehold.it/150/c984bf"
      },
      {
        "albumId": 1,
        "id": 28,
        "title": "non neque eligendi molestiae repudiandae illum voluptatem qui aut",
        "url": "http://placehold.it/600/392537",
        "thumbnailUrl": "http://placehold.it/150/392537"
      },
      {
        "albumId": 1,
        "id": 29,
        "title": "aut ipsam quos ab placeat omnis",
        "url": "http://placehold.it/600/602b9e",
        "thumbnailUrl": "http://placehold.it/150/602b9e"
      },
      {
        "albumId": 1,
        "id": 30,
        "title": "odio enim voluptatem quidem aut nihil illum",
        "url": "http://placehold.it/600/372c93",
        "thumbnailUrl": "http://placehold.it/150/372c93"
      },
      {
        "albumId": 1,
        "id": 31,
        "title": "voluptate voluptates sequi",
        "url": "http://placehold.it/600/a7c272",
        "thumbnailUrl": "http://placehold.it/150/a7c272"
      },
      {
        "albumId": 1,
        "id": 32,
        "title": "ad enim dignissimos voluptatem similique",
        "url": "http://placehold.it/600/c70a4d",
        "thumbnailUrl": "http://placehold.it/150/c70a4d"
      },
      {
        "albumId": 1,
        "id": 33,
        "title": "culpa ipsam nobis qui fuga magni et mollitia",
        "url": "http://placehold.it/600/501fe1",
        "thumbnailUrl": "http://placehold.it/150/501fe1"
      },
      {
        "albumId": 1,
        "id": 34,
        "title": "vitae est facere quia itaque adipisci perferendis id maiores",
        "url": "http://placehold.it/600/35185e",
        "thumbnailUrl": "http://placehold.it/150/35185e"
      },
      {
        "albumId": 1,
        "id": 35,
        "title": "tenetur minus voluptatum et",
        "url": "http://placehold.it/600/c96cad",
        "thumbnailUrl": "http://placehold.it/150/c96cad"
      },
      {
        "albumId": 1,
        "id": 36,
        "title": "expedita rerum eaque",
        "url": "http://placehold.it/600/4d564d",
        "thumbnailUrl": "http://placehold.it/150/4d564d"
      },
      {
        "albumId": 1,
        "id": 37,
        "title": "totam voluptas iusto deserunt dolores",
        "url": "http://placehold.it/600/ea51da",
        "thumbnailUrl": "http://placehold.it/150/ea51da"
      },
      {
        "albumId": 1,
        "id": 38,
        "title": "natus magnam iure rerum pariatur molestias dolore nisi",
        "url": "http://placehold.it/600/4f5b8d",
        "thumbnailUrl": "http://placehold.it/150/4f5b8d"
      },
      {
        "albumId": 1,
        "id": 39,
        "title": "molestiae nam ullam et rerum doloribus",
        "url": "http://placehold.it/600/1e71a2",
        "thumbnailUrl": "http://placehold.it/150/1e71a2"
      },
      {
        "albumId": 1,
        "id": 40,
        "title": "est quas voluptates dignissimos sint praesentium nisi recusandae",
        "url": "http://placehold.it/600/3a0b95",
        "thumbnailUrl": "http://placehold.it/150/3a0b95"
      },
      {
        "albumId": 1,
        "id": 41,
        "title": "in voluptatem doloremque cum atque architecto deleniti",
        "url": "http://placehold.it/600/659403",
        "thumbnailUrl": "http://placehold.it/150/659403"
      },
      {
        "albumId": 1,
        "id": 42,
        "title": "voluptatibus a autem molestias voluptas architecto culpa",
        "url": "http://placehold.it/600/ca50ac",
        "thumbnailUrl": "http://placehold.it/150/ca50ac"
      },
      {
        "albumId": 1,
        "id": 43,
        "title": "eius hic autem ad beatae voluptas",
        "url": "http://placehold.it/600/6ad437",
        "thumbnailUrl": "http://placehold.it/150/6ad437"
      },
      {
        "albumId": 1,
        "id": 44,
        "title": "neque eum provident et inventore sed ipsam dignissimos quo",
        "url": "http://placehold.it/600/29fe9f",
        "thumbnailUrl": "http://placehold.it/150/29fe9f"
      },
      {
        "albumId": 1,
        "id": 45,
        "title": "praesentium fugit quis aut voluptatum commodi dolore corrupti",
        "url": "http://placehold.it/600/c4084a",
        "thumbnailUrl": "http://placehold.it/150/c4084a"
      },
      {
        "albumId": 1,
        "id": 46,
        "title": "quidem maiores in quia fugit dolore explicabo occaecati",
        "url": "http://placehold.it/600/e9b68",
        "thumbnailUrl": "http://placehold.it/150/e9b68"
      },
      {
        "albumId": 1,
        "id": 47,
        "title": "et soluta est",
        "url": "http://placehold.it/600/b4412f",
        "thumbnailUrl": "http://placehold.it/150/b4412f"
      },
      {
        "albumId": 1,
        "id": 48,
        "title": "ut esse id",
        "url": "http://placehold.it/600/68e0a8",
        "thumbnailUrl": "http://placehold.it/150/68e0a8"
      },
      {
        "albumId": 1,
        "id": 49,
        "title": "quasi quae est modi quis quam in impedit",
        "url": "http://placehold.it/600/2cd88b",
        "thumbnailUrl": "http://placehold.it/150/2cd88b"
      },
      {
        "albumId": 1,
        "id": 50,
        "title": "et inventore quae ut tempore eius voluptatum",
        "url": "http://placehold.it/600/9e59da",
        "thumbnailUrl": "http://placehold.it/150/9e59da"
      },
      {
        "albumId": 2,
        "id": 51,
        "title": "non sunt voluptatem placeat consequuntur rem incidunt",
        "url": "http://placehold.it/600/8e973b",
        "thumbnailUrl": "http://placehold.it/150/8e973b"
      },
      {
        "albumId": 2,
        "id": 52,
        "title": "eveniet pariatur quia nobis reiciendis laboriosam ea",
        "url": "http://placehold.it/600/121fa4",
        "thumbnailUrl": "http://placehold.it/150/121fa4"
      },
      {
        "albumId": 2,
        "id": 53,
        "title": "soluta et harum aliquid officiis ab omnis consequatur",
        "url": "http://placehold.it/600/6efc5f",
        "thumbnailUrl": "http://placehold.it/150/6efc5f"
      },
      {
        "albumId": 2,
        "id": 54,
        "title": "ut ex quibusdam dolore mollitia",
        "url": "http://placehold.it/600/aa8f2e",
        "thumbnailUrl": "http://placehold.it/150/aa8f2e"
      },
      {
        "albumId": 2,
        "id": 55,
        "title": "voluptatem consequatur totam qui aut iure est vel",
        "url": "http://placehold.it/600/5e04a4",
        "thumbnailUrl": "http://placehold.it/150/5e04a4"
      },
      {
        "albumId": 2,
        "id": 56,
        "title": "vel voluptatem esse consequuntur est officia quo aut quisquam",
        "url": "http://placehold.it/600/f9f067",
        "thumbnailUrl": "http://placehold.it/150/f9f067"
      },
      {
        "albumId": 2,
        "id": 57,
        "title": "vero est optio expedita quis ut molestiae",
        "url": "http://placehold.it/600/95acce",
        "thumbnailUrl": "http://placehold.it/150/95acce"
      },
      {
        "albumId": 2,
        "id": 58,
        "title": "rem pariatur facere eaque",
        "url": "http://placehold.it/600/cde4c1",
        "thumbnailUrl": "http://placehold.it/150/cde4c1"
      },
      {
        "albumId": 2,
        "id": 59,
        "title": "modi totam dolor eaque et ipsum est cupiditate",
        "url": "http://placehold.it/600/a46a91",
        "thumbnailUrl": "http://placehold.it/150/a46a91"
      },
      {
        "albumId": 2,
        "id": 60,
        "title": "ea enim temporibus asperiores placeat consectetur commodi ullam",
        "url": "http://placehold.it/600/323599",
        "thumbnailUrl": "http://placehold.it/150/323599"
      },
      {
        "albumId": 2,
        "id": 61,
        "title": "quia minus sed eveniet accusantium incidunt beatae odio",
        "url": "http://placehold.it/600/e403d1",
        "thumbnailUrl": "http://placehold.it/150/e403d1"
      },
      {
        "albumId": 2,
        "id": 62,
        "title": "dolorem cumque quo nihil inventore enim",
        "url": "http://placehold.it/600/65ad4f",
        "thumbnailUrl": "http://placehold.it/150/65ad4f"
      },
      {
        "albumId": 2,
        "id": 63,
        "title": "facere animi autem quod dolor",
        "url": "http://placehold.it/600/4e557c",
        "thumbnailUrl": "http://placehold.it/150/4e557c"
      },
      {
        "albumId": 2,
        "id": 64,
        "title": "doloremque culpa quia",
        "url": "http://placehold.it/600/cd5a92",
        "thumbnailUrl": "http://placehold.it/150/cd5a92"
      },
      {
        "albumId": 2,
        "id": 65,
        "title": "sed voluptatum enim eaque cumque qui sunt",
        "url": "http://placehold.it/600/149540",
        "thumbnailUrl": "http://placehold.it/150/149540"
      },
      {
        "albumId": 2,
        "id": 66,
        "title": "provident rerum voluptatem illo asperiores qui maiores",
        "url": "http://placehold.it/600/ee0a7e",
        "thumbnailUrl": "http://placehold.it/150/ee0a7e"
      },
      {
        "albumId": 2,
        "id": 67,
        "title": "veritatis labore ipsum unde aut quam dolores",
        "url": "http://placehold.it/600/1279e9",
        "thumbnailUrl": "http://placehold.it/150/1279e9"
      },
      {
        "albumId": 2,
        "id": 68,
        "title": "architecto aut quod qui ullam vitae expedita delectus",
        "url": "http://placehold.it/600/e9603b",
        "thumbnailUrl": "http://placehold.it/150/e9603b"
      },
      {
        "albumId": 2,
        "id": 69,
        "title": "et autem dolores aut porro est qui",
        "url": "http://placehold.it/600/46e3b1",
        "thumbnailUrl": "http://placehold.it/150/46e3b1"
      },
      {
        "albumId": 2,
        "id": 70,
        "title": "quam quos dolor eum ea in",
        "url": "http://placehold.it/600/7375af",
        "thumbnailUrl": "http://placehold.it/150/7375af"
      },
      {
        "albumId": 2,
        "id": 71,
        "title": "illo qui vel laboriosam vel fugit deserunt",
        "url": "http://placehold.it/600/363789",
        "thumbnailUrl": "http://placehold.it/150/363789"
      },
      {
        "albumId": 2,
        "id": 72,
        "title": "iusto sint enim nesciunt facilis exercitationem",
        "url": "http://placehold.it/600/45935c",
        "thumbnailUrl": "http://placehold.it/150/45935c"
      },
      {
        "albumId": 2,
        "id": 73,
        "title": "rerum exercitationem libero dolor",
        "url": "http://placehold.it/600/1224bd",
        "thumbnailUrl": "http://placehold.it/150/1224bd"
      },
      {
        "albumId": 2,
        "id": 74,
        "title": "eligendi quas consequatur aut consequuntur",
        "url": "http://placehold.it/600/65ac19",
        "thumbnailUrl": "http://placehold.it/150/65ac19"
      },
      {
        "albumId": 2,
        "id": 75,
        "title": "aut magni quibusdam cupiditate ea",
        "url": "http://placehold.it/600/a9ef52",
        "thumbnailUrl": "http://placehold.it/150/a9ef52"
      },
      {
        "albumId": 2,
        "id": 76,
        "title": "magni nulla et dolores",
        "url": "http://placehold.it/600/7644fe",
        "thumbnailUrl": "http://placehold.it/150/7644fe"
      },
      {
        "albumId": 2,
        "id": 77,
        "title": "ipsum consequatur vel omnis mollitia repellat dolores quasi",
        "url": "http://placehold.it/600/36d137",
        "thumbnailUrl": "http://placehold.it/150/36d137"
      },
      {
        "albumId": 2,
        "id": 78,
        "title": "aperiam aut est amet tenetur et dolorem",
        "url": "http://placehold.it/600/637984",
        "thumbnailUrl": "http://placehold.it/150/637984"
      },
      {
        "albumId": 2,
        "id": 79,
        "title": "est vel et laboriosam quo aspernatur distinctio molestiae",
        "url": "http://placehold.it/600/c611a9",
        "thumbnailUrl": "http://placehold.it/150/c611a9"
      },
      {
        "albumId": 2,
        "id": 80,
        "title": "et corrupti nihil cumque",
        "url": "http://placehold.it/600/a0c998",
        "thumbnailUrl": "http://placehold.it/150/a0c998"
      },
      {
        "albumId": 2,
        "id": 81,
        "title": "error magni fugiat dolorem impedit molestiae illo ullam debitis",
        "url": "http://placehold.it/600/31a74c",
        "thumbnailUrl": "http://placehold.it/150/31a74c"
      },
      {
        "albumId": 2,
        "id": 82,
        "title": "voluptate voluptas molestias vitae illo iusto",
        "url": "http://placehold.it/600/88b703",
        "thumbnailUrl": "http://placehold.it/150/88b703"
      },
      {
        "albumId": 2,
        "id": 83,
        "title": "quia quasi enim voluptatem repellat sit sint",
        "url": "http://placehold.it/600/a19891",
        "thumbnailUrl": "http://placehold.it/150/a19891"
      },
      {
        "albumId": 2,
        "id": 84,
        "title": "aliquam dolorem ut modi ratione et assumenda impedit",
        "url": "http://placehold.it/600/b5205d",
        "thumbnailUrl": "http://placehold.it/150/b5205d"
      },
      {
        "albumId": 2,
        "id": 85,
        "title": "ullam delectus architecto sint error",
        "url": "http://placehold.it/600/eb7e7f",
        "thumbnailUrl": "http://placehold.it/150/eb7e7f"
      },
      {
        "albumId": 2,
        "id": 86,
        "title": "qui vel ut odio consequuntur",
        "url": "http://placehold.it/600/fd5751",
        "thumbnailUrl": "http://placehold.it/150/fd5751"
      },
      {
        "albumId": 2,
        "id": 87,
        "title": "eos nihil sunt accusantium omnis",
        "url": "http://placehold.it/600/224566",
        "thumbnailUrl": "http://placehold.it/150/224566"
      },
      {
        "albumId": 2,
        "id": 88,
        "title": "inventore veritatis magnam enim quasi",
        "url": "http://placehold.it/600/75334a",
        "thumbnailUrl": "http://placehold.it/150/75334a"
      },
      {
        "albumId": 2,
        "id": 89,
        "title": "id at cum incidunt nulla dolor vero tenetur",
        "url": "http://placehold.it/600/21d35",
        "thumbnailUrl": "http://placehold.it/150/21d35"
      },
      {
        "albumId": 2,
        "id": 90,
        "title": "et quae eligendi vitae maxime in",
        "url": "http://placehold.it/600/bfe0dc",
        "thumbnailUrl": "http://placehold.it/150/bfe0dc"
      },
      {
        "albumId": 2,
        "id": 91,
        "title": "sunt quo laborum commodi porro consequatur nam delectus et",
        "url": "http://placehold.it/600/40591",
        "thumbnailUrl": "http://placehold.it/150/40591"
      },
      {
        "albumId": 2,
        "id": 92,
        "title": "quod non quae",
        "url": "http://placehold.it/600/de79c7",
        "thumbnailUrl": "http://placehold.it/150/de79c7"
      },
      {
        "albumId": 2,
        "id": 93,
        "title": "molestias et aliquam natus repellendus accusamus dolore",
        "url": "http://placehold.it/600/2edde0",
        "thumbnailUrl": "http://placehold.it/150/2edde0"
      },
      {
        "albumId": 2,
        "id": 94,
        "title": "et quisquam aspernatur",
        "url": "http://placehold.it/600/cc12f5",
        "thumbnailUrl": "http://placehold.it/150/cc12f5"
      },
      {
        "albumId": 2,
        "id": 95,
        "title": "magni odio non",
        "url": "http://placehold.it/600/9cda61",
        "thumbnailUrl": "http://placehold.it/150/9cda61"
      },
      {
        "albumId": 2,
        "id": 96,
        "title": "dolore esse a in eos sed",
        "url": "http://placehold.it/600/1fb08b",
        "thumbnailUrl": "http://placehold.it/150/1fb08b"
      },
      {
        "albumId": 2,
        "id": 97,
        "title": "labore magnam officiis nemo et",
        "url": "http://placehold.it/600/e2223e",
        "thumbnailUrl": "http://placehold.it/150/e2223e"
      },
      {
        "albumId": 2,
        "id": 98,
        "title": "sed commodi libero id nesciunt modi vitae",
        "url": "http://placehold.it/600/a77d08",
        "thumbnailUrl": "http://placehold.it/150/a77d08"
      },
      {
        "albumId": 2,
        "id": 99,
        "title": "magnam dolor sed enim vel optio consequuntur",
        "url": "http://placehold.it/600/b04f2e",
        "thumbnailUrl": "http://placehold.it/150/b04f2e"
      },
      {
        "albumId": 2,
        "id": 100,
        "title": "et qui rerum",
        "url": "http://placehold.it/600/14ba42",
        "thumbnailUrl": "http://placehold.it/150/14ba42"
      },
      {
        "albumId": 3,
        "id": 101,
        "title": "incidunt alias vel enim",
        "url": "http://placehold.it/600/e743b",
        "thumbnailUrl": "http://placehold.it/150/e743b"
      },
      {
        "albumId": 3,
        "id": 102,
        "title": "eaque iste corporis tempora vero distinctio consequuntur nisi nesciunt",
        "url": "http://placehold.it/600/a393af",
        "thumbnailUrl": "http://placehold.it/150/a393af"
      },
      {
        "albumId": 3,
        "id": 103,
        "title": "et eius nisi in ut reprehenderit labore eum",
        "url": "http://placehold.it/600/35cedf",
        "thumbnailUrl": "http://placehold.it/150/35cedf"
      },
      {
        "albumId": 3,
        "id": 104,
        "title": "et natus vero quia totam aut et minima",
        "url": "http://placehold.it/600/313b40",
        "thumbnailUrl": "http://placehold.it/150/313b40"
      },
      {
        "albumId": 3,
        "id": 105,
        "title": "veritatis numquam eius",
        "url": "http://placehold.it/600/eaf2e1",
        "thumbnailUrl": "http://placehold.it/150/eaf2e1"
      },
      {
        "albumId": 3,
        "id": 106,
        "title": "repellat molestiae nihil iste autem blanditiis officiis",
        "url": "http://placehold.it/600/b1f841",
        "thumbnailUrl": "http://placehold.it/150/b1f841"
      },
      {
        "albumId": 3,
        "id": 107,
        "title": "maiores ipsa ut autem",
        "url": "http://placehold.it/600/50d332",
        "thumbnailUrl": "http://placehold.it/150/50d332"
      },
      {
        "albumId": 3,
        "id": 108,
        "title": "qui tempora vel exercitationem harum iusto voluptas incidunt",
        "url": "http://placehold.it/600/627495",
        "thumbnailUrl": "http://placehold.it/150/627495"
      },
      {
        "albumId": 3,
        "id": 109,
        "title": "quidem ut quos non qui debitis exercitationem",
        "url": "http://placehold.it/600/c5e1ce",
        "thumbnailUrl": "http://placehold.it/150/c5e1ce"
      },
      {
        "albumId": 3,
        "id": 110,
        "title": "reiciendis et velit laborum recusandae",
        "url": "http://placehold.it/600/2f9e30",
        "thumbnailUrl": "http://placehold.it/150/2f9e30"
      },
      {
        "albumId": 3,
        "id": 111,
        "title": "quos rem nulla ea amet",
        "url": "http://placehold.it/600/cc178e",
        "thumbnailUrl": "http://placehold.it/150/cc178e"
      },
      {
        "albumId": 3,
        "id": 112,
        "title": "laudantium quibusdam inventore",
        "url": "http://placehold.it/600/170690",
        "thumbnailUrl": "http://placehold.it/150/170690"
      },
      {
        "albumId": 3,
        "id": 113,
        "title": "hic nulla consectetur",
        "url": "http://placehold.it/600/1dff02",
        "thumbnailUrl": "http://placehold.it/150/1dff02"
      },
      {
        "albumId": 3,
        "id": 114,
        "title": "consequatur quaerat sunt et",
        "url": "http://placehold.it/600/e79b4e",
        "thumbnailUrl": "http://placehold.it/150/e79b4e"
      },
      {
        "albumId": 3,
        "id": 115,
        "title": "unde minus molestias",
        "url": "http://placehold.it/600/da7ddf",
        "thumbnailUrl": "http://placehold.it/150/da7ddf"
      },
      {
        "albumId": 3,
        "id": 116,
        "title": "et iure eius enim explicabo",
        "url": "http://placehold.it/600/aac33b",
        "thumbnailUrl": "http://placehold.it/150/aac33b"
      },
      {
        "albumId": 3,
        "id": 117,
        "title": "dolore quo nemo omnis odio et iure explicabo",
        "url": "http://placehold.it/600/b2fe8",
        "thumbnailUrl": "http://placehold.it/150/b2fe8"
      },
      {
        "albumId": 3,
        "id": 118,
        "title": "et doloremque excepturi libero earum",
        "url": "http://placehold.it/600/eb76bc",
        "thumbnailUrl": "http://placehold.it/150/eb76bc"
      },
      {
        "albumId": 3,
        "id": 119,
        "title": "quisquam error consequatur",
        "url": "http://placehold.it/600/61918f",
        "thumbnailUrl": "http://placehold.it/150/61918f"
      },
      {
        "albumId": 3,
        "id": 120,
        "title": "eos quia minima modi cumque illo odit consequatur vero",
        "url": "http://placehold.it/600/3ee01c",
        "thumbnailUrl": "http://placehold.it/150/3ee01c"
      },
      {
        "albumId": 3,
        "id": 121,
        "title": "commodi sed enim sint in nobis",
        "url": "http://placehold.it/600/fd8ae7",
        "thumbnailUrl": "http://placehold.it/150/fd8ae7"
      },
      {
        "albumId": 3,
        "id": 122,
        "title": "consequatur quos odio harum alias",
        "url": "http://placehold.it/600/949d2f",
        "thumbnailUrl": "http://placehold.it/150/949d2f"
      },
      {
        "albumId": 3,
        "id": 123,
        "title": "fuga sint ipsa quis",
        "url": "http://placehold.it/600/ecef3e",
        "thumbnailUrl": "http://placehold.it/150/ecef3e"
      },
      {
        "albumId": 3,
        "id": 124,
        "title": "officiis similique autem unde repellendus",
        "url": "http://placehold.it/600/bc8f1d",
        "thumbnailUrl": "http://placehold.it/150/bc8f1d"
      },
      {
        "albumId": 3,
        "id": 125,
        "title": "et fuga perspiciatis qui quis",
        "url": "http://placehold.it/600/d0882c",
        "thumbnailUrl": "http://placehold.it/150/d0882c"
      },
      {
        "albumId": 3,
        "id": 126,
        "title": "id reiciendis neque voluptas explicabo quae",
        "url": "http://placehold.it/600/7ef62f",
        "thumbnailUrl": "http://placehold.it/150/7ef62f"
      },
      {
        "albumId": 3,
        "id": 127,
        "title": "magnam quia sed aspernatur",
        "url": "http://placehold.it/600/74456b",
        "thumbnailUrl": "http://placehold.it/150/74456b"
      },
      {
        "albumId": 3,
        "id": 128,
        "title": "est facere ut nam repellat numquam quia quia eos",
        "url": "http://placehold.it/600/b0931d",
        "thumbnailUrl": "http://placehold.it/150/b0931d"
      },
      {
        "albumId": 3,
        "id": 129,
        "title": "alias mollitia voluptatum soluta quod",
        "url": "http://placehold.it/600/5efeca",
        "thumbnailUrl": "http://placehold.it/150/5efeca"
      },
      {
        "albumId": 3,
        "id": 130,
        "title": "maxime provident eaque sapiente ipsa ducimus",
        "url": "http://placehold.it/600/89afb1",
        "thumbnailUrl": "http://placehold.it/150/89afb1"
      },
      {
        "albumId": 3,
        "id": 131,
        "title": "qui sed ex",
        "url": "http://placehold.it/600/af2618",
        "thumbnailUrl": "http://placehold.it/150/af2618"
      },
      {
        "albumId": 3,
        "id": 132,
        "title": "repellendus velit id non veniam dolorum quod est",
        "url": "http://placehold.it/600/f9a540",
        "thumbnailUrl": "http://placehold.it/150/f9a540"
      },
      {
        "albumId": 3,
        "id": 133,
        "title": "placeat in reprehenderit",
        "url": "http://placehold.it/600/f8ee8a",
        "thumbnailUrl": "http://placehold.it/150/f8ee8a"
      },
      {
        "albumId": 3,
        "id": 134,
        "title": "eveniet perspiciatis optio est qui ea dolore",
        "url": "http://placehold.it/600/496b8d",
        "thumbnailUrl": "http://placehold.it/150/496b8d"
      },
      {
        "albumId": 3,
        "id": 135,
        "title": "qui harum quis ipsum optio ex",
        "url": "http://placehold.it/600/26016b",
        "thumbnailUrl": "http://placehold.it/150/26016b"
      },
      {
        "albumId": 3,
        "id": 136,
        "title": "aut voluptas aut temporibus",
        "url": "http://placehold.it/600/2e1c14",
        "thumbnailUrl": "http://placehold.it/150/2e1c14"
      },
      {
        "albumId": 3,
        "id": 137,
        "title": "et sit earum praesentium quas quis sint et",
        "url": "http://placehold.it/600/41c3dc",
        "thumbnailUrl": "http://placehold.it/150/41c3dc"
      },
      {
        "albumId": 3,
        "id": 138,
        "title": "vitae delectus sed",
        "url": "http://placehold.it/600/ff79d0",
        "thumbnailUrl": "http://placehold.it/150/ff79d0"
      },
      {
        "albumId": 3,
        "id": 139,
        "title": "velit placeat optio corrupti",
        "url": "http://placehold.it/600/ff2fe8",
        "thumbnailUrl": "http://placehold.it/150/ff2fe8"
      },
      {
        "albumId": 3,
        "id": 140,
        "title": "assumenda sit non debitis dolorem saepe quae deleniti",
        "url": "http://placehold.it/600/c0798a",
        "thumbnailUrl": "http://placehold.it/150/c0798a"
      },
      {
        "albumId": 3,
        "id": 141,
        "title": "commodi eum dolorum reiciendis unde ut",
        "url": "http://placehold.it/600/b13ff6",
        "thumbnailUrl": "http://placehold.it/150/b13ff6"
      },
      {
        "albumId": 3,
        "id": 142,
        "title": "reprehenderit totam dolor itaque",
        "url": "http://placehold.it/600/c7a96d",
        "thumbnailUrl": "http://placehold.it/150/c7a96d"
      },
      {
        "albumId": 3,
        "id": 143,
        "title": "totam temporibus eaque est eum et perspiciatis ullam",
        "url": "http://placehold.it/600/79439b",
        "thumbnailUrl": "http://placehold.it/150/79439b"
      },
      {
        "albumId": 3,
        "id": 144,
        "title": "aspernatur possimus consectetur in tempore distinctio a ipsa officiis",
        "url": "http://placehold.it/600/66a752",
        "thumbnailUrl": "http://placehold.it/150/66a752"
      },
      {
        "albumId": 3,
        "id": 145,
        "title": "eius unde ipsa incidunt corrupti quia accusamus omnis",
        "url": "http://placehold.it/600/f3472e",
        "thumbnailUrl": "http://placehold.it/150/f3472e"
      },
      {
        "albumId": 3,
        "id": 146,
        "title": "ullam dolor ut ipsa veniam",
        "url": "http://placehold.it/600/6c746e",
        "thumbnailUrl": "http://placehold.it/150/6c746e"
      },
      {
        "albumId": 3,
        "id": 147,
        "title": "minima aspernatur eius nemo ut",
        "url": "http://placehold.it/600/661f4c",
        "thumbnailUrl": "http://placehold.it/150/661f4c"
      },
      {
        "albumId": 3,
        "id": 148,
        "title": "aperiam amet est occaecati quae non ut",
        "url": "http://placehold.it/600/b9d67e",
        "thumbnailUrl": "http://placehold.it/150/b9d67e"
      },
      {
        "albumId": 3,
        "id": 149,
        "title": "saepe recusandae ut odio enim ipsa quo placeat iusto",
        "url": "http://placehold.it/600/cffa9b",
        "thumbnailUrl": "http://placehold.it/150/cffa9b"
      },
      {
        "albumId": 3,
        "id": 150,
        "title": "ipsum numquam ratione facilis provident animi reprehenderit ut",
        "url": "http://placehold.it/600/3689cd",
        "thumbnailUrl": "http://placehold.it/150/3689cd"
      },
      {
        "albumId": 4,
        "id": 151,
        "title": "possimus dolor minima provident ipsam",
        "url": "http://placehold.it/600/1d2ad4",
        "thumbnailUrl": "http://placehold.it/150/1d2ad4"
      },
      {
        "albumId": 4,
        "id": 152,
        "title": "et accusantium enim pariatur eum nihil fugit",
        "url": "http://placehold.it/600/a01c5b",
        "thumbnailUrl": "http://placehold.it/150/a01c5b"
      },
      {
        "albumId": 4,
        "id": 153,
        "title": "eum laborum in sunt ea",
        "url": "http://placehold.it/600/9da52c",
        "thumbnailUrl": "http://placehold.it/150/9da52c"
      },
      {
        "albumId": 4,
        "id": 154,
        "title": "dolorum ipsam odit",
        "url": "http://placehold.it/600/7f330f",
        "thumbnailUrl": "http://placehold.it/150/7f330f"
      },
      {
        "albumId": 4,
        "id": 155,
        "title": "occaecati sed earum ab ut vel quibusdam perferendis nihil",
        "url": "http://placehold.it/600/877cd8",
        "thumbnailUrl": "http://placehold.it/150/877cd8"
      },
      {
        "albumId": 4,
        "id": 156,
        "title": "sed quia accusantium nemo placeat dolor ut",
        "url": "http://placehold.it/600/11af10",
        "thumbnailUrl": "http://placehold.it/150/11af10"
      },
      {
        "albumId": 4,
        "id": 157,
        "title": "nisi odio nihil molestias facere laudantium distinctio facilis et",
        "url": "http://placehold.it/600/211c94",
        "thumbnailUrl": "http://placehold.it/150/211c94"
      },
      {
        "albumId": 4,
        "id": 158,
        "title": "qui autem adipisci veritatis iure necessitatibus et ab voluptatem",
        "url": "http://placehold.it/600/5fa928",
        "thumbnailUrl": "http://placehold.it/150/5fa928"
      },
      {
        "albumId": 4,
        "id": 159,
        "title": "est ad molestiae ut voluptatum omnis sit consequuntur et",
        "url": "http://placehold.it/600/3587a",
        "thumbnailUrl": "http://placehold.it/150/3587a"
      },
      {
        "albumId": 4,
        "id": 160,
        "title": "sequi maiores aut sunt",
        "url": "http://placehold.it/600/170b0e",
        "thumbnailUrl": "http://placehold.it/150/170b0e"
      },
      {
        "albumId": 4,
        "id": 161,
        "title": "aliquid aut at sed repudiandae est autem",
        "url": "http://placehold.it/600/739fba",
        "thumbnailUrl": "http://placehold.it/150/739fba"
      },
      {
        "albumId": 4,
        "id": 162,
        "title": "et iste aliquam laboriosam et",
        "url": "http://placehold.it/600/2b0599",
        "thumbnailUrl": "http://placehold.it/150/2b0599"
      },
      {
        "albumId": 4,
        "id": 163,
        "title": "est eos ducimus consequatur est",
        "url": "http://placehold.it/600/aae0f3",
        "thumbnailUrl": "http://placehold.it/150/aae0f3"
      },
      {
        "albumId": 4,
        "id": 164,
        "title": "aut quia enim id neque expedita aliquid",
        "url": "http://placehold.it/600/939eae",
        "thumbnailUrl": "http://placehold.it/150/939eae"
      },
      {
        "albumId": 4,
        "id": 165,
        "title": "voluptas dolorem rerum similique quis id unde",
        "url": "http://placehold.it/600/1b5aec",
        "thumbnailUrl": "http://placehold.it/150/1b5aec"
      },
      {
        "albumId": 4,
        "id": 166,
        "title": "harum accusamus asperiores",
        "url": "http://placehold.it/600/74c0c4",
        "thumbnailUrl": "http://placehold.it/150/74c0c4"
      },
      {
        "albumId": 4,
        "id": 167,
        "title": "et fugit et eius quod provident",
        "url": "http://placehold.it/600/3b4a81",
        "thumbnailUrl": "http://placehold.it/150/3b4a81"
      },
      {
        "albumId": 4,
        "id": 168,
        "title": "fugit ad atque excepturi",
        "url": "http://placehold.it/600/e20f7b",
        "thumbnailUrl": "http://placehold.it/150/e20f7b"
      },
      {
        "albumId": 4,
        "id": 169,
        "title": "enim asperiores libero ratione voluptatibus alias facilis in voluptatem",
        "url": "http://placehold.it/600/e55524",
        "thumbnailUrl": "http://placehold.it/150/e55524"
      },
      {
        "albumId": 4,
        "id": 170,
        "title": "placeat fugit voluptatum cupiditate nemo aut",
        "url": "http://placehold.it/600/e959e4",
        "thumbnailUrl": "http://placehold.it/150/e959e4"
      },
      {
        "albumId": 4,
        "id": 171,
        "title": "nemo tenetur ipsam",
        "url": "http://placehold.it/600/3bb51b",
        "thumbnailUrl": "http://placehold.it/150/3bb51b"
      },
      {
        "albumId": 4,
        "id": 172,
        "title": "deserunt commodi et aut et molestiae debitis et sed",
        "url": "http://placehold.it/600/d611bd",
        "thumbnailUrl": "http://placehold.it/150/d611bd"
      },
      {
        "albumId": 4,
        "id": 173,
        "title": "cupiditate tempore debitis quas quis recusandae facilis esse",
        "url": "http://placehold.it/600/240f8e",
        "thumbnailUrl": "http://placehold.it/150/240f8e"
      },
      {
        "albumId": 4,
        "id": 174,
        "title": "assumenda sed deleniti",
        "url": "http://placehold.it/600/44ed94",
        "thumbnailUrl": "http://placehold.it/150/44ed94"
      },
      {
        "albumId": 4,
        "id": 175,
        "title": "est ab sed repellendus labore sit modi aperiam",
        "url": "http://placehold.it/600/a06f8a",
        "thumbnailUrl": "http://placehold.it/150/a06f8a"
      },
      {
        "albumId": 4,
        "id": 176,
        "title": "aut omnis qui et est molestiae distinctio atque",
        "url": "http://placehold.it/600/d6dc09",
        "thumbnailUrl": "http://placehold.it/150/d6dc09"
      },
      {
        "albumId": 4,
        "id": 177,
        "title": "ratione autem magni eveniet voluptas quia corporis",
        "url": "http://placehold.it/600/37942b",
        "thumbnailUrl": "http://placehold.it/150/37942b"
      },
      {
        "albumId": 4,
        "id": 178,
        "title": "laboriosam nihil cum provident id quo",
        "url": "http://placehold.it/600/b80430",
        "thumbnailUrl": "http://placehold.it/150/b80430"
      },
      {
        "albumId": 4,
        "id": 179,
        "title": "pariatur nesciunt temporibus ipsam ut maiores labore",
        "url": "http://placehold.it/600/a29d32",
        "thumbnailUrl": "http://placehold.it/150/a29d32"
      },
      {
        "albumId": 4,
        "id": 180,
        "title": "temporibus aliquam vel et consequuntur minima voluptate sunt",
        "url": "http://placehold.it/600/727ca8",
        "thumbnailUrl": "http://placehold.it/150/727ca8"
      },
      {
        "albumId": 4,
        "id": 181,
        "title": "sed animi et sed",
        "url": "http://placehold.it/600/808e8c",
        "thumbnailUrl": "http://placehold.it/150/808e8c"
      },
      {
        "albumId": 4,
        "id": 182,
        "title": "non aut facilis nihil aliquid sequi quae aut soluta",
        "url": "http://placehold.it/600/10e0b8",
        "thumbnailUrl": "http://placehold.it/150/10e0b8"
      },
      {
        "albumId": 4,
        "id": 183,
        "title": "voluptas necessitatibus ut",
        "url": "http://placehold.it/600/4dc2b9",
        "thumbnailUrl": "http://placehold.it/150/4dc2b9"
      },
      {
        "albumId": 4,
        "id": 184,
        "title": "deleniti enim aliquid sequi",
        "url": "http://placehold.it/600/f0d2f4",
        "thumbnailUrl": "http://placehold.it/150/f0d2f4"
      },
      {
        "albumId": 4,
        "id": 185,
        "title": "at voluptatem repellat et voluptas eum est ipsum et",
        "url": "http://placehold.it/600/d032c4",
        "thumbnailUrl": "http://placehold.it/150/d032c4"
      },
      {
        "albumId": 4,
        "id": 186,
        "title": "incidunt sed libero non necessitatibus",
        "url": "http://placehold.it/600/75999a",
        "thumbnailUrl": "http://placehold.it/150/75999a"
      },
      {
        "albumId": 4,
        "id": 187,
        "title": "et aut ad dolor nam",
        "url": "http://placehold.it/600/f63b02",
        "thumbnailUrl": "http://placehold.it/150/f63b02"
      },
      {
        "albumId": 4,
        "id": 188,
        "title": "quae accusamus voluptas aperiam est amet",
        "url": "http://placehold.it/600/40bdc9",
        "thumbnailUrl": "http://placehold.it/150/40bdc9"
      },
      {
        "albumId": 4,
        "id": 189,
        "title": "esse ad quia ea est dicta soluta perspiciatis",
        "url": "http://placehold.it/600/a75adc",
        "thumbnailUrl": "http://placehold.it/150/a75adc"
      },
      {
        "albumId": 4,
        "id": 190,
        "title": "velit quasi incidunt molestiae ut ut ex hic cupiditate",
        "url": "http://placehold.it/600/7dd663",
        "thumbnailUrl": "http://placehold.it/150/7dd663"
      },
      {
        "albumId": 4,
        "id": 191,
        "title": "magni fuga alias non consectetur dolorum tempora",
        "url": "http://placehold.it/600/258967",
        "thumbnailUrl": "http://placehold.it/150/258967"
      },
      {
        "albumId": 4,
        "id": 192,
        "title": "non deleniti nihil provident eveniet",
        "url": "http://placehold.it/600/70f7e3",
        "thumbnailUrl": "http://placehold.it/150/70f7e3"
      },
      {
        "albumId": 4,
        "id": 193,
        "title": "mollitia ut minima totam distinctio provident quia non",
        "url": "http://placehold.it/600/336fe7",
        "thumbnailUrl": "http://placehold.it/150/336fe7"
      },
      {
        "albumId": 4,
        "id": 194,
        "title": "aut culpa magni aut officiis",
        "url": "http://placehold.it/600/b98f29",
        "thumbnailUrl": "http://placehold.it/150/b98f29"
      },
      {
        "albumId": 4,
        "id": 195,
        "title": "vel hic et autem quo soluta esse quasi",
        "url": "http://placehold.it/600/973d6d",
        "thumbnailUrl": "http://placehold.it/150/973d6d"
      },
      {
        "albumId": 4,
        "id": 196,
        "title": "amet maiores ut",
        "url": "http://placehold.it/600/128151",
        "thumbnailUrl": "http://placehold.it/150/128151"
      },
      {
        "albumId": 4,
        "id": 197,
        "title": "nobis ut iusto porro debitis vitae",
        "url": "http://placehold.it/600/d1dd9e",
        "thumbnailUrl": "http://placehold.it/150/d1dd9e"
      },
      {
        "albumId": 4,
        "id": 198,
        "title": "libero rem amet ipsam ullam illo excepturi rerum",
        "url": "http://placehold.it/600/43803c",
        "thumbnailUrl": "http://placehold.it/150/43803c"
      },
      {
        "albumId": 4,
        "id": 199,
        "title": "nobis sint assumenda consequatur laboriosam laudantium modi perferendis ea",
        "url": "http://placehold.it/600/2da3b7",
        "thumbnailUrl": "http://placehold.it/150/2da3b7"
      },
      {
        "albumId": 4,
        "id": 200,
        "title": "perspiciatis est commodi iste nulla et eveniet voluptates eum",
        "url": "http://placehold.it/600/c3f384",
        "thumbnailUrl": "http://placehold.it/150/c3f384"
      },
      {
        "albumId": 5,
        "id": 201,
        "title": "nesciunt dolorum consequatur ullam tempore accusamus debitis sit",
        "url": "http://placehold.it/600/250289",
        "thumbnailUrl": "http://placehold.it/150/250289"
      },
      {
        "albumId": 5,
        "id": 202,
        "title": "explicabo vel omnis corporis debitis qui qui",
        "url": "http://placehold.it/600/6a0f83",
        "thumbnailUrl": "http://placehold.it/150/6a0f83"
      },
      {
        "albumId": 5,
        "id": 203,
        "title": "labore vel voluptate ipsum quaerat debitis velit",
        "url": "http://placehold.it/600/3a5c29",
        "thumbnailUrl": "http://placehold.it/150/3a5c29"
      },
      {
        "albumId": 5,
        "id": 204,
        "title": "beatae est vel tenetur",
        "url": "http://placehold.it/600/e4cc33",
        "thumbnailUrl": "http://placehold.it/150/e4cc33"
      },
      {
        "albumId": 5,
        "id": 205,
        "title": "fugiat est ut ab sit et tempora",
        "url": "http://placehold.it/600/dc17bf",
        "thumbnailUrl": "http://placehold.it/150/dc17bf"
      },
      {
        "albumId": 5,
        "id": 206,
        "title": "possimus expedita ut",
        "url": "http://placehold.it/600/d12649",
        "thumbnailUrl": "http://placehold.it/150/d12649"
      },
      {
        "albumId": 5,
        "id": 207,
        "title": "culpa qui quos reiciendis aut nostrum et id temporibus",
        "url": "http://placehold.it/600/a1ff25",
        "thumbnailUrl": "http://placehold.it/150/a1ff25"
      },
      {
        "albumId": 5,
        "id": 208,
        "title": "ut voluptatem maiores nam ipsa beatae",
        "url": "http://placehold.it/600/40d9b8",
        "thumbnailUrl": "http://placehold.it/150/40d9b8"
      },
      {
        "albumId": 5,
        "id": 209,
        "title": "voluptatibus sit amet vel natus qui voluptatem",
        "url": "http://placehold.it/600/88c71d",
        "thumbnailUrl": "http://placehold.it/150/88c71d"
      },
      {
        "albumId": 5,
        "id": 210,
        "title": "et nisi tenetur nam amet sed",
        "url": "http://placehold.it/600/67d26",
        "thumbnailUrl": "http://placehold.it/150/67d26"
      },
      {
        "albumId": 5,
        "id": 211,
        "title": "est qui ratione",
        "url": "http://placehold.it/600/918fb8",
        "thumbnailUrl": "http://placehold.it/150/918fb8"
      },
      {
        "albumId": 5,
        "id": 212,
        "title": "id exercitationem doloremque vel provident et ea",
        "url": "http://placehold.it/600/9fa1a5",
        "thumbnailUrl": "http://placehold.it/150/9fa1a5"
      },
      {
        "albumId": 5,
        "id": 213,
        "title": "sed cum aut",
        "url": "http://placehold.it/600/d2d7f0",
        "thumbnailUrl": "http://placehold.it/150/d2d7f0"
      },
      {
        "albumId": 5,
        "id": 214,
        "title": "quis explicabo autem",
        "url": "http://placehold.it/600/511b3c",
        "thumbnailUrl": "http://placehold.it/150/511b3c"
      },
      {
        "albumId": 5,
        "id": 215,
        "title": "in magnam praesentium ab illum",
        "url": "http://placehold.it/600/15834f",
        "thumbnailUrl": "http://placehold.it/150/15834f"
      },
      {
        "albumId": 5,
        "id": 216,
        "title": "itaque nihil voluptatum",
        "url": "http://placehold.it/600/310675",
        "thumbnailUrl": "http://placehold.it/150/310675"
      },
      {
        "albumId": 5,
        "id": 217,
        "title": "ab ut placeat fuga",
        "url": "http://placehold.it/600/4f64e8",
        "thumbnailUrl": "http://placehold.it/150/4f64e8"
      },
      {
        "albumId": 5,
        "id": 218,
        "title": "neque placeat dolore assumenda repellat eius ut commodi",
        "url": "http://placehold.it/600/b27684",
        "thumbnailUrl": "http://placehold.it/150/b27684"
      },
      {
        "albumId": 5,
        "id": 219,
        "title": "nihil accusantium quos ipsam ut a",
        "url": "http://placehold.it/600/77f823",
        "thumbnailUrl": "http://placehold.it/150/77f823"
      },
      {
        "albumId": 5,
        "id": 220,
        "title": "ratione vel quas nostrum et eius est",
        "url": "http://placehold.it/600/53f7dd",
        "thumbnailUrl": "http://placehold.it/150/53f7dd"
      },
      {
        "albumId": 5,
        "id": 221,
        "title": "et iusto ratione maiores magnam animi itaque id",
        "url": "http://placehold.it/600/2f27c7",
        "thumbnailUrl": "http://placehold.it/150/2f27c7"
      },
      {
        "albumId": 5,
        "id": 222,
        "title": "et molestiae sint voluptas officiis voluptates recusandae laborum et",
        "url": "http://placehold.it/600/dccf6e",
        "thumbnailUrl": "http://placehold.it/150/dccf6e"
      },
      {
        "albumId": 5,
        "id": 223,
        "title": "qui beatae ea magnam nulla facilis voluptas",
        "url": "http://placehold.it/600/5a65f7",
        "thumbnailUrl": "http://placehold.it/150/5a65f7"
      },
      {
        "albumId": 5,
        "id": 224,
        "title": "omnis asperiores et velit fugit numquam tenetur et",
        "url": "http://placehold.it/600/b273e9",
        "thumbnailUrl": "http://placehold.it/150/b273e9"
      },
      {
        "albumId": 5,
        "id": 225,
        "title": "eum magnam expedita velit et vitae autem cupiditate",
        "url": "http://placehold.it/600/21f8c2",
        "thumbnailUrl": "http://placehold.it/150/21f8c2"
      },
      {
        "albumId": 5,
        "id": 226,
        "title": "omnis accusantium et",
        "url": "http://placehold.it/600/135ce6",
        "thumbnailUrl": "http://placehold.it/150/135ce6"
      },
      {
        "albumId": 5,
        "id": 227,
        "title": "quae facere aut",
        "url": "http://placehold.it/600/3c1e25",
        "thumbnailUrl": "http://placehold.it/150/3c1e25"
      },
      {
        "albumId": 5,
        "id": 228,
        "title": "laudantium magnam et culpa dolores harum ipsam",
        "url": "http://placehold.it/600/d8b6fa",
        "thumbnailUrl": "http://placehold.it/150/d8b6fa"
      },
      {
        "albumId": 5,
        "id": 229,
        "title": "fugit ut nostrum quia in laborum",
        "url": "http://placehold.it/600/9d3896",
        "thumbnailUrl": "http://placehold.it/150/9d3896"
      },
      {
        "albumId": 5,
        "id": 230,
        "title": "a deleniti quae exercitationem aut et reprehenderit",
        "url": "http://placehold.it/600/b24645",
        "thumbnailUrl": "http://placehold.it/150/b24645"
      },
      {
        "albumId": 5,
        "id": 231,
        "title": "placeat cumque ea accusamus quo veniam perspiciatis illo",
        "url": "http://placehold.it/600/ea3fb1",
        "thumbnailUrl": "http://placehold.it/150/ea3fb1"
      },
      {
        "albumId": 5,
        "id": 232,
        "title": "ea dicta velit dolorem ratione doloribus",
        "url": "http://placehold.it/600/92b48b",
        "thumbnailUrl": "http://placehold.it/150/92b48b"
      },
      {
        "albumId": 5,
        "id": 233,
        "title": "nesciunt dignissimos perspiciatis sint veritatis vero facere ipsa id",
        "url": "http://placehold.it/600/5e440",
        "thumbnailUrl": "http://placehold.it/150/5e440"
      },
      {
        "albumId": 5,
        "id": 234,
        "title": "qui laboriosam et quae consequatur",
        "url": "http://placehold.it/600/c52dc0",
        "thumbnailUrl": "http://placehold.it/150/c52dc0"
      },
      {
        "albumId": 5,
        "id": 235,
        "title": "officiis consequatur necessitatibus id beatae voluptatem in sit dolorem",
        "url": "http://placehold.it/600/72ce88",
        "thumbnailUrl": "http://placehold.it/150/72ce88"
      },
      {
        "albumId": 5,
        "id": 236,
        "title": "cumque nihil ullam laborum ut et",
        "url": "http://placehold.it/600/423b8d",
        "thumbnailUrl": "http://placehold.it/150/423b8d"
      },
      {
        "albumId": 5,
        "id": 237,
        "title": "vel quam tempore dolor eveniet",
        "url": "http://placehold.it/600/b4e761",
        "thumbnailUrl": "http://placehold.it/150/b4e761"
      },
      {
        "albumId": 5,
        "id": 238,
        "title": "aperiam mollitia nisi sed ad magnam repellendus et",
        "url": "http://placehold.it/600/80e9fe",
        "thumbnailUrl": "http://placehold.it/150/80e9fe"
      },
      {
        "albumId": 5,
        "id": 239,
        "title": "incidunt aliquid possimus",
        "url": "http://placehold.it/600/c6a0c",
        "thumbnailUrl": "http://placehold.it/150/c6a0c"
      },
      {
        "albumId": 5,
        "id": 240,
        "title": "rem neque reprehenderit",
        "url": "http://placehold.it/600/55ccaa",
        "thumbnailUrl": "http://placehold.it/150/55ccaa"
      },
      {
        "albumId": 5,
        "id": 241,
        "title": "magni expedita saepe tempore nulla officiis",
        "url": "http://placehold.it/600/af3ad6",
        "thumbnailUrl": "http://placehold.it/150/af3ad6"
      },
      {
        "albumId": 5,
        "id": 242,
        "title": "vitae ut sequi explicabo perspiciatis repudiandae omnis et qui",
        "url": "http://placehold.it/600/cc2282",
        "thumbnailUrl": "http://placehold.it/150/cc2282"
      },
      {
        "albumId": 5,
        "id": 243,
        "title": "sed nobis consequatur dolores",
        "url": "http://placehold.it/600/ad65d5",
        "thumbnailUrl": "http://placehold.it/150/ad65d5"
      },
      {
        "albumId": 5,
        "id": 244,
        "title": "aut doloribus quia unde quia",
        "url": "http://placehold.it/600/2a9243",
        "thumbnailUrl": "http://placehold.it/150/2a9243"
      },
      {
        "albumId": 5,
        "id": 245,
        "title": "iusto ut et ea voluptas voluptatum aut eum",
        "url": "http://placehold.it/600/a81869",
        "thumbnailUrl": "http://placehold.it/150/a81869"
      },
      {
        "albumId": 5,
        "id": 246,
        "title": "voluptatibus reiciendis ipsa exercitationem saepe quos architecto veniam aperiam",
        "url": "http://placehold.it/600/3a14eb",
        "thumbnailUrl": "http://placehold.it/150/3a14eb"
      },
      {
        "albumId": 5,
        "id": 247,
        "title": "ducimus provident possimus",
        "url": "http://placehold.it/600/7f47e7",
        "thumbnailUrl": "http://placehold.it/150/7f47e7"
      },
      {
        "albumId": 5,
        "id": 248,
        "title": "doloremque autem similique et beatae cupiditate sed nulla",
        "url": "http://placehold.it/600/c757e5",
        "thumbnailUrl": "http://placehold.it/150/c757e5"
      },
      {
        "albumId": 5,
        "id": 249,
        "title": "quia ipsum ut voluptatem saepe nam ipsam beatae",
        "url": "http://placehold.it/600/54c842",
        "thumbnailUrl": "http://placehold.it/150/54c842"
      },
      {
        "albumId": 5,
        "id": 250,
        "title": "voluptatem repellendus voluptatibus id occaecati ipsam dignissimos officia",
        "url": "http://placehold.it/600/e33ffb",
        "thumbnailUrl": "http://placehold.it/150/e33ffb"
      },
      {
        "albumId": 6,
        "id": 251,
        "title": "voluptatibus nihil a",
        "url": "http://placehold.it/600/afc5c2",
        "thumbnailUrl": "http://placehold.it/150/afc5c2"
      },
      {
        "albumId": 6,
        "id": 252,
        "title": "est quisquam ducimus excepturi optio rem sit",
        "url": "http://placehold.it/600/1dc050",
        "thumbnailUrl": "http://placehold.it/150/1dc050"
      },
      {
        "albumId": 6,
        "id": 253,
        "title": "dolor qui id",
        "url": "http://placehold.it/600/bfb73",
        "thumbnailUrl": "http://placehold.it/150/bfb73"
      },
      {
        "albumId": 6,
        "id": 254,
        "title": "quas dolorem similique enim voluptatem vitae rerum voluptatem",
        "url": "http://placehold.it/600/b9a4",
        "thumbnailUrl": "http://placehold.it/150/b9a4"
      },
      {
        "albumId": 6,
        "id": 255,
        "title": "minus facilis quia voluptatem qui dolor et consectetur aut",
        "url": "http://placehold.it/600/5a8411",
        "thumbnailUrl": "http://placehold.it/150/5a8411"
      },
      {
        "albumId": 6,
        "id": 256,
        "title": "inventore quia id magni quas animi distinctio rerum",
        "url": "http://placehold.it/600/fd387",
        "thumbnailUrl": "http://placehold.it/150/fd387"
      },
      {
        "albumId": 6,
        "id": 257,
        "title": "dolorem sunt assumenda quia nulla perspiciatis",
        "url": "http://placehold.it/600/4fa7ef",
        "thumbnailUrl": "http://placehold.it/150/4fa7ef"
      },
      {
        "albumId": 6,
        "id": 258,
        "title": "nemo temporibus nihil alias deserunt magni sequi",
        "url": "http://placehold.it/600/c29554",
        "thumbnailUrl": "http://placehold.it/150/c29554"
      },
      {
        "albumId": 6,
        "id": 259,
        "title": "delectus molestias aut sint fugiat laudantium sequi praesentium",
        "url": "http://placehold.it/600/ccced",
        "thumbnailUrl": "http://placehold.it/150/ccced"
      },
      {
        "albumId": 6,
        "id": 260,
        "title": "aut voluptas repudiandae iusto saepe aut vel dolorem",
        "url": "http://placehold.it/600/b1b6c7",
        "thumbnailUrl": "http://placehold.it/150/b1b6c7"
      },
      {
        "albumId": 6,
        "id": 261,
        "title": "officia fugit corrupti impedit enim odit",
        "url": "http://placehold.it/600/96dc0d",
        "thumbnailUrl": "http://placehold.it/150/96dc0d"
      },
      {
        "albumId": 6,
        "id": 262,
        "title": "id corporis impedit illo aut",
        "url": "http://placehold.it/600/577a8f",
        "thumbnailUrl": "http://placehold.it/150/577a8f"
      },
      {
        "albumId": 6,
        "id": 263,
        "title": "harum possimus animi enim",
        "url": "http://placehold.it/600/177c9a",
        "thumbnailUrl": "http://placehold.it/150/177c9a"
      },
      {
        "albumId": 6,
        "id": 264,
        "title": "dolores consequatur expedita dolore repellendus blanditiis",
        "url": "http://placehold.it/600/a213eb",
        "thumbnailUrl": "http://placehold.it/150/a213eb"
      },
      {
        "albumId": 6,
        "id": 265,
        "title": "consequatur ut mollitia alias",
        "url": "http://placehold.it/600/90916d",
        "thumbnailUrl": "http://placehold.it/150/90916d"
      },
      {
        "albumId": 6,
        "id": 266,
        "title": "quidem necessitatibus vero minima consectetur",
        "url": "http://placehold.it/600/aa7ca8",
        "thumbnailUrl": "http://placehold.it/150/aa7ca8"
      },
      {
        "albumId": 6,
        "id": 267,
        "title": "sit dignissimos et eaque nostrum laboriosam mollitia expedita similique",
        "url": "http://placehold.it/600/1c5f21",
        "thumbnailUrl": "http://placehold.it/150/1c5f21"
      },
      {
        "albumId": 6,
        "id": 268,
        "title": "ea eligendi aut fugit nam non",
        "url": "http://placehold.it/600/2efb1a",
        "thumbnailUrl": "http://placehold.it/150/2efb1a"
      },
      {
        "albumId": 6,
        "id": 269,
        "title": "quod est illum ipsa unde voluptatem eum est",
        "url": "http://placehold.it/600/cb47e2",
        "thumbnailUrl": "http://placehold.it/150/cb47e2"
      },
      {
        "albumId": 6,
        "id": 270,
        "title": "sit officia amet sed et",
        "url": "http://placehold.it/600/4dcdf6",
        "thumbnailUrl": "http://placehold.it/150/4dcdf6"
      },
      {
        "albumId": 6,
        "id": 271,
        "title": "est id quaerat aut non perspiciatis aut",
        "url": "http://placehold.it/600/9ba35f",
        "thumbnailUrl": "http://placehold.it/150/9ba35f"
      },
      {
        "albumId": 6,
        "id": 272,
        "title": "fugit eum architecto laudantium quae veritatis sint facilis rerum",
        "url": "http://placehold.it/600/1821a0",
        "thumbnailUrl": "http://placehold.it/150/1821a0"
      },
      {
        "albumId": 6,
        "id": 273,
        "title": "libero perspiciatis sed sint hic impedit porro explicabo iure",
        "url": "http://placehold.it/600/a334b3",
        "thumbnailUrl": "http://placehold.it/150/a334b3"
      },
      {
        "albumId": 6,
        "id": 274,
        "title": "sint beatae incidunt in totam",
        "url": "http://placehold.it/600/6ffb88",
        "thumbnailUrl": "http://placehold.it/150/6ffb88"
      },
      {
        "albumId": 6,
        "id": 275,
        "title": "consequuntur quo fugit non",
        "url": "http://placehold.it/600/6aa9af",
        "thumbnailUrl": "http://placehold.it/150/6aa9af"
      },
      {
        "albumId": 6,
        "id": 276,
        "title": "vel quis quos alias ducimus similique atque voluptatibus",
        "url": "http://placehold.it/600/4c48b8",
        "thumbnailUrl": "http://placehold.it/150/4c48b8"
      },
      {
        "albumId": 6,
        "id": 277,
        "title": "quasi ut eaque fugit alias",
        "url": "http://placehold.it/600/f6253f",
        "thumbnailUrl": "http://placehold.it/150/f6253f"
      },
      {
        "albumId": 6,
        "id": 278,
        "title": "tempora eaque et ipsum totam rem",
        "url": "http://placehold.it/600/c6fd2e",
        "thumbnailUrl": "http://placehold.it/150/c6fd2e"
      },
      {
        "albumId": 6,
        "id": 279,
        "title": "et similique illo repellendus tenetur consequuntur pariatur",
        "url": "http://placehold.it/600/4b5891",
        "thumbnailUrl": "http://placehold.it/150/4b5891"
      },
      {
        "albumId": 6,
        "id": 280,
        "title": "doloremque nihil necessitatibus",
        "url": "http://placehold.it/600/132e07",
        "thumbnailUrl": "http://placehold.it/150/132e07"
      },
      {
        "albumId": 6,
        "id": 281,
        "title": "et aliquid suscipit",
        "url": "http://placehold.it/600/aeb299",
        "thumbnailUrl": "http://placehold.it/150/aeb299"
      },
      {
        "albumId": 6,
        "id": 282,
        "title": "rerum odit iste unde eveniet",
        "url": "http://placehold.it/600/7ebf34",
        "thumbnailUrl": "http://placehold.it/150/7ebf34"
      },
      {
        "albumId": 6,
        "id": 283,
        "title": "expedita quibusdam consequatur",
        "url": "http://placehold.it/600/7b227b",
        "thumbnailUrl": "http://placehold.it/150/7b227b"
      },
      {
        "albumId": 6,
        "id": 284,
        "title": "numquam velit consequuntur qui maxime ut et cum dolorem",
        "url": "http://placehold.it/600/7c76d8",
        "thumbnailUrl": "http://placehold.it/150/7c76d8"
      },
      {
        "albumId": 6,
        "id": 285,
        "title": "sunt sit dolorum dignissimos repellat est porro",
        "url": "http://placehold.it/600/ecde",
        "thumbnailUrl": "http://placehold.it/150/ecde"
      },
      {
        "albumId": 6,
        "id": 286,
        "title": "nemo inventore totam vel reiciendis aut",
        "url": "http://placehold.it/600/da11fc",
        "thumbnailUrl": "http://placehold.it/150/da11fc"
      },
      {
        "albumId": 6,
        "id": 287,
        "title": "quis facere perspiciatis consequatur quo hic blanditiis qui",
        "url": "http://placehold.it/600/d0e215",
        "thumbnailUrl": "http://placehold.it/150/d0e215"
      },
      {
        "albumId": 6,
        "id": 288,
        "title": "vel quod officiis nemo impedit tempora veritatis exercitationem",
        "url": "http://placehold.it/600/d7eb6f",
        "thumbnailUrl": "http://placehold.it/150/d7eb6f"
      },
      {
        "albumId": 6,
        "id": 289,
        "title": "molestias et sit voluptates modi consectetur non",
        "url": "http://placehold.it/600/341696",
        "thumbnailUrl": "http://placehold.it/150/341696"
      },
      {
        "albumId": 6,
        "id": 290,
        "title": "a deserunt amet odit voluptatem hic",
        "url": "http://placehold.it/600/7d55ef",
        "thumbnailUrl": "http://placehold.it/150/7d55ef"
      },
      {
        "albumId": 6,
        "id": 291,
        "title": "est velit at",
        "url": "http://placehold.it/600/99f0a8",
        "thumbnailUrl": "http://placehold.it/150/99f0a8"
      },
      {
        "albumId": 6,
        "id": 292,
        "title": "impedit facilis nisi officia distinctio aliquid aut blanditiis",
        "url": "http://placehold.it/600/205992",
        "thumbnailUrl": "http://placehold.it/150/205992"
      },
      {
        "albumId": 6,
        "id": 293,
        "title": "ut consequatur recusandae odit inventore non et",
        "url": "http://placehold.it/600/8ad8fd",
        "thumbnailUrl": "http://placehold.it/150/8ad8fd"
      },
      {
        "albumId": 6,
        "id": 294,
        "title": "consequuntur qui et culpa eveniet porro quis",
        "url": "http://placehold.it/600/5ef634",
        "thumbnailUrl": "http://placehold.it/150/5ef634"
      },
      {
        "albumId": 6,
        "id": 295,
        "title": "dolores eligendi quibusdam animi perferendis occaecati similique",
        "url": "http://placehold.it/600/fa1da0",
        "thumbnailUrl": "http://placehold.it/150/fa1da0"
      },
      {
        "albumId": 6,
        "id": 296,
        "title": "saepe eius labore ea est omnis",
        "url": "http://placehold.it/600/4d4697",
        "thumbnailUrl": "http://placehold.it/150/4d4697"
      },
      {
        "albumId": 6,
        "id": 297,
        "title": "eaque deserunt et maxime consequatur recusandae voluptatibus inventore aut",
        "url": "http://placehold.it/600/ce6829",
        "thumbnailUrl": "http://placehold.it/150/ce6829"
      },
      {
        "albumId": 6,
        "id": 298,
        "title": "id molestias tempora explicabo reprehenderit dicta unde",
        "url": "http://placehold.it/600/c97820",
        "thumbnailUrl": "http://placehold.it/150/c97820"
      },
      {
        "albumId": 6,
        "id": 299,
        "title": "laboriosam culpa error sit velit",
        "url": "http://placehold.it/600/323c46",
        "thumbnailUrl": "http://placehold.it/150/323c46"
      },
      {
        "albumId": 6,
        "id": 300,
        "title": "minus error et eveniet",
        "url": "http://placehold.it/600/9de06d",
        "thumbnailUrl": "http://placehold.it/150/9de06d"
      },
      {
        "albumId": 7,
        "id": 301,
        "title": "aspernatur est omnis qui laudantium illo in laborum dolore",
        "url": "http://placehold.it/600/92ce9a",
        "thumbnailUrl": "http://placehold.it/150/92ce9a"
      },
      {
        "albumId": 7,
        "id": 302,
        "title": "nihil et ducimus in ipsa perspiciatis",
        "url": "http://placehold.it/600/4e2b80",
        "thumbnailUrl": "http://placehold.it/150/4e2b80"
      },
      {
        "albumId": 7,
        "id": 303,
        "title": "minima sit nulla",
        "url": "http://placehold.it/600/2c253f",
        "thumbnailUrl": "http://placehold.it/150/2c253f"
      },
      {
        "albumId": 7,
        "id": 304,
        "title": "animi sit pariatur odio autem consequatur autem amet",
        "url": "http://placehold.it/600/f317f5",
        "thumbnailUrl": "http://placehold.it/150/f317f5"
      },
      {
        "albumId": 7,
        "id": 305,
        "title": "ea rem impedit facilis nobis velit in",
        "url": "http://placehold.it/600/37060d",
        "thumbnailUrl": "http://placehold.it/150/37060d"
      },
      {
        "albumId": 7,
        "id": 306,
        "title": "impedit aliquid consequatur enim ipsa fugit fugiat dolorem vel",
        "url": "http://placehold.it/600/f8c85b",
        "thumbnailUrl": "http://placehold.it/150/f8c85b"
      },
      {
        "albumId": 7,
        "id": 307,
        "title": "eum et corporis",
        "url": "http://placehold.it/600/d53ba7",
        "thumbnailUrl": "http://placehold.it/150/d53ba7"
      },
      {
        "albumId": 7,
        "id": 308,
        "title": "sit error blanditiis ut ullam quis",
        "url": "http://placehold.it/600/674df0",
        "thumbnailUrl": "http://placehold.it/150/674df0"
      },
      {
        "albumId": 7,
        "id": 309,
        "title": "voluptas explicabo est officiis expedita ratione quaerat cumque veritatis",
        "url": "http://placehold.it/600/9bd233",
        "thumbnailUrl": "http://placehold.it/150/9bd233"
      },
      {
        "albumId": 7,
        "id": 310,
        "title": "rerum facilis harum reprehenderit quia odit",
        "url": "http://placehold.it/600/991a91",
        "thumbnailUrl": "http://placehold.it/150/991a91"
      },
      {
        "albumId": 7,
        "id": 311,
        "title": "rerum doloremque occaecati reiciendis",
        "url": "http://placehold.it/600/f2cf5e",
        "thumbnailUrl": "http://placehold.it/150/f2cf5e"
      },
      {
        "albumId": 7,
        "id": 312,
        "title": "omnis eos tempora odio nostrum",
        "url": "http://placehold.it/600/3ea67c",
        "thumbnailUrl": "http://placehold.it/150/3ea67c"
      },
      {
        "albumId": 7,
        "id": 313,
        "title": "commodi labore dicta tempore voluptas",
        "url": "http://placehold.it/600/5aba2d",
        "thumbnailUrl": "http://placehold.it/150/5aba2d"
      },
      {
        "albumId": 7,
        "id": 314,
        "title": "cumque nisi et est qui officia ea libero",
        "url": "http://placehold.it/600/2182ee",
        "thumbnailUrl": "http://placehold.it/150/2182ee"
      },
      {
        "albumId": 7,
        "id": 315,
        "title": "consequatur inventore quasi assumenda quibusdam expedita",
        "url": "http://placehold.it/600/728526",
        "thumbnailUrl": "http://placehold.it/150/728526"
      },
      {
        "albumId": 7,
        "id": 316,
        "title": "aut alias consequatur laborum et animi nulla",
        "url": "http://placehold.it/600/e2a4eb",
        "thumbnailUrl": "http://placehold.it/150/e2a4eb"
      },
      {
        "albumId": 7,
        "id": 317,
        "title": "tenetur quod consequatur omnis vel ea",
        "url": "http://placehold.it/600/bbe1bb",
        "thumbnailUrl": "http://placehold.it/150/bbe1bb"
      },
      {
        "albumId": 7,
        "id": 318,
        "title": "numquam repudiandae iusto consequuntur incidunt",
        "url": "http://placehold.it/600/59de24",
        "thumbnailUrl": "http://placehold.it/150/59de24"
      },
      {
        "albumId": 7,
        "id": 319,
        "title": "et itaque labore quibusdam",
        "url": "http://placehold.it/600/af369d",
        "thumbnailUrl": "http://placehold.it/150/af369d"
      },
      {
        "albumId": 7,
        "id": 320,
        "title": "et dolores perspiciatis molestias natus et",
        "url": "http://placehold.it/600/e0154e",
        "thumbnailUrl": "http://placehold.it/150/e0154e"
      },
      {
        "albumId": 7,
        "id": 321,
        "title": "nihil repellendus minus est et praesentium sed nostrum ut",
        "url": "http://placehold.it/600/ac9d84",
        "thumbnailUrl": "http://placehold.it/150/ac9d84"
      },
      {
        "albumId": 7,
        "id": 322,
        "title": "doloremque consequatur deserunt repellat ut voluptatem aut corrupti",
        "url": "http://placehold.it/600/fb4137",
        "thumbnailUrl": "http://placehold.it/150/fb4137"
      },
      {
        "albumId": 7,
        "id": 323,
        "title": "nihil sed laboriosam voluptate repellat nobis",
        "url": "http://placehold.it/600/a2b8e9",
        "thumbnailUrl": "http://placehold.it/150/a2b8e9"
      },
      {
        "albumId": 7,
        "id": 324,
        "title": "magni quam et rerum",
        "url": "http://placehold.it/600/4c0b63",
        "thumbnailUrl": "http://placehold.it/150/4c0b63"
      },
      {
        "albumId": 7,
        "id": 325,
        "title": "libero perferendis quis suscipit reprehenderit",
        "url": "http://placehold.it/600/e55861",
        "thumbnailUrl": "http://placehold.it/150/e55861"
      },
      {
        "albumId": 7,
        "id": 326,
        "title": "a eum aliquid adipisci maxime consequuntur quas perferendis voluptate",
        "url": "http://placehold.it/600/fee2f2",
        "thumbnailUrl": "http://placehold.it/150/fee2f2"
      },
      {
        "albumId": 7,
        "id": 327,
        "title": "ex voluptas consequatur facere quia quae est",
        "url": "http://placehold.it/600/5cdf68",
        "thumbnailUrl": "http://placehold.it/150/5cdf68"
      },
      {
        "albumId": 7,
        "id": 328,
        "title": "non ab amet culpa sunt",
        "url": "http://placehold.it/600/906635",
        "thumbnailUrl": "http://placehold.it/150/906635"
      },
      {
        "albumId": 7,
        "id": 329,
        "title": "sint rerum ducimus inventore itaque voluptates quo ipsum",
        "url": "http://placehold.it/600/261e50",
        "thumbnailUrl": "http://placehold.it/150/261e50"
      },
      {
        "albumId": 7,
        "id": 330,
        "title": "fugiat aut laborum perferendis atque",
        "url": "http://placehold.it/600/d2ddd4",
        "thumbnailUrl": "http://placehold.it/150/d2ddd4"
      },
      {
        "albumId": 7,
        "id": 331,
        "title": "et repudiandae laudantium enim non et",
        "url": "http://placehold.it/600/224984",
        "thumbnailUrl": "http://placehold.it/150/224984"
      },
      {
        "albumId": 7,
        "id": 332,
        "title": "ipsam ut rem alias qui necessitatibus",
        "url": "http://placehold.it/600/f08aac",
        "thumbnailUrl": "http://placehold.it/150/f08aac"
      },
      {
        "albumId": 7,
        "id": 333,
        "title": "quaerat iste voluptates dolor dolores libero adipisci unde",
        "url": "http://placehold.it/600/c52389",
        "thumbnailUrl": "http://placehold.it/150/c52389"
      },
      {
        "albumId": 7,
        "id": 334,
        "title": "libero quod commodi ea eligendi voluptatem iure alias possimus",
        "url": "http://placehold.it/600/c9f071",
        "thumbnailUrl": "http://placehold.it/150/c9f071"
      },
      {
        "albumId": 7,
        "id": 335,
        "title": "ab voluptatum nisi ipsa consequuntur saepe nam occaecati quidem",
        "url": "http://placehold.it/600/b6f7d2",
        "thumbnailUrl": "http://placehold.it/150/b6f7d2"
      },
      {
        "albumId": 7,
        "id": 336,
        "title": "voluptatem et consequatur corrupti accusamus officiis",
        "url": "http://placehold.it/600/23df39",
        "thumbnailUrl": "http://placehold.it/150/23df39"
      },
      {
        "albumId": 7,
        "id": 337,
        "title": "nisi doloribus est commodi qui",
        "url": "http://placehold.it/600/13a5b9",
        "thumbnailUrl": "http://placehold.it/150/13a5b9"
      },
      {
        "albumId": 7,
        "id": 338,
        "title": "excepturi iste asperiores officia magnam vitae aspernatur veritatis",
        "url": "http://placehold.it/600/f5d8e1",
        "thumbnailUrl": "http://placehold.it/150/f5d8e1"
      },
      {
        "albumId": 7,
        "id": 339,
        "title": "laboriosam maxime molestiae et veniam corporis eius alias a",
        "url": "http://placehold.it/600/b5f722",
        "thumbnailUrl": "http://placehold.it/150/b5f722"
      },
      {
        "albumId": 7,
        "id": 340,
        "title": "autem eveniet est suscipit vitae",
        "url": "http://placehold.it/600/a88404",
        "thumbnailUrl": "http://placehold.it/150/a88404"
      },
      {
        "albumId": 7,
        "id": 341,
        "title": "distinctio quos ullam in non aspernatur non alias",
        "url": "http://placehold.it/600/714582",
        "thumbnailUrl": "http://placehold.it/150/714582"
      },
      {
        "albumId": 7,
        "id": 342,
        "title": "exercitationem quibusdam dolores",
        "url": "http://placehold.it/600/a8a38d",
        "thumbnailUrl": "http://placehold.it/150/a8a38d"
      },
      {
        "albumId": 7,
        "id": 343,
        "title": "debitis soluta vel ducimus",
        "url": "http://placehold.it/600/7c8e71",
        "thumbnailUrl": "http://placehold.it/150/7c8e71"
      },
      {
        "albumId": 7,
        "id": 344,
        "title": "officia veritatis inventore",
        "url": "http://placehold.it/600/bb5137",
        "thumbnailUrl": "http://placehold.it/150/bb5137"
      },
      {
        "albumId": 7,
        "id": 345,
        "title": "corporis iste dolore maiores",
        "url": "http://placehold.it/600/ddaa24",
        "thumbnailUrl": "http://placehold.it/150/ddaa24"
      },
      {
        "albumId": 7,
        "id": 346,
        "title": "sed nobis voluptatem",
        "url": "http://placehold.it/600/26fab4",
        "thumbnailUrl": "http://placehold.it/150/26fab4"
      },
      {
        "albumId": 7,
        "id": 347,
        "title": "nihil numquam at tempore sed",
        "url": "http://placehold.it/600/8726ea",
        "thumbnailUrl": "http://placehold.it/150/8726ea"
      },
      {
        "albumId": 7,
        "id": 348,
        "title": "libero numquam voluptates odio",
        "url": "http://placehold.it/600/488580",
        "thumbnailUrl": "http://placehold.it/150/488580"
      },
      {
        "albumId": 7,
        "id": 349,
        "title": "et dolores cum et explicabo non dolor voluptas",
        "url": "http://placehold.it/600/76004e",
        "thumbnailUrl": "http://placehold.it/150/76004e"
      },
      {
        "albumId": 7,
        "id": 350,
        "title": "et excepturi temporibus illum voluptatum a omnis ad",
        "url": "http://placehold.it/600/1adbcb",
        "thumbnailUrl": "http://placehold.it/150/1adbcb"
      },
      {
        "albumId": 8,
        "id": 351,
        "title": "molestias debitis cum",
        "url": "http://placehold.it/600/9ae7cb",
        "thumbnailUrl": "http://placehold.it/150/9ae7cb"
      },
      {
        "albumId": 8,
        "id": 352,
        "title": "atque aut aut nemo eum qui rem eaque suscipit",
        "url": "http://placehold.it/600/df14ab",
        "thumbnailUrl": "http://placehold.it/150/df14ab"
      },
      {
        "albumId": 8,
        "id": 353,
        "title": "quia consequatur fugit atque est saepe",
        "url": "http://placehold.it/600/44e038",
        "thumbnailUrl": "http://placehold.it/150/44e038"
      },
      {
        "albumId": 8,
        "id": 354,
        "title": "quidem aut earum",
        "url": "http://placehold.it/600/5498f2",
        "thumbnailUrl": "http://placehold.it/150/5498f2"
      },
      {
        "albumId": 8,
        "id": 355,
        "title": "minima ea qui adipisci quo ipsa",
        "url": "http://placehold.it/600/b28568",
        "thumbnailUrl": "http://placehold.it/150/b28568"
      },
      {
        "albumId": 8,
        "id": 356,
        "title": "velit aut qui alias",
        "url": "http://placehold.it/600/bdba4",
        "thumbnailUrl": "http://placehold.it/150/bdba4"
      },
      {
        "albumId": 8,
        "id": 357,
        "title": "architecto aperiam maxime reprehenderit et cupiditate ipsa",
        "url": "http://placehold.it/600/a41675",
        "thumbnailUrl": "http://placehold.it/150/a41675"
      },
      {
        "albumId": 8,
        "id": 358,
        "title": "doloribus magnam iste eos",
        "url": "http://placehold.it/600/affe00",
        "thumbnailUrl": "http://placehold.it/150/affe00"
      },
      {
        "albumId": 8,
        "id": 359,
        "title": "dolor nisi incidunt fuga blanditiis dicta placeat",
        "url": "http://placehold.it/600/27a49e",
        "thumbnailUrl": "http://placehold.it/150/27a49e"
      },
      {
        "albumId": 8,
        "id": 360,
        "title": "et laudantium quas",
        "url": "http://placehold.it/600/699458",
        "thumbnailUrl": "http://placehold.it/150/699458"
      },
      {
        "albumId": 8,
        "id": 361,
        "title": "odio iure cum iusto aut ullam aliquam praesentium",
        "url": "http://placehold.it/600/73a23c",
        "thumbnailUrl": "http://placehold.it/150/73a23c"
      },
      {
        "albumId": 8,
        "id": 362,
        "title": "neque quasi ea quia et",
        "url": "http://placehold.it/600/9c8f57",
        "thumbnailUrl": "http://placehold.it/150/9c8f57"
      },
      {
        "albumId": 8,
        "id": 363,
        "title": "rem sed quam",
        "url": "http://placehold.it/600/ee7b2c",
        "thumbnailUrl": "http://placehold.it/150/ee7b2c"
      },
      {
        "albumId": 8,
        "id": 364,
        "title": "et sit repudiandae qui",
        "url": "http://placehold.it/600/8da619",
        "thumbnailUrl": "http://placehold.it/150/8da619"
      },
      {
        "albumId": 8,
        "id": 365,
        "title": "qui officia necessitatibus debitis et sunt quis non minus",
        "url": "http://placehold.it/600/39cac2",
        "thumbnailUrl": "http://placehold.it/150/39cac2"
      },
      {
        "albumId": 8,
        "id": 366,
        "title": "qui et quia nisi",
        "url": "http://placehold.it/600/976641",
        "thumbnailUrl": "http://placehold.it/150/976641"
      },
      {
        "albumId": 8,
        "id": 367,
        "title": "id voluptatem non ut sapiente",
        "url": "http://placehold.it/600/8b45ea",
        "thumbnailUrl": "http://placehold.it/150/8b45ea"
      },
      {
        "albumId": 8,
        "id": 368,
        "title": "quaerat labore aut ducimus incidunt ex",
        "url": "http://placehold.it/600/94182d",
        "thumbnailUrl": "http://placehold.it/150/94182d"
      },
      {
        "albumId": 8,
        "id": 369,
        "title": "neque perspiciatis sint vero non qui",
        "url": "http://placehold.it/600/77e4a2",
        "thumbnailUrl": "http://placehold.it/150/77e4a2"
      },
      {
        "albumId": 8,
        "id": 370,
        "title": "rerum non quia dolore",
        "url": "http://placehold.it/600/6d53ce",
        "thumbnailUrl": "http://placehold.it/150/6d53ce"
      },
      {
        "albumId": 8,
        "id": 371,
        "title": "adipisci asperiores aperiam",
        "url": "http://placehold.it/600/7a4c0f",
        "thumbnailUrl": "http://placehold.it/150/7a4c0f"
      },
      {
        "albumId": 8,
        "id": 372,
        "title": "ratione omnis fugiat sit fuga",
        "url": "http://placehold.it/600/9c1b1e",
        "thumbnailUrl": "http://placehold.it/150/9c1b1e"
      },
      {
        "albumId": 8,
        "id": 373,
        "title": "eum dicta deleniti porro",
        "url": "http://placehold.it/600/6a6136",
        "thumbnailUrl": "http://placehold.it/150/6a6136"
      },
      {
        "albumId": 8,
        "id": 374,
        "title": "ullam aut consequatur libero provident et porro",
        "url": "http://placehold.it/600/dd420e",
        "thumbnailUrl": "http://placehold.it/150/dd420e"
      },
      {
        "albumId": 8,
        "id": 375,
        "title": "voluptas repudiandae totam dolores voluptatem tempora et assumenda ducimus",
        "url": "http://placehold.it/600/8eb5c2",
        "thumbnailUrl": "http://placehold.it/150/8eb5c2"
      },
      {
        "albumId": 8,
        "id": 376,
        "title": "est exercitationem aliquam omnis quia quas qui qui dolor",
        "url": "http://placehold.it/600/24d0d1",
        "thumbnailUrl": "http://placehold.it/150/24d0d1"
      },
      {
        "albumId": 8,
        "id": 377,
        "title": "illum architecto rerum rerum",
        "url": "http://placehold.it/600/bf47cb",
        "thumbnailUrl": "http://placehold.it/150/bf47cb"
      },
      {
        "albumId": 8,
        "id": 378,
        "title": "veritatis quos vel omnis error",
        "url": "http://placehold.it/600/c74808",
        "thumbnailUrl": "http://placehold.it/150/c74808"
      },
      {
        "albumId": 8,
        "id": 379,
        "title": "quaerat rerum non",
        "url": "http://placehold.it/600/ea74e",
        "thumbnailUrl": "http://placehold.it/150/ea74e"
      },
      {
        "albumId": 8,
        "id": 380,
        "title": "voluptates earum dolor perferendis et",
        "url": "http://placehold.it/600/6be8c1",
        "thumbnailUrl": "http://placehold.it/150/6be8c1"
      },
      {
        "albumId": 8,
        "id": 381,
        "title": "sed quo et et nemo earum omnis quia",
        "url": "http://placehold.it/600/627b42",
        "thumbnailUrl": "http://placehold.it/150/627b42"
      },
      {
        "albumId": 8,
        "id": 382,
        "title": "iusto nam atque facilis est eos",
        "url": "http://placehold.it/600/36f93e",
        "thumbnailUrl": "http://placehold.it/150/36f93e"
      },
      {
        "albumId": 8,
        "id": 383,
        "title": "doloribus est assumenda eligendi cum asperiores earum vel",
        "url": "http://placehold.it/600/6f3eae",
        "thumbnailUrl": "http://placehold.it/150/6f3eae"
      },
      {
        "albumId": 8,
        "id": 384,
        "title": "aut quia ad earum consequatur",
        "url": "http://placehold.it/600/d94fb7",
        "thumbnailUrl": "http://placehold.it/150/d94fb7"
      },
      {
        "albumId": 8,
        "id": 385,
        "title": "blanditiis labore fugiat eum esse dolores inventore",
        "url": "http://placehold.it/600/696ef",
        "thumbnailUrl": "http://placehold.it/150/696ef"
      },
      {
        "albumId": 8,
        "id": 386,
        "title": "sequi autem fugiat ab incidunt mollitia",
        "url": "http://placehold.it/600/6b51f3",
        "thumbnailUrl": "http://placehold.it/150/6b51f3"
      },
      {
        "albumId": 8,
        "id": 387,
        "title": "et quam explicabo molestiae fugiat ipsa eum nesciunt quae",
        "url": "http://placehold.it/600/747986",
        "thumbnailUrl": "http://placehold.it/150/747986"
      },
      {
        "albumId": 8,
        "id": 388,
        "title": "quos tempore nihil rerum rerum aut libero",
        "url": "http://placehold.it/600/8661f8",
        "thumbnailUrl": "http://placehold.it/150/8661f8"
      },
      {
        "albumId": 8,
        "id": 389,
        "title": "sapiente illum vel adipisci aliquid quia",
        "url": "http://placehold.it/600/122741",
        "thumbnailUrl": "http://placehold.it/150/122741"
      },
      {
        "albumId": 8,
        "id": 390,
        "title": "reprehenderit nesciunt delectus",
        "url": "http://placehold.it/600/7df63c",
        "thumbnailUrl": "http://placehold.it/150/7df63c"
      },
      {
        "albumId": 8,
        "id": 391,
        "title": "eos reprehenderit nesciunt sit aut",
        "url": "http://placehold.it/600/7ff922",
        "thumbnailUrl": "http://placehold.it/150/7ff922"
      },
      {
        "albumId": 8,
        "id": 392,
        "title": "ut placeat amet veritatis impedit dolorem dolorem",
        "url": "http://placehold.it/600/be4c",
        "thumbnailUrl": "http://placehold.it/150/be4c"
      },
      {
        "albumId": 8,
        "id": 393,
        "title": "eveniet qui et",
        "url": "http://placehold.it/600/f0d8ad",
        "thumbnailUrl": "http://placehold.it/150/f0d8ad"
      },
      {
        "albumId": 8,
        "id": 394,
        "title": "possimus iure voluptas laborum",
        "url": "http://placehold.it/600/236552",
        "thumbnailUrl": "http://placehold.it/150/236552"
      },
      {
        "albumId": 8,
        "id": 395,
        "title": "eveniet sapiente aut ut",
        "url": "http://placehold.it/600/f119b1",
        "thumbnailUrl": "http://placehold.it/150/f119b1"
      },
      {
        "albumId": 8,
        "id": 396,
        "title": "est veniam ut quod sit quae itaque saepe fugit",
        "url": "http://placehold.it/600/bc4c9a",
        "thumbnailUrl": "http://placehold.it/150/bc4c9a"
      },
      {
        "albumId": 8,
        "id": 397,
        "title": "sint eos veritatis numquam modi est",
        "url": "http://placehold.it/600/57c7c3",
        "thumbnailUrl": "http://placehold.it/150/57c7c3"
      },
      {
        "albumId": 8,
        "id": 398,
        "title": "aperiam repellat sunt quibusdam aut provident esse",
        "url": "http://placehold.it/600/9a4811",
        "thumbnailUrl": "http://placehold.it/150/9a4811"
      },
      {
        "albumId": 8,
        "id": 399,
        "title": "magni quo nisi",
        "url": "http://placehold.it/600/8c4173",
        "thumbnailUrl": "http://placehold.it/150/8c4173"
      },
      {
        "albumId": 8,
        "id": 400,
        "title": "sit a cumque ipsum",
        "url": "http://placehold.it/600/f86d1f",
        "thumbnailUrl": "http://placehold.it/150/f86d1f"
      },
      {
        "albumId": 9,
        "id": 401,
        "title": "vitae et cumque velit repellat eaque",
        "url": "http://placehold.it/600/9f134c",
        "thumbnailUrl": "http://placehold.it/150/9f134c"
      },
      {
        "albumId": 9,
        "id": 402,
        "title": "labore corrupti molestiae repudiandae quasi voluptate omnis",
        "url": "http://placehold.it/600/36f7e5",
        "thumbnailUrl": "http://placehold.it/150/36f7e5"
      },
      {
        "albumId": 9,
        "id": 403,
        "title": "consequatur at voluptatibus",
        "url": "http://placehold.it/600/85acb6",
        "thumbnailUrl": "http://placehold.it/150/85acb6"
      },
      {
        "albumId": 9,
        "id": 404,
        "title": "voluptate reiciendis aliquid qui neque",
        "url": "http://placehold.it/600/eee79f",
        "thumbnailUrl": "http://placehold.it/150/eee79f"
      },
      {
        "albumId": 9,
        "id": 405,
        "title": "laudantium soluta quaerat rerum numquam in pariatur est voluptas",
        "url": "http://placehold.it/600/61f9b6",
        "thumbnailUrl": "http://placehold.it/150/61f9b6"
      },
      {
        "albumId": 9,
        "id": 406,
        "title": "voluptatem doloribus ratione nulla atque",
        "url": "http://placehold.it/600/303665",
        "thumbnailUrl": "http://placehold.it/150/303665"
      },
      {
        "albumId": 9,
        "id": 407,
        "title": "excepturi qui tenetur minus dolor doloremque perspiciatis exercitationem voluptas",
        "url": "http://placehold.it/600/ea34ec",
        "thumbnailUrl": "http://placehold.it/150/ea34ec"
      },
      {
        "albumId": 9,
        "id": 408,
        "title": "deleniti vel nulla dolorum sit consequatur qui ea",
        "url": "http://placehold.it/600/f9ab8f",
        "thumbnailUrl": "http://placehold.it/150/f9ab8f"
      },
      {
        "albumId": 9,
        "id": 409,
        "title": "debitis minus dolores totam repellendus sed",
        "url": "http://placehold.it/600/39727c",
        "thumbnailUrl": "http://placehold.it/150/39727c"
      },
      {
        "albumId": 9,
        "id": 410,
        "title": "omnis eos non et delectus quod aut",
        "url": "http://placehold.it/600/628d2d",
        "thumbnailUrl": "http://placehold.it/150/628d2d"
      },
      {
        "albumId": 9,
        "id": 411,
        "title": "officiis architecto facilis voluptatem rerum labore",
        "url": "http://placehold.it/600/509481",
        "thumbnailUrl": "http://placehold.it/150/509481"
      },
      {
        "albumId": 9,
        "id": 412,
        "title": "inventore sequi voluptatem incidunt",
        "url": "http://placehold.it/600/f2ed9b",
        "thumbnailUrl": "http://placehold.it/150/f2ed9b"
      },
      {
        "albumId": 9,
        "id": 413,
        "title": "natus non deleniti",
        "url": "http://placehold.it/600/fd3cae",
        "thumbnailUrl": "http://placehold.it/150/fd3cae"
      },
      {
        "albumId": 9,
        "id": 414,
        "title": "repudiandae enim quia est",
        "url": "http://placehold.it/600/79509e",
        "thumbnailUrl": "http://placehold.it/150/79509e"
      },
      {
        "albumId": 9,
        "id": 415,
        "title": "vel similique voluptas dolores",
        "url": "http://placehold.it/600/faadf9",
        "thumbnailUrl": "http://placehold.it/150/faadf9"
      },
      {
        "albumId": 9,
        "id": 416,
        "title": "necessitatibus reiciendis odit",
        "url": "http://placehold.it/600/4ca535",
        "thumbnailUrl": "http://placehold.it/150/4ca535"
      },
      {
        "albumId": 9,
        "id": 417,
        "title": "dolores quisquam nobis quia voluptas",
        "url": "http://placehold.it/600/282d15",
        "thumbnailUrl": "http://placehold.it/150/282d15"
      },
      {
        "albumId": 9,
        "id": 418,
        "title": "ut assumenda facilis corrupti repudiandae suscipit rerum qui",
        "url": "http://placehold.it/600/52961a",
        "thumbnailUrl": "http://placehold.it/150/52961a"
      },
      {
        "albumId": 9,
        "id": 419,
        "title": "dolorum ea saepe veritatis",
        "url": "http://placehold.it/600/e86117",
        "thumbnailUrl": "http://placehold.it/150/e86117"
      },
      {
        "albumId": 9,
        "id": 420,
        "title": "consequatur ipsum provident porro soluta non consequatur reiciendis sit",
        "url": "http://placehold.it/600/4e929c",
        "thumbnailUrl": "http://placehold.it/150/4e929c"
      },
      {
        "albumId": 9,
        "id": 421,
        "title": "dolorum nihil odit maxime voluptatem cupiditate veritatis eos",
        "url": "http://placehold.it/600/3223e1",
        "thumbnailUrl": "http://placehold.it/150/3223e1"
      },
      {
        "albumId": 9,
        "id": 422,
        "title": "quos quis sit nobis",
        "url": "http://placehold.it/600/9e5f8f",
        "thumbnailUrl": "http://placehold.it/150/9e5f8f"
      },
      {
        "albumId": 9,
        "id": 423,
        "title": "aspernatur sint mollitia doloribus nam perferendis",
        "url": "http://placehold.it/600/dde6c6",
        "thumbnailUrl": "http://placehold.it/150/dde6c6"
      },
      {
        "albumId": 9,
        "id": 424,
        "title": "culpa nisi vitae",
        "url": "http://placehold.it/600/5ddba4",
        "thumbnailUrl": "http://placehold.it/150/5ddba4"
      },
      {
        "albumId": 9,
        "id": 425,
        "title": "ducimus cupiditate quaerat soluta dolores placeat numquam",
        "url": "http://placehold.it/600/3af4b9",
        "thumbnailUrl": "http://placehold.it/150/3af4b9"
      },
      {
        "albumId": 9,
        "id": 426,
        "title": "numquam et esse molestiae occaecati deleniti enim",
        "url": "http://placehold.it/600/c9fb65",
        "thumbnailUrl": "http://placehold.it/150/c9fb65"
      },
      {
        "albumId": 9,
        "id": 427,
        "title": "porro nisi ullam consequatur omnis odit repellendus",
        "url": "http://placehold.it/600/dcbaa6",
        "thumbnailUrl": "http://placehold.it/150/dcbaa6"
      },
      {
        "albumId": 9,
        "id": 428,
        "title": "dolor magnam nam voluptatem ullam",
        "url": "http://placehold.it/600/d7490f",
        "thumbnailUrl": "http://placehold.it/150/d7490f"
      },
      {
        "albumId": 9,
        "id": 429,
        "title": "doloremque nihil perspiciatis omnis nobis quaerat",
        "url": "http://placehold.it/600/a4eda6",
        "thumbnailUrl": "http://placehold.it/150/a4eda6"
      },
      {
        "albumId": 9,
        "id": 430,
        "title": "dignissimos quod minus modi omnis",
        "url": "http://placehold.it/600/9f68e7",
        "thumbnailUrl": "http://placehold.it/150/9f68e7"
      },
      {
        "albumId": 9,
        "id": 431,
        "title": "aut debitis autem dolorem",
        "url": "http://placehold.it/600/4abc03",
        "thumbnailUrl": "http://placehold.it/150/4abc03"
      },
      {
        "albumId": 9,
        "id": 432,
        "title": "cupiditate est quisquam laborum odit",
        "url": "http://placehold.it/600/3b7e06",
        "thumbnailUrl": "http://placehold.it/150/3b7e06"
      },
      {
        "albumId": 9,
        "id": 433,
        "title": "sunt est natus incidunt similique",
        "url": "http://placehold.it/600/78a9f5",
        "thumbnailUrl": "http://placehold.it/150/78a9f5"
      },
      {
        "albumId": 9,
        "id": 434,
        "title": "est dolorem vel dolores doloribus",
        "url": "http://placehold.it/600/650514",
        "thumbnailUrl": "http://placehold.it/150/650514"
      },
      {
        "albumId": 9,
        "id": 435,
        "title": "quia nulla possimus",
        "url": "http://placehold.it/600/eb6a76",
        "thumbnailUrl": "http://placehold.it/150/eb6a76"
      },
      {
        "albumId": 9,
        "id": 436,
        "title": "ipsum qui consequatur temporibus quae sapiente ut",
        "url": "http://placehold.it/600/d8ade2",
        "thumbnailUrl": "http://placehold.it/150/d8ade2"
      },
      {
        "albumId": 9,
        "id": 437,
        "title": "tempore recusandae deserunt accusamus culpa",
        "url": "http://placehold.it/600/cee4ac",
        "thumbnailUrl": "http://placehold.it/150/cee4ac"
      },
      {
        "albumId": 9,
        "id": 438,
        "title": "minus eos molestias dicta modi id et",
        "url": "http://placehold.it/600/e23de4",
        "thumbnailUrl": "http://placehold.it/150/e23de4"
      },
      {
        "albumId": 9,
        "id": 439,
        "title": "est ipsam culpa vel repudiandae",
        "url": "http://placehold.it/600/ded2fe",
        "thumbnailUrl": "http://placehold.it/150/ded2fe"
      },
      {
        "albumId": 9,
        "id": 440,
        "title": "doloribus libero odit facere perferendis vitae reiciendis et",
        "url": "http://placehold.it/600/5cf983",
        "thumbnailUrl": "http://placehold.it/150/5cf983"
      },
      {
        "albumId": 9,
        "id": 441,
        "title": "odit saepe quaerat qui",
        "url": "http://placehold.it/600/5af6c1",
        "thumbnailUrl": "http://placehold.it/150/5af6c1"
      },
      {
        "albumId": 9,
        "id": 442,
        "title": "dicta atque voluptatem quos ut id corrupti amet sit",
        "url": "http://placehold.it/600/e20f78",
        "thumbnailUrl": "http://placehold.it/150/e20f78"
      },
      {
        "albumId": 9,
        "id": 443,
        "title": "numquam eum minus quos nulla",
        "url": "http://placehold.it/600/f35ed1",
        "thumbnailUrl": "http://placehold.it/150/f35ed1"
      },
      {
        "albumId": 9,
        "id": 444,
        "title": "et et cumque dolores nemo dicta quam ea",
        "url": "http://placehold.it/600/4f1475",
        "thumbnailUrl": "http://placehold.it/150/4f1475"
      },
      {
        "albumId": 9,
        "id": 445,
        "title": "quia esse nesciunt delectus",
        "url": "http://placehold.it/600/ab627",
        "thumbnailUrl": "http://placehold.it/150/ab627"
      },
      {
        "albumId": 9,
        "id": 446,
        "title": "possimus quia earum vero et nesciunt quas nihil",
        "url": "http://placehold.it/600/a9afa2",
        "thumbnailUrl": "http://placehold.it/150/a9afa2"
      },
      {
        "albumId": 9,
        "id": 447,
        "title": "et impedit voluptatum",
        "url": "http://placehold.it/600/c24531",
        "thumbnailUrl": "http://placehold.it/150/c24531"
      },
      {
        "albumId": 9,
        "id": 448,
        "title": "et voluptatem animi fuga aut",
        "url": "http://placehold.it/600/d23a91",
        "thumbnailUrl": "http://placehold.it/150/d23a91"
      },
      {
        "albumId": 9,
        "id": 449,
        "title": "dolorem amet architecto aliquam quia quo",
        "url": "http://placehold.it/600/f65b7a",
        "thumbnailUrl": "http://placehold.it/150/f65b7a"
      },
      {
        "albumId": 9,
        "id": 450,
        "title": "reprehenderit et est qui quo et ad sunt",
        "url": "http://placehold.it/600/7a530d",
        "thumbnailUrl": "http://placehold.it/150/7a530d"
      },
      {
        "albumId": 10,
        "id": 451,
        "title": "dolorem accusantium corrupti incidunt quas ex est",
        "url": "http://placehold.it/600/5e912a",
        "thumbnailUrl": "http://placehold.it/150/5e912a"
      },
      {
        "albumId": 10,
        "id": 452,
        "title": "mollitia dolorem qui",
        "url": "http://placehold.it/600/e30072",
        "thumbnailUrl": "http://placehold.it/150/e30072"
      },
      {
        "albumId": 10,
        "id": 453,
        "title": "ut alias dolore qui ea culpa recusandae doloribus magnam",
        "url": "http://placehold.it/600/188c92",
        "thumbnailUrl": "http://placehold.it/150/188c92"
      },
      {
        "albumId": 10,
        "id": 454,
        "title": "ratione similique aut rem qui",
        "url": "http://placehold.it/600/1856cd",
        "thumbnailUrl": "http://placehold.it/150/1856cd"
      },
      {
        "albumId": 10,
        "id": 455,
        "title": "quisquam non fugiat",
        "url": "http://placehold.it/600/468684",
        "thumbnailUrl": "http://placehold.it/150/468684"
      },
      {
        "albumId": 10,
        "id": 456,
        "title": "incidunt qui porro aut qui minus",
        "url": "http://placehold.it/600/abef8",
        "thumbnailUrl": "http://placehold.it/150/abef8"
      },
      {
        "albumId": 10,
        "id": 457,
        "title": "cupiditate in ut non quo accusantium dolores maiores consectetur",
        "url": "http://placehold.it/600/197ef5",
        "thumbnailUrl": "http://placehold.it/150/197ef5"
      },
      {
        "albumId": 10,
        "id": 458,
        "title": "dolore laudantium quo ut",
        "url": "http://placehold.it/600/7595ac",
        "thumbnailUrl": "http://placehold.it/150/7595ac"
      },
      {
        "albumId": 10,
        "id": 459,
        "title": "consequatur natus nihil sunt voluptate eos",
        "url": "http://placehold.it/600/b00daa",
        "thumbnailUrl": "http://placehold.it/150/b00daa"
      },
      {
        "albumId": 10,
        "id": 460,
        "title": "temporibus aut et et est dolor",
        "url": "http://placehold.it/600/5f335",
        "thumbnailUrl": "http://placehold.it/150/5f335"
      },
      {
        "albumId": 10,
        "id": 461,
        "title": "voluptatem autem est",
        "url": "http://placehold.it/600/692df",
        "thumbnailUrl": "http://placehold.it/150/692df"
      },
      {
        "albumId": 10,
        "id": 462,
        "title": "iste quisquam possimus omnis aut facere ut dolores",
        "url": "http://placehold.it/600/47d371",
        "thumbnailUrl": "http://placehold.it/150/47d371"
      },
      {
        "albumId": 10,
        "id": 463,
        "title": "sapiente in ad iure nam eius quia temporibus",
        "url": "http://placehold.it/600/ab5d51",
        "thumbnailUrl": "http://placehold.it/150/ab5d51"
      },
      {
        "albumId": 10,
        "id": 464,
        "title": "totam necessitatibus voluptas perferendis rerum",
        "url": "http://placehold.it/600/6b51e4",
        "thumbnailUrl": "http://placehold.it/150/6b51e4"
      },
      {
        "albumId": 10,
        "id": 465,
        "title": "minima aperiam rerum molestiae sint qui error",
        "url": "http://placehold.it/600/3176b1",
        "thumbnailUrl": "http://placehold.it/150/3176b1"
      },
      {
        "albumId": 10,
        "id": 466,
        "title": "ab necessitatibus est laudantium ipsam est sed",
        "url": "http://placehold.it/600/1673fc",
        "thumbnailUrl": "http://placehold.it/150/1673fc"
      },
      {
        "albumId": 10,
        "id": 467,
        "title": "repellendus et enim beatae eos enim error libero",
        "url": "http://placehold.it/600/271c1c",
        "thumbnailUrl": "http://placehold.it/150/271c1c"
      },
      {
        "albumId": 10,
        "id": 468,
        "title": "dolor impedit perspiciatis",
        "url": "http://placehold.it/600/a56675",
        "thumbnailUrl": "http://placehold.it/150/a56675"
      },
      {
        "albumId": 10,
        "id": 469,
        "title": "sit expedita ut nostrum eos commodi quod laudantium dolorem",
        "url": "http://placehold.it/600/d6dd28",
        "thumbnailUrl": "http://placehold.it/150/d6dd28"
      },
      {
        "albumId": 10,
        "id": 470,
        "title": "delectus deserunt quidem consequatur dolores aspernatur veritatis quod",
        "url": "http://placehold.it/600/720eba",
        "thumbnailUrl": "http://placehold.it/150/720eba"
      },
      {
        "albumId": 10,
        "id": 471,
        "title": "amet sunt eos delectus aut qui",
        "url": "http://placehold.it/600/f47f7a",
        "thumbnailUrl": "http://placehold.it/150/f47f7a"
      },
      {
        "albumId": 10,
        "id": 472,
        "title": "voluptatem dicta quaerat",
        "url": "http://placehold.it/600/51091",
        "thumbnailUrl": "http://placehold.it/150/51091"
      },
      {
        "albumId": 10,
        "id": 473,
        "title": "qui laborum est quia minima et",
        "url": "http://placehold.it/600/bc8627",
        "thumbnailUrl": "http://placehold.it/150/bc8627"
      },
      {
        "albumId": 10,
        "id": 474,
        "title": "est praesentium aperiam at laudantium accusantium ullam",
        "url": "http://placehold.it/600/49426a",
        "thumbnailUrl": "http://placehold.it/150/49426a"
      },
      {
        "albumId": 10,
        "id": 475,
        "title": "molestiae voluptatem nam rem",
        "url": "http://placehold.it/600/f2ecf0",
        "thumbnailUrl": "http://placehold.it/150/f2ecf0"
      },
      {
        "albumId": 10,
        "id": 476,
        "title": "est maxime vel dolores sapiente doloremque ea aut ipsam",
        "url": "http://placehold.it/600/baa6fe",
        "thumbnailUrl": "http://placehold.it/150/baa6fe"
      },
      {
        "albumId": 10,
        "id": 477,
        "title": "soluta aspernatur culpa libero quam in consequatur",
        "url": "http://placehold.it/600/9dcfe1",
        "thumbnailUrl": "http://placehold.it/150/9dcfe1"
      },
      {
        "albumId": 10,
        "id": 478,
        "title": "ut iusto qui",
        "url": "http://placehold.it/600/72f649",
        "thumbnailUrl": "http://placehold.it/150/72f649"
      },
      {
        "albumId": 10,
        "id": 479,
        "title": "a ut quos amet asperiores in eius doloribus",
        "url": "http://placehold.it/600/c7718d",
        "thumbnailUrl": "http://placehold.it/150/c7718d"
      },
      {
        "albumId": 10,
        "id": 480,
        "title": "aut dolores magni",
        "url": "http://placehold.it/600/400d12",
        "thumbnailUrl": "http://placehold.it/150/400d12"
      },
      {
        "albumId": 10,
        "id": 481,
        "title": "odit dolores dolor natus repellendus",
        "url": "http://placehold.it/600/15bfb5",
        "thumbnailUrl": "http://placehold.it/150/15bfb5"
      },
      {
        "albumId": 10,
        "id": 482,
        "title": "nisi tempora fuga est inventore quae blanditiis modi quaerat",
        "url": "http://placehold.it/600/23aca3",
        "thumbnailUrl": "http://placehold.it/150/23aca3"
      },
      {
        "albumId": 10,
        "id": 483,
        "title": "et esse magnam dolorem fuga quia",
        "url": "http://placehold.it/600/efde8d",
        "thumbnailUrl": "http://placehold.it/150/efde8d"
      },
      {
        "albumId": 10,
        "id": 484,
        "title": "omnis eum expedita",
        "url": "http://placehold.it/600/6886fa",
        "thumbnailUrl": "http://placehold.it/150/6886fa"
      },
      {
        "albumId": 10,
        "id": 485,
        "title": "et veniam rem tenetur laborum praesentium et",
        "url": "http://placehold.it/600/d136f",
        "thumbnailUrl": "http://placehold.it/150/d136f"
      },
      {
        "albumId": 10,
        "id": 486,
        "title": "rerum voluptatem quaerat ipsa",
        "url": "http://placehold.it/600/a027e9",
        "thumbnailUrl": "http://placehold.it/150/a027e9"
      },
      {
        "albumId": 10,
        "id": 487,
        "title": "cupiditate nostrum ipsam numquam consequuntur fugiat",
        "url": "http://placehold.it/600/71cfd9",
        "thumbnailUrl": "http://placehold.it/150/71cfd9"
      },
      {
        "albumId": 10,
        "id": 488,
        "title": "doloremque et corporis",
        "url": "http://placehold.it/600/712794",
        "thumbnailUrl": "http://placehold.it/150/712794"
      },
      {
        "albumId": 10,
        "id": 489,
        "title": "consequatur aliquam ipsa minima aut",
        "url": "http://placehold.it/600/6b018b",
        "thumbnailUrl": "http://placehold.it/150/6b018b"
      },
      {
        "albumId": 10,
        "id": 490,
        "title": "ut eos nihil dolor ea ipsa placeat aperiam",
        "url": "http://placehold.it/600/648344",
        "thumbnailUrl": "http://placehold.it/150/648344"
      },
      {
        "albumId": 10,
        "id": 491,
        "title": "dolor non sed",
        "url": "http://placehold.it/600/cbab94",
        "thumbnailUrl": "http://placehold.it/150/cbab94"
      },
      {
        "albumId": 10,
        "id": 492,
        "title": "quasi qui perspiciatis neque ipsum nihil facilis",
        "url": "http://placehold.it/600/9c054f",
        "thumbnailUrl": "http://placehold.it/150/9c054f"
      },
      {
        "albumId": 10,
        "id": 493,
        "title": "officiis ab qui laudantium",
        "url": "http://placehold.it/600/60f2b5",
        "thumbnailUrl": "http://placehold.it/150/60f2b5"
      },
      {
        "albumId": 10,
        "id": 494,
        "title": "facilis sunt consequatur",
        "url": "http://placehold.it/600/ba5b26",
        "thumbnailUrl": "http://placehold.it/150/ba5b26"
      },
      {
        "albumId": 10,
        "id": 495,
        "title": "beatae et quia illo",
        "url": "http://placehold.it/600/8b9187",
        "thumbnailUrl": "http://placehold.it/150/8b9187"
      },
      {
        "albumId": 10,
        "id": 496,
        "title": "non voluptate sunt modi est",
        "url": "http://placehold.it/600/64303b",
        "thumbnailUrl": "http://placehold.it/150/64303b"
      },
      {
        "albumId": 10,
        "id": 497,
        "title": "iusto reprehenderit quia ducimus beatae magnam ex dicta",
        "url": "http://placehold.it/600/6081c3",
        "thumbnailUrl": "http://placehold.it/150/6081c3"
      },
      {
        "albumId": 10,
        "id": 498,
        "title": "enim quis quisquam quae",
        "url": "http://placehold.it/600/2042e3",
        "thumbnailUrl": "http://placehold.it/150/2042e3"
      },
      {
        "albumId": 10,
        "id": 499,
        "title": "commodi dolores magni eligendi quidem cupiditate sunt eius quasi",
        "url": "http://placehold.it/600/553f10",
        "thumbnailUrl": "http://placehold.it/150/553f10"
      },
      {
        "albumId": 10,
        "id": 500,
        "title": "eum architecto saepe qui nobis ea aut",
        "url": "http://placehold.it/600/324309",
        "thumbnailUrl": "http://placehold.it/150/324309"
      }
    ]
};

app.get('/photos', (req, res) => {
  assertCors(req, res, ['GET']);
  const albumId = req.query.albumId;
  res.json(photo_data.photos.filter(p => p.albumId == albumId));
});

// Data for example: http://localhost:8000/examples/bind/ecommerce.amp.html
app.use('/bind/ecommerce/sizes', (req, res) => {
  assertCors(req, res, ['GET']);
  setTimeout(() => {
    const prices = {
      '0': {
        'sizes': {
          'XS': 8.99,
          'S': 9.99,
        },
      },
      '1': {
        'sizes': {
          'S': 10.99,
          'M': 12.99,
          'L': 14.99,
        },
      },
      '2': {
        'sizes': {
          'L': 11.99,
          'XL': 13.99,
        },
      },
      '3': {
        'sizes': {
          'M': 7.99,
          'L': 9.99,
          'XL': 11.99,
        },
      },
      '4': {
        'sizes': {
          'XS': 8.99,
          'S': 10.99,
          'L': 15.99,
        },
      },
      '5': {
        'sizes': {
          'S': 8.99,
          'L': 14.99,
          'XL': 11.99,
        },
      },
      '6': {
        'sizes': {
          'XS': 8.99,
          'S': 9.99,
          'M': 12.99,
        },
      },
      '7': {
        'sizes': {
          'M': 10.99,
          'L': 11.99,
        },
      },
    };
    const object = {};
    object[req.query.shirt] = prices[req.query.shirt];
    res.json(object);
  }, 1000); // Simulate network delay.
});

app.use('/list/fruit-data/get', (req, res) => {
  assertCors(req, res, ['GET']);
  res.json({
    items: [
      {name: 'apple', quantity: 47, unitPrice: '0.33'},
      {name: 'pear', quantity: 538, unitPrice: '0.54'},
      {name: 'tomato', quantity: 0, unitPrice: '0.23'},
    ],
  });
});

app.use('/list/vegetable-data/get', (req, res) => {
  assertCors(req, res, ['GET']);
  res.json({
    items: [
      {name: 'cabbage', quantity: 5, unitPrice: '1.05'},
      {name: 'carrot', quantity: 10, unitPrice: '0.01'},
      {name: 'brocoli', quantity: 7, unitPrice: '0.02'},
    ],
  });
});

// Simulated subscription entitlement
app.use('/subscription/:id/entitlements', (req, res) => {
  assertCors(req, res, ['GET']);
  res.json({
    source: 'local' + req.params.id,
    products: ['scenic-2017.appspot.com:news',
      'scenic-2017.appspot.com:product2'],
  });
});

// Simulated adzerk ad server and AMP cache CDN.
app.get('/adzerk/*', (req, res) => {
  assertCors(req, res, ['GET'], ['AMP-template-amp-creative']);
  const match = /\/(\d+)/.exec(req.path);
  if (!match || !match[1]) {
    res.status(404);
    res.end('Invalid path: ' + req.path);
    return;
  }
  const filePath =
      pc.cwd() + '/extensions/amp-ad-network-adzerk-impl/0.1/data/' + match[1];
  fs.readFileAsync(filePath).then(file => {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('AMP-template-amp-creative', 'amp-mustache');
    res.end(file);
  }).error(() => {
    res.status(404);
    res.end('Not found: ' + filePath);
  });
});

/*
 * Serve extension script url
 */
app.get('/dist/rtv/*/v0/*.js', (req, res, next) => {
  const mode = pc.env.SERVE_MODE;
  const fileName = path.basename(req.path);
  let filePath = 'https://cdn.ampproject.org/v0/' + fileName;
  if (mode == 'cdn') {
    // This will not be useful until extension-location.js change in prod
    // Require url from cdn
    request(filePath, (error, response) => {
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
    (req, res, next) => {
      // Special case for entry point script url. Use compiled for testing
      const mode = pc.env.SERVE_MODE;
      const fileName = path.basename(req.path);
      if (mode == 'cdn') {
        // This will not be useful until extension-location.js change in prod
        // Require url from cdn
        const filePath = 'https://cdn.ampproject.org/' + fileName;
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
        req.url = req.url.replace(/\.js$/, '.max.js');
      }
      next();
    });

app.get('/dist/iframe-transport-client-lib.js', (req, res, next) => {
  req.url = req.url.replace(/dist/, 'dist.3p/current');
  next();
});

/*
 * Start Cache SW LOCALDEV section
 */
app.get('/dist/sw(.max)?.js', (req, res, next) => {
  const filePath = req.path;
  fs.readFileAsync(pc.cwd() + filePath, 'utf8').then(file => {
    let n = new Date();
    // Round down to the nearest 5 minutes.
    n -= ((n.getMinutes() % 5) * 1000 * 60)
        + (n.getSeconds() * 1000) + n.getMilliseconds();
    file = 'self.AMP_CONFIG = {v: "99' + n + '",' +
        'cdnUrl: "http://localhost:8000/dist"};'
        + file;
    res.setHeader('Content-Type', 'application/javascript');
    res.setHeader('Date', new Date().toUTCString());
    res.setHeader('Cache-Control', 'no-cache;max-age=150');
    res.end(file);
  }).catch(next);
});

app.get('/dist/rtv/9[89]*/*.js', (req, res, next) => {
  res.setHeader('Content-Type', 'application/javascript');
  res.setHeader('Date', new Date().toUTCString());
  res.setHeader('Cache-Control', 'no-cache;max-age=31536000');

  setTimeout(() => {
    // Cause a delay, to show the "stale-while-revalidate"
    if (req.path.includes('v0.js')) {
      const path = req.path.replace(/rtv\/\d+/, '');
      return fs.readFileAsync(pc.cwd() + path, 'utf8')
          .then(file => {
            res.end(file);
          }).catch(next);
    }

    res.end(`
      const li = document.createElement('li');
      li.textContent = '${req.path}';
      loaded.appendChild(li);
    `);
  }, 2000);
});

app.get(['/dist/cache-sw.html'], (req, res, next) => {
  const filePath = '/test/manual/cache-sw.html';
  fs.readFileAsync(pc.cwd() + filePath, 'utf8').then(file => {
    let n = new Date();
    // Round down to the nearest 5 minutes.
    n -= ((n.getMinutes() % 5) * 1000 * 60)
        + (n.getSeconds() * 1000) + n.getMilliseconds();
    const percent = parseFloat(req.query.canary) || 0.01;
    let env = '99';
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

app.get('/dist/diversions', (req, res) => {
  let n = new Date();
  // Round down to the nearest 5 minutes.
  n -= ((n.getMinutes() % 5) * 1000 * 60)
      + (n.getSeconds() * 1000) + n.getMilliseconds();
  n += 5 * 1000 * 60;
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Date', new Date().toUTCString());
  res.setHeader('Cache-Control', 'no-cache;max-age=150');
  res.end(JSON.stringify(['98' + n]));
});

/*
 * End Cache SW LOCALDEV section
 */

/**
 * Web worker binary.
 */
app.get('/dist/ww(.max)?.js', (req, res) => {
  fs.readFileAsync(pc.cwd() + req.path).then(file => {
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
    file = file.replace(
        /https:\/\/cdn\.ampproject\.org\/v0\.js/g,
        hostName + '/dist/amp.js');
    file = file.replace(
        /https:\/\/cdn\.ampproject\.org\/shadow-v0\.js/g,
        hostName + '/dist/amp-shadow.js');
    file = file.replace(
        /https:\/\/cdn\.ampproject\.org\/amp4ads-v0\.js/g,
        hostName + '/dist/amp-inabox.js');
    file = file.replace(
        /https:\/\/cdn\.ampproject\.org\/v0\/(.+?).js/g,
        hostName + '/dist/v0/$1.max.js');
    if (inabox) {
      file = file.replace(/\/dist\/amp\.js/g, '/dist/amp-inabox.js');
    }
  } else if (mode == 'compiled') {
    file = file.replace(
        /https:\/\/cdn\.ampproject\.org\/v0\.js/g,
        hostName + '/dist/v0.js');
    file = file.replace(
        /https:\/\/cdn\.ampproject\.org\/shadow-v0\.js/g,
        hostName + '/dist/shadow-v0.js');
    file = file.replace(
        /https:\/\/cdn\.ampproject\.org\/amp4ads-v0\.js/g,
        hostName + '/dist/amp4ads-v0.js');
    file = file.replace(
        /https:\/\/cdn\.ampproject\.org\/v0\/(.+?).js/g,
        hostName + '/dist/v0/$1.js');
    file = file.replace(
        /\/dist.3p\/current\/(.*)\.max.html/g,
        hostName + '/dist.3p/current-min/$1.html');
    if (inabox) {
      file = file.replace(/\/dist\/v0\.js/g, '/dist/amp4ads-v0.js');
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
  let viewerScript;
  if (Number.isInteger(ampJsVersion)) { // eslint-disable-line amphtml-internal/no-es2015-number-props
    // Viewer integration script from gws, such as
    // https://cdn.ampproject.org/viewer/google/v7.js
    viewerScript =
        '<script async src="https://cdn.ampproject.org/viewer/google/v' +
        ampJsVersion + '.js"></script>';
  } else {
    // Viewer integration script from runtime, such as
    // https://cdn.ampproject.org/v0/amp-viewer-integration-0.1.js
    viewerScript = '<script async ' +
        'src="https://cdn.ampproject.org/v0/amp-viewer-integration-' +
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
  if (req.query.__amp_source_origin) {
    res.setHeader('AMP-Access-Control-Allow-Source-Origin',
        req.query.__amp_source_origin);
  }
}

function assertCors(req, res, opt_validMethods, opt_exposeHeaders,
  opt_ignoreMissingSourceOrigin) {
  // Allow disable CORS check (iframe fixtures have origin 'about:srcdoc').
  if (req.query.cors == '0') {
    return;
  }

  const validMethods = opt_validMethods || ['GET', 'POST', 'OPTIONS'];
  const invalidMethod = req.method + ' method is not allowed. Use POST.';
  const invalidOrigin = 'Origin header is invalid.';
  const invalidSourceOrigin = '__amp_source_origin parameter is invalid.';
  const unauthorized = 'Unauthorized Request';
  let origin;

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

    if (!opt_ignoreMissingSourceOrigin &&
        !SOURCE_ORIGIN_REGEX.test(req.query.__amp_source_origin)) {
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
  const mode = pc.env.SERVE_MODE;
  filePath = filePath.substr(0, filePath.length - 9) + '.html';

  return '<h2>Please note that .min/.max is no longer supported</h2>' +
      '<h3>Current serving mode is ' + mode + '</h3>' +
      '<h3>Please go to <a href= ' + filePath +
      '>Unversioned Link</a> to view the page<h3>' +
      '<h3></h3>' +
      '<h3><a href = /serve_mode=default>' +
      'Change to DEFAULT mode (unminified JS)</a></h3>' +
      '<h3><a href = /serve_mode=compiled>' +
      'Change to COMPILED mode (minified JS)</a></h3>' +
      '<h3><a href = /serve_mode=cdn>Change to CDN mode (prod JS)</a></h3>';
}

module.exports = app;
