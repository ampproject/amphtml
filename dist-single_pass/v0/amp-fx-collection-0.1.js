(self.AMP=self.AMP||[]).push({n:"amp-fx-collection",i:["_base_i","_base_misc"],v:"1901181729101",f:(function(AMP,_){
var $convertEasingKeyword$$module$extensions$amp_fx_collection$0_1$providers$amp_fx_presets_utils$$ = function($keyword$jscomp$2$$) {
  switch($keyword$jscomp$2$$) {
    case "linear":
      return "cubic-bezier(0.00, 0.00, 1.00, 1.00)";
    case "ease-in-out":
      return "cubic-bezier(0.80, 0.00, 0.20, 1.00)";
    case "ease-in":
      return "cubic-bezier(0.80, 0.00, 0.60, 1.00)";
    case "ease-out":
      return "cubic-bezier(0.40, 0.00, 0.40, 1.00)";
    default:
      return $keyword$jscomp$2$$;
  }
}, $resolvePercentageToNumber$$module$extensions$amp_fx_collection$0_1$providers$amp_fx_presets_utils$$ = function($precentageStrippedVal_val$jscomp$19$$) {
  $precentageStrippedVal_val$jscomp$19$$ = (0,window.parseFloat)($precentageStrippedVal_val$jscomp$19$$);
  return (0,window.isNaN)($precentageStrippedVal_val$jscomp$19$$) ? null : $precentageStrippedVal_val$jscomp$19$$ / 100;
}, $installStyles$$module$extensions$amp_fx_collection$0_1$providers$amp_fx_presets_utils$$ = function($fxType$$) {
  switch($fxType$$) {
    case "parallax":
      return {"will-change":"transform"};
    case "fade-in":
      return {"will-change":"opacity", opacity:0};
    case "fade-in-scroll":
      return {"will-change":"opacity", opacity:0};
    case "fly-in-bottom":
    case "fly-in-top":
    case "fly-in-left":
    case "fly-in-right":
      return {"will-change":"transform"};
    default:
      return {visibility:"visible"};
  }
}, $defaultDurationValues$$module$extensions$amp_fx_collection$0_1$providers$amp_fx_presets_utils$$ = function($ampdoc$jscomp$172_width$jscomp$44$$, $fxType$jscomp$1$$) {
  switch($fxType$jscomp$1$$) {
    case "fade-in":
      return "1000ms";
    case "fly-in-bottom":
    case "fly-in-top":
    case "fly-in-left":
    case "fly-in-right":
      return $ampdoc$jscomp$172_width$jscomp$44$$ = _.$Services$$module$src$services$viewportForDoc$$($ampdoc$jscomp$172_width$jscomp$44$$).$getSize$().width, _.$mapRange$$module$src$utils$math$$(Math.min(1000, $ampdoc$jscomp$172_width$jscomp$44$$), 480, 1000, 400, 600) + "ms";
    default:
      return "1ms";
  }
}, $defaultMarginValues$$module$extensions$amp_fx_collection$0_1$providers$amp_fx_presets_utils$$ = function($fxType$jscomp$3$$) {
  switch($fxType$jscomp$3$$) {
    case "fade-in":
    case "fly-in-right":
    case "fly-in-left":
    case "fly-in-top":
    case "fly-in-bottom":
      return {start:0.05};
    case "fade-in-scroll":
      return {start:0, end:0.5};
    default:
      return {start:0, end:1};
  }
}, $FxProvider$$module$extensions$amp_fx_collection$0_1$providers$fx_provider$$ = function($ampdoc$jscomp$174$$, $fxType$jscomp$5$$) {
  this.$viewport_$ = _.$Services$$module$src$services$viewportForDoc$$($ampdoc$jscomp$174$$);
  this.$FxProvider$$module$extensions$amp_fx_collection$0_1$providers$fx_provider$resources_$ = _.$Services$$module$src$services$resourcesForDoc$$($ampdoc$jscomp$174$$);
  _.$installPositionObserverServiceForDoc$$module$src$service$position_observer$position_observer_impl$$($ampdoc$jscomp$174$$);
  this.$positionObserver_$ = _.$getServiceForDoc$$module$src$service$$($ampdoc$jscomp$174$$, "position-observer");
  this.$ampdoc_$ = $ampdoc$jscomp$174$$;
  this.$FxProvider$$module$extensions$amp_fx_collection$0_1$providers$fx_provider$fxType_$ = $fxType$jscomp$5$$;
}, $FxElement$$module$extensions$amp_fx_collection$0_1$providers$fx_provider$$ = function($element$jscomp$423$$, $JSCompiler_temp$jscomp$750_JSCompiler_temp$jscomp$751_positionObserver$jscomp$2$$, $viewport$jscomp$17$$, $resources$jscomp$11$$, $ampdoc$jscomp$175$$, $fxType$jscomp$6$$) {
  var $$jscomp$this$jscomp$623$$ = this;
  this.$positionObserver_$ = $JSCompiler_temp$jscomp$750_JSCompiler_temp$jscomp$751_positionObserver$jscomp$2$$;
  this.$viewport_$ = $viewport$jscomp$17$$;
  this.$F$ = $resources$jscomp$11$$;
  this.$adjustedViewportHeight$ = this.$viewportHeight$ = null;
  this.$element_$ = $element$jscomp$423$$;
  this.$FxElement$$module$extensions$amp_fx_collection$0_1$providers$fx_provider$offset_$ = 0;
  this.$D$ = $fxType$jscomp$6$$;
  this.$ampdoc_$ = $ampdoc$jscomp$175$$;
  $Presets$$module$extensions$amp_fx_collection$0_1$providers$amp_fx_presets$$[this.$D$].$userAsserts$($element$jscomp$423$$);
  this.$factor_$ = (0,window.parseFloat)($element$jscomp$423$$.getAttribute("data-parallax-factor"));
  this.$marginStart_$ = $element$jscomp$423$$.hasAttribute("data-margin-start") ? $resolvePercentageToNumber$$module$extensions$amp_fx_collection$0_1$providers$amp_fx_presets_utils$$($element$jscomp$423$$.getAttribute("data-margin-start")) : $defaultMarginValues$$module$extensions$amp_fx_collection$0_1$providers$amp_fx_presets_utils$$(this.$D$).start;
  this.$marginEnd_$ = $element$jscomp$423$$.hasAttribute("data-margin-end") ? $resolvePercentageToNumber$$module$extensions$amp_fx_collection$0_1$providers$amp_fx_presets_utils$$($element$jscomp$423$$.getAttribute("data-margin-end")) : $defaultMarginValues$$module$extensions$amp_fx_collection$0_1$providers$amp_fx_presets_utils$$(this.$D$).end;
  if ($element$jscomp$423$$.hasAttribute("data-easing")) {
    $JSCompiler_temp$jscomp$750_JSCompiler_temp$jscomp$751_positionObserver$jscomp$2$$ = $element$jscomp$423$$.getAttribute("data-easing");
  } else {
    a: {
      switch(this.$D$) {
        case "fade-in":
          $JSCompiler_temp$jscomp$750_JSCompiler_temp$jscomp$751_positionObserver$jscomp$2$$ = "ease-in";
          break a;
        case "fly-in-right":
        case "fly-in-left":
        case "fly-in-top":
        case "fly-in-bottom":
          $JSCompiler_temp$jscomp$750_JSCompiler_temp$jscomp$751_positionObserver$jscomp$2$$ = "ease-out";
          break a;
        default:
          $JSCompiler_temp$jscomp$750_JSCompiler_temp$jscomp$751_positionObserver$jscomp$2$$ = "ease-in";
      }
    }
  }
  this.$easing_$ = $convertEasingKeyword$$module$extensions$amp_fx_collection$0_1$providers$amp_fx_presets_utils$$($JSCompiler_temp$jscomp$750_JSCompiler_temp$jscomp$751_positionObserver$jscomp$2$$);
  this.$duration_$ = $element$jscomp$423$$.hasAttribute("data-duration") ? $element$jscomp$423$$.getAttribute("data-duration") : $defaultDurationValues$$module$extensions$amp_fx_collection$0_1$providers$amp_fx_presets_utils$$(this.$ampdoc_$, this.$D$);
  if ($element$jscomp$423$$.hasAttribute("data-fly-in-distance")) {
    $JSCompiler_temp$jscomp$750_JSCompiler_temp$jscomp$751_positionObserver$jscomp$2$$ = (0,window.parseFloat)($element$jscomp$423$$.getAttribute("data-fly-in-distance"));
  } else {
    a: {
      switch(this.$D$) {
        case "fly-in-bottom":
        case "fly-in-top":
          $JSCompiler_temp$jscomp$750_JSCompiler_temp$jscomp$751_positionObserver$jscomp$2$$ = 1000 > _.$Services$$module$src$services$viewportForDoc$$(this.$ampdoc_$).$getSize$().width ? 25 : 33;
          break a;
        case "fly-in-left":
        case "fly-in-right":
          $JSCompiler_temp$jscomp$750_JSCompiler_temp$jscomp$751_positionObserver$jscomp$2$$ = 100;
          break a;
        default:
          $JSCompiler_temp$jscomp$750_JSCompiler_temp$jscomp$751_positionObserver$jscomp$2$$ = 1;
      }
    }
  }
  this.$flyInDistance_$ = $JSCompiler_temp$jscomp$750_JSCompiler_temp$jscomp$751_positionObserver$jscomp$2$$;
  this.$hasRepeat_$ = $element$jscomp$423$$.hasAttribute("data-repeat");
  this.$initialTrigger$ = !1;
  $JSCompiler_StaticMethods_getAdjustedViewportHeight_$$(this).then(function($element$jscomp$423$$) {
    $$jscomp$this$jscomp$623$$.$adjustedViewportHeight$ = $element$jscomp$423$$;
    $JSCompiler_StaticMethods_observePositionChanges_$$($$jscomp$this$jscomp$623$$);
  });
  $JSCompiler_StaticMethods_getViewportHeight_$$(this).then(function($element$jscomp$423$$) {
    $$jscomp$this$jscomp$623$$.$viewportHeight$ = $element$jscomp$423$$;
  });
}, $JSCompiler_StaticMethods_observePositionChanges_$$ = function($JSCompiler_StaticMethods_observePositionChanges_$self$$) {
  $JSCompiler_StaticMethods_observePositionChanges_$self$$.$positionObserver_$.observe($JSCompiler_StaticMethods_observePositionChanges_$self$$.$element_$, 1, $Presets$$module$extensions$amp_fx_collection$0_1$providers$amp_fx_presets$$[$JSCompiler_StaticMethods_observePositionChanges_$self$$.$D$].update.bind($JSCompiler_StaticMethods_observePositionChanges_$self$$));
  _.$JSCompiler_StaticMethods_Viewport$$module$src$service$viewport$viewport_impl_prototype$onResize$$($JSCompiler_StaticMethods_observePositionChanges_$self$$.$viewport_$, function() {
    $JSCompiler_StaticMethods_getAdjustedViewportHeight_$$($JSCompiler_StaticMethods_observePositionChanges_$self$$).then(function($adjustedViewportHeight$jscomp$1$$) {
      $JSCompiler_StaticMethods_observePositionChanges_$self$$.$adjustedViewportHeight$ = $adjustedViewportHeight$jscomp$1$$;
    });
    $JSCompiler_StaticMethods_getViewportHeight_$$($JSCompiler_StaticMethods_observePositionChanges_$self$$).then(function($viewportHeight$jscomp$11$$) {
      $JSCompiler_StaticMethods_observePositionChanges_$self$$.$viewportHeight$ = $viewportHeight$jscomp$11$$;
    });
  });
}, $JSCompiler_StaticMethods_getViewportHeight_$$ = function($JSCompiler_StaticMethods_getViewportHeight_$self$$) {
  return $JSCompiler_StaticMethods_getViewportHeight_$self$$.$F$.$measureElement$(function() {
    return _.$JSCompiler_StaticMethods_getHeight$$($JSCompiler_StaticMethods_getViewportHeight_$self$$.$viewport_$);
  });
}, $JSCompiler_StaticMethods_getAdjustedViewportHeight_$$ = function($JSCompiler_StaticMethods_getAdjustedViewportHeight_$self$$) {
  return $JSCompiler_StaticMethods_getAdjustedViewportHeight_$self$$.$F$.$measureElement$(function() {
    for (var $viewportHeight$jscomp$12$$ = _.$JSCompiler_StaticMethods_getHeight$$($JSCompiler_StaticMethods_getAdjustedViewportHeight_$self$$.$viewport_$), $offsetTop$jscomp$1$$ = 0, $node$jscomp$77$$ = $JSCompiler_StaticMethods_getAdjustedViewportHeight_$self$$.$element_$; $node$jscomp$77$$; $node$jscomp$77$$ = $node$jscomp$77$$.offsetParent) {
      $offsetTop$jscomp$1$$ += $node$jscomp$77$$.offsetTop;
    }
    return $offsetTop$jscomp$1$$ < $viewportHeight$jscomp$12$$ ? $offsetTop$jscomp$1$$ : $viewportHeight$jscomp$12$$;
  });
}, $AmpFxCollection$$module$extensions$amp_fx_collection$0_1$amp_fx_collection$$ = function($ampdoc$jscomp$176$$) {
  var $$jscomp$this$jscomp$627$$ = this;
  this.$ampdoc_$ = $ampdoc$jscomp$176$$;
  this.$F$ = $ampdoc$jscomp$176$$.getRootNode();
  this.$seen_$ = [];
  this.$viewer_$ = _.$Services$$module$src$services$viewerForDoc$$($ampdoc$jscomp$176$$);
  this.$D$ = _.$map$$module$src$utils$object$$();
  window.Promise.all([$ampdoc$jscomp$176$$.$whenReady$(), this.$viewer_$.$D$]).then(function() {
    $$jscomp$this$jscomp$627$$.$G$();
    _.$listen$$module$src$event_helper$$($$jscomp$this$jscomp$627$$.$F$, "amp:dom-update", $$jscomp$this$jscomp$627$$.$G$.bind($$jscomp$this$jscomp$627$$));
  });
}, $JSCompiler_StaticMethods_AmpFxCollection$$module$extensions$amp_fx_collection$0_1$amp_fx_collection_prototype$register_$$ = function($JSCompiler_StaticMethods_AmpFxCollection$$module$extensions$amp_fx_collection$0_1$amp_fx_collection_prototype$register_$self$$, $fxElement$jscomp$8$$) {
  $JSCompiler_StaticMethods_AmpFxCollection$$module$extensions$amp_fx_collection$0_1$amp_fx_collection_prototype$register_$self$$.$seen_$.includes($fxElement$jscomp$8$$);
  $JSCompiler_StaticMethods_getFxTypes_$$($fxElement$jscomp$8$$).forEach(function($JSCompiler_inline_result$jscomp$752_fxType$jscomp$7$$) {
    $JSCompiler_StaticMethods_AmpFxCollection$$module$extensions$amp_fx_collection$0_1$amp_fx_collection_prototype$register_$self$$.$D$[$JSCompiler_inline_result$jscomp$752_fxType$jscomp$7$$] || ($JSCompiler_StaticMethods_AmpFxCollection$$module$extensions$amp_fx_collection$0_1$amp_fx_collection_prototype$register_$self$$.$D$[$JSCompiler_inline_result$jscomp$752_fxType$jscomp$7$$] = new $FxProvider$$module$extensions$amp_fx_collection$0_1$providers$fx_provider$$($JSCompiler_StaticMethods_AmpFxCollection$$module$extensions$amp_fx_collection$0_1$amp_fx_collection_prototype$register_$self$$.$ampdoc_$, 
    $JSCompiler_inline_result$jscomp$752_fxType$jscomp$7$$));
    $JSCompiler_inline_result$jscomp$752_fxType$jscomp$7$$ = $JSCompiler_StaticMethods_AmpFxCollection$$module$extensions$amp_fx_collection$0_1$amp_fx_collection_prototype$register_$self$$.$D$[$JSCompiler_inline_result$jscomp$752_fxType$jscomp$7$$];
    new $FxElement$$module$extensions$amp_fx_collection$0_1$providers$fx_provider$$($fxElement$jscomp$8$$, $JSCompiler_inline_result$jscomp$752_fxType$jscomp$7$$.$positionObserver_$, $JSCompiler_inline_result$jscomp$752_fxType$jscomp$7$$.$viewport_$, $JSCompiler_inline_result$jscomp$752_fxType$jscomp$7$$.$FxProvider$$module$extensions$amp_fx_collection$0_1$providers$fx_provider$resources_$, $JSCompiler_inline_result$jscomp$752_fxType$jscomp$7$$.$ampdoc_$, $JSCompiler_inline_result$jscomp$752_fxType$jscomp$7$$.$FxProvider$$module$extensions$amp_fx_collection$0_1$providers$fx_provider$fxType_$);
    _.$setStyles$$module$src$style$$($fxElement$jscomp$8$$, _.$assertDoesNotContainDisplay$$module$src$style$$($installStyles$$module$extensions$amp_fx_collection$0_1$providers$amp_fx_presets_utils$$($JSCompiler_inline_result$jscomp$752_fxType$jscomp$7$$.$FxProvider$$module$extensions$amp_fx_collection$0_1$providers$fx_provider$fxType_$)));
  });
}, $JSCompiler_StaticMethods_getFxTypes_$$ = function($fxElement$jscomp$9_fxTypes$jscomp$1$$) {
  $fxElement$jscomp$9_fxTypes$jscomp$1$$ = $fxElement$jscomp$9_fxTypes$jscomp$1$$.getAttribute("amp-fx").trim().toLowerCase().split(/\s+/);
  $fxElement$jscomp$9_fxTypes$jscomp$1$$.forEach(function($fxElement$jscomp$9_fxTypes$jscomp$1$$) {
    _.$JSCompiler_StaticMethods_assertEnumValue$$(_.$user$$module$src$log$$(), $FxType$$module$extensions$amp_fx_collection$0_1$amp_fx_collection$$, $fxElement$jscomp$9_fxTypes$jscomp$1$$, "amp-fx");
  });
  $JSCompiler_StaticMethods_sanitizeFxTypes_$$($fxElement$jscomp$9_fxTypes$jscomp$1$$);
  return $fxElement$jscomp$9_fxTypes$jscomp$1$$;
}, $JSCompiler_StaticMethods_sanitizeFxTypes_$$ = function($fxTypes$jscomp$2$$) {
  for (var $i$jscomp$320$$ = 0; $i$jscomp$320$$ < $fxTypes$jscomp$2$$.length; $i$jscomp$320$$++) {
    var $currentType$$ = $fxTypes$jscomp$2$$[$i$jscomp$320$$];
    if ($currentType$$ in $restrictedFxTypes$$module$extensions$amp_fx_collection$0_1$amp_fx_collection$$) {
      for (var $j$jscomp$45$$ = $i$jscomp$320$$ + 1; $j$jscomp$45$$ < $fxTypes$jscomp$2$$.length; $j$jscomp$45$$++) {
        -1 !== $restrictedFxTypes$$module$extensions$amp_fx_collection$0_1$amp_fx_collection$$[$currentType$$].indexOf($fxTypes$jscomp$2$$[$j$jscomp$45$$]) && (_.$user$$module$src$log$$().$Log$$module$src$log_prototype$warn$("amp-fx-collection", "%s preset can't be combined with %s preset as the resulting animation isn't valid.", $currentType$$, $fxTypes$jscomp$2$$[$j$jscomp$45$$]), $fxTypes$jscomp$2$$.splice($j$jscomp$45$$, 1));
      }
    }
  }
}, $Presets$$module$extensions$amp_fx_collection$0_1$providers$amp_fx_presets$$ = {parallax:{$userAsserts$:function($element$jscomp$414$$) {
  $element$jscomp$414$$.getAttribute("data-parallax-factor");
}, update:function($entry$jscomp$26_top$jscomp$10$$) {
  !($entry$jscomp$26_top$jscomp$10$$ = $entry$jscomp$26_top$jscomp$10$$.$positionRect$ ? $entry$jscomp$26_top$jscomp$10$$.$positionRect$.top : null) || $entry$jscomp$26_top$jscomp$10$$ > this.$adjustedViewportHeight$ || (this.$FxElement$$module$extensions$amp_fx_collection$0_1$providers$fx_provider$offset_$ = (this.$adjustedViewportHeight$ - $entry$jscomp$26_top$jscomp$10$$) * -((0,window.parseFloat)(this.$factor_$) - 1), _.$setStyles$$module$src$style$$(this.$getElement$(), {transform:"translateY(" + 
  this.$FxElement$$module$extensions$amp_fx_collection$0_1$providers$fx_provider$offset_$.toFixed(0) + "px)"}));
}}, "fly-in-bottom":{$userAsserts$:function($element$jscomp$415$$) {
  $element$jscomp$415$$.getAttribute("data-margin-start");
}, update:function($entry$jscomp$27_top$jscomp$11$$) {
  var $fxElement$jscomp$1$$ = this;
  !($entry$jscomp$27_top$jscomp$11$$ = $entry$jscomp$27_top$jscomp$11$$.$positionRect$ ? $entry$jscomp$27_top$jscomp$11$$.$positionRect$.top : null) || $entry$jscomp$27_top$jscomp$11$$ - $fxElement$jscomp$1$$.$viewportHeight$ * $fxElement$jscomp$1$$.$flyInDistance_$ / 100 > (1 - $fxElement$jscomp$1$$.$marginStart_$) * $fxElement$jscomp$1$$.$viewportHeight$ || ($fxElement$jscomp$1$$.$initialTrigger$ || $fxElement$jscomp$1$$.$getResources$().$mutateElement$($fxElement$jscomp$1$$.$getElement$(), function() {
    var $entry$jscomp$27_top$jscomp$11$$ = _.$computedStyle$$module$src$style$$($fxElement$jscomp$1$$.$getAmpDoc$().$win$, $fxElement$jscomp$1$$.$getElement$()), $topAsLength$$ = "auto" === $entry$jscomp$27_top$jscomp$11$$.top ? "0px" : $entry$jscomp$27_top$jscomp$11$$.top;
    $entry$jscomp$27_top$jscomp$11$$ = "static" === $entry$jscomp$27_top$jscomp$11$$.position ? "relative" : $entry$jscomp$27_top$jscomp$11$$.position;
    _.$setStyles$$module$src$style$$($fxElement$jscomp$1$$.$getElement$(), {top:"calc(" + $topAsLength$$ + " +\n                  " + $fxElement$jscomp$1$$.$flyInDistance_$ + "vh)", visibility:"visible", position:$entry$jscomp$27_top$jscomp$11$$});
    $fxElement$jscomp$1$$.$initialTrigger$ = !0;
  }), _.$setStyles$$module$src$style$$($fxElement$jscomp$1$$.$getElement$(), {"transition-duration":$fxElement$jscomp$1$$.$getDuration$(), "transition-timing-function":$fxElement$jscomp$1$$.$easing_$, transform:"translateY(-" + $fxElement$jscomp$1$$.$flyInDistance_$ + "vh)"}));
}}, "fly-in-left":{$userAsserts$:function($element$jscomp$416$$) {
  $element$jscomp$416$$.getAttribute("data-margin-start");
}, update:function($entry$jscomp$28_top$jscomp$12$$) {
  var $fxElement$jscomp$2$$ = this;
  !($entry$jscomp$28_top$jscomp$12$$ = $entry$jscomp$28_top$jscomp$12$$.$positionRect$ ? $entry$jscomp$28_top$jscomp$12$$.$positionRect$.top : null) || $entry$jscomp$28_top$jscomp$12$$ > (1 - $fxElement$jscomp$2$$.$marginStart_$) * $fxElement$jscomp$2$$.$viewportHeight$ || ($fxElement$jscomp$2$$.$initialTrigger$ || $fxElement$jscomp$2$$.$getResources$().$mutateElement$($fxElement$jscomp$2$$.$getElement$(), function() {
    var $entry$jscomp$28_top$jscomp$12$$ = _.$computedStyle$$module$src$style$$($fxElement$jscomp$2$$.$getAmpDoc$().$win$, $fxElement$jscomp$2$$.$getElement$()), $leftAsLength$$ = "auto" === $entry$jscomp$28_top$jscomp$12$$.left ? "0px" : $entry$jscomp$28_top$jscomp$12$$.left;
    $entry$jscomp$28_top$jscomp$12$$ = "static" === $entry$jscomp$28_top$jscomp$12$$.position ? "relative" : $entry$jscomp$28_top$jscomp$12$$.position;
    _.$setStyles$$module$src$style$$($fxElement$jscomp$2$$.$getElement$(), {left:"calc(" + $leftAsLength$$ + " - " + $fxElement$jscomp$2$$.$flyInDistance_$ + "vw)", visibility:"visible", position:$entry$jscomp$28_top$jscomp$12$$});
    $fxElement$jscomp$2$$.$initialTrigger$ = !0;
  }), _.$setStyles$$module$src$style$$($fxElement$jscomp$2$$.$getElement$(), {"transition-duration":$fxElement$jscomp$2$$.$getDuration$(), "transition-timing-function":$fxElement$jscomp$2$$.$easing_$, transform:"translateX(" + $fxElement$jscomp$2$$.$flyInDistance_$ + "vw)"}));
}}, "fly-in-right":{$userAsserts$:function($element$jscomp$417$$) {
  $element$jscomp$417$$.getAttribute("data-margin-start");
}, update:function($entry$jscomp$29_top$jscomp$13$$) {
  var $fxElement$jscomp$3$$ = this;
  !($entry$jscomp$29_top$jscomp$13$$ = $entry$jscomp$29_top$jscomp$13$$.$positionRect$ ? $entry$jscomp$29_top$jscomp$13$$.$positionRect$.top : null) || $entry$jscomp$29_top$jscomp$13$$ > (1 - $fxElement$jscomp$3$$.$marginStart_$) * $fxElement$jscomp$3$$.$viewportHeight$ || ($fxElement$jscomp$3$$.$initialTrigger$ || $fxElement$jscomp$3$$.$getResources$().$mutateElement$($fxElement$jscomp$3$$.$getElement$(), function() {
    var $entry$jscomp$29_top$jscomp$13$$ = _.$computedStyle$$module$src$style$$($fxElement$jscomp$3$$.$getAmpDoc$().$win$, $fxElement$jscomp$3$$.$getElement$()), $leftAsLength$jscomp$1$$ = "auto" === $entry$jscomp$29_top$jscomp$13$$.left ? "0px" : $entry$jscomp$29_top$jscomp$13$$.left;
    $entry$jscomp$29_top$jscomp$13$$ = "static" === $entry$jscomp$29_top$jscomp$13$$.position ? "relative" : $entry$jscomp$29_top$jscomp$13$$.position;
    _.$setStyles$$module$src$style$$($fxElement$jscomp$3$$.$getElement$(), {left:"calc(" + $leftAsLength$jscomp$1$$ + " + " + $fxElement$jscomp$3$$.$flyInDistance_$ + "vw)", visibility:"visible", position:$entry$jscomp$29_top$jscomp$13$$});
    $fxElement$jscomp$3$$.$initialTrigger$ = !0;
  }), _.$setStyles$$module$src$style$$($fxElement$jscomp$3$$.$getElement$(), {"transition-duration":$fxElement$jscomp$3$$.$getDuration$(), "transition-timing-function":$fxElement$jscomp$3$$.$easing_$, transform:"translateX(-" + $fxElement$jscomp$3$$.$flyInDistance_$ + "vw)"}));
}}, "fly-in-top":{$userAsserts$:function($element$jscomp$418$$) {
  $element$jscomp$418$$.getAttribute("data-margin-start");
}, update:function($entry$jscomp$30_top$jscomp$14$$) {
  var $fxElement$jscomp$4$$ = this;
  !($entry$jscomp$30_top$jscomp$14$$ = $entry$jscomp$30_top$jscomp$14$$.$positionRect$ ? $entry$jscomp$30_top$jscomp$14$$.$positionRect$.top : null) || $entry$jscomp$30_top$jscomp$14$$ + $fxElement$jscomp$4$$.$viewportHeight$ * $fxElement$jscomp$4$$.$flyInDistance_$ / 100 > (1 - $fxElement$jscomp$4$$.$marginStart_$) * $fxElement$jscomp$4$$.$viewportHeight$ || ($fxElement$jscomp$4$$.$initialTrigger$ || $fxElement$jscomp$4$$.$getResources$().$mutateElement$($fxElement$jscomp$4$$.$getElement$(), function() {
    var $entry$jscomp$30_top$jscomp$14$$ = _.$computedStyle$$module$src$style$$($fxElement$jscomp$4$$.$getAmpDoc$().$win$, $fxElement$jscomp$4$$.$getElement$()), $topAsLength$jscomp$1$$ = "auto" === $entry$jscomp$30_top$jscomp$14$$.top ? "0px" : $entry$jscomp$30_top$jscomp$14$$.top;
    $entry$jscomp$30_top$jscomp$14$$ = "static" === $entry$jscomp$30_top$jscomp$14$$.position ? "relative" : $entry$jscomp$30_top$jscomp$14$$.position;
    _.$setStyles$$module$src$style$$($fxElement$jscomp$4$$.$getElement$(), {top:"calc(" + $topAsLength$jscomp$1$$ + " -\n                  " + $fxElement$jscomp$4$$.$flyInDistance_$ + "vh)", visibility:"visible", position:$entry$jscomp$30_top$jscomp$14$$});
    $fxElement$jscomp$4$$.$initialTrigger$ = !0;
  }), _.$setStyles$$module$src$style$$($fxElement$jscomp$4$$.$getElement$(), {"transition-duration":$fxElement$jscomp$4$$.$getDuration$(), "transition-timing-function":$fxElement$jscomp$4$$.$easing_$, transform:"translateY(" + $fxElement$jscomp$4$$.$flyInDistance_$ + "vh)"}));
}}, "fade-in":{$userAsserts$:function($element$jscomp$419$$) {
  $element$jscomp$419$$.getAttribute("data-margin-start");
}, update:function($entry$jscomp$31_top$jscomp$15$$) {
  $entry$jscomp$31_top$jscomp$15$$ = $entry$jscomp$31_top$jscomp$15$$.$positionRect$ ? $entry$jscomp$31_top$jscomp$15$$.$positionRect$.top : null;
  !$entry$jscomp$31_top$jscomp$15$$ || $entry$jscomp$31_top$jscomp$15$$ > (1 - this.$marginStart_$) * this.$viewportHeight$ || _.$setStyles$$module$src$style$$(this.$getElement$(), {"transition-duration":this.$getDuration$(), "transition-timing-function":this.$easing_$, opacity:1});
}}, "fade-in-scroll":{$userAsserts$:function($element$jscomp$420$$) {
  $element$jscomp$420$$.getAttribute("data-margin-start");
  $element$jscomp$420$$.getAttribute("data-margin-end");
}, update:function($entry$jscomp$32_top$jscomp$16$$) {
  $entry$jscomp$32_top$jscomp$16$$ = $entry$jscomp$32_top$jscomp$16$$.$positionRect$ ? $entry$jscomp$32_top$jscomp$16$$.$positionRect$.top : null;
  !$entry$jscomp$32_top$jscomp$16$$ || $entry$jscomp$32_top$jscomp$16$$ > (1 - this.$marginStart_$) * this.$adjustedViewportHeight$ || !this.$hasRepeat_$ && 1 <= this.$FxElement$$module$extensions$amp_fx_collection$0_1$providers$fx_provider$offset_$ || (this.$FxElement$$module$extensions$amp_fx_collection$0_1$providers$fx_provider$offset_$ = (this.$viewportHeight$ - $entry$jscomp$32_top$jscomp$16$$ - this.$marginStart_$ * this.$viewportHeight$) / ((this.$marginEnd_$ - this.$marginStart_$) * this.$viewportHeight$), 
  _.$setStyles$$module$src$style$$(this.$getElement$(), {opacity:this.$FxElement$$module$extensions$amp_fx_collection$0_1$providers$fx_provider$offset_$}));
}}};
$FxElement$$module$extensions$amp_fx_collection$0_1$providers$fx_provider$$.prototype.$getAmpDoc$ = function() {
  return this.$ampdoc_$;
};
$FxElement$$module$extensions$amp_fx_collection$0_1$providers$fx_provider$$.prototype.$getDuration$ = function() {
  return this.$duration_$;
};
$FxElement$$module$extensions$amp_fx_collection$0_1$providers$fx_provider$$.prototype.$getElement$ = function() {
  return this.$element_$;
};
$FxElement$$module$extensions$amp_fx_collection$0_1$providers$fx_provider$$.prototype.$getResources$ = function() {
  return this.$F$;
};
var $FxType$$module$extensions$amp_fx_collection$0_1$amp_fx_collection$$ = {$PARALLAX$:"parallax", $FADE_IN$:"fade-in", $FADE_IN_SCROLL$:"fade-in-scroll", $FLY_IN_BOTTOM$:"fly-in-bottom", $FLY_IN_LEFT$:"fly-in-left", $FLY_IN_RIGHT$:"fly-in-right", $FLY_IN_TOP$:"fly-in-top"}, $restrictedFxTypes$$module$extensions$amp_fx_collection$0_1$amp_fx_collection$$ = {parallax:["fly-in-top", "fly-in-bottom"], "fly-in-top":["parallax", "fly-in-bottom"], "fly-in-bottom":["fly-in-top", "parallax"], "fly-in-right":["fly-in-left"], 
"fly-in-left":["fly-in-right"], "fade-in":["fade-in-scroll"], "fade-in-scroll":["fade-in"]};
$AmpFxCollection$$module$extensions$amp_fx_collection$0_1$amp_fx_collection$$.prototype.$G$ = function() {
  var $$jscomp$this$jscomp$628$$ = this;
  _.$iterateCursor$$module$src$dom$$(this.$F$.querySelectorAll("[amp-fx]"), function($fxElement$jscomp$7$$) {
    if (!$$jscomp$this$jscomp$628$$.$seen_$.includes($fxElement$jscomp$7$$)) {
      try {
        $JSCompiler_StaticMethods_AmpFxCollection$$module$extensions$amp_fx_collection$0_1$amp_fx_collection_prototype$register_$$($$jscomp$this$jscomp$628$$, $fxElement$jscomp$7$$), $$jscomp$this$jscomp$628$$.$seen_$.push($fxElement$jscomp$7$$);
      } catch ($e$256$$) {
        _.$rethrowAsync$$module$src$log$$($e$256$$);
      }
    }
  });
};
window.self.AMP.registerServiceForDoc("amp-fx-collection", $AmpFxCollection$$module$extensions$amp_fx_collection$0_1$amp_fx_collection$$);

})});
