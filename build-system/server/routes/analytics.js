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
  const payload = {...body, ...extraUrlParams};
  res.json(payload);
});

router.use('/:type', (req, res) => {
  log('Analytics event received: ' + req.params.type);
  log(req.query);
  res.status(204).send();
});

module.exports = router;
