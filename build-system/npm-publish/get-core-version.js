const [ampVersion] = process.argv.slice(2);
const {coreConfig, getSemver} = require('./utils');
console /*OK*/
  .log(getSemver(coreConfig.version, ampVersion));
