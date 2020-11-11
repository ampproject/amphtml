/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
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
import {BaseCarousel} from '../../amp-base-carousel/1.0/base-carousel';
import {CarouselContext} from '../../amp-base-carousel/1.0/carousel-context';
import {px} from '../../../src/style';
import {
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from '../../../src/preact';
import {useStyles} from './thumbnails.jss';

/**
 * @param {!InlineGalleryDef.ThumbnailProps} props
 * @return {PreactDef.Renderable}
 */
export function Thumbnails({
  aspectRatio,
  children,
  className = '',
  loop = false,
  ...rest
}) {
  const classes = useStyles();
  const [pointerFine, setPointerFine] = useState(false);
  const ref = useRef(null);
  const [height, setHeight] = useState(0);
  const {slides, setCurrentSlide} = useContext(CarouselContext);

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
    <BaseCarousel
      className={`${className} ${classes.thumbnails}`}
      mixedLength={true}
      snap={false}
      controls={pointerFine ? 'always' : 'never'}
      loop={loop}
      ref={ref}
      _thumbnails={true}
      {...rest}
    >
      {children ||
        slides.map((slide, i) => {
          const {thumbnailSrc} = slide.props;
          return (
            <img
              className={classes.slide}
              onClick={() => setCurrentSlide(i)}
              loading="lazy"
              role="button"
              src={thumbnailSrc || ''}
              style={{
                height: px(height),
                width: aspectRatio ? px(aspectRatio * height) : '',
              }}
              tabindex="0"
            />
          );
        })}
    </BaseCarousel>
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
