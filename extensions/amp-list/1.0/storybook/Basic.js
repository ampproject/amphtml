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
        throw new Error('example error message');
      }}
    />
  );
};

function delay(ms = 500) {
  return new Promise((r) => setTimeout(r, ms));
}
export const LoadMore = (args) => {
  return (
    <BentoList
      {...args}
      loadMore="manual"
      src="page-1"
      fetchItems={async (url) => {
        if (url === 'page-1') {
          return {items: ['one', 'two', 'three'], 'load-more-src': 'page-2'};
        }
        if (url === 'page-2') {
          await delay();
          return {items: ['four', 'five', 'six'], 'load-more-src': 'page-3'};
        }
        if (url === 'page-3') {
          await delay();
          return {items: ['seven', 'eight', 'nine'], 'load-more-src': null};
        }
      }}
    />
  );
};
