/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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

/* eslint-disable local/no-deep-destructuring */

'use strict';

const assert = require('assert');
const fuse = require('fuse.js');
const path = require('path');
const {getListing} = require('../util/listing');
/** @type {fuse.default} */
const Fuse = /** @type {*} */ (fuse);

// Sitting on /build-system/server/app-index/api, so we go back four times for the root.
const root = path.join(__dirname, '../../../../');

/**
 * @param {string[]} fileSet
 * @param {string} opt_searchQuery
 * @return {Array<string>}
 */
function searchListing(fileSet, opt_searchQuery) {
  if (!opt_searchQuery) {
    return fileSet;
  }

  // Fuzzy find from the file set
  const fuse = new Fuse(fileSet, {
    shouldSort: true,
    threshold: 0.4,
  });

  return fuse.search(opt_searchQuery).map(({item}) => item);
}

/**
 * @param {*} param0 require('express').Request
 * @param {*} res require('express').Response
 * @return {Promise<void>}
 */
async function handleListingRequest({query: {path, search}}, res) {
  try {
    assert(path);

    const fileSet = await getListing(root, path);

    assert(fileSet);

    res.json(await searchListing(fileSet, search));
  } catch (e) {
    res.status(400).end('Bad request.');
    throw e; // to log in console
  }
}

/**
 * @param {*} app require('express')
 */
function installExpressMiddleware(app) {
  app.get('/dashboard/api/listing', handleListingRequest);
}

module.exports = {installExpressMiddleware};
