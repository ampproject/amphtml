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

/**
 * @const {string}
 * This is the type of message that will be sent to the 3p frame.
 * The message will contain an array of the typedef declared below.
 */
export const IFRAME_TRANSPORT_EVENTS_TYPE = 'IframeTransportEvents';

/** @typedef {Object<string,string>} */
export let IframeTransportEvent;
// An event, and the transport ID of the amp-analytics tags that
// generated it. For instance if the creative with transport
// ID 2 sends "hi", then an IframeTransportEvent would look like:
// { transportId: "2", message: "hi" }
// If the creative with transport ID 2 sent that, and also sent "hello",
// and the creative with transport ID 3 sends "goodbye" then an *array* of 3
// AmpAnalyticsIframeTransportEvent would be sent to the 3p frame like so:
// [
//   { transportId: "2", message: "hi" }, // An AmpAnalyticsIframeTransportEvent
//   { transportId: "2", message: "hello" }, // Another
//   { transportId: "3", message: "goodbye" } // And another
// ]

