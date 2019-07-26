/**
 * JSON scalar. It's either string, number or boolean.
 * @typedef {*} should be string|number|boolean
 */
let JSONScalarDef;

/**
 * JSON object. It's a map with string keys and JSON values.
 * @typedef {*} should be !Object<string, ?JSONValueDef>
 */
let JSONObjectDef;

/**
 * JSON array. It's an array with JSON values.
 * @typedef {*} should be !Array<?JSONValueDef>
 */
let JSONArrayDef;

/**
 * JSON value. It's either a scalar, an object or an array.
 * @typedef {*} should be !JSONScalarDef|!JSONObjectDef|!JSONArrayDef
 */
let JSONValueDef;/**
 * @typedef {{
 *   width: string,
 *   height: string
 * }}
 */
let DimensionsDef;/**
 * Holds info about a service.
 * - obj: Actual service implementation when available.
 * - promise: Promise for the obj.
 * - resolve: Function to resolve the promise with the object.
 * - context: Argument for ctor, either a window or an ampdoc.
 * - ctor: Function that constructs and returns the service.
 * @typedef {{
 *   obj: (?Object),
 *   promise: (?Promise),
 *   resolve: (?function(!Object)),
 *   reject: (?function((*))),
 *   context: (?Window|?./service/ampdoc-impl.AmpDoc),
 *   ctor: (?function(new:Object, !Window)|
 *          ?function(new:Object, !./service/ampdoc-impl.AmpDoc)),
 * }}
 */
let ServiceHolderDef;/**
 * @typedef {{
 *   dates: !DatesList,
 *   template: Element
 * }}
 */
let DateTemplateMapDef;/**
 * A single source within a srcset. Only one: width or DPR can be specified at
 * a time.
 * @typedef {{
 *   url: string,
 *   width: (number|undefined),
 *   dpr: (number|undefined)
 * }}
 */
let SrcsetSourceDef;/**
 * Internal structure that maintains the state of an extension through loading.
 *
 * @typedef {{
 *   extensionId: (string|undefined),
 *   extensionVersion: (string|undefined),
 * }}
 * @private
 */
let ExtensionInfoDef;/**
 * @typedef {{
 *   frame: !Element,
 *   events: !Object<string, !Array<function(!JsonObject)>>
 * }}
 */
let WindowEventsDef;/**
 * @typedef {{
 *   platform: !./subscription-platform.SubscriptionPlatform,
 *   weight: number,
 * }}
 */
let PlatformWeightDef;/**
 * @typedef {{
 *   header: (?JsonObject|undefined),
 *   payload: (?JsonObject|undefined),
 *   verifiable: string,
 *   sig: string,
 * }}
 */
let JwtTokenInternalDef;/**
 * A "tapzoom" gesture. It has a center, delta off the center center and
 * the velocity of moving away from the center.
 * @typedef {{
 *   first: boolean,
 *   last: boolean,
 *   centerClientX: number,
 *   centerClientY: number,
 *   deltaX: number,
 *   deltaY: number,
 *   velocityX: number,
 *   velocityY: number
 * }}
 */
let TapzoomDef;/**
 * The structure that represents the metadata of a lightbox element
 *
 * @typedef {{
 *   descriptionText: string,
 *   tagName: string,
 *   imageViewer: ?Element,
 *   sourceElement: !Element,
 *   element: !Element
 * }}
 */
let LightboxElementMetadataDef;/**
 * @typedef {{
 *  id: number,
 *  width: number,
 *  height: number,
 *  scaleFactor: number,
 *  transform: string,
 *  verticalMargin: number,
 *  horizontalMargin: number,
 * }}
 */
let EmbedDataDef;

/**
 * @struct @typedef {{
 *   tooltip: !Element,
 *   buttonLeft: !Element,
 *   buttonRight: !Element,
 *   arrow: !Element,
 * }}
 */
let tooltipElementsDef;/**
 * @typedef {{
 *   promise: !Promise<undefined>,
 *   resolve: function(),
 * }}
 */
