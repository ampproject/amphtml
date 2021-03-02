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

const option = {
  'cursor': 'pointer',
};

const selected = {
  'cursor': 'auto',
  'outline': 'solid 1px rgba(0, 0, 0, 0.7)',
};

const disabled = {
  'cursor': 'auto',
  'opacity': '0.4',
};

const multiselected = {
  'cursor': 'pointer',
  'outline': 'solid 1px rgba(0, 0, 0, 0.7)',
};

const JSS = {
  option,
  selected,
  disabled,
  multiselected,
};

// useStyles gets replaced for AMP builds via `babel-plugin-transform-jss`.
// eslint-disable-next-line local/no-export-side-effect
export const useStyles = createUseStyles(JSS);
