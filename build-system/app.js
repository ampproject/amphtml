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
const cors = require('./amp-cors');
const devDashboard = require('./app-index/index');
const formidable = require('formidable');
const fs = BBPromise.promisifyAll(require('fs'));
const jsdom = require('jsdom');
const multer = require('multer');
const path = require('path');
const request = require('request');
const {appTestEndpoints} = require('./app-test');
const pc = process;
const runVideoTestBench = require('./app-video-testbench');
const {
  recaptchaFrameRequestHandler,
  recaptchaRouter,
} = require('./recaptcha-router');
const {renderShadowViewer} = require('./shadow-viewer');
const {replaceUrls} = require('./app-utils');

const upload = multer();

const TEST_SERVER_PORT = process.env.SERVE_PORT;

app.use(bodyParser.text());
app.use('/amp4test', require('./amp4test').app);
app.use('/analytics', require('./routes/analytics'));
app.use('/list/', require('./routes/list'));

// Append ?csp=1 to the URL to turn on the CSP header.
// TODO: shall we turn on CSP all the time?
app.use((req, res, next) => {
  if (req.query.csp) {
    res.set({
      'content-security-policy':
        "default-src * blob: data:; script-src https://cdn.ampproject.org/rtv/ https://cdn.ampproject.org/v0.js https://cdn.ampproject.org/v0/ https://cdn.ampproject.org/viewer/ http://localhost:8000 https://localhost:8000; object-src 'none'; style-src 'unsafe-inline' https://cdn.ampproject.org/rtv/ https://cdn.materialdesignicons.com https://cloud.typography.com https://fast.fonts.net https://fonts.googleapis.com https://maxcdn.bootstrapcdn.com https://p.typekit.net https://use.fontawesome.com https://use.typekit.net; report-uri https://csp-collector.appspot.com/csp/amp",
    });
  }
  next();
});

function isValidServeMode(serveMode) {
  return ['default', 'compiled', 'cdn'].includes(serveMode);
}

function setServeMode(serveMode) {
  pc.env.SERVE_MODE = serveMode;
}

app.get('/serve_mode=:mode', (req, res) => {
  const newMode = req.params.mode;
  if (isValidServeMode(newMode)) {
    setServeMode(newMode);
    res.send(`<h2>Serve mode changed to ${newMode}</h2>`);
  } else {
    const info = '<h2>Serve mode ' + newMode + ' is not supported. </h2>';
    res.status(400).send(info);
  }
});

if (!global.AMP_TESTING) {
  // Dev dashboard routes break test scaffolding since they're global.
  devDashboard.installExpressMiddleware(app);
}

// Changes the current serve mode via query param
// e.g. /serve_mode_change?mode=(default|compiled|cdn)
// (See ./app-index/settings.js)
app.get('/serve_mode_change', (req, res) => {
  const sourceOrigin = req.query['__amp_source_origin'];
  if (sourceOrigin) {
    res.setHeader('AMP-Access-Control-Allow-Source-Origin', sourceOrigin);
  }
  const {mode} = req.query;
  if (isValidServeMode(mode)) {
    setServeMode(mode);
    res.json({ok: true});
    return;
  }
  res.status(400).json({ok: false});
});

