import {CarouselContextProp} from '#bento/components/bento-base-carousel/1.0/carousel-props';

import {setProp} from '#core/context';

import * as Preact from '#preact';
import {useContext, useLayoutEffect} from '#preact';
import {PreactBaseElement} from '#preact/base-element';

import {BentoInlineGallery} from './component';

export const TAG = 'bento-inline-gallery';

export class BaseElement extends PreactBaseElement {
  /** @override */
  init() {
    return {
      'children': <ContextExporter shimDomElement={this.element} />,
    };
  }
}

/** @override */
BaseElement['Component'] = BentoInlineGallery;

/** @override */
BaseElement['detached'] = true;

/** @override */
BaseElement['props'] = {
  'loop': {attr: 'loop', type: 'boolean'},
};

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
