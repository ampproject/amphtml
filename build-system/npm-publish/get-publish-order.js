/**
 * @fileoverview
 * Gets the order the packages should be published in.
 */

const {getOptimalPublishOrder} = require('./utils');

getOptimalPublishOrder(parseInt(process.argv[2], 10)).then(console.log);