// Redirects to a proxied document with optional mode through query params.
//
// Mode can be one of:
//   - '/', empty string, or unset for an unwrapped doc
//   - '/a4a/' for an AMP4ADS wrapper
//   - '/a4a-3p/' for a 3P AMP4ADS wrapper
//   - '/inabox/' for an AMP inabox wrapper
//   - '/shadow/' for a shadow-wrapped document
//
// Examples:
//   - /proxy/?url=hello.com 👉 /proxy/s/hello.com
//   - /proxy/?url=hello.com?mode=/shadow/ 👉 /shadow/proxy/s/hello.com
//   - /proxy/?url=https://hello.com 👉 /proxy/s/hello.com
//   - /proxy/?url=https://www.google.com/amp/s/hello.com 👉 /proxy/s/hello.com
//   - /proxy/?url=hello.com/canonical 👉 /proxy/s/hello.com/amp
//
// This passthrough is useful to generate the URL from <form> values,
// (See ./app-index/proxy-form.js)
app.get('/proxy', async (req, res, next) => {
  const {mode, url} = req.query;
  const urlSuffixClearPrefixReStr =
    '^https?://((www.)?google.(com?|[a-z]{2}|com?.[a-z]{2}|cat)/amp/s/)?';
  const urlSuffix = url.replace(new RegExp(urlSuffixClearPrefixReStr, 'i'), '');

  try {
    const ampdocUrl = await requestAmphtmlDocUrl(urlSuffix);
    const ampdocUrlSuffix = ampdocUrl.replace(/^https?:\/\//, '');
    const modePrefix = (mode || '').replace(/\/$/, '');
    const proxyUrl = `${modePrefix}/proxy/s/${ampdocUrlSuffix}`;
    res.redirect(proxyUrl);
  } catch ({message}) {
    console.log(`ERROR: ${message}`);
    next();
  }
});

/**
 * Resolves an AMPHTML URL from a canonical URL. If AMPHTML is canonical, same
 * URL is returned.
 * @param {string} urlSuffix URL without protocol or google.com/amp/s/...
 * @param {string=} protocol 'https' or 'http'. 'https' retries using 'http'.
 * @return {!Promise<string>}
 */
function requestAmphtmlDocUrl(urlSuffix, protocol = 'https') {
  const defaultUrl = `${protocol}://${urlSuffix}`;
  console.log(`Fetching URL: ${defaultUrl}`);
  return new Promise((resolve, reject) => {
    request(defaultUrl, (error, response, body) => {
      if (
        error ||
        (response && (response.statusCode < 200 || response.statusCode >= 300))
      ) {
        if (protocol == 'https') {
          return requestAmphtmlDocUrl(urlSuffix, 'http');
        }
        return reject(new Error(error || `Status: ${response.statusCode}`));
      }
      const {window} = new jsdom.JSDOM(body);
      const linkRelAmphtml = window.document.querySelector('link[rel=amphtml]');
      if (!linkRelAmphtml) {
        return resolve(defaultUrl);
      }
      const amphtmlUrl = linkRelAmphtml.getAttribute('href');
      if (!amphtmlUrl) {
        return resolve(defaultUrl);
      }
      return resolve(amphtmlUrl);
    });
  });
}

/*
 * Intercept Recaptcha frame for,
 * integration tests. Using this to mock
 * out the recaptcha api.
 */
app.get('/dist.3p/*/recaptcha.*html', recaptchaFrameRequestHandler);
app.use('/recaptcha', recaptchaRouter);

// Deprecate usage of .min.html/.max.html
app.get(
  [
    '/examples/*.(min|max).html',
    '/test/manual/*.(min|max).html',
    '/test/fixtures/e2e/*/*.(min|max).html',
    '/dist/cache-sw.(min|max).html',
  ],
  (req, res) => {
    const filePath = req.url;
    res.send(generateInfo(filePath));
  }
);

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

app.use('/api/echo/query', (req, res) => {
  const sourceOrigin = req.query['__amp_source_origin'];
  if (sourceOrigin) {
    res.setHeader('AMP-Access-Control-Allow-Source-Origin', sourceOrigin);
  }
  res.json(JSON.parse(req.query.data));
});

app.use('/api/echo/post', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.end(req.body);
});

app.use('/form/html/post', (req, res) => {
  cors.assertCors(req, res, ['POST']);

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
  cors.assertCors(req, res, ['POST'], ['AMP-Redirect-To']);
  res.setHeader('AMP-Redirect-To', 'https://google.com');
  res.end('{}');
});

