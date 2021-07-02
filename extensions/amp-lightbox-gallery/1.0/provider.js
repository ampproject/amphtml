/**
 * Copyright 2021 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import * as Preact from '#preact';
import {BaseCarousel} from '../../amp-base-carousel/1.0/component';
import {Lightbox} from '../../amp-lightbox/1.0/component';
import {LightboxGalleryContext} from './context';
import {PADDING_ALLOWANCE, useStyles} from './component.jss';
import {forwardRef} from '#preact/compat';
import {mod} from '#core/math';
import {
  useCallback,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
} from '#preact';
import objstr from 'obj-str';

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
 * @param {!LightboxGalleryDef.Props} props
 * @param {{current: ?LightboxDef.LightboxApi}} ref
 * @return {PreactDef.Renderable}
 */
export function LightboxGalleryProviderWithRef(
  {children, onAfterClose, onAfterOpen, onBeforeOpen, render},
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
      <Lightbox
        className={objstr({
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
        <div className={classes.controlsPanel}>
          <ToggleViewIcon
            onClick={() => setShowCarousel(!showCarousel)}
            showCarousel={showCarousel}
          />
        </div>
        <BaseCarousel
          arrowPrevAs={NavButtonIcon}
          arrowNextAs={NavButtonIcon}
          className={classes.gallery}
          defaultSlide={mod(index, count.current[group]) || 0}
          hidden={!showCarousel}
          loop
          onClick={() => setShowControls(!showControls)}
          onSlideChange={(i) => setIndex(i)}
          ref={carouselRef}
        >
          {carouselElements.current[group]}
        </BaseCarousel>
        <div
          hidden={!showCarousel}
          className={objstr({
            [classes.caption]: true,
            [classes.control]: true,
            [classes[captionState]]: true,
            [EXPOSED_CAPTION_CLASS]: true,
          })}
          ref={captionRef}
          {...(captionState === CaptionState.AUTO
            ? null
            : {
                onClick: () => {
                  if (captionState === CaptionState.CLIP) {
                    setCaptionState(CaptionState.EXPAND);
                  } else {
                    setCaptionState(CaptionState.CLIP);
                  }
                },
                ...CAPTION_PROPS,
              })}
        >
          <div className={classes.captionText}>{caption}</div>
        </div>
        {!showCarousel && (
          <div
            className={objstr({[classes.gallery]: true, [classes.grid]: true})}
          >
            {gridElements.current[group]}
          </div>
        )}
      </Lightbox>
      <LightboxGalleryContext.Provider value={context}>
        {render ? render() : children}
      </LightboxGalleryContext.Provider>
    </>
  );
}

const LightboxGalleryProvider = forwardRef(LightboxGalleryProviderWithRef);
LightboxGalleryProvider.displayName = 'LightboxGalleryProvider';
export {LightboxGalleryProvider};
/**
 * @param {!LightboxDef.CloseButtonProps} props
 * @return {PreactDef.Renderable}
 */
function CloseButtonIcon(props) {
  const classes = useStyles();
  return (
    <svg
      {...props}
      aria-label="Close the lightbox"
      className={objstr({
        [classes.control]: true,
        [classes.topControl]: true,
        [classes.closeButton]: true,
      })}
      role="button"
      tabIndex="0"
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
 * @param {!BaseCarouselDef.ArrowProps} props
 * @return {PreactDef.Renderable}
 */
function NavButtonIcon({by, ...rest}) {
  const classes = useStyles();
  return (
    <svg
      {...rest}
      className={objstr({
        [classes.arrow]: true,
        [classes.control]: true,
        [classes.prevArrow]: by < 0,
        [classes.nextArrow]: by > 0,
      })}
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
 * @param {!BaseCarouselDef.ArrowProps} props
 * @return {PreactDef.Renderable}
 */
function ToggleViewIcon({showCarousel, ...rest}) {
  const classes = useStyles();
  return (
    <svg
      aria-label={
        showCarousel ? 'Switch to grid view' : 'Switch to carousel view'
      }
      className={objstr({
        [classes.control]: true,
        [classes.topControl]: true,
      })}
      role="button"
      tabIndex="0"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      {...rest}
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
 * @param {!LightboxGalleryDef.ThumbnailProps} props
 * @return {PreactDef.Renderable}
 */
function Thumbnail({onClick, render}) {
  const classes = useStyles();
  return (
    <div
      aria-label="View in carousel"
      className={classes.thumbnail}
      onClick={onClick}
      role="button"
    >
      {render()}
    </div>
  );
}
