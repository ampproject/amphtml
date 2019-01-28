(self.AMP=self.AMP||[]).push({n:"amp-google-document-embed",i:["_base_i","_base_misc"],v:"1901181729101",f:(function(AMP,_){
var $AmpDriveViewer$$module$extensions$amp_google_document_embed$0_1$amp_google_document_embed$$ = function($$jscomp$super$this$jscomp$54_element$jscomp$428$$) {
  $$jscomp$super$this$jscomp$54_element$jscomp$428$$ = window.AMP.BaseElement.call(this, $$jscomp$super$this$jscomp$54_element$jscomp$428$$) || this;
  $$jscomp$super$this$jscomp$54_element$jscomp$428$$.$iframe_$ = null;
  return $$jscomp$super$this$jscomp$54_element$jscomp$428$$;
}, $JSCompiler_StaticMethods_AmpDriveViewer$$module$extensions$amp_google_document_embed$0_1$amp_google_document_embed_prototype$getSrc_$$ = function($src$jscomp$36$$) {
  return $src$jscomp$36$$.match($GOOGLE_DOCS_EMBED_RE$$module$extensions$amp_google_document_embed$0_1$amp_google_document_embed$$) ? $src$jscomp$36$$ : _.$addParamToUrl$$module$src$url$$("https://docs.google.com/gview?embedded=true", "url", $src$jscomp$36$$);
}, $ATTRIBUTES_TO_PROPAGATE$$module$extensions$amp_google_document_embed$0_1$amp_google_document_embed$$ = ["title"], $GOOGLE_DOCS_EMBED_RE$$module$extensions$amp_google_document_embed$0_1$amp_google_document_embed$$ = /^https?:\/\/docs\.google\.com.+\/pub.*\??/;
_.$$jscomp$inherits$$($AmpDriveViewer$$module$extensions$amp_google_document_embed$0_1$amp_google_document_embed$$, window.AMP.BaseElement);
_.$JSCompiler_prototypeAlias$$ = $AmpDriveViewer$$module$extensions$amp_google_document_embed$0_1$amp_google_document_embed$$.prototype;
_.$JSCompiler_prototypeAlias$$.$preconnectCallback$ = function($opt_onLayout$jscomp$18$$) {
  this.$preconnect$.url("https://docs.google.com", $opt_onLayout$jscomp$18$$);
};
_.$JSCompiler_prototypeAlias$$.$renderOutsideViewport$ = function() {
  return 0.75;
};
_.$JSCompiler_prototypeAlias$$.$isLayoutSupported$ = function($layout$jscomp$63$$) {
  return _.$isLayoutSizeDefined$$module$src$layout$$($layout$jscomp$63$$);
};
_.$JSCompiler_prototypeAlias$$.$buildCallback$ = function() {
};
_.$JSCompiler_prototypeAlias$$.$layoutCallback$ = function() {
  var $iframe$jscomp$54$$ = this.element.ownerDocument.createElement("iframe");
  this.$iframe_$ = $iframe$jscomp$54$$;
  $iframe$jscomp$54$$.setAttribute("frameborder", "0");
  $iframe$jscomp$54$$.setAttribute("allowfullscreen", "");
  _.$JSCompiler_StaticMethods_propagateAttributes$$(this, $ATTRIBUTES_TO_PROPAGATE$$module$extensions$amp_google_document_embed$0_1$amp_google_document_embed$$, $iframe$jscomp$54$$);
  $iframe$jscomp$54$$.src = $JSCompiler_StaticMethods_AmpDriveViewer$$module$extensions$amp_google_document_embed$0_1$amp_google_document_embed_prototype$getSrc_$$(this.element.getAttribute("src"));
  _.$JSCompiler_StaticMethods_applyFillContent$$($iframe$jscomp$54$$);
  this.element.appendChild($iframe$jscomp$54$$);
  return this.$loadPromise$($iframe$jscomp$54$$);
};
_.$JSCompiler_prototypeAlias$$.$mutatedAttributesCallback$ = function($mutations$jscomp$9$$) {
  var $attrs$jscomp$7_src$jscomp$35$$ = $ATTRIBUTES_TO_PROPAGATE$$module$extensions$amp_google_document_embed$0_1$amp_google_document_embed$$.filter(function($attrs$jscomp$7_src$jscomp$35$$) {
    return void 0 !== $mutations$jscomp$9$$[$attrs$jscomp$7_src$jscomp$35$$];
  }), $iframe$jscomp$55$$ = this.$iframe_$;
  _.$JSCompiler_StaticMethods_propagateAttributes$$(this, $attrs$jscomp$7_src$jscomp$35$$, $iframe$jscomp$55$$, !0);
  if ($attrs$jscomp$7_src$jscomp$35$$ = $mutations$jscomp$9$$.src) {
    $iframe$jscomp$55$$.src = $JSCompiler_StaticMethods_AmpDriveViewer$$module$extensions$amp_google_document_embed$0_1$amp_google_document_embed_prototype$getSrc_$$($attrs$jscomp$7_src$jscomp$35$$);
  }
};
_.$JSCompiler_prototypeAlias$$.$unlayoutOnPause$ = function() {
  return !0;
};
_.$JSCompiler_prototypeAlias$$.$unlayoutCallback$ = function() {
  this.$iframe_$ && (_.$removeElement$$module$src$dom$$(this.$iframe_$), this.$iframe_$ = null);
  return !0;
};
window.self.AMP.registerElement("amp-google-document-embed", $AmpDriveViewer$$module$extensions$amp_google_document_embed$0_1$amp_google_document_embed$$);

})});