app.use('/form/echo-json/post', (req, res) => {
  cors.assertCors(req, res, ['POST']);
  const form = new formidable.IncomingForm();
  const fields = Object.create(null);
  form.on('field', function(name, value) {
    if (name in fields) {
      const realName = name; // .slice(0, name.length - 2);
      if (realName in fields) {
        if (!Array.isArray(fields[realName])) {
          fields[realName] = [fields[realName]];
        }
      } else {
        fields[realName] = [];
      }
      fields[realName].push(value);
    } else {
      fields[name] = value;
    }
  });
  form.parse(req, unusedErr => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    if (fields['email'] == 'already@subscribed.com') {
      res.statusCode = 500;
    }
    res.end(JSON.stringify(fields));
  });
});

app.use('/form/json/poll1', (req, res) => {
  cors.assertCors(req, res, ['POST']);
  const form = new formidable.IncomingForm();
  form.parse(req, () => {
    res.setHeader('Content-Type', 'application/json');
    res.end(
      JSON.stringify({
        result: [
          {
            answer: 'Penguins',
            percentage: new Array(77),
          },
          {
            answer: 'Ostriches',
            percentage: new Array(8),
          },
          {
            answer: 'Kiwis',
            percentage: new Array(14),
          },
          {
            answer: 'Wekas',
            percentage: new Array(1),
          },
        ],
      })
    );
  });
});

app.post('/form/json/upload', upload.fields([{name: 'myFile'}]), (req, res) => {
  cors.assertCors(req, res, ['POST']);

  /** @type {!Array<!File>|undefined} */
  const myFile = req.files['myFile'];

  if (!myFile) {
    res.json({message: 'No file data received'});
    return;
  }
  const fileData = myFile[0];
  const contents = fileData.buffer.toString();

  res.json({message: contents});
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
  cors.assertCors(req, res, ['GET']);
  res.json({
    term: req.query.term,
    additionalFields: req.query.additionalFields,
    results: [{title: 'Result 1'}, {title: 'Result 2'}, {title: 'Result 3'}],
  });
});

const autocompleteColors = [
  'red',
  'orange',
  'yellow',
  'green',
  'blue',
  'purple',
  'pink',
  'black',
  'white',
];

app.use('/form/autocomplete/query', (req, res) => {
  const query = req.query.q;
  if (!query) {
    res.json({items: autocompleteColors});
  } else {
    const lowerCaseQuery = query.toLowerCase();
    const filtered = autocompleteColors.filter(l =>
      l.toLowerCase().includes(lowerCaseQuery)
    );
    res.json({items: filtered});
  }
});

const autosuggestLanguages = [
  'ActionScript',
  'AppleScript',
  'Asp',
  'BASIC',
  'C',
  'C++',
  'Clojure',
  'COBOL',
  'ColdFusion',
  'Erlang',
  'Fortran',
  'Go',
  'Groovy',
  'Haskell',
  'Java',
  'JavaScript',
  'Lisp',
  'Perl',
  'PHP',
  'Python',
  'Ruby',
  'Scala',
  'Scheme',
];

app.use('/form/autosuggest/query', (req, res) => {
  cors.assertCors(req, res, ['GET']);
  const MAX_RESULTS = 4;
  const query = req.query.q;
  if (!query) {
    res.json({
      items: [
        {
          results: autosuggestLanguages.slice(0, MAX_RESULTS),
        },
      ],
    });
  } else {
    const lowerCaseQuery = query.toLowerCase();
    const filtered = autosuggestLanguages.filter(l =>
      l.toLowerCase().includes(lowerCaseQuery)
    );
    res.json({
      items: [
        {
          results: filtered.slice(0, MAX_RESULTS),
        },
      ],
    });
  }
});

app.use('/form/autosuggest/search', (req, res) => {
  cors.assertCors(req, res, ['POST']);
  const form = new formidable.IncomingForm();
  form.parse(req, function(err, fields) {
    res.json({
      query: fields.query,
      results: [{title: 'Result 1'}, {title: 'Result 2'}, {title: 'Result 3'}],
    });
  });
});

