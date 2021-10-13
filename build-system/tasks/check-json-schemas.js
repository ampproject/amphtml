'use strict';

const path = require('path');
const schemas = require('../json-schemas/_schemas.json');
const {cyan, green, red} = require('kleur/colors');
const {default: addFormats} = require('ajv-formats');
const {default: Ajv} = require('ajv');
const {log} = require('../common/logging');

/**
 * Checks JSON files against their JSON Schemas.
 * @return {Promise<void>}
 */
async function checkJsonSchemas() {
  log('Validating JSON files');
  const ajv = new Ajv({allErrors: true});
  addFormats(ajv);

  for (const [schemaFile, jsonFiles] of Object.entries(schemas)) {
    log('Using schema', `${cyan(schemaFile)}:`);
    const schemaJson = require(`../json-schemas/${schemaFile}`);
    const validate = ajv.compile(schemaJson);

    for (const jsonFile of jsonFiles) {
      try {
        const jsonData = require(path.join(__dirname, '../..', jsonFile));
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

checkJsonSchemas.description = 'Checks JSON files against their JSON Schemas';
