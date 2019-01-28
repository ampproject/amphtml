(self.AMP=self.AMP||[]).push({n:"amp-bodymovin-animation",i:["_base_i","_base_media"],v:"1901181729101",f:(function(AMP,_){
var $AmpBodymovinAnimation$$module$extensions$amp_bodymovin_animation$0_1$amp_bodymovin_animation$$ = function($$jscomp$super$this$jscomp$24_element$jscomp$363$$) {
  $$jscomp$super$this$jscomp$24_element$jscomp$363$$ = window.AMP.BaseElement.call(this, $$jscomp$super$this$jscomp$24_element$jscomp$363$$) || this;
  $$jscomp$super$this$jscomp$24_element$jscomp$363$$.$ampdoc_$ = _.$getAmpdoc$$module$src$service$$($$jscomp$super$this$jscomp$24_element$jscomp$363$$.element);
  $$jscomp$super$this$jscomp$24_element$jscomp$363$$.$iframe_$ = null;
  $$jscomp$super$this$jscomp$24_element$jscomp$363$$.$loop_$ = null;
  $$jscomp$super$this$jscomp$24_element$jscomp$363$$.$renderer_$ = null;
  $$jscomp$super$this$jscomp$24_element$jscomp$363$$.$autoplay_$ = null;
  $$jscomp$super$this$jscomp$24_element$jscomp$363$$.$playerReadyPromise_$ = null;
  $$jscomp$super$this$jscomp$24_element$jscomp$363$$.$playerReadyResolver_$ = null;
  $$jscomp$super$this$jscomp$24_element$jscomp$363$$.$unlistenMessage_$ = null;
  return $$jscomp$super$this$jscomp$24_element$jscomp$363$$;
}, $JSCompiler_StaticMethods_AmpBodymovinAnimation$$module$extensions$amp_bodymovin_animation$0_1$amp_bodymovin_animation_prototype$sendCommand_$$ = function($JSCompiler_StaticMethods_AmpBodymovinAnimation$$module$extensions$amp_bodymovin_animation$0_1$amp_bodymovin_animation_prototype$sendCommand_$self$$, $action$jscomp$17$$, $opt_valueType$$, $opt_value$jscomp$9$$) {
  $JSCompiler_StaticMethods_AmpBodymovinAnimation$$module$extensions$amp_bodymovin_animation$0_1$amp_bodymovin_animation_prototype$sendCommand_$self$$.$playerReadyPromise_$.then(function() {
    if ($JSCompiler_StaticMethods_AmpBodymovinAnimation$$module$extensions$amp_bodymovin_animation$0_1$amp_bodymovin_animation_prototype$sendCommand_$self$$.$iframe_$ && $JSCompiler_StaticMethods_AmpBodymovinAnimation$$module$extensions$amp_bodymovin_animation$0_1$amp_bodymovin_animation_prototype$sendCommand_$self$$.$iframe_$.contentWindow) {
      var $message$jscomp$59$$ = JSON.stringify(_.$dict$$module$src$utils$object$$({action:$action$jscomp$17$$, valueType:$opt_valueType$$ || "", value:$opt_value$jscomp$9$$ || ""}));
      $JSCompiler_StaticMethods_AmpBodymovinAnimation$$module$extensions$amp_bodymovin_animation$0_1$amp_bodymovin_animation_prototype$sendCommand_$self$$.$iframe_$.contentWindow.postMessage($message$jscomp$59$$, "*");
    }
  });
};
_.$$jscomp$inherits$$($AmpBodymovinAnimation$$module$extensions$amp_bodymovin_animation$0_1$amp_bodymovin_animation$$, window.AMP.BaseElement);
_.$JSCompiler_prototypeAlias$$ = $AmpBodymovinAnimation$$module$extensions$amp_bodymovin_animation$0_1$amp_bodymovin_animation$$.prototype;
_.$JSCompiler_prototypeAlias$$.$isLayoutSupported$ = function($layout$jscomp$39$$) {
  return _.$isLayoutSizeDefined$$module$src$layout$$($layout$jscomp$39$$);
};
_.$JSCompiler_prototypeAlias$$.$preconnectCallback$ = function($opt_onLayout$jscomp$8$$) {
  var $scriptToLoad$$ = "svg" === this.$renderer_$ ? "https://cdnjs.cloudflare.com/ajax/libs/bodymovin/4.13.0/bodymovin_light.min.js" : "https://cdnjs.cloudflare.com/ajax/libs/bodymovin/4.13.0/bodymovin.min.js";
  _.$preloadBootstrap$$module$src$3p_frame$$(this.$win$, this.$preconnect$);
  this.$preconnect$.url($scriptToLoad$$, $opt_onLayout$jscomp$8$$);
};
_.$JSCompiler_prototypeAlias$$.$buildCallback$ = function() {
  var $$jscomp$this$jscomp$489$$ = this;
  this.$loop_$ = this.element.getAttribute("loop") || "true";
  this.$autoplay_$ = !this.element.hasAttribute("noautoplay");
  this.$renderer_$ = this.element.getAttribute("renderer") || "svg";
  this.element.getAttribute("src");
  var $deferred$jscomp$34$$ = new _.$Deferred$$module$src$utils$promise$$;
  this.$playerReadyPromise_$ = $deferred$jscomp$34$$.$promise$;
  this.$playerReadyResolver_$ = $deferred$jscomp$34$$.resolve;
  _.$JSCompiler_StaticMethods_registerAction$$(this, "play", function() {
    $JSCompiler_StaticMethods_AmpBodymovinAnimation$$module$extensions$amp_bodymovin_animation$0_1$amp_bodymovin_animation_prototype$sendCommand_$$($$jscomp$this$jscomp$489$$, "play");
  }, 1);
  _.$JSCompiler_StaticMethods_registerAction$$(this, "pause", function() {
    $JSCompiler_StaticMethods_AmpBodymovinAnimation$$module$extensions$amp_bodymovin_animation$0_1$amp_bodymovin_animation_prototype$sendCommand_$$($$jscomp$this$jscomp$489$$, "pause");
  }, 1);
  _.$JSCompiler_StaticMethods_registerAction$$(this, "stop", function() {
    $JSCompiler_StaticMethods_AmpBodymovinAnimation$$module$extensions$amp_bodymovin_animation$0_1$amp_bodymovin_animation_prototype$sendCommand_$$($$jscomp$this$jscomp$489$$, "stop");
  }, 1);
  _.$JSCompiler_StaticMethods_registerAction$$(this, "seekTo", function($deferred$jscomp$34$$) {
    if ($deferred$jscomp$34$$ = $deferred$jscomp$34$$.args) {
      var $args$jscomp$30_invocation$jscomp$27_percent$jscomp$inline_2936$$ = (0,window.parseFloat)($deferred$jscomp$34$$ && $deferred$jscomp$34$$.time);
      _.$isFiniteNumber$$module$src$types$$($args$jscomp$30_invocation$jscomp$27_percent$jscomp$inline_2936$$) && $JSCompiler_StaticMethods_AmpBodymovinAnimation$$module$extensions$amp_bodymovin_animation$0_1$amp_bodymovin_animation_prototype$sendCommand_$$($$jscomp$this$jscomp$489$$, "seekTo", "time", $args$jscomp$30_invocation$jscomp$27_percent$jscomp$inline_2936$$);
      $deferred$jscomp$34$$ = (0,window.parseFloat)($deferred$jscomp$34$$ && $deferred$jscomp$34$$.percent);
      _.$isFiniteNumber$$module$src$types$$($deferred$jscomp$34$$) && $JSCompiler_StaticMethods_AmpBodymovinAnimation$$module$extensions$amp_bodymovin_animation$0_1$amp_bodymovin_animation_prototype$sendCommand_$$($$jscomp$this$jscomp$489$$, "seekTo", "percent", _.$clamp$$module$src$utils$math$$($deferred$jscomp$34$$, 0, 1));
    }
  }, 1);
};
_.$JSCompiler_prototypeAlias$$.$layoutCallback$ = function() {
  var $$jscomp$this$jscomp$490$$ = this;
  return _.$batchFetchJsonFor$$module$src$batched_json$$(this.$ampdoc_$, this.element).then(function($data$jscomp$112$$) {
    var $iframe$jscomp$40$$ = _.$getIframe$$module$src$3p_frame$$($$jscomp$this$jscomp$490$$.$win$, $$jscomp$this$jscomp$490$$.element, "bodymovinanimation", {loop:$$jscomp$this$jscomp$490$$.$loop_$, autoplay:$$jscomp$this$jscomp$490$$.$autoplay_$, $renderer$:$$jscomp$this$jscomp$490$$.$renderer_$, $animationData$:$data$jscomp$112$$});
    return _.$JSCompiler_StaticMethods_mutatePromise$$(_.$Services$$module$src$services$vsyncFor$$($$jscomp$this$jscomp$490$$.$win$), function() {
      _.$JSCompiler_StaticMethods_applyFillContent$$($iframe$jscomp$40$$);
      $$jscomp$this$jscomp$490$$.$unlistenMessage_$ = _.$listen$$module$src$event_helper$$($$jscomp$this$jscomp$490$$.$win$, "message", $$jscomp$this$jscomp$490$$.$handleBodymovinMessages_$.bind($$jscomp$this$jscomp$490$$));
      $$jscomp$this$jscomp$490$$.element.appendChild($iframe$jscomp$40$$);
      $$jscomp$this$jscomp$490$$.$iframe_$ = $iframe$jscomp$40$$;
    }).then(function() {
      return $$jscomp$this$jscomp$490$$.$playerReadyPromise_$;
    });
  });
};
_.$JSCompiler_prototypeAlias$$.$unlayoutCallback$ = function() {
  this.$iframe_$ && (_.$removeElement$$module$src$dom$$(this.$iframe_$), this.$iframe_$ = null);
  this.$unlistenMessage_$ && this.$unlistenMessage_$();
  var $deferred$jscomp$35$$ = new _.$Deferred$$module$src$utils$promise$$;
  this.$playerReadyPromise_$ = $deferred$jscomp$35$$.$promise$;
  this.$playerReadyResolver_$ = $deferred$jscomp$35$$.resolve;
  return !0;
};
_.$JSCompiler_prototypeAlias$$.$handleBodymovinMessages_$ = function($event$jscomp$93_eventData$jscomp$2$$) {
  this.$iframe_$ && $event$jscomp$93_eventData$jscomp$2$$.source != this.$iframe_$.contentWindow || !$event$jscomp$93_eventData$jscomp$2$$.data || !_.$isObject$$module$src$types$$($event$jscomp$93_eventData$jscomp$2$$.data) && !_.$startsWith$$module$src$string$$($event$jscomp$93_eventData$jscomp$2$$.data, "{") || ($event$jscomp$93_eventData$jscomp$2$$ = _.$isObject$$module$src$types$$($event$jscomp$93_eventData$jscomp$2$$.data) ? $event$jscomp$93_eventData$jscomp$2$$.data : _.$parseJson$$module$src$json$$($event$jscomp$93_eventData$jscomp$2$$.data), 
  void 0 !== $event$jscomp$93_eventData$jscomp$2$$ && "ready" == $event$jscomp$93_eventData$jscomp$2$$.action && this.$playerReadyResolver_$());
};
window.self.AMP.registerElement("amp-bodymovin-animation", $AmpBodymovinAnimation$$module$extensions$amp_bodymovin_animation$0_1$amp_bodymovin_animation$$);

})});
