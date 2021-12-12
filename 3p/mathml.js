import {setStyle} from '#core/dom/style';

import {userAssert} from '#utils/log';

import {writeScript} from './3p';

/**
 * Get the correct script for the mathml formula.
 *
 * Use writeScript: Failed to execute 'write' on 'Document': It isn't possible
 * to write into a document from an asynchronously-loaded external script unless
 * it is explicitly opened.
 *
 * @param {!Window} global
 * @param {string} scriptSource The source of the script, different for post and comment embeds.
 * @param {function(*)} cb
 */
function getMathmlJs(global, scriptSource, cb) {
  writeScript(global, scriptSource, function () {
    cb(global.MathJax);
  });
}

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function mathml(global, data) {
  userAssert(
    data.formula,
    'The formula attribute is required for <amp-mathml> %s',
    data.element
  );

  getMathmlJs(
    global,
    'https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.5/MathJax.js?config=TeX-MML-AM_CHTML',
    (mathjax) => {
      // Dimensions are given by the parent frame.
      delete data.width;
      delete data.height;
      const div = document.createElement('div');
      div.setAttribute('id', 'mathmlformula');
      div.textContent = data.formula;
      setStyle(div, 'visibility', 'hidden');
      global.document.body.appendChild(div);
      mathjax.Hub.Config({
        showMathMenu: false,
        // (#26082): From a11y perspective, user should not be able to tab to
        // the math formula which has no functionality to interact with.  This
        // configuration removes the formula from the tab-index.
        menuSettings: {
          inTabOrder: false,
        },
      });
      mathjax.Hub.Queue(function () {
        const rendered = document.getElementById('MathJax-Element-1-Frame');
        // Remove built in mathjax margins.
        let display = document.getElementsByClassName('MJXc-display');
        if (!display[0]) {
          const span = document.createElement('span');
          span.setAttribute('class', 'mjx-chtml MJXc-display');
          span.appendChild(rendered);
          div.appendChild(span);
          display = document.getElementsByClassName('MJXc-display');
        }
        display[0].setAttribute('style', 'margin-top:0;margin-bottom:0');
        context.requestResize(
          rendered./*OK*/ offsetWidth,
          rendered./*OK*/ offsetHeight
        );
        setStyle(div, 'visibility', 'visible');
      });
    }
  );
}
