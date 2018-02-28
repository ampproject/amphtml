const colors = require('ansi-colors');
const fs = require('fs-extra');
const gulp = require('gulp-help')(require('gulp'));
const log = require('fancy-log');
const path = require('path');
const process = require('process');
const ts = require('typescript');
const tsickle = require('tsickle');
const tsickle_main = require('../../node_modules/tsickle/src/main.js');

const EXTENSION_ROOT_FOLDER = path.resolve(__dirname, '..', '..', 'extensions');
const TS_CONFIG_FILE_NAME = 'tsconfig.json';
const USE_TSICKLE = false;

function reportDiagnostics(diagnostics) {
  diagnostics.forEach(diagnostic => {
    let message = 'TypeScript: Error';
    if (diagnostic.file) {
      const where = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);
      message += ` ${diagnostic.file.fileName} ${where.line}, ${where.character + 1}`;
    }
    message += `: ${ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n')}`;

    log(colors.red(message));
  });
}

function evaluateConfiguration(configPath) {
  try {
    // Parse tsconfig.json
    // TODO: KB – Perhaps this should use the ts parser instead of pure JSON.
    const config = JSON.parse(fs.readFileSync(configPath));

    // Extract config infromation
    const configParseResult = ts.parseJsonConfigFileContent(config, ts.sys, path.dirname(configPath));
    if (configParseResult.errors.length > 0) {
      reportDiagnostics(configParseResult.errors);
      process.exit(1);
    }

    return configParseResult;
  } catch (error) {
    log('error evaluateConfiguration', error);
    process.exit(1);
  }
}

/**
 * Compile all locations containing a tsconfig.json file directly with TypeScript.
 *
 * @param {Array<string>} paths - Each path is a location of a `tsconfig.json` file.
 */
function compileTypescript(paths) {
  try {
    paths.forEach(path => {
      log(colors.green(`TypeScript: Compiling path '${path}'`));
      const config = evaluateConfiguration(path);
      const program = ts.createProgram(config.fileNames, config.options);
      const emitResult = program.emit();

      if (emitResult.emitSkipped) {
        process.exit(1);
      }
    });
  } catch (error) {
    log(colors.red(`TypeScript: Compiling error path '${path}'.`, error));
    process.exit(1);
  }
}

/**
 * Compile all locations containing a tsconfig.json file using Tsickle wrapper.
 *
 * @param {Array<string>} paths - Each path is a location of a `tsconfig.json` file.
 */
function compileTsickle(paths) {
  try {
    paths.forEach(eachPath => {
      log(colors.green(`Tsickle: Compiling path '${eachPath}'`));

      const config = evaluateConfiguration(eachPath);
      const {diagnostics} = tsickle_main.toClosureJS(config.options, config.fileNames, {}, (filePath, contents) => {
        fs.mkdirpSync(path.dirname(filePath));
        fs.writeFileSync(filePath, contents, {encoding: 'utf-8'});
      });

      if (diagnostics.length) {
        log(colors.red(tsickle.formatDiagnostics(diagnostics)));
        process.exit(1);
      }
    });
  } catch (error) {
    log(colors.red(`Tsickle: Compiling error paths '${paths}'.`), error);
    process.exit(1);
  }
}

function compile() {
  if (USE_TSICKLE) {
    compileTsickle(configurationsToProcess());
  } else {
    compileTypescript(configurationsToProcess());
  }
}

function configurationPath(directory) {
  if (fs.statSync(directory).isDirectory()) {
    const pathing = path.join(directory, TS_CONFIG_FILE_NAME);
    if (fs.existsSync(pathing)) {
      return pathing;
    }
  }

  return null;
}

/**
 * @return {Array} paths with tsconfig.json files.
 */
function configurationsToProcess() {
  const paths = [];

  fs.readdirSync(EXTENSION_ROOT_FOLDER).forEach(potentialExtensionName => {
    const extensionDirectoryPath = path.join(EXTENSION_ROOT_FOLDER, potentialExtensionName);
    const isExtension = fs.statSync(extensionDirectoryPath).isDirectory();

    if (isExtension) {
      // If the root folder has a directory for the extension then we need to
      // iterate over it's versions looking for ones using typescript.
      fs.readdirSync(extensionDirectoryPath).forEach(extensionVersion => {
        const extensionVersionPath = path.join(extensionDirectoryPath, extensionVersion);
        const extensionConfigPath = configurationPath(extensionVersionPath);
        if (extensionConfigPath !== null) {
          paths.push(extensionConfigPath);

          // We also scan the first level directories inside a valid extension.
          // This is to support cases like <amp-script> which need several
          // tsconfig.json files to represent each segment of its extension code.
          fs.readdirSync(extensionVersionPath).forEach(directFileWithinExtension => {
            const withinExtensionPath = path.join(extensionVersionPath, directFileWithinExtension);
            const withinExtensionConfig = configurationPath(withinExtensionPath);

            if (withinExtensionConfig !== null) {
              paths.push(withinExtensionConfig);
            }
          });
        }
      });
    }
  });

  return paths;
}

gulp.task(
    'typescript',
    'Leverages TypeScript compiler to transpile .ts files into .js',
    compile()
);
