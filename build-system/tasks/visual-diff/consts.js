'use strict';

const {PORT} = require('../serve');

const HOST = 'localhost';

// Base tests do not run any special code other than loading the page. Use this
// no-op function instead of null for easier type checking.
const BASE_TEST_FUNCTION = async () => {};

module.exports = {
  BASE_TEST_FUNCTION,
  HOST,
  PORT,
};
