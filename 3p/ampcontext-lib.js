import './polyfills';
import {AmpContext} from './ampcontext.js';

/**
 *  If window.context does not exist, we must instantiate a replacement and
 *  assign it to window.context, to provide the creative with all the required
 *  functionality.
 */
try{
  window.context = window.context || new AmpContext(window);
  const windowContextCreated = new Event('windowContextCreated');
  window.dispatchEvent(windowContextCreated);
} catch (err) {
  window.context = undefined;
}
