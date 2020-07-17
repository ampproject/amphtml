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
import * as styles from './base-carousel.css';
import {useState} from '../../../src/preact';

/**
 * @param {!JsonObject} props
 * @return {PreactDef.Renderable}
 */
export function Arrow(props) {
  const {
    'customArrow': customArrow,
    'by': by,
    'advance': advance,
    'disabled': disabled,
  } = props;
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
  return (
    <div
      style={{
        ...styles.arrowPlacement,
        // Offset button from the edge.
        [by < 0 ? 'left' : 'right']: '0px',
        opacity: isDisabled && 0,
        pointerEvents: isDisabled && 'none',
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
 * @param {!JsonObject} props
 * @return {PreactDef.Renderable}
 */
export function ArrowPrev(props) {
  const {'customArrow': customArrow, ...rest} = props;
  return (
    <Arrow
      by={-1}
      customArrow={customArrow || <DefaultArrow by={-1} />}
      {...rest}
    />
  );
}

/**
 * @param {!JsonObject} props
 * @return {PreactDef.Renderable}
 */
export function ArrowNext(props) {
  const {'customArrow': customArrow, ...rest} = props;
  return (
    <Arrow
      by={1}
      customArrow={customArrow || <DefaultArrow by={1} />}
      {...rest}
    />
  );
}

/**
 * @param {!JsonObject} props
 * @return {PreactDef.Renderable}
 */
function DefaultArrow(props) {
  const {by} = props;
  const [hover, setHover] = useState(false);
  const [active, setActive] = useState(false);
  return (
    <button
      style={{
        ...styles.defaultArrowButton,
        stroke: hover ? '#222' : '#fff',
        transitionDuration: active ? '0ms' : '',
      }}
      aria-label={
        by < 0 ? 'Previous item in carousel' : 'Next item in carousel'
      }
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onMouseDown={() => setActive(true)}
      onMouseUp={() => setActive(false)}
      {...props}
    >
      <div style={styles.arrowFrosting}></div>
      <div style={styles.arrowBackdrop}></div>
      <div
        style={{
          ...styles.arrowBackground,
          backgroundColor: active
            ? 'rgba(255, 255, 255, 1.0)'
            : hover
            ? 'rgba(255, 255, 255, 0.8)'
            : 'rgba(0, 0, 0, 0.3)',
          transitionDuration: active ? '0ms' : '',
        }}
      ></div>
      <svg style={styles.arrowIcon} viewBox="0 0 24 24">
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
