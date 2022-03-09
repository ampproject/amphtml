import {
  BentoAccordion,
  BentoAccordionContent,
  BentoAccordionHeader,
  BentoAccordionSection,
} from '#bento/components/bento-accordion/1.0/component';
import {BentoInstagram} from '#bento/components/bento-instagram/1.0/component';

import * as Preact from '#preact';

export default {
  title: 'Instagram',
  component: BentoInstagram,
  args: {
    width: 500,
    height: 600,
    shortcode: 'B8QaZW4AQY_',
    captioned: false,
  },
};

export const _default = ({height, width, ...args}) => {
  return (
    <BentoInstagram
      style={{width, height}}
      alt="Bento Instagram Storybook Preact Example"
      {...args}
    ></BentoInstagram>
  );
};

export const InsideAccordion = ({height, width, ...args}) => {
  return (
    <BentoAccordion expandSingleSection>
      <BentoAccordionSection key={1} expanded={true}>
        <BentoAccordionHeader>
          <h2>Post</h2>
        </BentoAccordionHeader>
        <BentoAccordionContent>
          <BentoInstagram
            style={{width, height}}
            alt="Bento Instagram Storybook Preact Example"
            {...args}
          ></BentoInstagram>
        </BentoAccordionContent>
      </BentoAccordionSection>
    </BentoAccordion>
  );
};
