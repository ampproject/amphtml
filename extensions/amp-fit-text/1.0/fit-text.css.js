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

export const LINE_HEIGHT_EM_ = 1.15;

export const fitTextContent = {
  'display': 'flex',
  'flexDirection': 'column',
  'flexWrap': 'nowrap',
  'justifyContent': 'center',
};

/* Legacy comment: We have to use the old-style flex box with line clamping. It will only
    work in WebKit, but unfortunately there's no alternative. */
export const fitTextContentWrapper = {
  lineHeight: `${LINE_HEIGHT_EM_}em`,
  'display': '-webkit-box',
  '-webkit-box-orient': 'vertical',
  'overflow': 'hidden',
  'textOverflow': 'ellipsis',
};