let DeferredDef;

/**
 * @typedef {!Function}
 */
let CustomElementConstructorDef;

/**
 * @typedef {{
 *  name: string,
 *  ctor: !CustomElementConstructorDef,
 * }}
 */
let CustomElementDef;/**
 * @typedef {{
 *   preload: (boolean|undefined),
 *   preconnect: (boolean|undefined)
 * }}
 */
let PreconnectFeaturesDef;/** @typedef {{
 *    element: !Element,
 *    currentThresholdSlot: number,
 *  }}
 */
let ElementIntersectionStateDef;/** @typedef {{
  distance: (boolean|number),
    viewportHeight: (number|undefined),
    scrollPenalty: (number|undefined),
  }} */
let ViewportRatioDef;/**
 * A single option within a SizeList.
 * @typedef {{
 *   mediaQuery: (string|undefined),
 *   size: (!./layout.LengthDef)
 * }}
 */
let SizeListOptionDef;/**
 * An expression arg value, e.g. `foo.bar` in `e:t.m(arg=foo.bar)`.
 * @typedef {{expression: string}}
 */
let ActionInfoArgExpressionDef;

/**
 * An arg value.
 * @typedef {(boolean|number|string|ActionInfoArgExpressionDef)}
 */
let ActionInfoArgValueDef;

/**
 * Map of arg names to their values, e.g. {arg: 123} in `e:t.m(arg=123)`.
 * @typedef {Object<string, ActionInfoArgValueDef>}
 */
let ActionInfoArgsDef;

/**
 * Function called when an action is invoked.
 *
 * Optionally, takes this action's position within all actions triggered by
 * the same event, as well as said action array, as params.
 *
 * If the action is chainable, returns a Promise which resolves when the
 * action is complete. Otherwise, returns null.
 *
 * @typedef {function(!ActionInvocation, number=, !Array<!ActionInfoDef>=):?Promise}
 */
let ActionHandlerDef;

/**
 * @typedef {{type: TokenType, value: *}}
 */
let TokenDef;/**
 * A base cid string value and the time it was last read / stored.
 * @typedef {{time: time, cid: string}}
 */
let BaseCidInfoDef;

/**
 * The "get CID" parameters.
 * - createCookieIfNotPresent: Whether CID is allowed to create a cookie when.
 *   Default value is `false`.
 * @typedef {{
 *   scope: string,
 *   createCookieIfNotPresent: (boolean|undefined),
 *   cookieName: (string|undefined),
 * }}
 */
let GetCidDef;/**
 * @typedef {function((string|Uint8Array))}
 */
let CryptoPolyfillDef;/** @typedef {number} */
let HistoryIdDef;

/**
 * @typedef {{stackIndex: HistoryIdDef, title: string, fragment: string, data: (!JsonObject|undefined)}}
 */
let HistoryStateDef;

/**
 * @typedef {{title: (string|undefined), fragment: (string|undefined), url: (string|undefined), canonicalUrl: (string|undefined), data: (!JsonObject|undefined)}}
 */
let HistoryStateUpdateDef;/**
 * @typedef {Object<string, *>}
 */
let PeekStateDef;/**
 * The internal structure of a ChangeHeightRequest.
 * @typedef {{
 *   newMargins: !../layout-rect.LayoutMarginsChangeDef,
 *   currentMargins: !../layout-rect.LayoutMarginsDef
 * }}
 */
let MarginChangeDef;

/**
 * The internal structure of a ChangeHeightRequest.
 * @typedef {{
 *   resource: !Resource,
 *   newHeight: (number|undefined),
 *   newWidth: (number|undefined),
 *   marginChange: (!MarginChangeDef|undefined),
 *   force: boolean,
 *   callback: (function(boolean)|undefined)
 * }}
 */
let ChangeSizeRequestDef;/**
 * @typedef {function(new:BaseTemplate, !Element, !Window)}
 */
