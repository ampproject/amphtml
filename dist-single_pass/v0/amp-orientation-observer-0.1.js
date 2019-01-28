(self.AMP=self.AMP||[]).push({n:"amp-orientation-observer",i:["_base_i","_base_misc"],v:"1901181729101",f:(function(AMP,_){
var $AmpOrientationObserver$$module$extensions$amp_orientation_observer$0_1$amp_orientation_observer$$ = function($$jscomp$super$this$jscomp$80_element$jscomp$511$$) {
  $$jscomp$super$this$jscomp$80_element$jscomp$511$$ = window.AMP.BaseElement.call(this, $$jscomp$super$this$jscomp$80_element$jscomp$511$$) || this;
  $$jscomp$super$this$jscomp$80_element$jscomp$511$$.$ampdoc_$ = _.$getAmpdoc$$module$src$service$$($$jscomp$super$this$jscomp$80_element$jscomp$511$$.element);
  $$jscomp$super$this$jscomp$80_element$jscomp$511$$.$action_$ = null;
  $$jscomp$super$this$jscomp$80_element$jscomp$511$$.$alphaRange_$ = [0, 360];
  $$jscomp$super$this$jscomp$80_element$jscomp$511$$.$betaRange_$ = [-180, 180];
  $$jscomp$super$this$jscomp$80_element$jscomp$511$$.$gammaRange_$ = [-90, 90];
  $$jscomp$super$this$jscomp$80_element$jscomp$511$$.$alphaValue_$ = 180;
  $$jscomp$super$this$jscomp$80_element$jscomp$511$$.$betaValue_$ = 0;
  $$jscomp$super$this$jscomp$80_element$jscomp$511$$.$gammaValue_$ = 0;
  return $$jscomp$super$this$jscomp$80_element$jscomp$511$$;
}, $JSCompiler_StaticMethods_AmpOrientationObserver$$module$extensions$amp_orientation_observer$0_1$amp_orientation_observer_prototype$parseAttributes_$$ = function($JSCompiler_StaticMethods_AmpOrientationObserver$$module$extensions$amp_orientation_observer$0_1$amp_orientation_observer_prototype$parseAttributes_$self_providedRange$$, $rangeName$$, $originalRange_rangeArray$$) {
  return ($JSCompiler_StaticMethods_AmpOrientationObserver$$module$extensions$amp_orientation_observer$0_1$amp_orientation_observer_prototype$parseAttributes_$self_providedRange$$ = $JSCompiler_StaticMethods_AmpOrientationObserver$$module$extensions$amp_orientation_observer$0_1$amp_orientation_observer_prototype$parseAttributes_$self_providedRange$$.element.getAttribute($rangeName$$)) ? ($originalRange_rangeArray$$ = $JSCompiler_StaticMethods_AmpOrientationObserver$$module$extensions$amp_orientation_observer$0_1$amp_orientation_observer_prototype$parseAttributes_$self_providedRange$$.trim().split(" "), 
  [(0,window.parseInt)($originalRange_rangeArray$$[0], 10), (0,window.parseInt)($originalRange_rangeArray$$[1], 10)]) : $originalRange_rangeArray$$;
}, $JSCompiler_StaticMethods_AmpOrientationObserver$$module$extensions$amp_orientation_observer$0_1$amp_orientation_observer_prototype$triggerEvent_$$ = function($JSCompiler_StaticMethods_AmpOrientationObserver$$module$extensions$amp_orientation_observer$0_1$amp_orientation_observer_prototype$triggerEvent_$self$$, $eventName$jscomp$7$$, $event$jscomp$163_eventValue$$, $eventRange$$) {
  $event$jscomp$163_eventValue$$ = _.$createCustomEvent$$module$src$event_helper$$($JSCompiler_StaticMethods_AmpOrientationObserver$$module$extensions$amp_orientation_observer$0_1$amp_orientation_observer_prototype$triggerEvent_$self$$.$win$, "amp-orientation-observer." + $eventName$jscomp$7$$, _.$dict$$module$src$utils$object$$({angle:$event$jscomp$163_eventValue$$.toFixed(), percent:(0 > $eventRange$$[0] ? $event$jscomp$163_eventValue$$.toFixed() - $eventRange$$[0] : $event$jscomp$163_eventValue$$.toFixed()) / 
  ($eventRange$$[1] - $eventRange$$[0])}));
  $JSCompiler_StaticMethods_AmpOrientationObserver$$module$extensions$amp_orientation_observer$0_1$amp_orientation_observer_prototype$triggerEvent_$self$$.$action_$.$trigger$($JSCompiler_StaticMethods_AmpOrientationObserver$$module$extensions$amp_orientation_observer$0_1$amp_orientation_observer_prototype$triggerEvent_$self$$.element, $eventName$jscomp$7$$, $event$jscomp$163_eventValue$$, 1);
};
_.$$jscomp$inherits$$($AmpOrientationObserver$$module$extensions$amp_orientation_observer$0_1$amp_orientation_observer$$, window.AMP.BaseElement);
$AmpOrientationObserver$$module$extensions$amp_orientation_observer$0_1$amp_orientation_observer$$.prototype.$buildCallback$ = function() {
  this.$action_$ = _.$Services$$module$src$services$actionServiceForDoc$$(this.element);
  _.$Services$$module$src$services$viewerForDoc$$(this.$ampdoc_$).$D$.then(this.$D$.bind(this));
};
$AmpOrientationObserver$$module$extensions$amp_orientation_observer$0_1$amp_orientation_observer$$.prototype.$D$ = function() {
  var $$jscomp$this$jscomp$784$$ = this;
  this.$alphaRange_$ = $JSCompiler_StaticMethods_AmpOrientationObserver$$module$extensions$amp_orientation_observer$0_1$amp_orientation_observer_prototype$parseAttributes_$$(this, "alpha-range", this.$alphaRange_$);
  this.$betaRange_$ = $JSCompiler_StaticMethods_AmpOrientationObserver$$module$extensions$amp_orientation_observer$0_1$amp_orientation_observer_prototype$parseAttributes_$$(this, "beta-range", this.$betaRange_$);
  this.$gammaRange_$ = $JSCompiler_StaticMethods_AmpOrientationObserver$$module$extensions$amp_orientation_observer$0_1$amp_orientation_observer_prototype$parseAttributes_$$(this, "gamma-range", this.$gammaRange_$);
  this.$win$.addEventListener("deviceorientation", function($event$jscomp$161$$) {
    $event$jscomp$161$$ instanceof window.DeviceOrientationEvent && (0.1 < Math.abs($event$jscomp$161$$.alpha - $$jscomp$this$jscomp$784$$.$alphaValue_$) && ($$jscomp$this$jscomp$784$$.$alphaValue_$ = $event$jscomp$161$$.alpha, $JSCompiler_StaticMethods_AmpOrientationObserver$$module$extensions$amp_orientation_observer$0_1$amp_orientation_observer_prototype$triggerEvent_$$($$jscomp$this$jscomp$784$$, "alpha", $$jscomp$this$jscomp$784$$.$alphaValue_$, $$jscomp$this$jscomp$784$$.$alphaRange_$)), 0.1 < 
    Math.abs($event$jscomp$161$$.beta - $$jscomp$this$jscomp$784$$.$betaValue_$) && ($$jscomp$this$jscomp$784$$.$betaValue_$ = $event$jscomp$161$$.beta, $JSCompiler_StaticMethods_AmpOrientationObserver$$module$extensions$amp_orientation_observer$0_1$amp_orientation_observer_prototype$triggerEvent_$$($$jscomp$this$jscomp$784$$, "beta", $$jscomp$this$jscomp$784$$.$betaValue_$, $$jscomp$this$jscomp$784$$.$betaRange_$)), 0.1 < Math.abs($event$jscomp$161$$.gamma - $$jscomp$this$jscomp$784$$.$gammaValue_$) && 
    ($$jscomp$this$jscomp$784$$.$gammaValue_$ = $event$jscomp$161$$.gamma, $JSCompiler_StaticMethods_AmpOrientationObserver$$module$extensions$amp_orientation_observer$0_1$amp_orientation_observer_prototype$triggerEvent_$$($$jscomp$this$jscomp$784$$, "gamma", $$jscomp$this$jscomp$784$$.$gammaValue_$, $$jscomp$this$jscomp$784$$.$gammaRange_$)));
  }, !0);
};
window.self.AMP.registerElement("amp-orientation-observer", $AmpOrientationObserver$$module$extensions$amp_orientation_observer$0_1$amp_orientation_observer$$);

})});
