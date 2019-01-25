/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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


/**
 *
 * @param {?../../../src/service/ampdoc-impl.AmpDoc} ampDoc
 * @param {!Object}  digidipOpts
 * @return {*}
 */
export function getScopeElements(ampDoc, digidipOpts) {

  const doc = ampDoc.getRootNode();

  let scope = '';

  let scopeElements = doc.querySelectorAll('*');

  if (digidipOpts.elementClickhandlerAttribute !== '' &&
      digidipOpts.elementClickhandler !== ''
  ) {

    if (digidipOpts.elementClickhandlerAttribute === 'id') {

      scope = '#' + digidipOpts.elementClickhandler;

      scopeElements = doc.querySelectorAll(scope);

    } else if (digidipOpts.elementClickhandlerAttribute === 'class') {

      scope = '.' + digidipOpts.elementClickhandler;

      let classElements = doc.querySelectorAll(scope);

      classElements = Object.keys(classElements).map(key => {

        return classElements[key];
      });

      if (classElements.length > 0) {

        classElements = classElements.filter(item => {

          for (const i in classElements) {

            if (classElements[i].contains(item) && classElements[i] !== item) {

              return false;
            }
          }

          return true;
        });

        scopeElements = classElements;

      }
    }
  }

  return scopeElements;
}
