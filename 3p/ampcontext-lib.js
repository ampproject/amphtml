import './polyfills';
import {AmpContext} from './ampcontext.js';


/**
 *  If window.context does not exist, we must instantiate a replacement and
 *  assign it to window.context, to provide the creative with all the required
 *  functionality.
 */
try {
  console.log("Attempting to make AmpContext");
  const windowContextCreated = new Event('windowContextCreated');
  windowContextCreated.lib = new AmpContext(window);
  // Allows for pre-existence, consider validating correct window.context lib instance?
  window.context = window.context || windowContextCreated.lib;
  window.dispatchEvent(windowContextCreated);
} catch (err) {
  // do nothing with error
}
