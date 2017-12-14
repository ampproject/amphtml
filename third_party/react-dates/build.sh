#!/bin/sh
./node_modules/.bin/browserify \
-t [ babelify --presets env ] \
-g [ envify purge --NODE_ENV production ] \
-g uglifyify \
-r prop-types -r react -r react-dom -r moment \
-r react-dates -r react-dates/initialize -r react-dates/constants \
./third_party/react-dates/index.js | \
node ./build-system/scope-require.js | \
./node_modules/.bin/derequire > ./third_party/react-dates/bundle.js
