require('babel-regenerator-runtime');
const describes = require('./describes-e2e');
const {expect} = require('./expect');
const {Key} = require('selenium-webdriver');

global.describes = describes;
global.expect = expect;
global.Key = Key;

module.exports = {
  describes,
};
