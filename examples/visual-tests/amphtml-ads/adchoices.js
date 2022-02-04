'use strict';

const {fillIframeSrcdoc} = require('./helpers');

/**
 * Percy preserves the DOM object as snapshot so the content of iframe is not
 * included. This interactive test is created to backfill the iframe to the
 * parent DOM object so that it can be included in the Percy snapshot.
 */
module.exports = {
  'page view': async (page, unusedName) => {
    await fillIframeSrcdoc(page);
  },
};
