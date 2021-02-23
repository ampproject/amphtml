#!/bin/sh
# Install the local module and execute sample/gulpfile.js
npm link
cd sample && npm link gulp-amphtml-validator && gulp
