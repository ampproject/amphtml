(self.AMP=self.AMP||[]).push({n:"amp-accordion",i:["_base_i","_base_misc"],v:"1901181729101",f:(function(AMP,_){
var $px$$module$src$transition$$ = function($transition$jscomp$5$$) {
  return function($time$jscomp$11$$) {
    return $transition$jscomp$5$$($time$jscomp$11$$) + "px";
  };
}, $AmpAccordion$$module$extensions$amp_accordion$0_1$amp_accordion$$ = function($element$jscomp$281$$) {
  var $$jscomp$super$this$jscomp$5$$ = window.AMP.BaseElement.call(this, $element$jscomp$281$$) || this;
  $$jscomp$super$this$jscomp$5$$.$headers_$ = [];
  $$jscomp$super$this$jscomp$5$$.$sessionId_$ = null;
  $$jscomp$super$this$jscomp$5$$.$currentState_$ = null;
  $$jscomp$super$this$jscomp$5$$.$sessionOptOut_$ = !1;
  $$jscomp$super$this$jscomp$5$$.$sections_$ = null;
  $$jscomp$super$this$jscomp$5$$.$action_$ = null;
  $$jscomp$super$this$jscomp$5$$.$suffix_$ = $element$jscomp$281$$.id ? $element$jscomp$281$$.id : Math.floor(100 * Math.random());
  return $$jscomp$super$this$jscomp$5$$;
}, $JSCompiler_StaticMethods_getSessionState_$$ = function($JSCompiler_StaticMethods_getSessionState_$self$$) {
  if ($JSCompiler_StaticMethods_getSessionState_$self$$.$sessionOptOut_$) {
    return {};
  }
  try {
    var $sessionStr$$ = $JSCompiler_StaticMethods_getSessionState_$self$$.$win$.sessionStorage.getItem($JSCompiler_StaticMethods_getSessionState_$self$$.$sessionId_$);
    return $sessionStr$$ ? _.$parseJson$$module$src$json$$($sessionStr$$) : {};
  } catch ($e$204$$) {
    return "AMP-ACCORDION", {};
  }
}, $JSCompiler_StaticMethods_setSessionState_$$ = function($JSCompiler_StaticMethods_setSessionState_$self$$) {
  if (!$JSCompiler_StaticMethods_setSessionState_$self$$.$sessionOptOut_$) {
    var $sessionStr$jscomp$1$$ = JSON.stringify($JSCompiler_StaticMethods_setSessionState_$self$$.$currentState_$);
    try {
      $JSCompiler_StaticMethods_setSessionState_$self$$.$win$.sessionStorage.setItem($JSCompiler_StaticMethods_setSessionState_$self$$.$sessionId_$, $sessionStr$jscomp$1$$);
    } catch ($e$205$$) {
      "AMP-ACCORDION";
    }
  }
}, $JSCompiler_StaticMethods_AmpAccordion$$module$extensions$amp_accordion$0_1$amp_accordion_prototype$triggerEvent_$$ = function($JSCompiler_StaticMethods_AmpAccordion$$module$extensions$amp_accordion$0_1$amp_accordion_prototype$triggerEvent_$self$$, $name$jscomp$172$$, $section$jscomp$5$$) {
  var $event$jscomp$57$$ = _.$createCustomEvent$$module$src$event_helper$$($JSCompiler_StaticMethods_AmpAccordion$$module$extensions$amp_accordion$0_1$amp_accordion_prototype$triggerEvent_$self$$.$win$, "accordionSection." + $name$jscomp$172$$, _.$dict$$module$src$utils$object$$({}));
  $JSCompiler_StaticMethods_AmpAccordion$$module$extensions$amp_accordion$0_1$amp_accordion_prototype$triggerEvent_$self$$.$action_$.$trigger$($section$jscomp$5$$, $name$jscomp$172$$, $event$jscomp$57$$, 100);
  $JSCompiler_StaticMethods_AmpAccordion$$module$extensions$amp_accordion$0_1$amp_accordion_prototype$triggerEvent_$self$$.element.$D$($name$jscomp$172$$);
}, $JSCompiler_StaticMethods_AmpAccordion$$module$extensions$amp_accordion$0_1$amp_accordion_prototype$toggle_$$ = function($JSCompiler_StaticMethods_AmpAccordion$$module$extensions$amp_accordion$0_1$amp_accordion_prototype$toggle_$self$$, $section$jscomp$6$$, $opt_forceExpand$$) {
  var $contentId$jscomp$1_sectionComponents$jscomp$1$$ = $section$jscomp$6$$.children, $header$jscomp$5$$ = $contentId$jscomp$1_sectionComponents$jscomp$1$$[0];
  $contentId$jscomp$1_sectionComponents$jscomp$1$$ = $contentId$jscomp$1_sectionComponents$jscomp$1$$[1].getAttribute("id");
  var $isSectionClosedAfterClick$$ = $section$jscomp$6$$.hasAttribute("expanded"), $toExpand$$ = void 0 == $opt_forceExpand$$ ? !$section$jscomp$6$$.hasAttribute("expanded") : $opt_forceExpand$$;
  $toExpand$$ && $section$jscomp$6$$.hasAttribute("expanded") || !$toExpand$$ && !$section$jscomp$6$$.hasAttribute("expanded") || ($JSCompiler_StaticMethods_AmpAccordion$$module$extensions$amp_accordion$0_1$amp_accordion_prototype$toggle_$self$$.element.hasAttribute("animate") ? $toExpand$$ ? ($header$jscomp$5$$.setAttribute("aria-expanded", "true"), $JSCompiler_StaticMethods_animateExpand_$$($JSCompiler_StaticMethods_AmpAccordion$$module$extensions$amp_accordion$0_1$amp_accordion_prototype$toggle_$self$$, 
  $section$jscomp$6$$), $JSCompiler_StaticMethods_AmpAccordion$$module$extensions$amp_accordion$0_1$amp_accordion_prototype$toggle_$self$$.element.hasAttribute("expand-single-section") && $JSCompiler_StaticMethods_AmpAccordion$$module$extensions$amp_accordion$0_1$amp_accordion_prototype$toggle_$self$$.$sections_$.forEach(function($opt_forceExpand$$) {
    $opt_forceExpand$$ != $section$jscomp$6$$ && ($JSCompiler_StaticMethods_animateCollapse_$$($JSCompiler_StaticMethods_AmpAccordion$$module$extensions$amp_accordion$0_1$amp_accordion_prototype$toggle_$self$$, $opt_forceExpand$$), $opt_forceExpand$$.children[0].setAttribute("aria-expanded", "false"));
  })) : ($header$jscomp$5$$.setAttribute("aria-expanded", "false"), $JSCompiler_StaticMethods_animateCollapse_$$($JSCompiler_StaticMethods_AmpAccordion$$module$extensions$amp_accordion$0_1$amp_accordion_prototype$toggle_$self$$, $section$jscomp$6$$)) : $JSCompiler_StaticMethods_AmpAccordion$$module$extensions$amp_accordion$0_1$amp_accordion_prototype$toggle_$self$$.$mutateElement$(function() {
    $toExpand$$ ? ($JSCompiler_StaticMethods_AmpAccordion$$module$extensions$amp_accordion$0_1$amp_accordion_prototype$triggerEvent_$$($JSCompiler_StaticMethods_AmpAccordion$$module$extensions$amp_accordion$0_1$amp_accordion_prototype$toggle_$self$$, "expand", $section$jscomp$6$$), $section$jscomp$6$$.setAttribute("expanded", ""), $header$jscomp$5$$.setAttribute("aria-expanded", "true"), $JSCompiler_StaticMethods_AmpAccordion$$module$extensions$amp_accordion$0_1$amp_accordion_prototype$toggle_$self$$.element.hasAttribute("expand-single-section") && 
    $JSCompiler_StaticMethods_AmpAccordion$$module$extensions$amp_accordion$0_1$amp_accordion_prototype$toggle_$self$$.$sections_$.forEach(function($opt_forceExpand$$) {
      $opt_forceExpand$$ != $section$jscomp$6$$ && ($opt_forceExpand$$.hasAttribute("expanded") && ($JSCompiler_StaticMethods_AmpAccordion$$module$extensions$amp_accordion$0_1$amp_accordion_prototype$triggerEvent_$$($JSCompiler_StaticMethods_AmpAccordion$$module$extensions$amp_accordion$0_1$amp_accordion_prototype$toggle_$self$$, "collapse", $opt_forceExpand$$), $opt_forceExpand$$.removeAttribute("expanded")), $opt_forceExpand$$.children[0].setAttribute("aria-expanded", "false"));
    })) : ($JSCompiler_StaticMethods_AmpAccordion$$module$extensions$amp_accordion$0_1$amp_accordion_prototype$triggerEvent_$$($JSCompiler_StaticMethods_AmpAccordion$$module$extensions$amp_accordion$0_1$amp_accordion_prototype$toggle_$self$$, "collapse", $section$jscomp$6$$), $section$jscomp$6$$.removeAttribute("expanded"), $header$jscomp$5$$.setAttribute("aria-expanded", "false"));
  }, $section$jscomp$6$$), $JSCompiler_StaticMethods_AmpAccordion$$module$extensions$amp_accordion$0_1$amp_accordion_prototype$toggle_$self$$.$currentState_$[$contentId$jscomp$1_sectionComponents$jscomp$1$$] = !$isSectionClosedAfterClick$$, $JSCompiler_StaticMethods_setSessionState_$$($JSCompiler_StaticMethods_AmpAccordion$$module$extensions$amp_accordion$0_1$amp_accordion_prototype$toggle_$self$$));
}, $JSCompiler_StaticMethods_animateExpand_$$ = function($JSCompiler_StaticMethods_animateExpand_$self$$, $section$jscomp$7$$) {
  var $height$jscomp$21$$, $duration$jscomp$16$$, $sectionChild$$ = $section$jscomp$7$$.children[1];
  $JSCompiler_StaticMethods_animateExpand_$self$$.$mutateElement$(function() {
    _.$setImportantStyles$$module$src$style$$($sectionChild$$, {position:"fixed", opacity:"0"});
    $section$jscomp$7$$.hasAttribute("expanded") || ($JSCompiler_StaticMethods_AmpAccordion$$module$extensions$amp_accordion$0_1$amp_accordion_prototype$triggerEvent_$$($JSCompiler_StaticMethods_animateExpand_$self$$, "expand", $section$jscomp$7$$), $section$jscomp$7$$.setAttribute("expanded", ""));
  }).then(function() {
    return $JSCompiler_StaticMethods_animateExpand_$self$$.$measureMutateElement$(function() {
      $height$jscomp$21$$ = $sectionChild$$.offsetHeight;
      var $section$jscomp$7$$ = _.$JSCompiler_StaticMethods_getHeight$$($JSCompiler_StaticMethods_animateExpand_$self$$.$getViewport$());
      $duration$jscomp$16$$ = $JSCompiler_StaticMethods_AmpAccordion$$module$extensions$amp_accordion$0_1$amp_accordion_prototype$getTransitionDuration_$$(Math.abs($height$jscomp$21$$), $section$jscomp$7$$);
    }, function() {
      _.$setStyles$$module$src$style$$($sectionChild$$, {position:"", opacity:"", height:0});
    });
  }).then(function() {
    return _.$JSCompiler_StaticMethods_AnimationPlayer$$module$src$animation_prototype$thenAlways$$(_.$Animation$$module$src$animation$animate$$($JSCompiler_StaticMethods_animateExpand_$self$$.element, _.$setStyles$$module$src$transition$$($sectionChild$$, {height:$px$$module$src$transition$$(_.$numeric$$module$src$transition$$(0, $height$jscomp$21$$)), opacity:_.$numeric$$module$src$transition$$(0, 1)}), $duration$jscomp$16$$, $EXPAND_CURVE_$$module$extensions$amp_accordion$0_1$amp_accordion$$), 
    function() {
      $JSCompiler_StaticMethods_animateExpand_$self$$.$mutateElement$(function() {
        _.$setStyles$$module$src$style$$($sectionChild$$, {height:"", opacity:""});
      });
    });
  });
}, $JSCompiler_StaticMethods_animateCollapse_$$ = function($JSCompiler_StaticMethods_animateCollapse_$self$$, $section$jscomp$8$$) {
  var $height$jscomp$22$$, $duration$jscomp$17$$, $sectionChild$jscomp$1$$ = $section$jscomp$8$$.children[1];
  $JSCompiler_StaticMethods_animateCollapse_$self$$.$measureElement$(function() {
    $height$jscomp$22$$ = $section$jscomp$8$$.offsetHeight;
    var $sectionChild$jscomp$1$$ = $JSCompiler_StaticMethods_animateCollapse_$self$$.$getViewport$().$getSize$().height;
    $duration$jscomp$17$$ = $JSCompiler_StaticMethods_AmpAccordion$$module$extensions$amp_accordion$0_1$amp_accordion_prototype$getTransitionDuration_$$(Math.abs($height$jscomp$22$$), $sectionChild$jscomp$1$$);
  }).then(function() {
    return _.$JSCompiler_StaticMethods_AnimationPlayer$$module$src$animation_prototype$thenAlways$$(_.$Animation$$module$src$animation$animate$$($sectionChild$jscomp$1$$, _.$setStyles$$module$src$transition$$($sectionChild$jscomp$1$$, {height:$px$$module$src$transition$$(_.$numeric$$module$src$transition$$($height$jscomp$22$$, 0))}), $duration$jscomp$17$$, $COLLAPSE_CURVE_$$module$extensions$amp_accordion$0_1$amp_accordion$$), function() {
      return $JSCompiler_StaticMethods_animateCollapse_$self$$.$mutateElement$(function() {
        $section$jscomp$8$$.hasAttribute("expanded") && ($JSCompiler_StaticMethods_AmpAccordion$$module$extensions$amp_accordion$0_1$amp_accordion_prototype$triggerEvent_$$($JSCompiler_StaticMethods_animateCollapse_$self$$, "collapse", $section$jscomp$8$$), $section$jscomp$8$$.removeAttribute("expanded"));
        _.$setStyles$$module$src$style$$($sectionChild$jscomp$1$$, {height:""});
      });
    });
  });
}, $JSCompiler_StaticMethods_AmpAccordion$$module$extensions$amp_accordion$0_1$amp_accordion_prototype$getTransitionDuration_$$ = function($dy$jscomp$11$$, $maxY$$) {
  var $opt_maxDur$$ = void 0 === $opt_maxDur$$ ? 500 : $opt_maxDur$$;
  return _.$clamp$$module$src$utils$math$$(Math.abs($dy$jscomp$11$$) / $maxY$$ * $opt_maxDur$$, 200, $opt_maxDur$$);
}, $JSCompiler_StaticMethods_AmpAccordion$$module$extensions$amp_accordion$0_1$amp_accordion_prototype$shouldHandleClick_$$ = function($event$jscomp$60_hasAnchor$$) {
  var $hasTapAction_target$jscomp$104$$ = $event$jscomp$60_hasAnchor$$.target, $header$jscomp$7$$ = $event$jscomp$60_hasAnchor$$.currentTarget;
  $event$jscomp$60_hasAnchor$$ = !!_.$closest$$module$src$dom$$($hasTapAction_target$jscomp$104$$, function($event$jscomp$60_hasAnchor$$) {
    return "A" == $event$jscomp$60_hasAnchor$$.tagName;
  }, $header$jscomp$7$$);
  $hasTapAction_target$jscomp$104$$ = !!_.$JSCompiler_StaticMethods_findAction_$$($hasTapAction_target$jscomp$104$$, "tap", $header$jscomp$7$$);
  return !$event$jscomp$60_hasAnchor$$ && !$hasTapAction_target$jscomp$104$$;
}, $EXPAND_CURVE_$$module$extensions$amp_accordion$0_1$amp_accordion$$ = _.$bezierCurve$$module$src$curve$$(0.47, 0, 0.745, 0.715), $COLLAPSE_CURVE_$$module$extensions$amp_accordion$0_1$amp_accordion$$ = _.$bezierCurve$$module$src$curve$$(0.39, 0.575, 0.565, 1);
_.$$jscomp$inherits$$($AmpAccordion$$module$extensions$amp_accordion$0_1$amp_accordion$$, window.AMP.BaseElement);
$AmpAccordion$$module$extensions$amp_accordion$0_1$amp_accordion$$.prototype.$isLayoutSupported$ = function($layout$jscomp$27$$) {
  return "container" == $layout$jscomp$27$$;
};
$AmpAccordion$$module$extensions$amp_accordion$0_1$amp_accordion$$.prototype.$buildCallback$ = function() {
  var $$jscomp$this$jscomp$300$$ = this;
  this.$action_$ = _.$Services$$module$src$services$actionServiceForDoc$$(this.element);
  this.$sessionOptOut_$ = this.element.hasAttribute("disable-session-states");
  this.$sessionId_$ = "amp-" + (this.element.id || this.element.$ia$()) + "-" + _.$removeFragment$$module$src$url$$(this.$win$.location.href);
  this.$currentState_$ = $JSCompiler_StaticMethods_getSessionState_$$(this);
  this.$sections_$ = this.$getRealChildren$();
  this.$sections_$.forEach(function($section$jscomp$4$$, $header$jscomp$4_index$jscomp$84$$) {
    var $sectionComponents$$ = $section$jscomp$4$$.children, $content$jscomp$8$$ = $sectionComponents$$[1];
    $content$jscomp$8$$.classList.add("i-amphtml-accordion-content");
    var $contentId$$ = $content$jscomp$8$$.getAttribute("id");
    $contentId$$ || ($contentId$$ = $$jscomp$this$jscomp$300$$.$suffix_$ + "_AMP_content_" + $header$jscomp$4_index$jscomp$84$$, $content$jscomp$8$$.setAttribute("id", $contentId$$));
    _.$JSCompiler_StaticMethods_registerAction$$($$jscomp$this$jscomp$300$$, "toggle", function($section$jscomp$4$$) {
      if ($section$jscomp$4$$.args) {
        $section$jscomp$4$$ = $section$jscomp$4$$.args.section, $section$jscomp$4$$ = $$jscomp$this$jscomp$300$$.$getAmpDoc$().getElementById($section$jscomp$4$$), $section$jscomp$4$$ = _.$JSCompiler_StaticMethods_assertElement$$(_.$user$$module$src$log$$(), $section$jscomp$4$$), $JSCompiler_StaticMethods_AmpAccordion$$module$extensions$amp_accordion$0_1$amp_accordion_prototype$toggle_$$($$jscomp$this$jscomp$300$$, $section$jscomp$4$$);
      } else {
        for ($section$jscomp$4$$ = 0; $section$jscomp$4$$ < $$jscomp$this$jscomp$300$$.$sections_$.length; $section$jscomp$4$$++) {
          $JSCompiler_StaticMethods_AmpAccordion$$module$extensions$amp_accordion$0_1$amp_accordion_prototype$toggle_$$($$jscomp$this$jscomp$300$$, $$jscomp$this$jscomp$300$$.$sections_$[$section$jscomp$4$$]);
        }
      }
    });
    _.$JSCompiler_StaticMethods_registerAction$$($$jscomp$this$jscomp$300$$, "expand", function($section$jscomp$4$$) {
      if ($section$jscomp$4$$.args) {
        $section$jscomp$4$$ = $section$jscomp$4$$.args.section, $section$jscomp$4$$ = $$jscomp$this$jscomp$300$$.$getAmpDoc$().getElementById($section$jscomp$4$$), $section$jscomp$4$$ = _.$JSCompiler_StaticMethods_assertElement$$(_.$user$$module$src$log$$(), $section$jscomp$4$$), $JSCompiler_StaticMethods_AmpAccordion$$module$extensions$amp_accordion$0_1$amp_accordion_prototype$toggle_$$($$jscomp$this$jscomp$300$$, $section$jscomp$4$$, !0);
      } else {
        for ($section$jscomp$4$$ = 0; $section$jscomp$4$$ < $$jscomp$this$jscomp$300$$.$sections_$.length; $section$jscomp$4$$++) {
          $JSCompiler_StaticMethods_AmpAccordion$$module$extensions$amp_accordion$0_1$amp_accordion_prototype$toggle_$$($$jscomp$this$jscomp$300$$, $$jscomp$this$jscomp$300$$.$sections_$[$section$jscomp$4$$], !0);
        }
      }
    });
    _.$JSCompiler_StaticMethods_registerAction$$($$jscomp$this$jscomp$300$$, "collapse", function($section$jscomp$4$$) {
      if ($section$jscomp$4$$.args) {
        $section$jscomp$4$$ = $section$jscomp$4$$.args.section, $section$jscomp$4$$ = $$jscomp$this$jscomp$300$$.$getAmpDoc$().getElementById($section$jscomp$4$$), $section$jscomp$4$$ = _.$JSCompiler_StaticMethods_assertElement$$(_.$user$$module$src$log$$(), $section$jscomp$4$$), $JSCompiler_StaticMethods_AmpAccordion$$module$extensions$amp_accordion$0_1$amp_accordion_prototype$toggle_$$($$jscomp$this$jscomp$300$$, $section$jscomp$4$$, !1);
      } else {
        for ($section$jscomp$4$$ = 0; $section$jscomp$4$$ < $$jscomp$this$jscomp$300$$.$sections_$.length; $section$jscomp$4$$++) {
          $JSCompiler_StaticMethods_AmpAccordion$$module$extensions$amp_accordion$0_1$amp_accordion_prototype$toggle_$$($$jscomp$this$jscomp$300$$, $$jscomp$this$jscomp$300$$.$sections_$[$section$jscomp$4$$], !1);
        }
      }
    });
    $$jscomp$this$jscomp$300$$.$currentState_$[$contentId$$] ? $section$jscomp$4$$.setAttribute("expanded", "") : !1 === $$jscomp$this$jscomp$300$$.$currentState_$[$contentId$$] && $section$jscomp$4$$.removeAttribute("expanded");
    $$jscomp$this$jscomp$300$$.$mutateElement$(function() {
    });
    $header$jscomp$4_index$jscomp$84$$ = $sectionComponents$$[0];
    $header$jscomp$4_index$jscomp$84$$.classList.add("i-amphtml-accordion-header");
    $header$jscomp$4_index$jscomp$84$$.setAttribute("role", "button");
    $header$jscomp$4_index$jscomp$84$$.setAttribute("aria-controls", $contentId$$);
    $header$jscomp$4_index$jscomp$84$$.setAttribute("aria-expanded", $section$jscomp$4$$.hasAttribute("expanded").toString());
    $header$jscomp$4_index$jscomp$84$$.hasAttribute("tabindex") || $header$jscomp$4_index$jscomp$84$$.setAttribute("tabindex", 0);
    $$jscomp$this$jscomp$300$$.$headers_$.push($header$jscomp$4_index$jscomp$84$$);
    $header$jscomp$4_index$jscomp$84$$.addEventListener("click", $$jscomp$this$jscomp$300$$.$D$.bind($$jscomp$this$jscomp$300$$));
    $header$jscomp$4_index$jscomp$84$$.addEventListener("keydown", $$jscomp$this$jscomp$300$$.$F$.bind($$jscomp$this$jscomp$300$$));
  });
};
$AmpAccordion$$module$extensions$amp_accordion$0_1$amp_accordion$$.prototype.$D$ = function($event$jscomp$59$$) {
  $JSCompiler_StaticMethods_AmpAccordion$$module$extensions$amp_accordion$0_1$amp_accordion_prototype$shouldHandleClick_$$($event$jscomp$59$$) && ($event$jscomp$59$$.preventDefault(), $JSCompiler_StaticMethods_AmpAccordion$$module$extensions$amp_accordion$0_1$amp_accordion_prototype$toggle_$$(this, $event$jscomp$59$$.currentTarget.parentElement));
};
$AmpAccordion$$module$extensions$amp_accordion$0_1$amp_accordion$$.prototype.$F$ = function($event$jscomp$61_newFocusIndex$jscomp$inline_2209$$) {
  if (!$event$jscomp$61_newFocusIndex$jscomp$inline_2209$$.defaultPrevented) {
    switch($event$jscomp$61_newFocusIndex$jscomp$inline_2209$$.key) {
      case "ArrowUp":
      case "ArrowDown":
        var $index$jscomp$inline_2208$$ = this.$headers_$.indexOf($event$jscomp$61_newFocusIndex$jscomp$inline_2209$$.currentTarget);
        -1 !== $index$jscomp$inline_2208$$ && ($event$jscomp$61_newFocusIndex$jscomp$inline_2209$$.preventDefault(), $event$jscomp$61_newFocusIndex$jscomp$inline_2209$$ = ($index$jscomp$inline_2208$$ + ("ArrowUp" == $event$jscomp$61_newFocusIndex$jscomp$inline_2209$$.key ? -1 : 1)) % this.$headers_$.length, 0 > $event$jscomp$61_newFocusIndex$jscomp$inline_2209$$ && ($event$jscomp$61_newFocusIndex$jscomp$inline_2209$$ += this.$headers_$.length), _.$tryFocus$$module$src$dom$$(this.$headers_$[$event$jscomp$61_newFocusIndex$jscomp$inline_2209$$]));
        break;
      case "Enter":
      case " ":
        $event$jscomp$61_newFocusIndex$jscomp$inline_2209$$.target == $event$jscomp$61_newFocusIndex$jscomp$inline_2209$$.currentTarget && ($event$jscomp$61_newFocusIndex$jscomp$inline_2209$$.preventDefault(), $JSCompiler_StaticMethods_AmpAccordion$$module$extensions$amp_accordion$0_1$amp_accordion_prototype$toggle_$$(this, $event$jscomp$61_newFocusIndex$jscomp$inline_2209$$.currentTarget.parentElement));
    }
  }
};
window.self.AMP.registerElement("amp-accordion", $AmpAccordion$$module$extensions$amp_accordion$0_1$amp_accordion$$);

})});
