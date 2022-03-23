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
 * @param {typeof globalThis=} win
 */
export function defineElement(win) {
  defineBentoElement(TAG, BaseElement, win);

  defineCommentsElement(win);
  defineLikeElement(win);
  definePageElement(win);
}

/**
 * Register BentoFacebookComments component to CustomElements registry
 * @param {typeof globalThis=} win
 */
export function defineCommentsElement(win) {
  defineBentoElement(COMMENTS_TAG, CommentsBaseElement, win);
}

/**
 * Register BentoFacebook component to CustomElements registry
 * @param {typeof globalThis=} win
 */
export function defineLikeElement(win) {
  defineBentoElement(LIKE_TAG, LikeBaseElement, win);
}

/**
 * Register BentoFacebook component to CustomElements registry
 * @param {typeof globalThis=} win
 */
export function definePageElement(win) {
  defineBentoElement(PAGE_TAG, PageBaseElement, win);
}
