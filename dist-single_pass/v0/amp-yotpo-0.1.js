(self.AMP=self.AMP||[]).push({n:"amp-yotpo",i:["_base_i","_base_misc"],v:"1901181729101",f:(function(AMP,_){
var $AmpYotpo$$module$extensions$amp_yotpo$0_1$amp_yotpo$$ = function($$jscomp$super$this$jscomp$120_element$jscomp$707$$) {
  $$jscomp$super$this$jscomp$120_element$jscomp$707$$ = window.AMP.BaseElement.call(this, $$jscomp$super$this$jscomp$120_element$jscomp$707$$) || this;
  $$jscomp$super$this$jscomp$120_element$jscomp$707$$.$iframe_$ = null;
  $$jscomp$super$this$jscomp$120_element$jscomp$707$$.$unlisteners_$ = [];
  return $$jscomp$super$this$jscomp$120_element$jscomp$707$$;
};
_.$$jscomp$inherits$$($AmpYotpo$$module$extensions$amp_yotpo$0_1$amp_yotpo$$, window.AMP.BaseElement);
_.$JSCompiler_prototypeAlias$$ = $AmpYotpo$$module$extensions$amp_yotpo$0_1$amp_yotpo$$.prototype;
_.$JSCompiler_prototypeAlias$$.$preconnectCallback$ = function($opt_onLayout$jscomp$32$$) {
  this.$preconnect$.url("https://staticw2.yotpo.com", $opt_onLayout$jscomp$32$$);
};
_.$JSCompiler_prototypeAlias$$.$buildCallback$ = function() {
  var $$jscomp$this$jscomp$1358$$ = this, $iframe$jscomp$101$$ = _.$getIframe$$module$src$3p_frame$$(this.$win$, this.element, "yotpo");
  _.$JSCompiler_StaticMethods_applyFillContent$$($iframe$jscomp$101$$);
  var $unlisten$jscomp$28$$ = _.$listenFor$$module$src$iframe_helper$$($iframe$jscomp$101$$, "embed-size", function($iframe$jscomp$101$$) {
    _.$JSCompiler_StaticMethods_attemptChangeHeight$$($$jscomp$this$jscomp$1358$$, $iframe$jscomp$101$$.height).catch(function() {
    });
  }, !0);
  this.$unlisteners_$.push($unlisten$jscomp$28$$);
  this.element.appendChild($iframe$jscomp$101$$);
  this.$iframe_$ = $iframe$jscomp$101$$;
  return this.$loadPromise$($iframe$jscomp$101$$);
};
_.$JSCompiler_prototypeAlias$$.$isLayoutSupported$ = function($layout$jscomp$116$$) {
  return _.$isLayoutSizeDefined$$module$src$layout$$($layout$jscomp$116$$);
};
_.$JSCompiler_prototypeAlias$$.$unlayoutOnPause$ = function() {
  return !0;
};
_.$JSCompiler_prototypeAlias$$.$unlayoutCallback$ = function() {
  this.$unlisteners_$.forEach(function($unlisten$jscomp$29$$) {
    return $unlisten$jscomp$29$$();
  });
  this.$unlisteners_$.length = 0;
  this.$iframe_$ && (_.$removeElement$$module$src$dom$$(this.$iframe_$), this.$iframe_$ = null);
  return !0;
};
window.self.AMP.registerElement("amp-yotpo", $AmpYotpo$$module$extensions$amp_yotpo$0_1$amp_yotpo$$);

})});
