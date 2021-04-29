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
import {withAmp} from '@ampproject/storybook-addon';

export default {
  title: 'amp-accordion-1_0',
  decorators: [withKnobs, withAmp],

  parameters: {
    extensions: [
      {name: 'amp-bind', version: '0.1'},
      {name: 'amp-accordion', version: '1.0'},
    ],
    experiments: ['bento'],
  },
};

export const withAmpBind = () => {
  const expandSingleSection = boolean('expandSingleSection', false);
  const animate = boolean('animate', false);
  return (
    <main>
      <amp-accordion
        expand-single-section={expandSingleSection}
        animate={animate}
      >
        <section data-amp-bind-expanded="section1">
          <h2>Section 1</h2>
          <div>Puppies are cute.</div>
        </section>
        <section data-amp-bind-expanded="section2">
          <h2>Section 2</h2>
          <div>Kittens are furry.</div>
        </section>
        <section data-amp-bind-expanded="section3">
          <h2>Section 3</h2>
          <div>Elephants have great memory.</div>
        </section>
      </amp-accordion>

      <div class="buttons" style={{marginTop: 8}}>
        <button on="tap:AMP.setState({section1: true})">
          Expand Section 1
        </button>
        <button on="tap:AMP.setState({section1: false})">
          Collapse Section 1
        </button>
        <button on="tap:AMP.setState({section2: true})">
          Expand Section 2
        </button>
        <button on="tap:AMP.setState({section2: false})">
          Collapse Section 2
        </button>
        <button on="tap:AMP.setState({section3: true})">
          Expand Section 3
        </button>
        <button on="tap:AMP.setState({section3: false})">
          Collapse Section 3
        </button>
      </div>
    </main>
  );
};
