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

import * as Preact from '../../../../src/preact';
import {StreamGallery} from '../stream-gallery';
import {boolean, number, select, withKnobs} from '@storybook/addon-knobs';
import {withA11y} from '@storybook/addon-a11y';

const CONTROLS = ['auto', 'always', 'never'];

export default {
  title: 'StreamGallery',
  component: StreamGallery,
  decorators: [withA11y, withKnobs],
};

/**
 * @param {!Object} props
 * @return {*}
 */
function CarouselWithActions(props) {
  // TODO(#30447): replace imperative calls with "button" knobs when the
  // Storybook 6.1 is released.
  const ref = Preact.useRef();
  return (
    <section>
      <StreamGallery ref={ref} {...props} />
      <div style={{marginTop: 8}}>
        <button onClick={() => ref.current.goToSlide(3)}>goToSlide(3)</button>
        <button onClick={() => ref.current.next()}>next</button>
        <button onClick={() => ref.current.prev()}>prev</button>
      </div>
    </section>
  );
}

export const _default = () => {
  const width = number('width', 735);
  const height = number('height', 225);
  const slideCount = number('slide count', 5, {min: 0, max: 99});
  const extraSpace = boolean('extra space around?', true);
  const controls = select('controls', CONTROLS);
  const loop = boolean('loop', true);
  const snap = boolean('snap', true);
  const slideAlign = select('slide align', ['start', 'center']);
  const minItemWidth = number('min item width', 130, {min: 1});
  const maxItemWidth = number('max item width', 180, {min: 1});
  const minVisibleCount = number('min visible count', 3, {min: 1});
  const maxVisibleCount = number('max visible count', 5, {min: 1});
  const peek = number('peek', 0, {min: 1});
  const outsetArrows = boolean('outset arrows', true);
  const colorIncrement = Math.floor(255 / (slideCount + 1));
  return (
    <>
      <CarouselWithActions
        extraSpace={extraSpace ? 'around' : ''}
        controls={controls}
        loop={loop}
        slideAlign={slideAlign}
        snap={snap}
        outsetArrows={outsetArrows}
        minItemWidth={minItemWidth}
        maxItemWidth={maxItemWidth}
        minVisibleCount={minVisibleCount}
        maxVisibleCount={maxVisibleCount}
        peek={peek}
        style={{width, height}}
      >
        {Array.from({length: slideCount}, (_, i) => {
          const v = colorIncrement * (i + 1);
          return (
            <div
              style={{
                backgroundColor: `rgb(${v}, 100, 100)`,
                width,
                height,
              }}
            ></div>
          );
        })}
      </CarouselWithActions>
    </>
  );
};
