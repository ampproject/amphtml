

// These extensions have been modified in the last 2 weeks, so we're not
// including them yet to minimize disruption to devs actively working on them.
const EXCLUDED_EXTENSIONS = require('./import-order-excluded.json');

module.exports = {
  'rules': {'import/order': 2},
  'overrides': [
    {
      'files': EXCLUDED_EXTENSIONS.map((ext) => `./${ext}/**/*.js`),
      'rules': {'import/order': 0},
    },
  ],
};
