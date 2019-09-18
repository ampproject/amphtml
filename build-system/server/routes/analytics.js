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

const router = require('express').Router();
const {log} = require('../amp4test');

router.post('/rewriter', (req, res) => {
  const body = JSON.parse(req.body);
  if (body.vars && body.vars.url) {
    const requestsConfig = {
      requests: {
        endpoint: body.vars.url,
      },
    };
    Object.assign(body, requestsConfig);
  }

  if (body.vars && body.vars.useIframePing) {
    Object.assign(body, {
      triggers: {
        view: {
          'iframePing': true,
        },
      },
    });
  }

  const extraUrlParams = {
    extraUrlParams: {
      testId: 12358,
      rewritten: true,
      reqBody: body,
    },
  };
  const payload = Object.assign({}, body, extraUrlParams);
  res.json(payload);
});

router.use('/:type', (req, res) => {
  log('Analytics event received: ' + req.params.type);
  log(req.query);
  res.status(204).send();
});

module.exports = router;
