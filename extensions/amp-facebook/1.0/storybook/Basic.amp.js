import {withAmp} from '@ampproject/storybook-addon';

import * as Preact from '#preact';

export default {
  title: 'amp-facebook-1_0',
  decorators: [withAmp],
  parameters: {
    extensions: [{name: 'amp-facebook', version: '1.0'}],
    experiments: ['bento'],
  },
};

const SAMPLE_HREFS = {
  'post':
    'https://www.facebook.com/NASA/photos/a.67899501771/10159193669016772/',
  'video': 'https://www.facebook.com/NASA/videos/846648316199961/',
  'comment':
    'https://www.facebook.com/NASA/photos/a.67899501771/10159193669016772/?comment_id=10159193676606772',
};

export const Default = ({frenchLocale, ...args}) => {
  const dataHref = SAMPLE_HREFS[args['data-embed-as']];
  const dataLocale = frenchLocale ? 'fr_FR' : undefined;
  return (
    <amp-facebook
      data-href={dataHref}
      data-locale={dataLocale}
      width="300"
      height="200"
      layout="responsive"
      {...args}
    >
      <div placeholder style="background:red">
        Placeholder. Loading content...
      </div>

      <div fallback style="background:blue">
        Fallback. Could not load content...
      </div>
    </amp-facebook>
  );
};

Default.args = {
  frenchLocale: false,
  'data-embed-as': 'post',
  'data-allowfullscreen': false,
  'data-show-text': false,
  'data-include-comment-parent': false,
};

Default.argTypes = {
  'data-embed-as': {
    control: {type: 'select'},
    options: ['post', 'video', 'comment'],
  },
  'data-show-text': {
    name: 'data-show-text (video only)',
  },
  'data-include-comment-parent': {
    name: 'data-include-comment-parent (comment only)',
  },
};

export const FacebookComments = ({
  embedAs,
  frenchLocale,
  orderByTime,
  showFiveMax,
  ...args
}) => {
  const dataLocale = frenchLocale ? 'fr_FR' : undefined;
  const dataNumPosts = showFiveMax ? 5 : undefined;
  const dataOrderBy = orderByTime ? 'time' : undefined;
  return embedAs === 'amp-facebook-comments' ? (
    <amp-facebook-comments
      width="486"
      height="657"
      layout="responsive"
      data-locale={dataLocale}
      data-numposts={dataNumPosts}
      data-order-by={dataOrderBy}
      {...args}
    >
      <div placeholder>
        <h1>Placeholder</h1>
      </div>
    </amp-facebook-comments>
  ) : (
    <amp-facebook
      data-embed-as="comments"
      width="486"
      height="657"
      layout="responsive"
      data-locale={dataLocale}
      data-numposts={dataNumPosts}
      data-order-by={dataOrderBy}
      {...args}
    >
      <div placeholder>
        <h1>Placeholder</h1>
      </div>
    </amp-facebook>
  );
};

FacebookComments.args = {
  embedAs: 'amp-facebook-comments',
  'data-href':
    'http://www.directlyrics.com/adele-25-complete-album-lyrics-news.html',
  'data-numposts': 5,
  orderByTime: false,
  frenchLocale: false,
};

FacebookComments.argTypes = {
  embedAs: {
    control: {type: 'radio'},
    options: ['amp-facebook-comments', 'amp-facebook data-embed-as="comments'],
  },
};

export const FacebookLike = ({embedAs, frenchLocale, ...args}) => {
  const dataLocale = frenchLocale ? 'fr_FR' : undefined;

  return embedAs === 'amp-facebook-like' ? (
    <amp-facebook-like
      width="400"
      height="600"
      data-locale={dataLocale}
      {...args}
    ></amp-facebook-like>
  ) : (
    <amp-facebook
      data-embed-as="like"
      width="400"
      height="600"
      data-locale={dataLocale}
      {...args}
    ></amp-facebook>
  );
};

FacebookLike.args = {
  embedAs: 'amp-facebook-like',
  frenchLocale: false,
  'data-href': 'https://www.facebook.com/nasa/',
  'data-kd_site': false,
  'data-size': 'small',
  'data-ref': '',
  'data-share': false,
};

FacebookLike.argTypes = {
  embedAs: {
    control: {type: 'radio'},
    options: ['amp-facebook-like', 'amp-facebook data-embed-as="like'],
  },
  'data-layout': {
    name: 'data-layout',
    control: {type: 'select'},
    options: ['standard', 'button_count', 'button', 'box_count'],
  },
  'data-colorscheme': {
    name: 'data-colorscheme (broken)',
    control: {type: 'select'},
    options: ['light', 'dark'],
  },
  'data-action': {
    name: 'data-action',
    control: {type: 'select'},
    options: ['like', 'recommend'],
  },
  'data-size': {
    name: 'data-size',
    control: {type: 'select'},
    options: ['large', 'small'],
  },
};

export const FacebookPage = ({
  embedAs,
  frenchLocale,
  hideCover,
  hideCta,
  showFacepile,
  smallHeader,
  ...args
}) => {
  const dataLocale = frenchLocale ? 'fr_FR' : undefined;
  const dataHideCover = hideCover ? 'true' : undefined;
  const dataHideCta = hideCta ? 'true' : undefined;
  const dataSmallHeader = smallHeader ? 'true' : undefined;
  const dataShowFacepile = showFacepile ? undefined : 'false';

  return embedAs === 'amp-facebook-page' ? (
    <amp-facebook-page
      width="400"
      height="600"
      data-locale={dataLocale}
      data-hide-cover={dataHideCover}
      data-hide-cta={dataHideCta}
      data-small-header={dataSmallHeader}
      data-show-facepile={dataShowFacepile}
      {...args}
    ></amp-facebook-page>
  ) : (
    <amp-facebook
      data-embed-as="page"
      width="400"
      height="600"
      data-locale={dataLocale}
      data-hide-cover={dataHideCover}
      data-hide-cta={dataHideCta}
      data-small-header={dataSmallHeader}
      data-show-facepile={dataShowFacepile}
      {...args}
    ></amp-facebook>
  );
};

FacebookPage.args = {
  embedAs: 'amp-facebook-page',
  frenchLocale: false,
  'data-href': 'https://www.facebook.com/nasa/',
  'data-hide-cover': false,
  'date-hide-cta': false,
  'data-small-header': false,
  'data-show-facepile': true,
  'data-tabs': 'timeline',
};

FacebookPage.argTypes = {
  embedAs: {
    control: {type: 'radio'},
    options: ['amp-facebook-page', 'amp-facebook data-embed-as="page'],
  },
  'data-tabs': {
    control: {type: 'inline-check'},
    options: ['timeline', 'events', 'messages'],
  },
};

export const InvalidEmbedType = () => {
  return (
    <amp-facebook
      width="400"
      height="600"
      data-embed-as="spaghetti"
    ></amp-facebook>
  );
};
