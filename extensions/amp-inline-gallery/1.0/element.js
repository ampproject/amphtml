/**
 * @param {!SelectorDef.OptionProps} props
 * @return {PreactDef.Renderable}
 */
import {setProp} from '#core/context';
import * as Preact from '#preact';
import {useContext, useLayoutEffect} from '#preact';
import {CarouselContextProp} from '../../amp-base-carousel/1.0/carousel-props';

export {BentoInlineGallery as Component} from './component';

export const detached = true;

export const props = {
  'loop': {attr: 'loop', type: 'boolean'},
};

/**
 * @param {!SelectorDef.OptionProps} props
 * @return {PreactDef.Renderable}
 */
export function ContextExporter({shimDomElement}) {
  // Consume the `CarouselContext` produced by the `InlineGallery` component
  // and propagate it as a context prop.
  const context = useContext(CarouselContextProp.type);
  useLayoutEffect(() => {
    setProp(shimDomElement, CarouselContextProp, ContextExporter, context);
  }, [shimDomElement, context]);
  return <></>;
}
