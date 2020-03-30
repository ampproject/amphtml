
import {factory as inputmaskDependencyFactory} from './inputmask.dependencyLib';
import {factory as inputmaskCoreFactory} from './inputmask';
import {factory as inputmaskDateExtensionsFactory} from './inputmask.date.extensions';

(window.AMP = window.AMP || []).push(function (AMP) {
  (AMP.dependencies = AMP.dependencies || {})['inputmaskFactory'] = factory;
});

function factory(element) {
  const doc = element.ownerDocument;
  const win = doc.defaultView;

  const InputmaskDependencyLib = inputmaskDependencyFactory(win, doc);
  const Inputmask = inputmaskCoreFactory(InputmaskDependencyLib, win, doc, undefined);
  inputmaskDateExtensionsFactory(Inputmask);

  return Inputmask;
}
