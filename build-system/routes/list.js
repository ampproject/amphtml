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

const cors = require('../amp-cors');
const countries = require('../../examples/countries.json');
const router = require('express').Router();

router.use('/fruit-data/get', (req, res) => {
  cors.assertCors(req, res, ['GET']);
  res.json({
    items: [
      {name: 'apple', quantity: 47, unitPrice: '0.33'},
      {name: 'pear', quantity: 538, unitPrice: '0.54'},
      {name: 'tomato', quantity: 0, unitPrice: '0.23'},
    ],
  });
});

router.use('/vegetable-data/get', (req, res) => {
  cors.assertCors(req, res, ['GET']);
  res.json({
    items: [
      {name: 'cabbage', quantity: 5, unitPrice: '1.05'},
      {name: 'carrot', quantity: 10, unitPrice: '0.01'},
      {name: 'brocoli', quantity: 7, unitPrice: '0.02'},
    ],
  });
});


/**
 * Autosuggest endpoint
 */
router.get('/search/countries', function(req, res) {
  let filtered = [];
  if (req.query.hasOwnProperty('q')) {
    const query = req.query.q.toLowerCase();

    filtered = countries.items
        .filter(country => country.name.toLowerCase().startsWith(query));
  }

  const results = {
    'items': [
      {
        'results': filtered,
      },
    ],
  };
  res.send(results);
});

/*
 * Infinite scroll related endpoints.
 */
const randInt = n => {
  return Math.floor(Math.random() * Math.floor(n));
};

const squareImgUrl = width => {
  return `http://picsum.photos/${width}?${randInt(50)}`;
};

const generateJson = numberOfItems => {
  const results = [];
  for (let i = 0; i < numberOfItems; i++) {
    const imageUrl = squareImgUrl(200);
    const r = {
      'title': 'Item ' + randInt(100),
      imageUrl,
      'price': randInt(8) + 0.99,
    };
    results.push(r);
  }
  return results;
};

const generateResults = (category, count = 2) => {
  const r = {};
  const items = [];
  for (let i = 0; i < count; i++) {
    const buster = randInt(10000);
    const item = {};
    item.src = `https://placeimg.com/600/400/${category}?${buster}`;
    items.push(item);
  }

  r.items = items;
  r['load-more-src'] =
      `/list/infinite-scroll-random/${category}?${randInt(10000)}`;

  return r;
};

router.get('/infinite-scroll-random/:category', function(request, response) {
  const {category} = request.params;
  const result = generateResults(category);
  response.json(result);
});

router.get('/infinite-scroll-faulty', function(req, res) {
  const {query} = req;
  const code = query['code'];
  const items = generateJson(12);
  let next = '/list/infinite-scroll-error';
  if (code) {
    next += '?code=' + code;
  }
  res.json({items, next});
});

router.get('/infinite-scroll-error', function(req, res) {
  const {query} = req;
  const code = query['code'] || 404;
  res.status(code);
  res.json({'msg': code});
});

router.get('/infinite-scroll', function(req, res) {
  const {query} = req;
  const numberOfItems = query['items'] || 10;
  const pagesLeft = query['left'] || 1;
  const latency = query['latency'] || 0;

  const items = generateJson(numberOfItems);

  const nextUrl = '/list/infinite-scroll?items=' +
    numberOfItems + '&left=' + (pagesLeft - 1) +
    '&latency=' + latency;

  const randomFalsy = () => {
    const rand = Math.floor(Math.random() * Math.floor(3));
    switch (rand) {
      case 1: return null;
      case 2: return undefined;
      case 3: return '';
      default: return false;
    }
  };

  const next = pagesLeft == 0 ? randomFalsy() : nextUrl;
  const results = next === false ? {items}
    : {items, next,
      'loadMoreButtonText': 'test',
      'loadMoreEndText': 'end',
    };

  if (latency) {
    setTimeout(() => res.json(results), latency);
  } else {
    res.json(results);
  }
});

module.exports = router;
