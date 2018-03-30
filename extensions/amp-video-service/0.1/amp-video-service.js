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

/**
 * @fileoverview
 * Extension gets loaded dynamically and manages video components.
 * It's invalid to include this extension in a document as a `<script>` tag, as
 * it gets automatically inserted by the runtime when required.
 */

import {dev} from '../../../src/log';


/** @private @const {string} */
const TAG = 'amp-video-service';


/**
 * Manages all AMP video players that implement the common Video API
 * {@see ../src/video-interface.VideoInterface}.
 *
* Provides unified behavior for all videos regardless of implementation.
 *
 *
 * __          __              _
 * \ \        / /             (_)
 *  \ \  /\  / /_ _ _ __ _ __  _ _ __   __ _
 *   \ \/  \/ / _` | '__| '_ \| | '_ \/ _` |
 *    \  /\  / (_| | |  | | | | | | | | (_| |_
 *     \/  \/ \__,_|_|  |_| |_|_|_| |_|\__, (_)
 *                                      __/ |
 *                                     |___/
 *
 * This service is instantiated asynchronously by
 * {@see ../../../src/service/video-service-impl.VideoService}. That should be
 * used by consumers of the APIs exposed here.
 *
 * If you need to add methods to this class that are public to components,
 * it's most likely that you'll want to implement them here and set wrappers for
 * them in the runtime-level service class.
 */
export class VideoService {
  /** @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc */
  constructor(ampdoc) {
    /** @private @const {!../../../src/service/ampdoc-impl.AmpDoc} */
    this.ampdoc_ = ampdoc;
  }

  /* @param {!../../../src/video-interface.VideoInterface} video */
  register(video) {
    dev().warn(TAG, '`video-service` registration unimplemented.');
  }
}


AMP.extension(TAG, 0.1, function(AMP) {
  AMP.registerServiceForDoc('video-service', VideoService);
});
