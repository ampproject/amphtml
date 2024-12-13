import objstr from 'obj-str';

import {BentoBaseCarousel} from '#bento/components/bento-base-carousel/1.0/component';
import {BentoLightbox} from '#bento/components/bento-lightbox/1.0/component';

import {mod} from '#core/math';

import * as Preact from '#preact';
import {
  useCallback,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
} from '#preact';
import {forwardRef} from '#preact/compat';

import {PADDING_ALLOWANCE, useStyles} from './component.jss';
import {BentoLightboxGalleryContext} from './context';

/** @const {string} */
const DEFAULT_GROUP = 'default';

/** @const {string} */
const EXPOSED_CAPTION_CLASS = 'amp-lightbox-gallery-caption';

/** @enum {string}  */
const CaptionState = {
  AUTO: 'auto',
  CLIP: 'clip',
  EXPAND: 'expanded',
};

/** @const {!JsonObject<string, string>} */
const CAPTION_PROPS = {
  'aria-label': 'Toggle caption expanded state.',
  'role': 'button',
};

/**
 * @param {!BentoLightboxGalleryDef.Props} props
 * @param {{current: ?LightboxDef.LightboxApi}} ref
 * @return {PreactDef.Renderable}
 */
export function BentoLightboxGalleryProviderWithRef(
  {
    children,
    onAfterClose,
    onAfterOpen,
    onBeforeOpen,
    onToggleCaption,
    onViewGrid,
    render,
  },
  ref
) {
  const classes = useStyles();
  const lightboxRef = useRef(null);
  const carouselRef = useRef(null);
  const [index, setIndex] = useState(0);
  const renderers = useRef({});
  const captions = useRef({});

  // Prefer counting elements over retrieving array lengths because
  // array can contain empty values that have been deregistered.
  const count = useRef({});
  const carouselElements = useRef({});
  const gridElements = useRef({});

  const [showCarousel, setShowCarousel] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [group, setGroup] = useState(null);
  const renderElements = useCallback((opt_group) => {
    const group = opt_group ?? Object.keys(renderers.current)[0];
    if (!group) {
      return;
    }
    if (!carouselElements.current[group]) {
      carouselElements.current[group] = [];
      gridElements.current[group] = [];
      count.current[group] = 0;
    }
    renderers.current[group].forEach((render, index) => {
      if (!carouselElements.current[group][index]) {
        const absoluteIndex = count.current[group];
        carouselElements.current[group][index] = render();
        gridElements.current[group][index] = (
          <Thumbnail
            onClick={() => {
              setShowCarousel(true);
              setIndex(absoluteIndex);
            }}
            render={render}
          />
        );
        count.current[group] += 1;
      }
    });
    setGroup(group);
  }, []);

  const register = useCallback(
    (key, group = DEFAULT_GROUP, render, caption) => {
      // Given key is 1-indexed.
      if (!renderers.current[group]) {
        renderers.current[group] = [];
        captions.current[group] = [];
      }
      renderers.current[group][key - 1] = render;
      captions.current[group][key - 1] = caption;
    },
    []
  );

  const deregister = useCallback((key, group = DEFAULT_GROUP) => {
    // Given key is 1-indexed.
    delete renderers.current[group][key - 1];
    delete captions.current[group][key - 1];
    delete carouselElements.current[group][key - 1];
    count.current[group]--;
  }, []);

  const open = useCallback(
    (opt_index, opt_group) => {
      renderElements(opt_group);
      setShowControls(true);
      setShowCarousel(true);
      if (opt_index != null) {
        setIndex(opt_index);
      }
      lightboxRef.current?.open();
    },
    [renderElements]
  );

  const context = {
    deregister,
    register,
    open,
  };

  const captionRef = useRef(undefined);
  const [caption, setCaption] = useState(null);
  const [captionState, setCaptionState] = useState(CaptionState.AUTO);
  useLayoutEffect(() => {
    carouselRef.current?.goToSlide(index);
    if (group) {
      // This is the index to target accounting for existing empty
      // entries in our render sets. Prefer to account for empty
      // entries over filtering them out to respect the index the nodes
      // were originally registered with by the user.
      const inflatedIndex =
        // Registered element entries, including empty.
        renderers.current[group].length -
        // Registered element entries rendered.
        count.current[group] +
        // Normalized carousel index.
        mod(index, count.current[group]);
      setCaption(captions.current[group][inflatedIndex]);
      setCaptionState(CaptionState.AUTO);
    }
  }, [group, index]);

  useLayoutEffect(() => {
    const {offsetHeight, scrollHeight} = captionRef.current ?? {};
    if (scrollHeight > offsetHeight + PADDING_ALLOWANCE) {
      setCaptionState(CaptionState.CLIP);
    }
  }, [caption]);

  useImperativeHandle(
    ref,
    () => ({
      open,
      close: () => {
        lightboxRef.current?.close();
      },
    }),
    [open]
  );

  return (
    <>
      <BentoLightbox
        class={objstr({
          [classes.lightbox]: true,
          [classes.showControls]: showControls,
          [classes.hideControls]: !showControls,
        })}
        closeButtonAs={CloseButtonIcon}
        onBeforeOpen={onBeforeOpen}
        onAfterOpen={onAfterOpen}
        onAfterClose={onAfterClose}
        ref={lightboxRef}
      >
        <div class={classes.controlsPanel}>
          <ToggleViewIcon
            onClick={() => {
              if (showCarousel) {
                onViewGrid?.();
              }
              setShowCarousel(!showCarousel);
            }}
            showCarousel={showCarousel}
          />
        </div>
        <BentoBaseCarousel
          arrowPrevAs={NavButtonIcon}
          arrowNextAs={NavButtonIcon}
          class={classes.gallery}
          defaultSlide={mod(index, count.current[group]) || 0}
          hidden={!showCarousel}
          loop
          onClick={() => setShowControls(!showControls)}
          onSlideChange={(i) => setIndex(i)}
          ref={carouselRef}
        >
          {carouselElements.current[group]}
        </BentoBaseCarousel>
        <div
          hidden={!showCarousel}
          class={objstr({
            [classes.caption]: true,
            [classes.control]: true,
            [classes[captionState]]: true,
          })}
          ref={captionRef}
          {...(captionState === CaptionState.AUTO
            ? null
            : {
                onClick: () => {
                  onToggleCaption?.();
                  if (captionState === CaptionState.CLIP) {
                    setCaptionState(CaptionState.EXPAND);
                  } else {
                    setCaptionState(CaptionState.CLIP);
                  }
                },
                ...CAPTION_PROPS,
              })}
        >
          <div
            class={objstr({
              [classes.captionText]: true,
              [EXPOSED_CAPTION_CLASS]: true,
            })}
            part="caption"
          >
            {caption}
          </div>
        </div>
        {!showCarousel && (
          <div class={objstr({[classes.gallery]: true, [classes.grid]: true})}>
            {gridElements.current[group]}
          </div>
        )}
      </BentoLightbox>
      <BentoLightboxGalleryContext.Provider value={context}>
        {render ? render() : children}
      </BentoLightboxGalleryContext.Provider>
    </>
  );
}

