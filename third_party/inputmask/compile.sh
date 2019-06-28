#!/usr/bin/env bash
# Run this file with bash to add AMP-specific changes to the
# inputmask library.

# Apply all the patches in third_party/inputmask/patches/
for patchfile in patches/*.patch
do
  echo "Applying patch $patchfile"
  patch < $patchfile
done
