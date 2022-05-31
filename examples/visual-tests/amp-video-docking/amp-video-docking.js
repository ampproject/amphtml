'use strict';

const {
  verifySelectorsVisible,
} = require('../../../build-system/tasks/visual-diff/verifiers');

function toggleScrollable(page, toggle) {
  return page.evaluate((toggle) => {
    if (toggle) {
      document.querySelector('html').style.removeProperty('overflow');
    } else {
      document.querySelector('html').style.overflow = 'hidden';
    }
  }, toggle);
}

async function scroll(page, _, target = 'bottom') {
  await toggleScrollable(page, true);

  await page.tap(`#scroll-${target}-button`);

  // Scrolling takes 500ms as defined by the runtime, and leeway.
  await page.waitForTimeout(700);

  // Ensures that scrollbar is hidden before capture.
  await toggleScrollable(page, false);
}

async function dock(page, name) {
  await page.tap('#play-button');
  await page.waitForTimeout(200); // active playback
  await scroll(page);
  await verifySelectorsVisible(page, name, ['.amp-video-docked-shadow']);
}

async function activateControlsBy(page, name, tapOrHover) {
  if (tapOrHover == 'hover') {
    await page.hover('.i-amphtml-video-docked-overlay');
  } else {
    await page.tap('.i-amphtml-video-docked-overlay');
  }
  await verifySelectorsVisible(page, name, ['.amp-video-docked-controls']);
}

const testControlsActivatedBy = (tapOrHover) => ({
  [`displays dock controls (controls on ${tapOrHover})`]: async (
    page,
    name
  ) => {
    await dock(page);
    await activateControlsBy(page, name, tapOrHover);
  },

  [`toggles controls button into paused (controls on ${tapOrHover})`]: async (
    page,
    name
  ) => {
    await dock(page, name);
    await activateControlsBy(page, name, tapOrHover);
    await page.tap('.amp-video-docked-pause');
  },

  [`toggles controls button into playing (controls on ${tapOrHover})`]: async (
    page,
    name
  ) => {
    await dock(page, name);
    await activateControlsBy(page, name, tapOrHover);
    await page.tap('.amp-video-docked-pause');
    await page.tap('.amp-video-docked-play');
  },

  [`toggles controls button into muted (controls on ${tapOrHover})`]: async (
    page,
    name
  ) => {
    await dock(page, name);
    await activateControlsBy(page, name, tapOrHover);
    await page.tap('.amp-video-docked-mute');
  },

  [`toggles controls button into unmuted (controls on ${tapOrHover})`]: async (
    page,
    name
  ) => {
    await dock(page, name);
    await activateControlsBy(page, name, tapOrHover);
    await page.tap('.amp-video-docked-mute');
    await page.tap('.amp-video-docked-unmute');
  },

  // TODO(#32684, @ampproject/wg-components): fix flaky test.
  // See https://percy.io/ampproject/amphtml/builds/8876280/changed/503549685
  // [`displays scrollback button on ad (controls on ${tapOrHover})`]: async (
  //   page,
  //   name
  // ) => {
  //   await dock(page, name);
  //   await activateControlsBy(page, name, tapOrHover);
  //   await verifySelectorsVisible(page, name, [
  //     '.amp-video-docked-control-set-scroll-back',
  //   ]);
  // },
});

module.exports = {
  "doesn't dock when not playing": scroll,

  'docks when playing': dock,

  'undocks when scrolling back': async (page, name) => {
    await dock(page, name);
    await scroll(page, name, 'video');
  },

  ...testControlsActivatedBy('hover'),
  ...testControlsActivatedBy('tap'),
};
