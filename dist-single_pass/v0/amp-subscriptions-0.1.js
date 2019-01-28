(self.AMP=self.AMP||[]).push({n:"amp-subscriptions",i:["_base_i","_base_misc"],v:"1901181729101",f:(function(AMP,_){
var $isStoryDocument$$module$src$utils$story$$ = function($ampdoc$jscomp$99$$) {
  return new window.Promise(function($resolve$jscomp$43$$) {
    $ampdoc$jscomp$99$$.$whenBodyAvailable$().then(function() {
      var $body$jscomp$13$$ = $ampdoc$jscomp$99$$.$getBody$();
      _.$waitForChild$$module$src$dom$$($body$jscomp$13$$, function() {
        return !!$body$jscomp$13$$.firstElementChild;
      }, function() {
        $resolve$jscomp$43$$("AMP-STORY" === $body$jscomp$13$$.firstElementChild.tagName);
      });
    });
  });
}, $isDocumentReady$$module$third_party$subscriptions_project$config$$ = function($doc$jscomp$67_readyState$$) {
  $doc$jscomp$67_readyState$$ = $doc$jscomp$67_readyState$$.readyState;
  return "loading" != $doc$jscomp$67_readyState$$ && "uninitialized" != $doc$jscomp$67_readyState$$;
}, $onDocumentState$$module$third_party$subscriptions_project$config$$ = function($doc$jscomp$69$$, $callback$jscomp$103$$) {
  var $ready$jscomp$1$$ = $isDocumentReady$$module$third_party$subscriptions_project$config$$($doc$jscomp$69$$);
  if ($ready$jscomp$1$$) {
    $callback$jscomp$103$$($doc$jscomp$69$$);
  } else {
    var $readyListener$jscomp$1$$ = function() {
      $isDocumentReady$$module$third_party$subscriptions_project$config$$($doc$jscomp$69$$) && ($ready$jscomp$1$$ || ($ready$jscomp$1$$ = !0, $callback$jscomp$103$$($doc$jscomp$69$$)), $doc$jscomp$69$$.removeEventListener("readystatechange", $readyListener$jscomp$1$$));
    };
    $doc$jscomp$69$$.addEventListener("readystatechange", $readyListener$jscomp$1$$);
  }
}, $whenDocumentReady$$module$third_party$subscriptions_project$config$$ = function($doc$jscomp$70$$) {
  return new window.Promise(function($resolve$jscomp$44$$) {
    $onDocumentState$$module$third_party$subscriptions_project$config$$($doc$jscomp$70$$, $resolve$jscomp$44$$);
  });
}, $GlobalDoc$$module$third_party$subscriptions_project$config$$ = function($winOrDoc$$) {
  var $isWin$$ = !!$winOrDoc$$.document;
  this.$D$ = $isWin$$ ? $winOrDoc$$ : $winOrDoc$$.defaultView;
  this.$doc_$ = $isWin$$ ? $winOrDoc$$.document : $winOrDoc$$;
}, $PageConfig$$module$third_party$subscriptions_project$config$$ = function($productOrPublicationId_publicationId$$, $locked$$) {
  var $div$jscomp$2_label$jscomp$8$$ = $productOrPublicationId_publicationId$$.indexOf(":");
  if (-1 != $div$jscomp$2_label$jscomp$8$$) {
    var $productId$$ = $productOrPublicationId_publicationId$$;
    $productOrPublicationId_publicationId$$ = $productId$$.substring(0, $div$jscomp$2_label$jscomp$8$$);
    $div$jscomp$2_label$jscomp$8$$ = $productId$$.substring($div$jscomp$2_label$jscomp$8$$ + 1);
    if ("*" == $div$jscomp$2_label$jscomp$8$$) {
      throw Error("wildcard disallowed");
    }
  } else {
    $div$jscomp$2_label$jscomp$8$$ = $productId$$ = null;
  }
  this.$PageConfig$$module$third_party$subscriptions_project$config$publicationId_$ = $productOrPublicationId_publicationId$$;
  this.$PageConfig$$module$third_party$subscriptions_project$config$productId_$ = $productId$$;
  this.$label_$ = $div$jscomp$2_label$jscomp$8$$;
  this.$locked_$ = $locked$$;
}, $JsonLdParser$$module$third_party$subscriptions_project$config$$ = function($doc$jscomp$72$$) {
  this.$doc_$ = $doc$jscomp$72$$;
}, $JSCompiler_StaticMethods_valueArray_$$ = function($json$jscomp$7_value$jscomp$159$$, $name$jscomp$165$$) {
  $json$jscomp$7_value$jscomp$159$$ = $json$jscomp$7_value$jscomp$159$$[$name$jscomp$165$$];
  return null == $json$jscomp$7_value$jscomp$159$$ || "" === $json$jscomp$7_value$jscomp$159$$ ? null : Array.isArray($json$jscomp$7_value$jscomp$159$$) ? $json$jscomp$7_value$jscomp$159$$ : [$json$jscomp$7_value$jscomp$159$$];
}, $JSCompiler_StaticMethods_singleValue_$$ = function($json$jscomp$8_value$jscomp$160_valueArray$$, $name$jscomp$166$$) {
  $json$jscomp$8_value$jscomp$160_valueArray$$ = ($json$jscomp$8_value$jscomp$160_valueArray$$ = $JSCompiler_StaticMethods_valueArray_$$($json$jscomp$8_value$jscomp$160_valueArray$$, $name$jscomp$166$$)) && $json$jscomp$8_value$jscomp$160_valueArray$$[0];
  return null == $json$jscomp$8_value$jscomp$160_valueArray$$ || "" === $json$jscomp$8_value$jscomp$160_valueArray$$ ? null : $json$jscomp$8_value$jscomp$160_valueArray$$;
}, $JSCompiler_StaticMethods_checkType_$$ = function($json$jscomp$9_typeArray$$, $expectedType$$) {
  return ($json$jscomp$9_typeArray$$ = $JSCompiler_StaticMethods_valueArray_$$($json$jscomp$9_typeArray$$, "@type")) ? $json$jscomp$9_typeArray$$.includes($expectedType$$) || $json$jscomp$9_typeArray$$.includes("http://schema.org/" + $expectedType$$) : !1;
}, $MicrodataParser$$module$third_party$subscriptions_project$config$$ = function($doc$jscomp$73$$) {
  this.$doc_$ = $doc$jscomp$73$$;
  this.$MicrodataParser$$module$third_party$subscriptions_project$config$productId_$ = this.$MicrodataParser$$module$third_party$subscriptions_project$config$access_$ = null;
}, $JSCompiler_StaticMethods_isValidElement_$$ = function($current$jscomp$4_node$jscomp$58$$, $alreadySeen$$) {
  for (; $current$jscomp$4_node$jscomp$58$$ && !$current$jscomp$4_node$jscomp$58$$[$alreadySeen$$]; $current$jscomp$4_node$jscomp$58$$ = $current$jscomp$4_node$jscomp$58$$.parentNode) {
    if ($current$jscomp$4_node$jscomp$58$$[$alreadySeen$$] = !0, $current$jscomp$4_node$jscomp$58$$.hasAttribute("itemscope")) {
      if (0 <= $current$jscomp$4_node$jscomp$58$$.getAttribute("itemtype").indexOf("http://schema.org/NewsArticle")) {
        return !0;
      }
      break;
    }
  }
  return !1;
}, $JSCompiler_StaticMethods_getPageConfig_$$ = function($JSCompiler_StaticMethods_getPageConfig_$self$$) {
  var $locked$jscomp$2$$ = null;
  null != $JSCompiler_StaticMethods_getPageConfig_$self$$.$MicrodataParser$$module$third_party$subscriptions_project$config$access_$ ? $locked$jscomp$2$$ = !$JSCompiler_StaticMethods_getPageConfig_$self$$.$MicrodataParser$$module$third_party$subscriptions_project$config$access_$ : $JSCompiler_StaticMethods_getPageConfig_$self$$.$doc_$.$Doc$$module$third_party$subscriptions_project$config_prototype$isReady$() && ($locked$jscomp$2$$ = !1);
  return null != $JSCompiler_StaticMethods_getPageConfig_$self$$.$MicrodataParser$$module$third_party$subscriptions_project$config$productId_$ && null != $locked$jscomp$2$$ ? new $PageConfig$$module$third_party$subscriptions_project$config$$($JSCompiler_StaticMethods_getPageConfig_$self$$.$MicrodataParser$$module$third_party$subscriptions_project$config$productId_$, $locked$jscomp$2$$) : null;
}, $getMetaTag$$module$third_party$subscriptions_project$config$$ = function($el$jscomp$28_rootNode$jscomp$5$$, $name$jscomp$167$$) {
  return ($el$jscomp$28_rootNode$jscomp$5$$ = $el$jscomp$28_rootNode$jscomp$5$$.querySelector('meta[name="' + $name$jscomp$167$$ + '"]')) ? $el$jscomp$28_rootNode$jscomp$5$$.getAttribute("content") : null;
}, $MetaParser$$module$third_party$subscriptions_project$config$$ = function($doc$jscomp$71$$) {
  this.$doc_$ = $doc$jscomp$71$$;
}, $PageConfigResolver$$module$third_party$subscriptions_project$config$$ = function($winOrDoc$jscomp$1$$) {
  var $$jscomp$this$jscomp$231$$ = this;
  this.$doc_$ = 9 === $winOrDoc$jscomp$1$$.nodeType ? new $GlobalDoc$$module$third_party$subscriptions_project$config$$($winOrDoc$jscomp$1$$) : $winOrDoc$jscomp$1$$.document ? new $GlobalDoc$$module$third_party$subscriptions_project$config$$($winOrDoc$jscomp$1$$) : $winOrDoc$jscomp$1$$;
  this.$D$ = null;
  this.$G$ = new window.Promise(function($winOrDoc$jscomp$1$$) {
    $$jscomp$this$jscomp$231$$.$D$ = $winOrDoc$jscomp$1$$;
  });
  this.$J$ = new $MetaParser$$module$third_party$subscriptions_project$config$$(this.$doc_$);
  this.$I$ = new $JsonLdParser$$module$third_party$subscriptions_project$config$$(this.$doc_$);
  this.$K$ = new $MicrodataParser$$module$third_party$subscriptions_project$config$$(this.$doc_$);
}, $JSCompiler_StaticMethods_resolveConfig$$ = function($JSCompiler_StaticMethods_resolveConfig$self$$) {
  window.Promise.resolve().then($JSCompiler_StaticMethods_resolveConfig$self$$.$F$.bind($JSCompiler_StaticMethods_resolveConfig$self$$));
  $JSCompiler_StaticMethods_resolveConfig$self$$.$doc_$.$whenReady$().then($JSCompiler_StaticMethods_resolveConfig$self$$.$F$.bind($JSCompiler_StaticMethods_resolveConfig$self$$));
  return $JSCompiler_StaticMethods_resolveConfig$self$$.$G$;
}, $SubscriptionAnalytics$$module$extensions$amp_subscriptions$0_1$analytics$$ = function($element$jscomp$269$$) {
  this.$element_$ = $element$jscomp$269$$;
}, $Entitlement$$module$extensions$amp_subscriptions$0_1$entitlement$empty$$ = function($service$jscomp$21$$) {
  return new _.$Entitlement$$module$extensions$amp_subscriptions$0_1$entitlement$$({source:"", raw:"", $service$:$service$jscomp$21$$, $granted$:!1});
}, $Entitlement$$module$extensions$amp_subscriptions$0_1$entitlement$parseFromJson$$ = function($json$jscomp$10$$) {
  $json$jscomp$10$$ || ($json$jscomp$10$$ = {});
  var $raw$jscomp$1$$ = JSON.stringify($json$jscomp$10$$);
  return new _.$Entitlement$$module$extensions$amp_subscriptions$0_1$entitlement$$({source:$json$jscomp$10$$.source || "", raw:$raw$jscomp$1$$, $service$:"", $granted$:$json$jscomp$10$$.granted || !1, $grantReason$:$json$jscomp$10$$.grantReason, $dataObject$:$json$jscomp$10$$.data || null});
}, $Dialog$$module$extensions$amp_subscriptions$0_1$dialog$$ = function($ampdoc$jscomp$213_doc$jscomp$160$$) {
  var $$jscomp$this$jscomp$1222$$ = this;
  this.$ampdoc_$ = $ampdoc$jscomp$213_doc$jscomp$160$$;
  this.$vsync_$ = _.$Services$$module$src$services$vsyncFor$$($ampdoc$jscomp$213_doc$jscomp$160$$.$win$);
  this.$timer_$ = _.$Services$$module$src$services$timerFor$$($ampdoc$jscomp$213_doc$jscomp$160$$.$win$);
  this.$viewport_$ = _.$Services$$module$src$services$viewportForDoc$$($ampdoc$jscomp$213_doc$jscomp$160$$);
  this.$visible_$ = !1;
  this.$content_$ = null;
  this.$G$ = window.Promise.resolve();
  $ampdoc$jscomp$213_doc$jscomp$160$$ = this.$ampdoc_$.$win$.document;
  this.$D$ = _.$createElementWithAttributes$$module$src$dom$$($ampdoc$jscomp$213_doc$jscomp$160$$, "amp-subscriptions-dialog", {role:"dialog"});
  _.$toggle$$module$src$style$$(this.$D$, !1);
  this.$F$ = _.$createElementWithAttributes$$module$src$dom$$($ampdoc$jscomp$213_doc$jscomp$160$$, "button", {"class":"i-amphtml-subs-dialog-close-button"});
  _.$toggle$$module$src$style$$(this.$F$, !1);
  this.$D$.appendChild(this.$F$);
  this.$F$.addEventListener("click", function() {
    $$jscomp$this$jscomp$1222$$.close();
  });
  this.$ampdoc_$.$getBody$().appendChild(this.$D$);
  _.$setImportantStyles$$module$src$style$$(this.$D$, {transform:"translateY(100%)"});
}, $JSCompiler_StaticMethods_Dialog$$module$extensions$amp_subscriptions$0_1$dialog_prototype$close_$$ = function($JSCompiler_StaticMethods_Dialog$$module$extensions$amp_subscriptions$0_1$dialog_prototype$close_$self$$) {
  return $JSCompiler_StaticMethods_Dialog$$module$extensions$amp_subscriptions$0_1$dialog_prototype$close_$self$$.$visible_$ ? _.$JSCompiler_StaticMethods_mutatePromise$$($JSCompiler_StaticMethods_Dialog$$module$extensions$amp_subscriptions$0_1$dialog_prototype$close_$self$$.$vsync_$, function() {
    _.$setImportantStyles$$module$src$style$$($JSCompiler_StaticMethods_Dialog$$module$extensions$amp_subscriptions$0_1$dialog_prototype$close_$self$$.$D$, {transform:"translateY(100%)"});
    return $JSCompiler_StaticMethods_Dialog$$module$extensions$amp_subscriptions$0_1$dialog_prototype$close_$self$$.$timer_$.$promise$(300);
  }).then(function() {
    return _.$JSCompiler_StaticMethods_mutatePromise$$($JSCompiler_StaticMethods_Dialog$$module$extensions$amp_subscriptions$0_1$dialog_prototype$close_$self$$.$vsync_$, function() {
      _.$toggle$$module$src$style$$($JSCompiler_StaticMethods_Dialog$$module$extensions$amp_subscriptions$0_1$dialog_prototype$close_$self$$.$D$, !1);
      _.$JSCompiler_StaticMethods_updatePaddingBottom$$($JSCompiler_StaticMethods_Dialog$$module$extensions$amp_subscriptions$0_1$dialog_prototype$close_$self$$.$viewport_$, 0);
      $JSCompiler_StaticMethods_Dialog$$module$extensions$amp_subscriptions$0_1$dialog_prototype$close_$self$$.$visible_$ = !1;
    });
  }) : window.Promise.resolve();
}, $Actions$$module$extensions$amp_subscriptions$0_1$actions$$ = function($ampdoc$jscomp$214$$, $urlBuilder$$, $analytics$jscomp$4$$, $actionMap$jscomp$3$$) {
  for (var $k$jscomp$80$$ in $actionMap$jscomp$3$$) {
  }
  this.$F$ = $actionMap$jscomp$3$$;
  this.$G$ = {};
  this.$J$ = $urlBuilder$$;
  this.$analytics_$ = $analytics$jscomp$4$$;
  this.$D$ = null;
  this.$I$ = 0;
  this.$K$ = _.$openLoginDialog$$module$extensions$amp_access$0_1$login_dialog$$.bind(null, $ampdoc$jscomp$214$$);
  this.$build$();
}, $JSCompiler_StaticMethods_Actions$$module$extensions$amp_subscriptions$0_1$actions_prototype$execute_$$ = function($JSCompiler_StaticMethods_Actions$$module$extensions$amp_subscriptions$0_1$actions_prototype$execute_$self$$, $url$jscomp$240$$, $action$jscomp$29$$) {
  var $now$jscomp$28$$ = Date.now();
  if ($JSCompiler_StaticMethods_Actions$$module$extensions$amp_subscriptions$0_1$actions_prototype$execute_$self$$.$D$ && 1000 > $now$jscomp$28$$ - $JSCompiler_StaticMethods_Actions$$module$extensions$amp_subscriptions$0_1$actions_prototype$execute_$self$$.$I$) {
    return $JSCompiler_StaticMethods_Actions$$module$extensions$amp_subscriptions$0_1$actions_prototype$execute_$self$$.$D$;
  }
  "amp-subscriptions";
  $JSCompiler_StaticMethods_Actions$$module$extensions$amp_subscriptions$0_1$actions_prototype$execute_$self$$.$analytics_$.$F$("local", $action$jscomp$29$$, "started");
  var $actionPromise$$ = $JSCompiler_StaticMethods_Actions$$module$extensions$amp_subscriptions$0_1$actions_prototype$execute_$self$$.$K$($url$jscomp$240$$).then(function($url$jscomp$240$$) {
    "amp-subscriptions";
    $JSCompiler_StaticMethods_Actions$$module$extensions$amp_subscriptions$0_1$actions_prototype$execute_$self$$.$D$ = null;
    $url$jscomp$240$$ = _.$parseQueryString_$$module$src$url_parse_query_string$$($url$jscomp$240$$).success;
    var $now$jscomp$28$$ = "true" == $url$jscomp$240$$ || "yes" == $url$jscomp$240$$ || "1" == $url$jscomp$240$$;
    $now$jscomp$28$$ ? $JSCompiler_StaticMethods_Actions$$module$extensions$amp_subscriptions$0_1$actions_prototype$execute_$self$$.$analytics_$.$F$("local", $action$jscomp$29$$, "success") : $JSCompiler_StaticMethods_Actions$$module$extensions$amp_subscriptions$0_1$actions_prototype$execute_$self$$.$analytics_$.$F$("local", $action$jscomp$29$$, "rejected");
    return $now$jscomp$28$$ || !$url$jscomp$240$$;
  }).catch(function($url$jscomp$240$$) {
    "amp-subscriptions";
    $JSCompiler_StaticMethods_Actions$$module$extensions$amp_subscriptions$0_1$actions_prototype$execute_$self$$.$analytics_$.$F$("local", $action$jscomp$29$$, "failed");
    $JSCompiler_StaticMethods_Actions$$module$extensions$amp_subscriptions$0_1$actions_prototype$execute_$self$$.$D$ == $actionPromise$$ && ($JSCompiler_StaticMethods_Actions$$module$extensions$amp_subscriptions$0_1$actions_prototype$execute_$self$$.$D$ = null);
    throw $url$jscomp$240$$;
  });
  $JSCompiler_StaticMethods_Actions$$module$extensions$amp_subscriptions$0_1$actions_prototype$execute_$self$$.$D$ = $actionPromise$$;
  $JSCompiler_StaticMethods_Actions$$module$extensions$amp_subscriptions$0_1$actions_prototype$execute_$self$$.$I$ = $now$jscomp$28$$;
  return $JSCompiler_StaticMethods_Actions$$module$extensions$amp_subscriptions$0_1$actions_prototype$execute_$self$$.$D$;
}, $evaluateExpr$$module$extensions$amp_subscriptions$0_1$expr$$ = function($expr$jscomp$17$$, $data$jscomp$210$$) {
  return _.$evaluateAccessExpr$$module$extensions$amp_access$0_1$access_expr$$($expr$jscomp$17$$, $data$jscomp$210$$);
}, $LocalSubscriptionPlatformRenderer$$module$extensions$amp_subscriptions$0_1$local_subscription_platform_renderer$$ = function($ampdoc$jscomp$215$$, $dialog$jscomp$3$$, $serviceAdapter$jscomp$3$$) {
  this.$ampdoc_$ = $ampdoc$jscomp$215$$;
  this.$F$ = $ampdoc$jscomp$215$$.getRootNode();
  this.$D$ = $dialog$jscomp$3$$;
  this.$templates_$ = _.$Services$$module$src$services$templatesFor$$($ampdoc$jscomp$215$$.$win$);
  this.$G$ = $serviceAdapter$jscomp$3$$;
}, $JSCompiler_StaticMethods_renderActions_$$ = function($JSCompiler_StaticMethods_renderActions_$self$$, $renderState$jscomp$1$$) {
  $JSCompiler_StaticMethods_renderActionsInNode_$$($JSCompiler_StaticMethods_renderActions_$self$$, $renderState$jscomp$1$$, $JSCompiler_StaticMethods_renderActions_$self$$.$F$, $evaluateExpr$$module$extensions$amp_subscriptions$0_1$expr$$);
}, $JSCompiler_StaticMethods_renderDialog_$$ = function($JSCompiler_StaticMethods_renderDialog_$self$$, $authResponse$jscomp$1$$) {
  return $JSCompiler_StaticMethods_renderDialog_$self$$.$ampdoc_$.$whenReady$().then(function() {
    for (var $candidates$$ = $JSCompiler_StaticMethods_renderDialog_$self$$.$ampdoc_$.getRootNode().querySelectorAll("[subscriptions-dialog][subscriptions-display]"), $i$357$$ = 0; $i$357$$ < $candidates$$.length; $i$357$$++) {
      var $candidate$jscomp$3$$ = $candidates$$[$i$357$$], $expr$jscomp$18$$ = $candidate$jscomp$3$$.getAttribute("subscriptions-display");
      if ($expr$jscomp$18$$ && _.$evaluateAccessExpr$$module$extensions$amp_access$0_1$access_expr$$($expr$jscomp$18$$, $authResponse$jscomp$1$$)) {
        return $candidate$jscomp$3$$;
      }
    }
  }).then(function($candidate$jscomp$4_clone$jscomp$5$$) {
    if ($candidate$jscomp$4_clone$jscomp$5$$) {
      if ("TEMPLATE" == $candidate$jscomp$4_clone$jscomp$5$$.tagName) {
        return _.$JSCompiler_StaticMethods_Templates$$module$src$service$template_impl_prototype$renderTemplate$$($JSCompiler_StaticMethods_renderDialog_$self$$.$templates_$, $candidate$jscomp$4_clone$jscomp$5$$, $authResponse$jscomp$1$$).then(function($candidate$jscomp$4_clone$jscomp$5$$) {
          return $JSCompiler_StaticMethods_renderActionsInNode_$$($JSCompiler_StaticMethods_renderDialog_$self$$, $authResponse$jscomp$1$$, $candidate$jscomp$4_clone$jscomp$5$$, $evaluateExpr$$module$extensions$amp_subscriptions$0_1$expr$$);
        });
      }
      $candidate$jscomp$4_clone$jscomp$5$$ = $candidate$jscomp$4_clone$jscomp$5$$.cloneNode(!0);
      $candidate$jscomp$4_clone$jscomp$5$$.removeAttribute("subscriptions-dialog");
      $candidate$jscomp$4_clone$jscomp$5$$.removeAttribute("subscriptions-display");
      return $candidate$jscomp$4_clone$jscomp$5$$;
    }
  }).then(function($authResponse$jscomp$1$$) {
    if ($authResponse$jscomp$1$$) {
      return $JSCompiler_StaticMethods_renderDialog_$self$$.$D$.open($authResponse$jscomp$1$$, !0);
    }
  });
}, $JSCompiler_StaticMethods_renderActionsInNode_$$ = function($JSCompiler_StaticMethods_renderActionsInNode_$self$$, $renderState$jscomp$3$$, $rootNode$jscomp$11$$, $evaluateExpr$$) {
  return $JSCompiler_StaticMethods_renderActionsInNode_$self$$.$ampdoc_$.$whenReady$().then(function() {
    for (var $actionCandidates$$ = $rootNode$jscomp$11$$.querySelectorAll('[subscriptions-action], [subscriptions-section="actions"], [subscriptions-actions]'), $i$358$$ = 0; $i$358$$ < $actionCandidates$$.length; $i$358$$++) {
      var $candidate$jscomp$5$$ = $actionCandidates$$[$i$358$$], $expr$jscomp$19_serviceId$jscomp$inline_4942$$ = $candidate$jscomp$5$$.getAttribute("subscriptions-display");
      if ($expr$jscomp$19_serviceId$jscomp$inline_4942$$ && $evaluateExpr$$($expr$jscomp$19_serviceId$jscomp$inline_4942$$, $renderState$jscomp$3$$)) {
        if ($candidate$jscomp$5$$.classList.add("i-amphtml-subs-display"), $candidate$jscomp$5$$.getAttribute("subscriptions-service") && $candidate$jscomp$5$$.getAttribute("subscriptions-action") && "false" !== $candidate$jscomp$5$$.getAttribute("subscriptions-decorate") && !$candidate$jscomp$5$$.hasAttribute("i-amphtml-subs-decorated")) {
          $expr$jscomp$19_serviceId$jscomp$inline_4942$$ = $candidate$jscomp$5$$.getAttribute("subscriptions-service");
          var $action$jscomp$inline_4943$$ = $candidate$jscomp$5$$.getAttribute("subscriptions-action");
          $JSCompiler_StaticMethods_SubscriptionService$$module$extensions$amp_subscriptions$0_1$amp_subscriptions_prototype$decorateServiceAction$$($JSCompiler_StaticMethods_renderActionsInNode_$self$$.$G$.$D$, $candidate$jscomp$5$$, $expr$jscomp$19_serviceId$jscomp$inline_4942$$, $action$jscomp$inline_4943$$);
          $candidate$jscomp$5$$.setAttribute("i-amphtml-subs-decorated", !0);
        }
      } else {
        $candidate$jscomp$5$$.classList.remove("i-amphtml-subs-display");
      }
    }
    return $rootNode$jscomp$11$$;
  });
}, $UrlBuilder$$module$extensions$amp_subscriptions$0_1$url_builder$$ = function($ampdoc$jscomp$216$$, $readerIdPromise$$) {
  this.$urlReplacements_$ = _.$Services$$module$src$services$urlReplacementsForDoc$$($ampdoc$jscomp$216$$.$getHeadNode$());
  this.$F$ = $readerIdPromise$$;
  this.$D$ = null;
}, $JSCompiler_StaticMethods_UrlBuilder$$module$extensions$amp_subscriptions$0_1$url_builder_prototype$prepareUrlVars_$$ = function($JSCompiler_StaticMethods_UrlBuilder$$module$extensions$amp_subscriptions$0_1$url_builder_prototype$prepareUrlVars_$self$$, $useAuthData$jscomp$5$$) {
  return $JSCompiler_StaticMethods_UrlBuilder$$module$extensions$amp_subscriptions$0_1$url_builder_prototype$prepareUrlVars_$self$$.$F$.then(function($readerId$jscomp$1_vars$jscomp$30$$) {
    $readerId$jscomp$1_vars$jscomp$30$$ = {READER_ID:$readerId$jscomp$1_vars$jscomp$30$$, ACCESS_READER_ID:$readerId$jscomp$1_vars$jscomp$30$$};
    $useAuthData$jscomp$5$$ && ($readerId$jscomp$1_vars$jscomp$30$$.AUTHDATA = function($useAuthData$jscomp$5$$) {
      if ($JSCompiler_StaticMethods_UrlBuilder$$module$extensions$amp_subscriptions$0_1$url_builder_prototype$prepareUrlVars_$self$$.$D$) {
        return _.$getValueForExpr$$module$src$json$$($JSCompiler_StaticMethods_UrlBuilder$$module$extensions$amp_subscriptions$0_1$url_builder_prototype$prepareUrlVars_$self$$.$D$, $useAuthData$jscomp$5$$);
      }
    });
    return $readerId$jscomp$1_vars$jscomp$30$$;
  });
}, $LocalSubscriptionPlatform$$module$extensions$amp_subscriptions$0_1$local_subscription_platform$$ = function($JSCompiler_temp_const$jscomp$1003_ampdoc$jscomp$217$$, $JSCompiler_inline_result$jscomp$1004_platformConfig$jscomp$3$$, $serviceAdapter$jscomp$4$$) {
  this.$ampdoc_$ = $JSCompiler_temp_const$jscomp$1003_ampdoc$jscomp$217$$;
  this.$K$ = $JSCompiler_temp_const$jscomp$1003_ampdoc$jscomp$217$$.getRootNode();
  this.$F$ = $JSCompiler_inline_result$jscomp$1004_platformConfig$jscomp$3$$;
  this.$D$ = $serviceAdapter$jscomp$4$$;
  this.$xhr_$ = _.$Services$$module$src$services$xhrFor$$(this.$ampdoc_$.$win$);
  this.$J$ = this.$F$.authorizationUrl;
  $JSCompiler_temp_const$jscomp$1003_ampdoc$jscomp$217$$ = this.$ampdoc_$;
  $JSCompiler_inline_result$jscomp$1004_platformConfig$jscomp$3$$ = $JSCompiler_StaticMethods_SubscriptionService$$module$extensions$amp_subscriptions$0_1$amp_subscriptions_prototype$getReaderId$$(this.$D$.$D$);
  this.$G$ = new $UrlBuilder$$module$extensions$amp_subscriptions$0_1$url_builder$$($JSCompiler_temp_const$jscomp$1003_ampdoc$jscomp$217$$, $JSCompiler_inline_result$jscomp$1004_platformConfig$jscomp$3$$);
  this.$O$ = $serviceAdapter$jscomp$4$$.$D$.$F$;
  this.$actions_$ = new $Actions$$module$extensions$amp_subscriptions$0_1$actions$$(this.$ampdoc_$, this.$G$, this.$O$, this.$F$.actions);
  this.$renderer_$ = new $LocalSubscriptionPlatformRenderer$$module$extensions$amp_subscriptions$0_1$local_subscription_platform_renderer$$(this.$ampdoc_$, $serviceAdapter$jscomp$4$$.$D$.$W$, this.$D$);
  this.$I$ = this.$F$.pingbackUrl || null;
  $JSCompiler_StaticMethods_LocalSubscriptionPlatform$$module$extensions$amp_subscriptions$0_1$local_subscription_platform_prototype$initializeListeners_$$(this);
}, $JSCompiler_StaticMethods_LocalSubscriptionPlatform$$module$extensions$amp_subscriptions$0_1$local_subscription_platform_prototype$initializeListeners_$$ = function($JSCompiler_StaticMethods_LocalSubscriptionPlatform$$module$extensions$amp_subscriptions$0_1$local_subscription_platform_prototype$initializeListeners_$self$$) {
  $JSCompiler_StaticMethods_LocalSubscriptionPlatform$$module$extensions$amp_subscriptions$0_1$local_subscription_platform_prototype$initializeListeners_$self$$.$K$.addEventListener("click", function($action$jscomp$inline_4951_e$jscomp$333$$) {
    var $element$jscomp$641_platform$jscomp$inline_4953_serviceAttr$jscomp$inline_4952$$ = _.$closestBySelector$$module$src$dom$$($action$jscomp$inline_4951_e$jscomp$333$$.target, "[subscriptions-action]");
    $element$jscomp$641_platform$jscomp$inline_4953_serviceAttr$jscomp$inline_4952$$ && ($action$jscomp$inline_4951_e$jscomp$333$$ = $element$jscomp$641_platform$jscomp$inline_4953_serviceAttr$jscomp$inline_4952$$.getAttribute("subscriptions-action"), $element$jscomp$641_platform$jscomp$inline_4953_serviceAttr$jscomp$inline_4952$$ = $element$jscomp$641_platform$jscomp$inline_4953_serviceAttr$jscomp$inline_4952$$.getAttribute("subscriptions-service"), "local" == $element$jscomp$641_platform$jscomp$inline_4953_serviceAttr$jscomp$inline_4952$$ ? 
    $JSCompiler_StaticMethods_LocalSubscriptionPlatform$$module$extensions$amp_subscriptions$0_1$local_subscription_platform_prototype$initializeListeners_$self$$.$executeAction$($action$jscomp$inline_4951_e$jscomp$333$$) : "auto" == ($element$jscomp$641_platform$jscomp$inline_4953_serviceAttr$jscomp$inline_4952$$ || "auto") ? "login" == $action$jscomp$inline_4951_e$jscomp$333$$ ? ($element$jscomp$641_platform$jscomp$inline_4953_serviceAttr$jscomp$inline_4952$$ = $JSCompiler_StaticMethods_selectApplicablePlatformForFactor_$$($JSCompiler_StaticMethods_LocalSubscriptionPlatform$$module$extensions$amp_subscriptions$0_1$local_subscription_platform_prototype$initializeListeners_$self$$.$D$.$D$.$D$), 
    $JSCompiler_StaticMethods_SubscriptionService$$module$extensions$amp_subscriptions$0_1$amp_subscriptions_prototype$delegateActionToService$$($JSCompiler_StaticMethods_LocalSubscriptionPlatform$$module$extensions$amp_subscriptions$0_1$local_subscription_platform_prototype$initializeListeners_$self$$.$D$.$D$, $action$jscomp$inline_4951_e$jscomp$333$$, $element$jscomp$641_platform$jscomp$inline_4953_serviceAttr$jscomp$inline_4952$$.$getServiceId$())) : $JSCompiler_StaticMethods_LocalSubscriptionPlatform$$module$extensions$amp_subscriptions$0_1$local_subscription_platform_prototype$initializeListeners_$self$$.$executeAction$($action$jscomp$inline_4951_e$jscomp$333$$) : 
    $element$jscomp$641_platform$jscomp$inline_4953_serviceAttr$jscomp$inline_4952$$ && $JSCompiler_StaticMethods_SubscriptionService$$module$extensions$amp_subscriptions$0_1$amp_subscriptions_prototype$delegateActionToService$$($JSCompiler_StaticMethods_LocalSubscriptionPlatform$$module$extensions$amp_subscriptions$0_1$local_subscription_platform_prototype$initializeListeners_$self$$.$D$.$D$, $action$jscomp$inline_4951_e$jscomp$333$$, $element$jscomp$641_platform$jscomp$inline_4953_serviceAttr$jscomp$inline_4952$$));
  });
}, $PlatformStore$$module$extensions$amp_subscriptions$0_1$platform_store$$ = function($expectedServiceIds$$, $scoreConfig$$, $fallbackEntitlement$$, $opt_Platforms$$) {
  var $$jscomp$this$jscomp$1239$$ = this;
  this.$D$ = $opt_Platforms$$ || {};
  this.$Y$ = $expectedServiceIds$$;
  this.$G$ = {};
  this.$R$ = {};
  $expectedServiceIds$$.forEach(function($expectedServiceIds$$) {
    $$jscomp$this$jscomp$1239$$.$R$[$expectedServiceIds$$] = new _.$Deferred$$module$src$utils$promise$$;
  });
  this.$V$ = new _.$Observable$$module$src$observable$$;
  this.$W$ = new _.$Observable$$module$src$observable$$;
  this.$J$ = this.$K$ = this.$F$ = this.$I$ = null;
  this.$O$ = [];
  this.$U$ = $fallbackEntitlement$$;
  this.$P$ = Object.assign($DEFAULT_SCORE_CONFIG$$module$extensions$amp_subscriptions$0_1$score_factors$$, $scoreConfig$$);
}, $JSCompiler_StaticMethods_resolvePlatform$$ = function($JSCompiler_StaticMethods_resolvePlatform$self$$, $serviceId$jscomp$3$$, $platform$jscomp$17$$) {
  $JSCompiler_StaticMethods_resolvePlatform$self$$.$D$[$serviceId$jscomp$3$$] = $platform$jscomp$17$$;
  $JSCompiler_StaticMethods_resolvePlatform$self$$.$W$.$fire$({$serviceId$:$serviceId$jscomp$3$$});
}, $JSCompiler_StaticMethods_resetPlatformStore$$ = function($JSCompiler_StaticMethods_resetPlatformStore$self$$) {
  for (var $platformKey$$ in $JSCompiler_StaticMethods_resetPlatformStore$self$$.$D$) {
    $JSCompiler_StaticMethods_resetPlatformStore$self$$.$D$[$platformKey$$].reset();
  }
  return new $PlatformStore$$module$extensions$amp_subscriptions$0_1$platform_store$$($JSCompiler_StaticMethods_resetPlatformStore$self$$.$Y$, $JSCompiler_StaticMethods_resetPlatformStore$self$$.$P$, $JSCompiler_StaticMethods_resetPlatformStore$self$$.$U$, $JSCompiler_StaticMethods_resetPlatformStore$self$$.$D$);
}, $JSCompiler_StaticMethods_onPlatformResolves$$ = function($JSCompiler_StaticMethods_onPlatformResolves$self$$, $serviceId$jscomp$4$$, $callback$jscomp$164$$) {
  var $platform$jscomp$18$$ = $JSCompiler_StaticMethods_onPlatformResolves$self$$.$D$[$serviceId$jscomp$4$$];
  $platform$jscomp$18$$ ? $callback$jscomp$164$$($platform$jscomp$18$$) : $JSCompiler_StaticMethods_onPlatformResolves$self$$.$W$.add(function($platform$jscomp$18$$) {
    $platform$jscomp$18$$.$serviceId$ === $serviceId$jscomp$4$$ && $callback$jscomp$164$$($JSCompiler_StaticMethods_onPlatformResolves$self$$.$D$[$serviceId$jscomp$4$$]);
  });
}, $JSCompiler_StaticMethods_getAvailablePlatforms$$ = function($JSCompiler_StaticMethods_getAvailablePlatforms$self$$) {
  var $platforms$$ = [], $platformKey$jscomp$1$$;
  for ($platformKey$jscomp$1$$ in $JSCompiler_StaticMethods_getAvailablePlatforms$self$$.$D$) {
    $platforms$$.push($JSCompiler_StaticMethods_getAvailablePlatforms$self$$.$D$[$platformKey$jscomp$1$$]);
  }
  return $platforms$$;
}, $JSCompiler_StaticMethods_PlatformStore$$module$extensions$amp_subscriptions$0_1$platform_store_prototype$onChange$$ = function($JSCompiler_StaticMethods_PlatformStore$$module$extensions$amp_subscriptions$0_1$platform_store_prototype$onChange$self$$, $callback$jscomp$165$$) {
  $JSCompiler_StaticMethods_PlatformStore$$module$extensions$amp_subscriptions$0_1$platform_store_prototype$onChange$self$$.$V$.add($callback$jscomp$165$$);
}, $JSCompiler_StaticMethods_resolveEntitlement$$ = function($JSCompiler_StaticMethods_resolveEntitlement$self$$, $serviceId$jscomp$6$$, $entitlement$jscomp$4$$) {
  $entitlement$jscomp$4$$ && ($entitlement$jscomp$4$$.$service$ = $serviceId$jscomp$6$$);
  $JSCompiler_StaticMethods_resolveEntitlement$self$$.$G$[$serviceId$jscomp$6$$] = $entitlement$jscomp$4$$;
  var $deferred$jscomp$63$$ = $JSCompiler_StaticMethods_resolveEntitlement$self$$.$R$[$serviceId$jscomp$6$$];
  $deferred$jscomp$63$$ && $deferred$jscomp$63$$.resolve($entitlement$jscomp$4$$);
  -1 != $JSCompiler_StaticMethods_resolveEntitlement$self$$.$O$.indexOf($serviceId$jscomp$6$$) && $JSCompiler_StaticMethods_resolveEntitlement$self$$.$O$.splice($JSCompiler_StaticMethods_resolveEntitlement$self$$.$O$.indexOf($serviceId$jscomp$6$$));
  $entitlement$jscomp$4$$.$granted$ && $JSCompiler_StaticMethods_saveGrantEntitlement_$$($JSCompiler_StaticMethods_resolveEntitlement$self$$, $entitlement$jscomp$4$$);
  $JSCompiler_StaticMethods_resolveEntitlement$self$$.$V$.$fire$({$serviceId$:$serviceId$jscomp$6$$, $entitlement$:$entitlement$jscomp$4$$});
}, $JSCompiler_StaticMethods_getGrantStatus$$ = function($JSCompiler_StaticMethods_getGrantStatus$self$$) {
  if (null !== $JSCompiler_StaticMethods_getGrantStatus$self$$.$I$) {
    return $JSCompiler_StaticMethods_getGrantStatus$self$$.$I$.$promise$;
  }
  $JSCompiler_StaticMethods_getGrantStatus$self$$.$I$ = new _.$Deferred$$module$src$utils$promise$$;
  for (var $key$jscomp$161$$ in $JSCompiler_StaticMethods_getGrantStatus$self$$.$G$) {
    var $entitlement$jscomp$5$$ = $JSCompiler_StaticMethods_getGrantStatus$self$$.$G$[$key$jscomp$161$$];
    $entitlement$jscomp$5$$.$granted$ && ($JSCompiler_StaticMethods_saveGrantEntitlement_$$($JSCompiler_StaticMethods_getGrantStatus$self$$, $entitlement$jscomp$5$$), $JSCompiler_StaticMethods_getGrantStatus$self$$.$I$.resolve(!0));
  }
  $JSCompiler_StaticMethods_areAllPlatformsResolved_$$($JSCompiler_StaticMethods_getGrantStatus$self$$) ? $JSCompiler_StaticMethods_getGrantStatus$self$$.$I$.resolve(!1) : $JSCompiler_StaticMethods_PlatformStore$$module$extensions$amp_subscriptions$0_1$platform_store_prototype$onChange$$($JSCompiler_StaticMethods_getGrantStatus$self$$, function($key$jscomp$161$$) {
    $key$jscomp$161$$.$entitlement$.$granted$ ? $JSCompiler_StaticMethods_getGrantStatus$self$$.$I$.resolve(!0) : $JSCompiler_StaticMethods_areAllPlatformsResolved_$$($JSCompiler_StaticMethods_getGrantStatus$self$$) && $JSCompiler_StaticMethods_getGrantStatus$self$$.$I$.resolve(!1);
  });
  return $JSCompiler_StaticMethods_getGrantStatus$self$$.$I$.$promise$;
}, $JSCompiler_StaticMethods_saveGrantEntitlement_$$ = function($JSCompiler_StaticMethods_saveGrantEntitlement_$self$$, $entitlement$jscomp$7$$) {
  if (!$JSCompiler_StaticMethods_saveGrantEntitlement_$self$$.$F$ && $entitlement$jscomp$7$$.$granted$ || $JSCompiler_StaticMethods_saveGrantEntitlement_$self$$.$F$ && !_.$JSCompiler_StaticMethods_isSubscriber$$($JSCompiler_StaticMethods_saveGrantEntitlement_$self$$.$F$) && _.$JSCompiler_StaticMethods_isSubscriber$$($entitlement$jscomp$7$$)) {
    $JSCompiler_StaticMethods_saveGrantEntitlement_$self$$.$F$ = $entitlement$jscomp$7$$;
  }
}, $JSCompiler_StaticMethods_getGrantEntitlement$$ = function($JSCompiler_StaticMethods_getGrantEntitlement$self$$) {
  if ($JSCompiler_StaticMethods_getGrantEntitlement$self$$.$K$) {
    return $JSCompiler_StaticMethods_getGrantEntitlement$self$$.$K$.$promise$;
  }
  $JSCompiler_StaticMethods_getGrantEntitlement$self$$.$K$ = new _.$Deferred$$module$src$utils$promise$$;
  $JSCompiler_StaticMethods_getGrantEntitlement$self$$.$F$ && _.$JSCompiler_StaticMethods_isSubscriber$$($JSCompiler_StaticMethods_getGrantEntitlement$self$$.$F$) || $JSCompiler_StaticMethods_areAllPlatformsResolved_$$($JSCompiler_StaticMethods_getGrantEntitlement$self$$) ? $JSCompiler_StaticMethods_getGrantEntitlement$self$$.$K$.resolve($JSCompiler_StaticMethods_getGrantEntitlement$self$$.$F$) : $JSCompiler_StaticMethods_getGrantEntitlement$self$$.$V$.add(function() {
    ($JSCompiler_StaticMethods_getGrantEntitlement$self$$.$F$ && _.$JSCompiler_StaticMethods_isSubscriber$$($JSCompiler_StaticMethods_getGrantEntitlement$self$$.$F$) || $JSCompiler_StaticMethods_areAllPlatformsResolved_$$($JSCompiler_StaticMethods_getGrantEntitlement$self$$)) && $JSCompiler_StaticMethods_getGrantEntitlement$self$$.$K$.resolve($JSCompiler_StaticMethods_getGrantEntitlement$self$$.$F$);
  });
  return $JSCompiler_StaticMethods_getGrantEntitlement$self$$.$K$.$promise$;
}, $JSCompiler_StaticMethods_getAllPlatformsEntitlements_$$ = function($JSCompiler_StaticMethods_getAllPlatformsEntitlements_$self$$) {
  if ($JSCompiler_StaticMethods_getAllPlatformsEntitlements_$self$$.$J$) {
    return $JSCompiler_StaticMethods_getAllPlatformsEntitlements_$self$$.$J$.$promise$;
  }
  $JSCompiler_StaticMethods_getAllPlatformsEntitlements_$self$$.$J$ = new _.$Deferred$$module$src$utils$promise$$;
  $JSCompiler_StaticMethods_areAllPlatformsResolved_$$($JSCompiler_StaticMethods_getAllPlatformsEntitlements_$self$$) ? $JSCompiler_StaticMethods_getAllPlatformsEntitlements_$self$$.$J$.resolve($JSCompiler_StaticMethods_getAvailablePlatformsEntitlements_$$($JSCompiler_StaticMethods_getAllPlatformsEntitlements_$self$$)) : $JSCompiler_StaticMethods_PlatformStore$$module$extensions$amp_subscriptions$0_1$platform_store_prototype$onChange$$($JSCompiler_StaticMethods_getAllPlatformsEntitlements_$self$$, 
  function() {
    $JSCompiler_StaticMethods_areAllPlatformsResolved_$$($JSCompiler_StaticMethods_getAllPlatformsEntitlements_$self$$) && $JSCompiler_StaticMethods_getAllPlatformsEntitlements_$self$$.$J$.resolve($JSCompiler_StaticMethods_getAvailablePlatformsEntitlements_$$($JSCompiler_StaticMethods_getAllPlatformsEntitlements_$self$$));
  });
  return $JSCompiler_StaticMethods_getAllPlatformsEntitlements_$self$$.$J$.$promise$;
}, $JSCompiler_StaticMethods_getAvailablePlatformsEntitlements_$$ = function($JSCompiler_StaticMethods_getAvailablePlatformsEntitlements_$self$$) {
  var $entitlements$jscomp$13$$ = [], $platform$jscomp$20$$;
  for ($platform$jscomp$20$$ in $JSCompiler_StaticMethods_getAvailablePlatformsEntitlements_$self$$.$G$) {
    _.$hasOwn$$module$src$utils$object$$($JSCompiler_StaticMethods_getAvailablePlatformsEntitlements_$self$$.$G$, $platform$jscomp$20$$) && $entitlements$jscomp$13$$.push($JSCompiler_StaticMethods_getAvailablePlatformsEntitlements_$self$$.$G$[$platform$jscomp$20$$]);
  }
  return $entitlements$jscomp$13$$;
}, $JSCompiler_StaticMethods_selectPlatform$$ = function($JSCompiler_StaticMethods_selectPlatform$self$$) {
  return $JSCompiler_StaticMethods_getAllPlatformsEntitlements_$$($JSCompiler_StaticMethods_selectPlatform$self$$).then(function() {
    var $JSCompiler_inline_result$jscomp$1002_availablePlatforms$jscomp$inline_4959$$;
    a: {
      $JSCompiler_StaticMethods_areAllPlatformsResolved_$$($JSCompiler_StaticMethods_selectPlatform$self$$);
      for ($JSCompiler_inline_result$jscomp$1002_availablePlatforms$jscomp$inline_4959$$ = $JSCompiler_StaticMethods_getAvailablePlatforms$$($JSCompiler_StaticMethods_selectPlatform$self$$); $JSCompiler_inline_result$jscomp$1002_availablePlatforms$jscomp$inline_4959$$.length;) {
        var $platform$jscomp$inline_4960$$ = $JSCompiler_inline_result$jscomp$1002_availablePlatforms$jscomp$inline_4959$$.pop();
        if (_.$JSCompiler_StaticMethods_isSubscriber$$($JSCompiler_StaticMethods_selectPlatform$self$$.$G$[$platform$jscomp$inline_4960$$.$getServiceId$()])) {
          $JSCompiler_inline_result$jscomp$1002_availablePlatforms$jscomp$inline_4959$$ = $platform$jscomp$inline_4960$$;
          break a;
        }
      }
      $JSCompiler_inline_result$jscomp$1002_availablePlatforms$jscomp$inline_4959$$ = $JSCompiler_StaticMethods_rankPlatformsByWeight_$$($JSCompiler_StaticMethods_selectPlatform$self$$, $JSCompiler_StaticMethods_getAllPlatformWeights_$$($JSCompiler_StaticMethods_selectPlatform$self$$));
    }
    return $JSCompiler_inline_result$jscomp$1002_availablePlatforms$jscomp$inline_4959$$;
  });
}, $JSCompiler_StaticMethods_areAllPlatformsResolved_$$ = function($JSCompiler_StaticMethods_areAllPlatformsResolved_$self$$) {
  return Object.keys($JSCompiler_StaticMethods_areAllPlatformsResolved_$self$$.$G$).length === $JSCompiler_StaticMethods_areAllPlatformsResolved_$self$$.$Y$.length;
}, $JSCompiler_StaticMethods_getSupportedFactorWeight_$$ = function($JSCompiler_StaticMethods_getSupportedFactorWeight_$self$$, $factorName$jscomp$1$$, $factorValue$jscomp$1_platform$jscomp$21$$) {
  $factorValue$jscomp$1_platform$jscomp$21$$ = $factorValue$jscomp$1_platform$jscomp$21$$.$getSupportedScoreFactor$($factorName$jscomp$1$$);
  return "number" !== typeof $factorValue$jscomp$1_platform$jscomp$21$$ ? 0 : $JSCompiler_StaticMethods_getSupportedFactorWeight_$self$$.$P$[$factorName$jscomp$1$$] * Math.min(1, Math.max(-1, $factorValue$jscomp$1_platform$jscomp$21$$));
}, $JSCompiler_StaticMethods_getAllPlatformWeights_$$ = function($JSCompiler_StaticMethods_getAllPlatformWeights_$self$$) {
  return $JSCompiler_StaticMethods_getAvailablePlatforms$$($JSCompiler_StaticMethods_getAllPlatformWeights_$self$$).map(function($platform$jscomp$23$$) {
    return {platform:$platform$jscomp$23$$, weight:$JSCompiler_StaticMethods_calculatePlatformWeight_$$($JSCompiler_StaticMethods_getAllPlatformWeights_$self$$, $platform$jscomp$23$$)};
  });
}, $JSCompiler_StaticMethods_calculatePlatformWeight_$$ = function($JSCompiler_StaticMethods_calculatePlatformWeight_$self$$, $platform$jscomp$24$$) {
  var $factorWeights$$ = [0], $weight$$ = $platform$jscomp$24$$.$getBaseScore$(), $factor$jscomp$1$$;
  for ($factor$jscomp$1$$ in $JSCompiler_StaticMethods_calculatePlatformWeight_$self$$.$P$) {
    _.$hasOwn$$module$src$utils$object$$($JSCompiler_StaticMethods_calculatePlatformWeight_$self$$.$P$, $factor$jscomp$1$$) && $factorWeights$$.push($JSCompiler_StaticMethods_getSupportedFactorWeight_$$($JSCompiler_StaticMethods_calculatePlatformWeight_$self$$, $factor$jscomp$1$$, $platform$jscomp$24$$));
  }
  return $weight$$ + $factorWeights$$.reduce(function($JSCompiler_StaticMethods_calculatePlatformWeight_$self$$, $platform$jscomp$24$$) {
    return $JSCompiler_StaticMethods_calculatePlatformWeight_$self$$ + $platform$jscomp$24$$;
  });
}, $JSCompiler_StaticMethods_rankPlatformsByWeight_$$ = function($JSCompiler_StaticMethods_rankPlatformsByWeight_$self$$, $platformWeights$$) {
  var $localPlatform$jscomp$1$$ = $JSCompiler_StaticMethods_rankPlatformsByWeight_$self$$.$D$.local;
  $platformWeights$$.sort(function($JSCompiler_StaticMethods_rankPlatformsByWeight_$self$$, $platformWeights$$) {
    return $platformWeights$$.weight == $JSCompiler_StaticMethods_rankPlatformsByWeight_$self$$.weight && $JSCompiler_StaticMethods_rankPlatformsByWeight_$self$$.platform == $localPlatform$jscomp$1$$ ? -1 : $platformWeights$$.weight - $JSCompiler_StaticMethods_rankPlatformsByWeight_$self$$.weight;
  });
  return $platformWeights$$[0].platform;
}, $JSCompiler_StaticMethods_selectApplicablePlatformForFactor_$$ = function($JSCompiler_StaticMethods_selectApplicablePlatformForFactor_$self$$) {
  var $platformWeights$jscomp$1$$ = $JSCompiler_StaticMethods_getAvailablePlatforms$$($JSCompiler_StaticMethods_selectApplicablePlatformForFactor_$self$$).map(function($JSCompiler_StaticMethods_selectApplicablePlatformForFactor_$self$$) {
    var $platformWeights$jscomp$1$$ = $JSCompiler_StaticMethods_selectApplicablePlatformForFactor_$self$$.$getSupportedScoreFactor$("supportsViewer");
    return {platform:$JSCompiler_StaticMethods_selectApplicablePlatformForFactor_$self$$, weight:"number" == typeof $platformWeights$jscomp$1$$ ? $platformWeights$jscomp$1$$ : 0};
  });
  return $JSCompiler_StaticMethods_rankPlatformsByWeight_$$($JSCompiler_StaticMethods_selectApplicablePlatformForFactor_$self$$, $platformWeights$jscomp$1$$);
}, $JSCompiler_StaticMethods_reportPlatformFailureAndFallback$$ = function($JSCompiler_StaticMethods_reportPlatformFailureAndFallback$self$$, $serviceId$jscomp$9$$) {
  $serviceId$jscomp$9$$ === $JSCompiler_StaticMethods_reportPlatformFailureAndFallback$self$$.$D$.local.$getServiceId$() && $JSCompiler_StaticMethods_reportPlatformFailureAndFallback$self$$.$U$ ? ($JSCompiler_StaticMethods_resolveEntitlement$$($JSCompiler_StaticMethods_reportPlatformFailureAndFallback$self$$, $JSCompiler_StaticMethods_reportPlatformFailureAndFallback$self$$.$D$.local.$getServiceId$(), $JSCompiler_StaticMethods_reportPlatformFailureAndFallback$self$$.$U$), _.$user$$module$src$log$$().$Log$$module$src$log_prototype$warn$("amp-subscriptions", 
  "Local platform has failed to resolve,  using fallback entitlement.")) : -1 == $JSCompiler_StaticMethods_reportPlatformFailureAndFallback$self$$.$O$.indexOf($serviceId$jscomp$9$$) && ($JSCompiler_StaticMethods_resolveEntitlement$$($JSCompiler_StaticMethods_reportPlatformFailureAndFallback$self$$, $serviceId$jscomp$9$$, $Entitlement$$module$extensions$amp_subscriptions$0_1$entitlement$empty$$($serviceId$jscomp$9$$)), $JSCompiler_StaticMethods_reportPlatformFailureAndFallback$self$$.$O$.push($serviceId$jscomp$9$$));
}, $Renderer$$module$extensions$amp_subscriptions$0_1$renderer$$ = function($ampdoc$jscomp$218$$) {
  this.$ampdoc_$ = $ampdoc$jscomp$218$$;
  this.$D$ = _.$Services$$module$src$services$resourcesForDoc$$($ampdoc$jscomp$218$$);
  $JSCompiler_StaticMethods_Renderer$$module$extensions$amp_subscriptions$0_1$renderer_prototype$setState_$$(this, null);
  this.$ampdoc_$.$getBody$().classList.add("i-amphtml-subs-ready");
  $JSCompiler_StaticMethods_addLoadingBar$$(this);
}, $JSCompiler_StaticMethods_Renderer$$module$extensions$amp_subscriptions$0_1$renderer_prototype$setState_$$ = function($JSCompiler_StaticMethods_Renderer$$module$extensions$amp_subscriptions$0_1$renderer_prototype$setState_$self$$, $state$jscomp$108$$) {
  $JSCompiler_StaticMethods_Renderer$$module$extensions$amp_subscriptions$0_1$renderer_prototype$setState_$self$$.$D$.$mutateElement$($JSCompiler_StaticMethods_Renderer$$module$extensions$amp_subscriptions$0_1$renderer_prototype$setState_$self$$.$ampdoc_$.$getBody$(), function() {
    $JSCompiler_StaticMethods_Renderer$$module$extensions$amp_subscriptions$0_1$renderer_prototype$setState_$self$$.$ampdoc_$.$getBody$().classList.toggle("i-amphtml-subs-grant-unk", null === $state$jscomp$108$$);
    $JSCompiler_StaticMethods_Renderer$$module$extensions$amp_subscriptions$0_1$renderer_prototype$setState_$self$$.$ampdoc_$.$getBody$().classList.toggle("i-amphtml-subs-grant-yes", !0 === $state$jscomp$108$$);
    $JSCompiler_StaticMethods_Renderer$$module$extensions$amp_subscriptions$0_1$renderer_prototype$setState_$self$$.$ampdoc_$.$getBody$().classList.toggle("i-amphtml-subs-grant-no", !1 === $state$jscomp$108$$);
  });
}, $JSCompiler_StaticMethods_addLoadingBar$$ = function($JSCompiler_StaticMethods_addLoadingBar$self$$) {
  $JSCompiler_StaticMethods_addLoadingBar$self$$.$ampdoc_$.$whenReady$().then(function() {
    var $body$jscomp$35$$ = $JSCompiler_StaticMethods_addLoadingBar$self$$.$ampdoc_$.$getBody$();
    if (!$body$jscomp$35$$.querySelector("[subscriptions-section=loading]")) {
      var $element$jscomp$643$$ = _.$createElementWithAttributes$$module$src$dom$$($JSCompiler_StaticMethods_addLoadingBar$self$$.$ampdoc_$.$win$.document, "div", _.$dict$$module$src$utils$object$$({"class":"i-amphtml-subs-progress", "subscriptions-section":"loading"}));
      $body$jscomp$35$$.insertBefore($element$jscomp$643$$, _.$childElementByTag$$module$src$dom$$($body$jscomp$35$$, "footer"));
    }
  });
}, $JSCompiler_StaticMethods_toggleState_$$ = function($JSCompiler_StaticMethods_toggleState_$self$$, $state$jscomp$109$$) {
  $JSCompiler_StaticMethods_toggleState_$self$$.$D$.$mutateElement$($JSCompiler_StaticMethods_toggleState_$self$$.$ampdoc_$.$getBody$(), function() {
    $JSCompiler_StaticMethods_toggleState_$self$$.$ampdoc_$.$getBody$().classList.toggle("i-amphtml-subs-loading", $state$jscomp$109$$);
  });
}, $ServiceAdapter$$module$extensions$amp_subscriptions$0_1$service_adapter$$ = function($subscriptionService$$) {
  this.$D$ = $subscriptionService$$;
}, $ViewerSubscriptionPlatform$$module$extensions$amp_subscriptions$0_1$viewer_subscription_platform$$ = function($ampdoc$jscomp$219$$, $platformConfig$jscomp$4$$, $serviceAdapter$jscomp$5$$, $origin$jscomp$39$$) {
  this.$ampdoc_$ = $ampdoc$jscomp$219$$;
  this.$D$ = $serviceAdapter$jscomp$5$$.$D$.$J$;
  this.$platform_$ = new $LocalSubscriptionPlatform$$module$extensions$amp_subscriptions$0_1$local_subscription_platform$$($ampdoc$jscomp$219$$, $platformConfig$jscomp$4$$, $serviceAdapter$jscomp$5$$);
  this.$viewer_$ = _.$Services$$module$src$services$viewerForDoc$$(this.$ampdoc_$);
  this.$F$ = this.$D$.$PageConfig$$module$third_party$subscriptions_project$config$publicationId_$;
  this.$G$ = this.$D$.$PageConfig$$module$third_party$subscriptions_project$config$productId_$;
  this.$origin_$ = $origin$jscomp$39$$;
}, $JSCompiler_StaticMethods_verifyAuthToken_$$ = function($JSCompiler_StaticMethods_verifyAuthToken_$self$$, $token$jscomp$29$$) {
  return new window.Promise(function($resolve$jscomp$98$$) {
    var $entitlements$jscomp$14_origin$jscomp$40$$ = _.$getWinOrigin$$module$src$url$$($JSCompiler_StaticMethods_verifyAuthToken_$self$$.$ampdoc_$.$win$), $entitlement$jscomp$10_sourceOrigin$jscomp$5$$ = _.$getSourceOrigin$$module$src$url$$($JSCompiler_StaticMethods_verifyAuthToken_$self$$.$ampdoc_$.$win$.location), $decodedData_index$jscomp$154$$ = _.$JSCompiler_StaticMethods_JwtHelper$$module$extensions$amp_access$0_1$jwt_prototype$decodeInternal_$$($token$jscomp$29$$).$payload$, $currentProductId_entitlementObject$$ = 
    $JSCompiler_StaticMethods_verifyAuthToken_$self$$.$D$.$PageConfig$$module$third_party$subscriptions_project$config$productId_$;
    if ($decodedData_index$jscomp$154$$.aud != $entitlements$jscomp$14_origin$jscomp$40$$ && $decodedData_index$jscomp$154$$.aud != $entitlement$jscomp$10_sourceOrigin$jscomp$5$$) {
      throw _.$user$$module$src$log$$().$createError$('The mismatching "aud" field: ' + $decodedData_index$jscomp$154$$.aud);
    }
    if ($decodedData_index$jscomp$154$$.exp < Math.floor(Date.now() / 1000)) {
      throw _.$user$$module$src$log$$().$createError$("Payload is expired");
    }
    $entitlements$jscomp$14_origin$jscomp$40$$ = $decodedData_index$jscomp$154$$.entitlements;
    $entitlement$jscomp$10_sourceOrigin$jscomp$5$$ = $Entitlement$$module$extensions$amp_subscriptions$0_1$entitlement$empty$$("local");
    if (Array.isArray($entitlements$jscomp$14_origin$jscomp$40$$)) {
      for ($decodedData_index$jscomp$154$$ = 0; $decodedData_index$jscomp$154$$ < $entitlements$jscomp$14_origin$jscomp$40$$.length; $decodedData_index$jscomp$154$$++) {
        if (-1 !== $entitlements$jscomp$14_origin$jscomp$40$$[$decodedData_index$jscomp$154$$].products.indexOf($currentProductId_entitlementObject$$)) {
          $currentProductId_entitlementObject$$ = $entitlements$jscomp$14_origin$jscomp$40$$[$decodedData_index$jscomp$154$$];
          $entitlement$jscomp$10_sourceOrigin$jscomp$5$$ = new _.$Entitlement$$module$extensions$amp_subscriptions$0_1$entitlement$$({source:"viewer", raw:$token$jscomp$29$$, $granted$:!0, $grantReason$:$currentProductId_entitlementObject$$.$subscriptionToken$ ? "SUBSCRIBER" : "", $dataObject$:$currentProductId_entitlementObject$$});
          break;
        }
      }
    } else {
      $decodedData_index$jscomp$154$$.metering && !$decodedData_index$jscomp$154$$.entitlements ? $entitlement$jscomp$10_sourceOrigin$jscomp$5$$ = new _.$Entitlement$$module$extensions$amp_subscriptions$0_1$entitlement$$({source:$decodedData_index$jscomp$154$$.iss || "", raw:$token$jscomp$29$$, $granted$:!0, $grantReason$:"METERING", $dataObject$:$decodedData_index$jscomp$154$$.metering}) : $entitlements$jscomp$14_origin$jscomp$40$$ && ($entitlement$jscomp$10_sourceOrigin$jscomp$5$$ = new _.$Entitlement$$module$extensions$amp_subscriptions$0_1$entitlement$$({source:"viewer", 
      raw:$token$jscomp$29$$, $granted$:$entitlements$jscomp$14_origin$jscomp$40$$.$granted$, $grantReason$:$entitlements$jscomp$14_origin$jscomp$40$$.$subscriptionToken$ ? "SUBSCRIBER" : "", $dataObject$:$entitlements$jscomp$14_origin$jscomp$40$$}));
    }
    $entitlement$jscomp$10_sourceOrigin$jscomp$5$$.$service$ = "local";
    $resolve$jscomp$98$$($entitlement$jscomp$10_sourceOrigin$jscomp$5$$);
  });
}, $ViewerTracker$$module$extensions$amp_subscriptions$0_1$viewer_tracker$$ = function($ampdoc$jscomp$220$$) {
  this.$ampdoc_$ = $ampdoc$jscomp$220$$;
  this.$viewer_$ = _.$Services$$module$src$services$viewerForDoc$$($ampdoc$jscomp$220$$);
  this.$D$ = null;
  this.$timer_$ = _.$Services$$module$src$services$timerFor$$($ampdoc$jscomp$220$$.$win$);
  this.$viewport_$ = _.$Services$$module$src$services$viewportForDoc$$($ampdoc$jscomp$220$$);
}, $JSCompiler_StaticMethods_scheduleView$$ = function($JSCompiler_StaticMethods_scheduleView$self$$) {
  $JSCompiler_StaticMethods_scheduleView$self$$.$D$ = null;
  return $JSCompiler_StaticMethods_scheduleView$self$$.$ampdoc_$.$whenReady$().then(function() {
    return (new window.Promise(function($resolve$jscomp$99$$) {
      _.$JSCompiler_StaticMethods_Viewer$$module$src$service$viewer_impl_prototype$isVisible$$($JSCompiler_StaticMethods_scheduleView$self$$.$viewer_$) && $resolve$jscomp$99$$();
      _.$JSCompiler_StaticMethods_Viewer$$module$src$service$viewer_impl_prototype$onVisibilityChanged$$($JSCompiler_StaticMethods_scheduleView$self$$.$viewer_$, function() {
        _.$JSCompiler_StaticMethods_Viewer$$module$src$service$viewer_impl_prototype$isVisible$$($JSCompiler_StaticMethods_scheduleView$self$$.$viewer_$) && $resolve$jscomp$99$$();
      });
    })).then(function() {
      return $JSCompiler_StaticMethods_ViewerTracker$$module$extensions$amp_subscriptions$0_1$viewer_tracker_prototype$reportWhenViewed_$$($JSCompiler_StaticMethods_scheduleView$self$$);
    });
  });
}, $JSCompiler_StaticMethods_ViewerTracker$$module$extensions$amp_subscriptions$0_1$viewer_tracker_prototype$reportWhenViewed_$$ = function($JSCompiler_StaticMethods_ViewerTracker$$module$extensions$amp_subscriptions$0_1$viewer_tracker_prototype$reportWhenViewed_$self$$) {
  if ($JSCompiler_StaticMethods_ViewerTracker$$module$extensions$amp_subscriptions$0_1$viewer_tracker_prototype$reportWhenViewed_$self$$.$D$) {
    return $JSCompiler_StaticMethods_ViewerTracker$$module$extensions$amp_subscriptions$0_1$viewer_tracker_prototype$reportWhenViewed_$self$$.$D$;
  }
  "local-viewer";
  $JSCompiler_StaticMethods_ViewerTracker$$module$extensions$amp_subscriptions$0_1$viewer_tracker_prototype$reportWhenViewed_$self$$.$D$ = $JSCompiler_StaticMethods_ViewerTracker$$module$extensions$amp_subscriptions$0_1$viewer_tracker_prototype$whenViewed_$$($JSCompiler_StaticMethods_ViewerTracker$$module$extensions$amp_subscriptions$0_1$viewer_tracker_prototype$reportWhenViewed_$self$$).catch(function($reason$jscomp$59$$) {
    "local-viewer";
    $JSCompiler_StaticMethods_ViewerTracker$$module$extensions$amp_subscriptions$0_1$viewer_tracker_prototype$reportWhenViewed_$self$$.$D$ = null;
    throw $reason$jscomp$59$$;
  });
  return $JSCompiler_StaticMethods_ViewerTracker$$module$extensions$amp_subscriptions$0_1$viewer_tracker_prototype$reportWhenViewed_$self$$.$D$;
}, $JSCompiler_StaticMethods_ViewerTracker$$module$extensions$amp_subscriptions$0_1$viewer_tracker_prototype$whenViewed_$$ = function($JSCompiler_StaticMethods_ViewerTracker$$module$extensions$amp_subscriptions$0_1$viewer_tracker_prototype$whenViewed_$self$$) {
  var $unlistenSet$jscomp$1$$ = [];
  return (new window.Promise(function($resolve$jscomp$100$$, $reject$jscomp$35$$) {
    $unlistenSet$jscomp$1$$.push(_.$JSCompiler_StaticMethods_Viewer$$module$src$service$viewer_impl_prototype$onVisibilityChanged$$($JSCompiler_StaticMethods_ViewerTracker$$module$extensions$amp_subscriptions$0_1$viewer_tracker_prototype$whenViewed_$self$$.$viewer_$, function() {
      _.$JSCompiler_StaticMethods_Viewer$$module$src$service$viewer_impl_prototype$isVisible$$($JSCompiler_StaticMethods_ViewerTracker$$module$extensions$amp_subscriptions$0_1$viewer_tracker_prototype$whenViewed_$self$$.$viewer_$) || $reject$jscomp$35$$(_.$cancellation$$module$src$error$$());
    }));
    var $timeoutId$jscomp$2$$ = $JSCompiler_StaticMethods_ViewerTracker$$module$extensions$amp_subscriptions$0_1$viewer_tracker_prototype$whenViewed_$self$$.$timer_$.delay($resolve$jscomp$100$$, 2000);
    $unlistenSet$jscomp$1$$.push(function() {
      return $JSCompiler_StaticMethods_ViewerTracker$$module$extensions$amp_subscriptions$0_1$viewer_tracker_prototype$whenViewed_$self$$.$timer_$.cancel($timeoutId$jscomp$2$$);
    });
    $unlistenSet$jscomp$1$$.push(_.$JSCompiler_StaticMethods_Viewport$$module$src$service$viewport$viewport_impl_prototype$onScroll$$($JSCompiler_StaticMethods_ViewerTracker$$module$extensions$amp_subscriptions$0_1$viewer_tracker_prototype$whenViewed_$self$$.$viewport_$, $resolve$jscomp$100$$));
    $unlistenSet$jscomp$1$$.push(_.$listenOnce$$module$src$event_helper$$($JSCompiler_StaticMethods_ViewerTracker$$module$extensions$amp_subscriptions$0_1$viewer_tracker_prototype$whenViewed_$self$$.$ampdoc_$.getRootNode(), "click", $resolve$jscomp$100$$));
  })).then(function() {
    $unlistenSet$jscomp$1$$.forEach(function($JSCompiler_StaticMethods_ViewerTracker$$module$extensions$amp_subscriptions$0_1$viewer_tracker_prototype$whenViewed_$self$$) {
      return $JSCompiler_StaticMethods_ViewerTracker$$module$extensions$amp_subscriptions$0_1$viewer_tracker_prototype$whenViewed_$self$$();
    });
  }, function($JSCompiler_StaticMethods_ViewerTracker$$module$extensions$amp_subscriptions$0_1$viewer_tracker_prototype$whenViewed_$self$$) {
    $unlistenSet$jscomp$1$$.forEach(function($JSCompiler_StaticMethods_ViewerTracker$$module$extensions$amp_subscriptions$0_1$viewer_tracker_prototype$whenViewed_$self$$) {
      return $JSCompiler_StaticMethods_ViewerTracker$$module$extensions$amp_subscriptions$0_1$viewer_tracker_prototype$whenViewed_$self$$();
    });
    throw $JSCompiler_StaticMethods_ViewerTracker$$module$extensions$amp_subscriptions$0_1$viewer_tracker_prototype$whenViewed_$self$$;
  });
}, $SubscriptionService$$module$extensions$amp_subscriptions$0_1$amp_subscriptions$$ = function($ampdoc$jscomp$221$$) {
  var $configElement$$ = $ampdoc$jscomp$221$$.getElementById("amp-subscriptions");
  this.$ampdoc_$ = $ampdoc$jscomp$221$$;
  _.$installStylesForDoc$$module$src$style_installer$$($ampdoc$jscomp$221$$, "[subscriptions-action]:not(.i-amphtml-subs-display),[subscriptions-actions]:not(.i-amphtml-subs-display),[subscriptions-section=actions]:not(.i-amphtml-subs-display),body.i-amphtml-subs-delegated [subscriptions-section=actions],body.i-amphtml-subs-grant-unk [subscriptions-action],body.i-amphtml-subs-grant-unk [subscriptions-section=actions],body:not(.i-amphtml-subs-grant-no) [subscriptions-section=content-not-granted],body:not(.i-amphtml-subs-grant-yes) [subscriptions-section=content],body:not(.i-amphtml-subs-loading) [subscriptions-section=loading]{display:none!important}amp-subscriptions-dialog{display:block!important;position:fixed!important;bottom:0!important;left:0!important;margin-left:0!important;width:100%!important;z-index:2147483641;max-height:90vh;box-sizing:border-box;opacity:1;background-image:none;background-color:#fff;box-shadow:0 0 5px 0 rgba(0,0,0,0.2);margin-bottom:0;-webkit-transition:-webkit-transform 0.3s ease-in;transition:-webkit-transform 0.3s ease-in;transition:transform 0.3s ease-in;transition:transform 0.3s ease-in,-webkit-transform 0.3s ease-in}.i-amphtml-subs-dialog-close-button{position:absolute;width:28px;height:28px;top:-28px;right:0;background-image:url(\"data:image/svg+xml;charset=utf-8,%3Csvg width='13' height='13' viewBox='341 8 13 13' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill='%234F4F4F' d='M354 9.31L352.69 8l-5.19 5.19L342.31 8 341 9.31l5.19 5.19-5.19 5.19 1.31 1.31 5.19-5.19 5.19 5.19 1.31-1.31-5.19-5.19z' fill-rule='evenodd'/%3E%3C/svg%3E\");background-size:13px 13px;background-position:9px;background-color:#fff;background-repeat:no-repeat;box-shadow:0 -1px 1px 0 rgba(0,0,0,0.2);border:none;border-radius:12px 0 0 0;cursor:pointer}body:not(.i-amphtml-subs-grant-yes) .i-amphtml-subs-dialog-close-button{display:none}.i-amphtml-subs-progress{height:2px;background-color:#ccc;position:relative;margin:8px;overflow:hidden}.i-amphtml-subs-progress:after{content:\"\";background-color:#2196f3;height:2px;position:absolute;left:0;top:0;width:20%;-webkit-animation:i-amphtml-subs-loading-progress 1500ms ease-in-out infinite;animation:i-amphtml-subs-loading-progress 1500ms ease-in-out infinite}@-webkit-keyframes i-amphtml-subs-loading-progress{0%{-webkit-transform:translateX(-100%);transform:translateX(-100%)}to{-webkit-transform:translateX(500%);transform:translateX(500%)}}@keyframes i-amphtml-subs-loading-progress{0%{-webkit-transform:translateX(-100%);transform:translateX(-100%)}to{-webkit-transform:translateX(500%);transform:translateX(500%)}}@media (min-width:480px){amp-subscriptions-dialog{width:480px!important;left:-240px!important;margin-left:50vw!important}}\n/*# sourceURL=/extensions/amp-subscriptions/0.1/amp-subscriptions.css*/", 
  function() {
  }, !1, "amp-subscriptions");
  this.$I$ = null;
  this.$renderer_$ = new $Renderer$$module$extensions$amp_subscriptions$0_1$renderer$$($ampdoc$jscomp$221$$);
  this.$D$ = this.$G$ = this.$J$ = null;
  this.$P$ = _.$JSCompiler_StaticMethods_assertElement$$(_.$user$$module$src$log$$(), $configElement$$);
  this.$F$ = new $SubscriptionAnalytics$$module$extensions$amp_subscriptions$0_1$analytics$$(this.$P$);
  this.$K$ = new $ServiceAdapter$$module$extensions$amp_subscriptions$0_1$service_adapter$$(this);
  this.$W$ = new $Dialog$$module$extensions$amp_subscriptions$0_1$dialog$$($ampdoc$jscomp$221$$);
  this.$aa$ = new $ViewerTracker$$module$extensions$amp_subscriptions$0_1$viewer_tracker$$($ampdoc$jscomp$221$$);
  this.$viewer_$ = _.$Services$$module$src$services$viewerForDoc$$($ampdoc$jscomp$221$$);
  this.$O$ = null;
  this.$timer_$ = _.$Services$$module$src$services$timerFor$$($ampdoc$jscomp$221$$.$win$);
  this.$R$ = _.$JSCompiler_StaticMethods_hasCapability$$(this.$viewer_$, "auth");
  this.$V$ = _.$Services$$module$src$services$cidForDoc$$($ampdoc$jscomp$221$$);
  this.$U$ = {};
}, $JSCompiler_StaticMethods_SubscriptionService$$module$extensions$amp_subscriptions$0_1$amp_subscriptions_prototype$initialize_$$ = function($JSCompiler_StaticMethods_SubscriptionService$$module$extensions$amp_subscriptions$0_1$amp_subscriptions_prototype$initialize_$self$$) {
  if (!$JSCompiler_StaticMethods_SubscriptionService$$module$extensions$amp_subscriptions$0_1$amp_subscriptions_prototype$initialize_$self$$.$I$) {
    var $pageConfigResolver$$ = new $PageConfigResolver$$module$third_party$subscriptions_project$config$$(new _.$DocImpl$$module$extensions$amp_subscriptions$0_1$doc_impl$$($JSCompiler_StaticMethods_SubscriptionService$$module$extensions$amp_subscriptions$0_1$amp_subscriptions_prototype$initialize_$self$$.$ampdoc_$));
    $JSCompiler_StaticMethods_SubscriptionService$$module$extensions$amp_subscriptions$0_1$amp_subscriptions_prototype$initialize_$self$$.$I$ = window.Promise.all([$JSCompiler_StaticMethods_getPlatformConfig_$$($JSCompiler_StaticMethods_SubscriptionService$$module$extensions$amp_subscriptions$0_1$amp_subscriptions_prototype$initialize_$self$$), $JSCompiler_StaticMethods_resolveConfig$$($pageConfigResolver$$)]).then(function($pageConfigResolver$$) {
      $JSCompiler_StaticMethods_SubscriptionService$$module$extensions$amp_subscriptions$0_1$amp_subscriptions_prototype$initialize_$self$$.$G$ = $pageConfigResolver$$[0];
      $JSCompiler_StaticMethods_SubscriptionService$$module$extensions$amp_subscriptions$0_1$amp_subscriptions_prototype$initialize_$self$$.$J$ = $pageConfigResolver$$[1];
    });
  }
  return $JSCompiler_StaticMethods_SubscriptionService$$module$extensions$amp_subscriptions$0_1$amp_subscriptions_prototype$initialize_$self$$.$I$;
}, $JSCompiler_StaticMethods_getPlatformConfig_$$ = function($JSCompiler_StaticMethods_getPlatformConfig_$self$$) {
  return new window.Promise(function($resolve$jscomp$101$$, $reject$jscomp$36$$) {
    var $rawContent$jscomp$1$$ = _.$tryParseJson$$module$src$json$$($JSCompiler_StaticMethods_getPlatformConfig_$self$$.$P$.textContent, function($JSCompiler_StaticMethods_getPlatformConfig_$self$$) {
      $reject$jscomp$36$$('Failed to parse "amp-subscriptions" JSON: ' + $JSCompiler_StaticMethods_getPlatformConfig_$self$$);
    });
    $resolve$jscomp$101$$($rawContent$jscomp$1$$);
  });
}, $JSCompiler_StaticMethods_processGrantState_$$ = function($JSCompiler_StaticMethods_processGrantState_$self$$, $grantState$$) {
  $JSCompiler_StaticMethods_processGrantState_$self$$.$renderer_$.$toggleLoading$(!1);
  $JSCompiler_StaticMethods_Renderer$$module$extensions$amp_subscriptions$0_1$renderer_prototype$setState_$$($JSCompiler_StaticMethods_processGrantState_$self$$.$renderer_$, $grantState$$);
  $JSCompiler_StaticMethods_processGrantState_$self$$.$O$ = $JSCompiler_StaticMethods_scheduleView$$($JSCompiler_StaticMethods_processGrantState_$self$$.$aa$);
}, $JSCompiler_StaticMethods_SubscriptionService$$module$extensions$amp_subscriptions$0_1$amp_subscriptions_prototype$fetchEntitlements_$$ = function($JSCompiler_StaticMethods_SubscriptionService$$module$extensions$amp_subscriptions$0_1$amp_subscriptions_prototype$fetchEntitlements_$self$$, $subscriptionPlatform$jscomp$2$$) {
  var $timeout$jscomp$20$$ = 3000;
  _.$getMode$$module$src$mode$$().$development$ && ($timeout$jscomp$20$$ = 6E3);
  $JSCompiler_StaticMethods_SubscriptionService$$module$extensions$amp_subscriptions$0_1$amp_subscriptions_prototype$fetchEntitlements_$self$$.$viewer_$.$D$.then(function() {
    return _.$JSCompiler_StaticMethods_timeoutPromise$$($JSCompiler_StaticMethods_SubscriptionService$$module$extensions$amp_subscriptions$0_1$amp_subscriptions_prototype$fetchEntitlements_$self$$.$timer_$, $timeout$jscomp$20$$, $subscriptionPlatform$jscomp$2$$.$GoogleSubscriptionsPlatform$$module$extensions$amp_subscriptions_google$0_1$amp_subscriptions_google_prototype$getEntitlements$()).then(function($timeout$jscomp$20$$) {
      $timeout$jscomp$20$$ = $timeout$jscomp$20$$ || $Entitlement$$module$extensions$amp_subscriptions$0_1$entitlement$empty$$($subscriptionPlatform$jscomp$2$$.$getServiceId$());
      var $entitlement$jscomp$12$$ = $subscriptionPlatform$jscomp$2$$.$getServiceId$();
      $JSCompiler_StaticMethods_resolveEntitlement$$($JSCompiler_StaticMethods_SubscriptionService$$module$extensions$amp_subscriptions$0_1$amp_subscriptions_prototype$fetchEntitlements_$self$$.$D$, $entitlement$jscomp$12$$, $timeout$jscomp$20$$);
      $JSCompiler_StaticMethods_SubscriptionService$$module$extensions$amp_subscriptions$0_1$amp_subscriptions_prototype$fetchEntitlements_$self$$.$F$.$D$("subscriptions-entitlement-resolved", $entitlement$jscomp$12$$);
      return $timeout$jscomp$20$$;
    }).catch(function($timeout$jscomp$20$$) {
      var $reason$jscomp$61$$ = $subscriptionPlatform$jscomp$2$$.$getServiceId$();
      $JSCompiler_StaticMethods_reportPlatformFailureAndFallback$$($JSCompiler_StaticMethods_SubscriptionService$$module$extensions$amp_subscriptions$0_1$amp_subscriptions_prototype$fetchEntitlements_$self$$.$D$, $reason$jscomp$61$$);
      throw _.$user$$module$src$log$$().$createError$("fetch entitlements failed for " + $reason$jscomp$61$$, $timeout$jscomp$20$$);
    });
  });
}, $JSCompiler_StaticMethods_initializePlatformStore_$$ = function($JSCompiler_StaticMethods_initializePlatformStore_$self$$, $serviceIds$jscomp$1$$) {
  var $fallbackEntitlement$jscomp$1$$ = $JSCompiler_StaticMethods_initializePlatformStore_$self$$.$G$.fallbackEntitlement ? $Entitlement$$module$extensions$amp_subscriptions$0_1$entitlement$parseFromJson$$($JSCompiler_StaticMethods_initializePlatformStore_$self$$.$G$.fallbackEntitlement) : $Entitlement$$module$extensions$amp_subscriptions$0_1$entitlement$empty$$("local");
  $JSCompiler_StaticMethods_initializePlatformStore_$self$$.$D$ = new $PlatformStore$$module$extensions$amp_subscriptions$0_1$platform_store$$($serviceIds$jscomp$1$$, $JSCompiler_StaticMethods_initializePlatformStore_$self$$.$G$.score, $fallbackEntitlement$jscomp$1$$);
}, $JSCompiler_StaticMethods_delegateAuthToViewer_$$ = function($JSCompiler_StaticMethods_delegateAuthToViewer_$self$$) {
  var $origin$jscomp$41$$ = _.$getWinOrigin$$module$src$url$$($JSCompiler_StaticMethods_delegateAuthToViewer_$self$$.$ampdoc_$.$win$);
  $JSCompiler_StaticMethods_initializePlatformStore_$$($JSCompiler_StaticMethods_delegateAuthToViewer_$self$$, ["local"]);
  $JSCompiler_StaticMethods_delegateAuthToViewer_$self$$.$G$.services.forEach(function($service$jscomp$37_viewerPlatform$$) {
    "local" == ($service$jscomp$37_viewerPlatform$$.serviceId || "local") && ($service$jscomp$37_viewerPlatform$$ = new $ViewerSubscriptionPlatform$$module$extensions$amp_subscriptions$0_1$viewer_subscription_platform$$($JSCompiler_StaticMethods_delegateAuthToViewer_$self$$.$ampdoc_$, $service$jscomp$37_viewerPlatform$$, $JSCompiler_StaticMethods_delegateAuthToViewer_$self$$.$K$, $origin$jscomp$41$$), $JSCompiler_StaticMethods_resolvePlatform$$($JSCompiler_StaticMethods_delegateAuthToViewer_$self$$.$D$, 
    "local", $service$jscomp$37_viewerPlatform$$), $service$jscomp$37_viewerPlatform$$.$GoogleSubscriptionsPlatform$$module$extensions$amp_subscriptions_google$0_1$amp_subscriptions_google_prototype$getEntitlements$().then(function($origin$jscomp$41$$) {
      $JSCompiler_StaticMethods_resolveEntitlement$$($JSCompiler_StaticMethods_delegateAuthToViewer_$self$$.$D$, "local", $origin$jscomp$41$$);
    }).catch(function($origin$jscomp$41$$) {
      $JSCompiler_StaticMethods_reportPlatformFailureAndFallback$$($JSCompiler_StaticMethods_delegateAuthToViewer_$self$$.$D$, "local");
      _.$dev$$module$src$log$$().error("amp-subscriptions", "Viewer auth failed:", $origin$jscomp$41$$);
    }));
  });
}, $JSCompiler_StaticMethods_SubscriptionService$$module$extensions$amp_subscriptions$0_1$amp_subscriptions_prototype$getReaderId$$ = function($JSCompiler_StaticMethods_SubscriptionService$$module$extensions$amp_subscriptions$0_1$amp_subscriptions_prototype$getReaderId$self$$) {
  var $readerId$jscomp$2$$ = $JSCompiler_StaticMethods_SubscriptionService$$module$extensions$amp_subscriptions$0_1$amp_subscriptions_prototype$getReaderId$self$$.$U$.local;
  if (!$readerId$jscomp$2$$) {
    var $consent$jscomp$6$$ = window.Promise.resolve();
    $readerId$jscomp$2$$ = $JSCompiler_StaticMethods_SubscriptionService$$module$extensions$amp_subscriptions$0_1$amp_subscriptions_prototype$getReaderId$self$$.$V$.then(function($JSCompiler_StaticMethods_SubscriptionService$$module$extensions$amp_subscriptions$0_1$amp_subscriptions_prototype$getReaderId$self$$) {
      return $JSCompiler_StaticMethods_SubscriptionService$$module$extensions$amp_subscriptions$0_1$amp_subscriptions_prototype$getReaderId$self$$.get({scope:"amp-access", createCookieIfNotPresent:!0}, $consent$jscomp$6$$);
    });
    $JSCompiler_StaticMethods_SubscriptionService$$module$extensions$amp_subscriptions$0_1$amp_subscriptions_prototype$getReaderId$self$$.$U$.local = $readerId$jscomp$2$$;
  }
  return $readerId$jscomp$2$$;
}, $JSCompiler_StaticMethods_startAuthorizationFlow_$$ = function($JSCompiler_StaticMethods_startAuthorizationFlow_$self$$, $doPlatformSelection$$) {
  $doPlatformSelection$$ = void 0 === $doPlatformSelection$$ ? !0 : $doPlatformSelection$$;
  $JSCompiler_StaticMethods_getGrantStatus$$($JSCompiler_StaticMethods_startAuthorizationFlow_$self$$.$D$).then(function($doPlatformSelection$$) {
    $JSCompiler_StaticMethods_processGrantState_$$($JSCompiler_StaticMethods_startAuthorizationFlow_$self$$, $doPlatformSelection$$);
    $JSCompiler_StaticMethods_performPingback_$$($JSCompiler_StaticMethods_startAuthorizationFlow_$self$$);
  });
  $doPlatformSelection$$ && $JSCompiler_StaticMethods_selectAndActivatePlatform_$$($JSCompiler_StaticMethods_startAuthorizationFlow_$self$$);
}, $JSCompiler_StaticMethods_selectAndActivatePlatform_$$ = function($JSCompiler_StaticMethods_selectAndActivatePlatform_$self$$) {
  window.Promise.all([$JSCompiler_StaticMethods_getGrantStatus$$($JSCompiler_StaticMethods_selectAndActivatePlatform_$self$$.$D$), $JSCompiler_StaticMethods_selectPlatform$$($JSCompiler_StaticMethods_selectAndActivatePlatform_$self$$.$D$), $JSCompiler_StaticMethods_getGrantEntitlement$$($JSCompiler_StaticMethods_selectAndActivatePlatform_$self$$.$D$)]).then(function($grantEntitlement$jscomp$1_resolvedValues$$) {
    var $selectedPlatform$jscomp$1$$ = $grantEntitlement$jscomp$1_resolvedValues$$[1];
    $grantEntitlement$jscomp$1_resolvedValues$$ = $grantEntitlement$jscomp$1_resolvedValues$$[2];
    var $selectedEntitlement$jscomp$1$$ = $JSCompiler_StaticMethods_selectAndActivatePlatform_$self$$.$D$.$G$[$selectedPlatform$jscomp$1$$.$getServiceId$()], $bestEntitlement$$ = $grantEntitlement$jscomp$1_resolvedValues$$ || $selectedEntitlement$jscomp$1$$;
    $selectedPlatform$jscomp$1$$.$activate$($selectedEntitlement$jscomp$1$$, $grantEntitlement$jscomp$1_resolvedValues$$);
    $JSCompiler_StaticMethods_selectAndActivatePlatform_$self$$.$F$.$D$("subscriptions-service-activated", $selectedPlatform$jscomp$1$$.$getServiceId$());
    $JSCompiler_StaticMethods_selectAndActivatePlatform_$self$$.$F$.$D$("subscriptions-platform-activated", $selectedPlatform$jscomp$1$$.$getServiceId$());
    $bestEntitlement$$.$granted$ ? $JSCompiler_StaticMethods_selectAndActivatePlatform_$self$$.$F$.$D$("subscriptions-access-granted", $bestEntitlement$$.$service$) : ($JSCompiler_StaticMethods_selectAndActivatePlatform_$self$$.$F$.$D$("subscriptions-paywall-activated", $selectedPlatform$jscomp$1$$.$getServiceId$()), $JSCompiler_StaticMethods_selectAndActivatePlatform_$self$$.$F$.$D$("subscriptions-access-denied", $selectedPlatform$jscomp$1$$.$getServiceId$()));
  });
}, $JSCompiler_StaticMethods_performPingback_$$ = function($JSCompiler_StaticMethods_performPingback_$self$$) {
  $JSCompiler_StaticMethods_performPingback_$self$$.$O$ && $JSCompiler_StaticMethods_performPingback_$self$$.$O$.then(function() {
    return $JSCompiler_StaticMethods_getGrantEntitlement$$($JSCompiler_StaticMethods_performPingback_$self$$.$D$);
  }).then(function($grantStateEntitlement$$) {
    var $localPlatform$jscomp$2$$ = $JSCompiler_StaticMethods_performPingback_$self$$.$D$.$D$.local;
    $localPlatform$jscomp$2$$.$GoogleSubscriptionsPlatform$$module$extensions$amp_subscriptions_google$0_1$amp_subscriptions_google_prototype$isPingbackEnabled$() && $localPlatform$jscomp$2$$.$GoogleSubscriptionsPlatform$$module$extensions$amp_subscriptions_google$0_1$amp_subscriptions_google_prototype$pingback$($grantStateEntitlement$$ || $Entitlement$$module$extensions$amp_subscriptions$0_1$entitlement$empty$$("local"));
  });
}, $JSCompiler_StaticMethods_SubscriptionService$$module$extensions$amp_subscriptions$0_1$amp_subscriptions_prototype$resetPlatforms$$ = function($JSCompiler_StaticMethods_SubscriptionService$$module$extensions$amp_subscriptions$0_1$amp_subscriptions_prototype$resetPlatforms$self$$) {
  $JSCompiler_StaticMethods_SubscriptionService$$module$extensions$amp_subscriptions$0_1$amp_subscriptions_prototype$resetPlatforms$self$$.$D$ = $JSCompiler_StaticMethods_resetPlatformStore$$($JSCompiler_StaticMethods_SubscriptionService$$module$extensions$amp_subscriptions$0_1$amp_subscriptions_prototype$resetPlatforms$self$$.$D$);
  $JSCompiler_StaticMethods_SubscriptionService$$module$extensions$amp_subscriptions$0_1$amp_subscriptions_prototype$resetPlatforms$self$$.$renderer_$.$toggleLoading$(!0);
  $JSCompiler_StaticMethods_getAvailablePlatforms$$($JSCompiler_StaticMethods_SubscriptionService$$module$extensions$amp_subscriptions$0_1$amp_subscriptions_prototype$resetPlatforms$self$$.$D$).forEach(function($subscriptionPlatform$jscomp$4$$) {
    $JSCompiler_StaticMethods_SubscriptionService$$module$extensions$amp_subscriptions$0_1$amp_subscriptions_prototype$fetchEntitlements_$$($JSCompiler_StaticMethods_SubscriptionService$$module$extensions$amp_subscriptions$0_1$amp_subscriptions_prototype$resetPlatforms$self$$, $subscriptionPlatform$jscomp$4$$);
  });
  $JSCompiler_StaticMethods_SubscriptionService$$module$extensions$amp_subscriptions$0_1$amp_subscriptions_prototype$resetPlatforms$self$$.$F$.$D$("subscriptions-service-re-authorized", "");
  $JSCompiler_StaticMethods_SubscriptionService$$module$extensions$amp_subscriptions$0_1$amp_subscriptions_prototype$resetPlatforms$self$$.$F$.$D$("subscriptions-platform-re-authorized", "");
  $JSCompiler_StaticMethods_startAuthorizationFlow_$$($JSCompiler_StaticMethods_SubscriptionService$$module$extensions$amp_subscriptions$0_1$amp_subscriptions_prototype$resetPlatforms$self$$);
}, $JSCompiler_StaticMethods_SubscriptionService$$module$extensions$amp_subscriptions$0_1$amp_subscriptions_prototype$delegateActionToService$$ = function($JSCompiler_StaticMethods_SubscriptionService$$module$extensions$amp_subscriptions$0_1$amp_subscriptions_prototype$delegateActionToService$self$$, $action$jscomp$38$$, $serviceId$jscomp$17$$) {
  return new window.Promise(function($resolve$jscomp$102$$) {
    $JSCompiler_StaticMethods_onPlatformResolves$$($JSCompiler_StaticMethods_SubscriptionService$$module$extensions$amp_subscriptions$0_1$amp_subscriptions_prototype$delegateActionToService$self$$.$D$, $serviceId$jscomp$17$$, function($platform$jscomp$26$$) {
      $JSCompiler_StaticMethods_SubscriptionService$$module$extensions$amp_subscriptions$0_1$amp_subscriptions_prototype$delegateActionToService$self$$.$F$.event("subscriptions-action-delegated", _.$dict$$module$src$utils$object$$({action:$action$jscomp$38$$, serviceId:$serviceId$jscomp$17$$}));
      $resolve$jscomp$102$$($platform$jscomp$26$$.$executeAction$($action$jscomp$38$$));
    });
  });
}, $JSCompiler_StaticMethods_SubscriptionService$$module$extensions$amp_subscriptions$0_1$amp_subscriptions_prototype$decorateServiceAction$$ = function($JSCompiler_StaticMethods_SubscriptionService$$module$extensions$amp_subscriptions$0_1$amp_subscriptions_prototype$decorateServiceAction$self$$, $element$jscomp$646$$, $serviceId$jscomp$18$$, $action$jscomp$39$$) {
  $JSCompiler_StaticMethods_onPlatformResolves$$($JSCompiler_StaticMethods_SubscriptionService$$module$extensions$amp_subscriptions$0_1$amp_subscriptions_prototype$decorateServiceAction$self$$.$D$, $serviceId$jscomp$18$$, function($JSCompiler_StaticMethods_SubscriptionService$$module$extensions$amp_subscriptions$0_1$amp_subscriptions_prototype$decorateServiceAction$self$$) {
    $JSCompiler_StaticMethods_SubscriptionService$$module$extensions$amp_subscriptions$0_1$amp_subscriptions_prototype$decorateServiceAction$self$$.$decorateUI$($element$jscomp$646$$, $action$jscomp$39$$, null);
  });
};
_.$DocImpl$$module$extensions$amp_subscriptions$0_1$doc_impl$$.prototype.$Doc$$module$third_party$subscriptions_project$config_prototype$isReady$ = _.$JSCompiler_unstubMethod$$(54, function() {
  return this.$ampdoc_$.$AmpDoc$$module$src$service$ampdoc_impl_prototype$isReady$();
});
_.$AmpDoc$$module$src$service$ampdoc_impl$$.prototype.$AmpDoc$$module$src$service$ampdoc_impl_prototype$isReady$ = _.$JSCompiler_unstubMethod$$(48, function() {
  return null;
});
_.$AmpDocSingle$$module$src$service$ampdoc_impl$$.prototype.$AmpDoc$$module$src$service$ampdoc_impl_prototype$isReady$ = _.$JSCompiler_unstubMethod$$(47, function() {
  return _.$isDocumentReady$$module$src$document_ready$$(this.$win$.document);
});
_.$AmpDocShadow$$module$src$service$ampdoc_impl$$.prototype.$AmpDoc$$module$src$service$ampdoc_impl_prototype$isReady$ = _.$JSCompiler_unstubMethod$$(46, function() {
  return this.$ready_$;
});
_.$BaseElement$$module$src$base_element$$.prototype.$activate$ = _.$JSCompiler_unstubMethod$$(6, function() {
});
_.$JSCompiler_prototypeAlias$$ = $GlobalDoc$$module$third_party$subscriptions_project$config$$.prototype;
_.$JSCompiler_prototypeAlias$$.$getWin$ = function() {
  return this.$D$;
};
_.$JSCompiler_prototypeAlias$$.getRootNode = function() {
  return this.$doc_$;
};
_.$JSCompiler_prototypeAlias$$.$getRootElement$ = function() {
  return this.$doc_$.documentElement;
};
_.$JSCompiler_prototypeAlias$$.$getHead$ = function() {
  return this.$doc_$.head;
};
_.$JSCompiler_prototypeAlias$$.$getBody$ = function() {
  return this.$doc_$.body;
};
_.$JSCompiler_prototypeAlias$$.$Doc$$module$third_party$subscriptions_project$config_prototype$isReady$ = function() {
  return $isDocumentReady$$module$third_party$subscriptions_project$config$$(this.$doc_$);
};
_.$JSCompiler_prototypeAlias$$.$whenReady$ = function() {
  return $whenDocumentReady$$module$third_party$subscriptions_project$config$$(this.$doc_$);
};
$PageConfigResolver$$module$third_party$subscriptions_project$config$$.prototype.$F$ = function() {
  if (!this.$D$) {
    return null;
  }
  var $JSCompiler_StaticMethods_MicrodataParser$$module$third_party$subscriptions_project$config_prototype$check$self$jscomp$inline_4932_JSCompiler_temp$jscomp$5683_config$jscomp$12_domReady$jscomp$inline_4926_productId$jscomp$inline_4922$$;
  var $JSCompiler_StaticMethods_JsonLdParser$$module$third_party$subscriptions_project$config_prototype$check$self$jscomp$inline_4925_JSCompiler_StaticMethods_MetaParser$$module$third_party$subscriptions_project$config_prototype$check$self$jscomp$inline_4921_accessibleForFree$jscomp$inline_4923_elements$jscomp$inline_4927_nodeList$jscomp$inline_6537$$ = this.$J$;
  $JSCompiler_StaticMethods_JsonLdParser$$module$third_party$subscriptions_project$config_prototype$check$self$jscomp$inline_4925_JSCompiler_StaticMethods_MetaParser$$module$third_party$subscriptions_project$config_prototype$check$self$jscomp$inline_4921_accessibleForFree$jscomp$inline_4923_elements$jscomp$inline_4927_nodeList$jscomp$inline_6537$$.$doc_$.$getBody$() ? ($JSCompiler_StaticMethods_MicrodataParser$$module$third_party$subscriptions_project$config_prototype$check$self$jscomp$inline_4932_JSCompiler_temp$jscomp$5683_config$jscomp$12_domReady$jscomp$inline_4926_productId$jscomp$inline_4922$$ = 
  $getMetaTag$$module$third_party$subscriptions_project$config$$($JSCompiler_StaticMethods_JsonLdParser$$module$third_party$subscriptions_project$config_prototype$check$self$jscomp$inline_4925_JSCompiler_StaticMethods_MetaParser$$module$third_party$subscriptions_project$config_prototype$check$self$jscomp$inline_4921_accessibleForFree$jscomp$inline_4923_elements$jscomp$inline_4927_nodeList$jscomp$inline_6537$$.$doc_$.getRootNode(), "subscriptions-product-id")) ? ($JSCompiler_StaticMethods_JsonLdParser$$module$third_party$subscriptions_project$config_prototype$check$self$jscomp$inline_4925_JSCompiler_StaticMethods_MetaParser$$module$third_party$subscriptions_project$config_prototype$check$self$jscomp$inline_4921_accessibleForFree$jscomp$inline_4923_elements$jscomp$inline_4927_nodeList$jscomp$inline_6537$$ = 
  $getMetaTag$$module$third_party$subscriptions_project$config$$($JSCompiler_StaticMethods_JsonLdParser$$module$third_party$subscriptions_project$config_prototype$check$self$jscomp$inline_4925_JSCompiler_StaticMethods_MetaParser$$module$third_party$subscriptions_project$config_prototype$check$self$jscomp$inline_4921_accessibleForFree$jscomp$inline_4923_elements$jscomp$inline_4927_nodeList$jscomp$inline_6537$$.$doc_$.getRootNode(), "subscriptions-accessible-for-free"), $JSCompiler_StaticMethods_MicrodataParser$$module$third_party$subscriptions_project$config_prototype$check$self$jscomp$inline_4932_JSCompiler_temp$jscomp$5683_config$jscomp$12_domReady$jscomp$inline_4926_productId$jscomp$inline_4922$$ = 
  new $PageConfig$$module$third_party$subscriptions_project$config$$($JSCompiler_StaticMethods_MicrodataParser$$module$third_party$subscriptions_project$config_prototype$check$self$jscomp$inline_4932_JSCompiler_temp$jscomp$5683_config$jscomp$12_domReady$jscomp$inline_4926_productId$jscomp$inline_4922$$, $JSCompiler_StaticMethods_JsonLdParser$$module$third_party$subscriptions_project$config_prototype$check$self$jscomp$inline_4925_JSCompiler_StaticMethods_MetaParser$$module$third_party$subscriptions_project$config_prototype$check$self$jscomp$inline_4921_accessibleForFree$jscomp$inline_4923_elements$jscomp$inline_4927_nodeList$jscomp$inline_6537$$ && 
  "false" == $JSCompiler_StaticMethods_JsonLdParser$$module$third_party$subscriptions_project$config_prototype$check$self$jscomp$inline_4925_JSCompiler_StaticMethods_MetaParser$$module$third_party$subscriptions_project$config_prototype$check$self$jscomp$inline_4921_accessibleForFree$jscomp$inline_4923_elements$jscomp$inline_4927_nodeList$jscomp$inline_6537$$.toLowerCase() || !1)) : $JSCompiler_StaticMethods_MicrodataParser$$module$third_party$subscriptions_project$config_prototype$check$self$jscomp$inline_4932_JSCompiler_temp$jscomp$5683_config$jscomp$12_domReady$jscomp$inline_4926_productId$jscomp$inline_4922$$ = 
  null : $JSCompiler_StaticMethods_MicrodataParser$$module$third_party$subscriptions_project$config_prototype$check$self$jscomp$inline_4932_JSCompiler_temp$jscomp$5683_config$jscomp$12_domReady$jscomp$inline_4926_productId$jscomp$inline_4922$$ = null;
  if (!$JSCompiler_StaticMethods_MicrodataParser$$module$third_party$subscriptions_project$config_prototype$check$self$jscomp$inline_4932_JSCompiler_temp$jscomp$5683_config$jscomp$12_domReady$jscomp$inline_4926_productId$jscomp$inline_4922$$) {
    a: {
      $JSCompiler_StaticMethods_JsonLdParser$$module$third_party$subscriptions_project$config_prototype$check$self$jscomp$inline_4925_JSCompiler_StaticMethods_MetaParser$$module$third_party$subscriptions_project$config_prototype$check$self$jscomp$inline_4921_accessibleForFree$jscomp$inline_4923_elements$jscomp$inline_4927_nodeList$jscomp$inline_6537$$ = this.$I$;
      if ($JSCompiler_StaticMethods_JsonLdParser$$module$third_party$subscriptions_project$config_prototype$check$self$jscomp$inline_4925_JSCompiler_StaticMethods_MetaParser$$module$third_party$subscriptions_project$config_prototype$check$self$jscomp$inline_4921_accessibleForFree$jscomp$inline_4923_elements$jscomp$inline_4927_nodeList$jscomp$inline_6537$$.$doc_$.$getBody$()) {
        $JSCompiler_StaticMethods_MicrodataParser$$module$third_party$subscriptions_project$config_prototype$check$self$jscomp$inline_4932_JSCompiler_temp$jscomp$5683_config$jscomp$12_domReady$jscomp$inline_4926_productId$jscomp$inline_4922$$ = $JSCompiler_StaticMethods_JsonLdParser$$module$third_party$subscriptions_project$config_prototype$check$self$jscomp$inline_4925_JSCompiler_StaticMethods_MetaParser$$module$third_party$subscriptions_project$config_prototype$check$self$jscomp$inline_4921_accessibleForFree$jscomp$inline_4923_elements$jscomp$inline_4927_nodeList$jscomp$inline_6537$$.$doc_$.$Doc$$module$third_party$subscriptions_project$config_prototype$isReady$();
        $JSCompiler_StaticMethods_JsonLdParser$$module$third_party$subscriptions_project$config_prototype$check$self$jscomp$inline_4925_JSCompiler_StaticMethods_MetaParser$$module$third_party$subscriptions_project$config_prototype$check$self$jscomp$inline_4921_accessibleForFree$jscomp$inline_4923_elements$jscomp$inline_4927_nodeList$jscomp$inline_6537$$ = $JSCompiler_StaticMethods_JsonLdParser$$module$third_party$subscriptions_project$config_prototype$check$self$jscomp$inline_4925_JSCompiler_StaticMethods_MetaParser$$module$third_party$subscriptions_project$config_prototype$check$self$jscomp$inline_4921_accessibleForFree$jscomp$inline_4923_elements$jscomp$inline_4927_nodeList$jscomp$inline_6537$$.$doc_$.getRootNode().querySelectorAll('script[type="application/ld+json"]');
        for (var $i$jscomp$inline_4928_i$jscomp$inline_6538$$ = 0; $i$jscomp$inline_4928_i$jscomp$inline_6538$$ < $JSCompiler_StaticMethods_JsonLdParser$$module$third_party$subscriptions_project$config_prototype$check$self$jscomp$inline_4925_JSCompiler_StaticMethods_MetaParser$$module$third_party$subscriptions_project$config_prototype$check$self$jscomp$inline_4921_accessibleForFree$jscomp$inline_4923_elements$jscomp$inline_4927_nodeList$jscomp$inline_6537$$.length; $i$jscomp$inline_4928_i$jscomp$inline_6538$$++) {
          var $JSCompiler_inline_result$jscomp$5682_JSCompiler_inline_result$jscomp$6682_config$jscomp$inline_6536_element$jscomp$inline_4929_element$jscomp$inline_6539_json$jscomp$inline_6525_nodeList$jscomp$inline_6807_possibleConfig$jscomp$inline_4930_value$jscomp$inline_6797$$ = $JSCompiler_StaticMethods_JsonLdParser$$module$third_party$subscriptions_project$config_prototype$check$self$jscomp$inline_4925_JSCompiler_StaticMethods_MetaParser$$module$third_party$subscriptions_project$config_prototype$check$self$jscomp$inline_4921_accessibleForFree$jscomp$inline_4923_elements$jscomp$inline_4927_nodeList$jscomp$inline_6537$$[$i$jscomp$inline_4928_i$jscomp$inline_6538$$], 
          $JSCompiler_inline_result$jscomp$inline_6524_JSCompiler_temp$jscomp$5680_JSCompiler_temp$jscomp$5681_JSCompiler_temp_const$jscomp$6679_JSCompiler_temp_const$jscomp$6681_currentElement$jscomp$inline_6520_json$jscomp$inline_6530_productId$jscomp$inline_6526$$;
          if (($JSCompiler_inline_result$jscomp$inline_6524_JSCompiler_temp$jscomp$5680_JSCompiler_temp$jscomp$5681_JSCompiler_temp_const$jscomp$6679_JSCompiler_temp_const$jscomp$6681_currentElement$jscomp$inline_6520_json$jscomp$inline_6530_productId$jscomp$inline_6526$$ = !$JSCompiler_inline_result$jscomp$5682_JSCompiler_inline_result$jscomp$6682_config$jscomp$inline_6536_element$jscomp$inline_4929_element$jscomp$inline_6539_json$jscomp$inline_6525_nodeList$jscomp$inline_6807_possibleConfig$jscomp$inline_4930_value$jscomp$inline_6797$$["__SWG-SEEN__"] && 
          $JSCompiler_inline_result$jscomp$5682_JSCompiler_inline_result$jscomp$6682_config$jscomp$inline_6536_element$jscomp$inline_4929_element$jscomp$inline_6539_json$jscomp$inline_6525_nodeList$jscomp$inline_6807_possibleConfig$jscomp$inline_4930_value$jscomp$inline_6797$$.textContent) && !($JSCompiler_inline_result$jscomp$inline_6524_JSCompiler_temp$jscomp$5680_JSCompiler_temp$jscomp$5681_JSCompiler_temp_const$jscomp$6679_JSCompiler_temp_const$jscomp$6681_currentElement$jscomp$inline_6520_json$jscomp$inline_6530_productId$jscomp$inline_6526$$ = 
          $JSCompiler_StaticMethods_MicrodataParser$$module$third_party$subscriptions_project$config_prototype$check$self$jscomp$inline_4932_JSCompiler_temp$jscomp$5683_config$jscomp$12_domReady$jscomp$inline_4926_productId$jscomp$inline_4922$$)) {
            b: {
              $JSCompiler_inline_result$jscomp$inline_6524_JSCompiler_temp$jscomp$5680_JSCompiler_temp$jscomp$5681_JSCompiler_temp_const$jscomp$6679_JSCompiler_temp_const$jscomp$6681_currentElement$jscomp$inline_6520_json$jscomp$inline_6530_productId$jscomp$inline_6526$$ = $JSCompiler_inline_result$jscomp$5682_JSCompiler_inline_result$jscomp$6682_config$jscomp$inline_6536_element$jscomp$inline_4929_element$jscomp$inline_6539_json$jscomp$inline_6525_nodeList$jscomp$inline_6807_possibleConfig$jscomp$inline_4930_value$jscomp$inline_6797$$;
              do {
                if ($JSCompiler_inline_result$jscomp$inline_6524_JSCompiler_temp$jscomp$5680_JSCompiler_temp$jscomp$5681_JSCompiler_temp_const$jscomp$6679_JSCompiler_temp_const$jscomp$6681_currentElement$jscomp$inline_6520_json$jscomp$inline_6530_productId$jscomp$inline_6526$$.nextSibling) {
                  $JSCompiler_inline_result$jscomp$inline_6524_JSCompiler_temp$jscomp$5680_JSCompiler_temp$jscomp$5681_JSCompiler_temp_const$jscomp$6679_JSCompiler_temp_const$jscomp$6681_currentElement$jscomp$inline_6520_json$jscomp$inline_6530_productId$jscomp$inline_6526$$ = !0;
                  break b;
                }
              } while (($JSCompiler_inline_result$jscomp$inline_6524_JSCompiler_temp$jscomp$5680_JSCompiler_temp$jscomp$5681_JSCompiler_temp_const$jscomp$6679_JSCompiler_temp_const$jscomp$6681_currentElement$jscomp$inline_6520_json$jscomp$inline_6530_productId$jscomp$inline_6526$$ = $JSCompiler_inline_result$jscomp$inline_6524_JSCompiler_temp$jscomp$5680_JSCompiler_temp$jscomp$5681_JSCompiler_temp_const$jscomp$6679_JSCompiler_temp_const$jscomp$6681_currentElement$jscomp$inline_6520_json$jscomp$inline_6530_productId$jscomp$inline_6526$$.parentNode) && 
              void 0 != $JSCompiler_inline_result$jscomp$inline_6524_JSCompiler_temp$jscomp$5680_JSCompiler_temp$jscomp$5681_JSCompiler_temp_const$jscomp$6679_JSCompiler_temp_const$jscomp$6681_currentElement$jscomp$inline_6520_json$jscomp$inline_6530_productId$jscomp$inline_6526$$);
              $JSCompiler_inline_result$jscomp$inline_6524_JSCompiler_temp$jscomp$5680_JSCompiler_temp$jscomp$5681_JSCompiler_temp_const$jscomp$6679_JSCompiler_temp_const$jscomp$6681_currentElement$jscomp$inline_6520_json$jscomp$inline_6530_productId$jscomp$inline_6526$$ = !1;
            }
          }
          if ($JSCompiler_inline_result$jscomp$inline_6524_JSCompiler_temp$jscomp$5680_JSCompiler_temp$jscomp$5681_JSCompiler_temp_const$jscomp$6679_JSCompiler_temp_const$jscomp$6681_currentElement$jscomp$inline_6520_json$jscomp$inline_6530_productId$jscomp$inline_6526$$ && ($JSCompiler_inline_result$jscomp$5682_JSCompiler_inline_result$jscomp$6682_config$jscomp$inline_6536_element$jscomp$inline_4929_element$jscomp$inline_6539_json$jscomp$inline_6525_nodeList$jscomp$inline_6807_possibleConfig$jscomp$inline_4930_value$jscomp$inline_6797$$["__SWG-SEEN__"] = 
          !0, -1 != $JSCompiler_inline_result$jscomp$5682_JSCompiler_inline_result$jscomp$6682_config$jscomp$inline_6536_element$jscomp$inline_4929_element$jscomp$inline_6539_json$jscomp$inline_6525_nodeList$jscomp$inline_6807_possibleConfig$jscomp$inline_4930_value$jscomp$inline_6797$$.textContent.indexOf("NewsArticle"))) {
            $JSCompiler_inline_result$jscomp$inline_6524_JSCompiler_temp$jscomp$5680_JSCompiler_temp$jscomp$5681_JSCompiler_temp_const$jscomp$6679_JSCompiler_temp_const$jscomp$6681_currentElement$jscomp$inline_6520_json$jscomp$inline_6530_productId$jscomp$inline_6526$$ = void 0;
            c: {
              try {
                $JSCompiler_inline_result$jscomp$inline_6524_JSCompiler_temp$jscomp$5680_JSCompiler_temp$jscomp$5681_JSCompiler_temp_const$jscomp$6679_JSCompiler_temp_const$jscomp$6681_currentElement$jscomp$inline_6520_json$jscomp$inline_6530_productId$jscomp$inline_6526$$ = JSON.parse($JSCompiler_inline_result$jscomp$5682_JSCompiler_inline_result$jscomp$6682_config$jscomp$inline_6536_element$jscomp$inline_4929_element$jscomp$inline_6539_json$jscomp$inline_6525_nodeList$jscomp$inline_6807_possibleConfig$jscomp$inline_4930_value$jscomp$inline_6797$$.textContent);
                break c;
              } catch ($e$198$jscomp$inline_6532$$) {
              }
              $JSCompiler_inline_result$jscomp$inline_6524_JSCompiler_temp$jscomp$5680_JSCompiler_temp$jscomp$5681_JSCompiler_temp_const$jscomp$6679_JSCompiler_temp_const$jscomp$6681_currentElement$jscomp$inline_6520_json$jscomp$inline_6530_productId$jscomp$inline_6526$$ = void 0;
            }
            if (($JSCompiler_inline_result$jscomp$5682_JSCompiler_inline_result$jscomp$6682_config$jscomp$inline_6536_element$jscomp$inline_4929_element$jscomp$inline_6539_json$jscomp$inline_6525_nodeList$jscomp$inline_6807_possibleConfig$jscomp$inline_4930_value$jscomp$inline_6797$$ = $JSCompiler_inline_result$jscomp$inline_6524_JSCompiler_temp$jscomp$5680_JSCompiler_temp$jscomp$5681_JSCompiler_temp_const$jscomp$6679_JSCompiler_temp_const$jscomp$6681_currentElement$jscomp$inline_6520_json$jscomp$inline_6530_productId$jscomp$inline_6526$$) && 
            $JSCompiler_StaticMethods_checkType_$$($JSCompiler_inline_result$jscomp$5682_JSCompiler_inline_result$jscomp$6682_config$jscomp$inline_6536_element$jscomp$inline_4929_element$jscomp$inline_6539_json$jscomp$inline_6525_nodeList$jscomp$inline_6807_possibleConfig$jscomp$inline_4930_value$jscomp$inline_6797$$, "NewsArticle")) {
              $JSCompiler_inline_result$jscomp$inline_6524_JSCompiler_temp$jscomp$5680_JSCompiler_temp$jscomp$5681_JSCompiler_temp_const$jscomp$6679_JSCompiler_temp_const$jscomp$6681_currentElement$jscomp$inline_6520_json$jscomp$inline_6530_productId$jscomp$inline_6526$$ = null;
              var $JSCompiler_inline_result$jscomp$6680_content$jscomp$inline_6803_i$jscomp$inline_6808_partOfArray$jscomp$inline_6527$$ = $JSCompiler_StaticMethods_valueArray_$$($JSCompiler_inline_result$jscomp$5682_JSCompiler_inline_result$jscomp$6682_config$jscomp$inline_6536_element$jscomp$inline_4929_element$jscomp$inline_6539_json$jscomp$inline_6525_nodeList$jscomp$inline_6807_possibleConfig$jscomp$inline_4930_value$jscomp$inline_6797$$, "isPartOf");
              if ($JSCompiler_inline_result$jscomp$6680_content$jscomp$inline_6803_i$jscomp$inline_6808_partOfArray$jscomp$inline_6527$$) {
                for (var $accessForFree$jscomp$inline_6804_content$jscomp$inline_6810_i$jscomp$inline_6528_nodeList$jscomp$inline_6800$$ = 0; $accessForFree$jscomp$inline_6804_content$jscomp$inline_6810_i$jscomp$inline_6528_nodeList$jscomp$inline_6800$$ < $JSCompiler_inline_result$jscomp$6680_content$jscomp$inline_6803_i$jscomp$inline_6808_partOfArray$jscomp$inline_6527$$.length && !($JSCompiler_inline_result$jscomp$inline_6524_JSCompiler_temp$jscomp$5680_JSCompiler_temp$jscomp$5681_JSCompiler_temp_const$jscomp$6679_JSCompiler_temp_const$jscomp$6681_currentElement$jscomp$inline_6520_json$jscomp$inline_6530_productId$jscomp$inline_6526$$ = 
                $JSCompiler_inline_result$jscomp$6680_content$jscomp$inline_6803_i$jscomp$inline_6808_partOfArray$jscomp$inline_6527$$[$accessForFree$jscomp$inline_6804_content$jscomp$inline_6810_i$jscomp$inline_6528_nodeList$jscomp$inline_6800$$], $JSCompiler_inline_result$jscomp$inline_6524_JSCompiler_temp$jscomp$5680_JSCompiler_temp$jscomp$5681_JSCompiler_temp_const$jscomp$6679_JSCompiler_temp_const$jscomp$6681_currentElement$jscomp$inline_6520_json$jscomp$inline_6530_productId$jscomp$inline_6526$$ = 
                $JSCompiler_StaticMethods_checkType_$$($JSCompiler_inline_result$jscomp$inline_6524_JSCompiler_temp$jscomp$5680_JSCompiler_temp$jscomp$5681_JSCompiler_temp_const$jscomp$6679_JSCompiler_temp_const$jscomp$6681_currentElement$jscomp$inline_6520_json$jscomp$inline_6530_productId$jscomp$inline_6526$$, "Product") ? $JSCompiler_StaticMethods_singleValue_$$($JSCompiler_inline_result$jscomp$inline_6524_JSCompiler_temp$jscomp$5680_JSCompiler_temp$jscomp$5681_JSCompiler_temp_const$jscomp$6679_JSCompiler_temp_const$jscomp$6681_currentElement$jscomp$inline_6520_json$jscomp$inline_6530_productId$jscomp$inline_6526$$, 
                "productID") : null); $accessForFree$jscomp$inline_6804_content$jscomp$inline_6810_i$jscomp$inline_6528_nodeList$jscomp$inline_6800$$++) {
                }
              }
              $JSCompiler_inline_result$jscomp$inline_6524_JSCompiler_temp$jscomp$5680_JSCompiler_temp$jscomp$5681_JSCompiler_temp_const$jscomp$6679_JSCompiler_temp_const$jscomp$6681_currentElement$jscomp$inline_6520_json$jscomp$inline_6530_productId$jscomp$inline_6526$$ ? ($JSCompiler_inline_result$jscomp$5682_JSCompiler_inline_result$jscomp$6682_config$jscomp$inline_6536_element$jscomp$inline_4929_element$jscomp$inline_6539_json$jscomp$inline_6525_nodeList$jscomp$inline_6807_possibleConfig$jscomp$inline_4930_value$jscomp$inline_6797$$ = 
              $JSCompiler_StaticMethods_singleValue_$$($JSCompiler_inline_result$jscomp$5682_JSCompiler_inline_result$jscomp$6682_config$jscomp$inline_6536_element$jscomp$inline_4929_element$jscomp$inline_6539_json$jscomp$inline_6525_nodeList$jscomp$inline_6807_possibleConfig$jscomp$inline_4930_value$jscomp$inline_6797$$, "isAccessibleForFree"), $JSCompiler_inline_result$jscomp$5682_JSCompiler_inline_result$jscomp$6682_config$jscomp$inline_6536_element$jscomp$inline_4929_element$jscomp$inline_6539_json$jscomp$inline_6525_nodeList$jscomp$inline_6807_possibleConfig$jscomp$inline_4930_value$jscomp$inline_6797$$ = 
              new $PageConfig$$module$third_party$subscriptions_project$config$$($JSCompiler_inline_result$jscomp$inline_6524_JSCompiler_temp$jscomp$5680_JSCompiler_temp$jscomp$5681_JSCompiler_temp_const$jscomp$6679_JSCompiler_temp_const$jscomp$6681_currentElement$jscomp$inline_6520_json$jscomp$inline_6530_productId$jscomp$inline_6526$$, !(null == $JSCompiler_inline_result$jscomp$5682_JSCompiler_inline_result$jscomp$6682_config$jscomp$inline_6536_element$jscomp$inline_4929_element$jscomp$inline_6539_json$jscomp$inline_6525_nodeList$jscomp$inline_6807_possibleConfig$jscomp$inline_4930_value$jscomp$inline_6797$$ || 
              "" === $JSCompiler_inline_result$jscomp$5682_JSCompiler_inline_result$jscomp$6682_config$jscomp$inline_6536_element$jscomp$inline_4929_element$jscomp$inline_6539_json$jscomp$inline_6525_nodeList$jscomp$inline_6807_possibleConfig$jscomp$inline_4930_value$jscomp$inline_6797$$ || ("boolean" == typeof $JSCompiler_inline_result$jscomp$5682_JSCompiler_inline_result$jscomp$6682_config$jscomp$inline_6536_element$jscomp$inline_4929_element$jscomp$inline_6539_json$jscomp$inline_6525_nodeList$jscomp$inline_6807_possibleConfig$jscomp$inline_4930_value$jscomp$inline_6797$$ ? 
              $JSCompiler_inline_result$jscomp$5682_JSCompiler_inline_result$jscomp$6682_config$jscomp$inline_6536_element$jscomp$inline_4929_element$jscomp$inline_6539_json$jscomp$inline_6525_nodeList$jscomp$inline_6807_possibleConfig$jscomp$inline_4930_value$jscomp$inline_6797$$ : "string" != typeof $JSCompiler_inline_result$jscomp$5682_JSCompiler_inline_result$jscomp$6682_config$jscomp$inline_6536_element$jscomp$inline_4929_element$jscomp$inline_6539_json$jscomp$inline_6525_nodeList$jscomp$inline_6807_possibleConfig$jscomp$inline_4930_value$jscomp$inline_6797$$ || 
              "false" != $JSCompiler_inline_result$jscomp$5682_JSCompiler_inline_result$jscomp$6682_config$jscomp$inline_6536_element$jscomp$inline_4929_element$jscomp$inline_6539_json$jscomp$inline_6525_nodeList$jscomp$inline_6807_possibleConfig$jscomp$inline_4930_value$jscomp$inline_6797$$.toLowerCase())))) : $JSCompiler_inline_result$jscomp$5682_JSCompiler_inline_result$jscomp$6682_config$jscomp$inline_6536_element$jscomp$inline_4929_element$jscomp$inline_6539_json$jscomp$inline_6525_nodeList$jscomp$inline_6807_possibleConfig$jscomp$inline_4930_value$jscomp$inline_6797$$ = 
              null;
            } else {
              $JSCompiler_inline_result$jscomp$5682_JSCompiler_inline_result$jscomp$6682_config$jscomp$inline_6536_element$jscomp$inline_4929_element$jscomp$inline_6539_json$jscomp$inline_6525_nodeList$jscomp$inline_6807_possibleConfig$jscomp$inline_4930_value$jscomp$inline_6797$$ = null;
            }
            if ($JSCompiler_inline_result$jscomp$5682_JSCompiler_inline_result$jscomp$6682_config$jscomp$inline_6536_element$jscomp$inline_4929_element$jscomp$inline_6539_json$jscomp$inline_6525_nodeList$jscomp$inline_6807_possibleConfig$jscomp$inline_4930_value$jscomp$inline_6797$$) {
              $JSCompiler_StaticMethods_MicrodataParser$$module$third_party$subscriptions_project$config_prototype$check$self$jscomp$inline_4932_JSCompiler_temp$jscomp$5683_config$jscomp$12_domReady$jscomp$inline_4926_productId$jscomp$inline_4922$$ = $JSCompiler_inline_result$jscomp$5682_JSCompiler_inline_result$jscomp$6682_config$jscomp$inline_6536_element$jscomp$inline_4929_element$jscomp$inline_6539_json$jscomp$inline_6525_nodeList$jscomp$inline_6807_possibleConfig$jscomp$inline_4930_value$jscomp$inline_6797$$;
              break a;
            }
          }
        }
      }
      $JSCompiler_StaticMethods_MicrodataParser$$module$third_party$subscriptions_project$config_prototype$check$self$jscomp$inline_4932_JSCompiler_temp$jscomp$5683_config$jscomp$12_domReady$jscomp$inline_4926_productId$jscomp$inline_4922$$ = null;
    }
  }
  if (!$JSCompiler_StaticMethods_MicrodataParser$$module$third_party$subscriptions_project$config_prototype$check$self$jscomp$inline_4932_JSCompiler_temp$jscomp$5683_config$jscomp$12_domReady$jscomp$inline_4926_productId$jscomp$inline_4922$$) {
    if ($JSCompiler_StaticMethods_MicrodataParser$$module$third_party$subscriptions_project$config_prototype$check$self$jscomp$inline_4932_JSCompiler_temp$jscomp$5683_config$jscomp$12_domReady$jscomp$inline_4926_productId$jscomp$inline_4922$$ = this.$K$, $JSCompiler_StaticMethods_MicrodataParser$$module$third_party$subscriptions_project$config_prototype$check$self$jscomp$inline_4932_JSCompiler_temp$jscomp$5683_config$jscomp$12_domReady$jscomp$inline_4926_productId$jscomp$inline_4922$$.$doc_$.$getBody$()) {
      if ($JSCompiler_inline_result$jscomp$5682_JSCompiler_inline_result$jscomp$6682_config$jscomp$inline_6536_element$jscomp$inline_4929_element$jscomp$inline_6539_json$jscomp$inline_6525_nodeList$jscomp$inline_6807_possibleConfig$jscomp$inline_4930_value$jscomp$inline_6797$$ = $JSCompiler_StaticMethods_getPageConfig_$$($JSCompiler_StaticMethods_MicrodataParser$$module$third_party$subscriptions_project$config_prototype$check$self$jscomp$inline_4932_JSCompiler_temp$jscomp$5683_config$jscomp$12_domReady$jscomp$inline_4926_productId$jscomp$inline_4922$$)) {
        $JSCompiler_StaticMethods_MicrodataParser$$module$third_party$subscriptions_project$config_prototype$check$self$jscomp$inline_4932_JSCompiler_temp$jscomp$5683_config$jscomp$12_domReady$jscomp$inline_4926_productId$jscomp$inline_4922$$ = $JSCompiler_inline_result$jscomp$5682_JSCompiler_inline_result$jscomp$6682_config$jscomp$inline_6536_element$jscomp$inline_4929_element$jscomp$inline_6539_json$jscomp$inline_6525_nodeList$jscomp$inline_6807_possibleConfig$jscomp$inline_4930_value$jscomp$inline_6797$$;
      } else {
        $JSCompiler_StaticMethods_JsonLdParser$$module$third_party$subscriptions_project$config_prototype$check$self$jscomp$inline_4925_JSCompiler_StaticMethods_MetaParser$$module$third_party$subscriptions_project$config_prototype$check$self$jscomp$inline_4921_accessibleForFree$jscomp$inline_4923_elements$jscomp$inline_4927_nodeList$jscomp$inline_6537$$ = $JSCompiler_StaticMethods_MicrodataParser$$module$third_party$subscriptions_project$config_prototype$check$self$jscomp$inline_4932_JSCompiler_temp$jscomp$5683_config$jscomp$12_domReady$jscomp$inline_4926_productId$jscomp$inline_4922$$.$doc_$.getRootNode().querySelectorAll('[itemscope][itemtype*="http://schema.org/NewsArticle"]');
        for ($i$jscomp$inline_4928_i$jscomp$inline_6538$$ = 0; $JSCompiler_StaticMethods_JsonLdParser$$module$third_party$subscriptions_project$config_prototype$check$self$jscomp$inline_4925_JSCompiler_StaticMethods_MetaParser$$module$third_party$subscriptions_project$config_prototype$check$self$jscomp$inline_4921_accessibleForFree$jscomp$inline_4923_elements$jscomp$inline_4927_nodeList$jscomp$inline_6537$$[$i$jscomp$inline_4928_i$jscomp$inline_6538$$] && null == $JSCompiler_inline_result$jscomp$5682_JSCompiler_inline_result$jscomp$6682_config$jscomp$inline_6536_element$jscomp$inline_4929_element$jscomp$inline_6539_json$jscomp$inline_6525_nodeList$jscomp$inline_6807_possibleConfig$jscomp$inline_4930_value$jscomp$inline_6797$$; $i$jscomp$inline_4928_i$jscomp$inline_6538$$++) {
          $JSCompiler_inline_result$jscomp$5682_JSCompiler_inline_result$jscomp$6682_config$jscomp$inline_6536_element$jscomp$inline_4929_element$jscomp$inline_6539_json$jscomp$inline_6525_nodeList$jscomp$inline_6807_possibleConfig$jscomp$inline_4930_value$jscomp$inline_6797$$ = $JSCompiler_StaticMethods_JsonLdParser$$module$third_party$subscriptions_project$config_prototype$check$self$jscomp$inline_4925_JSCompiler_StaticMethods_MetaParser$$module$third_party$subscriptions_project$config_prototype$check$self$jscomp$inline_4921_accessibleForFree$jscomp$inline_4923_elements$jscomp$inline_4927_nodeList$jscomp$inline_6537$$[$i$jscomp$inline_4928_i$jscomp$inline_6538$$];
          if (null == $JSCompiler_StaticMethods_MicrodataParser$$module$third_party$subscriptions_project$config_prototype$check$self$jscomp$inline_4932_JSCompiler_temp$jscomp$5683_config$jscomp$12_domReady$jscomp$inline_4926_productId$jscomp$inline_4922$$.$MicrodataParser$$module$third_party$subscriptions_project$config$access_$) {
            $JSCompiler_inline_result$jscomp$inline_6524_JSCompiler_temp$jscomp$5680_JSCompiler_temp$jscomp$5681_JSCompiler_temp_const$jscomp$6679_JSCompiler_temp_const$jscomp$6681_currentElement$jscomp$inline_6520_json$jscomp$inline_6530_productId$jscomp$inline_6526$$ = $JSCompiler_StaticMethods_MicrodataParser$$module$third_party$subscriptions_project$config_prototype$check$self$jscomp$inline_4932_JSCompiler_temp$jscomp$5683_config$jscomp$12_domReady$jscomp$inline_4926_productId$jscomp$inline_4922$$;
            b: {
              $accessForFree$jscomp$inline_6804_content$jscomp$inline_6810_i$jscomp$inline_6528_nodeList$jscomp$inline_6800$$ = $JSCompiler_inline_result$jscomp$5682_JSCompiler_inline_result$jscomp$6682_config$jscomp$inline_6536_element$jscomp$inline_4929_element$jscomp$inline_6539_json$jscomp$inline_6525_nodeList$jscomp$inline_6807_possibleConfig$jscomp$inline_4930_value$jscomp$inline_6797$$.querySelectorAll("[itemprop='isAccessibleForFree']");
              for (var $element$jscomp$inline_6809_i$jscomp$inline_6801_item$jscomp$inline_6811$$ = 0; $accessForFree$jscomp$inline_6804_content$jscomp$inline_6810_i$jscomp$inline_6528_nodeList$jscomp$inline_6800$$[$element$jscomp$inline_6809_i$jscomp$inline_6801_item$jscomp$inline_6811$$]; $element$jscomp$inline_6809_i$jscomp$inline_6801_item$jscomp$inline_6811$$++) {
                var $element$jscomp$inline_6802$$ = $accessForFree$jscomp$inline_6804_content$jscomp$inline_6810_i$jscomp$inline_6528_nodeList$jscomp$inline_6800$$[$element$jscomp$inline_6809_i$jscomp$inline_6801_item$jscomp$inline_6811$$];
                if (($JSCompiler_inline_result$jscomp$6680_content$jscomp$inline_6803_i$jscomp$inline_6808_partOfArray$jscomp$inline_6527$$ = $element$jscomp$inline_6802$$.getAttribute("content") || $element$jscomp$inline_6802$$.textContent) && $JSCompiler_StaticMethods_isValidElement_$$($element$jscomp$inline_6802$$, "alreadySeenForAccessInfo")) {
                  $accessForFree$jscomp$inline_6804_content$jscomp$inline_6810_i$jscomp$inline_6528_nodeList$jscomp$inline_6800$$ = null;
                  "true" == $JSCompiler_inline_result$jscomp$6680_content$jscomp$inline_6803_i$jscomp$inline_6808_partOfArray$jscomp$inline_6527$$.toLowerCase() ? $accessForFree$jscomp$inline_6804_content$jscomp$inline_6810_i$jscomp$inline_6528_nodeList$jscomp$inline_6800$$ = !0 : "false" == $JSCompiler_inline_result$jscomp$6680_content$jscomp$inline_6803_i$jscomp$inline_6808_partOfArray$jscomp$inline_6527$$.toLowerCase() && ($accessForFree$jscomp$inline_6804_content$jscomp$inline_6810_i$jscomp$inline_6528_nodeList$jscomp$inline_6800$$ = 
                  !1);
                  $JSCompiler_inline_result$jscomp$6680_content$jscomp$inline_6803_i$jscomp$inline_6808_partOfArray$jscomp$inline_6527$$ = $accessForFree$jscomp$inline_6804_content$jscomp$inline_6810_i$jscomp$inline_6528_nodeList$jscomp$inline_6800$$;
                  break b;
                }
              }
              $JSCompiler_inline_result$jscomp$6680_content$jscomp$inline_6803_i$jscomp$inline_6808_partOfArray$jscomp$inline_6527$$ = null;
            }
            $JSCompiler_inline_result$jscomp$inline_6524_JSCompiler_temp$jscomp$5680_JSCompiler_temp$jscomp$5681_JSCompiler_temp_const$jscomp$6679_JSCompiler_temp_const$jscomp$6681_currentElement$jscomp$inline_6520_json$jscomp$inline_6530_productId$jscomp$inline_6526$$.$MicrodataParser$$module$third_party$subscriptions_project$config$access_$ = $JSCompiler_inline_result$jscomp$6680_content$jscomp$inline_6803_i$jscomp$inline_6808_partOfArray$jscomp$inline_6527$$;
          }
          if (!$JSCompiler_StaticMethods_MicrodataParser$$module$third_party$subscriptions_project$config_prototype$check$self$jscomp$inline_4932_JSCompiler_temp$jscomp$5683_config$jscomp$12_domReady$jscomp$inline_4926_productId$jscomp$inline_4922$$.$MicrodataParser$$module$third_party$subscriptions_project$config$productId_$) {
            $JSCompiler_inline_result$jscomp$inline_6524_JSCompiler_temp$jscomp$5680_JSCompiler_temp$jscomp$5681_JSCompiler_temp_const$jscomp$6679_JSCompiler_temp_const$jscomp$6681_currentElement$jscomp$inline_6520_json$jscomp$inline_6530_productId$jscomp$inline_6526$$ = $JSCompiler_StaticMethods_MicrodataParser$$module$third_party$subscriptions_project$config_prototype$check$self$jscomp$inline_4932_JSCompiler_temp$jscomp$5683_config$jscomp$12_domReady$jscomp$inline_4926_productId$jscomp$inline_4922$$;
            b: {
              $JSCompiler_inline_result$jscomp$5682_JSCompiler_inline_result$jscomp$6682_config$jscomp$inline_6536_element$jscomp$inline_4929_element$jscomp$inline_6539_json$jscomp$inline_6525_nodeList$jscomp$inline_6807_possibleConfig$jscomp$inline_4930_value$jscomp$inline_6797$$ = $JSCompiler_inline_result$jscomp$5682_JSCompiler_inline_result$jscomp$6682_config$jscomp$inline_6536_element$jscomp$inline_4929_element$jscomp$inline_6539_json$jscomp$inline_6525_nodeList$jscomp$inline_6807_possibleConfig$jscomp$inline_4930_value$jscomp$inline_6797$$.querySelectorAll('[itemprop="productID"]');
              for ($JSCompiler_inline_result$jscomp$6680_content$jscomp$inline_6803_i$jscomp$inline_6808_partOfArray$jscomp$inline_6527$$ = 0; $JSCompiler_inline_result$jscomp$5682_JSCompiler_inline_result$jscomp$6682_config$jscomp$inline_6536_element$jscomp$inline_4929_element$jscomp$inline_6539_json$jscomp$inline_6525_nodeList$jscomp$inline_6807_possibleConfig$jscomp$inline_4930_value$jscomp$inline_6797$$[$JSCompiler_inline_result$jscomp$6680_content$jscomp$inline_6803_i$jscomp$inline_6808_partOfArray$jscomp$inline_6527$$]; $JSCompiler_inline_result$jscomp$6680_content$jscomp$inline_6803_i$jscomp$inline_6808_partOfArray$jscomp$inline_6527$$++) {
                if ($element$jscomp$inline_6809_i$jscomp$inline_6801_item$jscomp$inline_6811$$ = $JSCompiler_inline_result$jscomp$5682_JSCompiler_inline_result$jscomp$6682_config$jscomp$inline_6536_element$jscomp$inline_4929_element$jscomp$inline_6539_json$jscomp$inline_6525_nodeList$jscomp$inline_6807_possibleConfig$jscomp$inline_4930_value$jscomp$inline_6797$$[$JSCompiler_inline_result$jscomp$6680_content$jscomp$inline_6803_i$jscomp$inline_6808_partOfArray$jscomp$inline_6527$$], $accessForFree$jscomp$inline_6804_content$jscomp$inline_6810_i$jscomp$inline_6528_nodeList$jscomp$inline_6800$$ = 
                $element$jscomp$inline_6809_i$jscomp$inline_6801_item$jscomp$inline_6811$$.getAttribute("content") || $element$jscomp$inline_6809_i$jscomp$inline_6801_item$jscomp$inline_6811$$.textContent, $element$jscomp$inline_6809_i$jscomp$inline_6801_item$jscomp$inline_6811$$ = $element$jscomp$inline_6809_i$jscomp$inline_6801_item$jscomp$inline_6811$$.closest("[itemtype][itemscope]"), !(-1 >= $element$jscomp$inline_6809_i$jscomp$inline_6801_item$jscomp$inline_6811$$.getAttribute("itemtype").indexOf("http://schema.org/Product")) && 
                $JSCompiler_StaticMethods_isValidElement_$$($element$jscomp$inline_6809_i$jscomp$inline_6801_item$jscomp$inline_6811$$.parentElement, "alreadySeenForProductInfo")) {
                  $JSCompiler_inline_result$jscomp$5682_JSCompiler_inline_result$jscomp$6682_config$jscomp$inline_6536_element$jscomp$inline_4929_element$jscomp$inline_6539_json$jscomp$inline_6525_nodeList$jscomp$inline_6807_possibleConfig$jscomp$inline_4930_value$jscomp$inline_6797$$ = $accessForFree$jscomp$inline_6804_content$jscomp$inline_6810_i$jscomp$inline_6528_nodeList$jscomp$inline_6800$$;
                  break b;
                }
              }
              $JSCompiler_inline_result$jscomp$5682_JSCompiler_inline_result$jscomp$6682_config$jscomp$inline_6536_element$jscomp$inline_4929_element$jscomp$inline_6539_json$jscomp$inline_6525_nodeList$jscomp$inline_6807_possibleConfig$jscomp$inline_4930_value$jscomp$inline_6797$$ = null;
            }
            $JSCompiler_inline_result$jscomp$inline_6524_JSCompiler_temp$jscomp$5680_JSCompiler_temp$jscomp$5681_JSCompiler_temp_const$jscomp$6679_JSCompiler_temp_const$jscomp$6681_currentElement$jscomp$inline_6520_json$jscomp$inline_6530_productId$jscomp$inline_6526$$.$MicrodataParser$$module$third_party$subscriptions_project$config$productId_$ = $JSCompiler_inline_result$jscomp$5682_JSCompiler_inline_result$jscomp$6682_config$jscomp$inline_6536_element$jscomp$inline_4929_element$jscomp$inline_6539_json$jscomp$inline_6525_nodeList$jscomp$inline_6807_possibleConfig$jscomp$inline_4930_value$jscomp$inline_6797$$;
          }
          $JSCompiler_inline_result$jscomp$5682_JSCompiler_inline_result$jscomp$6682_config$jscomp$inline_6536_element$jscomp$inline_4929_element$jscomp$inline_6539_json$jscomp$inline_6525_nodeList$jscomp$inline_6807_possibleConfig$jscomp$inline_4930_value$jscomp$inline_6797$$ = $JSCompiler_StaticMethods_getPageConfig_$$($JSCompiler_StaticMethods_MicrodataParser$$module$third_party$subscriptions_project$config_prototype$check$self$jscomp$inline_4932_JSCompiler_temp$jscomp$5683_config$jscomp$12_domReady$jscomp$inline_4926_productId$jscomp$inline_4922$$);
        }
        $JSCompiler_StaticMethods_MicrodataParser$$module$third_party$subscriptions_project$config_prototype$check$self$jscomp$inline_4932_JSCompiler_temp$jscomp$5683_config$jscomp$12_domReady$jscomp$inline_4926_productId$jscomp$inline_4922$$ = $JSCompiler_inline_result$jscomp$5682_JSCompiler_inline_result$jscomp$6682_config$jscomp$inline_6536_element$jscomp$inline_4929_element$jscomp$inline_6539_json$jscomp$inline_6525_nodeList$jscomp$inline_6807_possibleConfig$jscomp$inline_4930_value$jscomp$inline_6797$$;
      }
    } else {
      $JSCompiler_StaticMethods_MicrodataParser$$module$third_party$subscriptions_project$config_prototype$check$self$jscomp$inline_4932_JSCompiler_temp$jscomp$5683_config$jscomp$12_domReady$jscomp$inline_4926_productId$jscomp$inline_4922$$ = null;
    }
  }
  $JSCompiler_StaticMethods_MicrodataParser$$module$third_party$subscriptions_project$config_prototype$check$self$jscomp$inline_4932_JSCompiler_temp$jscomp$5683_config$jscomp$12_domReady$jscomp$inline_4926_productId$jscomp$inline_4922$$ ? (this.$D$($JSCompiler_StaticMethods_MicrodataParser$$module$third_party$subscriptions_project$config_prototype$check$self$jscomp$inline_4932_JSCompiler_temp$jscomp$5683_config$jscomp$12_domReady$jscomp$inline_4926_productId$jscomp$inline_4922$$), this.$D$ = null) : 
  this.$doc_$.$Doc$$module$third_party$subscriptions_project$config_prototype$isReady$() && (this.$D$(window.Promise.reject(Error("No config could be discovered in the page"))), this.$D$ = null);
  return $JSCompiler_StaticMethods_MicrodataParser$$module$third_party$subscriptions_project$config_prototype$check$self$jscomp$inline_4932_JSCompiler_temp$jscomp$5683_config$jscomp$12_domReady$jscomp$inline_4926_productId$jscomp$inline_4922$$;
};
$SubscriptionAnalytics$$module$extensions$amp_subscriptions$0_1$analytics$$.prototype.$D$ = function($eventType$jscomp$25$$, $serviceId$$, $opt_vars$jscomp$3$$) {
  this.event($eventType$jscomp$25$$, Object.assign(_.$dict$$module$src$utils$object$$({serviceId:$serviceId$$}), $opt_vars$jscomp$3$$));
};
$SubscriptionAnalytics$$module$extensions$amp_subscriptions$0_1$analytics$$.prototype.event = function($eventType$jscomp$26$$, $opt_vars$jscomp$4$$) {
  _.$user$$module$src$log$$().$Log$$module$src$log_prototype$info$("amp-subscriptions", $eventType$jscomp$26$$, $opt_vars$jscomp$4$$ || "");
  _.$triggerAnalyticsEvent$$module$src$analytics$$(this.$element_$, $eventType$jscomp$26$$, $opt_vars$jscomp$4$$ || _.$dict$$module$src$utils$object$$({}));
};
$SubscriptionAnalytics$$module$extensions$amp_subscriptions$0_1$analytics$$.prototype.$F$ = function($serviceId$jscomp$1$$, $action$jscomp$13$$, $status$jscomp$3$$) {
  this.$D$("subscriptions-action-" + $action$jscomp$13$$ + "-" + $status$jscomp$3$$, $serviceId$jscomp$1$$, void 0);
};
var $DEFAULT_SCORE_CONFIG$$module$extensions$amp_subscriptions$0_1$score_factors$$ = {};
$Dialog$$module$extensions$amp_subscriptions$0_1$dialog$$.prototype.open = function($content$jscomp$26$$, $showCloseAction$$) {
  var $$jscomp$this$jscomp$1223$$ = this;
  $showCloseAction$$ = void 0 === $showCloseAction$$ ? !0 : $showCloseAction$$;
  return this.$action_$(function() {
    return $$jscomp$this$jscomp$1223$$.$open_$($content$jscomp$26$$, $showCloseAction$$);
  });
};
$Dialog$$module$extensions$amp_subscriptions$0_1$dialog$$.prototype.close = function() {
  var $$jscomp$this$jscomp$1224$$ = this;
  return this.$action_$(function() {
    return $JSCompiler_StaticMethods_Dialog$$module$extensions$amp_subscriptions$0_1$dialog_prototype$close_$$($$jscomp$this$jscomp$1224$$);
  });
};
$Dialog$$module$extensions$amp_subscriptions$0_1$dialog$$.prototype.$action_$ = function($action$jscomp$27$$) {
  return this.$G$ = this.$G$.then($action$jscomp$27$$);
};
$Dialog$$module$extensions$amp_subscriptions$0_1$dialog$$.prototype.$open_$ = function($content$jscomp$27$$, $showCloseAction$jscomp$1$$) {
  var $$jscomp$this$jscomp$1225$$ = this;
  $showCloseAction$jscomp$1$$ = void 0 === $showCloseAction$jscomp$1$$ ? !0 : $showCloseAction$jscomp$1$$;
  this.$content_$ ? this.$D$.replaceChild($content$jscomp$27$$, this.$content_$) : this.$D$.appendChild($content$jscomp$27$$);
  this.$content_$ = $content$jscomp$27$$;
  if (this.$visible_$) {
    return window.Promise.resolve();
  }
  this.$visible_$ = !0;
  return _.$JSCompiler_StaticMethods_mutatePromise$$(this.$vsync_$, function() {
    _.$toggle$$module$src$style$$($$jscomp$this$jscomp$1225$$.$D$, !0);
    _.$toggle$$module$src$style$$($$jscomp$this$jscomp$1225$$.$F$, $showCloseAction$jscomp$1$$);
  }).then(function() {
    return _.$JSCompiler_StaticMethods_mutatePromise$$($$jscomp$this$jscomp$1225$$.$vsync_$, function() {
      _.$setImportantStyles$$module$src$style$$($$jscomp$this$jscomp$1225$$.$D$, {transform:"translateY(0)"});
      return $$jscomp$this$jscomp$1225$$.$timer_$.$promise$(300);
    });
  }).then(function() {
    var $content$jscomp$27$$;
    return _.$JSCompiler_StaticMethods_runPromise$$($$jscomp$this$jscomp$1225$$.$vsync_$, {measure:function() {
      $content$jscomp$27$$ = $$jscomp$this$jscomp$1225$$.$D$.offsetHeight;
    }, $mutate$:function() {
      _.$JSCompiler_StaticMethods_updatePaddingBottom$$($$jscomp$this$jscomp$1225$$.$viewport_$, $content$jscomp$27$$);
    }});
  });
};
$Actions$$module$extensions$amp_subscriptions$0_1$actions$$.prototype.$build$ = function() {
  var $$jscomp$this$jscomp$1227$$ = this;
  if (0 == Object.keys(this.$F$).length) {
    return null;
  }
  var $promises$jscomp$25$$ = [], $$jscomp$loop$403$$ = {}, $k$jscomp$81$$;
  for ($k$jscomp$81$$ in this.$F$) {
    $$jscomp$loop$403$$.k = $k$jscomp$81$$, $promises$jscomp$25$$.push(this.$J$.$buildUrl$(this.$F$[$$jscomp$loop$403$$.k], !0).then(function($promises$jscomp$25$$) {
      return function($$jscomp$loop$403$$) {
        $$jscomp$this$jscomp$1227$$.$G$[$promises$jscomp$25$$.k] = $$jscomp$loop$403$$;
      };
    }($$jscomp$loop$403$$))), $$jscomp$loop$403$$ = {k:$$jscomp$loop$403$$.k};
  }
  return window.Promise.all($promises$jscomp$25$$).then(function() {
    return $$jscomp$this$jscomp$1227$$.$G$;
  });
};
$Actions$$module$extensions$amp_subscriptions$0_1$actions$$.prototype.execute = function($action$jscomp$28$$) {
  return $JSCompiler_StaticMethods_Actions$$module$extensions$amp_subscriptions$0_1$actions_prototype$execute_$$(this, this.$G$[$action$jscomp$28$$], $action$jscomp$28$$);
};
$LocalSubscriptionPlatformRenderer$$module$extensions$amp_subscriptions$0_1$local_subscription_platform_renderer$$.prototype.render = function($renderState$$) {
  return window.Promise.all([$JSCompiler_StaticMethods_renderActions_$$(this, $renderState$$), $JSCompiler_StaticMethods_renderDialog_$$(this, $renderState$$)]);
};
$LocalSubscriptionPlatformRenderer$$module$extensions$amp_subscriptions$0_1$local_subscription_platform_renderer$$.prototype.reset = function() {
  this.$D$.close();
  return $JSCompiler_StaticMethods_renderActionsInNode_$$(this, {}, this.$F$, function() {
    return !1;
  });
};
$UrlBuilder$$module$extensions$amp_subscriptions$0_1$url_builder$$.prototype.$buildUrl$ = function($url$jscomp$241$$, $useAuthData$jscomp$3$$) {
  var $$jscomp$this$jscomp$1231$$ = this;
  return $JSCompiler_StaticMethods_UrlBuilder$$module$extensions$amp_subscriptions$0_1$url_builder_prototype$prepareUrlVars_$$(this, $useAuthData$jscomp$3$$).then(function($useAuthData$jscomp$3$$) {
    return _.$JSCompiler_StaticMethods_expandUrlAsync$$($$jscomp$this$jscomp$1231$$.$urlReplacements_$, $url$jscomp$241$$, $useAuthData$jscomp$3$$);
  });
};
$UrlBuilder$$module$extensions$amp_subscriptions$0_1$url_builder$$.prototype.$collectUrlVars$ = function($url$jscomp$242$$, $useAuthData$jscomp$4$$) {
  var $$jscomp$this$jscomp$1232$$ = this;
  return $JSCompiler_StaticMethods_UrlBuilder$$module$extensions$amp_subscriptions$0_1$url_builder_prototype$prepareUrlVars_$$(this, $useAuthData$jscomp$4$$).then(function($useAuthData$jscomp$4$$) {
    return _.$JSCompiler_StaticMethods_collectVars$$($$jscomp$this$jscomp$1232$$.$urlReplacements_$, $url$jscomp$242$$, $useAuthData$jscomp$4$$);
  });
};
_.$JSCompiler_prototypeAlias$$ = $LocalSubscriptionPlatform$$module$extensions$amp_subscriptions$0_1$local_subscription_platform$$.prototype;
_.$JSCompiler_prototypeAlias$$.$getServiceId$ = function() {
  return "local";
};
_.$JSCompiler_prototypeAlias$$.$activate$ = function($entitlement$jscomp$3$$) {
  var $$jscomp$this$jscomp$1235$$ = this, $renderState$jscomp$4$$ = $entitlement$jscomp$3$$.json();
  this.$G$.$D$ = $renderState$jscomp$4$$;
  this.$actions_$.$build$().then(function() {
    $$jscomp$this$jscomp$1235$$.$renderer_$.render($renderState$jscomp$4$$);
  });
};
_.$JSCompiler_prototypeAlias$$.reset = function() {
  this.$renderer_$.reset();
};
_.$JSCompiler_prototypeAlias$$.$executeAction$ = function($action$jscomp$31$$) {
  var $$jscomp$this$jscomp$1236$$ = this;
  return this.$actions_$.execute($action$jscomp$31$$).then(function($action$jscomp$31$$) {
    $action$jscomp$31$$ && $$jscomp$this$jscomp$1236$$.$D$.$F$();
    return !!$action$jscomp$31$$;
  });
};
_.$JSCompiler_prototypeAlias$$.$GoogleSubscriptionsPlatform$$module$extensions$amp_subscriptions_google$0_1$amp_subscriptions_google_prototype$getEntitlements$ = function() {
  var $$jscomp$this$jscomp$1237$$ = this;
  return this.$G$.$buildUrl$(this.$J$, !1).then(function($fetchUrl$$) {
    return _.$JSCompiler_StaticMethods_fetchJson$$($$jscomp$this$jscomp$1237$$.$xhr_$, $fetchUrl$$, {credentials:"include"}).then(function($$jscomp$this$jscomp$1237$$) {
      return $$jscomp$this$jscomp$1237$$.json();
    }).then(function($$jscomp$this$jscomp$1237$$) {
      return $Entitlement$$module$extensions$amp_subscriptions$0_1$entitlement$parseFromJson$$($$jscomp$this$jscomp$1237$$);
    });
  });
};
_.$JSCompiler_prototypeAlias$$.$GoogleSubscriptionsPlatform$$module$extensions$amp_subscriptions_google$0_1$amp_subscriptions_google_prototype$isPingbackEnabled$ = function() {
  return !!this.$I$;
};
_.$JSCompiler_prototypeAlias$$.$GoogleSubscriptionsPlatform$$module$extensions$amp_subscriptions_google$0_1$amp_subscriptions_google_prototype$pingback$ = function($selectedEntitlement$$) {
  var $$jscomp$this$jscomp$1238$$ = this;
  this.$GoogleSubscriptionsPlatform$$module$extensions$amp_subscriptions_google$0_1$amp_subscriptions_google_prototype$isPingbackEnabled$ && this.$G$.$buildUrl$(this.$I$, !0).then(function($url$jscomp$243$$) {
    return _.$JSCompiler_StaticMethods_sendSignal$$($$jscomp$this$jscomp$1238$$.$xhr_$, $url$jscomp$243$$, {method:"POST", credentials:"include", headers:_.$dict$$module$src$utils$object$$({"Content-Type":"text/plain"}), body:JSON.stringify(Object.assign({}, {raw:$selectedEntitlement$$.raw}, $selectedEntitlement$$.json()))});
  });
};
_.$JSCompiler_prototypeAlias$$.$getSupportedScoreFactor$ = function() {
  return 0;
};
_.$JSCompiler_prototypeAlias$$.$getBaseScore$ = function() {
  return this.$F$.baseScore || 0;
};
_.$JSCompiler_prototypeAlias$$.$decorateUI$ = function() {
};
$PlatformStore$$module$extensions$amp_subscriptions$0_1$platform_store$$.prototype.reset = function() {
  this.$I$ = null;
};
$Renderer$$module$extensions$amp_subscriptions$0_1$renderer$$.prototype.$toggleLoading$ = function($loading$$) {
  $JSCompiler_StaticMethods_toggleState_$$(this, $loading$$);
};
$ServiceAdapter$$module$extensions$amp_subscriptions$0_1$service_adapter$$.prototype.$G$ = function($action$jscomp$32$$) {
  return $JSCompiler_StaticMethods_SubscriptionService$$module$extensions$amp_subscriptions$0_1$amp_subscriptions_prototype$delegateActionToService$$(this.$D$, $action$jscomp$32$$, "local");
};
$ServiceAdapter$$module$extensions$amp_subscriptions$0_1$service_adapter$$.prototype.$F$ = function() {
  $JSCompiler_StaticMethods_SubscriptionService$$module$extensions$amp_subscriptions$0_1$amp_subscriptions_prototype$resetPlatforms$$(this.$D$);
};
_.$JSCompiler_prototypeAlias$$ = $ViewerSubscriptionPlatform$$module$extensions$amp_subscriptions$0_1$viewer_subscription_platform$$.prototype;
_.$JSCompiler_prototypeAlias$$.$GoogleSubscriptionsPlatform$$module$extensions$amp_subscriptions_google$0_1$amp_subscriptions_google_prototype$getEntitlements$ = function() {
  var $$jscomp$this$jscomp$1249$$ = this;
  return _.$JSCompiler_StaticMethods_sendMessageAwaitResponse$$(this.$viewer_$, "auth", _.$dict$$module$src$utils$object$$({publicationId:this.$F$, productId:this.$G$, origin:this.$origin_$})).then(function($authData_entitlementData$$) {
    return ($authData_entitlementData$$ = ($authData_entitlementData$$ || {}).authorization) ? $JSCompiler_StaticMethods_verifyAuthToken_$$($$jscomp$this$jscomp$1249$$, $authData_entitlementData$$) : $Entitlement$$module$extensions$amp_subscriptions$0_1$entitlement$empty$$("local");
  }).catch(function($reason$jscomp$58$$) {
    _.$JSCompiler_StaticMethods_Viewer$$module$src$service$viewer_impl_prototype$sendMessage$$($$jscomp$this$jscomp$1249$$.$viewer_$, "auth-rejected", _.$dict$$module$src$utils$object$$({reason:$reason$jscomp$58$$.message}));
    throw $reason$jscomp$58$$;
  });
};
_.$JSCompiler_prototypeAlias$$.$getServiceId$ = function() {
  return this.$platform_$.$getServiceId$();
};
_.$JSCompiler_prototypeAlias$$.$activate$ = function() {
};
_.$JSCompiler_prototypeAlias$$.reset = function() {
};
_.$JSCompiler_prototypeAlias$$.$GoogleSubscriptionsPlatform$$module$extensions$amp_subscriptions_google$0_1$amp_subscriptions_google_prototype$isPingbackEnabled$ = function() {
  return this.$platform_$.$GoogleSubscriptionsPlatform$$module$extensions$amp_subscriptions_google$0_1$amp_subscriptions_google_prototype$isPingbackEnabled$();
};
_.$JSCompiler_prototypeAlias$$.$GoogleSubscriptionsPlatform$$module$extensions$amp_subscriptions_google$0_1$amp_subscriptions_google_prototype$pingback$ = function($selectedPlatform$$) {
  this.$platform_$.$GoogleSubscriptionsPlatform$$module$extensions$amp_subscriptions_google$0_1$amp_subscriptions_google_prototype$pingback$($selectedPlatform$$);
};
_.$JSCompiler_prototypeAlias$$.$getSupportedScoreFactor$ = function($factorName$jscomp$2$$) {
  return this.$platform_$.$getSupportedScoreFactor$($factorName$jscomp$2$$);
};
_.$JSCompiler_prototypeAlias$$.$getBaseScore$ = function() {
  return 0;
};
_.$JSCompiler_prototypeAlias$$.$executeAction$ = function($action$jscomp$35$$) {
  return this.$platform_$.$executeAction$($action$jscomp$35$$);
};
_.$JSCompiler_prototypeAlias$$.$decorateUI$ = function($element$jscomp$645$$, $action$jscomp$36$$, $options$jscomp$72$$) {
  return this.$platform_$.$decorateUI$($element$jscomp$645$$, $action$jscomp$36$$, $options$jscomp$72$$);
};
$SubscriptionService$$module$extensions$amp_subscriptions$0_1$amp_subscriptions$$.prototype.$Y$ = function($subscriptionPlatformFactory$$) {
  var $$jscomp$this$jscomp$1256$$ = this;
  $JSCompiler_StaticMethods_SubscriptionService$$module$extensions$amp_subscriptions$0_1$amp_subscriptions_prototype$initialize_$$(this).then(function() {
    if (!$$jscomp$this$jscomp$1256$$.$R$) {
      var $matchedServiceConfig_subscriptionPlatform$jscomp$1$$ = $$jscomp$this$jscomp$1256$$.$G$.services.filter(function($subscriptionPlatformFactory$$) {
        return "subscribe.google.com" === ($subscriptionPlatformFactory$$.$serviceId$ || "local");
      })[0];
      $matchedServiceConfig_subscriptionPlatform$jscomp$1$$ = $subscriptionPlatformFactory$$($matchedServiceConfig_subscriptionPlatform$jscomp$1$$, $$jscomp$this$jscomp$1256$$.$K$);
      $JSCompiler_StaticMethods_resolvePlatform$$($$jscomp$this$jscomp$1256$$.$D$, $matchedServiceConfig_subscriptionPlatform$jscomp$1$$.$getServiceId$(), $matchedServiceConfig_subscriptionPlatform$jscomp$1$$);
      $$jscomp$this$jscomp$1256$$.$F$.$D$("subscriptions-service-registered", $matchedServiceConfig_subscriptionPlatform$jscomp$1$$.$getServiceId$());
      $$jscomp$this$jscomp$1256$$.$F$.$D$("subscriptions-platform-registered", $matchedServiceConfig_subscriptionPlatform$jscomp$1$$.$getServiceId$());
      $JSCompiler_StaticMethods_SubscriptionService$$module$extensions$amp_subscriptions$0_1$amp_subscriptions_prototype$fetchEntitlements_$$($$jscomp$this$jscomp$1256$$, $matchedServiceConfig_subscriptionPlatform$jscomp$1$$);
    }
  });
};
$SubscriptionService$$module$extensions$amp_subscriptions$0_1$amp_subscriptions$$.prototype.start = function() {
  var $$jscomp$this$jscomp$1258$$ = this;
  $JSCompiler_StaticMethods_SubscriptionService$$module$extensions$amp_subscriptions$0_1$amp_subscriptions_prototype$initialize_$$(this).then(function() {
    $$jscomp$this$jscomp$1258$$.$F$.event("subscriptions-started");
    $$jscomp$this$jscomp$1258$$.$renderer_$.$toggleLoading$(!0);
    if ($$jscomp$this$jscomp$1258$$.$R$) {
      $JSCompiler_StaticMethods_delegateAuthToViewer_$$($$jscomp$this$jscomp$1258$$), $JSCompiler_StaticMethods_startAuthorizationFlow_$$($$jscomp$this$jscomp$1258$$, !1);
    } else {
      if ($$jscomp$this$jscomp$1258$$.$G$.alwaysGrant) {
        $JSCompiler_StaticMethods_processGrantState_$$($$jscomp$this$jscomp$1258$$, !0);
      } else {
        var $serviceIds$$ = $$jscomp$this$jscomp$1258$$.$G$.services.map(function($$jscomp$this$jscomp$1258$$) {
          return $$jscomp$this$jscomp$1258$$.serviceId || "local";
        });
        $JSCompiler_StaticMethods_initializePlatformStore_$$($$jscomp$this$jscomp$1258$$, $serviceIds$$);
        $$jscomp$this$jscomp$1258$$.$G$.services.forEach(function($serviceIds$$) {
          "local" == ($serviceIds$$.serviceId || "local") && $JSCompiler_StaticMethods_resolvePlatform$$($$jscomp$this$jscomp$1258$$.$D$, "local", new $LocalSubscriptionPlatform$$module$extensions$amp_subscriptions$0_1$local_subscription_platform$$($$jscomp$this$jscomp$1258$$.$ampdoc_$, $serviceIds$$, $$jscomp$this$jscomp$1258$$.$K$));
        });
        $JSCompiler_StaticMethods_getAvailablePlatforms$$($$jscomp$this$jscomp$1258$$.$D$).forEach(function($serviceIds$$) {
          $JSCompiler_StaticMethods_SubscriptionService$$module$extensions$amp_subscriptions$0_1$amp_subscriptions_prototype$fetchEntitlements_$$($$jscomp$this$jscomp$1258$$, $serviceIds$$);
        });
        $isStoryDocument$$module$src$utils$story$$($$jscomp$this$jscomp$1258$$.$ampdoc_$).then(function($serviceIds$$) {
          $JSCompiler_StaticMethods_startAuthorizationFlow_$$($$jscomp$this$jscomp$1258$$, !$serviceIds$$);
        });
      }
    }
  });
  return this;
};
$SubscriptionService$$module$extensions$amp_subscriptions$0_1$amp_subscriptions$$.prototype.$AccessService$$module$extensions$amp_access$0_1$amp_access_prototype$getAccessReaderId$ = function() {
  var $$jscomp$this$jscomp$1266$$ = this;
  return $JSCompiler_StaticMethods_SubscriptionService$$module$extensions$amp_subscriptions$0_1$amp_subscriptions_prototype$initialize_$$(this).then(function() {
    return $JSCompiler_StaticMethods_SubscriptionService$$module$extensions$amp_subscriptions$0_1$amp_subscriptions_prototype$getReaderId$$($$jscomp$this$jscomp$1266$$);
  });
};
$SubscriptionService$$module$extensions$amp_subscriptions$0_1$amp_subscriptions$$.prototype.$AccessService$$module$extensions$amp_access$0_1$amp_access_prototype$getAuthdataField$ = function($field$jscomp$21$$) {
  var $$jscomp$this$jscomp$1267$$ = this;
  return $JSCompiler_StaticMethods_SubscriptionService$$module$extensions$amp_subscriptions$0_1$amp_subscriptions_prototype$initialize_$$(this).then(function() {
    return $$jscomp$this$jscomp$1267$$.$D$.$R$.local.$promise$;
  }).then(function($$jscomp$this$jscomp$1267$$) {
    return _.$getValueForExpr$$module$src$json$$($$jscomp$this$jscomp$1267$$.json(), $field$jscomp$21$$);
  });
};
(function($AMP$jscomp$109$$) {
  $AMP$jscomp$109$$.registerServiceForDoc("subscriptions", function($AMP$jscomp$109$$) {
    return (new $SubscriptionService$$module$extensions$amp_subscriptions$0_1$amp_subscriptions$$($AMP$jscomp$109$$)).start();
  });
})(window.self.AMP);

})});
