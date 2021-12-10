import {PreactBaseElement} from '#preact/base-element';
import {
  Component,
  commentsStaticProps,
  layoutSizeDefined,
  likeStaticProps,
  loadable,
  pageStaticProps,
  props,
  usesShadowDom,
} from './element';

/** @const {string} */
export const TAG = 'bento-facebook';
export const COMMENTS_TAG = 'bento-facebook-comments';
export const LIKE_TAG = 'bento-facebook-like';
export const PAGE_TAG = 'bento-facebook-page';

export class BaseElement extends PreactBaseElement {}

/** @override */
BaseElement['Component'] = Component;

/** @override */
BaseElement['loadable'] = loadable;

/** @override */
BaseElement['props'] = props;

/** @override */
BaseElement['layoutSizeDefined'] = layoutSizeDefined;

/** @override */
BaseElement['usesShadowDom'] = usesShadowDom;

export class CommentsBaseElement extends BaseElement {}
/** @override */
CommentsBaseElement['staticProps'] = commentsStaticProps;

export class LikeBaseElement extends BaseElement {}
/** @override */
LikeBaseElement['staticProps'] = likeStaticProps;

export class PageBaseElement extends BaseElement {}
/** @override */
PageBaseElement['staticProps'] = pageStaticProps;
