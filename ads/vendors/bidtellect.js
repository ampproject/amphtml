import {validateData, writeScript} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function bidtellect(global, data) {
  const requiredParams = ['t', 'pid', 'sid'];
  const optionalParams = [
    'sname',
    'pubid',
    'pubname',
    'renderid',
    'bestrender',
    'autoplay',
    'playbutton',
    'videotypeid',
    'videocloseicon',
    'targetid',
    'bustframe',
  ];
  validateData(data, requiredParams, optionalParams);
  let params = '?t=' + encodeURIComponent(data.t);
  params += '&pid=' + encodeURIComponent(data.pid);
  params += '&sid=' + encodeURIComponent(data.sid);
  if (data.width) {
    params += '&w=' + encodeURIComponent(data.width);
  }
  if (data.height) {
    params += '&h=' + encodeURIComponent(data.height);
  }
  optionalParams.forEach(function (param) {
    if (data[param]) {
      params += '&' + param + '=' + encodeURIComponent(data[param]);
    }
  });
  const url = 'https://cdn.bttrack.com/js/infeed/2.0/infeed.min.js' + params;
  writeScript(global, url);
}
