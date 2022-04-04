import {BentoFacebook} from '#bento/components/bento-facebook/1.0/component';

import * as Preact from '#preact';

export default {
  title: 'Facebook',
  component: BentoFacebook,
};

const SAMPLE_HREFS = {
  'post':
    'https://www.facebook.com/NASA/photos/a.67899501771/10159193669016772/',
  'video': 'https://www.facebook.com/NASA/videos/846648316199961/',
  'comment':
    'https://www.facebook.com/NASA/photos/a.67899501771/10159193669016772/?comment_id=10159193676606772',
};

export const _default = ({frenchLocale, ...args}) => {
  const locale = frenchLocale ? 'fr_FR' : undefined;
  return (
    <BentoFacebook
      href={SAMPLE_HREFS[args.embedAs]}
      locale={locale}
      style={{width: '400px', height: '400px'}}
      {...args}
    >
      This text is inside.
    </BentoFacebook>
  );
};

_default.args = {
  frenchLocale: false,
  embedAs: 'post',
  allowFullScreen: false,
  showText: false,
  includeCommentParent: false,
};

_default.argTypes = {
  embedAs: {
    control: {type: 'select'},
    options: ['post', 'video', 'comment'],
  },
  showText: {
    name: 'showText (video only)',
  },
  includeCommentParent: {
    name: 'includeCommentParent (comment only)',
  },
};

export const Comments = ({frenchLocale, orderByTime, ...args}) => {
  const orderBy = orderByTime ? 'time' : undefined;
  const locale = frenchLocale ? 'fr_FR' : undefined;
  return (
    <BentoFacebook
      embedAs="comments"
      locale={locale}
      orderBy={orderBy}
      style={{width: '400px', height: '400px'}}
      {...args}
    ></BentoFacebook>
  );
};

Comments.args = {
  href: 'http://www.directlyrics.com/adele-25-complete-album-lyrics-news.html',
  numPosts: 5,
  orderByTime: false,
  frenchLocale: false,
};

export const Like = ({frenchLocale, ...args}) => {
  const locale = frenchLocale ? 'fr_FR' : undefined;
  return (
    <BentoFacebook
      embedAs="like"
      locale={locale}
      style={{width: '800px', height: '400px'}}
      {...args}
    />
  );
};

Like.args = {
  frenchLocale: false,
  href: 'https://www.facebook.com/nasa/',
  kdSite: false,
  size: 'small',
  refLabel: '',
  share: false,
};

Like.argTypes = {
  layout: {
    name: 'layout',
    control: {type: 'select'},
    options: ['standard', 'button_count', 'button', 'box_count'],
  },
  colorscheme: {
    name: 'colorscheme (broken)',
    control: {type: 'select'},
    options: ['light', 'dark'],
  },
  action: {
    name: 'action',
    control: {type: 'select'},
    options: ['like', 'recommend'],
  },
  size: {
    name: 'size',
    control: {type: 'select'},
    options: ['large', 'small'],
  },
};

export const Page = ({frenchLocale, ...args}) => {
  const locale = frenchLocale ? 'fr_FR' : undefined;
  return (
    <BentoFacebook
      embedAs="page"
      locale={locale}
      style={{width: '400px', height: '400px'}}
      {...args}
    ></BentoFacebook>
  );
};

Page.args = {
  frenchLocale: false,
  href: 'https://www.facebook.com/nasa/',
  hideCover: false,
  hideCta: false,
  smallHeader: false,
  showFacepile: true,
  tabs: 'timeline',
};

Page.argTypes = {
  tabs: {
    control: {type: 'inline-check'},
    options: ['timeline', 'events', 'messages'],
  },
};
