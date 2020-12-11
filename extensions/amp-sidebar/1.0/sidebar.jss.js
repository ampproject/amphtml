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

const sidebarClass = {
  position: 'fixed !important',
  top: 0,
  maxHeight: '100vh !important',
  height: '100vh',
  maxWidth: '80vw',
  backgroundColor: '#efefef',
  minWidth: '45px !important',
  outline: 'none',
  overflowX: 'hidden !important',
  overflowY: 'auto !important',
  zIndex: 2147483647,
};

const left = {
  left: 0,
};

const right = {
  right: 0,
};

const maskClass = {
  position: 'fixed !important',
  top: '0 !important',
  left: '0 !important',
  width: '100vw !important',
  height: '100vh !important',
  /* Prevent someone from making this a full-sceen image */
  backgroundImage: 'none !important',
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  zIndex: 2147483646,
};

const JSS = {
  sidebarClass,
  maskClass,
  left,
  right,
};

// useStyles gets replaced for AMP builds via `babel-plugin-transform-jss`.
// eslint-disable-next-line local/no-export-side-effect
export const useStyles = createUseStyles(JSS);
