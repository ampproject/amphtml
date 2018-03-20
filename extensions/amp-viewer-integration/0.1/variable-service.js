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

import {parseQueryString} from '../../../src/url';
import {user} from '../../../src/log';

/**
 * @typedef {{ancestorOrigin: function(string, string):string, fragmentParam: function(string, string):string}}
 */
export let ViewerIntegrationVariableDef;

/**
 * Variable service for amp-viewer-integration.
 * Used for URL replacement service. See usage in src/url-replacements-impl.
 */
export class AmpViewerIntegrationVariableService {

  /**
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   */
  constructor(ampdoc) {
    /** @private @const {!../../../src/service/ampdoc-impl.AmpDoc} */
    this.ampdoc_ = ampdoc;

    /** @private @const {!ViewerIntegrationVariableDef} */
    this.variables_ = {
      ancestorOrigin: (unusedParam, unusedDefaultValue) => {
	      return this.getAncestorOrigin_();
      },
      fragmentParam: (param, defaultValue) => {
	      return this.getFragmentParamData_(param, defaultValue);
      },
    };
  }


  /**
   * Return the FRAGMENT_PARAM from the original location href
   * @param {*} param
   * @param {string} defaultValue
   * @return {string}
   * @private
   */
  getFragmentParamData_(param, defaultValue) {
    user().assert(param,
        'The first argument to FRAGMENT_PARAM, the fragment string ' +
        'param is required');
    user().assert(typeof param == 'string', 'param should be a string');
    const hash = this.ampdoc_.win.location.originalHash;
    const params = parseQueryString(hash);
    return (params[param] === undefined) ? defaultValue : params[param];
  }

  /**
   * Return the ANCESTOR_ORIGIN from the location
   * @return {string}
   * @private
   */
  getAncestorOrigin_() {
    const ancestorOrigins = this.ampdoc_.win.location.ancestorOrigins;
    if (!ancestorOrigins) {
      return '';
    }
    return ancestorOrigins[0];
  }

  /**
   * @return {!ViewerIntegrationVariableDef}
   */
  get() {
    return this.variables_;
  }
}
