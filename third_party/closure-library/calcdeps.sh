#!/bin/bash

# Use Closure builder to generate only the necessary dependencies of the exported symbols needed.
# Note: need to uncomment `goog.provide` to the wrapper file to have a fake namespace.

CLOSURE_LIB=../../node_modules/google-closure-library
BUILDER="$CLOSURE_LIB/closure/bin/build/closurebuilder.py"

$BUILDER \
  --root=$CLOSURE_LIB/ \
  --root=./ \
  --namespace="__AMP_SHA384_DIGEST"
