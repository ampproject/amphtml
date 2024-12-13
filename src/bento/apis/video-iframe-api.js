import {VideoEvents_Enum} from '../../video-interface';

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
  VideoEvents_Enum.PLAYING,
  VideoEvents_Enum.PAUSE,
  VideoEvents_Enum.ENDED,
  VideoEvents_Enum.MUTED,
  VideoEvents_Enum.UNMUTED,
  VideoEvents_Enum.AD_START,
  VideoEvents_Enum.AD_END,
];
