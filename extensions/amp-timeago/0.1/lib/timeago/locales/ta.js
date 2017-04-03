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

export const ta = function(number, index) {
  return [
    ['இப்போது', 'சற்று நேரம் முன்பு'],
    ['%s நொடிக்கு முன்', '%s நொடிகளில்'],
    ['1 நிமிடத்திற்க்கு முன்', '1 நிமிடத்தில்'],
    ['%s நிமிடத்திற்க்கு முன்', '%s நிமிடங்களில்'],
    ['1 மணி நேரத்திற்கு முன்', '1 மணி நேரத்திற்குள்'],
    ['%s மணி நேரத்திற்கு முன்', '%s மணி நேரத்திற்குள்'],
    ['1 நாளுக்கு முன்', '1 நாளில்'],
    ['%s நாட்களுக்கு முன்', '%s நாட்களில்'],
    ['1 வாரத்திற்கு முன்', '1 வாரத்தில்'],
    ['%s வாரங்களுக்கு முன்', '%s வாரங்களில்'],
    ['1 மாதத்திற்கு முன்', '1 மாதத்தில்'],
    ['%s மாதங்களுக்கு முன்', '%s மாதங்களில்'],
    ['1 வருடத்திற்கு முன்', '1 வருடத்தில்'],
    ['%s வருடங்களுக்கு முன்', '%s வருடங்களில்'],
  ][index];
};
