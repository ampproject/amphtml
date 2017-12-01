#!/bin/sh
./node_modules/.bin/browserify -t [ babelify --presets env ] -g uglifyify \
-r ./node_modules/preact:react \
-o ./third_party/react/bundle.js ./third_party/react/index.js

