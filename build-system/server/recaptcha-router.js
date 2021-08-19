const argv = require('minimist')(process.argv.slice(2));
const cors = require('./amp-cors');
const pc = process;
const fs = require('fs');
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
  if (argv._.includes('unit') || argv._.includes('integration')) {
    fs.promises.readFile(pc.cwd() + req.path, 'utf8').then((file) => {
      file = file.replace(
        /initRecaptcha\(.*\)/g,
        'initRecaptcha("/recaptcha/mock.js?sitekey=")'
      );
      res.end(file);
    });
  } else {
    next();
  }
};

recaptchaRouter.get('/mock.js', (_req, res) => {
  res.end(recaptchaMock);
});

recaptchaRouter.post('/submit', upload.array(), (req, res) => {
  cors.enableCors(req, res);

  const responseJson = {
    message: 'Success!',
  };

  Object.keys(req.body).forEach((bodyKey) => {
    responseJson[bodyKey] = req.body[bodyKey];
  });

  const containsRecaptchaInResponse = Object.keys(responseJson).some(
    (responseJsonKey) => {
      return responseJsonKey.toLowerCase().includes('recaptcha');
    }
  );

  if (containsRecaptchaInResponse) {
    res.status(200).json(responseJson);
  } else {
    res.status(400).json({
      message: 'Did not include a recaptcha token',
    });
  }
});

module.exports = {
  recaptchaFrameRequestHandler,
  recaptchaRouter,
};
