import {loadScript, validateData} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function flite(global, data) {
  // TODO: check mandatory fields
  validateData(data, [], ['guid', 'mixins']);
  const {guid} = data,
    o = global,
    e = encodeURIComponent,
    x = 0;
  let r = '',
    dep = '';
  o.FLITE = o.FLITE || {};
  o.FLITE.config = o.FLITE.config || {};
  o.FLITE.config[guid] = o.FLITE.config[guid] || {};
  o.FLITE.config[guid].cb = Math.random();
  o.FLITE.config[guid].ts = +Number(new Date());
  r = global.context.location.href;
  const m = r.match(new RegExp('[A-Za-z]+:[/][/][A-Za-z0-9.-]+'));
  dep = data.mixins ? '&dep=' + data.mixins : '';
  const url = [
    'https://r.flite.com/syndication/uscript.js?i=',
    e(guid),
    '&v=3',
    dep,
    '&x=us',
    x,
    '&cb=',
    o.FLITE.config[guid].cb,
    '&d=',
    e((m && m[0]) || r),
    '&tz=',
    new Date().getTimezoneOffset(),
  ].join('');
  loadScript(o, url);
}
