import {contextProp} from '#core/context';

import {CarouselContext} from './carousel-context';

const CarouselContextProp = contextProp('base-carousel:1.0:context', {
  type: CarouselContext,
  recursive: true,
  defaultValue: null,
});

export {CarouselContextProp};
