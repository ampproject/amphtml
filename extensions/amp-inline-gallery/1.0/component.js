import * as Preact from '#preact';
import {CarouselContext} from '../../amp-base-carousel/1.0/carousel-context';
import {ContainWrapper} from '#preact/component';
import {useMemo, useState} from '#preact';

/**
 * @param {!InlineGalleryDef.Props} props
 * @return {PreactDef.Renderable}
 */
export function InlineGallery({children, ...rest}) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slides, setSlides] = useState([]);
  const carouselContext = useMemo(
    () => ({
      currentSlide,
      setCurrentSlide,
      slides,
      setSlides,
    }),
    [currentSlide, slides]
  );
  return (
    <ContainWrapper size={false} layout={true} {...rest}>
      <CarouselContext.Provider value={carouselContext}>
        {children}
      </CarouselContext.Provider>
    </ContainWrapper>
  );
}
