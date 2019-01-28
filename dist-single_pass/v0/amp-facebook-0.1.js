(self.AMP=self.AMP||[]).push({n:"amp-facebook",i:["_base_i","_base_misc"],v:"1901181729101",f:(function(AMP,_){
var $AmpFacebook$$module$extensions$amp_facebook$0_1$amp_facebook$$ = function($element$jscomp$399$$) {
  var $$jscomp$super$this$jscomp$47$$ = window.AMP.BaseElement.call(this, $element$jscomp$399$$) || this;
  $$jscomp$super$this$jscomp$47$$.$iframe_$ = null;
  $$jscomp$super$this$jscomp$47$$.$dataLocale_$ = $element$jscomp$399$$.hasAttribute("data-locale") ? $element$jscomp$399$$.getAttribute("data-locale") : _.$dashToUnderline$$module$src$string$$();
  $$jscomp$super$this$jscomp$47$$.$unlistenMessage_$ = null;
  $$jscomp$super$this$jscomp$47$$.$toggleLoadingCounter_$ = 0;
  return $$jscomp$super$this$jscomp$47$$;
};
_.$$jscomp$inherits$$($AmpFacebook$$module$extensions$amp_facebook$0_1$amp_facebook$$, window.AMP.BaseElement);
_.$JSCompiler_prototypeAlias$$ = $AmpFacebook$$module$extensions$amp_facebook$0_1$amp_facebook$$.prototype;
_.$JSCompiler_prototypeAlias$$.$renderOutsideViewport$ = function() {
  return 0.75;
};
_.$JSCompiler_prototypeAlias$$.$preconnectCallback$ = function($opt_onLayout$jscomp$15$$) {
  this.$preconnect$.url("https://facebook.com", $opt_onLayout$jscomp$15$$);
  this.$preconnect$.$preload$("https://connect.facebook.net/" + this.$dataLocale_$ + "/sdk.js", "script");
  _.$preloadBootstrap$$module$src$3p_frame$$(this.$win$, this.$preconnect$);
};
_.$JSCompiler_prototypeAlias$$.$isLayoutSupported$ = function($layout$jscomp$58$$) {
  return _.$isLayoutSizeDefined$$module$src$layout$$($layout$jscomp$58$$);
};
_.$JSCompiler_prototypeAlias$$.$layoutCallback$ = function() {
  var $$jscomp$this$jscomp$595$$ = this, $iframe$jscomp$51$$ = _.$getIframe$$module$src$3p_frame$$(this.$win$, this.element, "facebook");
  _.$JSCompiler_StaticMethods_applyFillContent$$($iframe$jscomp$51$$);
  _.$listenFor$$module$src$iframe_helper$$($iframe$jscomp$51$$, "embed-size", function($iframe$jscomp$51$$) {
    _.$JSCompiler_StaticMethods_changeHeight$$($$jscomp$this$jscomp$595$$, $iframe$jscomp$51$$.height);
  }, !0);
  this.$unlistenMessage_$ = _.$listen$$module$src$event_helper$$(this.$win$, "message", this.$AmpFacebook$$module$extensions$amp_facebook$0_1$amp_facebook_prototype$handleFacebookMessages_$.bind(this));
  this.$toggleLoading$(!0);
  this.element.appendChild($iframe$jscomp$51$$);
  this.$iframe_$ = $iframe$jscomp$51$$;
  return this.$loadPromise$($iframe$jscomp$51$$);
};
_.$JSCompiler_prototypeAlias$$.$AmpFacebook$$module$extensions$amp_facebook$0_1$amp_facebook_prototype$handleFacebookMessages_$ = function($event$jscomp$112_eventData$jscomp$9$$) {
  this.$iframe_$ && $event$jscomp$112_eventData$jscomp$9$$.source != this.$iframe_$.contentWindow || ($event$jscomp$112_eventData$jscomp$9$$ = $event$jscomp$112_eventData$jscomp$9$$.data) && (_.$isObject$$module$src$types$$($event$jscomp$112_eventData$jscomp$9$$) ? $event$jscomp$112_eventData$jscomp$9$$ : _.$tryParseJson$$module$src$json$$($event$jscomp$112_eventData$jscomp$9$$)) && "ready" == $event$jscomp$112_eventData$jscomp$9$$.action && this.$toggleLoading$(!1);
};
_.$JSCompiler_prototypeAlias$$.$unlayoutOnPause$ = function() {
  return !0;
};
_.$JSCompiler_prototypeAlias$$.$unlayoutCallback$ = function() {
  this.$iframe_$ && (_.$removeElement$$module$src$dom$$(this.$iframe_$), this.$iframe_$ = null);
  this.$unlistenMessage_$ && this.$unlistenMessage_$();
  return !0;
};
window.self.AMP.registerElement("amp-facebook", $AmpFacebook$$module$extensions$amp_facebook$0_1$amp_facebook$$);

})});
