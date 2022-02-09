const {buildBinaries} = require('../extension-helpers');

const fastGlob = require('fast-glob');
const {endBuildStep} = require('../helpers');
const path = require('path');
const {mkdirSync, writeFile} = require('fs-extra');

/**
 * Build the Bento end to end page
 *
 * @param {!Object} options
 * @return {!Promise<void>}
 */
async function buildBentoE2E(options) {
  const e2eFixtures = await fastGlob(
    'extensions/*/1.0/test-e2e/e2e-fixture.js'
  );

  const results = e2eFixtures.flatMap(buildEndToEndBinaries(options));
  await Promise.all(results);
}

/**
 * This generates an array of promises for each component to create the e2e fixtures.
 *
 * @param {Object} options
 * @return {(fixturePath: string) => [Promise<any>, Promise<void>, Promise<void>]}
 */
function buildEndToEndBinaries(options) {
  const newOptions = {
    ...options,
    // outputting builds to test directory
    outputPath: 'test/fixtures/e2e/',
  };
  return (fixturePath) => {
    const bentoComponentName = fixturePath.match(/amp-(.*(?=\/\d))/)?.[1];

    if (!bentoComponentName) {
      throw new Error('component name not found for e2e testing');
    }

    return [
      // build the js bundles to test
      buildBinaries(
        `extensions/amp-${bentoComponentName}/1.0/test-e2e`,
        [
          // Build preact options
          {
            entryPoint: 'e2e-fixture.js',
            outfile: `bento-${bentoComponentName}-e2e-build-preact.js`,
            wrapper: '',
          },
          // Build react options
          {
            babelCaller: 'react-unminified',
            entryPoint: 'e2e-fixture.js',
            external: [],
            outfile: `bento-${bentoComponentName}-e2e-build-react.js`,
            wrapper: '',
            remap: {
              'preact': 'react',
              '.*/preact/compat': 'react',
              'preact/hooks': 'react',
              'preact/dom': 'react-dom',
            },
          },
        ],
        newOptions
      ),
      // build the html pages to load the e2e SPA
      buildEndToEndTestPage(bentoComponentName, 'preact', newOptions),
      buildEndToEndTestPage(bentoComponentName, 'react', newOptions),
    ];
  };
}

/**
 * Creates html for an SPA to end-to-end test bento component with preact or react.
 *
 * @param {string} bentoComponentName
 * @param {'preact' | 'react'} buildFor
 * @param {Object} options
 * @return {Promise<void>}
 */
async function buildEndToEndTestPage(bentoComponentName, buildFor, options) {
  const startTime = Date.now();
  const buildForExt = options.minify ? buildFor : `${buildFor}.max`;
  const htmlTemplate = `<!DOCTYPE html>
    <html>
      <head>
        <script async src="./bento-${bentoComponentName}-e2e-build-${buildForExt}.js"></script>
        <link rel="stylesheet" type="text/css" href="/src/bento/components/bento-${bentoComponentName}/1.0/dist/styles.css" />
      </head>
      <body>
        <div id="bento"></div>
      </body>
    </html>`;
  const htmlFileName = `bento-${bentoComponentName}-e2e-build-${buildFor}.html`;
  const outfile = path.join(options.outputPath, 'dist', htmlFileName);

  mkdirSync(path.join(options.outputPath, 'dist'), {recursive: true});

  await writeFile(outfile, htmlTemplate, 'utf-8');
  endBuildStep(
    `Wrote ${buildFor} e2e html page for ${bentoComponentName}`,
    htmlFileName,
    startTime
  );
}

module.exports = {
  buildBentoE2E,
};
