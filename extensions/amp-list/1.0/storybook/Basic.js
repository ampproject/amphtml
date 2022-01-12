import * as Preact from '#preact';
import {useState} from '#preact';

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

function delay(ms = 250) {
  return new Promise((r) => setTimeout(r, ms));
}
export const LoadMore = (args) => {
  const fetchItems = async (url) => {
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
  };

  return (
    <BentoList
      {...args}
      loadMore="manual"
      src="page-1"
      fetchItems={fetchItems}
    />
  );
};

const fetchItemsInfinite = async (url) => {
  await delay();
  // Increment the URL:
  const nextPage = url.replace(/\d+/, ($0) => String(Number($0) + 1));
  return {items: [url], 'load-more-src': nextPage};
};
const lorem = `Lorem ipsum dolor sit amet, consectetur adipisicing elit. Autem deserunt eligendi ex exercitationem expedita magnam pariatur quae quas qui vitae. Commodi culpa ducimus et nulla numquam obcaecati officiis recusandae vel vitae? Ab commodi culpa cupiditate doloremque ea eius, enim eos et excepturi modi nam obcaecati odit optio quam quidem quo quod reiciendis saepe soluta suscipit tempora ullam voluptatum. Accusantium amet inventore, ipsa modi, molestias natus nostrum nulla omnis quas recusandae rem reprehenderit repudiandae, sint totam voluptas voluptate voluptates? Aperiam cupiditate deleniti facilis maiores nostrum obcaecati omnis pariatur, quae quibusdam rerum tempore totam voluptatum! Ab alias dolore dolores eligendi facere libero nihil non odio tempora? Accusantium asperiores aspernatur at beatae corporis culpa delectus, dicta doloremque doloribus dolorum eaque error exercitationem harum in minus modi nesciunt, nisi nobis nulla odit pariatur praesentium provident quas quia quo quos recusandae reiciendis sapiente suscipit tempora tenetur velit voluptates voluptatum? A aperiam architecto aspernatur beatae deleniti eius enim facilis fuga ipsa laudantium libero mollitia nihil nostrum nulla, omnis quae recusandae sequi veritatis. Consectetur cum dignissimos, exercitationem ipsum libero magnam natus numquam officiis, quos recusandae sit ullam ut? Ad, aliquam atque deleniti, dolor dolorum est facilis id inventore ipsa magnam porro quasi quos similique vel velit voluptate?`;

export const InfiniteScrollSimple = (args) => {
  const [pages, setPages] = useState(0);
  return (
    <>
      <header
        style={{
          position: 'sticky',
          top: '0',
          background: 'white',
          border: '1px solid currentColor',
        }}
      >
        Items continue to load until the end of the list is off-screen (plus a
        buffer).
        <br />
        The default viewport buffer is 2 viewports tall, so a lot of items will
        be loaded! <br />
        Total number of pages loaded: {pages}
      </header>

      <BentoList
        {...args}
        loadMore="auto"
        src="Page 1"
        fetchItems={fetchItemsInfinite}
        wrapper={(list) => {
          setPages(list.length); // Track the total size
          return <div>{list}</div>;
        }}
      />
      <p>{lorem}</p>
    </>
  );
};

export const InfiniteScrollTest = (args) => {
  const [pages, setPages] = useState(0);

  return (
    <>
      <header
        style={{
          position: 'sticky',
          top: '0',
          background: 'white',
          border: '1px solid currentColor',
        }}
      >
        Here, <code>viewportBuffer = 0</code> so items stop loading at the
        bottom of the viewport.
        <br />
        Total number of pages loaded: {pages}
      </header>
      <BentoList
        {...args}
        loadMore="auto"
        src="Page 1"
        fetchItems={fetchItemsInfinite}
        viewportBuffer={0}
        wrapper={(list) => {
          setPages(list.length); // Track the total size
          return <div>{list}</div>;
        }}
      />
      <p>{lorem}</p>
    </>
  );
};
