#!/bin/sh
./node_modules/.bin/browserify -t [ babelify --presets env ] -g uglifyify \
-r moment \
-o ./third_party/moment/bundle.js ./third_party/moment/index.js
