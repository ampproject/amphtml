/* eslint-disable require-jsdoc */
import {validateData} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function vlyby(global, data) {
  /*eslint "local/camelcase": 0*/
  global._vlyby_amp = {
    allowed_data: ['publisherid', 'placementid', 'pubref'],
    mandatory_data: ['publisherid', 'placementid'],
    data: {
      pubref: '',
      publisherid: '',
      placementid: '',
      ...data,
    },
  };

  validateData(data, global._vlyby_amp.mandatory_data);

  const rand = Math.round(Math.random() * 100000000);

  // install observation on entering/leaving the view
  global.context.observeIntersection(function (changes) {
    /** @type {!Array} */ (changes).forEach(function (c) {
      if (global._vlyby_amp) {
        global._vlyby_amp.rects = c;
      }
    });
  });

  //create Container
  const containerId = 'qad' + rand;
  createContainer(global, containerId);

  //create Script
  createScript(global, containerId);

  function createScript(global, id) {
    const s = global.document.createElement('script');
    const referrer = data['pubref'] || global.context.canonicalUrl;

    s.setAttribute('type', 'text/javascript');
    s.setAttribute('async', 'true');
    s.setAttribute('src', '//cdn.vlyby.com/amp/qad/qad-outer2.js');
    s.setAttribute('data-PubId', data['publisherid']);
    s.setAttribute('data-PlacementId', data['placementid']);
    s.setAttribute('data-DivId', id);
    s.setAttribute('data-PubRef', referrer);
    global.document.getElementById('c').appendChild(s);
  }
  function createContainer(global, id) {
    const d = global.document.createElement('div');
    d.id = id;
    global.document.getElementById('c').appendChild(d);
  }
}
