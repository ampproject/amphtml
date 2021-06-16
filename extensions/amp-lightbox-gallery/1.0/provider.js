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
import {BaseCarousel} from './../../amp-base-carousel/1.0/component';
import {Lightbox} from './../../amp-lightbox/1.0/component';
import {LightboxGalleryContext} from './context';
import {mod} from '#core/math';
import {useCallback, useLayoutEffect, useRef, useState} from '#preact';
import {useStyles} from './component.jss';
import objstr from 'obj-str';

/**
 * @param {!LightboxGalleryDef.Props} props
 * @return {PreactDef.Renderable}
 */
export function LightboxGalleryProvider({children, render}) {
  const classes = useStyles();
  const lightboxRef = useRef(null);
  const carouselRef = useRef(null);
  const [index, setIndex] = useState(0);
  const renderers = useRef([]);
  const carouselElements = useRef([]);
  const gridElements = useRef([]);
  const register = (key, render) => {
    // Given key is 1-indexed.
    renderers.current[key - 1] = render;
  };
  const deregister = (key) => {
    // Given key is 1-indexed.
    delete renderers.current[key - 1];
  };
  const context = {
    deregister,
    register,
    open: (index) => {
      setShowCarousel(true);
      setIndex(index);
      lightboxRef.current.open();
    },
  };

  useLayoutEffect(() => {
    carouselRef.current?.goToSlide(index);
  }, [index]);

  const [showCarousel, setShowCarousel] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const renderElements = useCallback(() => {
    // Prefer counting elements over retrieving array length because
    // array can contain empty values that have been deregistered.
    let count = 0;
    renderers.current.forEach((render, index) => {
      if (!carouselElements.current[index]) {
        carouselElements.current[index] = render();
        gridElements.current[index] = (
          <Thumbnail
            onClick={() => {
              setShowCarousel(true);
              setIndex(mod(index, count));
            }}
            render={render}
          />
        );
        count++;
      }
    });
  }, []);

  return (
    <>
      <Lightbox
        className={objstr({
          [classes.lightbox]: true,
          [classes.showControls]: showControls,
          [classes.hideControls]: !showControls,
        })}
        closeButtonAs={CloseButtonIcon}
        onBeforeOpen={() => renderElements()}
        onAfterOpen={() => setShowControls(true)}
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
          defaultSlide={index}
          hidden={!showCarousel}
          loop
          onClick={() => setShowControls(!showControls)}
          ref={carouselRef}
        >
          {showCarousel && carouselElements.current}
        </BaseCarousel>
        {!showCarousel && (
          <div
            className={objstr({[classes.gallery]: true, [classes.grid]: true})}
          >
            {gridElements.current}
          </div>
        )}
      </Lightbox>
      <LightboxGalleryContext.Provider value={context}>
        {render ? render() : children}
      </LightboxGalleryContext.Provider>
    </>
  );
}

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
      aria-label={`Switch to ${showCarousel ? 'grid view' : 'carousel view'}`}
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