let TemplateClassDef;/** @typedef {{sync: SyncResolverDef, async: AsyncResolverDef}} */
let ReplacementDef;/**
 * @typedef {{incomingFragment: string, outgoingFragment: string}}
 */
let ShareTrackingFragmentsDef;/**
 * @typedef {function(!JsonObject):(!Promise|undefined)}
 */
let RequestResponderDef;/**
 * @typedef {{
 *   delay: ./time.normtimeDef,
 *   func: !TransitionDef,
 *   duration: ./time.normtimeDef,
 *   curve: ?./curve.CurveDef
 * }}
 */
let SegmentDef;

/**
 * @typedef {{
 *   delay: ./time.normtimeDef,
 *   func: !TransitionDef,
 *   duration: ./time.normtimeDef,
 *   curve: ?./curve.CurveDef,
 *   started: boolean,
 *   completed: boolean
 * }}
 */
let SegmentRuntimeDef;/**
 * @typedef {Object<string, *>}
 */
let AncestryStateDef;/**
 * @typedef {{
 *   id: string,
 *   selectors: !Array,
 *   element: !Element,
 *   position: string,
 *   placeholder: (?Element|undefined),
 *   fixedNow: boolean,
 *   stickyNow: boolean,
 *   top: (string|undefined),
 *   transform: (string|undefined),
 *   forceTransfer: (boolean|undefined),
 *   lightboxed: (boolean|undefined),
 * }}
 */
let ElementDef;

/**
 * @typedef {{
 *   fixed: boolean,
 *   sticky: boolean,
 *   transferrable: boolean,
 *   top: string,
 *   zIndex: string,
 * }}
 */
let ElementStateDef;/**
 * @typedef {!Object<string, *>}
 */
let VsyncStateDef;

/**
 * @typedef {{
 *   measure: (function(!VsyncStateDef):undefined|undefined),
 *   mutate: (function(!VsyncStateDef):undefined|undefined)
 * }}
 */
let VsyncTaskSpecDef;/**
 * Contains data for the declaration of a custom element.
 *
 * @typedef {{
 *   implementationClass:
 *       function(new:../base-element.BaseElement, !Element),
 *   css: (?string|undefined),
 * }}
 */
let ExtensionElementDef;

/**
 * Contains data for the declaration of an extension service.
 *
 * @typedef {{serviceName: string, serviceClass: function(new:Object, !./ampdoc-impl.AmpDoc)}}
 */
let ExtensionServiceDef;

/**
 * The structure that contains the resources declared by an extension.
 *
 * @typedef {{
 *   elements: !Object<string, !ExtensionElementDef>,
 *   services: !Object<string, !ExtensionServiceDef>,
 * }}
 */
let ExtensionDef;

/**
 * Internal structure that maintains the state of an extension through loading.
 *
 * @typedef {{
 *   extension: !ExtensionDef,
 *   auto: boolean,
 *   docFactories: !Array<function(!./ampdoc-impl.AmpDoc)>,
 *   promise: (!Promise<!ExtensionDef>|undefined),
 *   resolve: (function(!ExtensionDef)|undefined),
 *   reject: (function(!Error)|undefined),
 *   loaded: (boolean|undefined),
 *   error: (!Error|undefined),
 *   scriptPresent: (boolean|undefined),
 * }}
 * @private
 */
let ExtensionHolderDef;/** @typedef {function(!Element): (boolean|!Promise<boolean>)} */
let ElementPredicate_1_0_Def;

