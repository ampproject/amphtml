(self.AMP=self.AMP||[]).push({n:"amp-skimlinks",i:["_base_i","_base_misc"],v:"1901181729101",f:(function(AMP,_){
var $TwoStepsResponse$$module$extensions$amp_skimlinks$0_1$link_rewriter$two_steps_response$$ = function($syncResponse$$, $asyncResponse$$) {
  this.$F$ = $syncResponse$$;
  this.$D$ = $asyncResponse$$;
}, $getNormalizedHostnameFromAnchor$$module$extensions$amp_skimlinks$0_1$utils$$ = function($anchor$jscomp$1$$) {
  return $anchor$jscomp$1$$ ? $anchor$jscomp$1$$.hostname.replace(/^www\./, "") : "";
}, $isExcludedDomain$$module$extensions$amp_skimlinks$0_1$utils$$ = function($domain$jscomp$9$$, $excludedDomains_skimOptions$$) {
  return ($excludedDomains_skimOptions$$ = $excludedDomains_skimOptions$$.$excludedDomains$) && -1 !== $excludedDomains_skimOptions$$.indexOf($domain$jscomp$9$$);
}, $isExcludedAnchorUrl$$module$extensions$amp_skimlinks$0_1$utils$$ = function($anchor$jscomp$2_domain$jscomp$10$$, $skimOptions$jscomp$1$$) {
  $anchor$jscomp$2_domain$jscomp$10$$ = $getNormalizedHostnameFromAnchor$$module$extensions$amp_skimlinks$0_1$utils$$($anchor$jscomp$2_domain$jscomp$10$$);
  return $isExcludedDomain$$module$extensions$amp_skimlinks$0_1$utils$$($anchor$jscomp$2_domain$jscomp$10$$, $skimOptions$jscomp$1$$);
}, $AffiliateLinkResolver$$module$extensions$amp_skimlinks$0_1$affiliate_link_resolver$$ = function($xhr$jscomp$12$$, $skimOptions$jscomp$2$$, $waypoint$$) {
  this.$xhr_$ = $xhr$jscomp$12$$;
  this.$skimOptions_$ = $skimOptions$jscomp$2$$;
  this.$waypoint_$ = $waypoint$$;
  this.$D$ = _.$dict$$module$src$utils$object$$({});
  this.$F$ = null;
}, $JSCompiler_StaticMethods_fetchDomainResolverApi$$ = function($JSCompiler_StaticMethods_fetchDomainResolverApi$self$$, $beaconUrl_domains$jscomp$4$$) {
  $beaconUrl_domains$jscomp$4$$ = "https://r.skimresources.com/api?data=" + JSON.stringify(_.$dict$$module$src$utils$object$$({pubcode:$JSCompiler_StaticMethods_fetchDomainResolverApi$self$$.$skimOptions_$.$pubcode$, page:"", domains:$beaconUrl_domains$jscomp$4$$}));
  return _.$JSCompiler_StaticMethods_fetchJson$$($JSCompiler_StaticMethods_fetchDomainResolverApi$self$$.$xhr_$, $beaconUrl_domains$jscomp$4$$, {method:"GET", ampCors:!1, credentials:"include"}).then(function($JSCompiler_StaticMethods_fetchDomainResolverApi$self$$) {
    return $JSCompiler_StaticMethods_fetchDomainResolverApi$self$$.json();
  });
}, $JSCompiler_StaticMethods_associateWithReplacementUrl_$$ = function($JSCompiler_StaticMethods_associateWithReplacementUrl_$self$$, $anchorList$jscomp$1$$) {
  return $anchorList$jscomp$1$$.map(function($anchorList$jscomp$1$$) {
    var $anchor$jscomp$3$$ = null;
    var $JSCompiler_inline_result$jscomp$846_domain$jscomp$inline_4003_pubcode$jscomp$inline_4008$$ = $getNormalizedHostnameFromAnchor$$module$extensions$amp_skimlinks$0_1$utils$$($anchorList$jscomp$1$$);
    $JSCompiler_inline_result$jscomp$846_domain$jscomp$inline_4003_pubcode$jscomp$inline_4008$$ = $isExcludedDomain$$module$extensions$amp_skimlinks$0_1$utils$$($JSCompiler_inline_result$jscomp$846_domain$jscomp$inline_4003_pubcode$jscomp$inline_4008$$, $JSCompiler_StaticMethods_associateWithReplacementUrl_$self$$.$skimOptions_$) ? "ignore" : $JSCompiler_StaticMethods_associateWithReplacementUrl_$self$$.$D$[$JSCompiler_inline_result$jscomp$846_domain$jscomp$inline_4003_pubcode$jscomp$inline_4008$$] || 
    "unknown";
    if ("affiliate" === $JSCompiler_inline_result$jscomp$846_domain$jscomp$inline_4003_pubcode$jscomp$inline_4008$$ || "unknown" === $JSCompiler_inline_result$jscomp$846_domain$jscomp$inline_4003_pubcode$jscomp$inline_4008$$) {
      if ($anchor$jscomp$3$$ = $JSCompiler_StaticMethods_associateWithReplacementUrl_$self$$.$waypoint_$, $anchorList$jscomp$1$$) {
        var $$jscomp$inline_4007_guid$jscomp$inline_4011$$ = $anchor$jscomp$3$$.$D$.$D$;
        $JSCompiler_inline_result$jscomp$846_domain$jscomp$inline_4003_pubcode$jscomp$inline_4008$$ = $$jscomp$inline_4007_guid$jscomp$inline_4011$$.$pubcode$;
        var $pageImpressionId$jscomp$inline_4009$$ = $$jscomp$inline_4007_guid$jscomp$inline_4011$$.$pageImpressionId$, $customTrackingId$jscomp$inline_4010_xcust$jscomp$inline_4012$$ = $$jscomp$inline_4007_guid$jscomp$inline_4011$$.$customTrackingId$;
        $$jscomp$inline_4007_guid$jscomp$inline_4011$$ = $$jscomp$inline_4007_guid$jscomp$inline_4011$$.$guid$;
        $customTrackingId$jscomp$inline_4010_xcust$jscomp$inline_4012$$ = $anchorList$jscomp$1$$.getAttribute("data-skimlinks-custom-tracking-id") || $customTrackingId$jscomp$inline_4010_xcust$jscomp$inline_4012$$;
        $anchor$jscomp$3$$ = _.$dict$$module$src$utils$object$$({id:$JSCompiler_inline_result$jscomp$846_domain$jscomp$inline_4003_pubcode$jscomp$inline_4008$$, url:$anchorList$jscomp$1$$.href, sref:$anchor$jscomp$3$$.$canonicalUrl_$, pref:$anchor$jscomp$3$$.$F$, xguid:$$jscomp$inline_4007_guid$jscomp$inline_4011$$, xuuid:$pageImpressionId$jscomp$inline_4009$$, xtz:$anchor$jscomp$3$$.$G$, xs:"1", jv:"amp@1.0.1"});
        $customTrackingId$jscomp$inline_4010_xcust$jscomp$inline_4012$$ && ($anchor$jscomp$3$$.xcust = $customTrackingId$jscomp$inline_4010_xcust$jscomp$inline_4012$$);
        $anchor$jscomp$3$$ = _.$addParamsToUrl$$module$src$url$$("https://go.skimresources.com", $anchor$jscomp$3$$);
      } else {
        $anchor$jscomp$3$$ = null;
      }
    }
    return {anchor:$anchorList$jscomp$1$$, $replacementUrl$:$anchor$jscomp$3$$};
  });
}, $JSCompiler_StaticMethods_getNewDomains_$$ = function($JSCompiler_StaticMethods_getNewDomains_$self$$, $anchorList$jscomp$2$$) {
  return $anchorList$jscomp$2$$.reduce(function($anchorList$jscomp$2$$, $anchor$jscomp$4_domain$jscomp$12$$) {
    $anchor$jscomp$4_domain$jscomp$12$$ = $getNormalizedHostnameFromAnchor$$module$extensions$amp_skimlinks$0_1$utils$$($anchor$jscomp$4_domain$jscomp$12$$);
    var $acc$jscomp$7$$ = $isExcludedDomain$$module$extensions$amp_skimlinks$0_1$utils$$($anchor$jscomp$4_domain$jscomp$12$$, $JSCompiler_StaticMethods_getNewDomains_$self$$.$skimOptions_$), $isDuplicate$$ = -1 !== $anchorList$jscomp$2$$.indexOf($anchor$jscomp$4_domain$jscomp$12$$);
    $JSCompiler_StaticMethods_getNewDomains_$self$$.$D$[$anchor$jscomp$4_domain$jscomp$12$$] || $acc$jscomp$7$$ || $isDuplicate$$ || $anchorList$jscomp$2$$.push($anchor$jscomp$4_domain$jscomp$12$$);
    return $anchorList$jscomp$2$$;
  }, []);
}, $JSCompiler_StaticMethods_markDomainsAsUnknown_$$ = function($JSCompiler_StaticMethods_markDomainsAsUnknown_$self$$, $domains$jscomp$5$$) {
  $domains$jscomp$5$$.forEach(function($domains$jscomp$5$$) {
    $JSCompiler_StaticMethods_markDomainsAsUnknown_$self$$.$D$[$domains$jscomp$5$$] || ($isExcludedDomain$$module$extensions$amp_skimlinks$0_1$utils$$($domains$jscomp$5$$, $JSCompiler_StaticMethods_markDomainsAsUnknown_$self$$.$skimOptions_$) && ($JSCompiler_StaticMethods_markDomainsAsUnknown_$self$$.$D$[$domains$jscomp$5$$] = "ignore"), $JSCompiler_StaticMethods_markDomainsAsUnknown_$self$$.$D$[$domains$jscomp$5$$] = "unknown");
  });
}, $JSCompiler_StaticMethods_AffiliateLinkResolver$$module$extensions$amp_skimlinks$0_1$affiliate_link_resolver_prototype$getUnknownAnchors_$$ = function($anchorList$jscomp$3$$, $unknownDomains$$) {
  return $anchorList$jscomp$3$$.filter(function($anchorList$jscomp$3$$) {
    $anchorList$jscomp$3$$ = $getNormalizedHostnameFromAnchor$$module$extensions$amp_skimlinks$0_1$utils$$($anchorList$jscomp$3$$);
    return -1 !== $unknownDomains$$.indexOf($anchorList$jscomp$3$$);
  });
}, $JSCompiler_StaticMethods_resolvedUnknownAnchorsAsync_$$ = function($JSCompiler_StaticMethods_resolvedUnknownAnchorsAsync_$self$$, $anchorList$jscomp$4$$, $domainsToAsk$jscomp$1$$) {
  var $promise$jscomp$52$$ = $JSCompiler_StaticMethods_fetchDomainResolverApi$$($JSCompiler_StaticMethods_resolvedUnknownAnchorsAsync_$self$$, $domainsToAsk$jscomp$1$$);
  $JSCompiler_StaticMethods_resolvedUnknownAnchorsAsync_$self$$.$F$ || ($JSCompiler_StaticMethods_resolvedUnknownAnchorsAsync_$self$$.$F$ = $promise$jscomp$52$$);
  return $promise$jscomp$52$$.then(function($promise$jscomp$52$$) {
    $JSCompiler_StaticMethods_updateDomainsStatusMap_$$($JSCompiler_StaticMethods_resolvedUnknownAnchorsAsync_$self$$, $domainsToAsk$jscomp$1$$, $promise$jscomp$52$$.merchant_domains || []);
    return $JSCompiler_StaticMethods_associateWithReplacementUrl_$$($JSCompiler_StaticMethods_resolvedUnknownAnchorsAsync_$self$$, $anchorList$jscomp$4$$);
  });
}, $JSCompiler_StaticMethods_updateDomainsStatusMap_$$ = function($JSCompiler_StaticMethods_updateDomainsStatusMap_$self$$, $allDomains$$, $affiliateDomains$$) {
  $allDomains$$.forEach(function($allDomains$$) {
    $JSCompiler_StaticMethods_updateDomainsStatusMap_$self$$.$D$[$allDomains$$] = -1 !== $affiliateDomains$$.indexOf($allDomains$$) ? "affiliate" : "non-affiliate";
  });
}, $LinkReplacementCache$$module$extensions$amp_skimlinks$0_1$link_rewriter$link_replacement_cache$$ = function() {
  this.$D$ = [];
  this.$G$ = [];
}, $JSCompiler_StaticMethods_updateLinkList$$ = function($JSCompiler_StaticMethods_updateLinkList$self$$, $newAnchorList$$) {
  $JSCompiler_StaticMethods_updateLinkList$self$$.$G$ = $newAnchorList$$.map($JSCompiler_StaticMethods_updateLinkList$self$$.$F$.bind($JSCompiler_StaticMethods_updateLinkList$self$$));
  $JSCompiler_StaticMethods_updateLinkList$self$$.$D$ = $newAnchorList$$;
}, $JSCompiler_StaticMethods_updateReplacementUrls$$ = function($JSCompiler_StaticMethods_updateReplacementUrls$self$$, $replacementList$$) {
  $replacementList$$.forEach(function($replacementList$$) {
    var $$jscomp$destructuring$var486_anchorIndex$$ = $replacementList$$.$replacementUrl$;
    $replacementList$$ = $JSCompiler_StaticMethods_updateReplacementUrls$self$$.$D$.indexOf($replacementList$$.anchor);
    -1 !== $replacementList$$ && ($JSCompiler_StaticMethods_updateReplacementUrls$self$$.$G$[$replacementList$$] = $$jscomp$destructuring$var486_anchorIndex$$);
  });
}, $JSCompiler_StaticMethods_LinkReplacementCache$$module$extensions$amp_skimlinks$0_1$link_rewriter$link_replacement_cache_prototype$getAnchorReplacementList$$ = function($JSCompiler_StaticMethods_LinkReplacementCache$$module$extensions$amp_skimlinks$0_1$link_rewriter$link_replacement_cache_prototype$getAnchorReplacementList$self$$) {
  return $JSCompiler_StaticMethods_LinkReplacementCache$$module$extensions$amp_skimlinks$0_1$link_rewriter$link_replacement_cache_prototype$getAnchorReplacementList$self$$.$D$.map(function($anchor$jscomp$10$$) {
    return {anchor:$anchor$jscomp$10$$, $replacementUrl$:$JSCompiler_StaticMethods_LinkReplacementCache$$module$extensions$amp_skimlinks$0_1$link_rewriter$link_replacement_cache_prototype$getAnchorReplacementList$self$$.$F$($anchor$jscomp$10$$)};
  });
}, $LinkRewriter$$module$extensions$amp_skimlinks$0_1$link_rewriter$link_rewriter$$ = function($rootNode$jscomp$9$$, $resolveUnknownLinks$$, $options$jscomp$55$$) {
  this.events = new _.$Observable$$module$src$observable$$;
  this.id = "amp-skimlinks";
  this.$F$ = $rootNode$jscomp$9$$;
  this.$I$ = $resolveUnknownLinks$$;
  this.$G$ = $options$jscomp$55$$.$linkSelector$ || "a";
  this.$D$ = new $LinkReplacementCache$$module$extensions$amp_skimlinks$0_1$link_rewriter$link_replacement_cache$$;
}, $JSCompiler_StaticMethods_rewriteAnchorUrl$$ = function($JSCompiler_StaticMethods_rewriteAnchorUrl$self_newUrl$jscomp$3$$, $anchor$jscomp$13$$) {
  $JSCompiler_StaticMethods_rewriteAnchorUrl$self_newUrl$jscomp$3$$ = -1 !== $JSCompiler_StaticMethods_rewriteAnchorUrl$self_newUrl$jscomp$3$$.$D$.$D$.indexOf($anchor$jscomp$13$$) ? $JSCompiler_StaticMethods_rewriteAnchorUrl$self_newUrl$jscomp$3$$.$D$.$F$($anchor$jscomp$13$$) : null;
  if (!$JSCompiler_StaticMethods_rewriteAnchorUrl$self_newUrl$jscomp$3$$ || $JSCompiler_StaticMethods_rewriteAnchorUrl$self_newUrl$jscomp$3$$ === $anchor$jscomp$13$$.href) {
    return !1;
  }
  $anchor$jscomp$13$$.setAttribute("data-link-rewriter-original-url", $anchor$jscomp$13$$.href);
  $anchor$jscomp$13$$.href = $JSCompiler_StaticMethods_rewriteAnchorUrl$self_newUrl$jscomp$3$$;
  (0,window.setTimeout)(function() {
    $anchor$jscomp$13$$.href = $anchor$jscomp$13$$.getAttribute("data-link-rewriter-original-url");
    $anchor$jscomp$13$$.removeAttribute("data-link-rewriter-original-url");
  }, 300);
  return !0;
}, $JSCompiler_StaticMethods_onDomUpdated$$ = function($JSCompiler_StaticMethods_onDomUpdated$self$$) {
  new window.Promise(function($resolve$jscomp$63$$) {
    _.$chunk$$module$src$chunk$$($JSCompiler_StaticMethods_onDomUpdated$self$$.$F$.nodeType == window.Node.DOCUMENT_NODE ? $JSCompiler_StaticMethods_onDomUpdated$self$$.$F$.documentElement : $JSCompiler_StaticMethods_onDomUpdated$self$$.$F$, function() {
      return $JSCompiler_StaticMethods_scanLinksOnPage_$$($JSCompiler_StaticMethods_onDomUpdated$self$$).then(function() {
        $JSCompiler_StaticMethods_onDomUpdated$self$$.events.$fire$({type:"PAGE_SCANNED"});
        $resolve$jscomp$63$$();
      });
    });
  });
}, $JSCompiler_StaticMethods_scanLinksOnPage_$$ = function($JSCompiler_StaticMethods_scanLinksOnPage_$self$$) {
  var $anchorList$jscomp$5_twoStepsResponse$$ = [].slice.call($JSCompiler_StaticMethods_scanLinksOnPage_$self$$.$F$.querySelectorAll($JSCompiler_StaticMethods_scanLinksOnPage_$self$$.$G$)), $unknownAnchors$jscomp$1$$ = $JSCompiler_StaticMethods_LinkRewriter$$module$extensions$amp_skimlinks$0_1$link_rewriter$link_rewriter_prototype$getUnknownAnchors_$$($JSCompiler_StaticMethods_scanLinksOnPage_$self$$, $anchorList$jscomp$5_twoStepsResponse$$);
  $JSCompiler_StaticMethods_updateLinkList$$($JSCompiler_StaticMethods_scanLinksOnPage_$self$$.$D$, $anchorList$jscomp$5_twoStepsResponse$$);
  if (!$unknownAnchors$jscomp$1$$.length) {
    return window.Promise.resolve();
  }
  $JSCompiler_StaticMethods_updateReplacementUrls$$($JSCompiler_StaticMethods_scanLinksOnPage_$self$$.$D$, $unknownAnchors$jscomp$1$$.map(function($JSCompiler_StaticMethods_scanLinksOnPage_$self$$) {
    return {anchor:$JSCompiler_StaticMethods_scanLinksOnPage_$self$$, $replacementUrl$:null};
  }));
  $anchorList$jscomp$5_twoStepsResponse$$ = $JSCompiler_StaticMethods_scanLinksOnPage_$self$$.$I$($unknownAnchors$jscomp$1$$);
  $anchorList$jscomp$5_twoStepsResponse$$.$F$ && $JSCompiler_StaticMethods_updateReplacementUrls$$($JSCompiler_StaticMethods_scanLinksOnPage_$self$$.$D$, $anchorList$jscomp$5_twoStepsResponse$$.$F$);
  return $anchorList$jscomp$5_twoStepsResponse$$.$D$ ? $anchorList$jscomp$5_twoStepsResponse$$.$D$.then(function($anchorList$jscomp$5_twoStepsResponse$$) {
    $JSCompiler_StaticMethods_updateReplacementUrls$$($JSCompiler_StaticMethods_scanLinksOnPage_$self$$.$D$, $anchorList$jscomp$5_twoStepsResponse$$);
  }) : window.Promise.resolve();
}, $JSCompiler_StaticMethods_LinkRewriter$$module$extensions$amp_skimlinks$0_1$link_rewriter$link_rewriter_prototype$getUnknownAnchors_$$ = function($JSCompiler_StaticMethods_LinkRewriter$$module$extensions$amp_skimlinks$0_1$link_rewriter$link_rewriter_prototype$getUnknownAnchors_$self$$, $anchorList$jscomp$6$$) {
  var $unknownAnchors$jscomp$2$$ = [];
  $anchorList$jscomp$6$$.forEach(function($anchorList$jscomp$6$$) {
    -1 !== $JSCompiler_StaticMethods_LinkRewriter$$module$extensions$amp_skimlinks$0_1$link_rewriter$link_rewriter_prototype$getUnknownAnchors_$self$$.$D$.$D$.indexOf($anchorList$jscomp$6$$) || $unknownAnchors$jscomp$2$$.push($anchorList$jscomp$6$$);
  });
  return $unknownAnchors$jscomp$2$$;
}, $LinkRewriterManager$$module$extensions$amp_skimlinks$0_1$link_rewriter$link_rewriter_manager$$ = function($ampdoc$jscomp$192$$) {
  this.$F$ = $ampdoc$jscomp$192$$.getRootNode();
  var $value$jscomp$inline_4017$$ = _.$Services$$module$src$services$documentInfoForDoc$$($ampdoc$jscomp$192$$).$metaTags$["amp-link-rewriter-priorities"];
  this.$J$ = $value$jscomp$inline_4017$$ ? $value$jscomp$inline_4017$$.trim().split(/\s+/) : [];
  this.$D$ = [];
  this.$F$.addEventListener("amp:dom-update", this.$I$.bind(this));
  _.$JSCompiler_StaticMethods_registerAnchorMutator$$(_.$Services$$module$src$services$navigationForDoc$$($ampdoc$jscomp$192$$), this.$G$.bind(this), 0);
}, $JSCompiler_StaticMethods_registerLinkRewriter$$ = function($JSCompiler_StaticMethods_registerLinkRewriter$self$$, $linkRewriter_resolveUnknownLinks$jscomp$1$$, $options$jscomp$56$$) {
  $linkRewriter_resolveUnknownLinks$jscomp$1$$ = new $LinkRewriter$$module$extensions$amp_skimlinks$0_1$link_rewriter$link_rewriter$$($JSCompiler_StaticMethods_registerLinkRewriter$self$$.$F$, $linkRewriter_resolveUnknownLinks$jscomp$1$$, $options$jscomp$56$$);
  $JSCompiler_StaticMethods_insertInListBasedOnPriority_$$($JSCompiler_StaticMethods_registerLinkRewriter$self$$.$D$, $linkRewriter_resolveUnknownLinks$jscomp$1$$, $JSCompiler_StaticMethods_registerLinkRewriter$self$$.$J$);
  $JSCompiler_StaticMethods_onDomUpdated$$($linkRewriter_resolveUnknownLinks$jscomp$1$$);
  return $linkRewriter_resolveUnknownLinks$jscomp$1$$;
}, $JSCompiler_StaticMethods_parseLinkRewriterPriorityForAnchor_$$ = function($anchor$jscomp$17_dataValue$$) {
  return ($anchor$jscomp$17_dataValue$$ = $anchor$jscomp$17_dataValue$$.hasAttribute("data-link-rewriters") ? $anchor$jscomp$17_dataValue$$.getAttribute("data-link-rewriters").trim() : null) ? $anchor$jscomp$17_dataValue$$.split(/\s+/) : [];
}, $JSCompiler_StaticMethods_insertInListBasedOnPriority_$$ = function($linkRewriterList$$, $linkRewriter$jscomp$3$$, $idPriorityList$$) {
  $linkRewriterList$$.push($linkRewriter$jscomp$3$$);
  $linkRewriterList$$.sort(function($linkRewriterList$$, $linkRewriter$jscomp$3$$) {
    $linkRewriterList$$ = $idPriorityList$$.indexOf($linkRewriterList$$.id);
    $linkRewriter$jscomp$3$$ = $idPriorityList$$.indexOf($linkRewriter$jscomp$3$$.id);
    return -1 === $linkRewriterList$$ && -1 === $linkRewriter$jscomp$3$$ ? 0 : -1 === $linkRewriterList$$ ? 1 : -1 === $linkRewriter$jscomp$3$$ ? -1 : $linkRewriterList$$ > $linkRewriter$jscomp$3$$ ? 1 : -1;
  });
}, $JSCompiler_StaticMethods_getSuitableLinkRewritersForLink_$$ = function($JSCompiler_StaticMethods_getSuitableLinkRewritersForLink_$self$$, $anchor$jscomp$18$$) {
  var $linkPriorityList$$ = $JSCompiler_StaticMethods_parseLinkRewriterPriorityForAnchor_$$($anchor$jscomp$18$$);
  return $JSCompiler_StaticMethods_getSuitableLinkRewritersForLink_$self$$.$D$.reduce(function($JSCompiler_StaticMethods_getSuitableLinkRewritersForLink_$self$$, $linkRewriter$jscomp$4$$) {
    -1 !== $linkRewriter$jscomp$4$$.$D$.$D$.indexOf($anchor$jscomp$18$$) && $JSCompiler_StaticMethods_insertInListBasedOnPriority_$$($JSCompiler_StaticMethods_getSuitableLinkRewritersForLink_$self$$, $linkRewriter$jscomp$4$$, $linkPriorityList$$);
    return $JSCompiler_StaticMethods_getSuitableLinkRewritersForLink_$self$$;
  }, []);
}, $getAmpSkimlinksOptions$$module$extensions$amp_skimlinks$0_1$skim_options$$ = function($element$jscomp$535$$, $JSCompiler_temp_const$jscomp$848_docInfo$jscomp$7$$) {
  var $JSCompiler_temp_const$jscomp$849$$ = $element$jscomp$535$$.getAttribute("publisher-code"), $JSCompiler_temp_const$jscomp$851_tracking$jscomp$inline_4026$$ = $getExcludedDomains_$$module$extensions$amp_skimlinks$0_1$skim_options$$, $internalDomains$jscomp$inline_4023$$ = [];
  $JSCompiler_temp_const$jscomp$848_docInfo$jscomp$7$$.canonicalUrl && $internalDomains$jscomp$inline_4023$$.push(_.$parseUrlDeprecated$$module$src$url$$($JSCompiler_temp_const$jscomp$848_docInfo$jscomp$7$$.canonicalUrl).hostname.replace(/^www\./, ""));
  $JSCompiler_temp_const$jscomp$848_docInfo$jscomp$7$$.sourceUrl && $internalDomains$jscomp$inline_4023$$.push(_.$parseUrlDeprecated$$module$src$url$$($JSCompiler_temp_const$jscomp$848_docInfo$jscomp$7$$.sourceUrl).hostname.replace(/^www\./, ""));
  $JSCompiler_temp_const$jscomp$848_docInfo$jscomp$7$$ = $JSCompiler_temp_const$jscomp$851_tracking$jscomp$inline_4026$$($element$jscomp$535$$, $internalDomains$jscomp$inline_4023$$);
  $JSCompiler_temp_const$jscomp$851_tracking$jscomp$inline_4026$$ = $element$jscomp$535$$.getAttribute("tracking");
  return {$pubcode$:$JSCompiler_temp_const$jscomp$849$$, $excludedDomains$:$JSCompiler_temp_const$jscomp$848_docInfo$jscomp$7$$, $tracking$:$JSCompiler_temp_const$jscomp$851_tracking$jscomp$inline_4026$$ ? "true" === $JSCompiler_temp_const$jscomp$851_tracking$jscomp$inline_4026$$ : !0, $customTrackingId$:$element$jscomp$535$$.getAttribute("custom-tracking-id"), $linkSelector$:$element$jscomp$535$$.getAttribute("link-selector") || null};
}, $getExcludedDomains_$$module$extensions$amp_skimlinks$0_1$skim_options$$ = function($element$jscomp$536_excludedDomainsAttr$$, $excludedDomains$jscomp$1_internalDomains$$) {
  $excludedDomains$jscomp$1_internalDomains$$ = [].concat($excludedDomains$jscomp$1_internalDomains$$).concat($GLOBAL_DOMAIN_BLACKLIST$$module$extensions$amp_skimlinks$0_1$constants$$);
  ($element$jscomp$536_excludedDomainsAttr$$ = $element$jscomp$536_excludedDomainsAttr$$.getAttribute("excluded-domains")) && ($excludedDomains$jscomp$1_internalDomains$$ = $excludedDomains$jscomp$1_internalDomains$$.concat($element$jscomp$536_excludedDomainsAttr$$.trim().split(/\s+/).map(function($element$jscomp$536_excludedDomainsAttr$$) {
    return $element$jscomp$536_excludedDomainsAttr$$.replace(/^www\./, "");
  })));
  return $excludedDomains$jscomp$1_internalDomains$$;
}, $Tracking$$module$extensions$amp_skimlinks$0_1$tracking$$ = function($analyticsBuilder$jscomp$inline_4033_element$jscomp$541$$, $skimOptions$jscomp$3$$, $referrer$jscomp$12$$) {
  this.$F$ = $skimOptions$jscomp$3$$.$tracking$;
  for (var $JSCompiler_temp_const$jscomp$843$$ = $skimOptions$jscomp$3$$.$customTrackingId$, $str$jscomp$inline_4028$$ = "", $i$288$jscomp$inline_4029$$ = 0; 8 > $i$288$jscomp$inline_4029$$; $i$288$jscomp$inline_4029$$++) {
    $str$jscomp$inline_4028$$ += Math.floor(65536 * (1 + Math.random())).toString(16).substring(1);
  }
  this.$D$ = {$customTrackingId$:$JSCompiler_temp_const$jscomp$843$$, $guid$:null, $pageImpressionId$:$str$jscomp$inline_4028$$, $pageUrl$:"CANONICAL_URL", $pubcode$:$skimOptions$jscomp$3$$.$pubcode$, referrer:$referrer$jscomp$12$$, $timezone$:"TIMEZONE"};
  this.$skimOptions_$ = $skimOptions$jscomp$3$$;
  $analyticsBuilder$jscomp$inline_4033_element$jscomp$541$$ = new _.$CustomEventReporterBuilder$$module$src$extension_analytics$$($analyticsBuilder$jscomp$inline_4033_element$jscomp$541$$);
  $analyticsBuilder$jscomp$inline_4033_element$jscomp$541$$.track("page-impressions", "https://t.skimresources.com/api/track.php?data=${data}");
  $analyticsBuilder$jscomp$inline_4033_element$jscomp$541$$.track("link-impressions", "https://t.skimresources.com/api/link?data=${data}");
  $analyticsBuilder$jscomp$inline_4033_element$jscomp$541$$.track("non-affiliate-click", "https://t.skimresources.com/api/?call=track&rnd=${rnd}&data=${data}");
  $analyticsBuilder$jscomp$inline_4033_element$jscomp$541$$.$config_$.transport = _.$dict$$module$src$utils$object$$({beacon:!0, image:!0, xhrpost:!1});
  this.$analytics_$ = $analyticsBuilder$jscomp$inline_4033_element$jscomp$541$$.$build$();
}, $JSCompiler_StaticMethods_setTrackingInfo$$ = function($JSCompiler_StaticMethods_setTrackingInfo$self$$, $newInfo$$) {
  Object.assign($JSCompiler_StaticMethods_setTrackingInfo$self$$.$D$, $newInfo$$);
}, $JSCompiler_StaticMethods_extractAnchorTrackingInfo_$$ = function($JSCompiler_StaticMethods_extractAnchorTrackingInfo_$self$$, $anchorReplacementList$jscomp$1$$) {
  var $numberAffiliateLinks$jscomp$3$$ = 0, $urls$jscomp$6$$ = _.$dict$$module$src$utils$object$$({});
  $anchorReplacementList$jscomp$1$$.forEach(function($anchorReplacementList$jscomp$1$$) {
    var $$jscomp$destructuring$var492_anchor$jscomp$20$$ = $anchorReplacementList$jscomp$1$$.$replacementUrl$;
    $anchorReplacementList$jscomp$1$$ = $anchorReplacementList$jscomp$1$$.anchor;
    var $isExcluded$jscomp$1$$ = $isExcludedAnchorUrl$$module$extensions$amp_skimlinks$0_1$utils$$($anchorReplacementList$jscomp$1$$, $JSCompiler_StaticMethods_extractAnchorTrackingInfo_$self$$.$skimOptions_$);
    $$jscomp$destructuring$var492_anchor$jscomp$20$$ && !$isExcluded$jscomp$1$$ && ($urls$jscomp$6$$[$anchorReplacementList$jscomp$1$$.href] = $urls$jscomp$6$$[$anchorReplacementList$jscomp$1$$.href] || _.$dict$$module$src$utils$object$$({ae:1, count:0}), $urls$jscomp$6$$[$anchorReplacementList$jscomp$1$$.href].count += 1, $numberAffiliateLinks$jscomp$3$$ += 1);
  });
  return {$numberAffiliateLinks$:$numberAffiliateLinks$jscomp$3$$, urls:$urls$jscomp$6$$};
}, $Waypoint$$module$extensions$amp_skimlinks$0_1$waypoint$$ = function($ampdoc$jscomp$194$$, $tracking$jscomp$1$$, $referrer$jscomp$15$$) {
  this.$D$ = $tracking$jscomp$1$$;
  this.$F$ = $referrer$jscomp$15$$;
  this.$canonicalUrl_$ = _.$Services$$module$src$services$documentInfoForDoc$$($ampdoc$jscomp$194$$).canonicalUrl;
  this.$G$ = "" + (new Date).getTimezoneOffset();
}, $AmpSkimlinks$$module$extensions$amp_skimlinks$0_1$amp_skimlinks$$ = function($$jscomp$super$this$jscomp$91_element$jscomp$543$$) {
  $$jscomp$super$this$jscomp$91_element$jscomp$543$$ = window.AMP.BaseElement.call(this, $$jscomp$super$this$jscomp$91_element$jscomp$543$$) || this;
  $$jscomp$super$this$jscomp$91_element$jscomp$543$$.$xhr_$ = null;
  $$jscomp$super$this$jscomp$91_element$jscomp$543$$.$ampDoc_$ = null;
  $$jscomp$super$this$jscomp$91_element$jscomp$543$$.$docInfo_$ = null;
  $$jscomp$super$this$jscomp$91_element$jscomp$543$$.$viewer_$ = null;
  $$jscomp$super$this$jscomp$91_element$jscomp$543$$.$linkRewriterService_$ = null;
  $$jscomp$super$this$jscomp$91_element$jscomp$543$$.$skimOptions_$ = {};
  $$jscomp$super$this$jscomp$91_element$jscomp$543$$.$trackingService_$ = null;
  $$jscomp$super$this$jscomp$91_element$jscomp$543$$.$affiliateLinkResolver_$ = null;
  $$jscomp$super$this$jscomp$91_element$jscomp$543$$.$waypoint_$ = null;
  $$jscomp$super$this$jscomp$91_element$jscomp$543$$.$skimlinksLinkRewriter_$ = null;
  $$jscomp$super$this$jscomp$91_element$jscomp$543$$.$referrer_$ = null;
  return $$jscomp$super$this$jscomp$91_element$jscomp$543$$;
}, $JSCompiler_StaticMethods_initSkimlinksLinkRewriter_$$ = function($JSCompiler_StaticMethods_initSkimlinksLinkRewriter_$self$$) {
  var $linkRewriter$jscomp$5$$ = $JSCompiler_StaticMethods_registerLinkRewriter$$($JSCompiler_StaticMethods_initSkimlinksLinkRewriter_$self$$.$linkRewriterService_$, function($linkRewriter$jscomp$5$$) {
    var $$jscomp$compprop44$$ = $JSCompiler_StaticMethods_initSkimlinksLinkRewriter_$self$$.$affiliateLinkResolver_$, $eventHandlers$$ = $JSCompiler_StaticMethods_associateWithReplacementUrl_$$($$jscomp$compprop44$$, $linkRewriter$jscomp$5$$), $anchorList$jscomp$7_unknownAnchors$jscomp$inline_4050$$ = null, $domainsToAsk$jscomp$inline_4049$$ = $JSCompiler_StaticMethods_getNewDomains_$$($$jscomp$compprop44$$, $linkRewriter$jscomp$5$$);
    $domainsToAsk$jscomp$inline_4049$$.length && ($JSCompiler_StaticMethods_markDomainsAsUnknown_$$($$jscomp$compprop44$$, $domainsToAsk$jscomp$inline_4049$$), $linkRewriter$jscomp$5$$ = $JSCompiler_StaticMethods_AffiliateLinkResolver$$module$extensions$amp_skimlinks$0_1$affiliate_link_resolver_prototype$getUnknownAnchors_$$($linkRewriter$jscomp$5$$, $domainsToAsk$jscomp$inline_4049$$), $anchorList$jscomp$7_unknownAnchors$jscomp$inline_4050$$ = $JSCompiler_StaticMethods_resolvedUnknownAnchorsAsync_$$($$jscomp$compprop44$$, 
    $linkRewriter$jscomp$5$$, $domainsToAsk$jscomp$inline_4049$$));
    return new $TwoStepsResponse$$module$extensions$amp_skimlinks$0_1$link_rewriter$two_steps_response$$($eventHandlers$$, $anchorList$jscomp$7_unknownAnchors$jscomp$inline_4050$$);
  }, {$linkSelector$:$JSCompiler_StaticMethods_initSkimlinksLinkRewriter_$self$$.$skimOptions_$.$linkSelector$}), $$jscomp$compprop44$$ = {}, $eventHandlers$$ = ($$jscomp$compprop44$$.PAGE_SCANNED = _.$once$$module$src$utils$function$$($JSCompiler_StaticMethods_initSkimlinksLinkRewriter_$self$$.$onPageScanned_$.bind($JSCompiler_StaticMethods_initSkimlinksLinkRewriter_$self$$)), $$jscomp$compprop44$$.CLICK = $JSCompiler_StaticMethods_initSkimlinksLinkRewriter_$self$$.$AmpSkimlinks$$module$extensions$amp_skimlinks$0_1$amp_skimlinks_prototype$onClick_$.bind($JSCompiler_StaticMethods_initSkimlinksLinkRewriter_$self$$), 
  $$jscomp$compprop44$$);
  $linkRewriter$jscomp$5$$.events.add(function($JSCompiler_StaticMethods_initSkimlinksLinkRewriter_$self$$) {
    var $linkRewriter$jscomp$5$$ = $eventHandlers$$[$JSCompiler_StaticMethods_initSkimlinksLinkRewriter_$self$$.type];
    $linkRewriter$jscomp$5$$ && $linkRewriter$jscomp$5$$($JSCompiler_StaticMethods_initSkimlinksLinkRewriter_$self$$.$eventData$);
  });
  return $linkRewriter$jscomp$5$$;
}, $GLOBAL_DOMAIN_BLACKLIST$$module$extensions$amp_skimlinks$0_1$constants$$ = "facebook.com go.redirectingat.com go.skimresources.com instagram.com twitter.com youtube.com".split(" ");
$LinkReplacementCache$$module$extensions$amp_skimlinks$0_1$link_rewriter$link_replacement_cache$$.prototype.$F$ = function($anchor$jscomp$8_index$jscomp$137$$) {
  $anchor$jscomp$8_index$jscomp$137$$ = this.$D$.indexOf($anchor$jscomp$8_index$jscomp$137$$);
  return -1 !== $anchor$jscomp$8_index$jscomp$137$$ ? this.$G$[$anchor$jscomp$8_index$jscomp$137$$] : null;
};
$LinkRewriterManager$$module$extensions$amp_skimlinks$0_1$link_rewriter$link_rewriter_manager$$.prototype.$G$ = function($anchor$jscomp$16$$, $event$jscomp$184$$) {
  var $suitableLinkRewriters$$ = $JSCompiler_StaticMethods_getSuitableLinkRewritersForLink_$$(this, $anchor$jscomp$16$$);
  if ($suitableLinkRewriters$$.length) {
    for (var $chosenLinkRewriter$$ = null, $i$289$$ = 0; $i$289$$ < $suitableLinkRewriters$$.length; $i$289$$++) {
      if ($JSCompiler_StaticMethods_rewriteAnchorUrl$$($suitableLinkRewriters$$[$i$289$$], $anchor$jscomp$16$$)) {
        $chosenLinkRewriter$$ = $suitableLinkRewriters$$[$i$289$$];
        break;
      }
    }
    var $eventData$jscomp$18$$ = {$linkRewriterId$:$chosenLinkRewriter$$ ? $chosenLinkRewriter$$.id : null, anchor:$anchor$jscomp$16$$, $clickType$:$event$jscomp$184$$.type};
    $suitableLinkRewriters$$.forEach(function($anchor$jscomp$16$$) {
      $anchor$jscomp$16$$.events.$fire$({type:"CLICK", $eventData$:$eventData$jscomp$18$$});
    });
  }
};
$LinkRewriterManager$$module$extensions$amp_skimlinks$0_1$link_rewriter$link_rewriter_manager$$.prototype.$I$ = function() {
  this.$D$.forEach(function($linkRewriter$jscomp$2$$) {
    $JSCompiler_StaticMethods_onDomUpdated$$($linkRewriter$jscomp$2$$);
  });
};
_.$$jscomp$inherits$$($AmpSkimlinks$$module$extensions$amp_skimlinks$0_1$amp_skimlinks$$, window.AMP.BaseElement);
_.$JSCompiler_prototypeAlias$$ = $AmpSkimlinks$$module$extensions$amp_skimlinks$0_1$amp_skimlinks$$.prototype;
_.$JSCompiler_prototypeAlias$$.$buildCallback$ = function() {
  var $$jscomp$this$jscomp$846$$ = this;
  this.$xhr_$ = _.$Services$$module$src$services$xhrFor$$(this.$win$);
  this.$ampDoc_$ = this.$getAmpDoc$();
  this.$docInfo_$ = _.$Services$$module$src$services$documentInfoForDoc$$(this.$ampDoc_$);
  this.$viewer_$ = _.$Services$$module$src$services$viewerForDoc$$(this.$ampDoc_$);
  this.$linkRewriterService_$ = new $LinkRewriterManager$$module$extensions$amp_skimlinks$0_1$link_rewriter$link_rewriter_manager$$(this.$ampDoc_$);
  this.$skimOptions_$ = $getAmpSkimlinksOptions$$module$extensions$amp_skimlinks$0_1$skim_options$$(this.element, this.$docInfo_$);
  return this.$ampDoc_$.$whenBodyAvailable$().then(function() {
    return $$jscomp$this$jscomp$846$$.$viewer_$.$I$;
  }).then(function($JSCompiler_inline_result$jscomp$5650_referrer$jscomp$16$$) {
    $$jscomp$this$jscomp$846$$.$referrer_$ = $JSCompiler_inline_result$jscomp$5650_referrer$jscomp$16$$;
    _.$JSCompiler_StaticMethods_signal$$($$jscomp$this$jscomp$846$$.signals(), "load-start");
    $JSCompiler_inline_result$jscomp$5650_referrer$jscomp$16$$ = new $Tracking$$module$extensions$amp_skimlinks$0_1$tracking$$($$jscomp$this$jscomp$846$$.element, $$jscomp$this$jscomp$846$$.$skimOptions_$, $$jscomp$this$jscomp$846$$.$referrer_$);
    $$jscomp$this$jscomp$846$$.$trackingService_$ = $JSCompiler_inline_result$jscomp$5650_referrer$jscomp$16$$;
    $$jscomp$this$jscomp$846$$.$waypoint_$ = new $Waypoint$$module$extensions$amp_skimlinks$0_1$waypoint$$($$jscomp$this$jscomp$846$$.$ampDoc_$, $$jscomp$this$jscomp$846$$.$trackingService_$, $$jscomp$this$jscomp$846$$.$referrer_$);
    $$jscomp$this$jscomp$846$$.$affiliateLinkResolver_$ = new $AffiliateLinkResolver$$module$extensions$amp_skimlinks$0_1$affiliate_link_resolver$$($$jscomp$this$jscomp$846$$.$xhr_$, $$jscomp$this$jscomp$846$$.$skimOptions_$, $$jscomp$this$jscomp$846$$.$waypoint_$);
    $$jscomp$this$jscomp$846$$.$skimlinksLinkRewriter_$ = $JSCompiler_StaticMethods_initSkimlinksLinkRewriter_$$($$jscomp$this$jscomp$846$$);
  });
};
_.$JSCompiler_prototypeAlias$$.$sendImpressionTracking_$ = function($beaconData$$) {
  var $$jscomp$this$jscomp$847$$ = this;
  $JSCompiler_StaticMethods_setTrackingInfo$$(this.$trackingService_$, {$guid$:$beaconData$$.guid});
  _.$Services$$module$src$services$viewerForDoc$$(this.$ampDoc_$).$D$.then(function() {
    var $beaconData$$ = $$jscomp$this$jscomp$847$$.$trackingService_$, $anchorReplacementList$jscomp$inline_4038_numberAffiliateLinks$jscomp$inline_4042$$ = $JSCompiler_StaticMethods_LinkReplacementCache$$module$extensions$amp_skimlinks$0_1$link_rewriter$link_replacement_cache_prototype$getAnchorReplacementList$$($$jscomp$this$jscomp$847$$.$skimlinksLinkRewriter_$.$D$);
    if ($beaconData$$.$F$) {
      var $$jscomp$inline_4039_commonData$jscomp$inline_4040_data$jscomp$inline_6364$$ = $beaconData$$.$D$;
      $$jscomp$inline_4039_commonData$jscomp$inline_4040_data$jscomp$inline_6364$$ = _.$dict$$module$src$utils$object$$({pub:$$jscomp$inline_4039_commonData$jscomp$inline_4040_data$jscomp$inline_6364$$.$pubcode$, pag:$$jscomp$inline_4039_commonData$jscomp$inline_4040_data$jscomp$inline_6364$$.$pageUrl$, guid:$$jscomp$inline_4039_commonData$jscomp$inline_4040_data$jscomp$inline_6364$$.$guid$, uuid:$$jscomp$inline_4039_commonData$jscomp$inline_4040_data$jscomp$inline_6364$$.$pageImpressionId$, tz:$$jscomp$inline_4039_commonData$jscomp$inline_4040_data$jscomp$inline_6364$$.$timezone$, 
      jv:"amp@1.0.1"});
      var $$jscomp$inline_4041_urls$jscomp$inline_4043$$ = $JSCompiler_StaticMethods_extractAnchorTrackingInfo_$$($beaconData$$, $anchorReplacementList$jscomp$inline_4038_numberAffiliateLinks$jscomp$inline_4042$$);
      $anchorReplacementList$jscomp$inline_4038_numberAffiliateLinks$jscomp$inline_4042$$ = $$jscomp$inline_4041_urls$jscomp$inline_4043$$.$numberAffiliateLinks$;
      $$jscomp$inline_4041_urls$jscomp$inline_4043$$ = $$jscomp$inline_4041_urls$jscomp$inline_4043$$.urls;
      var $$jscomp$inline_6357_data$jscomp$inline_6358$$ = $beaconData$$.$D$;
      $$jscomp$inline_6357_data$jscomp$inline_6358$$ = Object.assign(_.$dict$$module$src$utils$object$$({slc:$anchorReplacementList$jscomp$inline_4038_numberAffiliateLinks$jscomp$inline_4042$$, jsl:0, pref:$$jscomp$inline_6357_data$jscomp$inline_6358$$.referrer, uc:$$jscomp$inline_6357_data$jscomp$inline_6358$$.$customTrackingId$, t:1}), $$jscomp$inline_4039_commonData$jscomp$inline_4040_data$jscomp$inline_6364$$);
      $beaconData$$.$analytics_$.$trigger$("page-impressions", _.$dict$$module$src$utils$object$$({data:JSON.stringify($$jscomp$inline_6357_data$jscomp$inline_6358$$)}));
      0 !== $anchorReplacementList$jscomp$inline_4038_numberAffiliateLinks$jscomp$inline_4042$$ && ($$jscomp$inline_4039_commonData$jscomp$inline_4040_data$jscomp$inline_6364$$ = Object.assign(_.$dict$$module$src$utils$object$$({dl:$$jscomp$inline_4041_urls$jscomp$inline_4043$$, hae:$anchorReplacementList$jscomp$inline_4038_numberAffiliateLinks$jscomp$inline_4042$$ ? 1 : 0, typ:"l"}), $$jscomp$inline_4039_commonData$jscomp$inline_4040_data$jscomp$inline_6364$$), $beaconData$$.$analytics_$.$trigger$("link-impressions", 
      _.$dict$$module$src$utils$object$$({data:JSON.stringify($$jscomp$inline_4039_commonData$jscomp$inline_4040_data$jscomp$inline_6364$$)})));
    }
  });
};
_.$JSCompiler_prototypeAlias$$.$onPageScanned_$ = function() {
  return (this.$affiliateLinkResolver_$.$F$ || $JSCompiler_StaticMethods_fetchDomainResolverApi$$(this.$affiliateLinkResolver_$, [])).then(this.$sendImpressionTracking_$.bind(this));
};
_.$JSCompiler_prototypeAlias$$.$AmpSkimlinks$$module$extensions$amp_skimlinks$0_1$amp_skimlinks_prototype$onClick_$ = function($anchor$jscomp$inline_4053_data$jscomp$inline_4058_eventData$jscomp$19$$) {
  if ("amp-skimlinks" !== $anchor$jscomp$inline_4053_data$jscomp$inline_4058_eventData$jscomp$19$$.$linkRewriterId$ && "contextmenu" !== $anchor$jscomp$inline_4053_data$jscomp$inline_4058_eventData$jscomp$19$$.$clickType$) {
    var $JSCompiler_StaticMethods_sendNaClickTracking$self$jscomp$inline_4052$$ = this.$trackingService_$;
    $anchor$jscomp$inline_4053_data$jscomp$inline_4058_eventData$jscomp$19$$ = $anchor$jscomp$inline_4053_data$jscomp$inline_4058_eventData$jscomp$19$$.anchor;
    if ($JSCompiler_StaticMethods_sendNaClickTracking$self$jscomp$inline_4052$$.$F$ && !$isExcludedAnchorUrl$$module$extensions$amp_skimlinks$0_1$utils$$($anchor$jscomp$inline_4053_data$jscomp$inline_4058_eventData$jscomp$19$$, $JSCompiler_StaticMethods_sendNaClickTracking$self$jscomp$inline_4052$$.$skimOptions_$)) {
      var $$jscomp$inline_4054$$ = $JSCompiler_StaticMethods_sendNaClickTracking$self$jscomp$inline_4052$$.$D$, $pageImpressionId$jscomp$inline_4055$$ = $$jscomp$inline_4054$$.$pageImpressionId$, $timezone$jscomp$inline_4056$$ = $$jscomp$inline_4054$$.$timezone$, $customTrackingId$jscomp$inline_4057$$ = $$jscomp$inline_4054$$.$customTrackingId$;
      $anchor$jscomp$inline_4053_data$jscomp$inline_4058_eventData$jscomp$19$$ = _.$dict$$module$src$utils$object$$({pubcode:$$jscomp$inline_4054$$.$pubcode$, referrer:$$jscomp$inline_4054$$.$pageUrl$, pref:$$jscomp$inline_4054$$.referrer, site:"false", url:$anchor$jscomp$inline_4053_data$jscomp$inline_4058_eventData$jscomp$19$$.href, custom:$anchor$jscomp$inline_4053_data$jscomp$inline_4058_eventData$jscomp$19$$.getAttribute("data-skimlinks-custom-tracking-id") || $customTrackingId$jscomp$inline_4057$$, 
      xtz:$timezone$jscomp$inline_4056$$, uuid:$pageImpressionId$jscomp$inline_4055$$, product:"1", jv:"amp@1.0.1"});
      $JSCompiler_StaticMethods_sendNaClickTracking$self$jscomp$inline_4052$$.$analytics_$.$trigger$("non-affiliate-click", _.$dict$$module$src$utils$object$$({data:JSON.stringify($anchor$jscomp$inline_4053_data$jscomp$inline_4058_eventData$jscomp$19$$), rnd:"RANDOM"}));
    }
  }
};
_.$JSCompiler_prototypeAlias$$.$isLayoutSupported$ = function() {
  return !0;
};
window.self.AMP.registerElement("amp-skimlinks", $AmpSkimlinks$$module$extensions$amp_skimlinks$0_1$amp_skimlinks$$);

})});
