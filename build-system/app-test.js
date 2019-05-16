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

  app.use('/date-picker/config.json', (req, res) => {
    function getISO8601Date(date) {
      const year = date.toLocaleString('en-US', {year: 'numeric'});
      const month = date.toLocaleString('en-US', {month: '2-digit'});
      const day = date.toLocaleString('en-US', {day: '2-digit'});
      return `${year}-${month}-${day}`;
    }

    const date = new Date();
    const nextWeek = new Date(new Date(date).setDate(date.getDate() + 7));
    const twoWeeks = new Date(new Date(date).setDate(date.getDate() + 14));

    const blocked = [getISO8601Date(nextWeek), getISO8601Date(twoWeeks)];

    res.json({
      blocked,
    });
  });
}

module.exports = {
  appTestEndpoints,
};
