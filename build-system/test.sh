set -x
BUILD_OUTPUT_FILE="amp_build_${TRAVIS_BUILD_NUMBER}.zip"

echo "Verifying build output is available..."
gsutil ls gs://amp-travis-builds/${BUILD_OUTPUT_FILE}

echo "Downloading build output..."
gsutil cp gs://amp-travis-builds/${BUILD_OUTPUT_FILE} ${BUILD_OUTPUT_FILE}

echo "Verifying download..."
ls ${BUILD_OUTPUT_FILE}

echo "Unzipping build output..."
unzip -o ${BUILD_OUTPUT_FILE}

echo "Verifying unzip..."
ls -la build/ dist/ dist.3p/

echo "Updating packages..."
gulp update-packages

echo "Running tests..."
gulp test --headless --integration --nobuild
