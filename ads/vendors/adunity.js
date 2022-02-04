import {loadScript, validateData} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function adunity(global, data) {
  const doc = global.document;

  validateData(
    data,
    ['auAccount', 'auSite'],
    [
      'auSection',
      'auZone',
      'auDemo',
      'auIsdemo',
      'auAd',
      'auOrder',
      'auSegment',
      'auOptions',
      'auSources',
      'auAds',
      'auTriggerFn',
      'auTriggerVal',
      'auCallbackVal',
      'auCallbackFn',
      'auPassbackFn',
      'auPassbackVal',
      'auClick',
      'auDual',
      'auImpression',
      'auVideo',
    ]
  );

  //prepare tag structure
  const tag = doc.createElement('div');
  tag.classList.add('au-tag');
  tag.setAttribute('data-au-width', data['width']);
  tag.setAttribute('data-au-height', data['height']);

  if (data != null) {
    for (const key in data) {
      //skip not valid attributes
      if (!hasOwnProperty.call(data, key)) {
        continue;
      }

      //skip if attribute is type or ampSlotIndex
      if (key.startsWith('type') || key.startsWith('ampSlotIndex')) {
        continue;
      }

      if (key.startsWith('au')) {
        if (key == 'auVideo') {
          tag.setAttribute('class', 'au-video');
        } else {
          const auKey = key.substring(2).toLowerCase();
          tag.setAttribute('data-au-' + auKey, data[key]);
        }
      }
    }
  }

  //make sure is executed only once
  let libAd = false;

  //execute tag only if in view
  const inViewCb = global.context.observeIntersection(function (changes) {
    /** @type {!Array} */ (changes).forEach(function (c) {
      if (!libAd && c.intersectionRect.height > data['height'] / 2) {
        libAd = true;
        inViewCb();
        renderTags(global, data);
      }
    });
  });
  const tagPh = doc.getElementById('c');
  tagPh.appendChild(tag);
}

/**
 * @param {!Window} global
 * @param {!Object} data
 */
function renderTags(global, data) {
  if (data == null) {
    return;
  }

  global.context.renderStart({
    width: data.width,
    height: data.height,
  });
  loadScript(global, 'https://content.adunity.com/aulib.js');
}