app.use('/form/verify-search-json/post', (req, res) => {
  cors.assertCors(req, res, ['POST']);
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
        message: "City doesn't match zip (Mountain View and 94043)",
      });
    }

    if (errors.length === 0) {
      res.end(
        JSON.stringify({
          results: [
            {title: 'Result 1'},
            {title: 'Result 2'},
            {title: 'Result 3'},
          ],
          committed: true,
        })
      );
    } else {
      res.statusCode = 400;
      res.end(JSON.stringify({verifyErrors: errors}));
    }
  });
});

app.use('/share-tracking/get-outgoing-fragment', (req, res) => {
  res.setHeader(
    'AMP-Access-Control-Allow-Source-Origin',
    req.protocol + '://' + req.headers.host
  );
  res.json({
    fragment: '54321',
  });
});

// Fetches an AMP document from the AMP proxy and replaces JS
// URLs, so that they point to localhost.
function proxyToAmpProxy(req, res, mode) {
  const url =
    'https://cdn.ampproject.org/' +
    (req.query['amp_js_v'] ? 'v' : 'c') +
    req.url;
  console.log('Fetching URL: ' + url);
  request(url, function(error, response, body) {
    body = body
      // Unversion URLs.
      .replace(
        /https\:\/\/cdn\.ampproject\.org\/rtv\/\d+\//g,
        'https://cdn.ampproject.org/'
      )
      // <base> href pointing to the proxy, so that images, etc. still work.
      .replace('<head>', '<head><base href="https://cdn.ampproject.org/">');
    const inabox = req.query['inabox'];
    // TODO(ccordry): Remove this when story v01 is depricated.
    const storyV1 = req.query['story_v'] === '1';
    const urlPrefix = getUrlPrefix(req);
    body = replaceUrls(mode, body, urlPrefix, inabox, storyV1);
    if (inabox) {
      // Allow CORS requests for A4A.
      const origin = req.headers.origin || urlPrefix;
      cors.enableCors(req, res, origin);
    }
    res.status(response.statusCode).send(body);
  });
}

let itemCtr = 2;
const doctype = '<!doctype html>\n';
const liveListDocs = Object.create(null);
app.use('/examples/live-list-update(-reverse)?.amp.html', (req, res, next) => {
  const mode = pc.env.SERVE_MODE;
  let liveListDoc = liveListDocs[req.baseUrl];
  if (mode != 'compiled' && mode != 'default') {
    // Only handle compile(prev min)/default (prev max) mode
    next();
    return;
  }
  // When we already have state in memory and user refreshes page, we flush
  // the dom we maintain on the server.
  if (!('amp_latest_update_time' in req.query) && liveListDoc) {
    let outerHTML = liveListDoc.documentElement./*OK*/ outerHTML;
    outerHTML = replaceUrls(mode, outerHTML);
    res.send(`${doctype}${outerHTML}`);
    return;
  }
  if (!liveListDoc) {
    const liveListUpdateFullPath = `${pc.cwd()}${req.baseUrl}`;
    console.log('liveListUpdateFullPath', liveListUpdateFullPath);
    const liveListFile = fs.readFileSync(liveListUpdateFullPath);
    liveListDoc = liveListDocs[req.baseUrl] = new jsdom.JSDOM(
      liveListFile
    ).window.document;
    liveListDoc.ctr = 0;
  }
  const liveList = liveListDoc.querySelector('#my-live-list');
  const perPage = Number(liveList.getAttribute('data-max-items-per-page'));
  const items = liveList.querySelector('[items]');
  const pagination = liveListDoc.querySelector('#my-live-list [pagination]');
  const item1 = liveList.querySelector('#list-item-1');
  if (liveListDoc.ctr != 0) {
    if (Math.random() < 0.8) {
      // Always run a replace on the first item
      liveListReplace(item1);

      if (Math.random() < 0.5) {
        liveListTombstone(liveList);
      }

      if (Math.random() < 0.8) {
        liveListInsert(liveList, item1);
      }
      pagination.textContent = '';
      const liveChildren = [].slice
        .call(items.children)
        .filter(x => !x.hasAttribute('data-tombstone'));

      const pageCount = Math.ceil(liveChildren.length / perPage);
      const pageListItems = Array.apply(null, Array(pageCount))
        .map((_, i) => `<li>${i + 1}</li>`)
        .join('');
      const newPagination =
        '<nav aria-label="amp live list pagination">' +
        `<ul class="pagination">${pageListItems}</ul>` +
        '</nav>';
      pagination./*OK*/ innerHTML = newPagination;
    } else {
      // Sometimes we want an empty response to simulate no changes.
      res.send(`${doctype}<html></html>`);
      return;
    }
  }
  let outerHTML = liveListDoc.documentElement./*OK*/ outerHTML;
  outerHTML = replaceUrls(mode, outerHTML);
  liveListDoc.ctr++;
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
    const item = liveList./*OK*/ querySelector(`#list-item-${tombstoneId}`);
    if (item) {
      item.setAttribute('data-tombstone', '');
    }
  }
}

