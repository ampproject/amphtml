#!/bin/sh
yarn add js-beautify
./node_modules/.bin/browserify \
-t [ babelify --presets env ] \
-r prop-types -r preact:react -r preact-compat:react-dom -r moment \
-r react-dates -r react-dates/initialize -r react-dates/constants \
./third_party/react-dates/index.js | \
node ./build-system/scope-require.js | \
./node_modules/.bin/derequire | \
./node_modules/.bin/js-beautify > ./third_party/react-dates/bundle.js
cp ./node_modules/react-dates/lib/css/_datepicker.css ./third_party/react-dates/
yarn remove js-beautify
