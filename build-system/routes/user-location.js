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
const router = require('express').Router();

router.use('/general-deals', (req, res) => {
  cors.assertCors(req, res, ['GET']);
  res.json({
    businesses: [
      'general business 1',
      'general business 2',
      'general business 3',
    ],
  });
});

router.use('/localized-deals', (req, res) => {
  cors.assertCors(req, res, ['GET']);

  const {lat, lon} = req.query;

  res.json({
    lat,
    lon,
    businesses: ['local business 1', 'local business 2', 'local business 3'],
  });
});

module.exports = router;
