const cors = require('../amp-cors');
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

/*
 * Infinite scroll related endpoints.
 */
const randInt = (n) => {
  return Math.floor(Math.random()) * n;
};

const squareImgUrl = (width) => {
  return `http://picsum.photos/${width}?${randInt(50)}`;
};

const randomFalsy = () => {
  const rand = randInt(4);
  switch (rand) {
    case 1:
      return null;
    case 2:
      return undefined;
    case 3:
      return '';
    default:
      return false;
  }
};

const generateJson = (numberOfItems, pagesLeft) => {
  const results = [];
  for (let i = 0; i < numberOfItems; i++) {
    const imageUrl = squareImgUrl(200);
    const r = {
      'title': i + pagesLeft * 100,
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
  r['load-more-src'] = `/list/infinite-scroll-random/${category}?${randInt(
    10000
  )}`;

  return r;
};

router.get('/infinite-scroll-random/:category', function (request, response) {
  const {category} = request.params;
  const result = generateResults(category);
  response.json(result);
});

router.get('/infinite-scroll-faulty', function (req, res) {
  const {query} = req;
  const code = query['code'];
  const items = generateJson(12);
  let next = '/list/infinite-scroll-error';
  if (code) {
    next += '?code=' + code;
  }
  res.json({items, next});
});

router.get('/infinite-scroll-error', function (req, res) {
  const {query} = req;
  const code = query['code'] || 404;
  res.status(code);
  res.json({'msg': code});
});

router.get('/infinite-scroll', function (req, res) {
  const {query} = req;
  const numberOfItems = query['items'] || 10;
  const pagesLeft = query['left'] || 1;
  const latency = query['latency'] || 0;

  const items = generateJson(numberOfItems, pagesLeft);

  const nextUrl =
    '/list/infinite-scroll?items=' +
    numberOfItems +
    '&left=' +
    (pagesLeft - 1) +
    '&latency=' +
    latency;
  const next = pagesLeft == 0 ? randomFalsy() : nextUrl;
  const results =
    next === false
      ? {items}
      : {items, next, 'loadMoreButtonText': 'test', 'loadMoreEndText': 'end'};

  if (latency) {
    setTimeout(() => res.json(results), latency);
  } else {
    res.json(results);
  }
});

const generateJsonWithState = (numberOfItems, pagesLeft) => {
  const results = generateJson(numberOfItems);
  results.forEach((e, i) => {
    e['id'] = pagesLeft * 10 + i;
    e['count'] = randInt(10);
    e['favorited'] = randInt(2) == 0 ? 'no' : 'yes';
  });
  return results;
};

router.get('/infinite-scroll-state', function (req, res) {
  const {query} = req;
  const numberOfItems = query['items'] || 2;
  const pagesLeft = query['left'] || 0;
  const items = generateJsonWithState(numberOfItems, pagesLeft);
  const next =
    '/list/infinite-scroll-state?left=' +
    (pagesLeft - 1) +
    '&items=' +
    numberOfItems;
  const results = {
    items,
    next,
  };
  res.json(results);
});

router.get('/ecommerce-nested-menu', function (_req, res) {
  res.json({
    'menu': [
      {
        'title': 'Clothing, Shoes, Jewelry \u0026 Watches',
        'image': 'https://picsum.photos/id/535/367/267',
        'content': [
          {
            'title': 'Clothing, Shoes, Jewelry \u0026 Watches',
            'content': [
              'Women',
              'Men',
              'Girls',
              'Boys',
              'Baby',
              'Luggage',
              'Accessories',
            ],
          },
          {'title': 'More to Explore', 'content': ['Our Brands']},
        ],
      },
      {
        'title': 'Movies, Music \u0026 Games',
        'image': 'https://picsum.photos/id/452/367/267',
        'content': [
          {
            'title': 'Movies, Music \u0026 Games',
            'content': [
              'Movies \u0026 TV',
              'Blue-ray',
              'CDs \u0026 Vinyl',
              'Digital Music',
              'Video Games',
              'Headphones',
              'Musical Instruments',
              'Entertainment Collectibles',
            ],
          },
        ],
      },
      {
        'title': 'Sports \u0026 Outdoors',
        'image': 'https://picsum.photos/id/469/367/267',
        'content': [
          {
            'title': 'Sports',
            'content': [
              'Athletic Clothing',
              'Exercise \u0026 Fitness',
              'Hunting \u0026 Fishing',
              'Team Sports',
              'Sports Collectibles',
            ],
          },
          {
            'title': 'Outdoors',
            'content': [
              'Camping \u0026 Hiking',
              'Cycling',
              'Outdoor Clothing',
              'Climbing',
              'Accessories',
            ],
          },
        ],
      },
      {
        'title': 'Home, Garden \u0026 Tools',
        'image': 'https://picsum.photos/id/491/367/267',
        'content': [
          {
            'title': 'Home, Garden \u0026 Pets',
            'content': [
              'Furniture',
              'Kitchen \u0026 Dining',
              'Bed \u0026 Bath',
              'Garden \u0026 Outdoor',
              'Mattresses',
              'Lighting',
              'Appliances',
              'Pet Supplies',
            ],
          },
          {
            'title': 'Tools, Home Improvement',
            'content': [
              'Home Improvment',
              'Power \u0026 Hand Tools',
              'Cookware',
              'Hardware',
              'Smart Home',
            ],
          },
        ],
      },
    ],
  });
});

module.exports = router;
