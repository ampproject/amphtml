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
import {
  AmpInlineGalleryPagination,
  TAG as PAGINATION_TAG,
} from './amp-inline-gallery-pagination';
import {
  AmpInlineGalleryThumbnails,
  TAG as THUMBNAILS_TAG,
} from './amp-inline-gallery-thumbnails';
import {CarouselContextProp} from '../../amp-base-carousel/1.0/carousel-props';
import {InlineGallery} from './inline-gallery';
import {Layout} from '../../../src/layout';
import {PreactBaseElement} from '../../../src/preact/base-element';
import {dict} from '../../../src/utils/object';
import {isExperimentOn} from '../../../src/experiments';
import {setProp} from '../../../src/context';
import {useContext, useLayoutEffect} from '../../../src/preact';
import {userAssert} from '../../../src/log';

/** @const {string} */
const TAG = 'amp-inline-gallery';

class AmpInlineGallery extends PreactBaseElement {
  /** @override */
  init() {
    return dict({
      'children': <ContextExporter shimDomElement={this.element} />,
    });
  }

  /** @override */
  isLayoutSupported(layout) {
    userAssert(
      isExperimentOn(this.win, 'amp-inline-gallery-bento'),
      'expected amp-inline-gallery-bento experiment to be enabled'
    );
    return layout == Layout.CONTAINER;
  }
}

/** @override */
AmpInlineGallery['Component'] = InlineGallery;

/** @override */
AmpInlineGallery['detached'] = true;

/** @override */
AmpInlineGallery['props'] = {
  'loop': {attr: 'loop', type: 'boolean'},
};

AMP.extension(TAG, '1.0', (AMP) => {
  AMP.registerElement(TAG, AmpInlineGallery);
  AMP.registerElement(PAGINATION_TAG, AmpInlineGalleryPagination);
  AMP.registerElement(THUMBNAILS_TAG, AmpInlineGalleryThumbnails);
});

/**
 * @param {!SelectorDef.OptionProps} props
 * @return {PreactDef.Renderable}
 */
function ContextExporter({shimDomElement}) {
  // Consume the `CarouselContext` produced by the `InlineGallery` component
  // and propagate it as a context prop.
  const context = useContext(CarouselContextProp.type);
  useLayoutEffect(() => {
    setProp(shimDomElement, CarouselContextProp, ContextExporter, context);
  }, [shimDomElement, context]);
  return <></>;
}
