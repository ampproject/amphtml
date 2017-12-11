#!/bin/sh
./node_modules/.bin/browserify -t [ babelify --presets env ] -g uglifyify \
-r prop-types \
./third_party/prop-types/index.js | \
node ./build-system/scope-require.js > ./third_party/prop-types/bundle.js
