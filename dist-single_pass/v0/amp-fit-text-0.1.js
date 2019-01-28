(self.AMP=self.AMP||[]).push({n:"amp-fit-text",i:["_base_i","_base_misc"],v:"1901181729101",f:(function(AMP,_){
var $AmpFitText$$module$extensions$amp_fit_text$0_1$amp_fit_text$$ = function($$jscomp$super$this$jscomp$48_element$jscomp$400$$) {
  $$jscomp$super$this$jscomp$48_element$jscomp$400$$ = window.AMP.BaseElement.call(this, $$jscomp$super$this$jscomp$48_element$jscomp$400$$) || this;
  $$jscomp$super$this$jscomp$48_element$jscomp$400$$.$content_$ = null;
  $$jscomp$super$this$jscomp$48_element$jscomp$400$$.$contentWrapper_$ = null;
  $$jscomp$super$this$jscomp$48_element$jscomp$400$$.$measurer_$ = null;
  $$jscomp$super$this$jscomp$48_element$jscomp$400$$.$minFontSize_$ = -1;
  $$jscomp$super$this$jscomp$48_element$jscomp$400$$.$maxFontSize_$ = -1;
  return $$jscomp$super$this$jscomp$48_element$jscomp$400$$;
};
_.$$jscomp$inherits$$($AmpFitText$$module$extensions$amp_fit_text$0_1$amp_fit_text$$, window.AMP.BaseElement);
_.$JSCompiler_prototypeAlias$$ = $AmpFitText$$module$extensions$amp_fit_text$0_1$amp_fit_text$$.prototype;
_.$JSCompiler_prototypeAlias$$.$isLayoutSupported$ = function($layout$jscomp$59$$) {
  return _.$isLayoutSizeDefined$$module$src$layout$$($layout$jscomp$59$$);
};
_.$JSCompiler_prototypeAlias$$.$buildCallback$ = function() {
  var $$jscomp$this$jscomp$596$$ = this;
  this.$content_$ = this.element.ownerDocument.createElement("div");
  _.$JSCompiler_StaticMethods_applyFillContent$$(this.$content_$);
  this.$content_$.classList.add("i-amphtml-fit-text-content");
  _.$setStyles$$module$src$style$$(this.$content_$, {zIndex:2});
  this.$contentWrapper_$ = this.element.ownerDocument.createElement("div");
  _.$setStyles$$module$src$style$$(this.$contentWrapper_$, {lineHeight:"1.15em"});
  this.$content_$.appendChild(this.$contentWrapper_$);
  this.$measurer_$ = this.element.ownerDocument.createElement("div");
  _.$setStyles$$module$src$style$$(this.$measurer_$, {position:"absolute", top:0, left:0, zIndex:1, visibility:"hidden", lineHeight:"1.15em"});
  this.$getRealChildNodes$().forEach(function($node$jscomp$76$$) {
    $$jscomp$this$jscomp$596$$.$contentWrapper_$.appendChild($node$jscomp$76$$);
  });
  this.$measurer_$.innerHTML = this.$contentWrapper_$.innerHTML;
  this.element.appendChild(this.$content_$);
  this.element.appendChild(this.$measurer_$);
  this.$minFontSize_$ = _.$getLengthNumeral$$module$src$layout$$(this.element.getAttribute("min-font-size")) || 6;
  this.$maxFontSize_$ = _.$getLengthNumeral$$module$src$layout$$(this.element.getAttribute("max-font-size")) || 72;
};
_.$JSCompiler_prototypeAlias$$.$prerenderAllowed$ = function() {
  return !0;
};
_.$JSCompiler_prototypeAlias$$.$isRelayoutNeeded$ = function() {
  return !0;
};
_.$JSCompiler_prototypeAlias$$.$layoutCallback$ = function() {
  var $maxHeight$jscomp$inline_3206_numberOfLines$jscomp$inline_6219$$ = this.element.offsetHeight, $content$jscomp$inline_6213_measurer$jscomp$inline_6205$$ = this.$measurer_$, $expectedWidth$jscomp$inline_6207_measurer$jscomp$inline_6214_overflown$jscomp$inline_6217$$ = this.element.offsetWidth;
  var $JSCompiler_inline_result$jscomp$5636_lineHeight$jscomp$inline_6218_minFontSize$jscomp$inline_6208$$ = this.$minFontSize_$;
  var $maxFontSize$jscomp$inline_6209$$ = this.$maxFontSize_$;
  for ($maxFontSize$jscomp$inline_6209$$++; 1 < $maxFontSize$jscomp$inline_6209$$ - $JSCompiler_inline_result$jscomp$5636_lineHeight$jscomp$inline_6218_minFontSize$jscomp$inline_6208$$;) {
    var $mid$jscomp$inline_6210$$ = Math.floor(($JSCompiler_inline_result$jscomp$5636_lineHeight$jscomp$inline_6218_minFontSize$jscomp$inline_6208$$ + $maxFontSize$jscomp$inline_6209$$) / 2);
    _.$setStyle$$module$src$style$$($content$jscomp$inline_6213_measurer$jscomp$inline_6205$$, "fontSize", _.$px$$module$src$style$$($mid$jscomp$inline_6210$$));
    var $width$jscomp$inline_6211$$ = $content$jscomp$inline_6213_measurer$jscomp$inline_6205$$.offsetWidth;
    $content$jscomp$inline_6213_measurer$jscomp$inline_6205$$.offsetHeight > $maxHeight$jscomp$inline_3206_numberOfLines$jscomp$inline_6219$$ || $width$jscomp$inline_6211$$ > $expectedWidth$jscomp$inline_6207_measurer$jscomp$inline_6214_overflown$jscomp$inline_6217$$ ? $maxFontSize$jscomp$inline_6209$$ = $mid$jscomp$inline_6210$$ : $JSCompiler_inline_result$jscomp$5636_lineHeight$jscomp$inline_6218_minFontSize$jscomp$inline_6208$$ = $mid$jscomp$inline_6210$$;
  }
  _.$setStyle$$module$src$style$$(this.$contentWrapper_$, "fontSize", _.$px$$module$src$style$$($JSCompiler_inline_result$jscomp$5636_lineHeight$jscomp$inline_6218_minFontSize$jscomp$inline_6208$$));
  $content$jscomp$inline_6213_measurer$jscomp$inline_6205$$ = this.$contentWrapper_$;
  $expectedWidth$jscomp$inline_6207_measurer$jscomp$inline_6214_overflown$jscomp$inline_6217$$ = this.$measurer_$;
  _.$setStyle$$module$src$style$$($expectedWidth$jscomp$inline_6207_measurer$jscomp$inline_6214_overflown$jscomp$inline_6217$$, "fontSize", _.$px$$module$src$style$$($JSCompiler_inline_result$jscomp$5636_lineHeight$jscomp$inline_6218_minFontSize$jscomp$inline_6208$$));
  $expectedWidth$jscomp$inline_6207_measurer$jscomp$inline_6214_overflown$jscomp$inline_6217$$ = $expectedWidth$jscomp$inline_6207_measurer$jscomp$inline_6214_overflown$jscomp$inline_6217$$.offsetHeight > $maxHeight$jscomp$inline_3206_numberOfLines$jscomp$inline_6219$$;
  $JSCompiler_inline_result$jscomp$5636_lineHeight$jscomp$inline_6218_minFontSize$jscomp$inline_6208$$ *= 1.15;
  $maxHeight$jscomp$inline_3206_numberOfLines$jscomp$inline_6219$$ = Math.floor($maxHeight$jscomp$inline_3206_numberOfLines$jscomp$inline_6219$$ / $JSCompiler_inline_result$jscomp$5636_lineHeight$jscomp$inline_6218_minFontSize$jscomp$inline_6208$$);
  $content$jscomp$inline_6213_measurer$jscomp$inline_6205$$.classList.toggle("i-amphtml-fit-text-content-overflown", $expectedWidth$jscomp$inline_6207_measurer$jscomp$inline_6214_overflown$jscomp$inline_6217$$);
  _.$setStyles$$module$src$style$$($content$jscomp$inline_6213_measurer$jscomp$inline_6205$$, {$lineClamp$:$expectedWidth$jscomp$inline_6207_measurer$jscomp$inline_6214_overflown$jscomp$inline_6217$$ ? $maxHeight$jscomp$inline_3206_numberOfLines$jscomp$inline_6219$$ : "", maxHeight:$expectedWidth$jscomp$inline_6207_measurer$jscomp$inline_6214_overflown$jscomp$inline_6217$$ ? _.$px$$module$src$style$$($JSCompiler_inline_result$jscomp$5636_lineHeight$jscomp$inline_6218_minFontSize$jscomp$inline_6208$$ * 
  $maxHeight$jscomp$inline_3206_numberOfLines$jscomp$inline_6219$$) : ""});
  return window.Promise.resolve();
};
window.self.AMP.registerElement("amp-fit-text", $AmpFitText$$module$extensions$amp_fit_text$0_1$amp_fit_text$$, ".i-amphtml-fit-text-content,.i-amphtml-fit-text-content.i-amphtml-fill-content{display:block;display:-webkit-box;display:-ms-flexbox;display:flex;-webkit-box-orient:vertical;-webkit-box-direction:normal;-ms-flex-direction:column;flex-direction:column;-ms-flex-wrap:nowrap;flex-wrap:nowrap;-webkit-box-pack:center;-ms-flex-pack:center;justify-content:center}.i-amphtml-fit-text-content-overflown{display:block;display:-webkit-box;-webkit-box-orient:vertical;overflow:hidden}\n/*# sourceURL=/extensions/amp-fit-text/0.1/amp-fit-text.css*/");

})});
