
import {factory as inputmaskDependencyFactory} from './inputmask.dependencyLib';
import {factory as inputmaskFactory} from './inputmask';
import {factory as inputmaskDateExtensionsFactory} from './inputmask.date.extensions';

let Inputmask;

window.inputmaskFactory = function(element) {
  const doc = element.ownerDocument;
  const win = element.ownerDocument.defaultView;

  if (Inputmask) {
    return Inputmask;
  }

  const InputmaskDependencyLib = inputmaskDependencyFactory(win, doc);
  Inputmask = inputmaskFactory(InputmaskDependencyLib, win, doc, undefined);
  inputmaskDateExtensionsFactory(Inputmask);

  return Inputmask;
};
