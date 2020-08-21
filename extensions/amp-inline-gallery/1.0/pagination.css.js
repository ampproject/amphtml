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

export const paginationContainer = {
  fontSize: '12px',
  /*
   * TODO(https://github.com/ampproject/amphtml/issues/25888)
   * Use a better, common set of fonts for sans-serif.
   */
  fontFamily: 'sans-serif',
  lineHeight: 1,
  display: 'flex',
  flexDirection: 'column',
};

export const insetPaginationContainer = {
  position: 'absolute',
  left: 0,
  right: 0,
  bottom: 0,
  display: 'flex',
  margin: '18px',
  zIndex: 1,
};

export const paginationDots = {
  position: 'relative',
  alignSelf: 'center',
  zIndex: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%',
  maxWidth: '60%',
};
export const insetPaginationDots = {
  padding: '0 4px',
};

export const paginationDotContainer = {
  position: 'relative',
  zIndex: 1,
  display: 'flex',
  width: '16px',
  minWidth: '14px',
  justifyContent: 'center',
};

export const paginationDot = {
  width: '8px',
  height: '8px',
  borderRadius: '50%',
  position: 'relative',
  backgroundColor: 'rgba(0, 0, 0, 0.2)',
};
export const insetPaginationDot = {
  backgroundColor: 'rgba(255, 255, 255, 0.35)',
};

export const paginationDotProgress = {
  width: '8px',
  height: '8px',
  borderRadius: '50%',
  position: 'absolute',
  top: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.6)',
};

export const insetPaginationDotProgress = {
  backgroundColor: '#fff',
};

export const insetPaginationBaseStyle = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  borderRadius: '12px',
};

export const insetPaginationBackground = {
  backgroundColor: 'rgba(0, 0, 0, 0.3)',
};

export const paginationNumbers = {
  position: 'relative',
  alignSelf: 'flex-end',
  zIndex: 0,
  display: 'flex',
  alignItems: 'center',
  height: '100%',
  padding: '0 8px',
};

export const frosting = {
  backdropFilter: 'blur(3px)',
};

export const backdrop = {
  backdropFilter: 'blur(12px) invert(1) grayscale(0.6) brightness(0.8)',
  opacity: 0.5,
};
