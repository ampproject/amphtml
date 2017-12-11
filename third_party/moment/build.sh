#!/bin/sh
./node_modules/.bin/browserify -t [ babelify --presets env ] -g uglifyify \
-r moment \
./third_party/moment/index.js | \
node ./build-system/scope-require.js > ./third_party/moment/bundle.js
