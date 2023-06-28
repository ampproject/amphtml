import {loadScript, scriptURLSafeByReview, validateData} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function admanmedia(global, data) {
  validateData(data, ['id']);

  const encodedId = encodeURIComponent(data.id);
  loadScript(
    global,
    scriptURLSafeByReview(`https://pub.admanmedia.com/go?id=${encodedId}`, 'legacy'),
    () => {
      global.context.renderStart();
    },
    () => {
      global.context.noContentAvailable();
    }
  );
}
