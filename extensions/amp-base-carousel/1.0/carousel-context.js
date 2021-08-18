
import {createContext} from '#preact';

const CarouselContext = createContext(
  /** @type {BaseCarouselDef.ContextProps} */ ({
    slides: [],
    setSlides: (unusedSlides) => {},
  })
);
export {CarouselContext};
