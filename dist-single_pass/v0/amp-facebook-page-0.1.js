(self.AMP=self.AMP||[]).push({n:"amp-facebook-page",i:["_base_i","_base_misc"],v:"1901181729101",f:(function(AMP,_){
var $AmpFacebookPage$$module$extensions$amp_facebook_page$0_1$amp_facebook_page$$ = function($element$jscomp$398$$) {
  var $$jscomp$super$this$jscomp$46$$ = window.AMP.BaseElement.call(this, $element$jscomp$398$$) || this;
  $$jscomp$super$this$jscomp$46$$.$iframe_$ = null;
  $$jscomp$super$this$jscomp$46$$.$dataLocale_$ = $element$jscomp$398$$.hasAttribute("data-locale") ? $element$jscomp$398$$.getAttribute("data-locale") : _.$dashToUnderline$$module$src$string$$();
  $$jscomp$super$this$jscomp$46$$.$unlistenMessage_$ = null;
  return $$jscomp$super$this$jscomp$46$$;
};
_.$$jscomp$inherits$$($AmpFacebookPage$$module$extensions$amp_facebook_page$0_1$amp_facebook_page$$, window.AMP.BaseElement);
_.$JSCompiler_prototypeAlias$$ = $AmpFacebookPage$$module$extensions$amp_facebook_page$0_1$amp_facebook_page$$.prototype;
_.$JSCompiler_prototypeAlias$$.$renderOutsideViewport$ = function() {
  return 0.75;
};
_.$JSCompiler_prototypeAlias$$.$preconnectCallback$ = function($opt_onLayout$jscomp$14$$) {
  this.$preconnect$.url("https://facebook.com", $opt_onLayout$jscomp$14$$);
  this.$preconnect$.$preload$("https://connect.facebook.net/" + this.$dataLocale_$ + "/sdk.js", "script");
  _.$preloadBootstrap$$module$src$3p_frame$$(this.$win$, this.$preconnect$);
};
_.$JSCompiler_prototypeAlias$$.$isLayoutSupported$ = function($layout$jscomp$57$$) {
  return _.$isLayoutSizeDefined$$module$src$layout$$($layout$jscomp$57$$);
};
_.$JSCompiler_prototypeAlias$$.$layoutCallback$ = function() {
  var $$jscomp$this$jscomp$594$$ = this, $iframe$jscomp$50$$ = _.$getIframe$$module$src$3p_frame$$(this.$win$, this.element, "facebook");
  _.$JSCompiler_StaticMethods_applyFillContent$$($iframe$jscomp$50$$);
  _.$listenFor$$module$src$iframe_helper$$($iframe$jscomp$50$$, "embed-size", function($iframe$jscomp$50$$) {
    _.$JSCompiler_StaticMethods_attemptChangeHeight$$($$jscomp$this$jscomp$594$$, $iframe$jscomp$50$$.height).catch(function() {
    });
  }, !0);
  this.$unlistenMessage_$ = _.$listen$$module$src$event_helper$$(this.$win$, "message", this.$AmpFacebookPage$$module$extensions$amp_facebook_page$0_1$amp_facebook_page_prototype$handleFacebookMessages_$.bind(this));
  this.$toggleLoading$(!0);
  this.element.appendChild($iframe$jscomp$50$$);
  this.$iframe_$ = $iframe$jscomp$50$$;
  return this.$loadPromise$($iframe$jscomp$50$$);
};
_.$JSCompiler_prototypeAlias$$.$AmpFacebookPage$$module$extensions$amp_facebook_page$0_1$amp_facebook_page_prototype$handleFacebookMessages_$ = function($event$jscomp$111_eventData$jscomp$8$$) {
  this.$iframe_$ && $event$jscomp$111_eventData$jscomp$8$$.source != this.$iframe_$.contentWindow || ($event$jscomp$111_eventData$jscomp$8$$ = $event$jscomp$111_eventData$jscomp$8$$.data) && (_.$isObject$$module$src$types$$($event$jscomp$111_eventData$jscomp$8$$) ? $event$jscomp$111_eventData$jscomp$8$$ : _.$tryParseJson$$module$src$json$$($event$jscomp$111_eventData$jscomp$8$$)) && "ready" == $event$jscomp$111_eventData$jscomp$8$$.action && this.$toggleLoading$(!1);
};
_.$JSCompiler_prototypeAlias$$.$unlayoutCallback$ = function() {
  this.$iframe_$ && (_.$removeElement$$module$src$dom$$(this.$iframe_$), this.$iframe_$ = null);
  this.$unlistenMessage_$ && this.$unlistenMessage_$();
  return !0;
};
window.self.AMP.registerElement("amp-facebook-page", $AmpFacebookPage$$module$extensions$amp_facebook_page$0_1$amp_facebook_page$$);

})});
