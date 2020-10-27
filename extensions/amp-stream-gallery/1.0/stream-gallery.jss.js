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

const gallery = {
  display: 'flex',
  flexGrow: 1,
  '&$extraSpace': {
    justifyContent: 'center',
  },
};
const extraSpace = {};
const arrow = {
  position: 'relative',
  zIndex: 1,
  border: 'none',
  outline: 'none',
  boxShadow: '0px 2px 6px 0px rgba(0,0,0,.4)',
  backgroundColor: 'rgba(255,255,255,0.6)',
  backgroundSize: '24px 24px',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
  backdropFilter: 'blur(3px)',
  transition: '200ms opacity ease-in',
};
const arrowPrev = {};
const arrowNext = {};
const insetArrow = {
  flexShrink: 0,
  width: '40px',
  height: '40px',
  padding: '8px',
  margin: '-12px',
  '&$arrowPrev': {
    borderRadius: '0px 4px 4px 0px',
  },
  '&$arrowNext': {
    borderRadius: '4px 0px 0px 4px',
  },
};
const outsetArrow = {
  flexShrink: 0,
  width: '32px',
  height: '32px',
  padding: '4px',
  margin: '2px',
  borderRadius: '50%',
  pointerEvents: 'auto',
};

const JSS = {
  arrow,
  arrowPrev,
  arrowNext,
  extraSpace,
  gallery,
  insetArrow,
  outsetArrow,
};

// useStyles gets replaced for AMP builds via `babel-plugin-transform-jss`.
// eslint-disable-next-line local/no-export-side-effect
export const useStyles = createUseStyles(JSS);
