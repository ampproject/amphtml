import {validateData} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function my6sense(global, data) {
  validateData(data, ['widgetKey']);

  const widgetTag = global.document.createElement('script');
  widgetTag.src = `//web-clients.mynativeplatform.com/web-clients/bootloaders/${data['widgetKey']}/bootloader.js`;
  const url =
    data['url'] && data['url'] !== '[PAGE_URL]'
      ? data['url']
      : global.context.sourceUrl;
  widgetTag.setAttribute('async', 'true');
  widgetTag.setAttribute('data-version', '3');
  widgetTag.setAttribute('data-url', url);
  widgetTag.setAttribute('data-zone', data['zone'] || '[ZONE]');
  widgetTag.setAttribute('data-google-amp', 'true');
  widgetTag.setAttribute(
    'data-organic-clicks',
    data['organicClicks'] || '[ORGANIC_TRACKING_PIXEL]'
  );
  widgetTag.setAttribute(
    'data-paid-clicks',
    data['paidClicks'] || '[PAID_TRACKING_PIXEL]'
  );
  widgetTag.setAttribute('data-display-within-iframe', 'true');
  global.document.body.appendChild(widgetTag);
}
