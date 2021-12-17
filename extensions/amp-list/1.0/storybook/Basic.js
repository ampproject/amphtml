import * as Preact from '#preact';

import {BentoList} from '../component/component';

export default {
  title: 'List',
  component: BentoList,
  args: {
    wrapper: (list) => <ol>{list}</ol>,
    template: (item) => <li>{item.toUpperCase()}</li>,
  },
};

export const SimpleList = (args) => {
  return (
    <BentoList
      {...args}
      fetchJson={async () => ({items: ['one', 'two', 'three']})}
    />
  );
};
export const LoadingState = (args) => {
  return (
    <BentoList
      {...args}
      fetchJson={async () => {
        await new Promise(() => {});
      }}
    />
  );
};
export const ErrorState = (args) => {
  return (
    <BentoList
      {...args}
      fetchJson={async () => {
        throw new Error('Failed to fetch');
      }}
    />
  );
};
