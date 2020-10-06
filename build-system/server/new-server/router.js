/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
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

const router = require('express').Router();
const {transform} = require('./transforms/dist/transform');

router.get('/examples/*.html', async (req, res) => {
  let transformedHTML;
  const filePath = `${process.cwd()}${req.path}`;
  try {
    transformedHTML = await transform(filePath);
  } catch (e) {
    console./*OK*/ log(
      `${req.path} could not be transformed by the postHTML ` +
        `pipeline.\n${e.message}`
    );
  }
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.end(transformedHTML);
});

module.exports = router;
