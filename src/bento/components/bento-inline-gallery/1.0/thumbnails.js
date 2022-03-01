import {CarouselContext} from '#bento/components/bento-base-carousel/1.0/carousel-context';
import {BentoBaseCarousel} from '#bento/components/bento-base-carousel/1.0/component';

import {px} from '#core/dom/style';

import * as Preact from '#preact';
import {
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from '#preact';
import {propName} from '#preact/utils';

import {useStyles} from './thumbnails.jss';

/**
 * @param {!BentoInlineGalleryDef.BentoThumbnailProps} props
 * @return {PreactDef.Renderable}
 */
export function BentoInlineGalleryThumbnails({
  aspectRatio,
  children,
  loop = false,
  [propName('class')]: className = '',
  ...rest
}) {
  const classes = useStyles();
  const [pointerFine, setPointerFine] = useState(false);
  const ref = useRef(null);
  const [height, setHeight] = useState(0);
  const {setCurrentSlide, slides} = useContext(CarouselContext);

  useEffect(() => {
    const win = getWin(ref);
    if (!win) {
      return;
    }
    const mediaQuery = win.matchMedia('(pointer: fine)');
    setPointerFine(mediaQuery.matches);
  }, []);

  // Adjust slides when container size or aspectRatio changes.
  useLayoutEffect(() => {
    const win = getWin(ref);
    if (!win) {
      return;
    }
    const observer = new win.ResizeObserver((entries) => {
      const last = entries[entries.length - 1];
      setHeight(last.contentRect.height);
    });
    observer.observe(ref.current.root);
    return () => observer.disconnect();
  }, [aspectRatio, height]);

  return (
    <BentoBaseCarousel
      class={`${className} ${classes.thumbnails}`}
      mixedLength={true}
      snap={false}
      snapAlign={loop ? 'center' : 'start'}
      controls={pointerFine ? 'always' : 'never'}
      loop={loop}
      ref={ref}
      outsetArrows={true}
      _thumbnails={true}
      {...rest}
    >
      {children ||
        slides.map((slide, i) => {
          const {thumbnailSrc} = slide.props;
          return (
            <img
              class={classes.slide}
              onClick={() => setCurrentSlide(i)}
              loading="lazy"
              role="button"
              src={thumbnailSrc || undefined}
              style={{
                height: px(height),
                width: aspectRatio ? px(aspectRatio * height) : '',
              }}
              tabindex="0"
            />
          );
        })}
    </BentoBaseCarousel>
  );
}

/**
 * @param {{current: (null|{root: Element})}} ref
 * @return {Window|undefined}
 */
function getWin(ref) {
  if (!ref.current) {
    return;
  }
  const node = ref.current.root;
  if (!node) {
    return;
  }
  return node.ownerDocument.defaultView;
}
