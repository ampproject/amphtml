import {validateData, writeScript} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function innity(global, data) {
  validateData(data, ['pub', 'zone'], ['channel']);
  writeScript(global, 'https://cdn.innity.net/admanager.js', () => {
    const innityAMPZone = global.innity_adZone;
    const innityAMPTag = new innityAMPZone(
      encodeURIComponent(data.pub),
      encodeURIComponent(data.zone),
      {
        width: data.width,
        height: data.height,
        channel: data.channel ? encodeURIComponent(data.channel) : '',
      }
    );
    // AMP handling or noContentAvailable
    innityAMPTag.amp(global.context);
    // else renderStart (with at least house ad)
    global.context.renderStart();
  });
}
