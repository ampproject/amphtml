/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import {tryParseJson} from '../../../src/json';
import {user} from '../../../src/log';
import Ajv from 'ajv/dist/ajv.min.js';

/** @const {string} */
const TAG = 'amp-json-schema-validator';

export class AmpJsonSchema {
  /**
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   */
  constructor(ampdoc) {
    /** @const @private */
    this.ampdoc_ = ampdoc;

    /** @const @private */
    this.ajv_ = new Ajv();
  }

  /**
   * Validates the data against a given schema.
   * The schema should be declared in the AMP Doc in a script element
   * with id='{schemaName}'.
   * @param {string} schemaName The name of the schema defined in the ampdoc.
   * @param {!Object} data The data to be validated
   * @return {boolean} Whether or not the data fits the schema
   */
  validate(schemaName, data) {
    const schemaElement = this.ampdoc_.getElementById(schemaName);
    if (!schemaElement) {
      user().error(TAG,`${schemaName} element does not exist`);
      return false;
    }

    /** @const {!JsonObject|null|undefined} */
    const schema = tryParseJson(schemaElement.textContent, e => {
      user().error(TAG,
          `Failed to parse ${schemaName} Schema JSON: ${e}`);
    });

    if (!schema) {
      return false;
    }

    const valid = this.ajv_.validate(schema, data);

    if (!valid) {
      user().error(TAG,
          `Schema validation failed: ${this.ajv_.errorsText()}`);
    }

    return valid;
  }
}

// Register the extension services.
AMP.extension(TAG, '0.1', function(AMP) {
  AMP.registerServiceForDoc('json-schema', function(ampdoc) {
    return new AmpJsonSchema(ampdoc);
  });
});
