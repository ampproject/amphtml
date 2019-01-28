(self.AMP=self.AMP||[]).push({n:"amp-position-observer",i:["_base_i","_base_misc"],v:"1901181729101",f:(function(AMP,_){
var $AmpVisibilityObserver$$module$extensions$amp_position_observer$0_1$amp_position_observer$$ = function($$jscomp$super$this$jscomp$83_element$jscomp$519$$) {
  $$jscomp$super$this$jscomp$83_element$jscomp$519$$ = window.AMP.BaseElement.call(this, $$jscomp$super$this$jscomp$83_element$jscomp$519$$) || this;
  $$jscomp$super$this$jscomp$83_element$jscomp$519$$.$action_$ = null;
  $$jscomp$super$this$jscomp$83_element$jscomp$519$$.$isVisible_$ = !1;
  $$jscomp$super$this$jscomp$83_element$jscomp$519$$.$positionObserver_$ = null;
  $$jscomp$super$this$jscomp$83_element$jscomp$519$$.$topRatio_$ = 0;
  $$jscomp$super$this$jscomp$83_element$jscomp$519$$.$bottomRatio_$ = 0;
  $$jscomp$super$this$jscomp$83_element$jscomp$519$$.$topMarginExpr_$ = "0";
  $$jscomp$super$this$jscomp$83_element$jscomp$519$$.$bottomMarginExpr_$ = "0";
  $$jscomp$super$this$jscomp$83_element$jscomp$519$$.$resolvedTopMargin_$ = 0;
  $$jscomp$super$this$jscomp$83_element$jscomp$519$$.$resolvedBottomMargin_$ = 0;
  $$jscomp$super$this$jscomp$83_element$jscomp$519$$.$viewportRect_$ = null;
  $$jscomp$super$this$jscomp$83_element$jscomp$519$$.$targetId_$ = null;
  $$jscomp$super$this$jscomp$83_element$jscomp$519$$.$initialViewportHeight_$ = null;
  $$jscomp$super$this$jscomp$83_element$jscomp$519$$.$scrollProgress_$ = 0;
  $$jscomp$super$this$jscomp$83_element$jscomp$519$$.$runOnce_$ = !1;
  $$jscomp$super$this$jscomp$83_element$jscomp$519$$.$firstIterationComplete_$ = !1;
  return $$jscomp$super$this$jscomp$83_element$jscomp$519$$;
}, $JSCompiler_StaticMethods_triggerScroll_$$ = function($JSCompiler_StaticMethods_triggerScroll_$self$$, $adjustedViewportRect$$) {
  var $event$jscomp$173$$ = _.$createCustomEvent$$module$src$event_helper$$($JSCompiler_StaticMethods_triggerScroll_$self$$.$win$, "amp-position-observer.scroll", _.$dict$$module$src$utils$object$$({percent:$JSCompiler_StaticMethods_triggerScroll_$self$$.$scrollProgress_$}));
  $event$jscomp$173$$.$D$ = {"top-ratio":$JSCompiler_StaticMethods_triggerScroll_$self$$.$topRatio_$, "bottom-ratio":$JSCompiler_StaticMethods_triggerScroll_$self$$.$bottomRatio_$, "top-margin":$adjustedViewportRect$$.top, "bottom-margin":$adjustedViewportRect$$.bottom};
  $JSCompiler_StaticMethods_triggerScroll_$self$$.$action_$.$trigger$($JSCompiler_StaticMethods_triggerScroll_$self$$.element, "scroll", $event$jscomp$173$$, 1);
}, $JSCompiler_StaticMethods_AmpVisibilityObserver$$module$extensions$amp_position_observer$0_1$amp_position_observer_prototype$parseAttributes_$$ = function($JSCompiler_StaticMethods_AmpVisibilityObserver$$module$extensions$amp_position_observer$0_1$amp_position_observer_prototype$parseAttributes_$self$$) {
  var $margins$jscomp$4_ratios_topBottom_topBottom$283$$ = $JSCompiler_StaticMethods_AmpVisibilityObserver$$module$extensions$amp_position_observer$0_1$amp_position_observer_prototype$parseAttributes_$self$$.element.getAttribute("intersection-ratios");
  $margins$jscomp$4_ratios_topBottom_topBottom$283$$ && ($margins$jscomp$4_ratios_topBottom_topBottom$283$$ = $margins$jscomp$4_ratios_topBottom_topBottom$283$$.trim().split(" "), $JSCompiler_StaticMethods_AmpVisibilityObserver$$module$extensions$amp_position_observer$0_1$amp_position_observer_prototype$parseAttributes_$self$$.$topRatio_$ = (0,window.parseFloat)($margins$jscomp$4_ratios_topBottom_topBottom$283$$[0]), $JSCompiler_StaticMethods_AmpVisibilityObserver$$module$extensions$amp_position_observer$0_1$amp_position_observer_prototype$parseAttributes_$self$$.$bottomRatio_$ = 
  $JSCompiler_StaticMethods_AmpVisibilityObserver$$module$extensions$amp_position_observer$0_1$amp_position_observer_prototype$parseAttributes_$self$$.$topRatio_$, $margins$jscomp$4_ratios_topBottom_topBottom$283$$[1] && ($JSCompiler_StaticMethods_AmpVisibilityObserver$$module$extensions$amp_position_observer$0_1$amp_position_observer_prototype$parseAttributes_$self$$.$bottomRatio_$ = (0,window.parseFloat)($margins$jscomp$4_ratios_topBottom_topBottom$283$$[1])));
  if ($margins$jscomp$4_ratios_topBottom_topBottom$283$$ = $JSCompiler_StaticMethods_AmpVisibilityObserver$$module$extensions$amp_position_observer$0_1$amp_position_observer_prototype$parseAttributes_$self$$.element.getAttribute("viewport-margins")) {
    $margins$jscomp$4_ratios_topBottom_topBottom$283$$ = $margins$jscomp$4_ratios_topBottom_topBottom$283$$.trim().split(" "), $JSCompiler_StaticMethods_AmpVisibilityObserver$$module$extensions$amp_position_observer$0_1$amp_position_observer_prototype$parseAttributes_$self$$.$topMarginExpr_$ = $margins$jscomp$4_ratios_topBottom_topBottom$283$$[0], $JSCompiler_StaticMethods_AmpVisibilityObserver$$module$extensions$amp_position_observer$0_1$amp_position_observer_prototype$parseAttributes_$self$$.$bottomMarginExpr_$ = 
    $JSCompiler_StaticMethods_AmpVisibilityObserver$$module$extensions$amp_position_observer$0_1$amp_position_observer_prototype$parseAttributes_$self$$.$topMarginExpr_$, $margins$jscomp$4_ratios_topBottom_topBottom$283$$[1] && ($JSCompiler_StaticMethods_AmpVisibilityObserver$$module$extensions$amp_position_observer$0_1$amp_position_observer_prototype$parseAttributes_$self$$.$bottomMarginExpr_$ = $margins$jscomp$4_ratios_topBottom_topBottom$283$$[1]);
  }
  $JSCompiler_StaticMethods_AmpVisibilityObserver$$module$extensions$amp_position_observer$0_1$amp_position_observer_prototype$parseAttributes_$self$$.$targetId_$ = $JSCompiler_StaticMethods_AmpVisibilityObserver$$module$extensions$amp_position_observer$0_1$amp_position_observer_prototype$parseAttributes_$self$$.element.getAttribute("target");
}, $JSCompiler_StaticMethods_validateAndResolveMargin_$$ = function($JSCompiler_StaticMethods_validateAndResolveMargin_$self$$, $num$jscomp$21_val$jscomp$24$$) {
  $num$jscomp$21_val$jscomp$24$$ = _.$parseLength$$module$src$layout$$($num$jscomp$21_val$jscomp$24$$);
  var $JSCompiler_inline_result$jscomp$825_length$jscomp$inline_3875$$ = $num$jscomp$21_val$jscomp$24$$;
  $JSCompiler_inline_result$jscomp$825_length$jscomp$inline_3875$$;
  $JSCompiler_inline_result$jscomp$825_length$jscomp$inline_3875$$ = $JSCompiler_inline_result$jscomp$825_length$jscomp$inline_3875$$.match(/[a-z]+/i)[0];
  $num$jscomp$21_val$jscomp$24$$ = _.$getLengthNumeral$$module$src$layout$$($num$jscomp$21_val$jscomp$24$$);
  if (!$num$jscomp$21_val$jscomp$24$$) {
    return 0;
  }
  "vh" == $JSCompiler_inline_result$jscomp$825_length$jscomp$inline_3875$$ && ($num$jscomp$21_val$jscomp$24$$ = $num$jscomp$21_val$jscomp$24$$ / 100 * $JSCompiler_StaticMethods_validateAndResolveMargin_$self$$.$viewportRect_$.height);
  return $num$jscomp$21_val$jscomp$24$$;
};
_.$$jscomp$inherits$$($AmpVisibilityObserver$$module$extensions$amp_position_observer$0_1$amp_position_observer$$, window.AMP.BaseElement);
$AmpVisibilityObserver$$module$extensions$amp_position_observer$0_1$amp_position_observer$$.prototype.$buildCallback$ = function() {
  _.$Services$$module$src$services$viewerForDoc$$(this.$getAmpDoc$()).$D$.then(this.$D$.bind(this));
  this.$runOnce_$ = this.element.hasAttribute("once");
};
$AmpVisibilityObserver$$module$extensions$amp_position_observer$0_1$amp_position_observer$$.prototype.$D$ = function() {
  var $$jscomp$this$jscomp$803$$ = this;
  $JSCompiler_StaticMethods_AmpVisibilityObserver$$module$extensions$amp_position_observer$0_1$amp_position_observer_prototype$parseAttributes_$$(this);
  this.$action_$ = _.$Services$$module$src$services$actionServiceForDoc$$(this.element);
  this.$positionObserver_$ || (_.$installPositionObserverServiceForDoc$$module$src$service$position_observer$position_observer_impl$$(this.$getAmpDoc$()), this.$positionObserver_$ = _.$getServiceForDoc$$module$src$service$$(this.$getAmpDoc$(), "position-observer"));
  this.$getAmpDoc$().$whenReady$().then(function() {
    var $scene$jscomp$inline_3847$$;
    $$jscomp$this$jscomp$803$$.$targetId_$ ? $scene$jscomp$inline_3847$$ = _.$JSCompiler_StaticMethods_assertElement$$(_.$user$$module$src$log$$(), $$jscomp$this$jscomp$803$$.$getAmpDoc$().getElementById($$jscomp$this$jscomp$803$$.$targetId_$), "No element found with id:" + $$jscomp$this$jscomp$803$$.$targetId_$) : $scene$jscomp$inline_3847$$ = $$jscomp$this$jscomp$803$$.element.parentNode;
    $$jscomp$this$jscomp$803$$.$getAmpDoc$().$getBody$() == $scene$jscomp$inline_3847$$ && ($scene$jscomp$inline_3847$$ = $$jscomp$this$jscomp$803$$.$win$.document.documentElement);
    $$jscomp$this$jscomp$803$$.$positionObserver_$.observe($scene$jscomp$inline_3847$$, 1, $$jscomp$this$jscomp$803$$.$F$.bind($$jscomp$this$jscomp$803$$));
  });
};
$AmpVisibilityObserver$$module$extensions$amp_position_observer$0_1$amp_position_observer$$.prototype.$F$ = function($entry$jscomp$36_event$jscomp$inline_3866_relPos$$) {
  if (!this.$runOnce_$ || !this.$firstIterationComplete_$) {
    var $event$jscomp$inline_3869_wasVisible$jscomp$1$$ = this.$isVisible_$, $JSCompiler_inline_result$jscomp$829_prevViewportHeight_rect$jscomp$inline_3857$$ = this.$viewportRect_$ && this.$viewportRect_$.height;
    this.$initialViewportHeight_$ || (this.$initialViewportHeight_$ = $entry$jscomp$36_event$jscomp$inline_3866_relPos$$.$viewportRect$.height);
    var $positionRect$jscomp$2_viewportHeightChangeDelta$jscomp$inline_3851$$ = this.$initialViewportHeight_$ - $entry$jscomp$36_event$jscomp$inline_3866_relPos$$.$viewportRect$.height, $relativePos$jscomp$inline_3862_resizeOffset$jscomp$inline_3852$$ = 0;
    150 > Math.abs($positionRect$jscomp$2_viewportHeightChangeDelta$jscomp$inline_3851$$) ? $relativePos$jscomp$inline_3862_resizeOffset$jscomp$inline_3852$$ = $positionRect$jscomp$2_viewportHeightChangeDelta$jscomp$inline_3851$$ : this.$initialViewportHeight_$ = null;
    $entry$jscomp$36_event$jscomp$inline_3866_relPos$$.$viewportRect$ = _.$layoutRectLtwh$$module$src$layout_rect$$($entry$jscomp$36_event$jscomp$inline_3866_relPos$$.$viewportRect$.left, $entry$jscomp$36_event$jscomp$inline_3866_relPos$$.$viewportRect$.top, $entry$jscomp$36_event$jscomp$inline_3866_relPos$$.$viewportRect$.width, $entry$jscomp$36_event$jscomp$inline_3866_relPos$$.$viewportRect$.height + $relativePos$jscomp$inline_3862_resizeOffset$jscomp$inline_3852$$);
    this.$viewportRect_$ = $entry$jscomp$36_event$jscomp$inline_3866_relPos$$.$viewportRect$;
    $JSCompiler_inline_result$jscomp$829_prevViewportHeight_rect$jscomp$inline_3857$$ != $entry$jscomp$36_event$jscomp$inline_3866_relPos$$.$viewportRect$.height && (this.$resolvedTopMargin_$ = $JSCompiler_StaticMethods_validateAndResolveMargin_$$(this, this.$topMarginExpr_$), this.$resolvedBottomMargin_$ = $JSCompiler_StaticMethods_validateAndResolveMargin_$$(this, this.$bottomMarginExpr_$));
    $JSCompiler_inline_result$jscomp$829_prevViewportHeight_rect$jscomp$inline_3857$$ = $entry$jscomp$36_event$jscomp$inline_3866_relPos$$.$viewportRect$;
    $JSCompiler_inline_result$jscomp$829_prevViewportHeight_rect$jscomp$inline_3857$$ = _.$layoutRectLtwh$$module$src$layout_rect$$($JSCompiler_inline_result$jscomp$829_prevViewportHeight_rect$jscomp$inline_3857$$.left, $JSCompiler_inline_result$jscomp$829_prevViewportHeight_rect$jscomp$inline_3857$$.top + this.$resolvedTopMargin_$, $JSCompiler_inline_result$jscomp$829_prevViewportHeight_rect$jscomp$inline_3857$$.width, $JSCompiler_inline_result$jscomp$829_prevViewportHeight_rect$jscomp$inline_3857$$.height - 
    this.$resolvedBottomMargin_$ - this.$resolvedTopMargin_$);
    if ($positionRect$jscomp$2_viewportHeightChangeDelta$jscomp$inline_3851$$ = $entry$jscomp$36_event$jscomp$inline_3866_relPos$$.$positionRect$) {
      if ($relativePos$jscomp$inline_3862_resizeOffset$jscomp$inline_3852$$ = $entry$jscomp$36_event$jscomp$inline_3866_relPos$$ = _.$layoutRectsRelativePos$$module$src$layout_rect$$($positionRect$jscomp$2_viewportHeightChangeDelta$jscomp$inline_3851$$, $JSCompiler_inline_result$jscomp$829_prevViewportHeight_rect$jscomp$inline_3857$$), "inside" == $relativePos$jscomp$inline_3862_resizeOffset$jscomp$inline_3852$$) {
        this.$isVisible_$ = !0;
      } else {
        var $offset$jscomp$inline_3863$$ = $positionRect$jscomp$2_viewportHeightChangeDelta$jscomp$inline_3851$$.height * ("top" == $relativePos$jscomp$inline_3862_resizeOffset$jscomp$inline_3852$$ ? this.$topRatio_$ : this.$bottomRatio_$);
        this.$isVisible_$ = "bottom" == $relativePos$jscomp$inline_3862_resizeOffset$jscomp$inline_3852$$ ? $positionRect$jscomp$2_viewportHeightChangeDelta$jscomp$inline_3851$$.top <= $JSCompiler_inline_result$jscomp$829_prevViewportHeight_rect$jscomp$inline_3857$$.bottom - $offset$jscomp$inline_3863$$ : $positionRect$jscomp$2_viewportHeightChangeDelta$jscomp$inline_3851$$.bottom >= $JSCompiler_inline_result$jscomp$829_prevViewportHeight_rect$jscomp$inline_3857$$.top + $offset$jscomp$inline_3863$$;
      }
    } else {
      this.$isVisible_$ = !1, $entry$jscomp$36_event$jscomp$inline_3866_relPos$$ = $entry$jscomp$36_event$jscomp$inline_3866_relPos$$.$relativePos$;
    }
    $event$jscomp$inline_3869_wasVisible$jscomp$1$$ && !this.$isVisible_$ && (this.$scrollProgress_$ = "bottom" == $entry$jscomp$36_event$jscomp$inline_3866_relPos$$ ? 0 : 1, $JSCompiler_StaticMethods_triggerScroll_$$(this, $JSCompiler_inline_result$jscomp$829_prevViewportHeight_rect$jscomp$inline_3857$$), $entry$jscomp$36_event$jscomp$inline_3866_relPos$$ = _.$createCustomEvent$$module$src$event_helper$$(this.$win$, "amp-position-observer.exit", _.$dict$$module$src$utils$object$$({})), this.$action_$.$trigger$(this.element, 
    "exit", $entry$jscomp$36_event$jscomp$inline_3866_relPos$$, 1), this.$firstIterationComplete_$ = !0);
    !$event$jscomp$inline_3869_wasVisible$jscomp$1$$ && this.$isVisible_$ && ($event$jscomp$inline_3869_wasVisible$jscomp$1$$ = _.$createCustomEvent$$module$src$event_helper$$(this.$win$, "amp-position-observer.enter", _.$dict$$module$src$utils$object$$({})), this.$action_$.$trigger$(this.element, "enter", $event$jscomp$inline_3869_wasVisible$jscomp$1$$, 1));
    this.$isVisible_$ && ($positionRect$jscomp$2_viewportHeightChangeDelta$jscomp$inline_3851$$ && (this.$scrollProgress_$ = Math.abs($positionRect$jscomp$2_viewportHeightChangeDelta$jscomp$inline_3851$$.top - this.$resolvedTopMargin_$ - ($JSCompiler_inline_result$jscomp$829_prevViewportHeight_rect$jscomp$inline_3857$$.height - $positionRect$jscomp$2_viewportHeightChangeDelta$jscomp$inline_3851$$.height * this.$bottomRatio_$)) / ($JSCompiler_inline_result$jscomp$829_prevViewportHeight_rect$jscomp$inline_3857$$.height + 
    $positionRect$jscomp$2_viewportHeightChangeDelta$jscomp$inline_3851$$.height - ($positionRect$jscomp$2_viewportHeightChangeDelta$jscomp$inline_3851$$.height * this.$bottomRatio_$ + $positionRect$jscomp$2_viewportHeightChangeDelta$jscomp$inline_3851$$.height * this.$topRatio_$))), $JSCompiler_StaticMethods_triggerScroll_$$(this, $JSCompiler_inline_result$jscomp$829_prevViewportHeight_rect$jscomp$inline_3857$$));
  }
};
window.self.AMP.registerElement("amp-position-observer", $AmpVisibilityObserver$$module$extensions$amp_position_observer$0_1$amp_position_observer$$);

})});
