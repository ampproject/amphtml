// @ts-nocheck
import * as Preact from '#preact';
import {ContainWrapper, Wrapper} from '#preact/component';

export default {
  title: '0/Wrappers',
};

export const wrapper = ({ariaLabel, asProp, className, ...args}) => {
  return (
    <Wrapper {...args} as={asProp} class={className} aria-label={ariaLabel}>
      content
    </Wrapper>
  );
};

wrapper.args = {
  asProp: 'span',
  ariaLabel: 'aria Label',
  className: '',
  wrapperClassName: '',
};

wrapper.argTypes = {
  style: {
    name: 'style',
    defaultValue: {border: '1px solid'},
    control: {type: 'object'},
  },
  wrapperStyle: {
    name: 'wrapperStyle',
    control: {type: 'object'},
  },
};

export const containWrapper = ({ariaLabel, asProp, className, ...args}) => {
  return (
    <ContainWrapper
      {...args}
      as={asProp}
      class={className}
      aria-label={ariaLabel}
    >
      content
    </ContainWrapper>
  );
};

containWrapper.args = {
  asProp: 'div',
  ariaLabel: 'aria Label',
  className: '',
  contentClassName: 'content',
  wrapperClassName: '',
  size: true,
  layout: true,
  paint: true,
};

containWrapper.argTypes = {
  style: {
    name: 'style',
    defaultValue: {border: '1px solid', width: 200, height: 50},
    control: {type: 'object'},
  },
  wrapperStyle: {
    name: 'wrapperStyle',
    defaultValue: {padding: 4},
    control: {type: 'object'},
  },
  contentStyle: {
    name: 'contentStyle',
    defaultValue: {border: '1px dotted'},
    control: {type: 'object'},
  },
};
