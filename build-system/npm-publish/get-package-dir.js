const [extension, extensionVersion] = process.argv.slice(2);
const {getPackageDir} = require('./utils');

console /*OK*/
  .log(getPackageDir(extension, extensionVersion));
