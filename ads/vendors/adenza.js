import {writeScript, validateData} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function adenza(global, data) {
  validateData(data, ['blockId']);

  console.log('global', global);
  console.log('data', data);

  const url =
    'https://adenza.network/network/data/teasers/' +
    encodeURIComponent(data['blockId']) +
    '/script?async=1&div=c';

    const mainBlock = global.document.getElementById('c');
    const insertionBlock = global.document.createElement('div');
    insertionBlock.setAttribute('id', 'pw-net-' + data.blockId);
    mainBlock.append(insertionBlock);

    window.context.observeIntersection(function (changes) {
      changes.forEach(function (c) {
        const findIframe = global.document.getElementById('c').querySelector('iframe');
        if(findIframe){
          const height = findIframe?.style?.height;
          if(height){
            window.context.requestResize(undefined, height);
          }
        }
      });
    });

    writeScript(
    global,
    url,
    () => {
      global.context.renderStart();
    },
    () => {
      global.context.noContentAvailable();
    }
  );
}
