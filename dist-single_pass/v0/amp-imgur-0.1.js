(self.AMP=self.AMP||[]).push({n:"amp-imgur",i:["_base_i","_base_media"],v:"1901181729101",f:(function(AMP,_){
var $AmpImgur$$module$extensions$amp_imgur$0_1$amp_imgur$$ = function($$jscomp$super$this$jscomp$63_element$jscomp$448$$) {
  $$jscomp$super$this$jscomp$63_element$jscomp$448$$ = window.AMP.BaseElement.call(this, $$jscomp$super$this$jscomp$63_element$jscomp$448$$) || this;
  $$jscomp$super$this$jscomp$63_element$jscomp$448$$.$iframe_$ = null;
  $$jscomp$super$this$jscomp$63_element$jscomp$448$$.$unlistenMessage_$ = null;
  $$jscomp$super$this$jscomp$63_element$jscomp$448$$.$imgurid_$ = "";
  return $$jscomp$super$this$jscomp$63_element$jscomp$448$$;
};
_.$$jscomp$inherits$$($AmpImgur$$module$extensions$amp_imgur$0_1$amp_imgur$$, window.AMP.BaseElement);
_.$JSCompiler_prototypeAlias$$ = $AmpImgur$$module$extensions$amp_imgur$0_1$amp_imgur$$.prototype;
_.$JSCompiler_prototypeAlias$$.$isLayoutSupported$ = function($layout$jscomp$70$$) {
  return _.$isLayoutSizeDefined$$module$src$layout$$($layout$jscomp$70$$);
};
_.$JSCompiler_prototypeAlias$$.$buildCallback$ = function() {
  this.$imgurid_$ = this.element.getAttribute("data-imgur-id");
};
_.$JSCompiler_prototypeAlias$$.$layoutCallback$ = function() {
  var $iframe$jscomp$62$$ = this.element.ownerDocument.createElement("iframe");
  this.$iframe_$ = $iframe$jscomp$62$$;
  this.$unlistenMessage_$ = _.$listen$$module$src$event_helper$$(this.$win$, "message", this.$handleImgurMessages_$.bind(this));
  $iframe$jscomp$62$$.setAttribute("scrolling", "no");
  $iframe$jscomp$62$$.setAttribute("frameborder", "0");
  $iframe$jscomp$62$$.setAttribute("allowfullscreen", "true");
  $iframe$jscomp$62$$.src = "https://imgur.com/" + (0,window.encodeURIComponent)(this.$imgurid_$) + "/embed?pub=true";
  _.$JSCompiler_StaticMethods_applyFillContent$$($iframe$jscomp$62$$);
  this.element.appendChild($iframe$jscomp$62$$);
  return this.$loadPromise$($iframe$jscomp$62$$);
};
_.$JSCompiler_prototypeAlias$$.$handleImgurMessages_$ = function($data$jscomp$137_event$jscomp$137_eventData$jscomp$12$$) {
  "https://imgur.com" == $data$jscomp$137_event$jscomp$137_eventData$jscomp$12$$.origin && $data$jscomp$137_event$jscomp$137_eventData$jscomp$12$$.source == this.$iframe_$.contentWindow && ($data$jscomp$137_event$jscomp$137_eventData$jscomp$12$$ = $data$jscomp$137_event$jscomp$137_eventData$jscomp$12$$.data) && (_.$isObject$$module$src$types$$($data$jscomp$137_event$jscomp$137_eventData$jscomp$12$$) || _.$startsWith$$module$src$string$$($data$jscomp$137_event$jscomp$137_eventData$jscomp$12$$, "{")) && 
  ($data$jscomp$137_event$jscomp$137_eventData$jscomp$12$$ = _.$isObject$$module$src$types$$($data$jscomp$137_event$jscomp$137_eventData$jscomp$12$$) ? $data$jscomp$137_event$jscomp$137_eventData$jscomp$12$$ : _.$tryParseJson$$module$src$json$$($data$jscomp$137_event$jscomp$137_eventData$jscomp$12$$), "resize_imgur" == $data$jscomp$137_event$jscomp$137_eventData$jscomp$12$$.message && _.$JSCompiler_StaticMethods_attemptChangeHeight$$(this, $data$jscomp$137_event$jscomp$137_eventData$jscomp$12$$.height).catch(function() {
  }));
};
_.$JSCompiler_prototypeAlias$$.$unlayoutCallback$ = function() {
  this.$iframe_$ && (_.$removeElement$$module$src$dom$$(this.$iframe_$), this.$iframe_$ = null);
  this.$unlistenMessage_$ && this.$unlistenMessage_$();
  return !0;
};
window.self.AMP.registerElement("amp-imgur", $AmpImgur$$module$extensions$amp_imgur$0_1$amp_imgur$$);

})});
