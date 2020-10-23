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
import {ContainWrapper} from '../../../src/preact/component';
import {forwardRef} from '../../../src/preact/compat';
import {
  toChildArray,
  useCallback,
  useContext,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from '../../../src/preact';

/**
 * @param {!LightboxProps} props
 * @return {PreactDef.Renderable}
 */
function LightboxWithRef({
  id,
  layout = 'nodisplay',
  animateIn = 'fade-in',
  closeButtonAriaLabel,
  scrollable,
  children,
  onOpen,
  open,
  ...rest
}) {
  const lightboxRef = useRef();

  useLayoutEffect(() => {
    if (open && onOpen) {
      onOpen();
    }
  });
  if (open) {
    return (
      <ContainWrapper
        ref={lightboxRef}
        id={id}
        layout={layout}
        size={true}
        layout={true}
        paint={true}
        ariaLabel={closeButtonAriaLabel} // TOOD: Double check
        {...rest}
        style={{
          zIndex: 1000,
          backgroundColor: '#000',
          color: '#fff',
          // TODO: address eslint error.
          width: rest.style.width,
          height: rest.style.height,
          opacity: 1,
          // TODO: Transition needed
        }}
      >
        {children}
      </ContainWrapper>
    );
  } else {
    return;
  }
}

const Lightbox = forwardRef(LightboxWithRef);
Lightbox.displayName = 'Lightbox';
export {Lightbox};