/**
 * A log type is an abstract rule or best practice that should be followed when
 * constructing a story.  This is internal to this file, which handles finding
 * specific instances of these log types, and returning them as log entries.
 *
 * message: (required) The message shown to developers in development mode if
 *     the best practice is not followed.
 * level: (required) The log level at which this entry should be logged.
 * moreInfo: (optional) A URL to a page containing additional documentation on
 *     the best practice.
 * selector: (optional) A selector to be queried on the currently-active page,
 *     and whose results will be subject to the best practice (given that they
 *     also match the precondition).  If unspecified, the amp-story-page itself
 *     is assumed to be subject to the best practice.
 * precondition: (optional) A predicate that takes an element and returns true
 *     if the specified element should be subject to the best practice.  If
 *     unspecified, all elements that match the selector are subject to the best
 *     practice.
 * predicate: (optional) A predicate that takes an element and returns true if
 *     the element follows the best practice, or false otherwise.  If
 *     unspecified, all elements are assumed not to follow the best practice.
 *
 * @typedef {{
 *   message: string,
 *   level: !LogLevel,
 *   moreInfo: (string|undefined),
 *   selector: (string|undefined),
 *   precondition: (!ElementPredicate_1_0_Def|undefined),
 *   predicate: (!ElementPredicate_1_0_Def|undefined),
 * }}
 */
let AmpStoryLogType_1_0_Def;/**
 * A marker type to indicate an element that originated from the pool itself.
 * @typedef {!HTMLMediaElement}
 */
let PoolBoundElementDef;

/**
 * Represents a task to be executed on a media element.
 * @typedef {function(!PoolBoundElementDef, *): !Promise}
 */
let ElementTask_1_0_Def;/**
 * @typedef {{
 *   url: string,
 *   text: string,
 * }}
 */
let CtaLinkArrDef;/**
 * @struct @typedef {{
 *   category: !Element,
 *   title: !Element,
 *   image: !Element,
 *   meta: !Element,
 *   domainName: string,
 * }}
 */
let landscapeElementsDef;/**
 * @struct @typedef {{
 *   category: !Element,
 *   title: !Element,
 *   image: !Element,
 *   meta: !Element,
 *   domainName: string
 * }}
 */
let portraitElementsDef;/** @struct @typedef {{className: string, triggers: (string|undefined)}} */
let ButtonState_1_0_Def;/** @typedef {function(!Element): (boolean|!Promise<boolean>)} */
let ElementPredicate_0_1_Def;

/**
 * A log type is an abstract rule or best practice that should be followed when
 * constructing a story.  This is internal to this file, which handles finding
 * specific instances of these log types, and returning them as log entries.
 *
 * message: (required) The message shown to developers in development mode if
 *     the best practice is not followed.
 * level: (required) The log level at which this entry should be logged.
 * moreInfo: (optional) A URL to a page containing additional documentation on
 *     the best practice.
 * selector: (optional) A selector to be queried on the currently-active page,
 *     and whose results will be subject to the best practice (given that they
 *     also match the precondition).  If unspecified, the amp-story-page itself
 *     is assumed to be subject to the best practice.
 * precondition: (optional) A predicate that takes an element and returns true
 *     if the specified element should be subject to the best practice.  If
 *     unspecified, all elements that match the selector are subject to the best
 *     practice.
 * predicate: (optional) A predicate that takes an element and returns true if
 *     the element follows the best practice, or false otherwise.  If
 *     unspecified, all elements are assumed not to follow the best practice.
 *
 * @typedef {{
 *   message: string,
 *   level: !LogLevel,
 *   moreInfo: (string|undefined),
 *   selector: (string|undefined),
 *   precondition: (!ElementPredicate_0_1_Def|undefined),
 *   predicate: (!ElementPredicate_0_1_Def|undefined),
 * }}
 */
let AmpStoryLogType_0_1_Def;/**
 * Represents a task to be executed on a media element.
 * @typedef {function(!HTMLMediaElement, *): !Promise}
 */
let ElementTask_0_1_Def;/** @struct @typedef {{className: string, triggers: (string|undefined)}} */
let ButtonState_0_1_Def;/**
 * A record version of `XMLHttpRequest` that has all the necessary properties
 * and methods of `XMLHttpRequest` to construct a `FetchResponse` from a
 * serialized response returned by the viewer.
 * @typedef {{
 *   status: number,
 *   statusText: string,
 *   responseText: string,
 *   getResponseHeader: function(this:XMLHttpRequestDef, string): string,
 * }}
 */
