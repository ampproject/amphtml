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
'use strict';

const Fuse = require('fuse.js');
const {
  getListing,
} = require('../util/listing');

async function badRequest(res) {
  res.status(400).end();
}

async function searchListing(root, req, res) {

  if (!req.query || !req.query.path) {
    badRequest(res);
    return;
  }

  const basepath = req.query.path;
  const fileSet = await getListing(root, basepath);

  if (!fileSet) {
    badRequest(res);
    return;
  }

  if (!req.query.search) {
    res.status(200).json(fileSet);
    return;
  }

  // Fuzzy find from the file set
  const fuse = new Fuse(fileSet, {
    shouldSort: true,
    threshold: 0.4,
  });
  const foundFileIndexes = fuse.search(req.query.search);

  const response = [];
  foundFileIndexes.forEach(fileIndex => {
    response.push(fileSet[fileIndex]);
  });



  res.status(200).json(response);
}

// Function to handle API Requests
// Returns true is handled, false otherwise
async function handleApiRequest(root, req, res, next) {

  if (req.path.includes('listing')) {
    await searchListing(root, req, res);
    return;
  }

  next();
}

module.exports = {
  handleApiRequest,
};
