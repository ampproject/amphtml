import {loadScript, validateData} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function adtelligent(global, data) {
  validateData(
    data,
    [],
    ['source', 'floor', 'hbmpPubId', 'hbmpSiteId', 'hbmpUnitId']
  );

  const doc = global.document;
  const container = doc.createElement('div');
  const ctx = window.context;
  doc.body.appendChild(container);
  if (data.source) {
    const url =
      `https://s.adtelligent.com/?floor=${data.floor || 0}` +
      `&content_page_url=${encodeURIComponent(ctx.location)}` +
      `&width=${data.width}` +
      `&height=${data.height}` +
      `&cb=${Date.now()}` +
      `&aid=${data.source}`;
    container.id = 'PDS' + data.source;
    loadScript(global, url, () => {
      ctx.renderStart({
        width: data.width,
        height: data.height,
      });
    });
  } else {
    const HTML_ELEMENT_ID = 'adt-placement';
    const vpbSrc = `//player.adtelligent.com/prebid/wrapper_hb_${data['hbmpPubId']}_${data['hbmpSiteId']}.js`;
    const pbSrc = vpbSrc.replace('wrapper_hb', 'hb');
    container.id = HTML_ELEMENT_ID;
    global.vpb = window.vpb || {
      cmd: [],
      fastLoad: true,
      amp: true,
      startAuction: 1,
    };

    loadScript(global, vpbSrc);
    loadScript(global, pbSrc);

    global.vpb.cmd.push(function () {
      global.vpb.startAuction({
        code: HTML_ELEMENT_ID,
        adUnitId: parseInt(data['hbmpUnitId'], 10),
        sizes: [[data.width, data.height]],
        render: true,
        onEnd(winner) {
          ctx.renderStart({
            width: winner.width,
            height: winner.height,
          });
        },
      });
    });
  }
}
