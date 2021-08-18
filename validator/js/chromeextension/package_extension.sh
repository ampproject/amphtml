#!/bin/bash -ex
#
# A script to package only the necessary files of the extension.

echo "Building chrome extension"

./build_extension.sh

echo "Packaging chrome extension"

VERSION=$(egrep "\"version\":" manifest.json | cut -d\" -f4)
zip -r extension-"$VERSION".zip ./ -x bower.json build_extension.sh \
  icon-64.png package_extension.sh polymer.html polymer-extension-toolbar.html \
  popup-validator.html popup-validator-not-present.html \
  promotional-440.png README.md screenshot-chrome-1.png \
  screenshot-chrome-2.png screenshot-opera-1.png screenshot-opera-2.png

echo "Removing generated files"

rm popup-validator.build.html popup-validator.build.js
rm popup-validator-not-present.build.html popup-validator-not-present.build.js

echo "Done"
