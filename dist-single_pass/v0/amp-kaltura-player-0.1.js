(self.AMP=self.AMP||[]).push({n:"amp-kaltura-player",i:["_base_i","_base_media"],v:"1901181729101",f:(function(AMP,_){
var $AmpKaltura$$module$extensions$amp_kaltura_player$0_1$amp_kaltura_player$$ = function($$jscomp$super$this$jscomp$68_element$jscomp$462$$) {
  $$jscomp$super$this$jscomp$68_element$jscomp$462$$ = window.AMP.BaseElement.call(this, $$jscomp$super$this$jscomp$68_element$jscomp$462$$) || this;
  $$jscomp$super$this$jscomp$68_element$jscomp$462$$.$iframe_$ = null;
  $$jscomp$super$this$jscomp$68_element$jscomp$462$$.$partnerId_$ = "";
  $$jscomp$super$this$jscomp$68_element$jscomp$462$$.$entryId_$ = "";
  return $$jscomp$super$this$jscomp$68_element$jscomp$462$$;
};
_.$$jscomp$inherits$$($AmpKaltura$$module$extensions$amp_kaltura_player$0_1$amp_kaltura_player$$, window.AMP.BaseElement);
_.$JSCompiler_prototypeAlias$$ = $AmpKaltura$$module$extensions$amp_kaltura_player$0_1$amp_kaltura_player$$.prototype;
_.$JSCompiler_prototypeAlias$$.$preconnectCallback$ = function($opt_onLayout$jscomp$21$$) {
  this.$preconnect$.url("https://cdnapisec.kaltura.com", $opt_onLayout$jscomp$21$$);
};
_.$JSCompiler_prototypeAlias$$.$isLayoutSupported$ = function($layout$jscomp$74$$) {
  return _.$isLayoutSizeDefined$$module$src$layout$$($layout$jscomp$74$$);
};
_.$JSCompiler_prototypeAlias$$.$buildCallback$ = function() {
  this.$partnerId_$ = this.element.getAttribute("data-partner");
  this.$entryId_$ = this.element.getAttribute("data-entryid") || "default";
};
_.$JSCompiler_prototypeAlias$$.$layoutCallback$ = function() {
  var $src$jscomp$51_uiconfId$$ = this.element.getAttribute("data-uiconf") || this.element.getAttribute("data-uiconf-id") || "default", $iframe$jscomp$68$$ = this.element.ownerDocument.createElement("iframe");
  $src$jscomp$51_uiconfId$$ = "https://cdnapisec.kaltura.com/p/" + (0,window.encodeURIComponent)(this.$partnerId_$) + "/sp/" + (0,window.encodeURIComponent)(this.$partnerId_$) + "00/embedIframeJs/uiconf_id/" + (0,window.encodeURIComponent)($src$jscomp$51_uiconfId$$) + "/partner_id/" + (0,window.encodeURIComponent)(this.$partnerId_$) + "?iframeembed=true&playerId=kaltura_player_amp&entry_id=" + (0,window.encodeURIComponent)(this.$entryId_$);
  var $params$jscomp$36$$ = _.$getDataParamsFromAttributes$$module$src$dom$$(this.element, function($src$jscomp$51_uiconfId$$) {
    return "flashvars[" + $src$jscomp$51_uiconfId$$ + "]";
  });
  $src$jscomp$51_uiconfId$$ = _.$addParamsToUrl$$module$src$url$$($src$jscomp$51_uiconfId$$, $params$jscomp$36$$);
  $iframe$jscomp$68$$.setAttribute("frameborder", "0");
  $iframe$jscomp$68$$.setAttribute("allowfullscreen", "true");
  $iframe$jscomp$68$$.src = $src$jscomp$51_uiconfId$$;
  _.$JSCompiler_StaticMethods_applyFillContent$$($iframe$jscomp$68$$);
  this.element.appendChild($iframe$jscomp$68$$);
  this.$iframe_$ = $iframe$jscomp$68$$;
  return this.$loadPromise$($iframe$jscomp$68$$);
};
_.$JSCompiler_prototypeAlias$$.$createPlaceholderCallback$ = function() {
  var $placeholder$jscomp$16$$ = this.$win$.document.createElement("amp-img");
  _.$JSCompiler_StaticMethods_propagateAttributes$$(this, ["aria-label"], $placeholder$jscomp$16$$);
  var $width$jscomp$54$$ = this.element.getAttribute("width"), $height$jscomp$48$$ = this.element.getAttribute("height"), $src$jscomp$52$$ = "https://cdnapisec.kaltura.com/p/" + (0,window.encodeURIComponent)(this.$partnerId_$) + "/thumbnail/entry_id/" + (0,window.encodeURIComponent)(this.$entryId_$);
  $width$jscomp$54$$ && ($src$jscomp$52$$ += "/width/" + $width$jscomp$54$$);
  $height$jscomp$48$$ && ($src$jscomp$52$$ += "/height/" + $height$jscomp$48$$);
  $placeholder$jscomp$16$$.setAttribute("src", $src$jscomp$52$$);
  $placeholder$jscomp$16$$.setAttribute("layout", "fill");
  $placeholder$jscomp$16$$.setAttribute("placeholder", "");
  $placeholder$jscomp$16$$.setAttribute("referrerpolicy", "origin");
  $placeholder$jscomp$16$$.hasAttribute("aria-label") ? $placeholder$jscomp$16$$.setAttribute("alt", "Loading video - " + $placeholder$jscomp$16$$.getAttribute("aria-label")) : $placeholder$jscomp$16$$.setAttribute("alt", "Loading video");
  return $placeholder$jscomp$16$$;
};
_.$JSCompiler_prototypeAlias$$.$pauseCallback$ = function() {
  this.$iframe_$ && this.$iframe_$.contentWindow && this.$iframe_$.contentWindow.postMessage(JSON.stringify(_.$dict$$module$src$utils$object$$({method:"pause", value:""})), "*");
};
window.self.AMP.registerElement("amp-kaltura-player", $AmpKaltura$$module$extensions$amp_kaltura_player$0_1$amp_kaltura_player$$);

})});
