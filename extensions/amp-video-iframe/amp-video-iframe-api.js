import {VIDEO_EVENTS_ENUM} from '../../src/video-interface';

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
  VIDEO_EVENTS_ENUM.PLAYING,
  VIDEO_EVENTS_ENUM.PAUSE,
  VIDEO_EVENTS_ENUM.ENDED,
  VIDEO_EVENTS_ENUM.MUTED,
  VIDEO_EVENTS_ENUM.UNMUTED,
  VIDEO_EVENTS_ENUM.AD_START,
  VIDEO_EVENTS_ENUM.AD_END,
];
