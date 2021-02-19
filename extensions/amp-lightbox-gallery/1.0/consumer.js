/**
 * Copyright 2021 The AMP HTML Authors. All Rights Reserved.
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
import {LightboxGalleryContext} from './context';
import {sequentialIdGenerator} from '../../../src/utils/id-generator';
import {
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
} from '../../../src/preact';

const generateLightboxItemKey = sequentialIdGenerator();

const DEFAULT_ARIA_LABEL = 'Open content in a lightbox view.';
const DEFAULT_ACTIVATION_PROPS = {
  'aria-label': DEFAULT_ARIA_LABEL,
  role: 'button',
  tabIndex: '0',
};

/**
 * @param {!LightboxGalleryDef.WithLightboxProps} props
 * @return {PreactDef.Renderable}
 */
export function WithLightbox({
  as: Comp = 'div',
  children,
  enableActivation = true,
  onClick: customOnClick,
  render = () => children,
  ...rest
}) {
  const [genKey] = useState(generateLightboxItemKey);
  const {open, register, deregister} = useContext(LightboxGalleryContext);
  useLayoutEffect(() => {
    register(genKey, render);
    return () => deregister(genKey);
  }, [genKey, deregister, register, render]);

  const activationProps = useMemo(
    () =>
      enableActivation && {
        ...DEFAULT_ACTIVATION_PROPS,
        onClick: () => {
          if (customOnClick) {
            customOnClick();
          }
          open();
        },
      },
    [customOnClick, enableActivation, open]
  );
  return (
    <Comp {...activationProps} {...rest}>
      {children}
    </Comp>
  );
}
