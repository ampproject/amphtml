// const moment = require('moment');

// const commit = {committer: {date: '2020-01-28T20:52:41+00:00'}};

// const date = moment(commit.committer.date).format('YYMMDDHHmmss');
// const ampVersion = date.slice(0, -2) + '000';

// console.log(ampVersion);

const {VERSION, getVersion} = require('../compile/internal-version');
//const {VERSION} = require('../compile/internal-version');

console.log(getVersion('d742ce5ca00d5d1301b73aecedff2b0631d91910')); // 2109082106000
console.log(VERSION);
