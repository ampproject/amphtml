(self.AMP=self.AMP||[]).push({n:"amp-lightbox",i:["_base_i","_base_misc"],v:"1901181729101",f:(function(AMP,_){
var $AmpLightbox$$module$extensions$amp_lightbox$0_1$amp_lightbox$$ = function($element$jscomp$484$$) {
  var $$jscomp$super$this$jscomp$70$$ = window.AMP.BaseElement.call(this, $element$jscomp$484$$) || this;
  $$jscomp$super$this$jscomp$70$$.$size_$ = null;
  $$jscomp$super$this$jscomp$70$$.$container_$ = null;
  $$jscomp$super$this$jscomp$70$$.$action_$ = null;
  $$jscomp$super$this$jscomp$70$$.$componentDescendants_$ = null;
  $$jscomp$super$this$jscomp$70$$.$historyId_$ = -1;
  $$jscomp$super$this$jscomp$70$$.$active_$ = !1;
  $$jscomp$super$this$jscomp$70$$.$boundCloseOnEscape_$ = null;
  $$jscomp$super$this$jscomp$70$$.$isScrollable_$ = !1;
  $$jscomp$super$this$jscomp$70$$.$pos_$ = 0;
  $$jscomp$super$this$jscomp$70$$.$oldPos_$ = 0;
  $$jscomp$super$this$jscomp$70$$.$eventCounter_$ = 0;
  $$jscomp$super$this$jscomp$70$$.$scrollTimerId_$ = null;
  $$jscomp$super$this$jscomp$70$$.$animationPreset_$ = ($element$jscomp$484$$.getAttribute("animate-in") || "fade-in").toLowerCase();
  $$jscomp$super$this$jscomp$70$$.$closeButtonHeader_$ = null;
  $$jscomp$super$this$jscomp$70$$.$boundReschedule_$ = _.$debounce$$module$src$utils$rate_limit$$($$jscomp$super$this$jscomp$70$$.$win$, function() {
    var $element$jscomp$484$$ = _.$JSCompiler_StaticMethods_assertElement$$(_.$user$$module$src$log$$(), $$jscomp$super$this$jscomp$70$$.$container_$, "E#19457 this.container_");
    $$jscomp$super$this$jscomp$70$$.$scheduleLayout$($element$jscomp$484$$);
    $$jscomp$super$this$jscomp$70$$.$scheduleResume$($element$jscomp$484$$);
  }, 500);
  return $$jscomp$super$this$jscomp$70$$;
}, $JSCompiler_StaticMethods_takeOwnershipOfDescendants_$$ = function($JSCompiler_StaticMethods_takeOwnershipOfDescendants_$self$$) {
  $JSCompiler_StaticMethods_getComponentDescendants_$$($JSCompiler_StaticMethods_takeOwnershipOfDescendants_$self$$, !0).forEach(function($child$jscomp$24$$) {
    _.$Resource$$module$src$service$resource$setOwner$$($child$jscomp$24$$, $JSCompiler_StaticMethods_takeOwnershipOfDescendants_$self$$.element);
  });
}, $JSCompiler_StaticMethods_getComponentDescendants_$$ = function($JSCompiler_StaticMethods_getComponentDescendants_$self$$, $opt_refresh$jscomp$3$$) {
  if (!$JSCompiler_StaticMethods_getComponentDescendants_$self$$.$componentDescendants_$ || $opt_refresh$jscomp$3$$) {
    $JSCompiler_StaticMethods_getComponentDescendants_$self$$.$componentDescendants_$ = _.$toArray$$module$src$types$$($JSCompiler_StaticMethods_getComponentDescendants_$self$$.element.getElementsByClassName("i-amphtml-element"));
  }
  return $JSCompiler_StaticMethods_getComponentDescendants_$self$$.$componentDescendants_$;
}, $JSCompiler_StaticMethods_AmpLightbox$$module$extensions$amp_lightbox$0_1$amp_lightbox_prototype$initialize_$$ = function($JSCompiler_StaticMethods_AmpLightbox$$module$extensions$amp_lightbox$0_1$amp_lightbox_prototype$initialize_$self$$) {
  if (!$JSCompiler_StaticMethods_AmpLightbox$$module$extensions$amp_lightbox$0_1$amp_lightbox_prototype$initialize_$self$$.$container_$) {
    var $element$jscomp$485$$ = $JSCompiler_StaticMethods_AmpLightbox$$module$extensions$amp_lightbox$0_1$amp_lightbox_prototype$initialize_$self$$.element;
    $JSCompiler_StaticMethods_AmpLightbox$$module$extensions$amp_lightbox$0_1$amp_lightbox_prototype$initialize_$self$$.$isScrollable_$ = $element$jscomp$485$$.hasAttribute("scrollable");
    var $children$jscomp$140$$ = $JSCompiler_StaticMethods_AmpLightbox$$module$extensions$amp_lightbox$0_1$amp_lightbox_prototype$initialize_$self$$.$getRealChildren$();
    $JSCompiler_StaticMethods_AmpLightbox$$module$extensions$amp_lightbox$0_1$amp_lightbox_prototype$initialize_$self$$.$container_$ = $element$jscomp$485$$.ownerDocument.createElement("div");
    $JSCompiler_StaticMethods_AmpLightbox$$module$extensions$amp_lightbox$0_1$amp_lightbox_prototype$initialize_$self$$.$isScrollable_$ || _.$JSCompiler_StaticMethods_applyFillContent$$($JSCompiler_StaticMethods_AmpLightbox$$module$extensions$amp_lightbox$0_1$amp_lightbox_prototype$initialize_$self$$.$container_$);
    $element$jscomp$485$$.appendChild($JSCompiler_StaticMethods_AmpLightbox$$module$extensions$amp_lightbox$0_1$amp_lightbox_prototype$initialize_$self$$.$container_$);
    $children$jscomp$140$$.forEach(function($element$jscomp$485$$) {
      $JSCompiler_StaticMethods_AmpLightbox$$module$extensions$amp_lightbox$0_1$amp_lightbox_prototype$initialize_$self$$.$container_$.appendChild($element$jscomp$485$$);
    });
    $JSCompiler_StaticMethods_AmpLightbox$$module$extensions$amp_lightbox$0_1$amp_lightbox_prototype$initialize_$self$$.$isScrollable_$ && ($JSCompiler_StaticMethods_takeOwnershipOfDescendants_$$($JSCompiler_StaticMethods_AmpLightbox$$module$extensions$amp_lightbox$0_1$amp_lightbox_prototype$initialize_$self$$), $element$jscomp$485$$.classList.add("i-amphtml-scrollable"), $element$jscomp$485$$.addEventListener("amp:dom-update", function() {
      $JSCompiler_StaticMethods_takeOwnershipOfDescendants_$$($JSCompiler_StaticMethods_AmpLightbox$$module$extensions$amp_lightbox$0_1$amp_lightbox_prototype$initialize_$self$$);
      $JSCompiler_StaticMethods_updateChildrenInViewport_$$($JSCompiler_StaticMethods_AmpLightbox$$module$extensions$amp_lightbox$0_1$amp_lightbox_prototype$initialize_$self$$, $JSCompiler_StaticMethods_AmpLightbox$$module$extensions$amp_lightbox$0_1$amp_lightbox_prototype$initialize_$self$$.$pos_$, $JSCompiler_StaticMethods_AmpLightbox$$module$extensions$amp_lightbox$0_1$amp_lightbox_prototype$initialize_$self$$.$pos_$);
    }), $element$jscomp$485$$.addEventListener("scroll", $JSCompiler_StaticMethods_AmpLightbox$$module$extensions$amp_lightbox$0_1$amp_lightbox_prototype$initialize_$self$$.$AmpLightbox$$module$extensions$amp_lightbox$0_1$amp_lightbox_prototype$scrollHandler_$.bind($JSCompiler_StaticMethods_AmpLightbox$$module$extensions$amp_lightbox$0_1$amp_lightbox_prototype$initialize_$self$$)));
    $JSCompiler_StaticMethods_AmpLightbox$$module$extensions$amp_lightbox$0_1$amp_lightbox_prototype$initialize_$self$$.$isScrollable_$ || _.$JSCompiler_StaticMethods_onGesture$$(_.$Gestures$$module$src$gesture$get$$($element$jscomp$485$$), _.$SwipeXYRecognizer$$module$src$gesture_recognizers$$, function() {
    });
  }
}, $JSCompiler_StaticMethods_handleAutofocus_$$ = function($JSCompiler_StaticMethods_handleAutofocus_$self_autofocusElement$$) {
  ($JSCompiler_StaticMethods_handleAutofocus_$self_autofocusElement$$ = $JSCompiler_StaticMethods_handleAutofocus_$self_autofocusElement$$.$container_$.querySelector("[autofocus]")) && _.$tryFocus$$module$src$dom$$($JSCompiler_StaticMethods_handleAutofocus_$self_autofocusElement$$);
}, $JSCompiler_StaticMethods_finalizeOpen_$$ = function($JSCompiler_StaticMethods_finalizeOpen_$self$$) {
  var $element$jscomp$486$$ = $JSCompiler_StaticMethods_finalizeOpen_$self$$.element, $$jscomp$destructuring$var441_closedStyle_container$jscomp$18$$ = $AnimationPresets$$module$extensions$amp_lightbox$0_1$amp_lightbox$$[$JSCompiler_StaticMethods_finalizeOpen_$self$$.$animationPreset_$], $durationSeconds$jscomp$2$$ = $$jscomp$destructuring$var441_closedStyle_container$jscomp$18$$.$durationSeconds$, $openStyle$$ = $$jscomp$destructuring$var441_closedStyle_container$jscomp$18$$.$openStyle$;
  $$jscomp$destructuring$var441_closedStyle_container$jscomp$18$$ = $$jscomp$destructuring$var441_closedStyle_container$jscomp$18$$.$closedStyle$;
  var $transition$jscomp$9$$ = Object.keys($openStyle$$).map(function($JSCompiler_StaticMethods_finalizeOpen_$self$$) {
    return $JSCompiler_StaticMethods_finalizeOpen_$self$$ + " " + $durationSeconds$jscomp$2$$ + "s ease-in";
  }).join(",");
  $JSCompiler_StaticMethods_finalizeOpen_$self$$.$eventCounter_$++;
  $JSCompiler_StaticMethods_finalizeOpen_$self$$.$isScrollable_$ && _.$setStyle$$module$src$style$$($element$jscomp$486$$, "webkitOverflowScrolling", "touch");
  _.$setStyle$$module$src$style$$($element$jscomp$486$$, "transition", $transition$jscomp$9$$);
  _.$setStyles$$module$src$style$$($element$jscomp$486$$, _.$assertDoesNotContainDisplay$$module$src$style$$($$jscomp$destructuring$var441_closedStyle_container$jscomp$18$$));
  _.$toggle$$module$src$style$$($element$jscomp$486$$, !0);
  $JSCompiler_StaticMethods_finalizeOpen_$self$$.$mutateElement$(function() {
    $element$jscomp$486$$.scrollTop = 0;
  });
  $JSCompiler_StaticMethods_handleAutofocus_$$($JSCompiler_StaticMethods_finalizeOpen_$self$$);
  $JSCompiler_StaticMethods_maybeRenderCloseButtonHeader_$$($JSCompiler_StaticMethods_finalizeOpen_$self$$);
  $JSCompiler_StaticMethods_finalizeOpen_$self$$.$mutateElement$(function() {
    _.$setStyles$$module$src$style$$($element$jscomp$486$$, _.$assertDoesNotContainDisplay$$module$src$style$$($openStyle$$));
  });
  $$jscomp$destructuring$var441_closedStyle_container$jscomp$18$$ = $JSCompiler_StaticMethods_finalizeOpen_$self$$.$container_$;
  $JSCompiler_StaticMethods_finalizeOpen_$self$$.$isScrollable_$ ? ($JSCompiler_StaticMethods_finalizeOpen_$self$$.$AmpLightbox$$module$extensions$amp_lightbox$0_1$amp_lightbox_prototype$scrollHandler_$(), $JSCompiler_StaticMethods_updateChildrenInViewport_$$($JSCompiler_StaticMethods_finalizeOpen_$self$$, $JSCompiler_StaticMethods_finalizeOpen_$self$$.$pos_$, $JSCompiler_StaticMethods_finalizeOpen_$self$$.$pos_$)) : $JSCompiler_StaticMethods_finalizeOpen_$self$$.$updateInViewport$($$jscomp$destructuring$var441_closedStyle_container$jscomp$18$$, 
  !0);
  $element$jscomp$486$$.addEventListener("transitionend", $JSCompiler_StaticMethods_finalizeOpen_$self$$.$boundReschedule_$);
  $element$jscomp$486$$.addEventListener("animationend", $JSCompiler_StaticMethods_finalizeOpen_$self$$.$boundReschedule_$);
  $JSCompiler_StaticMethods_finalizeOpen_$self$$.$scheduleLayout$($$jscomp$destructuring$var441_closedStyle_container$jscomp$18$$);
  $JSCompiler_StaticMethods_finalizeOpen_$self$$.$scheduleResume$($$jscomp$destructuring$var441_closedStyle_container$jscomp$18$$);
  $JSCompiler_StaticMethods_AmpLightbox$$module$extensions$amp_lightbox$0_1$amp_lightbox_prototype$triggerEvent_$$($JSCompiler_StaticMethods_finalizeOpen_$self$$, "lightboxOpen");
  _.$Services$$module$src$services$historyForDoc$$($JSCompiler_StaticMethods_finalizeOpen_$self$$.$getAmpDoc$()).push($JSCompiler_StaticMethods_finalizeOpen_$self$$.close.bind($JSCompiler_StaticMethods_finalizeOpen_$self$$)).then(function($element$jscomp$486$$) {
    $JSCompiler_StaticMethods_finalizeOpen_$self$$.$historyId_$ = $element$jscomp$486$$;
  });
  $JSCompiler_StaticMethods_finalizeOpen_$self$$.$active_$ = !0;
}, $JSCompiler_StaticMethods_maybeRenderCloseButtonHeader_$$ = function($JSCompiler_StaticMethods_maybeRenderCloseButtonHeader_$self$$) {
  var $element$jscomp$487$$ = $JSCompiler_StaticMethods_maybeRenderCloseButtonHeader_$self$$.element;
  if (null != $element$jscomp$487$$.getAttribute("close-button")) {
    var $header$jscomp$11$$ = _.$htmlFor$$module$src$static_template$$($element$jscomp$487$$)($_template$$module$extensions$amp_lightbox$0_1$amp_lightbox$$);
    $JSCompiler_StaticMethods_maybeRenderCloseButtonHeader_$self$$.$closeButtonHeader_$ = $header$jscomp$11$$;
    _.$listenOnce$$module$src$event_helper$$($header$jscomp$11$$, "click", function() {
      return $JSCompiler_StaticMethods_maybeRenderCloseButtonHeader_$self$$.close();
    });
    $element$jscomp$487$$.insertBefore($header$jscomp$11$$, $JSCompiler_StaticMethods_maybeRenderCloseButtonHeader_$self$$.$container_$);
    var $headerHeight$$;
    $JSCompiler_StaticMethods_maybeRenderCloseButtonHeader_$self$$.$measureMutateElement$(function() {
      $headerHeight$$ = $header$jscomp$11$$.getBoundingClientRect().height;
    }, function() {
      $header$jscomp$11$$.classList.add("amp-ad-close-header");
      _.$setImportantStyles$$module$src$style$$($JSCompiler_StaticMethods_maybeRenderCloseButtonHeader_$self$$.$container_$, {"margin-top":_.$px$$module$src$style$$($headerHeight$$), "min-height":"calc(100vh - " + _.$px$$module$src$style$$($headerHeight$$) + ")"});
    });
  }
}, $JSCompiler_StaticMethods_finalizeClose_$$ = function($JSCompiler_StaticMethods_finalizeClose_$self$$) {
  function $collapseAndReschedule$$() {
    $event$jscomp$152$$ == $JSCompiler_StaticMethods_finalizeClose_$self$$.$eventCounter_$ && ($JSCompiler_StaticMethods_finalizeClose_$self$$.collapse(), $JSCompiler_StaticMethods_finalizeClose_$self$$.$boundReschedule_$());
  }
  var $element$jscomp$488$$ = $JSCompiler_StaticMethods_finalizeClose_$self$$.element, $event$jscomp$152$$ = ++$JSCompiler_StaticMethods_finalizeClose_$self$$.$eventCounter_$;
  $JSCompiler_StaticMethods_isInAd_$$($JSCompiler_StaticMethods_finalizeClose_$self$$) ? (_.$resetStyles$$module$src$style$$($element$jscomp$488$$, ["transition"]), $collapseAndReschedule$$()) : ($element$jscomp$488$$.addEventListener("transitionend", $collapseAndReschedule$$), $element$jscomp$488$$.addEventListener("animationend", $collapseAndReschedule$$));
  _.$setStyles$$module$src$style$$($element$jscomp$488$$, _.$assertDoesNotContainDisplay$$module$src$style$$($AnimationPresets$$module$extensions$amp_lightbox$0_1$amp_lightbox$$[$JSCompiler_StaticMethods_finalizeClose_$self$$.$animationPreset_$].$closedStyle$));
  -1 != $JSCompiler_StaticMethods_finalizeClose_$self$$.$historyId_$ && _.$Services$$module$src$services$historyForDoc$$($JSCompiler_StaticMethods_finalizeClose_$self$$.$getAmpDoc$()).pop($JSCompiler_StaticMethods_finalizeClose_$self$$.$historyId_$);
  $JSCompiler_StaticMethods_finalizeClose_$self$$.$win$.document.documentElement.removeEventListener("keydown", $JSCompiler_StaticMethods_finalizeClose_$self$$.$boundCloseOnEscape_$);
  $JSCompiler_StaticMethods_finalizeClose_$self$$.$boundCloseOnEscape_$ = null;
  $JSCompiler_StaticMethods_finalizeClose_$self$$.$schedulePause$($JSCompiler_StaticMethods_finalizeClose_$self$$.$container_$);
  $JSCompiler_StaticMethods_finalizeClose_$self$$.$active_$ = !1;
  $JSCompiler_StaticMethods_AmpLightbox$$module$extensions$amp_lightbox$0_1$amp_lightbox_prototype$triggerEvent_$$($JSCompiler_StaticMethods_finalizeClose_$self$$, "lightboxClose");
}, $JSCompiler_StaticMethods_isInAd_$$ = function($JSCompiler_StaticMethods_isInAd_$self$$) {
  return "inabox" == _.$getMode$$module$src$mode$$($JSCompiler_StaticMethods_isInAd_$self$$.$win$).runtime || _.$isInFie$$module$src$friendly_iframe_embed$$($JSCompiler_StaticMethods_isInAd_$self$$.element);
}, $JSCompiler_StaticMethods_AmpLightbox$$module$extensions$amp_lightbox$0_1$amp_lightbox_prototype$waitForScroll_$$ = function($JSCompiler_StaticMethods_AmpLightbox$$module$extensions$amp_lightbox$0_1$amp_lightbox_prototype$waitForScroll_$self$$, $startingScrollTop$$) {
  $JSCompiler_StaticMethods_AmpLightbox$$module$extensions$amp_lightbox$0_1$amp_lightbox_prototype$waitForScroll_$self$$.$scrollTimerId_$ = _.$Services$$module$src$services$timerFor$$($JSCompiler_StaticMethods_AmpLightbox$$module$extensions$amp_lightbox$0_1$amp_lightbox_prototype$waitForScroll_$self$$.$win$).delay(function() {
    if (30 > Math.abs($startingScrollTop$$ - $JSCompiler_StaticMethods_AmpLightbox$$module$extensions$amp_lightbox$0_1$amp_lightbox_prototype$waitForScroll_$self$$.$pos_$)) {
      "amp-lightbox";
      $JSCompiler_StaticMethods_AmpLightbox$$module$extensions$amp_lightbox$0_1$amp_lightbox_prototype$waitForScroll_$self$$.$scrollTimerId_$ = null;
      var $pos$jscomp$inline_3589$$ = $JSCompiler_StaticMethods_AmpLightbox$$module$extensions$amp_lightbox$0_1$amp_lightbox_prototype$waitForScroll_$self$$.$pos_$;
      "amp-lightbox";
      $JSCompiler_StaticMethods_updateChildrenInViewport_$$($JSCompiler_StaticMethods_AmpLightbox$$module$extensions$amp_lightbox$0_1$amp_lightbox_prototype$waitForScroll_$self$$, $pos$jscomp$inline_3589$$, $JSCompiler_StaticMethods_AmpLightbox$$module$extensions$amp_lightbox$0_1$amp_lightbox_prototype$waitForScroll_$self$$.$oldPos_$);
      $JSCompiler_StaticMethods_AmpLightbox$$module$extensions$amp_lightbox$0_1$amp_lightbox_prototype$waitForScroll_$self$$.$oldPos_$ = $pos$jscomp$inline_3589$$;
      $JSCompiler_StaticMethods_AmpLightbox$$module$extensions$amp_lightbox$0_1$amp_lightbox_prototype$waitForScroll_$self$$.$pos_$ = $pos$jscomp$inline_3589$$;
    } else {
      "amp-lightbox", $JSCompiler_StaticMethods_AmpLightbox$$module$extensions$amp_lightbox$0_1$amp_lightbox_prototype$waitForScroll_$$($JSCompiler_StaticMethods_AmpLightbox$$module$extensions$amp_lightbox$0_1$amp_lightbox_prototype$waitForScroll_$self$$, $JSCompiler_StaticMethods_AmpLightbox$$module$extensions$amp_lightbox$0_1$amp_lightbox_prototype$waitForScroll_$self$$.$pos_$);
    }
  }, 100);
}, $JSCompiler_StaticMethods_updateChildrenInViewport_$$ = function($JSCompiler_StaticMethods_updateChildrenInViewport_$self$$, $newPos$jscomp$9$$, $oldPos$jscomp$3$$) {
  var $seen$jscomp$3$$ = [];
  $JSCompiler_StaticMethods_forEachVisibleChild_$$($JSCompiler_StaticMethods_updateChildrenInViewport_$self$$, $newPos$jscomp$9$$, function($newPos$jscomp$9$$) {
    $seen$jscomp$3$$.push($newPos$jscomp$9$$);
    $JSCompiler_StaticMethods_updateChildrenInViewport_$self$$.$updateInViewport$($newPos$jscomp$9$$, !0);
    $JSCompiler_StaticMethods_updateChildrenInViewport_$self$$.$scheduleLayout$($newPos$jscomp$9$$);
  });
  $oldPos$jscomp$3$$ != $newPos$jscomp$9$$ && $JSCompiler_StaticMethods_forEachVisibleChild_$$($JSCompiler_StaticMethods_updateChildrenInViewport_$self$$, $oldPos$jscomp$3$$, function($newPos$jscomp$9$$) {
    $seen$jscomp$3$$.includes($newPos$jscomp$9$$) || $JSCompiler_StaticMethods_updateChildrenInViewport_$self$$.$updateInViewport$($newPos$jscomp$9$$, !1);
  });
}, $JSCompiler_StaticMethods_forEachVisibleChild_$$ = function($JSCompiler_StaticMethods_forEachVisibleChild_$self$$, $pos$jscomp$48$$, $callback$jscomp$119$$) {
  $JSCompiler_StaticMethods_forEachVisibleChild_$self$$.$size_$ || ($JSCompiler_StaticMethods_forEachVisibleChild_$self$$.$size_$ = {width:$JSCompiler_StaticMethods_forEachVisibleChild_$self$$.element.clientWidth, height:$JSCompiler_StaticMethods_forEachVisibleChild_$self$$.element.clientHeight});
  for (var $containerHeight$$ = $JSCompiler_StaticMethods_forEachVisibleChild_$self$$.$size_$.height, $descendants$$ = $JSCompiler_StaticMethods_getComponentDescendants_$$($JSCompiler_StaticMethods_forEachVisibleChild_$self$$), $i$jscomp$346$$ = 0; $i$jscomp$346$$ < $descendants$$.length; $i$jscomp$346$$++) {
    for (var $descendant$jscomp$1$$ = $descendants$$[$i$jscomp$346$$], $offsetTop$jscomp$2$$ = 0, $n$jscomp$43_visibilityMargin$$ = $descendant$jscomp$1$$; $n$jscomp$43_visibilityMargin$$ && $JSCompiler_StaticMethods_forEachVisibleChild_$self$$.element.contains($n$jscomp$43_visibilityMargin$$); $n$jscomp$43_visibilityMargin$$ = $n$jscomp$43_visibilityMargin$$.offsetParent) {
      $offsetTop$jscomp$2$$ += $n$jscomp$43_visibilityMargin$$.offsetTop;
    }
    $n$jscomp$43_visibilityMargin$$ = 2 * $containerHeight$$;
    $offsetTop$jscomp$2$$ + $descendant$jscomp$1$$.offsetHeight >= $pos$jscomp$48$$ - $n$jscomp$43_visibilityMargin$$ && $offsetTop$jscomp$2$$ <= $pos$jscomp$48$$ + $n$jscomp$43_visibilityMargin$$ && $callback$jscomp$119$$($descendant$jscomp$1$$);
  }
}, $JSCompiler_StaticMethods_maybeSetTransparentBody_$$ = function($JSCompiler_StaticMethods_maybeSetTransparentBody_$self$$) {
  var $win$jscomp$361$$ = $JSCompiler_StaticMethods_maybeSetTransparentBody_$self$$.$win$;
  _.$isInFie$$module$src$friendly_iframe_embed$$($JSCompiler_StaticMethods_maybeSetTransparentBody_$self$$.element) && $setTransparentBody$$module$extensions$amp_lightbox$0_1$amp_lightbox$$($win$jscomp$361$$, $win$jscomp$361$$.document.body);
}, $JSCompiler_StaticMethods_AmpLightbox$$module$extensions$amp_lightbox$0_1$amp_lightbox_prototype$triggerEvent_$$ = function($JSCompiler_StaticMethods_AmpLightbox$$module$extensions$amp_lightbox$0_1$amp_lightbox_prototype$triggerEvent_$self$$, $name$jscomp$246$$) {
  var $event$jscomp$153$$ = _.$createCustomEvent$$module$src$event_helper$$($JSCompiler_StaticMethods_AmpLightbox$$module$extensions$amp_lightbox$0_1$amp_lightbox_prototype$triggerEvent_$self$$.$win$, "amp-lightbox." + $name$jscomp$246$$, _.$dict$$module$src$utils$object$$({}));
  $JSCompiler_StaticMethods_AmpLightbox$$module$extensions$amp_lightbox$0_1$amp_lightbox_prototype$triggerEvent_$self$$.$action_$.$trigger$($JSCompiler_StaticMethods_AmpLightbox$$module$extensions$amp_lightbox$0_1$amp_lightbox_prototype$triggerEvent_$self$$.element, $name$jscomp$246$$, $event$jscomp$153$$, 100);
}, $setTransparentBody$$module$extensions$amp_lightbox$0_1$amp_lightbox$$ = function($win$jscomp$362$$, $body$jscomp$29$$) {
  var $JSCompiler_object_inline_alreadyTransparent_410$$, $ampdoc$jscomp$185$$ = _.$Services$$module$src$services$ampdocServiceFor$$($win$jscomp$362$$).$getAmpDoc$();
  _.$Services$$module$src$services$resourcesForDoc$$($ampdoc$jscomp$185$$).$measureMutateElement$($body$jscomp$29$$, function() {
    $JSCompiler_object_inline_alreadyTransparent_410$$ = "rgba(0, 0, 0, 0)" == _.$computedStyle$$module$src$style$$($win$jscomp$362$$, $body$jscomp$29$$)["background-color"];
  }, function() {
    $JSCompiler_object_inline_alreadyTransparent_410$$ || _.$user$$module$src$log$$().$Log$$module$src$log_prototype$warn$("amp-lightbox", "The background of the <body> element has been forced to transparent. If you need to set background, use an intermediate container.");
    _.$setImportantStyles$$module$src$style$$($body$jscomp$29$$, {background:"transparent"});
  });
};
var $_template$$module$extensions$amp_lightbox$0_1$amp_lightbox$$ = ['<i-amphtml-ad-close-header role=button tabindex=0 aria-label="Close Ad"><div>Ad</div><i-amphtml-ad-close-button class=amp-ad-close-button></i-amphtml-ad-close-button></i-amphtml-ad-close-header>'], $AnimationPresets$$module$extensions$amp_lightbox$0_1$amp_lightbox$$ = {"fade-in":{$openStyle$:_.$dict$$module$src$utils$object$$({opacity:1}), $closedStyle$:_.$dict$$module$src$utils$object$$({opacity:0}), $durationSeconds$:0.1}, "fly-in-bottom":{$openStyle$:_.$dict$$module$src$utils$object$$({transform:"translate(0, 0)"}), 
$closedStyle$:_.$dict$$module$src$utils$object$$({transform:"translate(0, 100%)"}), $durationSeconds$:0.2}, "fly-in-top":{$openStyle$:_.$dict$$module$src$utils$object$$({transform:"translate(0, 0)"}), $closedStyle$:_.$dict$$module$src$utils$object$$({transform:"translate(0, -100%)"}), $durationSeconds$:0.2}};
_.$$jscomp$inherits$$($AmpLightbox$$module$extensions$amp_lightbox$0_1$amp_lightbox$$, window.AMP.BaseElement);
_.$JSCompiler_prototypeAlias$$ = $AmpLightbox$$module$extensions$amp_lightbox$0_1$amp_lightbox$$.prototype;
_.$JSCompiler_prototypeAlias$$.$buildCallback$ = function() {
  var $$jscomp$this$jscomp$725$$ = this;
  this.$user$().$Log$$module$src$log_prototype$assert$(_.$hasOwn$$module$src$utils$object$$($AnimationPresets$$module$extensions$amp_lightbox$0_1$amp_lightbox$$, this.$animationPreset_$), "Invalid `animate-in` value %s", this.$animationPreset_$);
  this.element.classList.add("i-amphtml-overlay");
  this.$action_$ = _.$Services$$module$src$services$actionServiceForDoc$$(this.element);
  $JSCompiler_StaticMethods_maybeSetTransparentBody_$$(this);
  _.$JSCompiler_StaticMethods_registerDefaultAction$$(this, function() {
    return $$jscomp$this$jscomp$725$$.$open_$();
  }, "open");
  _.$JSCompiler_StaticMethods_registerAction$$(this, "close", this.close.bind(this));
};
_.$JSCompiler_prototypeAlias$$.$layoutCallback$ = function() {
  return window.Promise.resolve();
};
_.$JSCompiler_prototypeAlias$$.$open_$ = function() {
  var $$jscomp$this$jscomp$728$$ = this;
  this.$active_$ || ($JSCompiler_StaticMethods_AmpLightbox$$module$extensions$amp_lightbox$0_1$amp_lightbox_prototype$initialize_$$(this), this.$boundCloseOnEscape_$ = this.$closeOnEscape_$.bind(this), this.$win$.document.documentElement.addEventListener("keydown", this.$boundCloseOnEscape_$), _.$JSCompiler_StaticMethods_enterLightboxMode$$(this.$getViewport$(), this.element).then(function() {
    return $JSCompiler_StaticMethods_finalizeOpen_$$($$jscomp$this$jscomp$728$$);
  }));
};
_.$JSCompiler_prototypeAlias$$.$mutatedAttributesCallback$ = function($mutations$jscomp$11_open$jscomp$2$$) {
  $mutations$jscomp$11_open$jscomp$2$$ = $mutations$jscomp$11_open$jscomp$2$$.open;
  void 0 !== $mutations$jscomp$11_open$jscomp$2$$ && ($mutations$jscomp$11_open$jscomp$2$$ ? this.$open_$() : this.close());
};
_.$JSCompiler_prototypeAlias$$.$closeOnEscape_$ = function($event$jscomp$151$$) {
  "Escape" == $event$jscomp$151$$.key && ($event$jscomp$151$$.preventDefault(), this.close());
};
_.$JSCompiler_prototypeAlias$$.close = function() {
  var $$jscomp$this$jscomp$731$$ = this;
  this.$active_$ && (this.$isScrollable_$ && _.$setStyle$$module$src$style$$(this.element, "webkitOverflowScrolling", ""), this.$closeButtonHeader_$ && (_.$removeElement$$module$src$dom$$(this.$closeButtonHeader_$), this.$closeButtonHeader_$ = null), _.$JSCompiler_StaticMethods_leaveLightboxMode$$(this.$getViewport$(), this.element).then(function() {
    return $JSCompiler_StaticMethods_finalizeClose_$$($$jscomp$this$jscomp$731$$);
  }));
};
_.$JSCompiler_prototypeAlias$$.$AmpLightbox$$module$extensions$amp_lightbox$0_1$amp_lightbox_prototype$scrollHandler_$ = function() {
  var $currentScrollTop$$ = this.element.scrollTop || 1;
  this.$pos_$ = this.element.scrollTop = $currentScrollTop$$;
  null === this.$scrollTimerId_$ && $JSCompiler_StaticMethods_AmpLightbox$$module$extensions$amp_lightbox$0_1$amp_lightbox_prototype$waitForScroll_$$(this, $currentScrollTop$$);
};
var $AMP$jscomp$inline_3593$$ = window.self.AMP;
"inabox" == _.$getMode$$module$src$mode$$().runtime && $setTransparentBody$$module$extensions$amp_lightbox$0_1$amp_lightbox$$(window, window.document.body);
$AMP$jscomp$inline_3593$$.registerElement("amp-lightbox", $AmpLightbox$$module$extensions$amp_lightbox$0_1$amp_lightbox$$, "amp-lightbox{display:none;position:fixed!important;z-index:1000;top:0!important;left:0!important;bottom:0!important;right:0!important}amp-lightbox[scrollable]{overflow-y:auto!important;overflow-x:hidden!important}i-amphtml-ad-close-header{height:60px!important;display:block!important;visibility:visible!important;opacity:0;position:fixed!important;top:0!important;left:0!important;right:0!important;z-index:1000!important;display:-webkit-box!important;display:-ms-flexbox!important;display:flex!important;-webkit-box-align:center!important;-ms-flex-align:center!important;align-items:center!important;-webkit-box-pack:right!important;-ms-flex-pack:right!important;justify-content:right!important;-webkit-transition:opacity 0.1s ease-in;transition:opacity 0.1s ease-in}[animate-in=fly-in-bottom]>i-amphtml-ad-close-header,[animate-in=fly-in-top]>i-amphtml-ad-close-header{-webkit-transition-delay:0.2s;transition-delay:0.2s}.amp-ad-close-header{opacity:1!important;box-sizing:border-box;padding:5px;line-height:40px;background-color:#000;color:#fff;font-family:Helvetica,sans-serif;font-size:12px;cursor:pointer}.amp-ad-close-header>:first-child{margin-left:auto!important;pointer-events:none!important}.amp-ad-close-button{display:block!important;background:url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' fill='%23fff'%3E%3Cpath d='M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z'/%3E%3Cpath d='M0 0h24v24H0z' fill='none'/%3E%3C/svg%3E\") no-repeat;background-position:50%;width:40px;height:40px;pointer-events:none!important;border-radius:40px;margin-left:5px}.amp-ad-close-header:active>.amp-ad-close-button{background-color:hsla(0,0%,100%,0.3)}\n/*# sourceURL=/extensions/amp-lightbox/0.1/amp-lightbox.css*/");

})});
