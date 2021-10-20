import {createContext} from '#preact';

const CarouselContext = createContext(
  /** @type {BentoBaseCarouselDef.ContextProps} */ ({
    slides: [],
    setSlides: (unusedSlides) => {},
  })
);
export {CarouselContext};
