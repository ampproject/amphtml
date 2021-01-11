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
import {boolean, withKnobs} from '@storybook/addon-knobs';
import {withA11y} from '@storybook/addon-a11y';
import {withAmp} from '@ampproject/storybook-addon';

export default {
  title: 'amp-accordion-1_0',
  decorators: [withKnobs, withA11y, withAmp],

  parameters: {
    extensions: [{name: 'amp-accordion', version: '1.0'}],
    experiments: ['bento', 'amp-accordion-display-locking'],
  },
};

export const withDisplayLocking = () => {
  const expandSingleSection = boolean('expandSingleSection', false);
  const animate = boolean('animate', false);
  return (
    <main>
      <amp-accordion
        id="accordion"
        expand-single-section={expandSingleSection}
        animate={animate}
      >
        <section id="section1">
          <h2>Section 1</h2>
          <div>Puppies are cute.</div>
        </section>
        <section>
          <h2>Section 2</h2>
          <div>Kittens are furry.</div>
        </section>
        <section expanded>
          <h2>Section 3</h2>
          <div>Elephants have great memory.</div>
        </section>
      </amp-accordion>

      <div class="buttons" style={{marginTop: 8}}>
        <button on="tap:accordion.toggle(section='section1')">
          toggle(section1)
        </button>
        <button on="tap:accordion.toggle()">toggle all</button>
        <button on="tap:accordion.expand(section='section1')">
          expand(section1)
        </button>
        <button on="tap:accordion.expand()">expand all</button>
        <button on="tap:accordion.collapse(section='section1')">
          collapse(section1)
        </button>
        <button on="tap:accordion.collapse()">collapse all</button>
      </div>
    </main>
  );
};
