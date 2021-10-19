/**
 * Copyright 2021 The AMP HTML Authors. All Rights Reserved.
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

import {VideoEvents} from '../../src/video-interface';

/**
 * @fileoverview
 * Definitions of messages and other utilities to talk to an iframe that embeds
 * the amp-video-iframe integration script.
 * See https://go.amp.dev/c/amp-video-iframe#integration-inside-the-frame
 */

// ⚠️ This module should not have side-effects.

/**
 * Events allowed to be dispatched from messages.
 * @private @const
 */
export const BUBBLE_MESSAGE_EVENTS = [
  VideoEvents.PLAYING,
  VideoEvents.PAUSE,
  VideoEvents.ENDED,
  VideoEvents.MUTED,
  VideoEvents.UNMUTED,
  VideoEvents.AD_START,
  VideoEvents.AD_END,
];
