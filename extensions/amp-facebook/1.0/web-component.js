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
  customElements.define(TAG, BaseElement.CustomElement(BaseElement));

  defineCommentsElement();
  defineLikeElement();
  definePageElement();
}

/**
 * Register BentoFacebookComments component to CustomElements registry
 */
export function defineCommentsElement() {
  customElements.define(
    COMMENTS_TAG,
    CommentsBaseElement.CustomElement(CommentsBaseElement)
  );
}

/**
 * Register BentoFacebook component to CustomElements registry
 */
export function defineLikeElement() {
  customElements.define(
    LIKE_TAG,
    LikeBaseElement.CustomElement(LikeBaseElement)
  );
}

/**
 * Register BentoFacebook component to CustomElements registry
 */
export function definePageElement() {
  customElements.define(
    PAGE_TAG,
    PageBaseElement.CustomElement(PageBaseElement)
  );
}
