import {loadScript, validateData} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function zedo(global, data) {
  // check mandatory fields
  validateData(
    data,
    ['superId', 'network', 'placementId', 'channel', 'publisher', 'dim'],
    ['charset', 'callback', 'renderer']
  );

  loadScript(global, 'https://ss3.zedo.com/gecko/tag/Gecko.amp.min.js', () => {
    const {ZGTag} = global;
    const charset = data.charset || '';
    const callback = data.callback || function () {};
    const geckoTag = new ZGTag(
      data.superId,
      data.network,
      '',
      '',
      charset,
      callback
    );
    geckoTag.setAMP();
    // define placement
    const placement = geckoTag.addPlacement(
      data.placementId,
      data.channel,
      data.publisher,
      data.dim,
      data.width,
      data.height
    );
    if (data.renderer) {
      for (const key in data.renderer) {
        placement.includeRenderer(
          data.renderer[key].name,
          data.renderer[key].value
        );
      }
    } else {
      placement.includeRenderer('display', {});
    }
    //create a slot div to display ad
    const slot = global.document.createElement('div');
    slot.id = 'zdt_' + data.placementId;

    const divContainer = global.document.getElementById('c');
    if (divContainer) {
      divContainer.appendChild(slot);
    }

    // call load ads
    geckoTag.loadAds();

    // call div ready
    geckoTag.placementReady(data.placementId);
  });
}
