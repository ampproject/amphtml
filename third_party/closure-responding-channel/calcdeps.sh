# Use Closure builder to generate only the necessary dependencies of the exported symbols needed by assist.js.
# Note: need to add "goog.provide('assistjs');" to the wrapper file to have a fake namespace.
CLOSURE_LIB=../../../../node_modules/google-closure-library
BUILDER=../../../../node_modules/google-closure-library/closure/bin/build/closurebuilder.py

$BUILDER \
  --root=$CLOSURE_LIB/ \
  --root=./ \
  --namespace="assistjs.createRC"