#!/bin/sh
browserify -t [ babelify --presets [ env ] ] -g uglifyify \
-r preact-compat:react-dom \
-o ./third_party/react-dom/bundle.js ./third_party/react-dom/index.js 
