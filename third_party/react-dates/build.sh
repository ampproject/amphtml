#!/bin/sh
npm install -g browserify babelify envify derequire
browserify \
-t [ babelify --presets [ @babel/preset-env ] ] \
-g [ envify purge --NODE_ENV production ] \
-g uglifyify \
-r prop-types -r preact:react -r preact/compat:react-dom \
-r moment/min/moment-with-locales:moment \
-r react-dates -r react-dates/initialize -r react-dates/constants \
./third_party/react-dates/index.js | \
node ./third_party/react-dates/scope-require.js | \
derequire > ./third_party/react-dates/bundle.js
cp ./node_modules/react-dates/lib/css/_datepicker.css ./third_party/react-dates/
npm uninstall -g browserify babelify envify derequire
