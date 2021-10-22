import {validateData, writeScript} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function adservsolutions(global, data) {
  validateData(data, [], ['client', 'zid']);
  global['ABNS'] =
    global['ABNS'] ||
    function () {
      (global['ABNSl'] = global['ABNSl'] || []).push(arguments);
    };
  global['ABNSh'] = data.client;
  writeScript(global, 'https://cdn.' + global['ABNSh'] + '/libs/b.js');
  global['ABNS']('c', {id: data.zid + '&o=a'});
}
