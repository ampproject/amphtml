#!/bin/sh
./node_modules/.bin/browserify -t [ babelify --presets env ] -g uglifyify \
-x prop-types -x react -x react-dom -x moment \
-r react-dates -r react-dates/initialize -r react-dates/constants \
./third_party/react-dates/index.js | \
node ./build-system/scope-require.js > ./third_party/react-dates/bundle.js
