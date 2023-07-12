import {validateData} from '#3p/3p';

import {hasOwn} from '#core/types/object';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function spotx(global, data) {
  // ensure we have valid channel id
  validateData(data, ['spotx_channel_id', 'width', 'height']);

  // Because 3p's loadScript does not allow for data attributes,
  // we will write the JS tag ourselves.
  const script = global.document.createElement('script');

  data['spotx_content_width'] = data.spotx_content_width || data.width;
  data['spotx_content_height'] = data.spotx_content_height || data.height;
  data['spotx_content_page_url'] =
    global.context.location.href || global.context.sourceUrl;

  // Add data-* attribute for each data value passed in.
  for (const key in data) {
    if (hasOwn(data, key) && key.startsWith('spotx_')) {
      script.setAttribute(`data-${key}`, data[key]);
    }
  }

  global['spotx_ad_done_function'] = function (spotxAdFound) {
    if (!spotxAdFound) {
      global.context.noContentAvailable();
    }
  };

  // TODO(KenneyE): Implement AdLoaded callback in script to accurately trigger
  // renderStart()
  script.onload = global.context.renderStart;

  script.src = `//js.spotx.tv/easi/v1/${data['spotx_channel_id']}.js`;
  global.document.body.appendChild(script);
}
