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
import {
  Accordion,
  AccordionContent,
  AccordionHeader,
  AccordionSection,
} from '../component';
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
        <button onClick={() => ref.current.toggle('section1')}>
          toggle(section1)
        </button>
        <button onClick={() => ref.current.toggle()}>toggle all</button>
        <button onClick={() => ref.current.expand('section1')}>
          expand(section1)
        </button>
        <button onClick={() => ref.current.expand()}>expand all</button>
        <button onClick={() => ref.current.collapse('section1')}>
          collapse(section1)
        </button>
        <button onClick={() => ref.current.collapse()}>collapse all</button>
      </div>
    </section>
  );
}

export const _default = () => {
  const expandSingleSection = boolean('expandSingleSection', false);
  const animate = boolean('animate', false);
  const experimentDisplayLocking = boolean('experimentDisplayLocking', false);
  return (
    <main>
      <AccordionWithActions
        expandSingleSection={expandSingleSection}
        animate={animate}
        experimentDisplayLocking={experimentDisplayLocking}
      >
        <AccordionSection id="section1" key={1}>
          <AccordionHeader>
            <h2>Section 1</h2>
          </AccordionHeader>
          <AccordionContent>Puppies are cute.</AccordionContent>
        </AccordionSection>
        <AccordionSection key={2}>
          <AccordionHeader>
            <h2>Section 2</h2>
          </AccordionHeader>
          <AccordionContent>Kittens are furry.</AccordionContent>
        </AccordionSection>
        <AccordionSection key={3} expanded>
          <AccordionHeader>
            <h2>Section 3</h2>
          </AccordionHeader>
          <AccordionContent>Elephants have great memory.</AccordionContent>
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
        <AccordionSection id="section1" key={1} expanded>
          <AccordionHeader>
            <h2>Section 1</h2>
          </AccordionHeader>
          <AccordionContent>Puppies are cute.</AccordionContent>
        </AccordionSection>
        <AccordionSection
          id="section2"
          key={2}
          onExpandStateChange={(expanded) => {
            if (expanded) {
              ref.current.expand('section3');
            }
          }}
        >
          <AccordionHeader>
            <h2>Section 2</h2>
          </AccordionHeader>
          <AccordionContent>Kittens are furry.</AccordionContent>
        </AccordionSection>
        <AccordionSection
          id="section3"
          key={3}
          onExpandStateChange={(expanded) => {
            if (!expanded) {
              ref.current.collapse('section2');
            }
          }}
        >
          <AccordionHeader>
            <h2>Section 3</h2>
          </AccordionHeader>
          <AccordionContent>Elephants have great memory.</AccordionContent>
        </AccordionSection>
      </Accordion>
      <div style={{marginTop: 8}}>
        <button onClick={() => ref.current.expand('section2')}>
          expand(section2)
        </button>
        <button onClick={() => ref.current.collapse('section3')}>
          collapse(section3)
        </button>
        <button onClick={() => ref.current.toggle()}>toggle all</button>
      </div>
    </section>
  );
}

export const events = () => {
  const expandSingleSection = boolean('expandSingleSection', false);
  const animate = boolean('animate', false);
  const experimentDisplayLocking = boolean('experimentDisplayLocking', false);
  return (
    <main>
      <AccordionWithEvents
        expandSingleSection={expandSingleSection}
        animate={animate}
        experimentDisplayLocking={experimentDisplayLocking}
      ></AccordionWithEvents>
    </main>
  );
};