let XMLHttpRequestDef;/**
 * @typedef {{
 *   openStyle: !JsonObject,
 *   closedStyle: !JsonObject,
 *   durationSeconds: number,
 * }}
 */
let AnimationPresetDef;/**
 * @export
 * @typedef {{
 *   showNotification: boolean
 * }}
 */
let GetResponseMetadataDef;

/**
 * @typedef {{
 *   promise: !Promise,
 *   resolve: function(*)
 * }}
 */
let UserNotificationDeferDef;/**
 * Fields:
 * {{
 *   label: string,
 *   delta: (number|null|undefined),
 *   value: (number|null|undefined)
 * }}
 * @typedef {!JsonObject}
 */
let TickEventDef;/**
 * @typedef {{
 *   viewportRect: !LayoutRectDef,
 *   targetRect: !LayoutRectDef,
 * }}
 */
let PositionEntryDef;/**
 * The activity request that different types of hosts can be started with.
 * @typedef {{
 *   requestId: string,
 *   returnUrl: string,
 *   args: ?Object,
 *   origin: (string|undefined),
 *   originVerified: (boolean|undefined),
 * }}
 */
let ActivityRequest;

/**
 * The activity "open" options used for popups and redirects.
 *
 * - returnUrl: override the return URL. By default, the current URL will be
 *   used.
 * - skipRequestInUrl: removes the activity request from the URL, in case
 *   redirect is used. By default, the activity request is appended to the
 *   activity URL. This option can be used if the activity request is passed
 *   to the activity by some alternative means.
 * - disableRedirectFallback: disallows popup fallback to redirect. By default
 *   the redirect fallback is allowed. This option has to be used very carefully
 *   because there are many user agents that may fail to open a popup and it
 *   won't be always possible for the opener window to even be aware of such
 *   failures.
 *
 * @typedef {{
 *   returnUrl: (string|undefined),
 *   skipRequestInUrl: (boolean|undefined),
 *   disableRedirectFallback: (boolean|undefined),
 *   width: (number|undefined),
 *   height: (number|undefined),
 * }}
 */
let ActivityOpenOptions;

/**
 * Defines a client event in SwG
 * Properties:
 * - eventType: Required. The AnalyticsEvent type that occurred.
 * - eventOriginator: Required.  The codebase that initiated the event.
 * - isFromUserAction: Optional.  True if the user took an action to generate
 *   the event.
 * - additionalParameters: Optional.  A JSON object to store generic data.
 *
 *  @typedef {{
 *    eventType: !AnalyticsEvent,
 *    eventOriginator: !EventOriginator,
 *    isFromUserAction: ?boolean,
 *    additionalParameters: ?Object,
 * }}
 */
let ClientEvent;/**
 * @typedef {{
 *   prefetch: (string|undefined),
 *   preconnect: (string|undefined),
 *   renderStartImplemented: (boolean|undefined),
 *   clientIdScope: (string|undefined),
 *   clientIdCookieName: (string|undefined),
 *   consentHandlingOverride: (boolean|undefined),
 *   remoteHTMLDisabled: (boolean|undefined),
 *   fullWidthHeightRatio: (number|undefined),
 * }}
 */
let AdNetworkConfigDef;/**
 * @typedef {{
 *   element: !Element,
 *   prevValue: ?string,
 * }}
 */
let ElementAttributeInfoDef;

/**
 * @typedef {{
 *   element: !Element,
 *   hiddenElementInfos: !Array<!ElementAttributeInfoDef>,
 *   focusableExternalElements: !Array<!Element>,
 *   focusableInternalElements: !Array<!Element>,
 * }}
 */
