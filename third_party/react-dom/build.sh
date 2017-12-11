#!/bin/sh
./node_modules/.bin/browserify -t [ babelify --presets env ] -g uglifyify \
-r preact-compat:react-dom \
./third_party/react-dom/index.js | \
node ./build-system/scope-require.js > ./third_party/react-dom/bundle.js
