/**
 * Copyright 2021 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {FacebookBaseElement} from './facebook-base-element';

export class BaseElement extends FacebookBaseElement {}

/** @override */
BaseElement['props'] = {
  ...FacebookBaseElement['props'],
  'allowFullScreen': {attr: 'data-allowfullscreen'},
  'embedAs': {attr: 'data-embed-as'},
  'includeCommentParent': {
    attr: 'data-include-comment-parent',
    type: 'boolean',
    default: false,
  },
  'showText': {attr: 'data-show-text'},
  // -comments
  'numPosts': {attr: 'data-numposts'},
  'orderBy': {attr: 'data-order-by'},
  // -comments & -like
  'colorscheme': {attr: 'data-colorscheme'},
  // -like
  'action': {attr: 'data-action'},
  'kdSite': {attr: 'data-kd_site'},
  'layout': {attr: 'data-layout'},
  'refLabel': {attr: 'data-ref'},
  'share': {attr: 'data-share'},
  'size': {attr: 'data-size'},
  // -page
  'hideCover': {attr: 'data-hide-cover'},
  'hideCta': {attr: 'data-hide-cta'},
  'showFacepile': {attr: 'data-show-facepile'},
  'smallHeader': {attr: 'data-small-header'},
  'tabs': {attr: 'data-tabs'},
};