let ModalEntryDef;/**
 * Defines the aspects an FX is bound to.
 *  - `observes` either POSITION or SCROLL_TOGGLE.
 *  - `translates` the ax(i|e)s this FX translates elements on. Optional.
 *  - `opacity` whether this FX changes opacity. Optional.
 *
 * Two FX are compatible and therefore combinable IFF:
 *  1. both observe the same signal
 *  2. neither translates along the same axis
 *  3. only one or none of them changes opacity
 * @typedef {{
 *  observes: !FxObservesSignal,
 *  opacity: (boolean|undefined),
 *  translates: ({
 *    x: (boolean|undefined),
 *    y: (boolean|undefined),
 *  }|undefined),
 * }}
 */
let FxBindingDef;/**
 * @typedef {{
 *  fontStyle: string,
 *  variant: string,
 *  weight: string,
 *  size: string,
 *  family: string
 * }}
 */
let FontConfigDef;/**
 * @typedef {{
 *    name:string,
 *    message:string
 *  }}
 */
let VerificationErrorDef;

/**
 * @typedef {{
 *   updatedElements:!Array<!Element>,
 *   errors:!Array<!VerificationErrorDef>
 * }}
 */
let UpdatedErrorsDef;/**
 * These fully qualified names, my goodness.
 * @typedef {!../../../../src/service/position-observer/position-observer-worker.PositionInViewportEntryDef}
 */
let PositionObserverEntryDef;

/** @typedef {function(this:./fx-provider.FxElement, ?PositionObserverEntryDef)} */
let FxUpdateDef;

/** @typedef {{userAsserts: function(!Element):*, update: !FxUpdateDef}} */
let FxPresetDef;/**
 * @typedef {!../../../src/service/position-observer/position-observer-worker.PositionInViewportEntryDef}
 */
let PositionInViewportEntryDef;/**
 * @typedef {{output: string, section:Array, attribute:Object, vars:Object}}
 */
let ConfigOptsDef;/**
 * @struct @typedef {{
 *   video: !../../../src/video-interface.VideoOrBaseElementDef,
 *   target: !DockTargetDef,
 *   step: number,
 * }}
 */
let DockedDef;

/** @typedef {{posX: !RelativeX, posY: !RelativeY}|!Element} */
let DockTargetDef;/**
 * TextPosDef is a pointer to a character in a Text node.
 * @typedef {{node: !Text, offset: number}}
 */
let TextPosDef;

/**
 * TextRangeDef represents a text range.
 * @typedef {{start: !TextPosDef, end: !TextPosDef}}
 */
let TextRangeDef;/**
 * @typedef {{
 *   insert: !Array<!Element>,
 *   replace: !Array<!Element>,
 *   tombstone: !Array<!Element>
 * }}
 */
let MutateItemsDef;/**
 * @typedef {{method: string, resolve: !Function, reject: !Function}}
 */
let PendingMessageDef;/** @typedef {{
  year: number,
  month: number,
  monthName: string,
  monthNameShort: string,
  day: number,
  dayName: string,
  dayNameShort: string,
  hour: number,
  minute: number,
  second: number,
  iso: string,
}} */
let VariablesDef;

/** @typedef {{
  year: number,
  month: number,
  monthName: string,
  monthNameShort: string,
  day: number,
  dayName: string,
  dayNameShort: string,
  hour: number,
  minute: number,
  second: number,
  iso: string,
  yearTwoDigit: string,
  monthTwoDigit: string,
  dayTwoDigit: string,
  hourTwoDigit: string,
  hour12: string,
  hour12TwoDigit: string,
  minuteTwoDigit: string,
  secondTwoDigit: string,
  dayPeriod: string,
 }} */
let EnhancedVariablesDef;/**
 * @typedef {{
 *   width: (number|undefined),
 *   height: (number|undefined),
 *   margins: (LayoutMarginsChangeDef|undefined),
 * }}
 */
let PlacementSizingDef;/**
 * @typedef {{
 *   stop: function(),
 * }}
 */
let StoppableDef;/**
 * @typedef {{
 *   start: number,
 *   end: number,
 *   length: number,
 * }}
 */
let DimensionDef;/** @typedef {{name: string, argList: string}} */
let FunctionNameArgsDef;/**
 * @typedef {{
 *   mediaQueryList: MediaQueryList,
 *   value: string,
 * }}
 */
