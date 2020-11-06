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
import {Accordion, AccordionSection} from '../accordion';
import {boolean, withKnobs} from '@storybook/addon-knobs';
import {withA11y} from '@storybook/addon-a11y';

export default {
  title: 'Accordion',
  component: Accordion,
  decorators: [withA11y, withKnobs],
};

/**
 * @param {!Object} props
 * @return {*}
 */
function AccordionWithActions(props) {
  // TODO(#30447): replace imperative calls with "button" knobs when the
  // Storybook 6.1 is released.
  const ref = Preact.useRef();
  return (
    <section>
      <Accordion ref={ref} {...props} />
      <div style={{marginTop: 8}}>
        <button onClick={() => ref.current./*OK*/ toggle('section1')}>
          toggle(section1)
        </button>
        <button onClick={() => ref.current./*OK*/ toggle()}>toggle all</button>
        <button onClick={() => ref.current./*OK*/ expand('section1')}>
          expand(section1)
        </button>
        <button onClick={() => ref.current./*OK*/ expand()}>expand all</button>
        <button onClick={() => ref.current./*OK*/ collapse('section1')}>
          collapse(section1)
        </button>
        <button onClick={() => ref.current./*OK*/ collapse()}>
          collapse all
        </button>
      </div>
    </section>
  );
}

export const _default = () => {
  const expandSingleSection = boolean('expandSingleSection', false);
  const animate = boolean('animate', false);
  return (
    <main>
      <AccordionWithActions
        expandSingleSection={expandSingleSection}
        animate={animate}
      >
        <AccordionSection id="section1" key={1} header={<h2>Section 1</h2>}>
          <p>Content in section 1.</p>
        </AccordionSection>
        <AccordionSection key={2} header={<h2>Section 2</h2>}>
          <div>Content in section 2.</div>
        </AccordionSection>
        <AccordionSection key={3} expanded header={<h2>Section 3</h2>}>
          <div>Content in section 3.</div>
        </AccordionSection>
      </AccordionWithActions>
    </main>
  );
};

/**
 * @param {!Object} props
 * @return {*}
 */
function AccordionWithEvents(props) {
  // TODO(#30447): replace imperative calls with "button" knobs when the
  // Storybook 6.1 is released.
  const ref = Preact.useRef();
  return (
    <section>
      <Accordion ref={ref} {...props}>
        <AccordionSection
          id="section1"
          key={1}
          expanded
          header={<h2>Section 1</h2>}
        >
          <p>Content in section 1.</p>
        </AccordionSection>
        <AccordionSection
          id="section2"
          key={2}
          header={<h2>Section 2</h2>}
          onExpandStateChange={(expanded) => {
            if (expanded) {
              ref.current./*OK*/ expand('section3');
            }
          }}
        >
          <div>Content in section 2.</div>
        </AccordionSection>
        <AccordionSection
          id="section3"
          key={3}
          header={<h2>Section 3</h2>}
          onExpandStateChange={(expanded) => {
            if (!expanded) {
              ref.current./*OK*/ collapse('section2');
            }
          }}
        >
          <div>Content in section 3.</div>
        </AccordionSection>
      </Accordion>
      <div style={{marginTop: 8}}>
        <button onClick={() => ref.current./*OK*/ expand('section2')}>
          expand(section2)
        </button>
        <button onClick={() => ref.current./*OK*/ collapse('section3')}>
          collapse(section3)
        </button>
        <button onClick={() => ref.current./*OK*/ toggle()}>toggle all</button>
      </div>
    </section>
  );
}

export const events = () => {
  const expandSingleSection = boolean('expandSingleSection', false);
  const animate = boolean('animate', false);
  return (
    <main>
      <AccordionWithEvents
        expandSingleSection={expandSingleSection}
        animate={animate}
      ></AccordionWithEvents>
    </main>
  );
};
