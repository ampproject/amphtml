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

const closeButton = {
  position: 'fixed',
  /* keep it on viewport */
  top: 0,
  left: 0,
  /* give it non-zero size, VoiceOver on Safari requires at least 2 pixels
before allowing buttons to be activated. */
  width: '2px',
  height: '2px',
  /* visually hide it with overflow and opacity */
  opacity: 0,
  overflow: 'hidden',
  /* remove any margin or padding */
  border: 'none',
  margin: 0,
  padding: 0,
  /* ensure no other style sets display to none */
  display: 'block',
  visibility: 'visible',
};

const wrapper = {
  top: 0,
  bottom: 0,
  left: 0,
  right: 0,
  width: '100%',
  height: '100%',
  position: 'fixed',
  boxSizing: 'border-box',
};

// User overridable styles
const defaultStyles = {
  zIndex: 1000,
  backgroundColor: 'rgba(0, 0, 0, 0.9)',
  color: '#fff',
};

const JSS = {
  closeButton,
  wrapper,
  defaultStyles,
};

// useStyles gets replaced for AMP builds via `babel-plugin-transform-jss`.
// eslint-disable-next-line local/no-export-side-effect
export const useStyles = createUseStyles(JSS);
