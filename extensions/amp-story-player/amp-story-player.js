// Added autoplay on story load
window.addEventListener('load', () => {
  const player = document.querySelector('amp-story-player');
  if (player && player.play_) {
    player.play_();
  }
});

