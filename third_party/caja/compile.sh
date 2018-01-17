#!/usr/bin/env bash
# Run this file with bash to generate new caja sanitizer library for inclusion
# into AMP.

# $1 is a path to the Caja REPO.
# Dependencies: Java and Ant must be installed

readonly CAJA_HOME=$1

echo "CAJA Home: $CAJA_HOME"
echo "Java: `java -version`"
echo "Ant: `ant -version`"

readonly GIT_COMMIT=`sh -c "cd $CAJA_HOME && git log --pretty=format:'%H' -n 1"`
echo "GIT Commit: $GIT_COMMIT"

pushd $CAJA_HOME
ant MinifiedJs
popd

# Add generation message to top of file, remove references to window['html'] and window['URI']
echo "/* Generated from CAJA Sanitizer library commit $GIT_COMMIT */" > html-sanitizer.js
echo "" >> html-sanitizer.js
cat $CAJA_HOME/ant-lib/com/google/caja/plugin/html-sanitizer-bundle.js \
    | grep -v "window\['html" | grep -v "window\['URI"  >> html-sanitizer.js

# Remove trailing whitespace from generated file
sed -i 's/[[:space:]]*$//' html-sanitizer.js

# Apply all the patches in third_party/caja/patches/
for patchfile in patches/*.patch
do
  echo "Applying patch $patchfile"
  patch < $patchfile
done
