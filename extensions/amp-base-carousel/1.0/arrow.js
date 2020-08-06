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
import {useEffect, useState} from '../../../src/preact';
import {useStyles} from './amp-base-carousel';

/**
 * @param {!BaseCarouselDef.ArrowProps} props
 * @return {PreactDef.Renderable}
 */
export function Arrow({customArrow, by, advance, disabled}) {
  const {
    'disabled': customDisabled,
    'onClick': onCustomClick,
  } = customArrow.props;
  const styles = useStyles();
  const isDisabled = disabled || customDisabled;
  const onClick = (e) => {
    if (onCustomClick) {
      onCustomClick(e);
    }
    advance(by);
  };
  return (
    // TODO: have these based on props using "dynamic values"?
    // Would mean a second call to `createUseStyles`.
    <div
      className={styles.arrowPlacement}
      style={{
        // Offset button from the edge.
        [by < 0 ? 'left' : 'right']: '0px',
        opacity: isDisabled ? 0 : 1,
        pointerEvents: isDisabled ? 'none' : 'auto',
      }}
    >
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
function DefaultArrow({by, disabled, ...rest}) {
  const styles = useStyles();
  // TODO(wg-bento#7): Replace with :hover and :active pseudoselectors.
  const [hover, setHover] = useState(false);
  const [active, setActive] = useState(false);

  // Component should reset hover and active states when disabled.
  useEffect(() => {
    if (disabled) {
      setHover(false);
      setActive(false);
    }
  }, [disabled]);

  return (
    <button
      className={styles.defaultArrowButton}
      style={{
        color: hover ? '#222' : '#fff',
        transitionDuration: active ? '0ms' : '',
      }}
      aria-label={
        by < 0 ? 'Previous item in carousel' : 'Next item in carousel'
      }
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onMouseDown={() => setActive(true)}
      onMouseUp={() => setActive(false)}
      {...rest}
    >
      <div className={`${styles.arrowBaseStyle} ${styles.arrowFrosting}`}></div>
      <div className={`${styles.arrowBaseStyle} ${styles.arrowBackdrop}`}></div>
      <div
        className={`${styles.arrowBaseStyle} ${styles.arrowBackground}`}
        style={{
          backgroundColor: active
            ? 'rgba(255, 255, 255, 1.0)'
            : hover
            ? 'rgba(255, 255, 255, 0.8)'
            : 'rgba(0, 0, 0, 0.3)',
          transitionDuration: active ? '0ms' : '',
        }}
      ></div>
      <svg className={styles.arrowIcon} viewBox="0 0 24 24">
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
