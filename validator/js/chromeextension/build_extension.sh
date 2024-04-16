#!/bin/bash -ex
#
# A script to install dependencies and then build the extension.

curl -f https://cdn.ampproject.org/v0/validator_wasm.js -o validator_wasm.js

echo 'Installing web components'
bower install

echo 'Polybuild AMP Validator popups'
polybuild popup-validator.html
polybuild popup-validator-not-present.html

echo 'Removing web components'
rm -rf bower_components

echo 'Done'
