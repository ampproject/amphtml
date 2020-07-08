#!/bin/sh
./node_modules/.bin/browserify \
-t [ babelify --presets [ @babel/preset-env ] ] -g uglifyify \
./third_party/inputmask/index.js > ./third_party/inputmask/bundle.js
