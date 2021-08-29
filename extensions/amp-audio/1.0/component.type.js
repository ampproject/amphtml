/** @externs */

/** @const */
var AudioDef = {};

/**
 * @typedef {{
 *   album: (string),
 *   'aria-describedby': (string|undefined),
 *   'aria-label': (string|undefined),
 *   'aria-labelledby': (string|undefined),
 *   artist: (string),
 *   artwork: (string),
 *   autoplay: (boolean),
 *   controlsList: (boolean|undefined),
 *   loading: (string),
 *   loop: (boolean),
 *   muted: (boolean),
 *   preload: (string|undefined),
 *   sources: (?PreactDef.Renderable|undefined),
 *   src: (string|undefined),
 *   title: (string),
 * }}
 */
AudioDef.Props;

/** @interface */
AudioDef.AudioApi = class {
  /**
   * Plays/Resume the audio
   */
  play() {}

  /**
   * Pauses the audio
   */
  pause() {}

  /**
   * Get playing state of audio
   * @return {boolean} Returns true if audio is playing
   */
  isPlaying() {}
};
