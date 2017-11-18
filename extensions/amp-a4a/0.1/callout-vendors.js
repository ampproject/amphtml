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

//////////////////////////////////////////////////////////////////
//                                                              //
//     IMPORTANT: All keys in RTC_VENDORS must be lowercase     //
//       otherwise the vendor endpoint will not be used.        //
//                                                              //
//////////////////////////////////////////////////////////////////
/** @typedef {{
    url: string,
    macros: Array<string>}} */
let RtcVendorDef;
/** @const {!Object<string, RtcVendorDef>} */
export const RTC_VENDORS = {
  'fakevendor': {
    url: 'https://localhost:8000/examples/rtcE1.json?slot_id=SLOT_ID&page_id=PAGE_ID&foo_id=FOO_ID',
    macros: ['SLOT_ID', 'PAGE_ID', 'FOO_ID'],
  },
};
