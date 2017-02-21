/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
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

import {isLayoutSizeDefined} from '../../../src/layout';
import {addParamsToUrl} from '../../../src/url';
import {getDataParamsFromAttributes} from '../../../src/dom';
import {user} from '../../../src/log';

// import {tryParseJson} from '../../../src/json';
// import {
//     installVideoManagerForDoc,
// } from '../../../src/service/video-manager-impl';
// import {setStyles} from '../../../src/style';
// import {isObject} from '../../../src/types';
// import {VideoEvents} from '../../../src/video-interface';
// import {videoManagerForDoc} from '../../../src/video-manager';

class AmpNexxtvPlayer extends AMP.BaseElement {


    /** @param {!AmpElement} element */
    constructor(element) {
        super(element);
    }

}

AMP.registerElement('amp-nexxtv-player', AmpNexxtvPlayer);
