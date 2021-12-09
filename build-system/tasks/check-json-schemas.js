'use strict';

const fastGlob = require('fast-glob');
const fs = require('fs');
const json5 = require('json5');
const {cyan, green, red} = require('kleur/colors');
const {default: addFormats} = require('ajv-formats');
const {default: Ajv} = require('ajv');
const {log} = require('../common/logging');

/**
 * Fetches the content of a JSON/JSONC/JSON5 file.
 *
 * @param {string} file repo root relative.
 * @return {any}
 */
function getJsonContents(file) {
  return json5.parse(fs.readFileSync(file, 'utf8'));
}

/**
 * Checks JSON files against their JSON Schemas.
 */
function checkJsonSchemas() {
  log('Validating JSON files');
  const ajv = new Ajv({allErrors: true});
  addFormats(ajv);

  const vscodeSettings = getJsonContents('.vscode/settings.json');
  const schemas = vscodeSettings['json.schemas'];

  for (const {fileMatch, url: schemaFile} of schemas.values()) {
    log('Using schema', `${cyan(schemaFile)}:`);
    const schemaJson = getJsonContents(schemaFile);
    const validate = ajv.compile(schemaJson);

    const jsonFiles = fastGlob.sync(fileMatch, {
      dot: true,
      ignore: ['**/node_modules'],
    });

    for (const jsonFile of jsonFiles) {
      try {
        const jsonData = getJsonContents(jsonFile);
        if (validate(jsonData)) {
          log('⤷', cyan(jsonFile), '-', green('valid'));
        } else {
          process.exitCode = 1;
          log('⤷', cyan(jsonFile), '-', red('invalid'));
          for (const error of validate.errors || []) {
            log('  ⤷', cyan(error.instancePath), red(error.message || ''));
          }
        }
      } catch (error) {
        process.exitCode = 1;
        if (error instanceof SyntaxError) {
          log('⤷', cyan(jsonFile), '-', red('unable to parse as a JSON file'));
        } else {
          throw error;
        }
      }
    }
  }
}

module.exports = {
  checkJsonSchemas,
};

checkJsonSchemas.description =
  'Checks JSON files against their required schemas';
