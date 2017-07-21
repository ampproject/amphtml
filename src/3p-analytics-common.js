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
 * This is the type of message that will be sent over the wire.
 * The message will contain an array of the typedef declared below.
 */
export const IFRAME_TRANSPORT_EVENTS_TYPE = 'IframeTptEvts';

/** @typedef {Object<string,string>} */
export let IframeTransportEvent;
// List of events, and the transport IDs of the amp-analytics tags that
// generated them. For instance if the creative with transport
// ID 2 sends "hi" and "hello" and the creative with transport ID 3 sends
// "goodbye" then an array of 3 AmpAnalyticsIframeTransportEvent would be
// sent across the wire like so:
// [
//   { transportId: "2", message: "hi" }, // An AmpAnalyticsIframeTransportEvent
//   { transportId: "2", message: "hello" }, // Another
//   { transportId: "3", message: "goodbye" } // And another
// ]

