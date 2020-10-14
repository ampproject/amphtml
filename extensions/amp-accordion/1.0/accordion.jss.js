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

import {createUseStyles} from 'react-jss';

const sectionChild = {
  // Make animations measurable. Without this, padding and margin can skew
  // animations.
  boxSizing: 'border-box !important',
  // Cancel out the margin collapse. Also helps with animations to avoid
  // overflow.
  overflow: 'hidden !important',
  // Ensure that any absolute elements are positioned within the section.
  position: 'relative !important',
};

// TODO(#30445): update these styles after team agrees on styling
const header = {
  cursor: 'pointer',
  backgroundColor: '#efefef',
  paddingRight: '20px',
  border: 'solid 1px #dfdfdf',
};

// TODO(#30445): update these styles after team agrees on styling
// or delete is not used
const content = {};

const JSS = {
  sectionChild,
  header,
  content,
};

// useStyles gets replaced for AMP builds via `babel-plugin-transform-jss`.
// eslint-disable-next-line local/no-export-side-effect
export const useStyles = createUseStyles(JSS);
