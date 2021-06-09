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
import * as Preact from '../../../src/preact';
import {BaseCarousel} from './../../amp-base-carousel/1.0/component';
import {Lightbox} from './../../amp-lightbox/1.0/component';
import {LightboxGalleryContext} from './context';
import {useCallback, useRef, useState} from '../../../src/preact';
import {useStyles} from './component.jss';
import objStr from 'obj-str';

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
  const lightboxElements = useRef([]);
  const register = (key, render) => {
    renderers.current[key] = render;
  };
  const deregister = (key) => {
    delete lightboxElements.current[key];
    delete renderers.current[key];
  };
  const context = {
    deregister,
    register,
    open: (genKey) => {
      setIndex(genKey);
      lightboxRef.current.open();
    },
  };

  const [showControls, setShowControls] = useState(true);
  const renderElements = useCallback(() => {
    renderers.current.forEach((render, index) => {
      if (!lightboxElements.current[index]) {
        lightboxElements.current[index] = render();
      }
    });
  }, []);

  return (
    <>
      <Lightbox
        className={objStr({
          [classes.lightbox]: true,
          [classes.showControls]: showControls,
          [classes.hideControls]: !showControls,
        })}
        closeButtonAs={CloseButtonIcon}
        onBeforeOpen={() => renderElements()}
        onAfterOpen={() => setShowControls(true)}
        onClick={() => setShowControls(!showControls)}
        ref={lightboxRef}
      >
        <div className={classes.controlsPanel}></div>
        <BaseCarousel
          arrowPrevAs={NavButtonIcon}
          arrowNextAs={NavButtonIcon}
          className={classes.gallery}
          defaultSlide={index}
          loop
          ref={carouselRef}
        >
          {lightboxElements.current}
        </BaseCarousel>
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
      className={objStr({
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
      className={objStr({
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
