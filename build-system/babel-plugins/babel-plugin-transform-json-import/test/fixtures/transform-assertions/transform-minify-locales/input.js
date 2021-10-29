import options from './options.json' assert {type: 'json'};
import lang from './_locales/lang.json' assert {type: 'json'};

// same as input
console.log(options);

// minified because path includes /_locales/
console.log(lang);
