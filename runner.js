const buildNewServer = require('./build-system/server/typescript-compile').buildNewServer;
buildNewServer();
const transform = require('./build-system/server/new-server/transforms/dist/transform').transform;
const globby = require('globby');
const fs = require('fs-extra');
const log = require('fancy-log');
const {cyan, green, red} = require('ansi-colors');
const argv = require('minimist')(process.argv.slice(2));
const path = require('path');

async function buildTransformedHtml() {
  //const filePaths = await globby('./test/fixtures/**/*.html');
  const filePaths = await globby('./test/fixtures/**/images*.html');
  log(
    green('Copying integration test files to'),
    cyan('test-bin/') + green('...')
  );
  if (argv.esm) {
    await tryTransformAndCopyFilesToTestBin(filePaths);
  } else {
    await copyFilesToTestBin(filePaths);
  }
}

async function copyFilesToTestBin(filePaths) {
  log(green('copying fixture files to'), cyan('test-bin/'));
  for (const filePath of filePaths) {
    await fs.copySync(filePath, `./test-bin/${filePath}`);
  }
}

async function tryTransformAndCopyFilesToTestBin(filePaths) {
  log(green('transforming fixture files to'), cyan('test-bin/'));
  for (const filePath of filePaths) {
    const normalizedFilePath = path.normalize(filePath);
    const dest = `./test-bin/${normalizedFilePath}`;
    try {
      const html = await transform(normalizedFilePath);
      await fs.writeFile(dest, html);
      log(green(`transformed and written successfully to ${dest}.`));
    } catch (e) {
      await fs.copy(filePath, `./test-bin/${filePath}`);
      log(
        red(`${normalizedFilePath} could not be transformed by the postHTML ` +
          `pipeline.\n${e.message}. Copying source file as fallback.`)
      );
    }
  }
}
buildTransformedHtml();
