import {loadScript, validateData, writeScript} from '#3p/3p';

import {doubleclick} from '#ads/google/doubleclick';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function pulsepoint(global, data) {
  // TODO: check mandatory fields
  validateData(data, [], ['pid', 'tagid', 'tagtype', 'slot', 'timeout']);
  if (data.tagtype === 'hb') {
    headerBidding(global, data);
  } else {
    tag(global, data);
  }
}

/**
 * @param {!Window} global
 * @param {!Object} data
 */
function tag(global, data) {
  writeScript(
    global,
    'https://tag.contextweb.com/getjs.aspx?action=VIEWAD' +
      '&cwpid=' +
      encodeURIComponent(data.pid) +
      '&cwtagid=' +
      encodeURIComponent(data.tagid) +
      '&cwadformat=' +
      encodeURIComponent(data.width + 'X' + data.height)
  );
}

/**
 * @param {!Window} global
 * @param {!Object} data
 */
function headerBidding(global, data) {
  loadScript(global, 'https://ads.contextweb.com/ht.js', () => {
    const hbConfig = {
      timeout: data.timeout || 1000,
      slots: [
        {
          cp: data.pid,
          ct: data.tagid,
          cf: data.width + 'x' + data.height,
          placement: data.slot,
          elementId: 'c',
        },
      ],
      done(targeting) {
        doubleclick(global, {
          width: data.width,
          height: data.height,
          slot: data.slot,
          targeting: targeting[data.slot],
        });
      },
    };
    new window.PulsePointHeaderTag(hbConfig).init();
  });
}
