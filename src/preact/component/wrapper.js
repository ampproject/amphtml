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

import * as Preact from '../';
import {forwardRef} from '../compat';

/**
 * The wrapper component provides the canonical wrapper for components whose
 * size depends on the children. This is often the opposite of the
 * `ContainWrapper`.
 * @param {!WrapperCompomemtProps} props
 * @param {{current: ?Element}} ref
 * @return {PreactDef.Renderable}
 */
function WrapperWithRef(
  {
    as: Comp = 'div',
    wrapperClassName,
    wrapperStyle,
    children,
    'className': className,
    'style': style,
    ...rest
  },
  ref
) {
  return (
    <Comp
      {...rest}
      ref={ref}
      className={`${className || ''} ${wrapperClassName || ''}`}
      style={{...style, ...wrapperStyle}}
    >
      {children}
    </Comp>
  );
}

const Wrapper = forwardRef(WrapperWithRef);

export {Wrapper};
