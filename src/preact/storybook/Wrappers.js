import {boolean, object, text, withKnobs} from '@storybook/addon-knobs';

import * as Preact from '#preact';
import {ContainWrapper, Wrapper} from '#preact/component';

export default {
  title: '0/Wrappers',
  decorators: [withKnobs],
};

export const wrapper = () => {
  const asProp = text('As', 'span');
  const className = text('className', '');
  const style = object('style', {border: '1px solid'});
  const wrapperClassName = text('wrapperClassName', '');
  const wrapperStyle = object('wrapperStyle', {});
  const ariaLabel = text('ariaLabel', 'aria label');
  return (
    <Wrapper
      as={asProp}
      class={className}
      style={style}
      wrapperClassName={wrapperClassName}
      wrapperStyle={wrapperStyle}
      aria-label={ariaLabel}
    >
      content
    </Wrapper>
  );
};

export const containWrapper = () => {
  const asProp = text('As', 'div');
  const className = text('className', '');
  const style = object('style', {border: '1px solid', width: 200, height: 50});
  const wrapperClassName = text('wrapperClassName', '');
  const wrapperStyle = object('wrapperStyle', {padding: 4});
  const contentClassName = text('contentClassName', 'content');
  const contentStyle = object('contentStyle', {border: '1px dotted'});
  const size = boolean('size', true);
  const layout = boolean('layout', true);
  const paint = boolean('paint', true);
  const ariaLabel = text('ariaLabel', 'aria label');
  return (
    <ContainWrapper
      as={asProp}
      class={className}
      style={style}
      wrapperClassName={wrapperClassName}
      wrapperStyle={wrapperStyle}
      contentClassName={contentClassName}
      contentStyle={contentStyle}
      size={size}
      layout={layout}
      paint={paint}
      aria-label={ariaLabel}
    >
      content
    </ContainWrapper>
  );
};
