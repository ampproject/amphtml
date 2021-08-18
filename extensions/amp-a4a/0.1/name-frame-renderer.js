

import {createElementWithAttributes} from '#core/dom';
import {
  intersectionEntryToJson,
  measureIntersection,
} from '#core/dom/layout/intersection';
import {dict} from '#core/types/object';
import {utf8Decode} from '#core/types/string/bytes';

import {getExperimentBranch} from '#experiments';
import {ADS_INITIAL_INTERSECTION_EXP} from '#experiments/ads-initial-intersection-exp';

import {Renderer} from './amp-ad-type-defs';

import {getDefaultBootstrapBaseUrl} from '../../../src/3p-frame';
import {getContextMetadata} from '../../../src/iframe-attributes';

/**
 * Render a non-AMP creative into a NameFrame.
 */
export class NameFrameRenderer extends Renderer {
  /** @override */
  render(context, element, crossDomainData) {
    crossDomainData = /** @type {!./amp-ad-type-defs.CrossDomainDataDef} */ (
      crossDomainData
    );

    if (!crossDomainData.creative && !crossDomainData.rawCreativeBytes) {
      // No creative, nothing to do.
      return Promise.resolve();
    }

    const creative =
      crossDomainData.creative ||
      // rawCreativeBytes must exist; if we're here, then `creative` must not
      // exist, but the if-statement above guarantees that at least one of
      // `creative` || `rawCreativeBytes` exists.
      utf8Decode(
        /** @type {!ArrayBuffer} */ (crossDomainData.rawCreativeBytes)
      );
    const srcPath = getDefaultBootstrapBaseUrl(context.win, 'nameframe');
    const contextMetadata = getContextMetadata(
      context.win,
      element,
      context.sentinel,
      crossDomainData.additionalContextMetadata
    );
    contextMetadata['creative'] = creative;

    const asyncIntersection =
      getExperimentBranch(
        element.ownerDocument.defaultView,
        ADS_INITIAL_INTERSECTION_EXP.id
      ) === ADS_INITIAL_INTERSECTION_EXP.experiment;
    const intersectionPromise = asyncIntersection
      ? measureIntersection(element)
      : Promise.resolve(element.getIntersectionChangeEntry());
    return intersectionPromise.then((intersection) => {
      contextMetadata['_context']['initialIntersection'] =
        intersectionEntryToJson(intersection);
      const attributes = dict({
        'src': srcPath,
        'name': JSON.stringify(contextMetadata),
        'height': context.size.height,
        'width': context.size.width,
        'frameborder': '0',
        'allowfullscreen': '',
        'allowtransparency': '',
        'scrolling': 'no',
        'marginwidth': '0',
        'marginheight': '0',
      });
      if (crossDomainData.sentinel) {
        attributes['data-amp-3p-sentinel'] = crossDomainData.sentinel;
      }
      const iframe = createElementWithAttributes(
        /** @type {!Document} */ (element.ownerDocument),
        'iframe',
        /** @type {!JsonObject} */ (attributes)
      );
      // TODO(glevitzky): Ensure that applyFillContent or equivalent is called.
      element.appendChild(iframe);
    });
  }
}
