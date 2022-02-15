import {
  BentoAccordion,
  BentoAccordionContent,
  BentoAccordionHeader,
  BentoAccordionSection,
} from '#bento/components/bento-accordion/1.0/component';

import * as Preact from '#preact';

import '../component.jss';

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