let MediaQueriesListAndValueDef;/**
 * @typedef {{
 *   advance: function(number, {
 *     actionSource: (!ActionSource|undefined),
 *     allowWrap: (boolean|undefined),
 *   }),
 * }}
 */
let AdvanceDef;/**
 * A user-supplied JSON object that defines a resource to be reported. It is
 * expected to have some fields.
 * A resource timing enty will match against this resource if all of the
 * following properties match.
 * @property {string=} host A string whose value should be a RegExp. It defines
 *     a host or set of hosts to match against. By default, the RegExp will
 *     match all hosts if omitted.
 * @property {string=} path A string whose value should be a RegExp. It defines
 *     a path or set of paths to match against. By default, the RegExp will
 *     match all paths if omitted.
 * @property {string=} query A string whose value should be a RegExp. It defines
 *     a query string or set of query strings to match against. By default, the
 *     RegExp will match all query strings if omitted.
 * @typedef {!JsonObject}
 */
let IndividualResourceSpecDef;

/**
 * A parsed resource spec for a specific host or sets of hosts (as defined by
 * the hostPattern).
 * @typedef {{
 *   hostPattern: !RegExp,
 *   resources: !Array<{
 *     name: string,
 *     pathPattern: !RegExp,
 *     queryPattern: !RegExp,
 *   }>,
 * }}
 */
let ResourceSpecForHostDef;/**
 * @typedef {{
 *   allowedProtocols: (!Object<string,boolean>|undefined),
 *   alternativeName: (string|undefined),
 * }}
 */
let PropertyRulesDef;/**
 * A bound property, e.g. [property]="expression".
 * `previousResult` is the result of this expression during the last evaluation.
 * @typedef {{property: string, expressionString: string, previousResult: (BindExpressionResultDef|undefined)}}
 */
let BoundPropertyDef;

/**
 * A tuple containing a single element and all of its bound properties.
 * @typedef {{boundProperties: !Array<BoundPropertyDef>, element: !Element}}
 */
let BoundElementDef;/** @typedef {{
 *    fwSignal: ?number,
 *    slotWidth: ?number,
 *    parentWidth: ?number,
 * }}
 */
let ParamsTypeDef;/**
 * @typedef {{
 *   type: string,
 *   time: number
 * }}
 */
let ActivityEventDef;/**
 * @typedef {{
 * loc:*,
 * title:string,
 * pubId:string,
 * atConfig: JsonObject<AtConfigDef>,
 * referrer: string,
 * ampDoc: !../../../../src/service/ampdoc-impl.AmpDoc
 * }}
 */
let LojsonDataDef;

/**
 * @typedef {{
 *   services_exclude:string,
 *   services_compact:string,
 *   services_expanded:string,
 *   services_custom: Array,
 *   ui_click: boolean,
 *   ui_disable: boolean,
 *   ui_delay: number,
 *   ui_hover_direction: number,
 *   ui_language: string,
 *   ui_offset_top: number,
 *   ui_offset_left: number,
 *   ui_508_compliant: boolean,
 *   ui_tabindex: number,
 *   use_cookies: boolean,
 *   track_addressbar: boolean,
 *   track_clickback: boolean,
 *   track_linkback: boolean,
 *   track_textcopy: boolean
 * }}
 */
let AtConfigDef;/** @typedef {{
   * du: string,
   * hostname: string,
   * href: string,
   * referrer: string,
   * search: string,
   * pathname: string,
   * title: string,
   * hash: string,
   * protocol: string,
   * port: string
   * }} */
let pageInfo;/** @typedef {{
    url: string,
    macros: Array<string>,
    errorReportingUrl: (string|undefined),
    disableKeyAppend: boolean}} */
