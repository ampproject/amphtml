import {VideoEvents} from '../../src/video-interface';

/**
 * @fileoverview
 * Definitions of messages and other utilities to talk to an iframe that embeds
 * the amp-video-iframe integration script.
 * See https://go.amp.dev/c/amp-video-iframe#integration-inside-the-frame
 */

// ⚠️ This module should not have side-effects.

/**
 * Events allowed to be dispatched from messages.
 * @private @const
 */
export const BUBBLE_MESSAGE_EVENTS = [
  VideoEvents.PLAYING,
  VideoEvents.PAUSE,
  VideoEvents.ENDED,
  VideoEvents.MUTED,
  VideoEvents.UNMUTED,
  VideoEvents.AD_START,
  VideoEvents.AD_END,
];
