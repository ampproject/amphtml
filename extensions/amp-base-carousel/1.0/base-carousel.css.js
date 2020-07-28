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

export const slideElement = {
  flex: '0 0 100%',
  height: '100%',
  position: 'relative',
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  scrollSnapAlign: 'start',
};

export const scrollContainer = {
  height: '100%',
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  overflowX: 'auto',
  overflowY: 'hidden',
  display: 'flex',
  flexDirection: 'row',
  flexWrap: 'nowrap',
  scrollBehavior: 'smooth',
  WebkitOverflowScrolling: 'touch',
  scrollSnapType: 'x mandatory',
};

export const arrowPlacement = {
  position: 'absolute',
  zIndex: 1,
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  // Center the button vertically.
  top: '50%',
  transform: 'translateY(-50%)',
};

export const defaultArrowButton = {
  width: '32px',
  height: '32px',
  background: 'rgba(0, 0, 0, 0.25)',
};

/*
 * Styles to hide scrollbars, with three different methods:
 *
 * 1. scrollbar-width
 *  - Note: this is actually scrollbar *thickness* and applies to horizontal
 *    scrollbars as well
 * 2. ::-webkit-scrollbar
 * 3. Using padding to push scrollbar outside of the overflow
 *
 * The last method has side-effect of having the bottom of the slides being
 * cut-off, since the height (or width) of the scrollbar is included when
 * calculating the 100% height (or width) of the slide.
 */
/* Firefox */
export const hideScrollbar = {
  scrollbarWidth: 'none',
};
/* Chrome, Safari */
export const hideScrollbarPseudo = `[hide-scrollbar]::-webkit-scrollbar {
  display: none;
  box-sizing: content-box !important;
  }`;
export const horizontalScroll = {
  flexDirection: 'row',
  /* Firefox, IE */
  scrollSnapTypeX: 'mandatory',
  scrollSnapType: 'x mandatory',
  /* Hide scrollbar */
  paddingBottom: '20px',
  overflowY: 'hidden',
};

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

/**
 * Used to allow the spacing of the dots to become more compact as more dots
 * are added.
 * @param inset
 */
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

export const insetPaginationBase = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  borderRadius: '12px',
};

export const insetPaginationFrosting = {
  ...insetPaginationBase,
  backdropFilter: 'blur(3px)',
};

export const insetPaginationBackdrop = {
  ...insetPaginationBase,
  /**
   * Instead of using a plain background color, we use a backdrop-filter to
   * make the effective background partially dependent on the current
   * backdrop (e.g. the image on a carousel slide). This allows the pagination
   * backgroud to be distinguishable on very dark backgrounds, while still
   * having it be semi-transparent.
   *
   * This can be harder to distinguish on middle greys. For this current
   * current configuration, hsl(0, 0%, 31%) to hsl(0, 0%, 35%) can appear quite
   * close to the background color.
   *
   * The blur here is used for averaging the backdrop color, so that sharp
   * contrasts (e.g. edge of sky and landscape) do not cause immediate shifts
   * in the container color.
   *
   * The greyscale is used to have the container slightly tinted by the inverse
   * color, but also not be too tinted.
   */
  backdropFilter: 'blur(12px) invert(1) grayscale(0.6) brightness(0.8)',
  /**
   * Note: we use a opacity rather than a filter function due to a bug in
   * Chrome: https://bugs.chromium.org/p/chromium/issues/detail?id=991656.
   * Otherwise, we could use the opacity function and combine this with the
   * i-amphtml-inline-gallery-pagination-background class as the background of the pagination container
   * rather than needing two separate Elements for it.
   */
  opacity: 0.5,
};

export const insetPaginationBackground = {
  ...insetPaginationBase,
  /**
   * Note: we always add some darkening using background-color, since we do not
   * change the dot color. Note that this applies on top of the backdrop based
   * color, rather than affecting it.
   */
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
