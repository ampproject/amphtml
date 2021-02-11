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
import {Lightbox} from './../../amp-lightbox/1.0/lightbox';
import {LightboxGalleryContext} from './context';
import {
  cloneElement,
  toChildArray,
  useContext,
  useLayoutEffect,
  useRef,
  useState,
} from '../../../src/preact';
import {sequentialIdGenerator} from '../../../src/utils/id-generator';

const generateLightboxItemId = sequentialIdGenerator();

/**
 * @param {!LightboxGalleryDef.Props} props
 * @return {PreactDef.Renderable}
 */
export function LightboxGallery({children}) {
  const lightboxRef = useRef(null);
  const lightboxElements = useRef([]);
  const register = (id, el) => {
    lightboxElements.current[id] = el;
  };
  const deregister = (id) => {
    delete lightboxElements.current[id];
  };
  const context = {
    deregister,
    register,
    open: () => lightboxRef.current.open(),
  };
  return (
    <>
      <Lightbox ref={lightboxRef}>
        {/* TODO: This needs an actual close button UI */}
        <div
          role="button"
          tabindex="0"
          onClick={() => lightboxRef.current.close()}
        >
          Close lightbox
        </div>
        <div>{lightboxElements.current}</div>
      </Lightbox>
      <LightboxGalleryContext.Provider value={context}>
        <WithDeepLightbox>{children}</WithDeepLightbox>
      </LightboxGalleryContext.Provider>
    </>
  );
}

/**
 * @param {!LightboxGalleryDef.LightboxableProps} props
 * @return {PreactDef.Renderable}
 */
function WithLightbox({children, id: propId, ...rest}) {
  const [genId] = useState(generateLightboxItemId);
  const id = propId || genId;
  const {open, register, deregister} = useContext(LightboxGalleryContext);
  useLayoutEffect(() => {
    register(id, children);
    return () => deregister(id);
  }, [children, id, deregister, register]);
  return (
    <div key={id} onClick={() => open()} role="button" tabindex="0" {...rest}>
      {children}
    </div>
  );
}

/**
 * @param {!LightboxGalleryDef.LightboxableProps} props
 * @return {PreactDef.Renderable}
 */
function WithDeepLightbox({children}) {
  return toChildArray(children).map((child) =>
    child.props?.lightbox ? (
      <WithLightbox>{child}</WithLightbox>
    ) : child.props?.children ? (
      cloneElement(
        child,
        null,
        <WithDeepLightbox>{child.props.children}</WithDeepLightbox>
      )
    ) : (
      child
    )
  );
}
