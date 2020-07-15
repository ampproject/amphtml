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
import {dict} from '../../../src/utils/object';

/**
 * @param {!JsonObject} props
 * @return {PreactDef.Renderable}
 */
export function Arrow(props) {
  const {
    'customArrow': customArrow,
    'dir': dir,
    'advance': advance,
    'disabled': disabled,
  } = props;
  const button = customArrow
    ? customArrow
    : renderDefaultArrow(dict({'dir': dir}));
  const {
    'children': children,
    'disabled': customDisabled,
    'onClick': onCustomClick,
    ...rest
  } = button.props;
  const isDisabled = disabled || customDisabled;
  const onClick = (e) => {
    if (onCustomClick) {
      onCustomClick(e);
    }
    advance();
  };
  return (
    <div
      style={{
        ...styles.arrowPlacement,
        // Offset button from the edge.
        [dir < 0 ? 'left' : 'right']: '0px',
      }}
    >
      {Preact.cloneElement(
        button,
        {
          'onClick': onClick,
          'disabled': isDisabled,
          'aria-disabled': isDisabled,
          ...rest,
        },
        children
      )}
    </div>
  );
}

/**
 * @param {!JsonObject} props
 * @return {PreactDef.Renderable}
 */
function renderDefaultArrow(props) {
  return (
    <button style={styles.defaultArrowButton}>
      {props['dir'] < 0 ? '<<' : '>>'}
    </button>
  );
}
