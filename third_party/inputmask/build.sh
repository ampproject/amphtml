#!/bin/sh
npm install -g browserify babelify uglifyify
browserify \
-t [ babelify --presets [ @babel/preset-env ] ] -g uglifyify \
./third_party/inputmask/index.js > ./third_party/inputmask/bundle.js
npm uninstall -g browserify babelify uglifyify
