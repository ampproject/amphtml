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
import {useStyles} from './component.jss';
import objstr from 'obj-str';

/**
 * @param {!BaseCarouselDef.ArrowProps} props
 * @return {PreactDef.Renderable}
 */
export function Arrow({
  advance,
  as: Comp = DefaultArrow,
  by,
  disabled,
  outsetArrows,
  rtl,
  ...rest
}) {
  const classes = useStyles();
  const onClick = () => {
    if (!disabled) {
      advance();
    }
  };
  return (
    <Comp
      aria-disabled={String(!!disabled)}
      by={by}
      className={objstr({
        [classes.arrow]: true,
        [classes.arrowDisabled]: disabled,
        [classes.arrowPrev]: by < 0,
        [classes.arrowNext]: by > 0,
        [classes.outsetArrow]: outsetArrows,
        [classes.insetArrow]: !outsetArrows,
        [classes.rtl]: rtl,
        [classes.ltr]: !rtl,
      })}
      disabled={disabled}
      onClick={onClick}
      outsetArrows={outsetArrows}
      rtl={rtl}
      {...rest}
    />
  );
}

/**
 * @param {!BaseCarouselDef.ArrowProps} props
 * @return {PreactDef.Renderable}
 */
function DefaultArrow({by, className, ...rest}) {
  const classes = useStyles();
  return (
    <div className={className}>
      <button
        aria-label={
          by < 0 ? 'Previous item in carousel' : 'Next item in carousel'
        }
        className={classes.defaultArrowButton}
        {...rest}
      >
        <div
          className={`${classes.arrowBaseStyle} ${classes.arrowFrosting}`}
        ></div>
        <div
          className={`${classes.arrowBaseStyle} ${classes.arrowBackdrop}`}
        ></div>
        <div
          className={`${classes.arrowBaseStyle} ${classes.arrowBackground}`}
        ></div>
        <svg className={classes.arrowIcon} viewBox="0 0 24 24">
          <path
            d={
              by < 0 ? 'M14,7.4 L9.4,12 L14,16.6' : 'M10,7.4 L14.6,12 L10,16.6'
            }
            fill="none"
            stroke-width="2px"
            stroke-linejoin="round"
            stroke-linecap="round"
          />
        </svg>
      </button>
    </div>
  );
}
