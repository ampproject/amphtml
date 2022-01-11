let url;
let variableSubstitution;
let variables;

/**
 * @param {*} req require('express').Request
 * @param {*} res require('express').Response
 */
function saveVariables(req, res) {
  const requestVariables = {};
  // For when a JSON is entered
  if (req.query && Object.keys(req.query).length === 2) {
    const entries = Object.entries(req.query);
    try {
      Object.assign(requestVariables, JSON.parse(entries[1][0]));
    } catch (e) {
      res.send(`<!doctype html>
      <html>
      <head>
          <title>AMP Analytics</title>
      </head>
      <body>
      <p>Error:</p>
      ${e}
      </body>
      </html>`);
      return;
    }
  } else {
    // Remove variables that don't have values
    const keys = Object.keys(req.query);
    for (let i = 0; i < keys.length; i++) {
      if (req.query[keys[i]]) {
        requestVariables[keys[i]] = req.query[keys[i]];
      }
    }
  }
  variables = requestVariables;
  res.json({'vars': variables});
  return;
}

/**
 * @param {*} req require('express').Request
 * @param {*} res require('express').Response
 */
function runVariableSubstitution(req, res) {
  variables = variables || {};
  // Don't include the incremented number sent in to make a new request
  const testParameters = Object.keys(req.query)
    .map((value) => {
      return `${value}=${req.query[value]}`;
    })
    .slice(1)
    .join('&');
  res.send(`<!doctype html>
    <html>
    <head>
      <title>AMP Analytics</title>
      <link rel="canonical" href="analytics.amp.html" >
      <meta name="viewport" content="width=device-width,minimum-scale=1,initial-scale=1">
      <style amp-boilerplate>body{-webkit-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-moz-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-ms-animation:-amp-start 8s steps(1,end) 0s 1 normal both;animation:-amp-start 8s steps(1,end) 0s 1 normal both}@-webkit-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-moz-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-ms-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-o-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}</style><noscript><style amp-boilerplate>body{-webkit-animation:none;-moz-animation:none;-ms-animation:none;animation:none}</style></noscript>
      <script async src="https://cdn.ampproject.org/v0.js"></script>
      <script async custom-element="amp-analytics" src="https://cdn.ampproject.org/v0/amp-analytics-0.1.js"></script>
    </head>
    <body>

    <h3>'<amp-analytics>' request: </h3>
      ${
        testParameters
          ? 'http://ads.localhost:8000/save-variable-request?' + testParameters
          : 'N/A'
      }

    <amp-analytics>
      <script type="application/json">
        {
            "requests": {
              "endpoint": "http://ads.localhost:8000/save-variable-request?${testParameters}"
            },
            "triggers": {
                "pageview": {
                    "on": "visible",
                    "request": "endpoint"
                }
            },
            "vars": ${JSON.stringify(variables)},
            "transport": {
              "beacon": false,
              "xhrpost": false,
              "image": true
            }
          }
      </script>
    </amp-analytics>
    </body>
    </html>`);
}

/**
 * @param {*} req require('express').Request
 * @param {*} res require('express').Response
 */
function saveVariableRequest(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Access-Control-Allow-Headers', 'text/plain');
  variableSubstitution = req.query;
  url = req.originalUrl;
}

/**
 * @param {*} _req require('express').Request
 * @param {*} res require('express').Response
 */
function getVariableRequest(_req, res) {
  res.json({'Results': variableSubstitution, 'URL': url});
  return;
}

module.exports = {
  getVariableRequest,
  runVariableSubstitution,
  saveVariableRequest,
  saveVariables,
};
