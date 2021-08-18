

import * as Preact from '#preact';
import {CarouselContextProp} from '../../amp-base-carousel/1.0/carousel-props';
import {InlineGallery} from './component';
import {PreactBaseElement} from '#preact/base-element';
import {dict} from '#core/types/object';
import {setProp} from '#core/context';
import {useContext, useLayoutEffect} from '#preact';

export class BaseElement extends PreactBaseElement {
  /** @override */
  init() {
    return dict({
      'children': <ContextExporter shimDomElement={this.element} />,
    });
  }
}

/** @override */
BaseElement['Component'] = InlineGallery;

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
