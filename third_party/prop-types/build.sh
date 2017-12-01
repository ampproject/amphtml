#!/bin/sh
./node_modules/.bin/browserify -t [ babelify --presets env ] -g uglifyify \
-r prop-types \
-o ./third_party/prop-types/bundle.js ./third_party/prop-types/index.js
