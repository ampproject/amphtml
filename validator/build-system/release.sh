#!/bin/bash

readonly MERGE_FOLDER="${HOME}/.amp-release/amphtml"

rm -rvf "$MERGE_FOLDER"

mkdir -p "$MERGE_FOLDER"

git clone https://github.com/ampproject/amphtml.git "$MERGE_FOLDER"

cd "$MERGE_FOLDER"
echo "===================="
echo "in folder $(pwd)"
echo "===================="

git checkout -B canary master

echo "done with resetting canary"
echo "===================="

git checkout release

readonly last_release_tag=$(git describe --abbrev=0 --first-parent --tags canary)

echo "trying to merging ${last_release_tag} into release"

git merge "$last_release_tag"

echo "done with merging ${last_release_tag} into canary"
echo "===================="

git checkout master

echo "
====================
Please manually push the branches if merges were successful.
If canary was not ahead of release, you might not need to push release
and merge would have exited with \"Already-up-to-date.\"

cd ${MERGE_FOLDER}

https push (needs auth login entry):
git push https://github.com/ampproject/amphtml.git canary
git push https://github.com/ampproject/amphtml.git release

ssh push:
git push git@github.com:ampproject/amphtml.git canary
git push git@github.com:ampproject/amphtml.git release


single line ssh push (if both branches can be pushed):
cd ${MERGE_FOLDER} && git push git@github.com:ampproject/amphtml.git canary && git push git@github.com:ampproject/amphtml.git release
"
