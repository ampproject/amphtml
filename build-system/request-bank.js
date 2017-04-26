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
 * A server side temporary request storage which is useful for testing
 * browser sent HTTP requests.
 */
var app = require('express').Router();

var bank = {};

/**
 * Deposit a request. An ID has to be specified. Will override previous request
 * if the same ID already exists.
 */
app.get('/deposit/:id', function(req, res) {
  if (typeof bank[req.params.id] === 'function') {
    bank[req.params.id](req);
  } else {
    bank[req.params.id] = req;
  }
  res.end();
});

/**
 * Withdraw a request. If the request of the given ID is already in the bank,
 * return it immediately. Otherwise wait until it gets deposited
 * The same request cannot be withdrawn twice at the same time.
 */
app.get('/withdraw/:id', function(req, res) {
  var result = bank[req.params.id];
  if (typeof result === 'function') {
    return res.status(500).send('another client is withdrawing this ID');
  }
  const callback = function(result) {
    res.json({
      headers: result.headers,
    });
    delete bank[req.params.id];
  };
  if (result) {
    callback(result);
  } else {
    bank[req.params.id] = callback;
  }
});

module.exports = app;
