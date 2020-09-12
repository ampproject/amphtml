const madge = require('madge');

console.log("madge");
madge('./extensions').then((res) => {console.log(res.depends('../src/service/url-replacements-impl.js'))});