// Generate a random number between min and max
// Value is inclusive of both min and max values.
function range(min, max) {
  const values = Array.apply(null, new Array(max - min + 1)).map(
    (_, i) => min + i
  );
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
  const body = Array.apply(null, new Array(numOfParagraphs))
    .map(() => {
      return `<p>${bacon(range(50, 90))}</p>`;
    })
    .join('\n');

  const img = `<amp-img
        src="${
          flip()
            ? 'https://placekitten.com/300/350'
            : 'https://baconmockup.com/300/350'
        }"
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
  const body = Array.apply(null, new Array(numOfParagraphs))
    .map(() => {
      return `<p>${bacon(range(50, 90))}</p>`;
    })
    .join('\n');

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

app.use(
  '/examples/live-blog(-non-floating-button)?.amp.html',
  (req, res, next) => {
    if ('amp_latest_update_time' in req.query) {
      res.setHeader('Content-Type', 'text/html');
      res.end(getLiveBlogItem());
      return;
    }
    next();
  }
);

app.use('/examples/bind/live-list.amp.html', (req, res, next) => {
  if ('amp_latest_update_time' in req.query) {
    res.setHeader('Content-Type', 'text/html');
    res.end(getLiveBlogItemWithBindAttributes());
    return;
  }
  next();
});

app.use('/impression-proxy/', (req, res) => {
  cors.assertCors(req, res, ['GET']);
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

let forcePromptOnNext = false;
app.post('/get-consent-v1/', (req, res) => {
  cors.assertCors(req, res, ['POST']);
  const body = {
    'promptIfUnknown': true,
    'forcePromptOnNext': forcePromptOnNext,
    'sharedData': {
      'tfua': true,
      'coppa': true,
    },
  };
  res.json(body);
});

app.get('/get-consent-v1-set/', (req, res) => {
  cors.assertCors(req, res, ['GET']);
  const value = req.query['forcePromptOnNext'];
  if (value == 'false' || value == '0') {
    forcePromptOnNext = false;
  } else {
    forcePromptOnNext = true;
  }
  res.json({});
  res.end();
});

app.post('/get-consent-no-prompt/', (req, res) => {
  cors.assertCors(req, res, ['POST']);
  const body = {};
  res.json(body);
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
  cors.assertCors(req, res, ['GET'], undefined, true);
  const match = /^\/a4a_template\/([a-z-]+)\/(\d+)$/.exec(req.path);
  if (!match) {
    res.status(404);
    res.end('Invalid path: ' + req.path);
    return;
  }
  const filePath =
    `${pc.cwd()}/extensions/amp-ad-network-${match[1]}-impl/` +
    `0.1/data/${match[2]}.template`;
  fs.readFileAsync(filePath)
    .then(file => {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('AMP-template-amp-creative', 'amp-mustache');
      res.end(file);
    })
    .error(() => {
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
  const {message} = req.query;
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
      </html>`
  );
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
  if (!adUrl.startsWith('/proxy') && urlPrefix.indexOf('//localhost') != -1) {
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
app.use('/inabox/:version/', (req, res) => {
  let adUrl = req.url;
  const templatePath = '/build-system/server-inabox-template.html';
  const urlPrefix = getUrlPrefix(req);
  if (
    !adUrl.startsWith('/proxy') && // Ignore /proxy
    urlPrefix.indexOf('//localhost') != -1
  ) {
    // This is a special case for testing. `localhost` URLs are transformed to
    // `ads.localhost` to ensure that the iframe is fully x-origin.
    adUrl = urlPrefix.replace('localhost', 'ads.localhost') + adUrl;
  }
  adUrl = addQueryParam(adUrl, 'inabox', req.params['version']);
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

app.use(
  ['/examples/*', '/extensions/*', '/test/manual/*'],
  (req, res, next) => {
    const sourceOrigin = req.query['__amp_source_origin'];
    if (sourceOrigin) {
      res.setHeader('AMP-Access-Control-Allow-Source-Origin', sourceOrigin);
    }
    next();
  }
);

/**
 * Append ?sleep=5 to any included JS file in examples to emulate delay in
 * loading that file. This allows you to test issues with your extension being
 * late to load and testing user interaction with your element before your code
 * loads.
 *
 * Example delay loading amp-form script by 5 seconds:
 * <script async custom-element="amp-form"
 *    src="https://cdn.ampproject.org/v0/amp-form-0.1.js?sleep=5"></script>
 */
app.use(['/dist/v0/amp-*.js'], (req, res, next) => {
  const sleep = parseInt(req.query.sleep || 0, 10) * 1000;
  setTimeout(next, sleep);
});

/**
 * Video testbench endpoint
 */
app.get('/test/manual/amp-video.amp.html', runVideoTestBench);

app.get(
  ['/examples/*.html', '/test/manual/*.html', '/test/fixtures/e2e/*/*.html'],
  (req, res, next) => {
    const filePath = req.path;
    const mode = pc.env.SERVE_MODE;
    const inabox = req.query['inabox'];
    const stream = Number(req.query['stream']);
    fs.readFileAsync(pc.cwd() + filePath, 'utf8')
      .then(file => {
        if (req.query['amp_js_v']) {
          file = addViewerIntegrationScript(req.query['amp_js_v'], file);
        }
        file = file.replace(/__TEST_SERVER_PORT__/g, TEST_SERVER_PORT);
        file = file.replace(/__VIALIZ_MAP_KEY__/g,
            fs.readFileSync(`${pc.cwd()}/credentials/vializ_map_key`));

        if (inabox && req.headers.origin && req.query.__amp_source_origin) {
          // Allow CORS requests for A4A.
          cors.enableCors(req, res, req.headers.origin);
        } else {
          file = replaceUrls(mode, file, '', inabox);
        }

        // Extract amp-ad for the given 'type' specified in URL query.
        if (req.path.indexOf('/examples/ads.amp.html') == 0 && req.query.type) {
          const ads = file.match(
            elementExtractor('(amp-ad|amp-embed)', req.query.type)
          );
          file = file.replace(
            /<body>[\s\S]+<\/body>/m,
            '<body>' + ads.join('') + '</body>'
          );
        }

        // Extract amp-analytics for the given 'type' specified in URL query.
        if (
          req.path.indexOf('/examples/analytics-vendors.amp.html') == 0 &&
          req.query.type
        ) {
          const analytics = file.match(
            elementExtractor('amp-analytics', req.query.type)
          );
          file = file.replace(
            /<div id="container">[\s\S]+<\/div>/m,
            '<div id="container">' + analytics.join('') + '</div>'
          );
        }

        // Extract amp-consent for the given 'type' specified in URL query.
        if (
          req.path.indexOf('/examples/cmp-vendors.amp.html') == 0 &&
          req.query.type
        ) {
          const consent = file.match(
            elementExtractor('amp-consent', req.query.type)
          );
          file = file.replace(
            /<div id="container">[\s\S]+<\/div>/m,
            '<div id="container">' + consent.join('') + '</div>'
          );
        }

        if (stream > 0) {
          res.writeHead(200, {'Content-Type': 'text/html'});
          let pos = 0;
          const writeChunk = function() {
            const chunk = file.substring(
              pos,
              Math.min(pos + stream, file.length)
            );
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
      })
      .catch(() => {
        next();
      });
  }
);

appTestEndpoints(app);

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function elementExtractor(tagName, type) {
  type = escapeRegExp(type);
  return new RegExp(
    `<${tagName}[\\s][^>]*['"]${type}['"][^>]*>([\\s\\S]+?)</${tagName}>`,
    'gm'
  );
}

// Data for example: http://localhost:8000/examples/bind/xhr.amp.html
app.use('/bind/form/get', (req, res) => {
  cors.assertCors(req, res, ['GET']);
  res.json({
    bindXhrResult: 'I was fetched from the server!',
  });
});

// Data for example: http://localhost:8000/examples/bind/ecommerce.amp.html
app.use('/bind/ecommerce/sizes', (req, res) => {
  cors.assertCors(req, res, ['GET']);
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

/*
//TODO(chenshay): Accept '?crypto=bla'
implement authorizer here.
this is for local testing.
*/

// Simulated subscription entitlement
app.use('/subscription/:id/entitlements', (req, res) => {
  cors.assertCors(req, res, ['GET']);
  res.json({
    source: 'local' + req.params.id,
    granted: true,
    grantedReason: 'NOT_SUBSCRIBED',
    data: {
      login: true,
    },
  });
});

app.use('/subscription/pingback', (req, res) => {
  cors.assertCors(req, res, ['POST']);
  res.json({
    done: true,
  });
});

// Simulated adzerk ad server and AMP cache CDN.
app.get('/adzerk/*', (req, res) => {
  cors.assertCors(req, res, ['GET'], ['AMP-template-amp-creative']);
  const match = /\/(\d+)/.exec(req.path);
  if (!match || !match[1]) {
    res.status(404);
    res.end('Invalid path: ' + req.path);
    return;
  }
  const filePath =
    pc.cwd() + '/extensions/amp-ad-network-adzerk-impl/0.1/data/' + match[1];
  fs.readFileAsync(filePath)
    .then(file => {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('AMP-Ad-Template-Extension', 'amp-mustache');
      res.setHeader('AMP-Ad-Response-Type', 'template');
      res.end(file);
    })
    .error(() => {
      res.status(404);
      res.end('Not found: ' + filePath);
    });
});

/*
 * Serve extension scripts and their source maps.
 */
app.get(
  ['/dist/rtv/*/v0/*.js', '/dist/rtv/*/v0/*.js.map'],
  (req, res, next) => {
    const mode = pc.env.SERVE_MODE;
    const fileName = path.basename(req.path).replace('.max.', '.');
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
    const isJsMap = filePath.endsWith('.map');
    if (isJsMap) {
      filePath = filePath.replace(/\.js\.map$/, '.js');
    }
    filePath = replaceUrls(mode, filePath);
    req.url = filePath + (isJsMap ? '.map' : '');
    next();
  }
);

/**
 * Serve entry point script url
 */
app.get(
  ['/dist/sw.js', '/dist/sw-kill.js', '/dist/ww.js'],
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
  }
);

app.get('/dist/iframe-transport-client-lib.js', (req, res, next) => {
  req.url = req.url.replace(/dist/, 'dist.3p/current');
  next();
});

app.get('/dist/amp-inabox-host.js', (req, res, next) => {
  const mode = pc.env.SERVE_MODE;
  if (mode == 'compiled') {
    req.url = req.url.replace('amp-inabox-host', 'amp4ads-host-v0');
  }
  next();
});

/*
 * Start Cache SW LOCALDEV section
 */
app.get('/dist/sw(.max)?.js', (req, res, next) => {
  const filePath = req.path;
  fs.readFileAsync(pc.cwd() + filePath, 'utf8')
    .then(file => {
      let n = new Date();
      // Round down to the nearest 5 minutes.
      n -=
        (n.getMinutes() % 5) * 1000 * 60 +
        n.getSeconds() * 1000 +
        n.getMilliseconds();
      file =
        'self.AMP_CONFIG = {v: "99' +
        n +
        '",' +
        'cdnUrl: "http://localhost:8000/dist"};' +
        file;
      res.setHeader('Content-Type', 'application/javascript');
      res.setHeader('Date', new Date().toUTCString());
      res.setHeader('Cache-Control', 'no-cache;max-age=150');
      res.end(file);
    })
    .catch(next);
});

app.get('/dist/rtv/9[89]*/*.js', (req, res, next) => {
  res.setHeader('Content-Type', 'application/javascript');
  res.setHeader('Date', new Date().toUTCString());
  res.setHeader('Cache-Control', 'no-cache;max-age=31536000');

  setTimeout(() => {
    // Cause a delay, to show the "stale-while-revalidate"
    if (req.path.includes('v0.js')) {
      const path = req.path.replace(/rtv\/\d+/, '');
      return fs
        .readFileAsync(pc.cwd() + path, 'utf8')
        .then(file => {
          res.end(file);
        })
        .catch(next);
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
  fs.readFileAsync(pc.cwd() + filePath, 'utf8')
    .then(file => {
      let n = new Date();
      // Round down to the nearest 5 minutes.
      n -=
        (n.getMinutes() % 5) * 1000 * 60 +
        n.getSeconds() * 1000 +
        n.getMilliseconds();
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
    })
    .catch(next);
});

app.get('/dist/diversions', (req, res) => {
  let n = new Date();
  // Round down to the nearest 5 minutes.
  n -=
    (n.getMinutes() % 5) * 1000 * 60 +
    n.getSeconds() * 1000 +
    n.getMilliseconds();
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
 * Shadow viewer. Fetches shadow runtime from cdn by default.
 * Setting the param useLocal=1 will load the runtime from the local build.
 */
app.use('/shadow/', (req, res) => {
  const {url} = req;
  const isProxyUrl = /^\/proxy\//.test(url);

  const baseHref = isProxyUrl
    ? 'https://cdn.ampproject.org/'
    : `${path.dirname(url)}/`;

  const viewerHtml = renderShadowViewer({
    src: req.url.replace(/^\//, ''),
    baseHref,
  });

  if (!req.query.useLocal) {
    res.end(viewerHtml);
    return;
  }
  res.end(replaceUrls(pc.env.SERVE_MODE, viewerHtml));
});

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
  // eslint-disable-next-line amphtml-internal/no-es2015-number-props
  if (Number.isInteger(ampJsVersion)) {
    // Viewer integration script from gws, such as
    // https://cdn.ampproject.org/viewer/google/v7.js
    viewerScript =
      '<script async src="https://cdn.ampproject.org/viewer/google/v' +
      ampJsVersion +
      '.js"></script>';
  } else {
    // Viewer integration script from runtime, such as
    // https://cdn.ampproject.org/v0/amp-viewer-integration-0.1.js
    viewerScript =
      '<script async ' +
      'src="https://cdn.ampproject.org/v0/amp-viewer-integration-' +
      ampJsVersion +
      '.js" data-amp-report-test="viewer-integr.js"></script>';
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

function generateInfo(filePath) {
  const mode = pc.env.SERVE_MODE;
  filePath = filePath.substr(0, filePath.length - 9) + '.html';

  return (
    '<h2>Please note that .min/.max is no longer supported</h2>' +
    '<h3>Current serving mode is ' +
    mode +
    '</h3>' +
    '<h3>Please go to <a href= ' +
    filePath +
    '>Unversioned Link</a> to view the page<h3>' +
    '<h3></h3>' +
    '<h3><a href = /serve_mode=default>' +
    'Change to DEFAULT mode (unminified JS)</a></h3>' +
    '<h3><a href = /serve_mode=compiled>' +
    'Change to COMPILED mode (minified JS)</a></h3>' +
    '<h3><a href = /serve_mode=cdn>Change to CDN mode (prod JS)</a></h3>'
  );
}

module.exports = app;