let RtcVendorDef;/** @typedef {{
    urls: (undefined|Array<string>|
      Array<{url:string, errorReportingUrl:string,
        sendRegardlessOfConsentState:(undefined|boolean|Array<string>)}>),
    vendors: (undefined|Object),
    timeoutMillis: number,
    errorReportingUrl: (undefined|string),
    sendRegardlessOfConsentState: (undefined|boolean|Array<string>)
}} */
let RtcConfigDef;/** @typedef {{
      adUrl: !Promise<string>,
      lineItemId: string,
      creativeId: string,
      slotId: string,
      slotIndex: string,
    }} */
let TroubleshootDataDef;

/** @typedef {{width: number, height: number}} */
let SizeDef;

/** @typedef {(SizeDef|../../../src/layout-rect.LayoutRectDef)} */
let LayoutRectOrDimsDef;/**
     * @typedef {{
     *   top: number,
     *   right: number,
     *   bottom: number,
     *   left: number
     * }}
     */
let AllowedRectDef;/**
 * @typedef {{
 *   finalUrl: string,
 *   trackingUrls: !Array<string>,
 *   vars: !./config.VariablesDef,
 *   filters: !Array<!./filters/filter.Filter>
 * }}
 */
let NavigationTargetDef;/**
 * @typedef {{
 *   articleTitleSelector: string,
 *   configUrl: (string|undefined),
 *   articleId: (string|undefined),
 *   scrollToTopAfterAuth: (boolean|undefined),
 *   locale: (string|undefined),
 *   localeMessages: (Object|undefined),
 *   region: (string|undefined),
 *   sandbox: (boolean|undefined),
 * }}
 */
let LaterpayConfig_0_2_Def;

/**
 * @typedef {{
 *   "amount": number,
 *   "currency": string,
 *   "payment_model": string,
 * }}
 */
let PriceDef;

/**
 * @typedef {{
 *   "unit": string,
 *   "value": number,
 * }}
 */
let ExpiryDef;

/**
 * @typedef {{
 *   title: string,
 *   description: string,
 *   sales_model: string,
 *   purchase_url: string,
 *   price: PriceDef,
 *   expiry: ExpiryDef,
 * }}
 */
let PurchaseOption_0_2_Def;

/**
 * @typedef {{
 *   identify_url: string,
 *   purchase_options: Array<PurchaseOption_0_2_Def>,
 * }}
 */
let PurchaseConfig_0_2_Def;

/**
 * @typedef {{
 *   singlePurchases: Array<PurchaseOption_0_2_Def>,
 *   timepasses: Array<PurchaseOption_0_2_Def>,
 *   subscriptions: Array<PurchaseOption_0_2_Def>,
 * }}
 */
let PurchaseOptionsDef;/**
 * @typedef {{
 *   articleTitleSelector: string,
 *   configUrl: (string|undefined),
 *   articleId: (string|undefined),
 *   scrollToTopAfterAuth: (boolean|undefined),
 *   locale: (string|undefined),
 *   localeMessages: (Object|undefined),
 *   region: (string|undefined),
 *   sandbox: (boolean|undefined),
 * }}
 */
let LaterpayConfig_0_1_Def;

/**
 * @typedef {{
 *   description: string,
 *   price: !Object<string, number>,
 *   purchase_type: string,
 *   purchase_url: string,
 *   title: string,
 *   validity_unit: string,
 *   validity_value: number
 * }}
 */
let PurchaseOption_0_1_Def;

/**
 * @typedef {{
 *   access: boolean,
 *   apl: string,
 *   premiumcontent: !PurchaseOption_0_1_Def,
 *   timepasses: (!Array<PurchaseOption_0_1_Def>|undefined),
 *   subscriptions: (!Array<PurchaseOption_0_1_Def>|undefined)
 * }}
 */
let PurchaseConfig_0_1_Def;/**
 * @typedef {{
 *   appId: string,
 *   pageType: (string),
 *   debug: (boolean|null),
 *   forceWidget: (string|null),
 *   loginButtonEnabled: (boolean),
 *   videoClient: (string|null),
 *   customSegment: (string|null),
 *   cookiesEnabled: (boolean),
 * }}
 */
let PooolConfigDef;