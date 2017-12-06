#!/bin/sh
./node_modules/.bin/browserify -t [ babelify --presets env ] -g uglifyify \
-r ./node_modules/preact:react \
./third_party/react/index.js | \
node ./build-system/scope-require.js > ./third_party/react/bundle.js

