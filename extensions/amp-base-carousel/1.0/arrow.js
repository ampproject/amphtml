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

import * as Preact from '../../../src/preact';
import {useStyles} from './base-carousel.jss';

/**
 * @param {!BaseCarouselDef.ArrowProps} props
 * @return {PreactDef.Renderable}
 */
export function Arrow({customArrow, by, advance, disabled}) {
  const {
    'disabled': customDisabled,
    'onClick': onCustomClick,
  } = customArrow.props;
  const isDisabled = disabled || customDisabled;
  const onClick = (e) => {
    if (onCustomClick) {
      onCustomClick(e);
    }
    advance(by);
  };
  const classes = useStyles();
  const classNames = `${classes.arrowPlacement} ${
    by < 0 ? classes.arrowPrev : classes.arrowNext
  } ${isDisabled ? classes.arrowDisabled : ''}`;

  return (
    <div class={classNames}>
      {Preact.cloneElement(customArrow, {
        'onClick': onClick,
        'disabled': isDisabled,
        'aria-disabled': isDisabled,
      })}
    </div>
  );
}

/**
 * @param {!BaseCarouselDef.ArrowProps} props
 * @return {PreactDef.VNode}
 */
export function ArrowPrev({customArrow, ...rest}) {
  return (
    <Arrow
      by={-1}
      customArrow={customArrow || <DefaultArrow by={-1} />}
      {...rest}
    />
  );
}

/**
 * @param {!BaseCarouselDef.ArrowProps} props
 * @return {PreactDef.Renderable}
 */
export function ArrowNext({customArrow, ...rest}) {
  return (
    <Arrow
      by={1}
      customArrow={customArrow || <DefaultArrow by={1} />}
      {...rest}
    />
  );
}

/**
 * @param {!BaseCarouselDef.ArrowProps} props
 * @return {PreactDef.Renderable}
 */
function DefaultArrow({by, ...rest}) {
  const classes = useStyles();
  return (
    <button
      class={classes.defaultArrowButton}
      aria-label={
        by < 0 ? 'Previous item in carousel' : 'Next item in carousel'
      }
      {...rest}
    >
      <div class={`${classes.arrowBaseStyle} ${classes.arrowFrosting}`}></div>
      <div class={`${classes.arrowBaseStyle} ${classes.arrowBackdrop}`}></div>
      <div class={`${classes.arrowBaseStyle} ${classes.arrowBackground}`}></div>
      <svg class={classes.arrowIcon} viewBox="0 0 24 24">
        {by < 0 ? (
          <path
            d="M14,7.4 L9.4,12 L14,16.6"
            fill="none"
            stroke-width="2px"
            stroke-linejoin="round"
            stroke-linecap="round"
          />
        ) : (
          <path
            d="M10,7.4 L14.6,12 L10,16.6"
            fill="none"
            stroke-width="2px"
            stroke-linejoin="round"
            stroke-linecap="round"
          />
        )}
      </svg>
    </button>
  );
}
