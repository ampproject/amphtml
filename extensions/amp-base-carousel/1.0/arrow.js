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
import {mod} from '../../../src/utils/math';

/**
 * @param {!JsonObject} props
 * @return {PreactDef.Renderable}
 */
export function Arrow(props) {
  const {dir, restingIndex, setRestingIndex, length, customArrow, loop} = props;
  const button = customArrow ? customArrow : renderDefaultArrow({dir});
  const nextSlide = restingIndex + dir;
  const {children, 'disabled': disabled, onClick, ...rest} = button.props;
  const isDisabled =
    disabled || (loop ? false : nextSlide < 0 || nextSlide >= length);
  const handleClick = () => {
    if (onClick) {
      onClick();
    }
    setRestingIndex(mod(restingIndex + dir, length));
  };
  return Preact.cloneElement(
    button,
    {
      onClick: handleClick,
      disabled: isDisabled,
      ...rest,
    },
    children
  );
}

/**
 * @param {!JsonObject} props
 * @return {PreactDef.Renderable}
 */
function renderDefaultArrow(props) {
  const {dir} = props;
  return (
    <button
      style={{
        // Offset button from the edge.
        [dir < 0 ? 'left' : 'right']: '8px',
        ...styles.defaultArrowButton,
      }}
    >
      {props.dir < 0 ? '<<' : '>>'}
    </button>
  );
}
