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

const CONTAIN = [
  null, // 0: none
  'paint', // 1: paint
  'layout', // 2: layout
  'content', // 3: content = layout + paint
  'size', // 4: size
  'size paint', // 5: size + paint
  'size layout', // 6: size + layout
  'strict', // 7: strict = size + layout + paint
];

const SIZE_CONTENT_STYLE = {
  'position': 'relative',
  'width': '100%',
  'height': '100%',
};

/**
 * The wrapper component that implements different "contain" parameters.
 *
 * See https://developer.mozilla.org/en-US/docs/Web/CSS/contain
 *
 * Contain parameters:
 * - size: the element's size does not depend on its content.
 * - layout: nothing outside the element may affect its internal layout and
 *   vice versa.
 * - paint: the element's content doesn't display outside the element's bounds.
 *
 * @param {!ContainWrapperProps} props
 * @return {PreactDef.Renderable}
 */
export function ContainWrapper({
  as: Comp = 'div',
  size = false,
  layout = false,
  paint = false,
  style,
  wrapperStyle,
  contentRef,
  contentStyle,
  children,
  ...rest
}) {
  // The formula: `size << 2 | layout << 1 | paint`.
  const containIndex = (size ? 4 : 0) + (layout ? 2 : 0) + (paint ? 1 : 0);
  return (
    <Comp
      style={{
        ...style,
        ...wrapperStyle,
        contain: CONTAIN[containIndex],
      }}
      {...rest}
    >
      <div
        ref={contentRef}
        style={{
          ...(size && SIZE_CONTENT_STYLE),
          'overflow': paint ? 'hidden' : 'visible',
          ...contentStyle,
        }}
      >
        {children}
      </div>
    </Comp>
  );
}
