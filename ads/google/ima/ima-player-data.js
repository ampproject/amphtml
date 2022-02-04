export class ImaPlayerData {
  /**
   * Create a new ImaPlayerData object.
   */
  constructor() {
    /* {!Number} */
    this.currentTime = 0;

    /* {!Number} */
    this.duration = 1;

    /* {!Array} */
    this.playedRanges = [];
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
