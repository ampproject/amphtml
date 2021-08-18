export class ImaPlayerData {
  /**
   * Create a new ImaPlayerData object.
   *
   * @param {number} currentTime
   * @param {number} duration
   * @param {!Array} playedRanges
   */
  constructor(currentTime = 0, duration = 1, playedRanges = []) {
    /* {!Number} */
    this.currentTime = currentTime;

    /* {!Number} */
    this.duration = duration;

    /* {!Array} */
    this.playedRanges = playedRanges;
  }

  /**
   * Update from the provided video player.
   *
   * @param {!Element} videoPlayer
   */
  update(videoPlayer) {
    this.currentTime = videoPlayer.currentTime;
    this.duration = videoPlayer.duration;

    // Adapt videoPlayer.played for the playedRanges format AMP wants.
    const {played} = videoPlayer;
    const {length} = played;
    this.playedRanges = [];
    for (let i = 0; i < length; i++) {
      this.playedRanges.push([played.start(i), played.end(i)]);
    }
  }
}

/**
 * Unique identifier for messages from the implementation iframe with data
 * about the player.
 * @const
 */
ImaPlayerData.IMA_PLAYER_DATA = 'imaPlayerData';
