(self.AMP=self.AMP||[]).push({n:"amp-izlesene",i:["_base_i","_base_media"],v:"1901181729101",f:(function(AMP,_){
var $AmpIzlesene$$module$extensions$amp_izlesene$0_1$amp_izlesene$$ = function($$jscomp$super$this$jscomp$66_element$jscomp$460$$) {
  $$jscomp$super$this$jscomp$66_element$jscomp$460$$ = window.AMP.BaseElement.call(this, $$jscomp$super$this$jscomp$66_element$jscomp$460$$) || this;
  $$jscomp$super$this$jscomp$66_element$jscomp$460$$.$videoid_$ = null;
  $$jscomp$super$this$jscomp$66_element$jscomp$460$$.$iframe_$ = null;
  $$jscomp$super$this$jscomp$66_element$jscomp$460$$.$videoIframeSrc_$ = null;
  return $$jscomp$super$this$jscomp$66_element$jscomp$460$$;
};
_.$$jscomp$inherits$$($AmpIzlesene$$module$extensions$amp_izlesene$0_1$amp_izlesene$$, window.AMP.BaseElement);
_.$JSCompiler_prototypeAlias$$ = $AmpIzlesene$$module$extensions$amp_izlesene$0_1$amp_izlesene$$.prototype;
_.$JSCompiler_prototypeAlias$$.$preconnectCallback$ = function($opt_onLayout$jscomp$20$$) {
  this.$preconnect$.url(this.$getVideoIframeSrc_$());
  this.$preconnect$.url("https://i1.imgiz.com", $opt_onLayout$jscomp$20$$);
};
_.$JSCompiler_prototypeAlias$$.$isLayoutSupported$ = function($layout$jscomp$72$$) {
  return _.$isLayoutSizeDefined$$module$src$layout$$($layout$jscomp$72$$);
};
_.$JSCompiler_prototypeAlias$$.$buildCallback$ = function() {
  this.$videoid_$ = this.element.getAttribute("data-videoid");
};
_.$JSCompiler_prototypeAlias$$.$getVideoIframeSrc_$ = function() {
  if (this.$videoIframeSrc_$) {
    return this.$videoIframeSrc_$;
  }
  var $src$jscomp$48$$ = "https://www.izlesene.com/embedplayer/" + (0,window.encodeURIComponent)(this.$videoid_$ || "") + "/?", $params$jscomp$35$$ = _.$getDataParamsFromAttributes$$module$src$dom$$(this.element);
  "autoplay" in $params$jscomp$35$$ && delete $params$jscomp$35$$.autoplay;
  return this.$videoIframeSrc_$ = $src$jscomp$48$$ = _.$addParamsToUrl$$module$src$url$$($src$jscomp$48$$, $params$jscomp$35$$);
};
_.$JSCompiler_prototypeAlias$$.$layoutCallback$ = function() {
  var $iframe$jscomp$66$$ = this.element.ownerDocument.createElement("iframe"), $src$jscomp$49$$ = this.$getVideoIframeSrc_$();
  $iframe$jscomp$66$$.setAttribute("frameborder", "0");
  $iframe$jscomp$66$$.setAttribute("allowfullscreen", "true");
  $iframe$jscomp$66$$.src = $src$jscomp$49$$;
  _.$JSCompiler_StaticMethods_applyFillContent$$($iframe$jscomp$66$$);
  this.element.appendChild($iframe$jscomp$66$$);
  this.$iframe_$ = $iframe$jscomp$66$$;
  return this.$loadPromise$($iframe$jscomp$66$$);
};
_.$JSCompiler_prototypeAlias$$.$pauseCallback$ = function() {
  this.$iframe_$ && this.$iframe_$.contentWindow && this.$iframe_$.contentWindow.postMessage(_.$dict$$module$src$utils$object$$({command:"pause"}), "*");
};
window.self.AMP.registerElement("amp-izlesene", $AmpIzlesene$$module$extensions$amp_izlesene$0_1$amp_izlesene$$);

})});
