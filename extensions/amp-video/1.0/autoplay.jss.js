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

const eq = {
  pointerEvents: 'none !important',
  alignItems: 'flex-end',
  bottom: '7px',
  height: '12px',
  opacity: '0.8',
  overflow: 'hidden',
  position: 'absolute',
  right: '7px',
  width: '20px',
  zIndex: '1',
  display: 'flex',
};

const eqCol = {
  flex: '1',
  height: '100%',
  marginRight: '1px',
  position: 'relative',
  '& > div': {
    animationName: '$eq-animation',
    animationTimingFunction: 'linear',
    animationIterationCount: 'infinite',
    animationDirection: 'alternate',
    backgroundColor: '#FAFAFA',
    height: '100%',
    position: 'absolute',
    width: '100%',
    willChange: 'transform',
    animationPlayState: 'paused',
  },
  '& > .f1-1': {
    animationDuration: '0.3s',
    transform: 'translateY(60%)',
  },
  '& > .f1-2': {
    animationDuration: '0.45s',
    transform: 'translateY(60%)',
  },
  '& > .f2-1': {
    animationDuration: '0.5s',
    transform: 'translateY(30%)',
  },
  '& > .f2-2': {
    animationDuration: '0.4s',
    transform: 'translateY(30%)',
  },
  '& > .f3-1': {
    animationDuration: '0.3s',
    transform: 'translateY(70%)',
  },
  '& > .f3-2': {
    animationDuration: '0.35s',
    transform: 'translateY(70%)',
  },
  '& > .f4-1': {
    animationDuration: '0.4s',
    transform: 'translateY(50%)',
  },
  '& > .f4-2': {
    animationDuration: '0.25s',
    transform: 'translateY(50%)',
  },
};

const eqPlaying = {
  '& > div > div': {animationPlayState: 'running'},
};

const JSS = {
  eq,
  eqCol,
  eqPlaying,
  '@keyframes eq-animation': {
    '0%': {transform: 'translateY(100%)'},
    '100%': {transform: 'translateY(0)'},
  },
};

// useStyles gets replaced for AMP builds via `babel-plugin-transform-jss`.
// eslint-disable-next-line local/no-export-side-effect
export const useStyles = createUseStyles(JSS);
