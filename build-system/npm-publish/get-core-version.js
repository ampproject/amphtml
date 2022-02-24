const [ampVersion] = process.argv.slice(2);
const {getCore, getSemver} = require('./utils');
console /*OK*/
  .log(getSemver(getCore().version, ampVersion));
