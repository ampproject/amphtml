import * as Preact from '#preact';
import {
  boolean,
  optionsKnob,
  select,
  text,
  withKnobs,
} from '@storybook/addon-knobs';
import {withAmp} from '@ampproject/storybook-addon';

export default {
  title: 'amp-facebook-1_0',
  decorators: [withKnobs, withAmp],

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

export const Default = () => {
  const embedAs = select('embed type', ['post', 'video', 'comment'], 'post');
  const href = SAMPLE_HREFS[embedAs];
  const allowFullScreen = boolean('allowfullscreen', false);
  const locale = boolean('french locale') ? 'fr_FR' : undefined;
  const showText = boolean('show text (video only)', false);
  const includeCommentParent = boolean(
    'include comment parent (comment only)',
    false
  );
  return (
    <amp-facebook
      data-allowfullscreen={allowFullScreen}
      data-embed-as={embedAs}
      data-href={href}
      data-include-comment-parent={includeCommentParent}
      data-locale={locale}
      data-show-text={showText}
      width="300"
      height="200"
      layout="responsive"
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

export const FacebookComments = () => {
  const embedAs = optionsKnob(
    'use as',
    {
      'amp-facebook-comments': 'amp-facebook-comments',
      'amp-facebook data-embed-as="comments':
        'amp-facebook data-embed-as="comments',
    },
    'amp-facebook-comments',
    {display: 'radio'}
  );
  const href = text(
    'data-href',
    'http://www.directlyrics.com/adele-25-complete-album-lyrics-news.html'
  );
  const numPosts = boolean('show 5 comments max') ? 5 : undefined;
  const orderBy = boolean('order by time') ? 'time' : undefined;
  const locale = boolean('french locale') ? 'fr_FR' : undefined;
  return embedAs === 'amp-facebook-comments' ? (
    <amp-facebook-comments
      width="486"
      height="657"
      layout="responsive"
      data-href={href}
      data-locale={locale}
      data-numposts={numPosts}
      data-order-by={orderBy}
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
      data-href={href}
      data-locale={locale}
      data-numposts={numPosts}
      data-order-by={orderBy}
    >
      <div placeholder>
        <h1>Placeholder</h1>
      </div>
    </amp-facebook>
  );
};

export const FacebookLike = () => {
  const embedAs = optionsKnob(
    'use as',
    {
      'amp-facebook-like': 'amp-facebook-like',
      'amp-facebook data-embed-as="like': 'amp-facebook data-embed-as="like',
    },
    'amp-facebook-like',
    {display: 'radio'}
  );
  const href = text('href', 'https://www.facebook.com/nasa/');
  const locale = boolean('french locale') ? 'fr_FR' : undefined;

  const action = select('action', ['like', 'recommend'], undefined);
  const colorscheme = select(
    'colorscheme (broken)',
    ['light', 'dark'],
    undefined
  );
  const kdSite = boolean('kd_site') || undefined;
  const layout = select(
    'layout',
    ['standard', 'button_count', 'button', 'box_count'],
    undefined
  );
  const refLabel = text('ref', undefined);
  const share = boolean('share') ? 'true' : undefined;
  const size = select('size (small by default)', ['large', 'small'], undefined);
  return embedAs === 'amp-facebook-like' ? (
    <amp-facebook-like
      width="400"
      height="600"
      data-href={href}
      data-locale={locale}
      data-action={action}
      data-colorscheme={colorscheme}
      data-kd_site={kdSite}
      data-layout={layout}
      data-ref={refLabel}
      data-share={share}
      data-size={size}
    ></amp-facebook-like>
  ) : (
    <amp-facebook
      data-embed-as="like"
      width="400"
      height="600"
      data-href={href}
      data-locale={locale}
      data-action={action}
      data-colorscheme={colorscheme}
      data-kd_site={kdSite}
      data-layout={layout}
      data-ref={refLabel}
      data-share={share}
      data-size={size}
    ></amp-facebook>
  );
};

export const FacebookPage = () => {
  const embedAs = optionsKnob(
    'use as',
    {
      'amp-facebook-page': 'amp-facebook-page',
      'amp-facebook data-embed-as="page"': 'amp-facebook data-embed-as="page"',
    },
    'amp-facebook-page',
    {display: 'radio'}
  );
  const href = text('href', 'https://www.facebook.com/nasa/');
  const locale = boolean('french locale') ? 'fr_FR' : undefined;

  const hideCover = boolean('hide cover') ? 'true' : undefined;
  const hideCta = boolean('hide cta') ? 'true' : undefined;
  const smallHeader = boolean('small header') ? 'true' : undefined;
  const showFacepile = boolean('show facepile') ? undefined : 'false';
  const tabs = optionsKnob(
    'tabs',
    {timeline: 'timeline', events: 'events', messages: 'messages'},
    undefined,
    {display: 'inline-check'}
  );

  return embedAs === 'amp-facebook-page' ? (
    <amp-facebook-page
      width="400"
      height="600"
      data-href={href}
      data-locale={locale}
      data-hide-cover={hideCover}
      date-hide-cta={hideCta}
      data-small-header={smallHeader}
      data-show-facepile={showFacepile}
      data-tabs={tabs}
    ></amp-facebook-page>
  ) : (
    <amp-facebook
      data-embed-as="page"
      width="400"
      height="600"
      data-href={href}
      data-locale={locale}
      data-hide-cover={hideCover}
      date-hide-cta={hideCta}
      data-small-header={smallHeader}
      data-show-facepile={showFacepile}
      data-tabs={tabs}
    ></amp-facebook>
  );
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
