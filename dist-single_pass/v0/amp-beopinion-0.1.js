(self.AMP=self.AMP||[]).push({n:"amp-beopinion",i:["_base_i","_base_misc"],v:"1901181729101",f:(function(AMP,_){
var $AmpBeOpinion$$module$extensions$amp_beopinion$0_1$amp_beopinion$$ = function($$jscomp$super$this$jscomp$23_element$jscomp$345$$) {
  $$jscomp$super$this$jscomp$23_element$jscomp$345$$ = window.AMP.BaseElement.call(this, $$jscomp$super$this$jscomp$23_element$jscomp$345$$) || this;
  $$jscomp$super$this$jscomp$23_element$jscomp$345$$.$iframe_$ = null;
  return $$jscomp$super$this$jscomp$23_element$jscomp$345$$;
};
_.$$jscomp$inherits$$($AmpBeOpinion$$module$extensions$amp_beopinion$0_1$amp_beopinion$$, window.AMP.BaseElement);
_.$JSCompiler_prototypeAlias$$ = $AmpBeOpinion$$module$extensions$amp_beopinion$0_1$amp_beopinion$$.prototype;
_.$JSCompiler_prototypeAlias$$.$preconnectCallback$ = function($opt_onLayout$jscomp$7$$) {
  _.$preloadBootstrap$$module$src$3p_frame$$(this.$win$, this.$preconnect$);
  this.$preconnect$.$preload$("https://widget.beopinion.com/sdk.js", "script");
  this.$preconnect$.url("https://s.beopinion.com", $opt_onLayout$jscomp$7$$);
  this.$preconnect$.url("https://t.beopinion.com", $opt_onLayout$jscomp$7$$);
  this.$preconnect$.url("https://data.beopinion.com", $opt_onLayout$jscomp$7$$);
};
_.$JSCompiler_prototypeAlias$$.$isLayoutSupported$ = function($layout$jscomp$38$$) {
  return _.$isLayoutSizeDefined$$module$src$layout$$($layout$jscomp$38$$);
};
_.$JSCompiler_prototypeAlias$$.$firstLayoutCompleted$ = function() {
};
_.$JSCompiler_prototypeAlias$$.$buildCallback$ = function() {
};
_.$JSCompiler_prototypeAlias$$.$layoutCallback$ = function() {
  var $$jscomp$this$jscomp$461$$ = this, $iframe$jscomp$39$$ = _.$getIframe$$module$src$3p_frame$$(this.$win$, this.element, "beopinion");
  _.$JSCompiler_StaticMethods_applyFillContent$$($iframe$jscomp$39$$);
  _.$listenFor$$module$src$iframe_helper$$($iframe$jscomp$39$$, "embed-size", function($iframe$jscomp$39$$) {
    $$jscomp$this$jscomp$461$$.$togglePlaceholder$(!1);
    _.$JSCompiler_StaticMethods_changeHeight$$($$jscomp$this$jscomp$461$$, $iframe$jscomp$39$$.height);
  }, !0);
  _.$listenFor$$module$src$iframe_helper$$($iframe$jscomp$39$$, "no-content", function() {
    $$jscomp$this$jscomp$461$$.$getFallback$() && ($$jscomp$this$jscomp$461$$.$togglePlaceholder$(!1), $$jscomp$this$jscomp$461$$.$toggleFallback$(!0));
  }, !0);
  this.element.appendChild($iframe$jscomp$39$$);
  this.$iframe_$ = $iframe$jscomp$39$$;
  return this.$loadPromise$($iframe$jscomp$39$$);
};
_.$JSCompiler_prototypeAlias$$.$unlayoutOnPause$ = function() {
  return !0;
};
_.$JSCompiler_prototypeAlias$$.$unlayoutCallback$ = function() {
  this.$iframe_$ && (_.$removeElement$$module$src$dom$$(this.$iframe_$), this.$iframe_$ = null);
  return !0;
};
window.self.AMP.registerElement("amp-beopinion", $AmpBeOpinion$$module$extensions$amp_beopinion$0_1$amp_beopinion$$);

})});
