#!/usr/bin/env bash
set -xe

# common changes above this line should be done upstream #
##########################################################

IMAGE=$(./teads-central vars image)

./teads-central docker tag-and-push --branch-tag --image "${IMAGE}"
