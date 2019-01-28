(self.AMP=self.AMP||[]).push({n:"amp-mathml",i:["_base_i","_base_misc"],v:"1901181729101",f:(function(AMP,_){
var $AmpMathml$$module$extensions$amp_mathml$0_1$amp_mathml$$ = function($$jscomp$super$this$jscomp$73_element$jscomp$497$$) {
  $$jscomp$super$this$jscomp$73_element$jscomp$497$$ = window.AMP.BaseElement.call(this, $$jscomp$super$this$jscomp$73_element$jscomp$497$$) || this;
  $$jscomp$super$this$jscomp$73_element$jscomp$497$$.$iframe_$ = null;
  return $$jscomp$super$this$jscomp$73_element$jscomp$497$$;
};
_.$$jscomp$inherits$$($AmpMathml$$module$extensions$amp_mathml$0_1$amp_mathml$$, window.AMP.BaseElement);
_.$JSCompiler_prototypeAlias$$ = $AmpMathml$$module$extensions$amp_mathml$0_1$amp_mathml$$.prototype;
_.$JSCompiler_prototypeAlias$$.$preconnectCallback$ = function() {
  this.$preconnect$.url("https://cdnjs.cloudflare.com");
};
_.$JSCompiler_prototypeAlias$$.$buildCallback$ = function() {
  var $$jscomp$this$jscomp$764$$ = this, $sizingWidth$$;
  this.element.hasAttribute("inline") && ($sizingWidth$$ = "1px");
  this.$mutateElement$(function() {
    _.$setStyles$$module$src$style$$($$jscomp$this$jscomp$764$$.element, {width:$sizingWidth$$, height:"1rem"});
  });
};
_.$JSCompiler_prototypeAlias$$.$layoutCallback$ = function() {
  var $$jscomp$this$jscomp$765$$ = this, $iframe$jscomp$69$$ = _.$getIframe$$module$src$3p_frame$$(this.$win$, this.element, "mathml");
  _.$JSCompiler_StaticMethods_applyFillContent$$($iframe$jscomp$69$$);
  _.$listenFor$$module$src$iframe_helper$$($iframe$jscomp$69$$, "embed-size", function($iframe$jscomp$69$$) {
    $$jscomp$this$jscomp$765$$.element.hasAttribute("inline") || ($iframe$jscomp$69$$.width = void 0);
    $$jscomp$this$jscomp$765$$.element.$getResources$().$changeSize$($$jscomp$this$jscomp$765$$.element, $iframe$jscomp$69$$.height, $iframe$jscomp$69$$.width);
  }, !0);
  this.element.appendChild($iframe$jscomp$69$$);
  this.$iframe_$ = $iframe$jscomp$69$$;
  return this.$loadPromise$($iframe$jscomp$69$$);
};
_.$JSCompiler_prototypeAlias$$.$unlayoutCallback$ = function() {
  this.$iframe_$ && (_.$removeElement$$module$src$dom$$(this.$iframe_$), this.$iframe_$ = null);
  return !0;
};
_.$JSCompiler_prototypeAlias$$.$isLayoutSupported$ = function($layout$jscomp$77$$) {
  return "container" == $layout$jscomp$77$$;
};
window.self.AMP.registerElement("amp-mathml", $AmpMathml$$module$extensions$amp_mathml$0_1$amp_mathml$$, "amp-mathml[inline]{display:inline-block;vertical-align:middle}\n/*# sourceURL=/extensions/amp-mathml/0.1/amp-mathml.css*/");

})});
