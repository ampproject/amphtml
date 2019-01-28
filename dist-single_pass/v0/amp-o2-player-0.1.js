(self.AMP=self.AMP||[]).push({n:"amp-o2-player",i:["_base_i","_base_media"],v:"1901181729101",f:(function(AMP,_){
var $AmpO2Player$$module$extensions$amp_o2_player$0_1$amp_o2_player$$ = function($$jscomp$super$this$jscomp$78_element$jscomp$509$$) {
  $$jscomp$super$this$jscomp$78_element$jscomp$509$$ = window.AMP.BaseElement.call(this, $$jscomp$super$this$jscomp$78_element$jscomp$509$$) || this;
  $$jscomp$super$this$jscomp$78_element$jscomp$509$$.$iframe_$ = null;
  $$jscomp$super$this$jscomp$78_element$jscomp$509$$.$pid_$ = "";
  $$jscomp$super$this$jscomp$78_element$jscomp$509$$.$bcid_$ = "";
  $$jscomp$super$this$jscomp$78_element$jscomp$509$$.$domain_$ = "";
  $$jscomp$super$this$jscomp$78_element$jscomp$509$$.$src_$ = "";
  return $$jscomp$super$this$jscomp$78_element$jscomp$509$$;
};
_.$$jscomp$inherits$$($AmpO2Player$$module$extensions$amp_o2_player$0_1$amp_o2_player$$, window.AMP.BaseElement);
_.$JSCompiler_prototypeAlias$$ = $AmpO2Player$$module$extensions$amp_o2_player$0_1$amp_o2_player$$.prototype;
_.$JSCompiler_prototypeAlias$$.$preconnectCallback$ = function($onLayout$jscomp$7$$) {
  this.$preconnect$.url(this.$domain_$, $onLayout$jscomp$7$$);
};
_.$JSCompiler_prototypeAlias$$.$isLayoutSupported$ = function($layout$jscomp$81$$) {
  return _.$isLayoutSizeDefined$$module$src$layout$$($layout$jscomp$81$$);
};
_.$JSCompiler_prototypeAlias$$.$buildCallback$ = function() {
  this.$pid_$ = this.element.getAttribute("data-pid");
  this.$bcid_$ = this.element.getAttribute("data-bcid");
  var $bid$$ = this.element.getAttribute("data-bid"), $vid$$ = this.element.getAttribute("data-vid"), $macros$jscomp$5$$ = this.element.getAttribute("data-macros");
  this.$domain_$ = "https://delivery." + ("stage" != this.element.getAttribute("data-env") ? "" : "dev.") + "vidible.tv";
  var $src$jscomp$58$$ = this.$domain_$ + "/htmlembed/", $queryParams$jscomp$5$$ = [];
  $src$jscomp$58$$ += "pid=" + (0,window.encodeURIComponent)(this.$pid_$) + "/" + (0,window.encodeURIComponent)(this.$bcid_$) + ".html";
  $bid$$ && $queryParams$jscomp$5$$.push("bid=" + (0,window.encodeURIComponent)($bid$$));
  $vid$$ && $queryParams$jscomp$5$$.push("vid=" + (0,window.encodeURIComponent)($vid$$));
  $macros$jscomp$5$$ && $queryParams$jscomp$5$$.push($macros$jscomp$5$$);
  0 < $queryParams$jscomp$5$$.length && ($src$jscomp$58$$ += "?" + $queryParams$jscomp$5$$.join("&"));
  this.$src_$ = $src$jscomp$58$$;
};
_.$JSCompiler_prototypeAlias$$.$layoutCallback$ = function() {
  var $iframe$jscomp$72$$ = this.element.ownerDocument.createElement("iframe");
  $iframe$jscomp$72$$.setAttribute("frameborder", "0");
  $iframe$jscomp$72$$.setAttribute("allowfullscreen", "true");
  $iframe$jscomp$72$$.src = this.$src_$;
  this.$iframe_$ = $iframe$jscomp$72$$;
  _.$JSCompiler_StaticMethods_applyFillContent$$($iframe$jscomp$72$$);
  this.element.appendChild($iframe$jscomp$72$$);
  return this.$loadPromise$($iframe$jscomp$72$$);
};
_.$JSCompiler_prototypeAlias$$.$pauseCallback$ = function() {
  this.$iframe_$ && this.$iframe_$.contentWindow && this.$iframe_$.contentWindow.postMessage(JSON.stringify(_.$dict$$module$src$utils$object$$({method:"pause", value:this.$domain_$})), "*");
};
window.self.AMP.registerElement("amp-o2-player", $AmpO2Player$$module$extensions$amp_o2_player$0_1$amp_o2_player$$);

})});
