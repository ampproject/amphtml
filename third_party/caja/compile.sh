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

echo "/* Generated from CAJA Sanitizer library commit $GIT_COMMIT */" > html-sanitizer.js
echo "" >> html-sanitizer.js
cat $CAJA_HOME/ant-lib/com/google/caja/plugin/html-sanitizer-bundle.js \
    | grep -v "window\['html" | grep -v "window\['URI"  >> html-sanitizer.js
echo "" >> html-sanitizer.js
echo "export var htmlSanitizer = html;" >> html-sanitizer.js

# Change html attribute regex to optionally accept bracketed attribute names for amp-bind
OLD_PATTERN="'([-.:\\\\w]+)'"
NEW_PATTERN="'(\\\\\\\\[[-.:\\\\\\\\w]+\\\\\\\\]|[-.:\\\\\\\\w]+)'"  # literally '(\\[[-.:\\w]+\\]|[-.:\\w]+)'
LINENUMBER=$(grep -F -n "$OLD_PATTERN" html-sanitizer.js | cut -d ':' -f1)
sed -i "${LINENUMBER}s/'.*'/$NEW_PATTERN/" html-sanitizer.js
