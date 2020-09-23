const argv = require('minimist')(process.argv.slice(2));
const fs = require('fs-extra');
const globby = require('globby');
const log = require('fancy-log');
const {cyan, green} = require('ansi-colors');
const {buildNewServer} = require('./build-system/server/typescript-compile');
const pathModule = require('path');
buildNewServer();

const INTEGRATION_FIXTURES = [
  './test/fixtures/images.html',
  '!./test/fixtures/e2e',
  '!./test/fixtures/served',
  '!./test/fixtures/performance',
]

async function buildTransformedHtml() {
  const filePaths = await globby(INTEGRATION_FIXTURES);
    for (const filePath of filePaths) {
      const normalizedFilePath = pathModule.normalize(filePath);
      await transformAndWriteToTestFolder(normalizedFilePath);
    }
}

async function transformAndWriteToTestFolder(filePath) {
  const htmlTransform = require('./build-system/server/new-server/transforms/dist/transform')
      .transform;
  try {
    const html = await htmlTransform(filePath);
    await fs.writeFile(`./test-bin/${filePath}`, html);
  } catch (e) {
    console./*OK*/ log(
      `${filePath} could not be transformed by the postHTML ` +
        `pipeline.\n${e.message}`
    );
    await fs.copy(filePath, `./test-bin/${filePath}`);
  }
}

buildTransformedHtml();
