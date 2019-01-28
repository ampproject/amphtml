(self.AMP=self.AMP||[]).push({n:"amp-facebook-like",i:["_base_i","_base_misc"],v:"1901181729101",f:(function(AMP,_){
var $AmpFacebookLike$$module$extensions$amp_facebook_like$0_1$amp_facebook_like$$ = function($element$jscomp$397$$) {
  var $$jscomp$super$this$jscomp$45$$ = window.AMP.BaseElement.call(this, $element$jscomp$397$$) || this;
  $$jscomp$super$this$jscomp$45$$.$iframe_$ = null;
  $$jscomp$super$this$jscomp$45$$.$dataLocale_$ = $element$jscomp$397$$.hasAttribute("data-locale") ? $element$jscomp$397$$.getAttribute("data-locale") : _.$dashToUnderline$$module$src$string$$();
  $$jscomp$super$this$jscomp$45$$.$unlistenMessage_$ = null;
  return $$jscomp$super$this$jscomp$45$$;
};
_.$$jscomp$inherits$$($AmpFacebookLike$$module$extensions$amp_facebook_like$0_1$amp_facebook_like$$, window.AMP.BaseElement);
_.$JSCompiler_prototypeAlias$$ = $AmpFacebookLike$$module$extensions$amp_facebook_like$0_1$amp_facebook_like$$.prototype;
_.$JSCompiler_prototypeAlias$$.$renderOutsideViewport$ = function() {
  return 0.75;
};
_.$JSCompiler_prototypeAlias$$.$preconnectCallback$ = function($opt_onLayout$jscomp$13$$) {
  this.$preconnect$.url("https://facebook.com", $opt_onLayout$jscomp$13$$);
  this.$preconnect$.$preload$("https://connect.facebook.net/" + this.$dataLocale_$ + "/sdk.js", "script");
  _.$preloadBootstrap$$module$src$3p_frame$$(this.$win$, this.$preconnect$);
};
_.$JSCompiler_prototypeAlias$$.$isLayoutSupported$ = function($layout$jscomp$56$$) {
  return _.$isLayoutSizeDefined$$module$src$layout$$($layout$jscomp$56$$);
};
_.$JSCompiler_prototypeAlias$$.$layoutCallback$ = function() {
  var $$jscomp$this$jscomp$593$$ = this, $iframe$jscomp$49$$ = _.$getIframe$$module$src$3p_frame$$(this.$win$, this.element, "facebook");
  _.$JSCompiler_StaticMethods_applyFillContent$$($iframe$jscomp$49$$);
  _.$listenFor$$module$src$iframe_helper$$($iframe$jscomp$49$$, "embed-size", function($iframe$jscomp$49$$) {
    _.$JSCompiler_StaticMethods_attemptChangeHeight$$($$jscomp$this$jscomp$593$$, $iframe$jscomp$49$$.height).catch(function() {
    });
  }, !0);
  this.$unlistenMessage_$ = _.$listen$$module$src$event_helper$$(this.$win$, "message", this.$AmpFacebookLike$$module$extensions$amp_facebook_like$0_1$amp_facebook_like_prototype$handleFacebookMessages_$.bind(this));
  this.$toggleLoading$(!0);
  this.element.appendChild($iframe$jscomp$49$$);
  this.$iframe_$ = $iframe$jscomp$49$$;
  return this.$loadPromise$($iframe$jscomp$49$$);
};
_.$JSCompiler_prototypeAlias$$.$AmpFacebookLike$$module$extensions$amp_facebook_like$0_1$amp_facebook_like_prototype$handleFacebookMessages_$ = function($event$jscomp$110_eventData$jscomp$7$$) {
  this.$iframe_$ && $event$jscomp$110_eventData$jscomp$7$$.source != this.$iframe_$.contentWindow || ($event$jscomp$110_eventData$jscomp$7$$ = $event$jscomp$110_eventData$jscomp$7$$.data) && (_.$isObject$$module$src$types$$($event$jscomp$110_eventData$jscomp$7$$) ? $event$jscomp$110_eventData$jscomp$7$$ : _.$tryParseJson$$module$src$json$$($event$jscomp$110_eventData$jscomp$7$$)) && "ready" == $event$jscomp$110_eventData$jscomp$7$$.action && this.$toggleLoading$(!1);
};
_.$JSCompiler_prototypeAlias$$.$unlayoutCallback$ = function() {
  this.$iframe_$ && (_.$removeElement$$module$src$dom$$(this.$iframe_$), this.$iframe_$ = null);
  this.$unlistenMessage_$ && this.$unlistenMessage_$();
  return !0;
};
window.self.AMP.registerElement("amp-facebook-like", $AmpFacebookLike$$module$extensions$amp_facebook_like$0_1$amp_facebook_like$$);

})});
