/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
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
 * A list of options to correspond with options.json for testing purposes.
 * To add an option, add the corresponding key-value pair into the
 * options.json, then add the field to this interface.
 */
export interface OptionSet {
    compiled?: boolean;
    // Allows to bypass `isValidScript` checks. This is needed as to allow
    // localhost and absolute path urls as we convert all our html files
    // to what a valid AMP HTML document should look like. This should be
    // temporary.
    looseScriptSrcCheck?: boolean,
}
