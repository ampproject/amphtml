import {CarouselContext} from '#bento/components/bento-base-carousel/1.0/carousel-context';

import * as Preact from '#preact';
import {useContext} from '#preact';
import {Wrapper} from '#preact/component';

import {useStyles} from './pagination.jss';

/**
 * @param {!BentoInlineGalleryDef.PaginationProps} props
 * @return {PreactDef.Renderable}
 */
export function BentoInlineGalleryPagination({inset, ...rest}) {
  const classes = useStyles();
  const {currentSlide, setCurrentSlide, slides} = useContext(CarouselContext);
  const slideCount = slides ? slides.length : 0;
  const Comp = slideCount <= 8 ? Dots : Numbers;
  return (
    <Wrapper
      aria-hidden="true"
      wrapperClassName={`${classes.container} ${inset ? classes.inset : ''}`}
      {...rest}
    >
      <div
        class={`${Comp == Dots ? classes.dots : classes.numbers} ${
          inset ? classes.inset : ''
        }`}
      >
        {inset && (
          <>
            <div
              class={`${classes.insetBaseStyle} ${classes.insetFrosting}`}
            ></div>
            <div
              class={`${classes.insetBaseStyle} ${classes.insetBackdrop}`}
            ></div>
            <div
              class={`${classes.insetBaseStyle} ${classes.insetBackground}`}
            ></div>
          </>
        )}
        <Comp
          currentSlide={currentSlide}
          inset={inset}
          goTo={(i) => setCurrentSlide(i)}
          slideCount={slideCount}
        />
      </div>
    </Wrapper>
  );
}

/**
 * @param {!BentoInlineGalleryDef.PaginationProps} props
 * @return {PreactDef.Renderable}
 */
function Dots({currentSlide, goTo, inset, slideCount}) {
  const classes = useStyles();
  const dotList = [];
  for (let i = 0; i < slideCount; i++) {
    dotList.push(
      <div
        key={i}
        class={`${classes.dotWrapper} ${inset ? classes.inset : ''}`}
      >
        <div class={`${classes.dot} ${inset ? classes.inset : ''}`}>
          <div
            role="button"
            aria-selected={String(i === currentSlide)}
            onClick={() => goTo(i)}
            class={`${classes.dotProgress} ${inset ? classes.inset : ''}`}
            style={{opacity: i === currentSlide ? 1 : 0}}
          ></div>
        </div>
      </div>
    );
  }
  return <>{dotList}</>;
}

/**
 * @param {!BentoInlineGalleryDef.PaginationProps} props
 * @return {PreactDef.Renderable}
 */
function Numbers({currentSlide, inset, slideCount}) {
  const classes = useStyles();
  return (
    <div class={`${classes.numbersWrapper} ${inset ? classes.inset : ''}`}>
      <span>{currentSlide + 1}</span>
      <span> / </span>
      <span>{slideCount}</span>
    </div>
  );
}
