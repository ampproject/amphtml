<<<<<<< HEAD
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

import {boolean, withKnobs} from '@storybook/addon-knobs';

=======
>>>>>>> b306580617... ♻️ Use Storybook `args` (second round) (#35930)
import * as Preact from '#preact';

import {
  BentoAccordion,
  BentoAccordionContent,
  BentoAccordionHeader,
  BentoAccordionSection,
} from '../component';

export default {
  title: 'Accordion',
  component: BentoAccordion,
  args: {
    expandSingleSection: false,
    animate: false,
  },
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
      <BentoAccordion ref={ref} {...props} />
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

export const _default = (args) => {
  return (
    <main>
      <AccordionWithActions {...args}>
        <BentoAccordionSection id="section1" key={1}>
          <BentoAccordionHeader>
            <h2>Section 1</h2>
          </BentoAccordionHeader>
          <BentoAccordionContent>Puppies are cute.</BentoAccordionContent>
        </BentoAccordionSection>
        <BentoAccordionSection key={2}>
          <BentoAccordionHeader>
            <h2>Section 2</h2>
          </BentoAccordionHeader>
          <BentoAccordionContent>Kittens are furry.</BentoAccordionContent>
        </BentoAccordionSection>
        <BentoAccordionSection key={3} expanded>
          <BentoAccordionHeader>
            <h2>Section 3</h2>
          </BentoAccordionHeader>
          <BentoAccordionContent>
            Elephants have great memory.
          </BentoAccordionContent>
        </BentoAccordionSection>
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
      <BentoAccordion ref={ref} {...props}>
        <BentoAccordionSection id="section1" key={1} expanded>
          <BentoAccordionHeader>
            <h2>Section 1</h2>
          </BentoAccordionHeader>
          <BentoAccordionContent>Puppies are cute.</BentoAccordionContent>
        </BentoAccordionSection>
        <BentoAccordionSection
          id="section2"
          key={2}
          onExpandStateChange={(expanded) => {
            if (expanded) {
              ref.current.expand('section3');
            }
          }}
        >
          <BentoAccordionHeader>
            <h2>Section 2</h2>
          </BentoAccordionHeader>
          <BentoAccordionContent>Kittens are furry.</BentoAccordionContent>
        </BentoAccordionSection>
        <BentoAccordionSection
          id="section3"
          key={3}
          onExpandStateChange={(expanded) => {
            if (!expanded) {
              ref.current.collapse('section2');
            }
          }}
        >
          <BentoAccordionHeader>
            <h2>Section 3</h2>
          </BentoAccordionHeader>
          <BentoAccordionContent>
            Elephants have great memory.
          </BentoAccordionContent>
        </BentoAccordionSection>
      </BentoAccordion>
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

export const events = (args) => {
  return (
    <main>
      <AccordionWithEvents {...args}></AccordionWithEvents>
    </main>
  );
};
