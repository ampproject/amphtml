(self.AMP=self.AMP||[]).push({n:"amp-gwd-animation",i:["_base_i","_base_misc"],v:"1901181729101",f:(function(AMP,_){
var $AmpGwdRuntimeService$$module$extensions$amp_gwd_animation$0_1$amp_gwd_animation_impl$$ = function($ampdoc$jscomp$177$$, $opt_win$jscomp$4$$) {
  var $$jscomp$this$jscomp$639$$ = this;
  this.$ampdoc_$ = $ampdoc$jscomp$177$$;
  this.$D$ = $opt_win$jscomp$4$$ || $ampdoc$jscomp$177$$.$win$;
  this.$doc_$ = this.$D$.document;
  this.$F$ = this.$onAnimationEndEvent_$.bind(this);
  ($opt_win$jscomp$4$$ ? _.$waitForBodyPromise$$module$src$dom$$(this.$doc_$) : $ampdoc$jscomp$177$$.$whenBodyAvailable$()).then(function() {
    var $ampdoc$jscomp$177$$ = $$jscomp$this$jscomp$639$$.$doc_$.body;
    _.$waitForChild$$module$src$dom$$($ampdoc$jscomp$177$$, function() {
      return !!$ampdoc$jscomp$177$$.querySelector("." + _.$cssEscape$$module$third_party$css_escape$css_escape$$("gwd-page-wrapper"));
    }, $$jscomp$this$jscomp$639$$.$AmpGwdRuntimeService$$module$extensions$amp_gwd_animation$0_1$amp_gwd_animation_impl_prototype$initialize_$.bind($$jscomp$this$jscomp$639$$));
  });
}, $JSCompiler_StaticMethods_deactivatePage_$$ = function($pageEl$jscomp$1$$) {
  $pageEl$jscomp$1$$.classList.remove("gwd-play-animation");
  [$pageEl$jscomp$1$$].concat(_.$toArray$$module$src$types$$($pageEl$jscomp$1$$.querySelectorAll("*"))).forEach(function($pageEl$jscomp$1$$) {
    $pageEl$jscomp$1$$.classList.remove("gwd-pause-animation");
    if ($pageEl$jscomp$1$$.hasAttribute("data-gwd-label-animation")) {
      var $el$jscomp$64$$ = $pageEl$jscomp$1$$.getAttribute("data-gwd-label-animation");
      $pageEl$jscomp$1$$.classList.remove($el$jscomp$64$$);
      $pageEl$jscomp$1$$.removeAttribute("data-gwd-label-animation");
    }
    delete $pageEl$jscomp$1$$.__AMP_GWD_GOTO_COUNTERS__;
  });
}, $JSCompiler_StaticMethods_getReceiver$$ = function($JSCompiler_StaticMethods_getReceiver$self_receiver$jscomp$8$$, $id$jscomp$78$$) {
  if ("document.body" == $id$jscomp$78$$) {
    return $JSCompiler_StaticMethods_getReceiver$self_receiver$jscomp$8$$.$doc_$.body;
  }
  if (($JSCompiler_StaticMethods_getReceiver$self_receiver$jscomp$8$$ = $JSCompiler_StaticMethods_getReceiver$self_receiver$jscomp$8$$.$doc_$.getElementById($id$jscomp$78$$)) && $JSCompiler_StaticMethods_getReceiver$self_receiver$jscomp$8$$.classList) {
    return $JSCompiler_StaticMethods_getReceiver$self_receiver$jscomp$8$$;
  }
  _.$user$$module$src$log$$().error("GWD", "Could not get receiver with id " + $id$jscomp$78$$ + ".");
  return null;
}, $GwdAnimation$$module$extensions$amp_gwd_animation$0_1$amp_gwd_animation$$ = function($$jscomp$super$this$jscomp$56_element$jscomp$432$$) {
  $$jscomp$super$this$jscomp$56_element$jscomp$432$$ = window.AMP.BaseElement.call(this, $$jscomp$super$this$jscomp$56_element$jscomp$432$$) || this;
  $$jscomp$super$this$jscomp$56_element$jscomp$432$$.$timelineEventPrefix_$ = "";
  $$jscomp$super$this$jscomp$56_element$jscomp$432$$.$fie_$ = null;
  $$jscomp$super$this$jscomp$56_element$jscomp$432$$.$boundOnGwdTimelineEvent_$ = $$jscomp$super$this$jscomp$56_element$jscomp$432$$.$onGwdTimelineEvent_$.bind($$jscomp$super$this$jscomp$56_element$jscomp$432$$);
  return $$jscomp$super$this$jscomp$56_element$jscomp$432$$;
}, $JSCompiler_StaticMethods_getRoot_$$ = function($JSCompiler_StaticMethods_getRoot_$self$$) {
  return $JSCompiler_StaticMethods_getRoot_$self$$.$fie_$ ? $JSCompiler_StaticMethods_getRoot_$self$$.$fie_$.$win$.document : $JSCompiler_StaticMethods_getRoot_$self$$.$getAmpDoc$().getRootNode();
}, $JSCompiler_StaticMethods_executeInvocation_$$ = function($JSCompiler_StaticMethods_executeInvocation_$self_service$jscomp$27$$, $invocation$jscomp$38$$) {
  $JSCompiler_StaticMethods_executeInvocation_$self_service$jscomp$27$$ = _.$getExistingServiceForDocInEmbedScope$$module$src$service$$($JSCompiler_StaticMethods_executeInvocation_$self_service$jscomp$27$$.element, "gwd");
  var $actionArgs$$ = $ACTION_IMPL_ARGS$$module$extensions$amp_gwd_animation$0_1$amp_gwd_animation$$[$invocation$jscomp$38$$.method].map(function($JSCompiler_StaticMethods_executeInvocation_$self_service$jscomp$27$$) {
    $JSCompiler_StaticMethods_executeInvocation_$self_service$jscomp$27$$ = $JSCompiler_StaticMethods_executeInvocation_$self_service$jscomp$27$$.split(".");
    for (var $actionArgs$$ = $invocation$jscomp$38$$, $argPath_parts$jscomp$inline_3358$$ = 0; $argPath_parts$jscomp$inline_3358$$ < $JSCompiler_StaticMethods_executeInvocation_$self_service$jscomp$27$$.length; $argPath_parts$jscomp$inline_3358$$++) {
      var $part$jscomp$inline_3361$$ = $JSCompiler_StaticMethods_executeInvocation_$self_service$jscomp$27$$[$argPath_parts$jscomp$inline_3358$$];
      if ($part$jscomp$inline_3361$$ && $actionArgs$$ && void 0 !== $actionArgs$$[$part$jscomp$inline_3361$$]) {
        $actionArgs$$ = $actionArgs$$[$part$jscomp$inline_3361$$];
      } else {
        $actionArgs$$ = void 0;
        break;
      }
    }
    return $actionArgs$$;
  });
  $JSCompiler_StaticMethods_executeInvocation_$self_service$jscomp$27$$[$invocation$jscomp$38$$.method].apply($JSCompiler_StaticMethods_executeInvocation_$self_service$jscomp$27$$, $actionArgs$$);
};
var $VENDOR_ANIMATIONEND_EVENTS$$module$extensions$amp_gwd_animation$0_1$amp_gwd_animation_impl$$ = ["animationend", "webkitAnimationEnd"];
$AmpGwdRuntimeService$$module$extensions$amp_gwd_animation$0_1$amp_gwd_animation_impl$$.$installInEmbedWindow$ = function($embedWin$jscomp$13$$, $ampdoc$jscomp$178$$) {
  _.$installServiceInEmbedScope$$module$src$service$$($embedWin$jscomp$13$$, "gwd", new $AmpGwdRuntimeService$$module$extensions$amp_gwd_animation$0_1$amp_gwd_animation_impl$$($ampdoc$jscomp$178$$, $embedWin$jscomp$13$$));
};
_.$JSCompiler_prototypeAlias$$ = $AmpGwdRuntimeService$$module$extensions$amp_gwd_animation$0_1$amp_gwd_animation_impl$$.prototype;
_.$JSCompiler_prototypeAlias$$.$AmpGwdRuntimeService$$module$extensions$amp_gwd_animation$0_1$amp_gwd_animation_impl_prototype$initialize_$ = function() {
  for (var $i$jscomp$inline_3330$$ = 0; $i$jscomp$inline_3330$$ < $VENDOR_ANIMATIONEND_EVENTS$$module$extensions$amp_gwd_animation$0_1$amp_gwd_animation_impl$$.length; $i$jscomp$inline_3330$$++) {
    this.$doc_$.body.addEventListener($VENDOR_ANIMATIONEND_EVENTS$$module$extensions$amp_gwd_animation$0_1$amp_gwd_animation_impl$$[$i$jscomp$inline_3330$$], this.$F$, !0);
  }
  this.$setCurrentPage$();
};
_.$JSCompiler_prototypeAlias$$.$setCurrentPage$ = function() {
  var $gwdPages_newPageEl$$ = this.$doc_$.body.querySelectorAll("." + _.$cssEscape$$module$third_party$css_escape$css_escape$$("gwd-page-wrapper"));
  if (0 == $gwdPages_newPageEl$$.length) {
    _.$user$$module$src$log$$().$Log$$module$src$log_prototype$warn$("GWD", "Could not set current page. No pages were found in the document.");
  } else {
    var $activePageSelector_currentPageEl$$ = "." + _.$cssEscape$$module$third_party$css_escape$css_escape$$("gwd-page-wrapper") + "." + _.$cssEscape$$module$third_party$css_escape$css_escape$$("gwd-play-animation");
    ($activePageSelector_currentPageEl$$ = _.$scopedQuerySelector$$module$src$dom$$(this.$doc_$.body, $activePageSelector_currentPageEl$$)) && $JSCompiler_StaticMethods_deactivatePage_$$($activePageSelector_currentPageEl$$);
    ($gwdPages_newPageEl$$ = $gwdPages_newPageEl$$[0]) ? $gwdPages_newPageEl$$.classList.add("gwd-play-animation") : _.$user$$module$src$log$$().error("GWD", "Could not find page with index 0.");
  }
};
_.$JSCompiler_prototypeAlias$$.play = function($id$jscomp$72_receiver$jscomp$2$$) {
  ($id$jscomp$72_receiver$jscomp$2$$ = $JSCompiler_StaticMethods_getReceiver$$(this, $id$jscomp$72_receiver$jscomp$2$$)) && $id$jscomp$72_receiver$jscomp$2$$.classList.remove("gwd-pause-animation");
};
_.$JSCompiler_prototypeAlias$$.pause = function($id$jscomp$73_receiver$jscomp$3$$) {
  ($id$jscomp$73_receiver$jscomp$3$$ = $JSCompiler_StaticMethods_getReceiver$$(this, $id$jscomp$73_receiver$jscomp$3$$)) && $id$jscomp$73_receiver$jscomp$3$$.classList.add("gwd-pause-animation");
};
_.$JSCompiler_prototypeAlias$$.$onAnimationEndEvent_$ = function($event$jscomp$129_timelineEvent$$) {
  var $userEventName$$ = $event$jscomp$129_timelineEvent$$.target.getAttribute("data-event-name");
  $userEventName$$ && ($event$jscomp$129_timelineEvent$$ = _.$createCustomEvent$$module$src$event_helper$$(this.$D$, "gwd.timelineEvent", _.$dict$$module$src$utils$object$$({eventName:$userEventName$$, sourceEvent:$event$jscomp$129_timelineEvent$$})), this.$doc_$.dispatchEvent($event$jscomp$129_timelineEvent$$));
};
_.$JSCompiler_prototypeAlias$$.$dispose$ = function() {
  for (var $i$jscomp$inline_3340$$ = 0; $i$jscomp$inline_3340$$ < $VENDOR_ANIMATIONEND_EVENTS$$module$extensions$amp_gwd_animation$0_1$amp_gwd_animation_impl$$.length; $i$jscomp$inline_3340$$++) {
    this.$doc_$.body.removeEventListener($VENDOR_ANIMATIONEND_EVENTS$$module$extensions$amp_gwd_animation$0_1$amp_gwd_animation_impl$$[$i$jscomp$inline_3340$$], this.$F$, !0);
  }
};
var $ACTION_IMPL_ARGS$$module$extensions$amp_gwd_animation$0_1$amp_gwd_animation$$ = {play:["args.id"], pause:["args.id"], togglePlay:["args.id"], gotoAndPlay:["args.id", "args.label"], gotoAndPause:["args.id", "args.label"], gotoAndPlayNTimes:["args.id", "args.label", "args.N", "event.detail.eventName"], setCurrentPage:["args.index"]};
_.$$jscomp$inherits$$($GwdAnimation$$module$extensions$amp_gwd_animation$0_1$amp_gwd_animation$$, window.AMP.BaseElement);
$GwdAnimation$$module$extensions$amp_gwd_animation$0_1$amp_gwd_animation$$.prototype.$buildCallback$ = function() {
  this.$timelineEventPrefix_$ = this.element.getAttribute("timeline-event-prefix") || "";
  var $frameElement$jscomp$7_gwdPageDeck_handler$jscomp$46$$ = _.$getParentWindowFrameElement$$module$src$service$$(this.element, this.$getAmpDoc$().$win$);
  $frameElement$jscomp$7_gwdPageDeck_handler$jscomp$46$$ && (this.$fie_$ = _.$getFriendlyIframeEmbedOptional$$module$src$friendly_iframe_embed$$($frameElement$jscomp$7_gwdPageDeck_handler$jscomp$46$$));
  $JSCompiler_StaticMethods_getRoot_$$(this).addEventListener("gwd.timelineEvent", this.$boundOnGwdTimelineEvent_$, !0);
  if ($frameElement$jscomp$7_gwdPageDeck_handler$jscomp$46$$ = $JSCompiler_StaticMethods_getRoot_$$(this).getElementById("pagedeck")) {
    var $context$jscomp$inline_3342$$ = this.element, $actionStr$jscomp$inline_3344$$ = this.element.id + ".setCurrentPage(index=event.index)";
    var $currentActionsStr$jscomp$inline_3347_newActionsStr$jscomp$inline_3346$$ = $frameElement$jscomp$7_gwdPageDeck_handler$jscomp$46$$.getAttribute("on") || "";
    var $actionsStartIndex$jscomp$inline_3350_eventActionsIndex$jscomp$inline_3349$$ = $currentActionsStr$jscomp$inline_3347_newActionsStr$jscomp$inline_3346$$.indexOf("slideChange:");
    -1 != $actionsStartIndex$jscomp$inline_3350_eventActionsIndex$jscomp$inline_3349$$ ? ($actionsStartIndex$jscomp$inline_3350_eventActionsIndex$jscomp$inline_3349$$ += 12, $currentActionsStr$jscomp$inline_3347_newActionsStr$jscomp$inline_3346$$ = $currentActionsStr$jscomp$inline_3347_newActionsStr$jscomp$inline_3346$$.substr(0, $actionsStartIndex$jscomp$inline_3350_eventActionsIndex$jscomp$inline_3349$$) + $actionStr$jscomp$inline_3344$$ + "," + $currentActionsStr$jscomp$inline_3347_newActionsStr$jscomp$inline_3346$$.substr($actionsStartIndex$jscomp$inline_3350_eventActionsIndex$jscomp$inline_3349$$)) : 
    ($currentActionsStr$jscomp$inline_3347_newActionsStr$jscomp$inline_3346$$ && ($currentActionsStr$jscomp$inline_3347_newActionsStr$jscomp$inline_3346$$ += ";"), $currentActionsStr$jscomp$inline_3347_newActionsStr$jscomp$inline_3346$$ += "slideChange:" + $actionStr$jscomp$inline_3344$$);
    _.$Services$$module$src$services$actionServiceForDoc$$($context$jscomp$inline_3342$$);
    $frameElement$jscomp$7_gwdPageDeck_handler$jscomp$46$$.setAttribute("on", $currentActionsStr$jscomp$inline_3347_newActionsStr$jscomp$inline_3346$$);
    delete $frameElement$jscomp$7_gwdPageDeck_handler$jscomp$46$$[_.$ACTION_MAP_$$module$src$service$action_impl$$];
  }
  $frameElement$jscomp$7_gwdPageDeck_handler$jscomp$46$$ = this.$D$.bind(this);
  for (var $name$jscomp$242$$ in $ACTION_IMPL_ARGS$$module$extensions$amp_gwd_animation$0_1$amp_gwd_animation$$) {
    _.$JSCompiler_StaticMethods_registerAction$$(this, $name$jscomp$242$$, $frameElement$jscomp$7_gwdPageDeck_handler$jscomp$46$$);
  }
};
$GwdAnimation$$module$extensions$amp_gwd_animation$0_1$amp_gwd_animation$$.prototype.$D$ = function($invocation$jscomp$36$$) {
  var $JSCompiler_inline_result$jscomp$756_gwdPageDeck$jscomp$inline_3354$$ = "setCurrentPage" == $invocation$jscomp$36$$.method ? ($JSCompiler_inline_result$jscomp$756_gwdPageDeck$jscomp$inline_3354$$ = $JSCompiler_StaticMethods_getRoot_$$(this).getElementById("pagedeck")) && $invocation$jscomp$36$$.source == $JSCompiler_inline_result$jscomp$756_gwdPageDeck$jscomp$inline_3354$$ : !0;
  $JSCompiler_inline_result$jscomp$756_gwdPageDeck$jscomp$inline_3354$$ && $JSCompiler_StaticMethods_executeInvocation_$$(this, $invocation$jscomp$36$$);
};
$GwdAnimation$$module$extensions$amp_gwd_animation$0_1$amp_gwd_animation$$.prototype.$onGwdTimelineEvent_$ = function($event$jscomp$130$$) {
  _.$Services$$module$src$services$actionServiceForDoc$$(this.element).$trigger$(this.element, this.$timelineEventPrefix_$ + $event$jscomp$130$$.detail.eventName, $event$jscomp$130$$, 100);
};
$GwdAnimation$$module$extensions$amp_gwd_animation$0_1$amp_gwd_animation$$.prototype.detachedCallback = function() {
  $JSCompiler_StaticMethods_getRoot_$$(this).removeEventListener("gwd.timelineEvent", this.$boundOnGwdTimelineEvent_$, !0);
  return !0;
};
var $AMP$jscomp$inline_3363$$ = window.self.AMP;
$AMP$jscomp$inline_3363$$.registerServiceForDoc("gwd", $AmpGwdRuntimeService$$module$extensions$amp_gwd_animation$0_1$amp_gwd_animation_impl$$);
$AMP$jscomp$inline_3363$$.registerElement("amp-gwd-animation", $GwdAnimation$$module$extensions$amp_gwd_animation$0_1$amp_gwd_animation$$, ".i-amphtml-gwd-animation-disabled [class*=-animation],.i-amphtml-gwd-animation-disabled [class*=gwdanimation]{-webkit-animation:none!important;animation:none!important}\n/*# sourceURL=/extensions/amp-gwd-animation/0.1/amp-gwd-animation.css*/");

})});
