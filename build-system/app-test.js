/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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
 * Install endpoints for use in integration and e2e tests.
 * @param {Express} app
 */
function appTestEndpoints(app) {
  app.use('/get', function(req, res) {
    res.json({
      args: req.query,
      headers: req.headers,
    });
  });

  app.use('/redirect-to', function(req, res) {
    res.redirect(302, req.query.url);
  });


  app.use('/status/404', function(req, res) {
    res.status(404).end();
  });

  app.use('/status/500', function(req, res) {
    res.status(500).end();
  });

  app.use('/cookies/set', function(req, res) {
    delete req.query.__amp_source_origin;
    for (const name in req.query) {
      res./*OK*/cookie(name, req.query[name]);
    }
    res.json({
      cookies: req.cookies || {},
    });
  });

  app.use('/response-headers', function(req, res) {
    delete req.query.__amp_source_origin;
    for (const name in req.query) {
      res.setHeader(name, req.query[name]);
    }
    res.json({});
  });

  app.use('/post', function(req, res) {
    delete req.query.__amp_source_origin;
    res.json({
      json: req.body,
    });
  });

  app.use('/form/post/success', function(req, res) {
    const sourceOrigin = req.query['__amp_source_origin'];
    if (sourceOrigin) {
      res.setHeader('AMP-Access-Control-Allow-Source-Origin', sourceOrigin);
    }
    delete req.query.__amp_source_origin;
    res.json({
      name: 'John Miller',
      interests: [
        {title: 'Football'},
        {title: 'Basketball'},
        {title: 'Writing'},
      ],
    });
  });

  app.use('/form/post/error', function(req, res) {
    const sourceOrigin = req.query['__amp_source_origin'];
    if (sourceOrigin) {
      res.setHeader('AMP-Access-Control-Allow-Source-Origin', sourceOrigin);
    }
    delete req.query.__amp_source_origin;
    res.status(500).json({
      error: 'alreadySubscribed',
      name: 'John Miller',
      email: 'john@miller.what',
    });
  });

  app.use('/form/post', function(req, res) {
    const sourceOrigin = req.query['__amp_source_origin'];
    if (sourceOrigin) {
      res.setHeader('AMP-Access-Control-Allow-Source-Origin', sourceOrigin);
    }
    delete req.query.__amp_source_origin;
    res.json({
      json: req.body,
    });
  });

  app.use('/form/verify-error', function(req, res) {
    const sourceOrigin = req.query['__amp_source_origin'];
    if (sourceOrigin) {
      res.setHeader('AMP-Access-Control-Allow-Source-Origin', sourceOrigin);
    }
    res.status(400).json({
      verifyErrors: [{name: 'email', message: 'That email is already taken.'}],
    });
  });
}

module.exports = {
  appTestEndpoints,
};