const BentoLightboxGalleryProvider = forwardRef(
  BentoLightboxGalleryProviderWithRef
);
BentoLightboxGalleryProvider.displayName = 'BentoLightboxGalleryProvider';
export {BentoLightboxGalleryProvider};
/**
 * @param {!LightboxDef.CloseButtonProps} props
 * @return {PreactDef.Renderable}
 */
function CloseButtonIcon({onClick}) {
  const classes = useStyles();
  return (
    <svg
      aria-label="Close the lightbox"
      class={objstr({
        [classes.control]: true,
        [classes.topControl]: true,
        [classes.closeButton]: true,
      })}
      onClick={onClick}
      role="button"
      tabindex="0"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M6.4 6.4 L17.6 17.6 Z M17.6 6.4 L6.4 17.6 Z"
        stroke="#fff"
        stroke-width="2"
        stroke-linejoin="round"
      />
    </svg>
  );
}

/**
 * @param {!BentoBaseCarouselDef.ArrowProps} props
 * @return {PreactDef.Renderable}
 */
function NavButtonIcon({'aria-disabled': ariaDisabled, by, disabled, onClick}) {
  const classes = useStyles();
  return (
    <svg
      aria-disabled={ariaDisabled}
      class={objstr({
        [classes.arrow]: true,
        [classes.control]: true,
        [classes.prevArrow]: by < 0,
        [classes.nextArrow]: by > 0,
      })}
      disabled={disabled}
      onClick={onClick}
      role="button"
      tabindex="0"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d={by < 0 ? 'M14,7.4 L9.4,12 L14,16.6' : 'M10,7.4 L14.6,12 L10,16.6'}
        fill="none"
        stroke="#fff"
        stroke-width="2"
        stroke-linejoin="round"
        stroke-linecap="round"
      />
    </svg>
  );
}

/**
 * @param {!BentoBaseCarouselDef.ArrowProps} props
 * @return {PreactDef.Renderable}
 */
function ToggleViewIcon({onClick, showCarousel}) {
  const classes = useStyles();
  return (
    <svg
      aria-label={
        showCarousel ? 'Switch to grid view' : 'Switch to carousel view'
      }
      class={objstr({
        [classes.control]: true,
        [classes.topControl]: true,
      })}
      onClick={onClick}
      role="button"
      tabindex="0"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      {showCarousel ? (
        <g fill="#fff">
          <rect x="3" y="3" width="6" height="8" rx="1" ry="1" />
          <rect x="15" y="13" width="6" height="8" rx="1" ry="1" />
          <rect x="11" y="3" width="10" height="8" rx="1" ry="1" />
          <rect x="3" y="13" width="10" height="8" rx="1" ry="1" />
        </g>
      ) : (
        <>
          <rect
            x="4"
            y="4"
            width="16"
            height="16"
            rx="1"
            stroke-width="2"
            stroke="#fff"
            fill="none"
          />
          <circle fill="#fff" cx="15.5" cy="8.5" r="1.5" />
          <polygon
            fill="#fff"
            points="5,19 5,13 8,10 13,15 16,12 19,15 19,19"
          />
        </>
      )}
    </svg>
  );
}

/**
 * @param {!BentoLightboxGalleryDef.ThumbnailProps} props
 * @return {PreactDef.Renderable}
 */
function Thumbnail({onClick, render}) {
  const classes = useStyles();
  return (
    <div
      aria-label="View in carousel"
      class={classes.thumbnail}
      onClick={onClick}
      role="button"
      tabindex="0"
    >
      {render()}
    </div>
  );
}
