import {BentoDailymotion} from './component';
import {VideoBaseElement} from '../../amp-video/1.0/video-base-element';

export class BaseElement extends VideoBaseElement {}

/** @override */
BaseElement['Component'] = BentoDailymotion;

/** @override */
BaseElement['props'] = {
  'autoplay': {attr: 'autoplay', type: 'boolean'},
  'videoid': {attr: 'data-videoid'},
  'mute': {attr: 'data-mute', type: 'boolean'},
  'endscreenEnable': {attr: 'data-endscreen-enable', type: 'boolean'},
  'sharingEnable': {attr: 'data-sharing-enable', type: 'boolean'},
  'start': {attr: 'data-start'},
  'uiHighlight': {attr: 'data-ui-highlight'},
  'uiLogo': {attr: 'data-ui-logo', type: 'boolean'},
  'info': {attr: 'data-info', type: 'boolean'},
  'implicitParams': {attrPrefix: 'data-param-'},
};

/** @override */
BaseElement['layoutSizeDefined'] = true;

/** @override */
BaseElement['usesShadowDom'] = true;
