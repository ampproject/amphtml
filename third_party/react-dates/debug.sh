#!/bin/sh
pushd third_party/react-dates
npm ci
npx browserify \
-t [ babelify --presets [ @babel/preset-env ] ] \
-r prop-types -r preact:react -r preact/compat:react-dom \
-r moment/min/moment-with-locales:moment \
-r react-dates -r react-dates/initialize -r react-dates/constants \
./index.js | \
node ./scope-require.js | \
npx derequire > ./bundle.js
npx prettier --write ./bundle.js
cp ../../node_modules/react-dates/lib/css/_datepicker.css ./
popd
