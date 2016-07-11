import {checkData} from '../src/3p';

/**
  * @param {!Window} global
  * @param {!Object} data
  */
export function adsense(global, data) {
   checkData(data, ['asm-params', 'asm-host']);

   const i = document.createElement('ins');
   i.setAttribute('data-asm-params', data['asm-params']);
   i.setAttribute('data-asm-host', data['asm-host']);
   i.setAttribute('class', 'asm_async_creative');
   i.style.cssText = 'display:inline-block;text-align:left;';
   global.document.getElementById('c').appendChild(i);

   const s = document.createElement('script');
   s.src = 'https://'+data[asm-host]+'/adasync.js';
   global.document.body.appendChild(s);
}
