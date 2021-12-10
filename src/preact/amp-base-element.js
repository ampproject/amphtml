import {PreactBaseElement} from './base-element';

/**
 * AmpPreactBaseElement adds amp-specific functionality to PreactBaseElement
 * It represents a web-component:
 *  whose rendering is driven by Preact
 *  and is a valid amp component
 *
 * The end goal for the inheritance hierarchy is:
 * AmpFoo > BentoFoo > AmpPreactBaseElement > PreactBaseElement > AMP.BaseElement
 */
export class AmpPreactBaseElement extends PreactBaseElement {}
