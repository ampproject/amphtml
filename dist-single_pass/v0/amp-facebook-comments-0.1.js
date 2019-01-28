(self.AMP=self.AMP||[]).push({n:"amp-facebook-comments",i:["_base_i","_base_misc"],v:"1901181729101",f:(function(AMP,_){
var $AmpFacebookComments$$module$extensions$amp_facebook_comments$0_1$amp_facebook_comments$$ = function($element$jscomp$396$$) {
  var $$jscomp$super$this$jscomp$44$$ = window.AMP.BaseElement.call(this, $element$jscomp$396$$) || this;
  $$jscomp$super$this$jscomp$44$$.$iframe_$ = null;
  $$jscomp$super$this$jscomp$44$$.$dataLocale_$ = $element$jscomp$396$$.hasAttribute("data-locale") ? $element$jscomp$396$$.getAttribute("data-locale") : _.$dashToUnderline$$module$src$string$$();
  $$jscomp$super$this$jscomp$44$$.$unlistenMessage_$ = null;
  return $$jscomp$super$this$jscomp$44$$;
};
_.$$jscomp$inherits$$($AmpFacebookComments$$module$extensions$amp_facebook_comments$0_1$amp_facebook_comments$$, window.AMP.BaseElement);
_.$JSCompiler_prototypeAlias$$ = $AmpFacebookComments$$module$extensions$amp_facebook_comments$0_1$amp_facebook_comments$$.prototype;
_.$JSCompiler_prototypeAlias$$.$renderOutsideViewport$ = function() {
  return 0.75;
};
_.$JSCompiler_prototypeAlias$$.$preconnectCallback$ = function($opt_onLayout$jscomp$12$$) {
  this.$preconnect$.url("https://facebook.com", $opt_onLayout$jscomp$12$$);
  this.$preconnect$.$preload$("https://connect.facebook.net/" + this.$dataLocale_$ + "/sdk.js", "script");
  _.$preloadBootstrap$$module$src$3p_frame$$(this.$win$, this.$preconnect$);
};
_.$JSCompiler_prototypeAlias$$.$isLayoutSupported$ = function($layout$jscomp$55$$) {
  return _.$isLayoutSizeDefined$$module$src$layout$$($layout$jscomp$55$$);
};
_.$JSCompiler_prototypeAlias$$.$layoutCallback$ = function() {
  var $$jscomp$this$jscomp$592$$ = this, $iframe$jscomp$48$$ = _.$getIframe$$module$src$3p_frame$$(this.$win$, this.element, "facebook");
  _.$JSCompiler_StaticMethods_applyFillContent$$($iframe$jscomp$48$$);
  _.$listenFor$$module$src$iframe_helper$$($iframe$jscomp$48$$, "embed-size", function($iframe$jscomp$48$$) {
    _.$JSCompiler_StaticMethods_changeHeight$$($$jscomp$this$jscomp$592$$, $iframe$jscomp$48$$.height);
  }, !0);
  this.$unlistenMessage_$ = _.$listen$$module$src$event_helper$$(this.$win$, "message", this.$AmpFacebookComments$$module$extensions$amp_facebook_comments$0_1$amp_facebook_comments_prototype$handleFacebookMessages_$.bind(this));
  this.$toggleLoading$(!0);
  this.element.appendChild($iframe$jscomp$48$$);
  this.$iframe_$ = $iframe$jscomp$48$$;
  return this.$loadPromise$($iframe$jscomp$48$$);
};
_.$JSCompiler_prototypeAlias$$.$AmpFacebookComments$$module$extensions$amp_facebook_comments$0_1$amp_facebook_comments_prototype$handleFacebookMessages_$ = function($event$jscomp$109_eventData$jscomp$6$$) {
  this.$iframe_$ && $event$jscomp$109_eventData$jscomp$6$$.source != this.$iframe_$.contentWindow || ($event$jscomp$109_eventData$jscomp$6$$ = $event$jscomp$109_eventData$jscomp$6$$.data) && (_.$isObject$$module$src$types$$($event$jscomp$109_eventData$jscomp$6$$) ? $event$jscomp$109_eventData$jscomp$6$$ : _.$tryParseJson$$module$src$json$$($event$jscomp$109_eventData$jscomp$6$$)) && "ready" == $event$jscomp$109_eventData$jscomp$6$$.action && this.$toggleLoading$(!1);
};
_.$JSCompiler_prototypeAlias$$.$unlayoutCallback$ = function() {
  this.$iframe_$ && (_.$removeElement$$module$src$dom$$(this.$iframe_$), this.$iframe_$ = null);
  this.$unlistenMessage_$ && this.$unlistenMessage_$();
  return !0;
};
window.self.AMP.registerElement("amp-facebook-comments", $AmpFacebookComments$$module$extensions$amp_facebook_comments$0_1$amp_facebook_comments$$);

})});
