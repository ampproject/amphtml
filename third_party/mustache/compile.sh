#!/usr/bin/env bash
# Run this file with bash to convert the mustache library from UMD to ESM
# for inclusion into AMP.

# Apply all the patches in third_party/mustache/patches/
for patchfile in patches/*.patch
do
  echo "Applying patch $patchfile"
  patch < $patchfile
done
