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

import * as Preact from '#preact';
import {LightboxGalleryContext} from './context';
import {
  cloneElement,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
} from '#preact';
import {sequentialIdGenerator} from '#core/data-structures/id-generator';
import {toChildArray} from '#preact/compat';

const generateLightboxItemKey = sequentialIdGenerator();

/** @const {string} */
const DEFAULT_ARIA_LABEL = 'Open content in a lightbox view.';

/** @const {!Object<string, *>} */
const DEFAULT_ACTIVATION_PROPS = {
  'aria-label': DEFAULT_ARIA_LABEL,
  role: 'button',
  tabIndex: 0,
};

/**
 *
 * @param {!PreactDef.Renderable} child
 * @return {!PreactDef.Renderable}
 */
const CLONE_CHILD = (child) => cloneElement(child);

/**
 * @param {!LightboxGalleryDef.WithLightboxProps} props
 * @return {PreactDef.Renderable}
 */
export function WithLightbox({
  as: Comp = 'div',
  children,
  enableActivation = true,
  group,
  render: renderProp,
  srcset,
  ...rest
}) {
  const [genKey] = useState(generateLightboxItemKey);
  const {deregister, open, register} = useContext(LightboxGalleryContext);
  const render = useCallback(() => {
    if (renderProp) {
      return renderProp();
    }
    if (children) {
      return toChildArray(children).map(CLONE_CHILD);
    }
    return <Comp srcset={srcset} />;
  }, [children, renderProp, srcset]);

  useLayoutEffect(() => {
    register(genKey, group, render);
    return () => deregister(genKey, group);
  }, [genKey, group, deregister, register, render]);

  const activationProps = useMemo(
    () =>
      enableActivation && {
        ...DEFAULT_ACTIVATION_PROPS,
        /* genKey is 1-indexed, gallery is 0-indexed */
        onClick: () => open(Number(genKey) - 1, group),
      },
    [enableActivation, genKey, group, open]
  );

  return (
    <Comp {...activationProps} srcset={srcset} {...rest}>
      {children}
    </Comp>
  );
}
