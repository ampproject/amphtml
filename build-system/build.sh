set -x
BUILD_OUTPUT_FILE="amp_build_${TRAVIS_BUILD_NUMBER}.zip"

echo "Updating packages..."
gulp update-packages

echo "Building..."
gulp build --fortesting

echo "Zipping build output..."
zip -r ${BUILD_OUTPUT_FILE} build/ dist/ dist.3p/

echo "Uploading build output..."
gsutil -m cp -r ${BUILD_OUTPUT_FILE} gs://amp-travis-builds

echo "Verifying upload..."
gsutil ls gs://amp-travis-builds/${BUILD_OUTPUT_FILE}
