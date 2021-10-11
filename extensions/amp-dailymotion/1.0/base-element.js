import {BentoDailymotion} from './component';
import {VideoBaseElement} from '../../amp-video/1.0/video-base-element';

export class BaseElement extends VideoBaseElement {}

/** @override */
BaseElement['Component'] = BentoDailymotion;

/** @override */
BaseElement['props'] = {
  'autoplay': {attr: 'autoplay', type: 'boolean'},
  'videoid': {attr: 'data-videoid'},
  'mute': {attr: 'data-mute'},
  'endscreenEnable': {attr: 'data-endscreen-enable'},
  'sharingEnable': {attr: 'data-sharing-enable'},
  'start': {attr: 'data-start'},
  'uiHighlight': {attr: 'data-ui-highlight'},
  'uiLogo': {attr: 'data-ui-logo'},
  'info': {attr: 'data-info'},
  'implicitParams': {attrPrefix: 'data-param-'},
};

/** @override */
BaseElement['layoutSizeDefined'] = true;

/** @override */
BaseElement['usesShadowDom'] = true;
