#!/bin/sh
npm install -g browserify babelify derequire envify prop-types react-addons-shallow-compare react-externs react-with-direction uglifyify
browserify \
-t [ babelify --presets [ @babel/preset-env ] ] \
-r prop-types -r preact:react -r preact/compat:react-dom \
-r moment/min/moment-with-locales:moment \
-r react-dates -r react-dates/initialize -r react-dates/constants \
./third_party/react-dates/index.js | \
node ./third_party/react-dates/scope-require.js | \
derequire | \
js-beautify > ./third_party/react-dates/bundle.js
cp ./node_modules/react-dates/lib/css/_datepicker.css ./third_party/react-dates/
npm uninstall -g browserify babelify derequire envify prop-types react-addons-shallow-compare react-externs react-with-direction uglifyify
