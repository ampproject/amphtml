import {defineBentoElement} from '#preact/bento-ce';

import {
  BaseElement,
  COMMENTS_TAG,
  CommentsBaseElement,
  LIKE_TAG,
  LikeBaseElement,
  PAGE_TAG,
  PageBaseElement,
  TAG,
} from './base-element';

/**
 *Register BentoFacebook component to CustomElements registry
 */
export function defineElement() {
  defineBentoElement(TAG, BaseElement);

  defineCommentsElement();
  defineLikeElement();
  definePageElement();
}

/**
 * Register BentoFacebookComments component to CustomElements registry
 */
export function defineCommentsElement() {
  defineBentoElement(COMMENTS_TAG, CommentsBaseElement);
}

/**
 * Register BentoFacebook component to CustomElements registry
 */
export function defineLikeElement() {
  defineBentoElement(LIKE_TAG, LikeBaseElement);
}

/**
 * Register BentoFacebook component to CustomElements registry
 */
export function definePageElement() {
  defineBentoElement(PAGE_TAG, PageBaseElement);
}
