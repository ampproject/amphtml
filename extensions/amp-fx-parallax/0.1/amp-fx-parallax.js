/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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

import {ampdocServiceFor} from '../../../src/ampdoc';
import {installParallaxForDoc} from '../../../src/service/parallax-impl';
import {onDocumentReady} from '../../../src/document-ready';

const ampdoc = ampdocServiceFor(AMP.win).getAmpDoc();
onDocumentReady(ampdoc.win.document, () => {
  installParallaxForDoc(ampdoc.getRootNode());
});
