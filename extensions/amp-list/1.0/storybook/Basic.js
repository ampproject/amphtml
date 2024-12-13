import * as Preact from '#preact';
import {useState} from '#preact';

import {BentoList} from '../component';

export default {
  title: 'List',
  component: BentoList,
  args: {},
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
        await new Promise((unusedResolve) => {});
      }}
    />
  );
};
export const ErrorState = (args) => {
  return (
    <BentoList
      {...args}
      fetchJson={async () => {
        throw new Error('example error message');
      }}
    />
  );
};

function delay(ms = 250) {
  return new Promise((r) => setTimeout(r, ms));
}
export const LoadMore = (args) => {
  const fetchJson = async (url) => {
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
    <BentoList {...args} loadMore="manual" src="page-1" fetchJson={fetchJson} />
  );
};

const fetchJsonInfinite = async (url) => {
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
        fetchJson={fetchJsonInfinite}
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
        Here, <code>viewportBuffer = -0.3</code> so items stop loading at the
        bottom of the viewport.
        <br />
        Total number of pages loaded: {pages}
      </header>
      <BentoList
        {...args}
        loadMore="auto"
        src="Page 1"
        fetchJson={fetchJsonInfinite}
        viewportBuffer={-0.3}
        wrapper={(list) => {
          setPages(list.length); // Track the total size
          return <div>{list}</div>;
        }}
      />
      <p>{lorem}</p>
    </>
  );
};

export const ChangingProps = (args) => {
  // Simulate an API with a lot of options
  const fetchJson = async (url) => {
    await delay(1000);

    const gen = (length, create) =>
      new Array(length).fill(null).map((_, i) => create(i));

    // eslint-disable-next-line prefer-const
    let [source, start, count] = url.split(',');
    start = Number(start || 0);
    count = Number(count || 2);
    const nextUrl = [source, start + count, count].join(',');
    const nextUrl10 = [source, start + count, 10].join(',');
    return {
      popularity: gen(
        26,
        (i) => `${source} > popularity > item ${i + 1}`
      ).slice(start, start + count),
      alphabetical: gen(
        26,
        (i) =>
          `${source} > alphabetical > item ${String.fromCharCode(
            'A'.charCodeAt(0) + i
          )}`
      ).slice(start, start + count),
      'load-more-src': nextUrl,
      'load-10': nextUrl10,
    };
  };

  const srcOptions = ['url-1', 'url-2', 'url-3'];
  const [src, setSrc] = useState(srcOptions[0]);

  const itemsKeyOptions = ['popularity', 'alphabetical'];
  const [itemsKey, setItemsKey] = useState(itemsKeyOptions[0]);

  const loadMoreBookmarkOptions = ['load-more-src', 'load-10'];
  const [loadMoreBookmark, setLoadMoreBookmark] = useState(
    loadMoreBookmarkOptions[0]
  );

  return (
    <>
      <fieldset>
        <legend>src: </legend>
        <select onChange={(e) => setSrc(e.currentTarget.value)}>
          {srcOptions.map((opt) => (
            <option key={opt}>{opt}</option>
          ))}
        </select>{' '}
        <span>
          Changing this will cause the list to reset from the beginning
        </span>
      </fieldset>
      <fieldset>
        <legend>loadMoreBookmark: </legend>
        <select onChange={(e) => setLoadMoreBookmark(e.currentTarget.value)}>
          {loadMoreBookmarkOptions.map((opt) => (
            <option key={opt}>{opt}</option>
          ))}
        </select>{' '}
        <span>
          Changing this will cause the list to reset from the beginning
        </span>
      </fieldset>
      <fieldset>
        <legend>itemsKey: </legend>
        <select onChange={(e) => setItemsKey(e.currentTarget.value)}>
          {itemsKeyOptions.map((opt) => (
            <option key={opt}>{opt}</option>
          ))}
        </select>{' '}
        <span>
          Changing this will update instantly, because the data does not need to
          be refetched.
        </span>
      </fieldset>
      <BentoList
        {...args}
        src={src}
        itemsKey={itemsKey}
        fetchJson={fetchJson}
        loadMore={'auto'}
        loadMoreBookmark={loadMoreBookmark}
      />
    </>
  );
};
