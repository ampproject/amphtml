import * as Preact from '#preact';

import {BentoList} from '../component/component';

export default {
  title: 'List',
  component: BentoList,
  args: {},
};

export const SimpleList = (args) => {
  return (
    <BentoList
      {...args}
      fetchItems={async () => ({items: ['one', 'two', 'three']})}
    />
  );
};
export const LoadingState = (args) => {
  return (
    <BentoList
      {...args}
      fetchItems={async () => {
        await new Promise(() => {});
      }}
    />
  );
};
export const ErrorState = (args) => {
  return (
    <BentoList
      {...args}
      fetchItems={async () => {
        throw new Error('Failed to fetch');
      }}
    />
  );
};
