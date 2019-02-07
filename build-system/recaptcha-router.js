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

const pc = process;
const BBPromise = require('bluebird');
const fs = BBPromise.promisifyAll(require('fs'));
const multer = require('multer');
const recaptchaRouter = require('express').Router();

const upload = multer();

const recaptchaMock = `
window.grecaptcha = {
  ready: (callback) => callback(),
  execute: () => Promise.resolve('recaptcha-mock')
};
`;

const recaptchaFrameRequestHandler = (req, res, next) => {
  if (global.AMP_TESTING) {
    fs.readFileAsync(pc.cwd() + req.path, 'utf8').then(file => {
      file = file.replace(/initRecaptcha\(.*\)/g, 'initRecaptcha("/recaptcha/mock.js?sitekey=")');
      res.end(file);
    });
  } else {
    next();
  }
};

recaptchaRouter.get('/mock.js', (req, res) => {
  res.end(recaptchaMock);
});

recaptchaRouter.post(
    '/submit',
    upload.array(),
    (req, res) => {
      const sourceOrigin = req.query['__amp_source_origin'];
      if (sourceOrigin) {
        res.setHeader('AMP-Access-Control-Allow-Source-Origin', sourceOrigin);
      }

      const responseJson = {
        message: 'Success!',
      };

      Object.keys(req.body).forEach(bodyKey => {
        responseJson[bodyKey] = req.body[bodyKey];
      });

      res.status(200).json(responseJson);
    }
);

module.exports = {
  recaptchaFrameRequestHandler,
  recaptchaRouter,
};
