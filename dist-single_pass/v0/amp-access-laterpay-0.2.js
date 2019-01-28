(self.AMP=self.AMP||[]).push({n:"amp-access-laterpay",i:["_base_i","_base_misc"],v:"1901181729101",f:(function(AMP,_){
var $LaterpayVendor$$module$extensions$amp_access_laterpay$0_2$laterpay_impl$$ = function($accessService$jscomp$4_articleId$jscomp$1_jwt$$, $accessSource$jscomp$1$$) {
  this.ampdoc = $accessService$jscomp$4_articleId$jscomp$1_jwt$$.ampdoc;
  this.$I$ = $accessSource$jscomp$1$$;
  this.$viewport_$ = _.$Services$$module$src$services$viewportForDoc$$(this.ampdoc);
  this.$D$ = this.$I$.$getAdapterConfig$();
  this.$O$ = this.$P$ = this.$R$ = this.$W$ = null;
  this.$Y$ = [];
  this.$U$ = !0;
  this.$V$ = this.$K$ = this.$F$ = null;
  this.$aa$ = this.$D$.locale || "en";
  this.$G$ = Object.assign({}, $DEFAULT_MESSAGES$$module$extensions$amp_access_laterpay$0_2$laterpay_impl$$, this.$D$.localeMessages || {});
  this.$J$ = $JSCompiler_StaticMethods_LaterpayVendor$$module$extensions$amp_access_laterpay$0_2$laterpay_impl_prototype$getConfigUrl_$$(this) + "/api/v2/fetch/amp/?article_url=CANONICAL_URL&amp_reader_id=READER_ID&return_url=RETURN_URL";
  if ($accessService$jscomp$4_articleId$jscomp$1_jwt$$ = this.$D$.articleId) {
    this.$J$ += "&article_id=" + (0,window.encodeURIComponent)($accessService$jscomp$4_articleId$jscomp$1_jwt$$);
  }
  if ($accessService$jscomp$4_articleId$jscomp$1_jwt$$ = this.$D$.jwt) {
    this.$J$ += "&jwt=" + (0,window.encodeURIComponent)($accessService$jscomp$4_articleId$jscomp$1_jwt$$);
  }
  this.$timer_$ = _.$Services$$module$src$services$timerFor$$(this.ampdoc.$win$);
  this.$vsync_$ = _.$Services$$module$src$services$vsyncFor$$(this.ampdoc.$win$);
  this.$xhr_$ = _.$Services$$module$src$services$xhrFor$$(this.ampdoc.$win$);
  _.$installStylesForDoc$$module$src$style_installer$$(this.ampdoc, ".amp-access-laterpay{position:relative}@media (min-width:420px){.amp-access-laterpay{width:420px}}.amp-access-laterpay ul{width:100%;padding:0;margin:0 0 40px}.amp-access-laterpay li{list-style:none;margin-bottom:20px}.amp-access-laterpay label,.amp-access-laterpay li{display:-webkit-box;display:-ms-flexbox;display:flex}.amp-access-laterpay label{padding-right:10px}.amp-access-laterpay input{width:20px}.amp-access-laterpay-container{padding:16px 24px 16px 16px;display:-webkit-box;display:-ms-flexbox;display:flex;-webkit-box-orient:vertical;-webkit-box-direction:normal;-ms-flex-direction:column;flex-direction:column;-webkit-box-align:center;-ms-flex-align:center;align-items:center;border-radius:12px;box-shadow:0 0 10px -1px rgba(0,0,0,0.25)}.amp-access-laterpay-sandbox{width:112%;padding:15px 10px;background-color:#f2902a;color:#fff;font-weight:700;text-align:center}.amp-access-laterpay-badge{text-align:center;color:#999}.amp-access-laterpay-badge a{color:#8db444}.amp-access-laterpay-header{font-size:1.2em;margin-bottom:40px}.amp-access-laterpay-metadata{width:92%}.amp-access-laterpay-title{font-size:1.1em;margin:0;padding:0}.amp-access-laterpay-description{font-size:0.9em;margin:0;padding:0}.amp-access-laterpay-price-container{margin-top:0;margin-left:auto}.amp-access-laterpay-price{font-size:1.5em}.amp-access-laterpay-currency{font-size:0.7em}.amp-access-laterpay-purchase-button{font-size:1.1em;padding:0.5em 0.8em;background-color:#8db444;border-radius:4px;border:0;color:#fff;width:70%}.amp-access-laterpay-already-purchased-link-container{font-size:0.9em}\n/*# sourceURL=/extensions/amp-access-laterpay/0.2/amp-access-laterpay.css*/", 
  function() {
  }, !1, "amp-access-laterpay");
}, $JSCompiler_StaticMethods_LaterpayVendor$$module$extensions$amp_access_laterpay$0_2$laterpay_impl_prototype$getConfigUrl_$$ = function($JSCompiler_StaticMethods_LaterpayVendor$$module$extensions$amp_access_laterpay$0_2$laterpay_impl_prototype$getConfigUrl_$self$$) {
  var $region$jscomp$1$$ = $JSCompiler_StaticMethods_LaterpayVendor$$module$extensions$amp_access_laterpay$0_2$laterpay_impl_prototype$getConfigUrl_$self$$.$D$.region || "eu";
  return _.$getMode$$module$src$mode$$().$development$ && $JSCompiler_StaticMethods_LaterpayVendor$$module$extensions$amp_access_laterpay$0_2$laterpay_impl_prototype$getConfigUrl_$self$$.$D$.configUrl ? $JSCompiler_StaticMethods_LaterpayVendor$$module$extensions$amp_access_laterpay$0_2$laterpay_impl_prototype$getConfigUrl_$self$$.$D$.configUrl : $JSCompiler_StaticMethods_LaterpayVendor$$module$extensions$amp_access_laterpay$0_2$laterpay_impl_prototype$getConfigUrl_$self$$.$D$.sandbox ? $CONFIG_URLS$$module$extensions$amp_access_laterpay$0_2$laterpay_impl$sandbox$$[$region$jscomp$1$$] : 
  $CONFIG_URLS$$module$extensions$amp_access_laterpay$0_2$laterpay_impl$live$$[$region$jscomp$1$$];
}, $JSCompiler_StaticMethods_LaterpayVendor$$module$extensions$amp_access_laterpay$0_2$laterpay_impl_prototype$getPurchaseConfig_$$ = function($JSCompiler_StaticMethods_LaterpayVendor$$module$extensions$amp_access_laterpay$0_2$laterpay_impl_prototype$getPurchaseConfig_$self$$) {
  var $url$jscomp$118$$ = $JSCompiler_StaticMethods_LaterpayVendor$$module$extensions$amp_access_laterpay$0_2$laterpay_impl_prototype$getPurchaseConfig_$self$$.$J$ + "&article_title=" + (0,window.encodeURIComponent)($JSCompiler_StaticMethods_LaterpayVendor$$module$extensions$amp_access_laterpay$0_2$laterpay_impl_prototype$getArticleTitle_$$($JSCompiler_StaticMethods_LaterpayVendor$$module$extensions$amp_access_laterpay$0_2$laterpay_impl_prototype$getPurchaseConfig_$self$$));
  return $JSCompiler_StaticMethods_LaterpayVendor$$module$extensions$amp_access_laterpay$0_2$laterpay_impl_prototype$getPurchaseConfig_$self$$.$I$.$buildUrl$($url$jscomp$118$$, !1).then(function($url$jscomp$118$$) {
    return $JSCompiler_StaticMethods_LaterpayVendor$$module$extensions$amp_access_laterpay$0_2$laterpay_impl_prototype$getPurchaseConfig_$self$$.$I$.$AccessSource$$module$extensions$amp_access$0_1$amp_access_source_prototype$getLoginUrl$($url$jscomp$118$$);
  }).then(function($url$jscomp$118$$) {
    _.$dev$$module$src$log$$().$Log$$module$src$log_prototype$info$("amp-access-laterpay", "Authorization URL: ", $url$jscomp$118$$);
    return _.$JSCompiler_StaticMethods_timeoutPromise$$($JSCompiler_StaticMethods_LaterpayVendor$$module$extensions$amp_access_laterpay$0_2$laterpay_impl_prototype$getPurchaseConfig_$self$$.$timer_$, 3000, _.$JSCompiler_StaticMethods_fetchJson$$($JSCompiler_StaticMethods_LaterpayVendor$$module$extensions$amp_access_laterpay$0_2$laterpay_impl_prototype$getPurchaseConfig_$self$$.$xhr_$, $url$jscomp$118$$, {credentials:"include"})).then(function($JSCompiler_StaticMethods_LaterpayVendor$$module$extensions$amp_access_laterpay$0_2$laterpay_impl_prototype$getPurchaseConfig_$self$$) {
      return $JSCompiler_StaticMethods_LaterpayVendor$$module$extensions$amp_access_laterpay$0_2$laterpay_impl_prototype$getPurchaseConfig_$self$$.json();
    });
  });
}, $JSCompiler_StaticMethods_parseConfigIntoOptions_$$ = function($JSCompiler_StaticMethods_parseConfigIntoOptions_$self_purchaseOptions$$, $purchaseOptionsList$$) {
  var $articleTitle$$ = $JSCompiler_StaticMethods_LaterpayVendor$$module$extensions$amp_access_laterpay$0_2$laterpay_impl_prototype$getArticleTitle_$$($JSCompiler_StaticMethods_parseConfigIntoOptions_$self_purchaseOptions$$);
  $JSCompiler_StaticMethods_parseConfigIntoOptions_$self_purchaseOptions$$ = {};
  $JSCompiler_StaticMethods_parseConfigIntoOptions_$self_purchaseOptions$$.singlePurchases = $purchaseOptionsList$$.filter(function($JSCompiler_StaticMethods_parseConfigIntoOptions_$self_purchaseOptions$$) {
    return "single_purchase" === $JSCompiler_StaticMethods_parseConfigIntoOptions_$self_purchaseOptions$$.sales_model;
  });
  $JSCompiler_StaticMethods_parseConfigIntoOptions_$self_purchaseOptions$$.singlePurchases.forEach(function($JSCompiler_StaticMethods_parseConfigIntoOptions_$self_purchaseOptions$$) {
    return $JSCompiler_StaticMethods_parseConfigIntoOptions_$self_purchaseOptions$$.description = $articleTitle$$;
  });
  $JSCompiler_StaticMethods_parseConfigIntoOptions_$self_purchaseOptions$$.timepasses = $purchaseOptionsList$$.filter(function($JSCompiler_StaticMethods_parseConfigIntoOptions_$self_purchaseOptions$$) {
    return "timepass" === $JSCompiler_StaticMethods_parseConfigIntoOptions_$self_purchaseOptions$$.sales_model;
  });
  $JSCompiler_StaticMethods_parseConfigIntoOptions_$self_purchaseOptions$$.subscriptions = $purchaseOptionsList$$.filter(function($JSCompiler_StaticMethods_parseConfigIntoOptions_$self_purchaseOptions$$) {
    return "subscription" === $JSCompiler_StaticMethods_parseConfigIntoOptions_$self_purchaseOptions$$.sales_model;
  });
  return $JSCompiler_StaticMethods_parseConfigIntoOptions_$self_purchaseOptions$$;
}, $JSCompiler_StaticMethods_LaterpayVendor$$module$extensions$amp_access_laterpay$0_2$laterpay_impl_prototype$createElement_$$ = function($JSCompiler_StaticMethods_LaterpayVendor$$module$extensions$amp_access_laterpay$0_2$laterpay_impl_prototype$createElement_$self$$, $name$jscomp$170$$) {
  return $JSCompiler_StaticMethods_LaterpayVendor$$module$extensions$amp_access_laterpay$0_2$laterpay_impl_prototype$createElement_$self$$.ampdoc.$win$.document.createElement($name$jscomp$170$$);
}, $JSCompiler_StaticMethods_LaterpayVendor$$module$extensions$amp_access_laterpay$0_2$laterpay_impl_prototype$getArticleTitle_$$ = function($JSCompiler_StaticMethods_LaterpayVendor$$module$extensions$amp_access_laterpay$0_2$laterpay_impl_prototype$getArticleTitle_$self$$) {
  return $JSCompiler_StaticMethods_LaterpayVendor$$module$extensions$amp_access_laterpay$0_2$laterpay_impl_prototype$getArticleTitle_$self$$.ampdoc.getRootNode().querySelector($JSCompiler_StaticMethods_LaterpayVendor$$module$extensions$amp_access_laterpay$0_2$laterpay_impl_prototype$getArticleTitle_$self$$.$D$.articleTitleSelector).textContent.trim();
}, $JSCompiler_StaticMethods_LaterpayVendor$$module$extensions$amp_access_laterpay$0_2$laterpay_impl_prototype$getContainer_$$ = function($JSCompiler_StaticMethods_LaterpayVendor$$module$extensions$amp_access_laterpay$0_2$laterpay_impl_prototype$getContainer_$self_dialogContainer$jscomp$2$$) {
  $JSCompiler_StaticMethods_LaterpayVendor$$module$extensions$amp_access_laterpay$0_2$laterpay_impl_prototype$getContainer_$self_dialogContainer$jscomp$2$$ = $JSCompiler_StaticMethods_LaterpayVendor$$module$extensions$amp_access_laterpay$0_2$laterpay_impl_prototype$getContainer_$self_dialogContainer$jscomp$2$$.ampdoc.getElementById("amp-access-laterpay-dialog");
  return _.$JSCompiler_StaticMethods_assertElement$$(_.$user$$module$src$log$$(), $JSCompiler_StaticMethods_LaterpayVendor$$module$extensions$amp_access_laterpay$0_2$laterpay_impl_prototype$getContainer_$self_dialogContainer$jscomp$2$$, "No element found with id amp-access-laterpay-dialog");
}, $JSCompiler_StaticMethods_LaterpayVendor$$module$extensions$amp_access_laterpay$0_2$laterpay_impl_prototype$emptyContainer_$$ = function($JSCompiler_StaticMethods_LaterpayVendor$$module$extensions$amp_access_laterpay$0_2$laterpay_impl_prototype$emptyContainer_$self$$) {
  if ($JSCompiler_StaticMethods_LaterpayVendor$$module$extensions$amp_access_laterpay$0_2$laterpay_impl_prototype$emptyContainer_$self$$.$U$) {
    return window.Promise.resolve();
  }
  for (var $unlistener$jscomp$5$$; $unlistener$jscomp$5$$ = $JSCompiler_StaticMethods_LaterpayVendor$$module$extensions$amp_access_laterpay$0_2$laterpay_impl_prototype$emptyContainer_$self$$.$Y$.shift();) {
    $unlistener$jscomp$5$$();
  }
  $JSCompiler_StaticMethods_LaterpayVendor$$module$extensions$amp_access_laterpay$0_2$laterpay_impl_prototype$emptyContainer_$self$$.$P$ && ($JSCompiler_StaticMethods_LaterpayVendor$$module$extensions$amp_access_laterpay$0_2$laterpay_impl_prototype$emptyContainer_$self$$.$P$(), $JSCompiler_StaticMethods_LaterpayVendor$$module$extensions$amp_access_laterpay$0_2$laterpay_impl_prototype$emptyContainer_$self$$.$P$ = null);
  $JSCompiler_StaticMethods_LaterpayVendor$$module$extensions$amp_access_laterpay$0_2$laterpay_impl_prototype$emptyContainer_$self$$.$O$ && ($JSCompiler_StaticMethods_LaterpayVendor$$module$extensions$amp_access_laterpay$0_2$laterpay_impl_prototype$emptyContainer_$self$$.$O$(), $JSCompiler_StaticMethods_LaterpayVendor$$module$extensions$amp_access_laterpay$0_2$laterpay_impl_prototype$emptyContainer_$self$$.$O$ = null);
  return _.$JSCompiler_StaticMethods_mutatePromise$$($JSCompiler_StaticMethods_LaterpayVendor$$module$extensions$amp_access_laterpay$0_2$laterpay_impl_prototype$emptyContainer_$self$$.$vsync_$, function() {
    $JSCompiler_StaticMethods_LaterpayVendor$$module$extensions$amp_access_laterpay$0_2$laterpay_impl_prototype$emptyContainer_$self$$.$U$ = !0;
    $JSCompiler_StaticMethods_LaterpayVendor$$module$extensions$amp_access_laterpay$0_2$laterpay_impl_prototype$emptyContainer_$self$$.$F$ = null;
    _.$removeChildren$$module$src$dom$$($JSCompiler_StaticMethods_LaterpayVendor$$module$extensions$amp_access_laterpay$0_2$laterpay_impl_prototype$getContainer_$$($JSCompiler_StaticMethods_LaterpayVendor$$module$extensions$amp_access_laterpay$0_2$laterpay_impl_prototype$emptyContainer_$self$$));
  });
}, $JSCompiler_StaticMethods_LaterpayVendor$$module$extensions$amp_access_laterpay$0_2$laterpay_impl_prototype$preselectFirstOption_$$ = function($JSCompiler_StaticMethods_LaterpayVendor$$module$extensions$amp_access_laterpay$0_2$laterpay_impl_prototype$preselectFirstOption_$self$$, $firstInput$jscomp$1_firstOption$jscomp$1$$) {
  $firstInput$jscomp$1_firstOption$jscomp$1$$ = $firstInput$jscomp$1_firstOption$jscomp$1$$.querySelector('input[type="radio"]');
  $firstInput$jscomp$1_firstOption$jscomp$1$$.checked = !0;
  $JSCompiler_StaticMethods_LaterpayVendor$$module$extensions$amp_access_laterpay$0_2$laterpay_impl_prototype$selectPurchaseOption_$$($JSCompiler_StaticMethods_LaterpayVendor$$module$extensions$amp_access_laterpay$0_2$laterpay_impl_prototype$preselectFirstOption_$self$$, $firstInput$jscomp$1_firstOption$jscomp$1$$);
}, $JSCompiler_StaticMethods_LaterpayVendor$$module$extensions$amp_access_laterpay$0_2$laterpay_impl_prototype$renderTextBlock_$$ = function($JSCompiler_StaticMethods_LaterpayVendor$$module$extensions$amp_access_laterpay$0_2$laterpay_impl_prototype$renderTextBlock_$self$$, $area$jscomp$1$$) {
  if ($JSCompiler_StaticMethods_LaterpayVendor$$module$extensions$amp_access_laterpay$0_2$laterpay_impl_prototype$renderTextBlock_$self$$.$G$[$area$jscomp$1$$]) {
    var $el$jscomp$32$$ = $JSCompiler_StaticMethods_LaterpayVendor$$module$extensions$amp_access_laterpay$0_2$laterpay_impl_prototype$createElement_$$($JSCompiler_StaticMethods_LaterpayVendor$$module$extensions$amp_access_laterpay$0_2$laterpay_impl_prototype$renderTextBlock_$self$$, "p");
    $el$jscomp$32$$.className = "amp-access-laterpay-" + $area$jscomp$1$$;
    $el$jscomp$32$$.textContent = $JSCompiler_StaticMethods_LaterpayVendor$$module$extensions$amp_access_laterpay$0_2$laterpay_impl_prototype$renderTextBlock_$self$$.$G$[$area$jscomp$1$$];
    $JSCompiler_StaticMethods_LaterpayVendor$$module$extensions$amp_access_laterpay$0_2$laterpay_impl_prototype$renderTextBlock_$self$$.$F$.appendChild($el$jscomp$32$$);
  }
}, $JSCompiler_StaticMethods_LaterpayVendor$$module$extensions$amp_access_laterpay$0_2$laterpay_impl_prototype$createLaterpayBadge_$$ = function($JSCompiler_StaticMethods_LaterpayVendor$$module$extensions$amp_access_laterpay$0_2$laterpay_impl_prototype$createLaterpayBadge_$self$$) {
  var $a$jscomp$10$$ = $JSCompiler_StaticMethods_LaterpayVendor$$module$extensions$amp_access_laterpay$0_2$laterpay_impl_prototype$createElement_$$($JSCompiler_StaticMethods_LaterpayVendor$$module$extensions$amp_access_laterpay$0_2$laterpay_impl_prototype$createLaterpayBadge_$self$$, "a");
  $a$jscomp$10$$.href = "https://blog.laterpay.net/laterpay-academy/what-is-laterpay";
  $a$jscomp$10$$.target = "_blank";
  $a$jscomp$10$$.textContent = "LaterPay";
  var $el$jscomp$33$$ = $JSCompiler_StaticMethods_LaterpayVendor$$module$extensions$amp_access_laterpay$0_2$laterpay_impl_prototype$createElement_$$($JSCompiler_StaticMethods_LaterpayVendor$$module$extensions$amp_access_laterpay$0_2$laterpay_impl_prototype$createLaterpayBadge_$self$$, "p"), $prefix$jscomp$5$$ = $JSCompiler_StaticMethods_LaterpayVendor$$module$extensions$amp_access_laterpay$0_2$laterpay_impl_prototype$createElement_$$($JSCompiler_StaticMethods_LaterpayVendor$$module$extensions$amp_access_laterpay$0_2$laterpay_impl_prototype$createLaterpayBadge_$self$$, 
  "span");
  $prefix$jscomp$5$$.textContent = $JSCompiler_StaticMethods_LaterpayVendor$$module$extensions$amp_access_laterpay$0_2$laterpay_impl_prototype$createLaterpayBadge_$self$$.$G$.laterpayBadgePrefix;
  var $suffix$jscomp$2$$ = $JSCompiler_StaticMethods_LaterpayVendor$$module$extensions$amp_access_laterpay$0_2$laterpay_impl_prototype$createElement_$$($JSCompiler_StaticMethods_LaterpayVendor$$module$extensions$amp_access_laterpay$0_2$laterpay_impl_prototype$createLaterpayBadge_$self$$, "span");
  $suffix$jscomp$2$$.textContent = $JSCompiler_StaticMethods_LaterpayVendor$$module$extensions$amp_access_laterpay$0_2$laterpay_impl_prototype$createLaterpayBadge_$self$$.$G$.laterpayBadgeSuffix;
  $el$jscomp$33$$.className = "amp-access-laterpay-badge";
  $el$jscomp$33$$.appendChild($prefix$jscomp$5$$);
  $el$jscomp$33$$.appendChild($a$jscomp$10$$);
  $el$jscomp$33$$.appendChild($suffix$jscomp$2$$);
  return $el$jscomp$33$$;
}, $JSCompiler_StaticMethods_LaterpayVendor$$module$extensions$amp_access_laterpay$0_2$laterpay_impl_prototype$createPurchaseOption_$$ = function($JSCompiler_StaticMethods_LaterpayVendor$$module$extensions$amp_access_laterpay$0_2$laterpay_impl_prototype$createPurchaseOption_$self$$, $option$jscomp$9$$) {
  var $li$jscomp$1$$ = $JSCompiler_StaticMethods_LaterpayVendor$$module$extensions$amp_access_laterpay$0_2$laterpay_impl_prototype$createElement_$$($JSCompiler_StaticMethods_LaterpayVendor$$module$extensions$amp_access_laterpay$0_2$laterpay_impl_prototype$createPurchaseOption_$self$$, "li"), $control$jscomp$1$$ = $JSCompiler_StaticMethods_LaterpayVendor$$module$extensions$amp_access_laterpay$0_2$laterpay_impl_prototype$createElement_$$($JSCompiler_StaticMethods_LaterpayVendor$$module$extensions$amp_access_laterpay$0_2$laterpay_impl_prototype$createPurchaseOption_$self$$, 
  "label");
  $control$jscomp$1$$.for = $option$jscomp$9$$.title;
  $control$jscomp$1$$.appendChild($JSCompiler_StaticMethods_LaterpayVendor$$module$extensions$amp_access_laterpay$0_2$laterpay_impl_prototype$createRadioControl_$$($JSCompiler_StaticMethods_LaterpayVendor$$module$extensions$amp_access_laterpay$0_2$laterpay_impl_prototype$createPurchaseOption_$self$$, $option$jscomp$9$$));
  var $metadataContainer$jscomp$1$$ = $JSCompiler_StaticMethods_LaterpayVendor$$module$extensions$amp_access_laterpay$0_2$laterpay_impl_prototype$createElement_$$($JSCompiler_StaticMethods_LaterpayVendor$$module$extensions$amp_access_laterpay$0_2$laterpay_impl_prototype$createPurchaseOption_$self$$, "div");
  $metadataContainer$jscomp$1$$.className = "amp-access-laterpay-metadata";
  var $description$jscomp$5_title$jscomp$16$$ = $JSCompiler_StaticMethods_LaterpayVendor$$module$extensions$amp_access_laterpay$0_2$laterpay_impl_prototype$createElement_$$($JSCompiler_StaticMethods_LaterpayVendor$$module$extensions$amp_access_laterpay$0_2$laterpay_impl_prototype$createPurchaseOption_$self$$, "span");
  $description$jscomp$5_title$jscomp$16$$.className = "amp-access-laterpay-title";
  $description$jscomp$5_title$jscomp$16$$.textContent = $option$jscomp$9$$.title;
  $metadataContainer$jscomp$1$$.appendChild($description$jscomp$5_title$jscomp$16$$);
  $description$jscomp$5_title$jscomp$16$$ = $JSCompiler_StaticMethods_LaterpayVendor$$module$extensions$amp_access_laterpay$0_2$laterpay_impl_prototype$createElement_$$($JSCompiler_StaticMethods_LaterpayVendor$$module$extensions$amp_access_laterpay$0_2$laterpay_impl_prototype$createPurchaseOption_$self$$, "p");
  $description$jscomp$5_title$jscomp$16$$.className = "amp-access-laterpay-description";
  $description$jscomp$5_title$jscomp$16$$.textContent = $option$jscomp$9$$.description;
  $metadataContainer$jscomp$1$$.appendChild($description$jscomp$5_title$jscomp$16$$);
  $control$jscomp$1$$.appendChild($metadataContainer$jscomp$1$$);
  $li$jscomp$1$$.appendChild($control$jscomp$1$$);
  $li$jscomp$1$$.appendChild($JSCompiler_StaticMethods_LaterpayVendor$$module$extensions$amp_access_laterpay$0_2$laterpay_impl_prototype$createPrice_$$($JSCompiler_StaticMethods_LaterpayVendor$$module$extensions$amp_access_laterpay$0_2$laterpay_impl_prototype$createPurchaseOption_$self$$, $option$jscomp$9$$.price));
  return $li$jscomp$1$$;
}, $JSCompiler_StaticMethods_LaterpayVendor$$module$extensions$amp_access_laterpay$0_2$laterpay_impl_prototype$createRadioControl_$$ = function($JSCompiler_StaticMethods_LaterpayVendor$$module$extensions$amp_access_laterpay$0_2$laterpay_impl_prototype$createRadioControl_$self$$, $option$jscomp$10_purchaseType$jscomp$4$$) {
  var $radio$jscomp$1$$ = $JSCompiler_StaticMethods_LaterpayVendor$$module$extensions$amp_access_laterpay$0_2$laterpay_impl_prototype$createElement_$$($JSCompiler_StaticMethods_LaterpayVendor$$module$extensions$amp_access_laterpay$0_2$laterpay_impl_prototype$createRadioControl_$self$$, "input");
  $radio$jscomp$1$$.name = "purchaseOption";
  $radio$jscomp$1$$.type = "radio";
  $radio$jscomp$1$$.id = $option$jscomp$10_purchaseType$jscomp$4$$.title;
  $radio$jscomp$1$$.value = $option$jscomp$10_purchaseType$jscomp$4$$.purchase_url;
  $option$jscomp$10_purchaseType$jscomp$4$$ = "pay_later" === $option$jscomp$10_purchaseType$jscomp$4$$.price.payment_model ? "payLater" : "payNow";
  $radio$jscomp$1$$.setAttribute("data-purchase-action-label", $JSCompiler_StaticMethods_LaterpayVendor$$module$extensions$amp_access_laterpay$0_2$laterpay_impl_prototype$createRadioControl_$self$$.$G$[$option$jscomp$10_purchaseType$jscomp$4$$ + "Button"]);
  $radio$jscomp$1$$.setAttribute("data-purchase-type", $option$jscomp$10_purchaseType$jscomp$4$$);
  $JSCompiler_StaticMethods_LaterpayVendor$$module$extensions$amp_access_laterpay$0_2$laterpay_impl_prototype$createRadioControl_$self$$.$Y$.push(_.$listen$$module$src$event_helper$$($radio$jscomp$1$$, "change", $JSCompiler_StaticMethods_LaterpayVendor$$module$extensions$amp_access_laterpay$0_2$laterpay_impl_prototype$createRadioControl_$self$$.$ba$.bind($JSCompiler_StaticMethods_LaterpayVendor$$module$extensions$amp_access_laterpay$0_2$laterpay_impl_prototype$createRadioControl_$self$$)));
  return $radio$jscomp$1$$;
}, $JSCompiler_StaticMethods_LaterpayVendor$$module$extensions$amp_access_laterpay$0_2$laterpay_impl_prototype$createPrice_$$ = function($JSCompiler_StaticMethods_LaterpayVendor$$module$extensions$amp_access_laterpay$0_2$laterpay_impl_prototype$createPrice_$self_priceEl$jscomp$1$$, $price$jscomp$1$$) {
  var $currencyEl$jscomp$1_formattedPrice$jscomp$1$$ = ($price$jscomp$1$$.amount / 100).toLocaleString($JSCompiler_StaticMethods_LaterpayVendor$$module$extensions$amp_access_laterpay$0_2$laterpay_impl_prototype$createPrice_$self_priceEl$jscomp$1$$.$aa$, {style:"decimal", minimumFractionDigits:0}), $valueEl$jscomp$1$$ = $JSCompiler_StaticMethods_LaterpayVendor$$module$extensions$amp_access_laterpay$0_2$laterpay_impl_prototype$createElement_$$($JSCompiler_StaticMethods_LaterpayVendor$$module$extensions$amp_access_laterpay$0_2$laterpay_impl_prototype$createPrice_$self_priceEl$jscomp$1$$, 
  "span");
  $valueEl$jscomp$1$$.className = "amp-access-laterpay-price";
  $valueEl$jscomp$1$$.textContent = $currencyEl$jscomp$1_formattedPrice$jscomp$1$$;
  $currencyEl$jscomp$1_formattedPrice$jscomp$1$$ = $JSCompiler_StaticMethods_LaterpayVendor$$module$extensions$amp_access_laterpay$0_2$laterpay_impl_prototype$createElement_$$($JSCompiler_StaticMethods_LaterpayVendor$$module$extensions$amp_access_laterpay$0_2$laterpay_impl_prototype$createPrice_$self_priceEl$jscomp$1$$, "sup");
  $currencyEl$jscomp$1_formattedPrice$jscomp$1$$.className = "amp-access-laterpay-currency";
  $currencyEl$jscomp$1_formattedPrice$jscomp$1$$.textContent = $price$jscomp$1$$.currency;
  $JSCompiler_StaticMethods_LaterpayVendor$$module$extensions$amp_access_laterpay$0_2$laterpay_impl_prototype$createPrice_$self_priceEl$jscomp$1$$ = $JSCompiler_StaticMethods_LaterpayVendor$$module$extensions$amp_access_laterpay$0_2$laterpay_impl_prototype$createElement_$$($JSCompiler_StaticMethods_LaterpayVendor$$module$extensions$amp_access_laterpay$0_2$laterpay_impl_prototype$createPrice_$self_priceEl$jscomp$1$$, "p");
  $JSCompiler_StaticMethods_LaterpayVendor$$module$extensions$amp_access_laterpay$0_2$laterpay_impl_prototype$createPrice_$self_priceEl$jscomp$1$$.className = "amp-access-laterpay-price-container";
  $JSCompiler_StaticMethods_LaterpayVendor$$module$extensions$amp_access_laterpay$0_2$laterpay_impl_prototype$createPrice_$self_priceEl$jscomp$1$$.appendChild($valueEl$jscomp$1$$);
  $JSCompiler_StaticMethods_LaterpayVendor$$module$extensions$amp_access_laterpay$0_2$laterpay_impl_prototype$createPrice_$self_priceEl$jscomp$1$$.appendChild($currencyEl$jscomp$1_formattedPrice$jscomp$1$$);
  return $JSCompiler_StaticMethods_LaterpayVendor$$module$extensions$amp_access_laterpay$0_2$laterpay_impl_prototype$createPrice_$self_priceEl$jscomp$1$$;
}, $JSCompiler_StaticMethods_LaterpayVendor$$module$extensions$amp_access_laterpay$0_2$laterpay_impl_prototype$createAlreadyPurchasedLink_$$ = function($JSCompiler_StaticMethods_LaterpayVendor$$module$extensions$amp_access_laterpay$0_2$laterpay_impl_prototype$createAlreadyPurchasedLink_$self$$, $href$jscomp$5$$) {
  var $p$jscomp$13$$ = $JSCompiler_StaticMethods_LaterpayVendor$$module$extensions$amp_access_laterpay$0_2$laterpay_impl_prototype$createElement_$$($JSCompiler_StaticMethods_LaterpayVendor$$module$extensions$amp_access_laterpay$0_2$laterpay_impl_prototype$createAlreadyPurchasedLink_$self$$, "p");
  $p$jscomp$13$$.className = "amp-access-laterpay-already-purchased-link-container";
  var $a$jscomp$11$$ = $JSCompiler_StaticMethods_LaterpayVendor$$module$extensions$amp_access_laterpay$0_2$laterpay_impl_prototype$createElement_$$($JSCompiler_StaticMethods_LaterpayVendor$$module$extensions$amp_access_laterpay$0_2$laterpay_impl_prototype$createAlreadyPurchasedLink_$self$$, "a");
  $a$jscomp$11$$.href = $href$jscomp$5$$;
  $a$jscomp$11$$.textContent = $JSCompiler_StaticMethods_LaterpayVendor$$module$extensions$amp_access_laterpay$0_2$laterpay_impl_prototype$createAlreadyPurchasedLink_$self$$.$G$.alreadyPurchasedLink;
  $JSCompiler_StaticMethods_LaterpayVendor$$module$extensions$amp_access_laterpay$0_2$laterpay_impl_prototype$createAlreadyPurchasedLink_$self$$.$O$ = _.$listen$$module$src$event_helper$$($a$jscomp$11$$, "click", function($p$jscomp$13$$) {
    $JSCompiler_StaticMethods_LaterpayVendor$$module$extensions$amp_access_laterpay$0_2$laterpay_impl_prototype$handlePurchase_$$($JSCompiler_StaticMethods_LaterpayVendor$$module$extensions$amp_access_laterpay$0_2$laterpay_impl_prototype$createAlreadyPurchasedLink_$self$$, $p$jscomp$13$$, $href$jscomp$5$$, "alreadyPurchased");
  });
  $p$jscomp$13$$.appendChild($a$jscomp$11$$);
  return $p$jscomp$13$$;
}, $JSCompiler_StaticMethods_LaterpayVendor$$module$extensions$amp_access_laterpay$0_2$laterpay_impl_prototype$selectPurchaseOption_$$ = function($JSCompiler_StaticMethods_LaterpayVendor$$module$extensions$amp_access_laterpay$0_2$laterpay_impl_prototype$selectPurchaseOption_$self$$, $target$jscomp$98$$) {
  var $prevPurchaseOption$jscomp$1$$ = $JSCompiler_StaticMethods_LaterpayVendor$$module$extensions$amp_access_laterpay$0_2$laterpay_impl_prototype$selectPurchaseOption_$self$$.$K$, $purchaseActionLabel$jscomp$3$$ = $target$jscomp$98$$.dataset.purchaseActionLabel;
  $prevPurchaseOption$jscomp$1$$ && $prevPurchaseOption$jscomp$1$$.classList.contains("amp-access-laterpay-selected") && $prevPurchaseOption$jscomp$1$$.classList.remove("amp-access-laterpay-selected");
  $JSCompiler_StaticMethods_LaterpayVendor$$module$extensions$amp_access_laterpay$0_2$laterpay_impl_prototype$selectPurchaseOption_$self$$.$K$ = $target$jscomp$98$$;
  $JSCompiler_StaticMethods_LaterpayVendor$$module$extensions$amp_access_laterpay$0_2$laterpay_impl_prototype$selectPurchaseOption_$self$$.$K$.classList.add("amp-access-laterpay-selected");
  $JSCompiler_StaticMethods_LaterpayVendor$$module$extensions$amp_access_laterpay$0_2$laterpay_impl_prototype$selectPurchaseOption_$self$$.$V$.textContent = $purchaseActionLabel$jscomp$3$$;
}, $JSCompiler_StaticMethods_LaterpayVendor$$module$extensions$amp_access_laterpay$0_2$laterpay_impl_prototype$handlePurchase_$$ = function($JSCompiler_StaticMethods_LaterpayVendor$$module$extensions$amp_access_laterpay$0_2$laterpay_impl_prototype$handlePurchase_$self$$, $ev$jscomp$7$$, $purchaseUrl$jscomp$1$$, $purchaseType$jscomp$5$$) {
  $ev$jscomp$7$$.preventDefault();
  $JSCompiler_StaticMethods_LaterpayVendor$$module$extensions$amp_access_laterpay$0_2$laterpay_impl_prototype$handlePurchase_$self$$.$I$.$buildUrl$($purchaseUrl$jscomp$1$$, !1).then(function($ev$jscomp$7$$) {
    "amp-access-laterpay";
    $JSCompiler_StaticMethods_LaterpayVendor$$module$extensions$amp_access_laterpay$0_2$laterpay_impl_prototype$handlePurchase_$self$$.$I$.$loginWithUrl$($ev$jscomp$7$$, $purchaseType$jscomp$5$$);
  });
};
var $CONFIG_URLS$$module$extensions$amp_access_laterpay$0_2$laterpay_impl$live$$ = {$eu$:"https://connector.laterpay.net", $us$:"https://connector.uselaterpay.com"}, $CONFIG_URLS$$module$extensions$amp_access_laterpay$0_2$laterpay_impl$sandbox$$ = {$eu$:"https://connector.sandbox.laterpaytest.net", $us$:"https://connector.sandbox.uselaterpaytest.com"}, $DEFAULT_MESSAGES$$module$extensions$amp_access_laterpay$0_2$laterpay_impl$$ = {$payLaterButton$:"Buy Now, Pay Later", $payNowButton$:"Buy Now", $defaultButton$:"Buy Now", 
$alreadyPurchasedLink$:"I already bought this", sandbox:"Site in test mode. No payment required.", $laterpayBadgePrefix$:"Powered by ", $laterpayBadgeSuffix$:""};
$LaterpayVendor$$module$extensions$amp_access_laterpay$0_2$laterpay_impl$$.prototype.$authorize$ = function() {
  var $$jscomp$this$jscomp$253$$ = this;
  return $JSCompiler_StaticMethods_LaterpayVendor$$module$extensions$amp_access_laterpay$0_2$laterpay_impl_prototype$getPurchaseConfig_$$(this).then(function($response$jscomp$28$$) {
    if (204 === $response$jscomp$28$$.status) {
      throw _.$user$$module$src$log$$().$createError$("No merchant domains have been matched for this article, or no paid content configurations are setup.");
    }
    $$jscomp$this$jscomp$253$$.$D$.scrollToTopAfterAuth && $$jscomp$this$jscomp$253$$.$vsync_$.$mutate$(function() {
      return _.$JSCompiler_StaticMethods_Viewport$$module$src$service$viewport$viewport_impl_prototype$setScrollTop$$($$jscomp$this$jscomp$253$$.$viewport_$, 0);
    });
    $JSCompiler_StaticMethods_LaterpayVendor$$module$extensions$amp_access_laterpay$0_2$laterpay_impl_prototype$emptyContainer_$$($$jscomp$this$jscomp$253$$);
    return {$access$:$response$jscomp$28$$.$access$};
  }, function($err$jscomp$29$$) {
    if (!$err$jscomp$29$$ || !$err$jscomp$29$$.response) {
      throw $err$jscomp$29$$;
    }
    var $response$jscomp$29$$ = $err$jscomp$29$$.response;
    if (402 !== $response$jscomp$29$$.status) {
      throw $err$jscomp$29$$;
    }
    return $response$jscomp$29$$.json().catch(function() {
    }).then(function($err$jscomp$29$$) {
      $$jscomp$this$jscomp$253$$.$W$ = $err$jscomp$29$$;
      $$jscomp$this$jscomp$253$$.$R$ = $JSCompiler_StaticMethods_parseConfigIntoOptions_$$($$jscomp$this$jscomp$253$$, $err$jscomp$29$$.$purchase_options$);
      $JSCompiler_StaticMethods_LaterpayVendor$$module$extensions$amp_access_laterpay$0_2$laterpay_impl_prototype$emptyContainer_$$($$jscomp$this$jscomp$253$$).then($$jscomp$this$jscomp$253$$.$ea$.bind($$jscomp$this$jscomp$253$$));
      return {$access$:!1};
    });
  });
};
$LaterpayVendor$$module$extensions$amp_access_laterpay$0_2$laterpay_impl$$.prototype.$ea$ = function() {
  var $$jscomp$this$jscomp$256$$ = this, $dialogContainer$jscomp$3$$ = $JSCompiler_StaticMethods_LaterpayVendor$$module$extensions$amp_access_laterpay$0_2$laterpay_impl_prototype$getContainer_$$(this);
  this.$F$ = $JSCompiler_StaticMethods_LaterpayVendor$$module$extensions$amp_access_laterpay$0_2$laterpay_impl_prototype$createElement_$$(this, "div");
  this.$F$.className = "amp-access-laterpay-container";
  this.$D$.sandbox && $JSCompiler_StaticMethods_LaterpayVendor$$module$extensions$amp_access_laterpay$0_2$laterpay_impl_prototype$renderTextBlock_$$(this, "sandbox");
  $JSCompiler_StaticMethods_LaterpayVendor$$module$extensions$amp_access_laterpay$0_2$laterpay_impl_prototype$renderTextBlock_$$(this, "header");
  var $listContainer$jscomp$1$$ = $JSCompiler_StaticMethods_LaterpayVendor$$module$extensions$amp_access_laterpay$0_2$laterpay_impl_prototype$createElement_$$(this, "ul");
  this.$R$.singlePurchases.forEach(function($dialogContainer$jscomp$3$$) {
    $listContainer$jscomp$1$$.appendChild($JSCompiler_StaticMethods_LaterpayVendor$$module$extensions$amp_access_laterpay$0_2$laterpay_impl_prototype$createPurchaseOption_$$($$jscomp$this$jscomp$256$$, $dialogContainer$jscomp$3$$));
  });
  this.$R$.timepasses.forEach(function($dialogContainer$jscomp$3$$) {
    $listContainer$jscomp$1$$.appendChild($JSCompiler_StaticMethods_LaterpayVendor$$module$extensions$amp_access_laterpay$0_2$laterpay_impl_prototype$createPurchaseOption_$$($$jscomp$this$jscomp$256$$, $dialogContainer$jscomp$3$$));
  });
  this.$R$.subscriptions.forEach(function($dialogContainer$jscomp$3$$) {
    $listContainer$jscomp$1$$.appendChild($JSCompiler_StaticMethods_LaterpayVendor$$module$extensions$amp_access_laterpay$0_2$laterpay_impl_prototype$createPurchaseOption_$$($$jscomp$this$jscomp$256$$, $dialogContainer$jscomp$3$$));
  });
  var $purchaseButton$jscomp$1$$ = $JSCompiler_StaticMethods_LaterpayVendor$$module$extensions$amp_access_laterpay$0_2$laterpay_impl_prototype$createElement_$$(this, "button");
  $purchaseButton$jscomp$1$$.className = "amp-access-laterpay-purchase-button";
  $purchaseButton$jscomp$1$$.textContent = this.$G$.defaultButton;
  this.$V$ = $purchaseButton$jscomp$1$$;
  this.$P$ = _.$listen$$module$src$event_helper$$($purchaseButton$jscomp$1$$, "click", function($dialogContainer$jscomp$3$$) {
    $JSCompiler_StaticMethods_LaterpayVendor$$module$extensions$amp_access_laterpay$0_2$laterpay_impl_prototype$handlePurchase_$$($$jscomp$this$jscomp$256$$, $dialogContainer$jscomp$3$$, $$jscomp$this$jscomp$256$$.$K$.value, $$jscomp$this$jscomp$256$$.$K$.dataset.purchaseType);
  });
  this.$F$.appendChild($listContainer$jscomp$1$$);
  this.$F$.appendChild($purchaseButton$jscomp$1$$);
  this.$F$.appendChild($JSCompiler_StaticMethods_LaterpayVendor$$module$extensions$amp_access_laterpay$0_2$laterpay_impl_prototype$createAlreadyPurchasedLink_$$(this, this.$W$.identify_url));
  $JSCompiler_StaticMethods_LaterpayVendor$$module$extensions$amp_access_laterpay$0_2$laterpay_impl_prototype$renderTextBlock_$$(this, "footer");
  $dialogContainer$jscomp$3$$.appendChild(this.$F$);
  $dialogContainer$jscomp$3$$.appendChild($JSCompiler_StaticMethods_LaterpayVendor$$module$extensions$amp_access_laterpay$0_2$laterpay_impl_prototype$createLaterpayBadge_$$(this));
  this.$U$ = !1;
  $JSCompiler_StaticMethods_LaterpayVendor$$module$extensions$amp_access_laterpay$0_2$laterpay_impl_prototype$preselectFirstOption_$$(this, $listContainer$jscomp$1$$.firstElementChild);
};
$LaterpayVendor$$module$extensions$amp_access_laterpay$0_2$laterpay_impl$$.prototype.$ba$ = function($ev$jscomp$6$$) {
  $ev$jscomp$6$$.preventDefault();
  $JSCompiler_StaticMethods_LaterpayVendor$$module$extensions$amp_access_laterpay$0_2$laterpay_impl_prototype$selectPurchaseOption_$$(this, $ev$jscomp$6$$.target);
};
$LaterpayVendor$$module$extensions$amp_access_laterpay$0_2$laterpay_impl$$.prototype.$AccessClientAdapter$$module$extensions$amp_access$0_1$amp_access_client_prototype$pingback$ = function() {
  return window.Promise.resolve();
};
(function($AMP$jscomp$4$$) {
  $AMP$jscomp$4$$.registerServiceForDoc("laterpay", function($AMP$jscomp$4$$) {
    return _.$Services$$module$src$services$accessServiceForDoc$$($AMP$jscomp$4$$.$getHeadNode$()).then(function($AMP$jscomp$4$$) {
      var $ampdoc$jscomp$110$$ = $AMP$jscomp$4$$.$getVendorSource$("laterpay");
      $AMP$jscomp$4$$ = new $LaterpayVendor$$module$extensions$amp_access_laterpay$0_2$laterpay_impl$$($AMP$jscomp$4$$, $ampdoc$jscomp$110$$);
      $ampdoc$jscomp$110$$.$D$.$registerVendor$($AMP$jscomp$4$$);
      return $AMP$jscomp$4$$;
    });
  });
})(window.self.AMP);

})});
