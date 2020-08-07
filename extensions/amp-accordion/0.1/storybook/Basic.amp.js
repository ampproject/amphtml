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
import {storiesOf} from '@storybook/preact';
import {withA11y} from '@storybook/addon-a11y';
import {withKnobs} from '@storybook/addon-knobs';
import withAmp from '../../../../build-system/tasks/storybook/amp-env/decorator.js';

// eslint-disable-next-line
storiesOf('amp-accordion', module)
  .addDecorator(withKnobs)
  .addDecorator(withA11y)
  .addDecorator(withAmp)
  .addParameters({
    extensions: [
      {name: 'amp-accordion', version: 0.1},
      {name: 'amp-bind', version: 0.1},
    ],
  })
  .add('Basic Accordion', () => {
    return (
      <>
        <script>
          {`
      (self.AMP = self.AMP || []).push(function(AMP) {
        AMP.toggleExperiment('amp-accordion-display-locking', true);
      });`}
        </script>
        <button on="tap:AMP.setState({expandAc1: true})">Expand item 1</button>
        <button on="tap:AMP.setState({expandAc1: false})">
          Collapse item 1
        </button>
        <header class="menu">
          <h3>MENU</h3>
          <nav style={{display: 'flex'}}>
            <amp-accordion id="ac1" animate>
              <section
                id="item1"
                on="expand:ac2.collapse(section='item2'),AMP.setState({expandAc1: true});collapse:AMP.setState({expandAc1: false})"
                data-amp-bind-data-expand="expandAc1"
              >
                <h1>Item 1 (Expanding it closes Item 2)</h1>
                <div>
                  <p>1A</p>
                  <p>1B</p>
                </div>
              </section>
            </amp-accordion>
            <amp-accordion id="ac2" animate>
              <section id="item2" on="expand:ac1.collapse(section='item1')">
                <h1>Item 2 (Expanding it closes Item 1)</h1>
                <div>
                  <p>2A</p>
                  <p>2B</p>
                </div>
              </section>
            </amp-accordion>
          </nav>
        </header>
      </>
    );
  })
  .add('expand-single-section', () => {
    return (
      <amp-accordion expand-single-section>
        <section>
          <h2>Section 1</h2>
          <p>Content in section 1.</p>
        </section>
        <section>
          <h2>Section 2</h2>
          <div>Content in section 2.</div>
        </section>
        <section>
          <h2>Section 3</h2>
          <amp-img
            src="https://amp.dev/static/inline-examples/images/squirrel.jpg"
            width="320"
            height="256"
          ></amp-img>
        </section>
      </amp-accordion>
    );
  });
