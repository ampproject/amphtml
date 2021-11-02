import {loadScript, validateData} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function xlift(global, data) {
  validateData(data, ['mediaid']);

  global.xliftParams = data;
  const d = global.document.createElement('div');
  d.id = '_XL_recommend';
  global.document.getElementById('c').appendChild(d);

  d.addEventListener('SuccessLoadedXliftAd', function (e) {
    e.detail = e.detail || {adSizeInfo: {}};
    global.context.renderStart(e.detail.adSizeInfo);
  });
  d.addEventListener('FailureLoadedXliftAd', function () {
    global.context.noContentAvailable();
  });

  //assign XliftAmpHelper property to global(window)
  global.XliftAmpHelper = null;

  loadScript(
    global,
    'https://cdn.x-lift.jp/resources/common/xlift_amp.js',
    () => {
      if (!global.XliftAmpHelper) {
        global.context.noContentAvailable();
      } else {
        global.XliftAmpHelper.show();
      }
    },
    () => {
      global.context.noContentAvailable();
    }
  );
}
